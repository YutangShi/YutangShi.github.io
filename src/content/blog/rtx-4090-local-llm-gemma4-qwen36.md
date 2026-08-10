---
title: RTX 4090 本地部署：Gemma 4 與 Qwen 3.6 的效能測試
meta_title: RTX 4090 本地部署 Gemma 4、Qwen 3.6 效能調優指南
description: 以 RTX 4090 24GB VRAM 為基準，拆解 Gemma 4 與 Qwen 3.6 的量化選型、KV Cache、Flash Attention、Docker llama.cpp 部署與 OOM 排障方法。
image: /images/blog/rtx4090-llm-sandbox-banner.jpg
date: 2026-08-10T00:00:00.000Z
author: Allen Shi
categories:
  - AI 自動化
tags:
  - Local LLM
  - RTX 4090
  - Gemma 4
  - Qwen 3.6
  - MLOps
draft: false
---

在本地部署大型語言模型（LLM）時，把模型載入 GPU 只是第一步；要讓服務穩定運行，必須了解硬體限制與顯存（VRAM）的分配。以 RTX 4090 的 24GB VRAM 為例，模型權重、CUDA 工作區與長文本所需的 KV Cache，都會同時佔用顯存。

本文將逐步介紹地端模型的安裝，以及調整模型效能的方法。

---

## 🖥️ 1. 本地實驗室：硬體基準平台諸元

要建立具備高度可重現性的部署基線，我們必須先完整記錄本地工作站的核心規格與即時監測數據：

*   **工作站平台**：Dell Precision 3680
*   **中央處理器 (CPU)**：Intel Core i7-14700
*   **系統記憶體 (RAM)**：64GB DDR5
*   **圖形處理器 (GPU)**：NVIDIA GeForce RTX 4090（配備 24GB GDDR6X 顯存，以及晶片內約 16MB 的極速 SRAM）[3]
*   **系統軟體環境**：Ubuntu 24.04.1、CUDA 13.2、NVIDIA Driver 595.71.05

---

## ⚙️ 2. 量化技術：用少量精度換取可部署性

對於擁有數百億參數的現代大模型，直接載入原始精度的代價是極其高昂的。以 `google/gemma-4-26B-A4B` 模型為例，若以原始的 BF16（16-bit 浮點數）格式儲存，單是模型權重理論上就需消耗約 **57GB** 的 VRAM [4]，這已經遠遠超出了單張 4090 的承受極限。

### 什麼是量化技術 (Quantization)？
量化技術的核心在於降低數據儲存精度。透過將權重改為低精度的 4-bit（INT4） 格式儲存，能大幅減少模型檔案的大小與 VRAM 載入量。經過 Q4 量化後，26B 模型權重的 VRAM 佔用可顯著降至約 14 至 16GB。

### 解讀量化檔名：以 Q4_K_M 為例
在下載本地模型時，檔名中的標記決定了其壓縮品質與方法：
*   **Q4**：代表主要權重約使用 4-bit 儲存。數字越小檔案越小，但量化誤差也會隨之放大。
*   **K (K-quant)**：表示採用了分組縮放的 K-quant 演算法，比早期粗暴的單一 Q4 量化更能兼顧檔案大小與模型回答品質。
*   **M (Medium)**：是 K-quant 家族中的中間折衷版本，相比更小的變體保留了更好的品質，檔案體積也稍大。
*   *注意*：如 `K_XL` 或 `K_P` 等後綴並非所有 GGUF 工具共用的標準，通常代表特定模型發布者的獨家量化配方，下載前應詳細閱讀模型卡說明，並參考檔案體積與社群測試。

需要強調的是，**量化僅縮小了模型本體權重的顯存佔用，並不會減少 Session 運行時因對話長度增加而產生的 KV Cache 顯存開銷**。

---

## 📦 3. 部署格式抉擇：Safetensors vs. GGUF

在 Hugging Face 或各大開源社區下載模型時，主要會遇到兩種生態格式，它們決定了您的部署工具鏈與相容性：

| 特性 / 格式 | Safetensors | GGUF |
| :--- | :--- | :--- |
| **設計定位** | PyTorch 生態系的通用權重格式（支援 FP16/BF16 及 AWQ 等）| 專為本地推理引擎設計的單一檔案封裝格式 |
| **適合情境** | 使用 Python (Transformers/vLLM 框架)、顯存極其充足、或追求企業級 API 吞吐與高併發部署時 | 使用 Ollama、LM Studio、Llama.cpp，或顯存不足、需要跨 CPU/系統 RAM 混合運算時 |
| **核心優勢** | 安全性高，專為避免惡意代碼注入而生，大型推理集群載入極快 | 將模型權重、詞表、元數據打包為單一檔案；支援動態 VRAM 分流（Offloading）|

