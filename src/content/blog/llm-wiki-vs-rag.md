---
title: "LLM-Wiki 是什麼？從 Retrieval-as-Reasoning 看它與 RAG 的差異、限制與選型"
meta_title: "LLM-Wiki 與 RAG：原理、差異、風險與落地選型"
description: "解析 LLM-Wiki 的知識編譯與 agent-native retrieval 原理，對照 RAG 的適用情境、治理風險與 hybrid 落地方式。"
image: /images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg
date: 2026-08-15
author: Allen Shi
categories:
  - AI 自動化
tags:
  - LLM
  - RAG
  - Agent
  - 知識庫
  - 可觀測性
draft: false
---

你把文件丟進向量資料庫，不代表 agent 就真的懂公司怎麼處理事故。它可能找得到「CPU 過高」的段落，卻漏掉同一份 runbook 裡的升級條件、權限邊界，或最新的回滾步驟。

本文討論的 LLM-Wiki，提供另一種思考方向：先把原始文件編譯成可逐步瀏覽、可回查來源的 Wiki，再讓 agent 把「找資料」當成推理的一部分。不過先說結論：**LLM-Wiki 不是取代 RAG**。它比較適合成為某些高脈絡任務的知識層；保留 raw-source retrieval 的 hybrid 架構，通常更務實。

## 摘要

