---
title: RTX 4090 本地部署：量化 Gemma 4 與 Qwen 3.6 的效能測試
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
  - llama.cpp
  - MLOps
draft: false
---

24GB VRAM 足以讓 RTX 4090 跑起量化後的 Gemma 4 或 Qwen 3.6，但「模型載得進去」不等於能穩定服務 [127]。真正吃顯存的是權重、KV Cache、批次大小和同時請求數；其中 KV Cache 最容易在長文本時把原本看似寬裕的空間吃完 [127]。

以下以 Dell Precision 3680 + RTX 4090 單卡為例 [1, 119]，整理一套先量測、再調參的流程。文中的速度與顯存數字只適用於這組模型檔、llama.cpp 版本和測試提示詞；把它當成起點，不要當成其他機器的保證值。

> **本文重點：** 先把 24GB 的空間留出餘裕，再用 GGUF 建立可回滾的基線 [127]。遇到 OOM 時，優先縮 context 和 micro-batch，不要一開始就把模型大量卸載到 CPU [134]。

---

## 一、 先用 24GB 做記憶體預算

RTX 4090 的 24GB GDDR6X 是一條明確的邊界 [1, 119]。模型權重只是其中一塊；長 context 的 KV Cache、CUDA runtime 和暫存區也都要預留空間 [127]。讓 `nvidia-smi` 顯示 0MB 剩餘並不是成功條件，反而很容易在下一個較長的請求時面臨 OOM 失敗 [127]。

開始部署前，先把這台工作站的硬體與閒置狀態確認清楚：

### 本機硬體規格

*   **系統主機**：Dell Precision 3680 工作站 [1, 119]。
*   **中央處理器 (CPU)**：Intel Core i7-14700，擁有 **20 個實體核心與 28 個執行緒**，最大核心時脈可達 5.4 GHz，配置 28MB L2 快取與 33MB L3 快取 [4, 5]。支援 AVX2、AVX-VNNI 與 FMA 等先進指令集 [4]。
*   **系統記憶體 (RAM)**：配置 2 條 32 GB DDR5 DIMM（共 64 GB），運作於 4000 MT/s [5]。OS 目前顯示已用 8.1 GiB，剩餘可用 54 GiB [5]。
*   **圖形處理器 (GPU)**：NVIDIA GeForce RTX 4090 (Ada Lovelace 架構，AD102 核心) [1, 119]，具備 **16,384 個 CUDA 核心** 與 **512 個第 4 代 Tensor 核心** [4]。
*   **顯存 (VRAM)**：**24 GB GDDR6X** (驅動回報實際 FB Memory Total 為 24,564 MiB，系統保留 515 MiB) [2]。
*   **記憶體匯流排**：384-bit，頻寬約 **1,008 GB/s** [4]。
*   **作業系統與環境**：Ubuntu 24.04.1 LTS (Kernel 6.8.0-48-generic)，安裝 NVIDIA Driver 595.71.05 與 **CUDA Runtime 13.2** [1, 5, 6]。

### 採集當下的本機閒置讀值 (Idle Baseline)
在未加載任何模型時，透過本機 `nvidia-smi` 採集到的實測數據如下：
*   **GPU 使用率**：0% [3]
*   **顯存佔用率**：僅 1.6%（已用 389 MiB / 24,564 MiB，主要為 Xorg 與 GNOME 桌面環境佔用）[2, 3]。
*   **核心溫度**：53°C [1, 3]
*   **平均功耗**：11.95 W（瞬時功耗 11.92 W，風扇轉速 36%）[1, 3]。

| 硬體項目 | 本次環境規格 [1, 5] | 對部署的意義 [127, 128] |
| :--- | :--- | :--- |
| **GPU 運算核心** | 16,384 CUDA / 512 Tensor (Gen 4) [4] | 本機單卡推理與矩陣並行運算的主體 [4] |
| **物理顯存上限** | 24,564 MiB GDDR6X (384-bit) [2, 4] | 權重載入、CUDA 執行暫存與 KV Cache 共用的硬底線 [127] |
| **系統主機配套** | i7-14700 (20C/28T) / 64GB DDR5 [1, 5] | 作為 GPU 顯存溢出時，動態分流 (Offloading) 的系統物理記憶體備援 [133, 134] |
| **軟體環境** | Ubuntu 24.04.1 / CUDA 13.2 [1, 6] | 作為 `llama.cpp` 容器與驅動相容性的確認基礎 [129] |

