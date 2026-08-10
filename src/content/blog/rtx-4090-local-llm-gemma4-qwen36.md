---
title: RTX 4090 本地部署實戰：Gemma 4 與 Qwen 3.6 的效能巔峰調優指南
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

# RTX 4090 本地部署實戰：Gemma 4 與 Qwen 3.6 的效能巔峰調優指南

**先講結論：**RTX 4090 的 24GB VRAM 足以把 Gemma 4 與 Qwen 3.6 的量化版本做成可靠的本地推理服務；真正的限制通常不是「模型能否載入」，而是權重、KV Cache、批次大小與並發請求如何共同瓜分顯存。對 Agent、程式開發與超長 RAG，優先驗證 Qwen 3.6 的長上下文配置；對多語言互動與多模態工作流，Gemma 4 26B MoE 是更值得先測的選項。

本文以 Dell Precision 3680 + NVIDIA GeForce RTX 4090 的單卡環境為例，提供可重現的部署與排障流程。文中 tokens/s 與評測分數是此基準配置下的測試記錄，會隨模型量化檔、llama.cpp 版本、提示詞長度、溫度、GPU 時脈與並發數而改變；它們應作為容量規劃起點，而非跨環境的保證值。

## 2026 本地 LLM 的硬體基準

本地部署已不只是技術展示。當資料不能離開網路邊界、Agent 需要低延遲工具呼叫，或團隊想掌握成本與版本時，單機推理就是一項平台能力。Gemma 4 支援文字、影像與音訊輸入，且模型系列提供最長 256K context 的變體；RTX 4090 則提供 24GB GDDR6X 與約 1,008 GB/s 的顯存頻寬，形成很實際的 24GB「數位沙盤」。

| 硬體組件 | 技術規格                                | 本次基準讀值                        |
| -------- | --------------------------------------- | ----------------------------------- |
| GPU      | NVIDIA GeForce RTX 4090（Ada Lovelace） | 16,384 CUDA Cores、512 Tensor Cores |
| 顯存系統 | 24GB GDDR6X、384-bit                    | 約 1,008 GB/s                       |
| 片上快取 | 約 16MB SRAM                            | Attention 分塊計算的高速工作區      |
| 閒置狀態 | 核心溫度 53°C                           | 11.95W、VRAM 使用率 1.6%            |
| 平台環境 | Ubuntu 24.04.1、CUDA 13.2               | NVIDIA Driver 595.71.05             |

架構師觀點：24GB 是明確的空間上限，但長文本的可用性更受顯存頻寬、KV Cache 精度與 SRAM 資料搬運效率影響。容量規劃時請先保留作業系統、CUDA runtime 與預留碎片空間，不要以 `nvidia-smi` 剛好剩 0MB 作為成功標準。

## Safetensors 與 GGUF：先依服務型態選格式

量化把「理論可跑」變成「可穩定維運」。格式不是品質高低之分，而是服務模型與記憶體策略的選擇。

| 比較維度   | Safetensors（PyTorch / vLLM）       | GGUF（llama.cpp / Ollama）   |
| ---------- | ----------------------------------- | ---------------------------- |
| 部署定位   | 服務化、批次與吞吐優先              | 單機、邊緣與顯存受限優先     |
| 記憶體管理 | 通常採較明確的 GPU 配置；超限即 OOM | 可把部分層分流至系統 RAM     |
| 常見量化   | 4-bit / 8-bit（AWQ、GPTQ）          | Q2 到 Q8、K-Quant 分組量化   |
| 優勢       | 框架整合與高吞吐                    | 單檔可攜、調參直接、彈性分流 |

以 `Q4_K_M` 為例：`Q4` 是 4-bit 權重；`K` 代表分組縮放的 K-Quant；`M` 表示該家族中偏平衡的配方。`K_XL`、`K_P` 等延伸名稱可能是發布者自訂規格，下載前應核對檔案大小、模型卡與可用 VRAM，不能只看名稱判斷品質。

## Gemma 4：多模態與 MoE 的智慧密度

Gemma 4 讓旗艦級多模態模型可在開放權重工作流中使用；官方模型文件指出系列涵蓋文字、視覺與音訊任務。以本文的測試模型 Gemma 4 26B A4B 為例，MoE 路由在一次 forward pass 中僅會啟用部分參數：權重總量決定載入空間，活躍專家數則更直接影響每 token 的計算量。

這個差異很重要：MoE 並不會免費降低權重佔用，卻可降低生成階段的運算成本。因此在 24GB 卡上，必須把「模型是否放得下」與「每秒能產生多少 token」分成兩個問題處理。

## 24GB 顯存下的 Gemma 4 與 Qwen 3.6 對照

以下為固定量化等級、單使用者、q8_0 KV Cache 與全層 GPU offload 的實測快照；評測集版本與 prompt 設定必須隨同報告保存，才可在升級後比對。

| 性能指標          | Gemma 4 31B Dense | Qwen 3.6 27B Hybrid               |
| ----------------- | ----------------- | --------------------------------- |
| 架構類型          | Dense Transformer | Gated DeltaNet + Attention Hybrid |
| AIME 2026         | 89.2%             | 94.1%                             |
| SWE-bench         | 43.2%             | 77.2%                             |
| 最大 context 宣告 | 256K physical cap | 1M YaRN 擴展支援                  |
| Q4_K_M 生成速度   | 約 55 tokens/s    | 約 60 tokens/s                    |

上述數值不應被解讀為所有 prompt 的勝負。程式任務尤其受 agent scaffold、工具描述長度與採樣參數影響。Gemma 4 的較長 context 版本也要特別留意 KV Cache；當輸入超過約 10K tokens，剩餘顯存可能快速被快取吞沒。Qwen 3.6 的混合架構與 YaRN 上下文策略，較適合作為超長 Agent 工作流的候選，但仍須以實際文件長度壓測確認。

