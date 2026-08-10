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

24GB VRAM 足以讓 RTX 4090 跑起量化後的 Gemma 4 或 Qwen 3.6，但「模型載得進去」不等於能穩定服務。真正吃顯存的是權重、KV Cache、批次大小和同時請求數；其中 KV Cache 最容易在長文本時把原本看似寬裕的空間吃完。

以下以 Dell Precision 3680 + RTX 4090 單卡為例，整理一套先量測、再調參的流程。文中的速度與顯存數字只適用於這組模型檔、llama.cpp 版本和測試提示詞；把它當成起點，不要當成其他機器的保證值。

> **本文重點：**先把 24GB 的空間留出餘裕，再用 GGUF 建立可回滾的基線。遇到 OOM 時，優先縮 context 和 micro-batch，不要一開始就把模型大量卸載到 CPU。

---

## 先用 24GB 做記憶體預算

RTX 4090 的 24GB GDDR6X 是一條明確的邊界。模型權重只是其中一塊；長 context 的 KV Cache、CUDA runtime 和暫存區也都要預留空間。讓 `nvidia-smi` 剩下 0MB 並不是成功條件，反而很容易在下一個較長的請求時失敗。

| 項目 | 本次環境 | 對部署的意義 |
| --- | --- | --- |
| GPU | NVIDIA GeForce RTX 4090 | 單卡推理的運算主體 |
| 顯存 | 24GB GDDR6X、384-bit | 權重與 KV Cache 共用的上限 |
| 平台 | Ubuntu 24.04.1、CUDA 13.2 | 驅動與容器版本需一併記錄 |
| 驅動 | NVIDIA Driver 595.71.05 | 升級後應重新跑壓測 |

實務上，我會先拿短 prompt 驗證模型能正常回應，再逐步拉長 context。這樣能分辨問題是模型載入、KV Cache，還是 batch 峰值，而不是只看到一個 OOM 錯誤。

---

## 先選部署格式，再選模型

對單張 4090，GGUF + llama.cpp 通常是比較容易起步的組合：模型檔案單一、量化選項清楚，也能在必要時將部分層分流到系統記憶體。若目標是高併發服務和更高吞吐，再評估 Safetensors 搭配 vLLM 或其他服務框架。

| 情境 | 較合適的起點 | 原因 |
| --- | --- | --- |
| 單機、PoC、顯存有限 | GGUF + llama.cpp | 容易調整量化、context 與 GPU offload |
| 批次推理、高併發 API | Safetensors + 服務框架 | 較容易朝吞吐與排程優化 |

`Q4_K_M` 的 `Q4` 代表 4-bit 權重；`K` 是分組縮放的 K-Quant；`M` 通常是同系列中偏平衡的配方。`K_XL`、`K_P` 等名稱可能是發布者自行定義，下載前仍要看模型卡、檔案大小與實際 VRAM 用量。

Gemma 4 適合先用在多語言或多模態工作流；Qwen 3.6 則適合拿來測試 Agent、程式任務和長文本。兩者都要用你的 prompt、工具定義與文件長度壓測，不能只憑公開 benchmark 決定。

---

## 先跑一組可重現的基線

先確認 NVIDIA Container Toolkit 能看到 GPU，並固定已驗證的映像 tag。以下設定將模型盡量放到 GPU，使用 8-bit KV Cache，並從 64K context 開始；它適合做第一輪容量測試，不代表所有模型都應直接套用。

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

啟動後至少跑一個短 prompt 和一個接近目標長度的 prompt，記錄 `nvidia-smi`、TTFT、prefill tokens/s、generation tokens/s 與失敗率。HTTP 200 只代表服務活著，還不能證明它能承受預期負載。

| 參數 | 先理解它影響什麼 | 建議調整順序 |
| --- | --- | --- |
| `--ctx-size` | KV Cache 的主要來源 | OOM 時最先調低 |
| `-ub` | prefill 的顯存峰值 | 依序由 1024 降到 512、256 |
| `--cache-type-k/v q8_0` | 以品質換取較長 context | 要用目標任務做回歸測試 |
| `--n-gpu-layers` | GPU 與 CPU/RAM 的分工 | 最後才降低，避免 PCIe 拖慢生成 |

`--flash-attn on` 能減少 Attention 過程的記憶體搬運，在高 context 或高 batch 時較穩；它不會讓 KV Cache 變小。新版 llama.cpp 對 `--mmap` / `--no-mmap` 的處理可能變動，升級映像前先用 `--help` 檢查等效參數。

---

## OOM 時照這個順序回復

每次只改一個設定，才知道哪一項真的有效。

1. 先降低 `--ctx-size`，這通常釋放最多顯存。
2. 再降低 `-ub`；它直接影響 prefill 時的峰值。
3. 確認日誌是否真的使用 `q8_0` KV Cache。必要時才評估更低精度，並重新測品質。
4. 最後才減少 `--n-gpu-layers`，以 CPU/RAM offload 換可用性。

新模型或新 llama.cpp build 壓測失敗時，應直接切回上一組已驗證的映像 digest、模型 checksum 和參數檔。這三項要一起保存，否則回滾時仍可能得到不同結果。

---

## 上線前，先定義什麼叫做「能用」

先把可接受的延遲、輸出長度與同時請求數寫下來，再跑壓測。沒有這個基準，速度數字再漂亮也很難判斷服務是否真的符合用途。

- [ ] 模型檔、量化方法、映像 digest 與 llama.cpp commit 已記錄。
- [ ] 以預期的最大 prompt、輸出長度與併發數完成壓測。
- [ ] 已收集 TTFT、prefill / generation tokens/s、VRAM 峰值、錯誤率與功耗。
- [ ] OOM 時的 context、micro-batch 與 offload 回退順序已自動化。
- [ ] 已以代表性的繁體中文、程式碼與工具呼叫資料做品質回歸。

單卡 24GB 的限制很直接，也因此調參要保守：先留出容量餘裕，把基線跑穩，再決定是否需要更高吞吐的服務框架。這比一開始追最高 benchmark 更容易維運。

## 參考資料

- [Gemma 4 model overview](https://ai.google.dev/gemma/docs/core)
- [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- [llama.cpp Docker documentation](https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md)
- [llama.cpp server options](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
