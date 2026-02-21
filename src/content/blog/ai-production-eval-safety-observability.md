---
title: "AI學習地圖 09：可靠上線（評估、安全、監控）"
description: "AI 系統真正的分水嶺在上線後：建立 eval、風險護欄與可觀測性，才有辦法長期穩定。"
publishDate: 2026-02-21
category: "SRE"
tags: ["AI學習地圖", "Evals", "AI安全", "可觀測性", "SRE"]
seoKeywords: ["AI學習地圖", "Evals", "AI安全", "可觀測性", "SRE"]
draft: false
featured: true
author: "Allen Shi"
readingTime: 12
---

會動不代表可用，AI 上線關鍵是可量測、可回滾、可持續改善。

## 結構化 Prompt（先定義）

```text
角色：你是 AI 平台 SRE。
目標：為客服 AI 建立上線治理方案。
輸出：
1) 3 個品質指標（正確率、拒答率、人工升級率）
2) 3 個安全護欄（敏感詞、越權操作、資料外洩）
3) 監控告警規則（觸發條件與回應流程）
4) 回滾機制（模型/Prompt/工具）
限制：每個項目都要可執行、可驗證。
```

## 上線前後的最低要求

- 有 baseline eval：先知道現在品質在哪。  
- 有 guardrails：把可預期風險先擋住。  
- 有 observability：能看到錯誤在哪個環節發生。  
- 有 rollback：出問題可快速降級。

## 建議監控面向

- 回答品質：格式錯誤率、事實錯誤率。  
- 系統品質：延遲、失敗率、工具超時率。  
- 風險品質：敏感內容觸發率、人工介入率。

## 參考資料

- Anthropic Define success criteria: https://docs.anthropic.com/en/docs/test-and-evaluate/define-success  
- OpenAI Cookbook Evals: https://cookbook.openai.com/topic/evals  
- OpenAI Model Spec: https://model-spec.openai.com/2025-04-11.html