實務上，我會先拿短 prompt 驗證模型能正常回應，再逐步拉長 context。這樣能分辨問題是模型載入、KV Cache，還是 batch 峰值，而不是只看到一個 OOM 錯誤。

---

## 二、 先選部署格式，再選模型

對單張 4090，GGUF + llama.cpp 通常是比較容易起步的組合：模型檔案單一、量化選項清楚，也能在必要時將部分層分流到系統記憶體 [122]。若目標是高併發服務和更高吞吐，再評估 Safetensors 搭配 vLLM 或其他服務框架 [122]。

| 部署格式 | 適合情境 [122] | 架構特點與限制 [122] |
| :--- | :--- | :--- |
| **Safetensors** | 1. 多卡或顯存較充足<br>2. 需要較高併發的 API 服務<br>3. 使用 PyTorch、vLLM 或 Transformers | 權重載入速度快，但顯存不足時通常會直接 OOM，不能像 GGUF 一樣彈性分流到系統 RAM。 |
| **GGUF** | 1. 單機部署、PoC 或顯存有限<br>2. 使用 Ollama、LM Studio、llama.cpp<br>3. 需要調整 context 或分流 | 單檔格式，適合本機部署。必要時可將部分層放到系統記憶體，但速度會受影響。 |

### 量化命名指南：如何解讀 `Q4_K_M`？
在 Hugging Face 或 Ollama 下載模型時，常會看到 `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` 這類檔名 [125, 129]。量化名稱可以先這樣讀 [121]：
*   **Q4 (儲存精度)**：代表模型的主要權重以約 4-bit 精度進行儲存 [121]。位元數越低，模型體積與顯存需求越小，但可能帶來較大精度損失 [121]。
*   **K (分組量化方法)**：代表採用 K-quant [121]。它會把權重分組並保存各組的縮放資訊；相較於較早期的量化方式，通常能在檔案大小和品質之間取得較好的平衡 [121]。
*   **M / XL / P (品質折衷後綴)**：
    *   `M` (Medium) 是 K-quant 家族中常見的平衡配方 [121]，適合當作本機部署的第一個測試版本。
    *   `XL`、`P` 等後綴（如 `Q4_K_XL` 或 `Q4_K_P`）通常並非 GGUF 官方工具鏈共用的標準規範，而是特定發布者（如社群知名打包者）自定義的特殊優化配方 [121, 126]。**不要僅憑字母外觀盲目判定品質高低**，下載前務必詳閱模型卡 (Model Card) 說明，以實際檔案大小及社群實測數據為準 [121, 126]。

---

## 三、 Gemma 4 與 Qwen 3.6 的技術底層：多模態、Dense 與 MoE

2026 年的開源 LLM 中，Google DeepMind 於 4 月 2 日發布 **Gemma 4** [40, 41]，阿里巴巴於 4 月 22 日推出 **Qwen 3.6 27B** [103, 104]。兩者都是本機部署時常被比較的模型。

### 1. Google Gemma 4：架構躍升與開源變革
Gemma 4 採用 **Apache 2.0 授權** [29, 39]。相較於 Gemma 3 的自訂條款 [43]，企業在商業整合、修改與重新發佈時，仍應依自身產品情境與法務流程確認授權要求 [39, 43, 67]。

Gemma 4 沿用 Gemini 3 的部分研究成果 [43]。以下幾項設計會影響本機部署時的取捨：
*   **Dual RoPE 位置編碼**：傳統的旋轉位置編碼（RoPE）在長文本下的注意力效果容易下降 [47]。Gemma 4 結合局部滑動窗口注意力（512/1024 tokens）與全局注意力；文件中的 31B 多針檢索成績由前代 13.5% 提升到 **66.4%** [47]。
*   **Shared KV Cache**：多個注意力層共用 KV Cache，可降低長文本推理的顯存用量 [47]，讓 26B MoE 在 RTX 4090 上測試較長 context 時更有空間 [47, 51]。
*   **原生多模態 (OCR/視訊/音訊)**：
    *   **視覺與影片**：26B MoE 與 31B Dense 支援圖片與最長 **60 秒影片**（以 1 fps 處理影格）[8, 44, 59, 60]。繁體中文 OCR、手寫辨識、表格解析與 JSON bounding box 輸出可列入實測項目 [59, 61]。
    *   **音訊 (E2B/E4B 專屬)**：4B 以下的邊緣端內建 **Conformer 音訊編碼器**（參數縮小 55% 至 305M）[31, 60]，文件列出的幀延遲由 160ms 降至 40ms [31, 60]。若需求是最長 30 秒的語音輸入、翻譯與多輪推理，可先評估這個內建能力是否足夠，再決定是否另接 Whisper [32, 60]。