**決策金律**：如果您的 4090 顯存足以完整塞下模型與長 Context，且追求最高並行吞吐，首選 Safetensors；若顯存吃緊、需要動態調配，或希望快速開箱即用，首選 GGUF。

---

## 🧠 4. 模型運行架構：Dense 模型與 MoE 模型

模型如何決定每次生成 Token 時的運算量？這取決於其底層架構設計：

### Dense (緊密架構)
*   **行為**：每次推理（每個 Token 的生成）皆調用模型內部的全部參數。
*   **優勢**：推理和回答品質表現最為穩定。
*   **代價**：顯存與計算開銷都極高。

### MoE (Mixture-of-Experts, 混合專家架構)
*   **行為**：並不讓所有參數同時參與工作，而是透過一個「分流器（Router）」來動態指派任務。
    *   *Step 1*：Token 輸入 MoE 層時，Router 先為各個專家（Expert）計算適合度分數。
    *   *Step 2*：Router 挑選出得分最高的 Top-k 個專家。例如 Gemma 4 26B A4B 在生成時每次僅激活約 4B 的參數參與運算 [7, 9]。
    *   *Step 3*：被選中的專家各自處理 Token 並產出局部結果。
    *   *Step 4*：Router 根據適合度權重，將這些局部答案加權合併，傳遞至下一層。
*   **優勢**：計算量大幅降低，本地互動回覆（Token 生成速度）極快。
*   **代價**：儘管每次只運行少數專家，但**整個 MoE 模型的所有專家權重依然必須全部載入顯存中**。MoE 優化的是運行速度，而非啟動時的 VRAM 消耗。

---

## 📊 5. 挑近期兩個 MoE 架構的模型來實測

我們實際下載兩個主流的 Q4 GGUF MoE 模型進行空間分配對比：

### 🛠️ 模型 A：Gemma 4 26B A4B
*   **代表檔案**：gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf
*   **參數諸元**：總參數 26B，每次生成僅活化約 4B 參數。
*   **顯存拆解**：
    *   模型本體權重：約 **15 ~ 16 GB**
    *   CUDA 與系統驅動開銷：約 **1.5 ~ 2 GB**
    *   剩餘可用於 Context (KV Cache) 的空間：約 **6 ~ 7.5 GB**
*   **部署容量評估**：顯存餘額充足，在本地單卡上可安全支援 **16K 至 32K+** 的長文本或複雜多輪對話。適合日常對話、深度文件分析與多模態任務。

### 🛠️ 模型 B：Qwen 3.6 35B A3B (Uncensored)
*   **代表檔案**：Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
*   **參數諸元**：總參數 35B，每次生成僅活化約 3B 參數。
*   **顯存拆解**：
    *   模型本體權重：約 **20 ~ 21 GB**
    *   CUDA 與系統驅動開銷：約 **1.5 ~ 2 GB**
    *   剩餘可用於 Context (KV Cache) 的空間：僅剩約 **1 ~ 2.5 GB**
*   **部署容量評估**：由於模型權重吃掉了絕大部分空間，Context 餘裕極度吃緊。建議必須將對話長度嚴格限制在 **4K 至 8K** 內，否則只要輸入稍微變長，極易發生 OOM（Out of Memory）崩潰。適合高強度純文字創作與程式碼任務。

---

## 🐳 6. 本地部署 LLM 參數

以下是為 RTX 4090 調整的的 Llama.cpp 本地容器化部署指令，我們以 Gemma 4 26B A4B Q4 量化為部署對象：

```bash
docker run --rm --name llama-server --gpus all \
  -v /home/ubuntu/models:/models \
  -p 8080:8080 \
  ghcr.io/ggml-org/llama.cpp:server-cuda13 \
  -m /models/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf \
  --port 8080 --host 0.0.0.0 \
  --ctx-size 65536 \
  --n-gpu-layers 99 \
  --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.00 \
  --parallel 1 \
  --cache-type-k q8_0 --cache-type-v q8_0 \
  -fa on \
  --no-mmap \
  -b 2048 -ub 1024
```

經過調整設定，平均從 105 t/s 提升至 121 t/s 左右，對話長度在 16K 內時，整體生成速度與穩定性均有顯著改善，當然對話越長速度還是會逐步下降。

### ⚙️ 核心調優參數分組解析

1.  **模型與路徑載入**：
    *  -v /opt/models:/models：將宿主機的模型目錄掛載至容器內部。
    *  -m /models/...gguf：指定要加載的 Gemma 4 模型。
2.  **顯存與上下文深度優化 (VRAM & Context)**：
    *  --ctx-size 65536：設定 64K 的最大 Context 空間（注意：此為配置目標，需經 4090 實測確認）。
    *  --n-gpu-layers 99：強制將全部 99 層模型網路卸載至 GPU，以實現 100% 的 GPU 純硬體加速 。
    *  --cache-type-k q8_0 與 --cache-type-v q8_0：**關鍵顯存壓縮參數**。將注意力機制（Attention）中的 Key 與 Value 緩存以 8-bit（Q8）高精度進行量化壓縮，能在保持極高回答品質的同時，大幅斬半長文本下的 KV Cache 顯存開銷。
    *  -fa on（Flash Attention）：啟用 Flash Attention 計算優化，極大程度改善長 Context 推理時的暫存壓力。