- [LLM-Wiki 論文](https://arxiv.org/abs/2605.25480) 描述的是 2026 年 arXiv v2 預印本研究系統，不是產業標準，也不代表通用效能保證。
- [Microsoft 的 llmwiki README 實作](https://github.com/microsoft/llmwiki) 是 persistent Markdown wiki 的實作案例；它和論文的研究主張、評測結果要分開看。
- 傳統 chunk-based RAG 適合快速接上既有文件。當問題需要跨頁脈絡、步驟導覽、人工審核與版本治理時，Wiki 層有價值。
- 本文建議 hybrid：Wiki 用於導覽與推理，原始來源與檢索層負責精確引用、權限過濾與 fallback。這是本文參考架構建議，不是論文或 README 的保證。

## LLM-Wiki 是什麼

LLM-Wiki 的核心不是「把 Markdown 換個格式存起來」，而是知識編譯（knowledge compilation）。系統從原始文件、程式碼、SOP 或 runbook 抽取主題與關係，建立一組可連結的頁面；agent 再依問題逐頁探索，決定下一步要讀哪一頁、是否回到原始資料驗證。

這種做法可稱為 Retrieval-as-Reasoning：retrieval 不再只是先取幾個 chunk 當 prompt 附件，而是 agent 推理流程中的一連串動作。對「支付 API 為何被暫停？」這類問題，agent 可能先讀服務總覽，再讀告警頁、升級規則與變更紀錄，最後回查 incident 原文。

不要把兩個名稱混為一談。

- **LLM-Wiki 論文研究系統**：討論如何把知識編譯為 agent 可探索的 Wiki，並用多跳問答等設定研究 retrieval 與推理的關係。它是 2026 arXiv v2 預印本，結論應視為研究證據，不應直接當成採購或架構承諾。
- **Microsoft README 的 persistent Markdown wiki 實作案例**：著重讓 wiki 以持久化 Markdown 形式留在檔案系統或版本控制中，方便檢視、編修和追蹤。它說明一種工程落地路徑，不等於論文的完整系統或效果背書。

相較之下，[RAG 論文](https://arxiv.org/abs/2005.11401) 建立了「生成時檢索外部知識」的典型框架。今天的 RAG 已比早期描述廣得多：除了常見的 chunk-based RAG，也可以結合 metadata filter、BM25 與向量 hybrid search、SQL/圖譜等結構化資料，以及 agentic retrieval。因此，下文的 chunk-based RAG 只是比較基準，不是 RAG 的全部。

![LLM-Wiki 與 RAG 從文件匯入、索引到 agent 回答的生命週期比較](/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg)

## LLM-Wiki 的運作原理

一個可操作的流程可拆成五步。

1. **盤點與正規化來源**：將 runbook、ADR、告警規則、Git 變更紀錄標上系統、服務、擁有者、機密等級與有效期限。
2. **編譯 Wiki 頁**：依服務、任務、故障模式和決策建立頁面；每個段落保留 `source_uri`、版本、擷取時間與原文錨點。
3. **建立連結與導航**：把「告警」連到「診斷」、「升級」連到「回滾」，並限制 agent 可用的工具與最大探索深度。
4. **agent 逐步檢索**：先用 Wiki 找工作脈絡，再向 raw source 取證；回答附上引用與信心資訊。
5. **審核後發布**：新頁或大幅改寫先進 review queue，通過後才成為可檢索版本。

以下是可放進 SRE runbook Wiki page 的 YAML front matter 與 Markdown 範例。它刻意保存來源與回滾資訊，避免摘要成為唯一真相。

```yaml
---
title: "payments-api：5xx 事故處理"
service: payments-api
owner: platform-sre
classification: internal
source_uri: "runbooks/payments-api-5xx.md#rollback"
source_commit: "a1b2c3d4"
source_updated_at: "2026-08-14T09:20:00+08:00"
review_status: approved
reviewed_by: "oncall-sre"
valid_until: "2026-09-14"
---
```

```markdown
## 觸發條件

- 5xx rate 超過 2%，持續 10 分鐘。
- 同時確認 `payment_authorize_latency_p95` 上升。

## 操作順序

1. 用事件 ID 查詢最近 15 分鐘的 deploy 與 feature flag 變更。
2. 若錯誤集中在新版本，停止 rollout，將 traffic 切回前一個穩定 revision。
3. 回查 `source_uri` 的原始 runbook 與 change record；不要只依此摘要操作。

## 升級與回滾

- 涉及退款、重複扣款或資料不一致時，立即升級 finance-oncall。
- 回滾後觀察 30 分鐘；未恢復則開 P1 incident 並保留查詢證據。
```

## LLM-Wiki 與常見 chunk-based RAG 的比較

| 面向 | LLM-Wiki | 常見 chunk-based RAG |
| --- | --- | --- |
| 知識單位 | 有主題、步驟與連結的頁面 | 固定或語意切分的文字 chunk |
| 主要強項 | 跨文件導覽、多步任務、讓 agent 探索 | 導入快、全文搜尋與問答延遲較可控 |
| 回答路徑 | 通常會先導航再取證，路徑可記錄 | 通常一次取 top-k 後生成 |
| 更新成本 | 要重編譯、審核頁面與維護連結 | 要重切 chunk、重嵌入或更新索引 |
| 主要風險 | 摘要錯誤被後續頁面放大 | chunk 缺上下文、檢索命中但答案失真 |

選型時別只問「哪個 F1 高」。如果你的使用者主要問單一政策、產品規格或 FAQ，先把 RAG 的 metadata、權限 filter、hybrid retrieval 與引用做好，成本較低。若 on-call 要依脈絡走診斷樹、跨多份文件決策，而且你能投入審核與版本治理，再加 Wiki 導航層。

論文可能報告相對指定基線的改善，但那是特定資料集、設定與評測流程下的結果。它不能推論到你的內部文件、語言、權限模型或生產 SLA。你仍須用自己的任務與 failure cases 驗證。

![Hybrid 架構中 Wiki 導航、受權限保護的原始來源與 RAG 檢索層的關係](/images/blog/diagrams/llm-wiki-hybrid-architecture.svg)

## 落地藍圖

本文的生產落地建議是採兩層式 hybrid：

1. **來源層**：原始文件留在既有 Git、文件系統或資料庫。每筆內容有 ACL、版本、來源 URI、內容雜湊與保留期限。
2. **檢索層**：建立 keyword + vector + metadata 的 hybrid RAG；查詢時先套用使用者權限，再取回原文片段。
3. **Wiki 層**：從已授權來源生成 persistent Markdown wiki，但每一頁與段落都連回 raw source。過期、未審核或無法回查的頁面不可當成最終證據。
4. **Agent 層**：先選擇 Wiki 導航或直接 raw-source retrieval；高風險動作一律要求來源引用與人工核准。
5. **評估與發布層**：以 canary corpus 和 shadow query 比較新舊版本；失敗時切回前一份 Wiki manifest，並保留 raw-source fallback。

權限、來源回查、審核、版本、差異回滾與 raw-source fallback 都是**本文的生產落地建議**。不要假設預印本或 README 已替你的公司處理好 IAM、保留政策與稽核責任。

## 風險、治理與可觀測性

下面的指標是評估指標，不是效果承諾。你可以先在 50 到 100 個真實 on-call 問題上建立 baseline，再決定是否擴大範圍。

| 指標 | 定義與用途 |
| --- | --- |
| citation precision / source coverage | 引用是否真的支持答案；答案關鍵主張被可回查來源覆蓋的比例 |
| stale-page rate | 已超過 `valid_until`、來源已變更或連結失效的 Wiki 頁比例 |
| review acceptance | 自動產生頁面一次審核通過率；過低表示提示、分頁或來源品質有問題 |
| ingestion cost | 每次同步的模型、嵌入、儲存與人工審核成本 |
| query latency | 從授權、導航、raw-source retrieval 到回答的 p50/p95 延遲 |

失敗模式必須有明確處置，而不是只靠模型「更小心」。

- **摘要錯誤傳播**：一個錯誤摘要被多個頁面引用，會讓 agent 沿著錯路推理。避免方式是保存段落級來源、限制自動交叉引用、抽樣做 entailment review。回滾方式是停用該編譯版本、切回上一版 manifest，並要求 raw-source fallback。
- **過期頁**：部署後的 SOP 與 Wiki 不一致會直接傷害 on-call。避免方式是 source commit webhook 觸發失效標記、TTL 與 owner review。回滾方式是將頁面標為 stale、從導航結果降權，改用最新原文。
- **權限外洩**：共享索引或預先生成摘要都可能把機密帶進不該看的回答。避免方式是 ingestion 與 query 都執行 ACL、內容分級、租戶隔離和輸出 DLP。回滾方式是撤銷索引/頁面版本、旋轉存取權杖、稽核受影響查詢並通知資安流程。
- **錯誤合併**：不同服務、環境或版本的文件被合成同一頁，會產生看似合理但不能執行的步驟。避免方式是強制 environment、service、version metadata，合併前要求擁有者審核。回滾方式是拆分頁面、撤回錯誤連結並重新編譯。
- **成本失控**：大量文件每次都完整重編譯，模型費用與審核隊列會失控。避免方式是內容雜湊、增量 ingestion、預算上限、佇列節流與快取。回滾方式是停止批次工作、維持上一個已核准版本，先服務 raw-source RAG。

可觀測性至少要記錄：來源版本、ACL 決策、agent 導航路徑、檢索候選、被採用的引用、模型與工具成本、拒答原因，以及是否走 raw-source fallback。記錄時不要把敏感原文直接寫入一般 log；使用事件 ID 與受控的稽核儲存。

## 結論與選型檢核表

選 LLM-Wiki，不是因為它聽起來比 RAG 新。你需要的是可驗證的任務改善，以及能承擔治理成本的團隊流程。先讓文件擁有者、SRE 和資安一起回答下面問題。

- [ ] 問題是否常需要跨文件、多步驟判斷，而不是只找一段答案？
- [ ] 每份來源是否有 owner、ACL、版本與可回查 URI？
- [ ] 團隊是否願意對 Wiki 頁進行審核，並處理 stale page？
- [ ] 高風險回答是否能強制附引用，且在不確定時走 raw-source fallback？
- [ ] 是否已量測 citation precision/source coverage、stale-page rate、review acceptance、ingestion cost 與 query latency？
- [ ] 是否準備好版本差異、回滾 manifest、資料撤銷與 incident runbook？

如果多數答案是否定，先把 RAG 基礎設施做紮實：來源治理、metadata、權限、hybrid retrieval、引用與觀測。當任務開始需要「知道下一頁該看什麼」，再用小範圍的 LLM-Wiki pilot 驗證它是否值得長期維護。