### 2. Dense (緊密) 與 MoE (混合專家) 架構的本質區別
選型時，Dense 與 MoE 對運算資源的使用方式不同 [124]：
*   **Dense 架構 (如 31B Dense / Qwen 3.6 27B)**：
    *   *運作邏輯*：每次推理、生成每一個 token，模型都會百分之百活化、動用全部的參數進行運算 [8, 46, 105]。
    *   *優劣分析*：邏輯推理穩定，但在 VRAM 與計算量 (Compute cost) 上代價昂貴 [123]。
*   **MoE 架構 (如 Gemma 4 26B A4B / Qwen 3.6 35B-A3B)**：
    *   *運作邏輯*：將模型拆分為多個專家（如 Gemma 4 26B 擁有 128 個專家網路）[29, 46]。當 Token 輸入時，內建的 Router (路由器) 會對各專家計算適合度分數，選出 Top-K（通常 2-3 個）最適合的專家進行局部運算並加權合併輸出 [123, 124]。例如 26B MoE 在運算時**每次僅激活 3.8B 參數**（約 15% 的計算量） [29, 46]。
    *   *優劣分析*：運算開銷可降低達 85% [46]；文件列出 Mac Mini M4 分類速度可達 Qwen 3.5 的 4.4 倍，RTX 4090 可達 **150 tok/s** [32, 33]。不過，**完整模型權重仍要載入顯存**（26B 約需 16GB）[29, 124]；少數自訂 agent 任務的指令遵循度可能不如 Dense [32]。

---

## 四、 24GB 顯存邊界對決：Gemma 4 27B vs. Qwen 3.6 27B

對單張 RTX 4090（24GB VRAM）而言，27B 級模型是常見的比較區間。以下整理本文採用的測試數據與 benchmark。

### 1. 核心基準戰力指標對決 (Benchmark)

| 測試指標 (Benchmark) | Qwen 3.6 27B (Dense) [105] | Gemma 4 27B (Dense) [105] | 技術含意與實務差距 |
| :--- | :---: | :---: | :--- |
| **SWE-bench Verified** | **77.2%** [103, 106] | 43.2% [106] | Qwen 在這組程式代理測試的分數較高；實際整合 API 與多檔修改前，仍應以自己的任務回放驗證 [15, 106]。 |
| **Terminal-Bench 2.0** | **59.3%** [103, 106] | 31.4% [106] | 衡量模型在實際終端命令列下完成系統運作與維運任務的能力。 |
| **AIME 2026 (數學推理)** | **94.1%** [103, 107] | 52.1% [107] | 這組數據可作為數學推理能力的參考，不能直接推論到所有工作負載。 |
| **GPQA Diamond (科學專家)** | **87.8%** [107] | 68.4% | MLOps、生物化學等高階學術知識問答與邏輯鏈條深度。 |
| **MMLU-Pro (知識與理解)** | **86.2%** [107] | 75.8% | 綜合學科知識廣度與常識理解。 |
| **MMMU (多模態推理)** | **82.9%** [107] | 74.2% | 圖表分析、PDF 圖文檢索等多模態解析能力。 |
| **原生 Context Window** | **262K (YaRN 可擴至 1M)** [105, 113] | 256K [105, 113] | Qwen 適合優先測長文件或大型 codebase；實際可用長度仍受 KV Cache 與併發限制 [108, 113]。 |

### 2. RTX 4090 本機推理效能對比 (Tokens/second)

在 RTX 4090 24GB 工作站上，以不同的量化配置加載，速度表現如下：

| 模型與量化格式 | VRAM 實體佔用 [105] | RTX 4090 推理速度 [107] | 部署建議與限制 [128] |
| :--- | :---: | :---: | :--- |
| **Gemma 4 26B MoE** (Q4_K_M) | **~16 GB** [29] | **~150 tok/s** [32, 33] | 顯存仍有餘裕，適合先拿來測日常 Coding 輔助與對話。 |
| **Gemma 4 27B** (Q6_K) | **~22 GB** [105] | **~55 tok/s** [107] | 表現中規中矩，歐洲語言對齊優良，但長文本容易受限。 |
| **Qwen 3.6 27B** (Q6_K) | **22.5 GB** [105] | **~60 tok/s** [107] | 顯存接近上限；上線前要以目標 context 與併發重新測試。 |