3.  **吞吐量與並行策略 (Throughput & Batching)**：
    *  --parallel 1：限制單一平行推理序列，避免並行請求瞬間擠爆 4090 顯存。
    *  -b 2048：邏輯 Batch Size。定義了一次 Prompt 處理（Prefill 預填）可累積處理的最大 Token 上限。
    *  -ub 1024：物理 Micro-Batch Size。指每次實際交給 GPU Kernel 進行矩陣並行運算的 Token 數量。
    *  --no-mmap：關閉內存映射，強制將模型權重完整預載入物理顯存中，防止推理中途因為讀取硬碟造成 Token 生成卡頓。

---

## 🛠️ 7. 對話遇到 OOM 崩潰？黃金排障四步驟

當您在終端機看到 `Out of Memory (OOM)` 錯誤時，切忌盲目亂調，請依照以下「由低風險至高影響」的黃金順序依次排查：

```
[步驟 1：降 Context] ───► [步驟 2：降 Micro-Batch] ───► [步驟 3：KV Cache 量化] ───► [步驟 4：CPU/RAM 分流]
```

1.  **降低 --ctx-size **：
    *   **原理**：KV Cache 是隨著長度呈線性爆發的，降低最大 Context 能立刻釋放出最大筆的顯存餘額。
2.  **降低物理微批次 -ub`**：
    *   **原理**：-ub（物理微批次）的大小決定了單次 GPU Kernel 計算時 CUDA 工作區與暫存的峰值顯存佔用。發生 OOM 時，優先將 -ub 1024` 降為 512 或 256。若預填提示詞過長，再適度調降邏輯批次 -b。此調整僅會略微拉長 Prompt 的載入（Prefill）時間，但絕不會影響模型的生成品質與最大 Context 容量。
3.  **確認啟用 KV Cache 量化**：
    *   **原理**：檢查日誌，確認 --cache-type-k/v q8_0 已生效。這能在幾乎無感的情況下減少一半的對話緩存開銷。
4.  **減少 --n-gpu-layers 進行記憶體分流 (Offload)**：
    *   **原理**：這是容量優先的最後手段。例如將 GPU Layers 從 99 降到 80，此時前 80 層 Transformer 會留在 4090 VRAM 運作，而剩餘的 19 層則移至 64GB 的系統 RAM 中由 CPU 慢速計算。
    *   **代價**：每生成一個 Token，中間計算數據必須透過 PCIe 匯流排在 GPU VRAM 與系統 RAM 之間高頻傳輸，這會帶來嚴重的 PCIe 傳輸延遲，使 Token 生成速度（tokens/s）暴跌。

---

## ⚡ 8. 什麼是 Flash Attention 的功用?

在 Llama.cpp 部署參數中，-fa on（Flash Attention）是一項至關重要的技術。

許多人誤以為 Flash Attention 是將注意力機制的計算複雜度從 $O(N^2)$ 降低到 $O(N)$，或者能消除 KV Cache，這其實是常見的誤解。

### 倉庫 (VRAM) 與高速工作台 (SRAM)
要理解 Flash Attention，我們可以使用空間來作比喻：
*   **VRAM** 像是一個距離核心較遠、容量巨大但搬運速度慢的大型倉庫（負責存放完整的 Q、K、V 及模型參數）。
*   **SRAM** 則是 GPU 核心旁邊、容量僅約 16MB 但讀寫極速的高速 shared memory 工作台。

### 運作三大步驟：
1.  **分塊載入 (Tiling)**：不一次讀取整張巨大的 Attention 矩陣，而是從 VRAM 倉庫中載入一小塊一小塊的 Q、K、V 數據到 SRAM 工作台上。
2.  **原地計算**：在 SRAM 工作台內部完成該小區塊的 Attention 分數與 Softmax 運算。
3.  **即時累積**：將計算好的局部結果直接累積到最終輸出中，**絕不將完整的中間 $N \times N$ 注意力矩陣寫回 VRAM 倉庫**。

**結論**：Flash Attention 降低的是**顯存與 GPU 核心之間高頻率的數據讀寫往返（I/O 瓶頸）與中間暫存壓力**，從而顯著提升長文本時的生成吞吐量。然而，隨著對話增長，KV Cache 本體依舊會變大，它並不會憑空消失。

---

## 參考資料

*   [Gemma 4 model overview](https://ai.google.dev/gemma/docs/core)
*   [llama.cpp Docker documentation](https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md)