## Docker + llama.cpp：RTX 4090 的可重現啟動指令

先確認主機的 NVIDIA Container Toolkit 可見 GPU，再啟動模型。請將映像 tag 固定到已驗證的 build；浮動 tag 會隨 upstream 改變。llama.cpp 官方 Docker 文件提供 CUDA 13 server 映像，server 文件也列出 KV Cache 精度與 GPU layer 參數。

```bash
docker run --rm --name mlops-node --gpus all \\
  -v /home/ubuntu/models:/models \\
  -p 8080:8080 \\
  ghcr.io/ggml-org/llama.cpp:server-cuda13 \\
  -m /models/gemma-4-26B-A4B-it-Q4_K_XL.gguf \\
  --ctx-size 65536 \\
  --n-gpu-layers 99 \\
  --cache-type-k q8_0 --cache-type-v q8_0 \\
  --flash-attn on \\
  --no-mmap \\
  -b 2048 -ub 1024
```

啟動後至少執行一次短 prompt 與一次接近目標長度的 prompt，並記錄 `nvidia-smi`、prefill tokens/s、generation tokens/s、TTFT 與失敗率。不要只看到 HTTP 200 就把服務視為達標。

### 參數的真正意義

- `--flash-attn on`：將 attention 改為分塊計算，降低高 context / 高 batch 時的記憶體搬運壓力；它**不會**縮小 KV Cache 本身。
- `--cache-type-k q8_0 --cache-type-v q8_0`：將預設的 f16 KV Cache 改為 8-bit，是延長 context 的主要槓桿之一。必須針對目標任務驗證品質。
- `-b 2048`：邏輯批次上限，主要影響 prompt prefill 的併發與吞吐。
- `-ub 1024`：實體 micro-batch，直接影響單一 GPU kernel 的顯存峰值。
- `--n-gpu-layers 99`：盡可能將層放到 GPU；若模型載入失敗，再逐步降低此值。
- `--no-mmap`：可避免依賴 memory mapping，但新版 llama.cpp 已將 `--mmap` / `--no-mmap` 標為由 `--load-mode` 取代的舊選項。將它留在已驗證的映像設定中即可；升級前先以 `--help` 確認等效參數，避免把歷史指令直接帶進生產環境。

## OOM 的四步診斷與回滾

OOM 不是單一錯誤，而是負載組合超過顯存邊界。依序縮小最可控的變數，且每一步只改一個設定：

1. **縮減 context**：先調低 `--ctx-size`，這通常是最大、最直接的釋放來源。
2. **調低 micro-batch**：把 `-ub 1024` 依序降到 `512`、`256`。這會降低 forward pass 峰值顯存，代價是 prefill 速度可能下降。
3. **確認 KV Cache 精度**：檢查日誌是否確實載入 `q8_0`。若仍無法容納，可在品質回歸測試後評估更低精度。
4. **降低 GPU layers**：逐步下調 `--n-gpu-layers`，以 CPU/RAM offload 換取可用性。這是最後防線，因為 PCIe 往返常使 generation tokens/s 明顯下降。

回滾策略也要在部署前寫好：保留上一個已驗證的映像 digest、模型量化檔 checksum 與參數檔；新模型或新 llama.cpp build 壓測失敗時，直接切回上一組三元組，而不是在正式服務上即時摸索參數。

## Flash Attention：為什麼能讓長 context 更穩

傳統 Attention 會形成龐大的 `N × N` 注意力中間矩陣，並頻繁把資料寫回 VRAM。Flash Attention 不改變 Attention 的語義，而是將 Q、K、V 切成 tiles：在 GPU 的 SRAM 中完成局部 Softmax 與加權累積，只把必要結果寫回顯存。

這個「少寫中間矩陣」的資料流優化，降低了 VRAM 頻寬壓力，讓 Tensor Core 在高 context 或高 batch 下維持更好的利用率。它不是魔法容量擴充：模型權重與 KV Cache 仍必須落在可用的記憶體預算內。

## RTX 4090 的選型決策矩陣

| 使用場景             | 建議優先測試    | 選擇理由                                                            |
| -------------------- | --------------- | ------------------------------------------------------------------- |
| AI Agent、程式開發   | Qwen 3.6 27B    | 混合架構與本次 SWE-bench 測試表現較突出；先以真實工具呼叫回放驗證。 |
| 長文本 RAG（>100K）  | Qwen 3.6        | YaRN 擴展能力值得優先壓測；務必以 KV Cache 預算限制併發。           |
| 多語言客服、即時對話 | Gemma 4 26B MoE | 部分專家活化有助於降低生成階段計算負擔，適合追求流暢度的工作流。    |

## 上線前檢查清單

- [ ] 模型檔、量化方法、映像 digest 與 llama.cpp commit 已記錄。
- [ ] 以預期的最大 prompt、輸出長度與併發數完成壓測。
- [ ] 已收集 TTFT、prefill / generation tokens/s、VRAM 峰值、錯誤率與功耗。
- [ ] OOM 時的 context、micro-batch 與 offload 回退順序已自動化。
- [ ] 已以代表性的繁體中文、程式碼與工具呼叫資料做品質回歸。

在單卡 24GB 的環境，最有效的調優不是追求單一最高 benchmark，而是為可預期負載留下容量餘裕。先用 GGUF + llama.cpp 做出可觀測、可回滾的基線，再決定是否值得轉向追求高吞吐的服務化框架，通常是更穩健的 MLOps 路徑。

## 參考資料

- [Gemma 4 model overview](https://ai.google.dev/gemma/docs/core)
- [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- [llama.cpp Docker documentation](https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md)
- [llama.cpp server options](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