### 3. KV Cache：31B Dense 的長文本限制
這是部署時常被忽略的地方。
Gemma 4 31B Dense 在 Q4 量化下，模型本體權重僅需約 **17.4 GB VRAM** [23]，表面上看放入 24GB 的 RTX 4090 綽綽有餘 [23]。然而，**Gemma 4 的 Hybrid Attention 架構雖然帶來了極高的表現品質，但代價是其 KV Cache 的顯存佔用遠超同級模型** [35]。

*   **測試結果**：在 RTX 4090（24GB）或 RTX 5090（32GB）載入 Gemma 4 31B Dense（Q4）後，context 超過 **10K tokens** 可能導致 OOM [35]。
*   **對照**：同樣的單卡環境下，Qwen 3.5/3.6 27B 在該測試可處理 **190K 以上** context [35]。
*   **建議**：若工作負載常超過 10K tokens，先測 26B MoE（Shared KV Cache）[47] 或 Qwen 3.6 27B [104]；不要只看模型權重大小做判斷。

---

## 五、 本地實戰：Docker + llama.cpp 調整範例

要在 RTX 4090 24GB VRAM 上測 64K context，可先用 `llama.cpp` 的 KV Cache 與 batch 參數控制顯存。以下是本文的測試命令：

```bash
docker run --rm --name llama-server --gpus all \
  -e NVIDIA_DISABLE_REQUIRE=true \
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

### 參數怎麼看

#### 1. `--ctx-size 65536`
*   **用途**：在本機開闢高達 **64K tokens** 的上下文視窗空間 [129, 130]。
*   **注意**：64K 只是我們宣告的上限，實際在 24GB VRAM 的 RTX 4090 上，必須搭配 KV Cache 壓縮技術才能完整跑完，否則會發生 OOM [131, 132]。

#### 2. `--n-gpu-layers 99`
*   **用途**：盡量將模型層放到 GPU [129, 130]，減少 CPU/GPU 來回傳輸造成的速度損失 [131]。

#### 3. `--cache-type-k q8_0` 與 `--cache-type-v q8_0`
*   **用途**：將注意力機制中的 Key (K) 緩存與 Value (V) 緩存，從預設的 16-bit 浮點數壓縮為 **8-bit 量化儲存** [130]。
*   **技術效果**：相較於 f16，8-bit KV Cache 可顯著降低長文本的顯存用量。品質是否可接受，要用實際任務測試；64K context 也不能保證每個模型都能穩定運行。

#### 4. `-fa on` (Flash Attention 啟用)
*   **用途**：顯式啟用 Flash Attention 機制 [130]。
*   **技術效果**：將 Attention 的部分計算留在 GPU 內部的 **SRAM 暫存區**分塊完成，減少 VRAM 的讀寫壓力 [135, 136]。

#### 5. `--no-mmap`
*   **用途**：關閉虛擬內存映射，強制將整個 GGUF 模型檔案一次性完整預先讀入物理顯存與系統記憶體中 [130, 131]。
*   **技術效果**：可減少部分因硬碟 I/O 缺頁造成的中斷；是否適合仍要依主機記憶體與 llama.cpp 版本實測 [131]。

#### 6. `-b 2048` 與 `-ub 1024`
*   **用途**：優化批處理大小（Logical Batch Size = 2048）與微批處理大小（Physical Micro-Batch Size = 1024）[130, 131]。
*   **技術效果**：影響長 prompt 在 prefill 階段的顯存峰值與吞吐 [4, 131]。先調 `-ub`，再視情況調整 `-b`。

---

## 六、 故障排除：遇到 OOM 時的調整順序

遇到超長文本或高併發請求時，RTX 4090 仍可能 OOM。建議按下面順序調整，每次只改一個參數，才看得出差異 [132]：

### 步驟 1：優先調低 `--ctx-size` (代價最小，釋放最多顯存)
長對話下，KV Cache 通常是主要的 VRAM 用量 [127, 132]。將 `--ctx-size` 由 65536 逐步下調至 32768 或 16384 [132]，先確認短文本任務是否仍符合需求。

### 步驟 2：區分並調降實體微批次 `-ub`，再降 `-b`
許多工程師分不清 `-b` 與 `-ub` 的本質區別，導致 OOM 時無從下手 [134]：
*   **`-b 2048` (邏輯 Batch Size)**：代表一次 Prefill 處理可累積累積的 Token 總數上限 [132]。
*   **`-ub 1024` (物理 Micro-Batch Size)**：代表每次真正交給 GPU Kernel 進行並行矩陣計算的物理 Token 數量 [133]。
*   **調校邏輯**：`-ub` 的大小直接決定了 CUDA 在進行張量乘法時，開闢的動態暫存區與顯存峰值（VRAM Spike）[133]。
*   **排障策略**：先將 `-ub 1024` 調低至 512，必要時到 256 [133]。這會降低 prefill 的瞬時顯存峰值；若仍不夠，再調低 `-b 2048` [133]。batch 變小通常會降低 prefill 吞吐，實際影響仍要量測 [134]。

### 步驟 3：強制壓縮 KV Cache 精度
確認日誌輸出中，是否確實啟用了 `--cache-type-k q8_0` 與 `--cache-type-v q8_0` [130, 132]。如果顯存依然極其吃緊，可以評估將 KV Cache 進一步降到更低位元精度，但必須重新用目標任務做回歸測試，確認其是否影響理解品質。

### 步驟 4：最後手段——調低 `--n-gpu-layers`，啟用 CPU/RAM 分流 Offloading
當 VRAM 無論如何都無法完全塞下模型與 context 時，我們才採取這項最後手段 [134]。
*   **技術機制**：將 `--n-gpu-layers` 從 99 往下調整（例如設為 40） [130, 131]。此時，前 40 階層的 Transformer Layer 會留在 RTX 4090 的 VRAM 上，其餘的 Layer 則會保存在系統 64GB DDR5 記憶體中，改由 Intel i7 CPU 計算 [5, 133]。
*   **數據瓶頸**：在生成 Token 的過程中，中間計算張量必須沿著模型層數依序往下傳遞 [133]。當流程在 GPU 與 CPU 邊界切換時，中間結果必須透過 **PCIe 匯流排**在 GPU 顯存與系統 RAM 之間來回頻繁傳輸 [133]。
*   **代價**：這會用到本機 64GB RAM，讓模型有機會載入 [134]；但 PCIe 頻寬與 CPU 矩陣運算通常較慢，tokens/s 往往明顯下降 [134]。因此建議最後才逐步降低 GPU layers。

---

## 七、 技術原理：Flash Attention 的 VRAM 到 SRAM 數據流

`-fa on`（Flash Attention）為什麼對長文本部署有幫助？可以從 GPU 的資料讀寫方式來看 [130]。

### VRAM 與 SRAM 的分工
在 GPU 運算中，硬體儲存被分為兩個核心層級 [135]：
*   **VRAM (顯示記憶體)**：容量較大（24 GB），但讀寫成本高於晶片內的記憶體 [135]。
*   **SRAM (GPU 內部 On-chip Shared Memory)**：容量較小（本機 4090 約 16MB），但讀寫更快 [119, 135]。

### 傳統 Attention 計算的瓶頸
傳統 Attention 計算時，會產生 $N \times N$ 的注意力矩陣，再計算 Softmax 並與 Value 矩陣相乘 [135, 136]。
*   **問題**：64K context 的中間矩陣尺寸為 $65536 \times 65536$，資料量很大。
*   **後果**：大量資料在 VRAM 與 GPU 暫存間讀寫，容易受記憶體頻寬限制 [136]。

### Flash Attention 的運作流程機制
Flash Attention 透過創新的演算法改變了計算順序（Tiling）[135]：

```
+------------------------------------------+
|            VRAM                          |
|  儲存完整的 Q, K, V (長文本資料)         |
+--------------------+---------------------+
                     | 1. 分塊載入 (Tile)
                     v
+------------------------------------------+
|            SRAM                          |
|  - 計算分塊 Attention & Softmax          |
|  - 立即將結果累加至輸出                  |
|  - 避免寫回完整 N*N 中間矩陣             |
+--------------------+---------------------+
                     | 2. 輸出累積結果
                     v
+------------------------------------------+
|         VRAM 累積輸出暫存區              |
+------------------------------------------+
```

1.  **分塊載入 (Tiling)**：將 $Q, K, V$ 切成小區塊，分批放入 SRAM [136]。
2.  **區塊計算**：在 SRAM 計算 Attention 分數與局部 Softmax [136]。
3.  **累積輸出**：將結果更新到輸出暫存，避免把完整 $N \times N$ 中間矩陣寫回 VRAM [136]。
4.  **循環處理**：重複此分塊載入與累積過程，直到整段 Context 處理完畢 [136]。

### Flash Attention 能做與不能做的事
*   **誤解 1**：它把注意力機制的運算複雜度從 $O(N^2)$ 降低到了 $O(N)$。
    *   *說明*：它不會改變 $O(N^2)$ 的數學複雜度；改善的是記憶體讀寫次數與頻寬壓力 [135, 136]。
*   **誤解 2**：啟用 Flash Attention 後，KV Cache 就不占顯存。
    *   *說明*：KV Cache 仍會隨對話與 context 長度線性增加 [136]。Flash Attention 主要減少 Attention 計算過程的暫存張量。
*   **實務建議**：長文本可同時測試 Flash Attention 與 q8_0 KV Cache；前者減少計算中途的暫存，後者壓縮保存的 KV Cache [136]。

---

## 八、 RTX 4090 的選型參考

單張 RTX 4090（24GB VRAM）沒有一個模型能適合所有工作負載 [10, 11]。以下依使用情境整理第一個可測的選擇：

### 1. 任務場景決策樹

```
                       【 您的核心任務是什麼？ 】
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  【 程式碼編寫 / Agent 】     【 長文本 / RAG 】    【 客服 / 盲測體驗 】
         │                         │                         │
         ▼                         ▼                         ▼
   先測：Qwen 3.6 27B        先測：Gemma 4 26B MoE     先測：Gemma 4 31B Dense
       (Q6_K)                    (Q4_K_M)                 (Q4_K_M / Q5_K_M)
         │                         │                         │
 77.2% SWE-bench [103]        Shared KV Cache [47]        人類盲測 Elo 1452 [10]
 22.5GB VRAM [105]            需先測 64K context [129]   需用目標語言驗證 [19]
```

### 2. 選型建議

*   🛠️ **場景一：AI Pair Programmer / 程式碼重構 / 多步 AI Agent**
    *   **推薦型號**：**Qwen 3.6 27B (Q6_K 量化)** [15, 105]。
    *   **理由**：本文引用的 SWE-bench Verified（77.2%）與 Terminal-Bench（59.3%）分數較高 [103, 106]。是否適合程式碼理解與工具呼叫，仍應用你的 repository 和工具流程驗證 [15, 104]。
*   📚 **場景二：超長文件檢索 / 企業私有 RAG / 多檔案程式庫索引 (長度 > 10K)**
    *   **推薦型號**：**Gemma 4 26B MoE (Q4_K_M 或 Q4_K_XL 量化)** [29, 125]。
    *   **理由**：Shared KV Cache 與 Flash Attention 有助於降低長文本的顯存壓力 [47, 136]。64K context 與 31B Dense 的限制都要在自己的模型檔、提示詞和併發設定下測試 [129, 35]。
*   🌍 **場景三：多語言客服 / 安全合規對齊 / 盲測回答質感 (重視人類偏好)**
    *   **推薦型號**：**Gemma 4 31B Dense (Q4_K_M 量化)** [8, 44] 或 **Gemma 4 26B MoE** [29, 44]。
    *   **理由**：Gemma 4 在 Arena AI Elo 人類盲測取得第 3／第 6 名（1452／1441 Elo）[10, 11, 29]。多語言、OCR 與安全對齊是否符合需求，仍要用實際客服語料和流程測試 [10, 59, 109]。
*   ⚡ **場景四：本機對話回應速度 (Vibe Coding)**
    *   **推薦型號**：**Gemma 4 26B MoE (GGUF Q4 量化)** [29, 33]。
    *   **理由**：每次生成僅活化 3.8B 參數 [29, 46]。文件列出的 RTX 4090 成績約 **150 tokens/second** [32, 33]；實際等待時間仍會受 prompt 長度與系統負載影響。

---

## 參考資料

- Google DeepMind, [Gemma 4 Model Card & Technical Overview](https://ai.google.dev/gemma/docs/core) [8, 40, 72]
- Google Developers Blog, [Bring State-of-the-Art Agentic Skills to the Edge with Gemma 4](https://developers.googleblog.com/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/) [30, 37]
- Will It Run AI Blog, [Qwen 3.6 27B vs Gemma 4 27B — Dense Head-to-Head (April 2026)](https://willitrunai.com/blog/compare) [103]
- Regolo AI Benchmarks, [Gemma 4 31B vs Qwen3.6 35B-A3B: When to use which](https://regolo.ai/gemma-4-31b-vs-qwen3-6-35b-a3b-when-to-use-which/) [7]
- llama.cpp, [Llama.cpp Docker & Server Deployment Documentation](https://github.com/ggml-org/llama.cpp) [129]
