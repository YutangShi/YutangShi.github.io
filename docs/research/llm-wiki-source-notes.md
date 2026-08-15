# LLM-Wiki 文章：可稽核來源筆記

本筆記僅記錄可由一手來源直接核對的資訊，供撰寫 LLM-Wiki 相關文章時使用。存取日期均為 **2026-08-15**。文中「可支持」意指可在列出的特定來源中找到直接依據；不代表在未測試的模型、資料、版本、環境或產品中仍然成立。

## 來源清單與固定識別

| 編號 | 一手來源 | 存取日期 | 用途與固定識別 |
| --- | --- | --- | --- |
| S1 | [arXiv:2605.25480](https://arxiv.org/abs/2605.25480) | 2026-08-15 | LLM-Wiki 預印本；引用版本固定為 arXiv v2（2605.25480v2）。 |
| S2 | [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)、[NeurIPS proceedings](https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html) | 2026-08-15 | RAG 原始論文；NeurIPS 2020 正式論文。 |
| S3 | [microsoft/llmwiki README](https://github.com/microsoft/llmwiki#readme) | 2026-08-15 | Microsoft 的實作案例與專案自述；不是 S1 論文的實驗證據。 |

## S1：LLM-Wiki 預印本

- 標題：*Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki*。
- 作者：Haoliang Ming、Feifei Li、Xiaoqing Wu、Wenhui Que。
- 版本：arXiv v2（arXiv:2605.25480v2）。
- 提交／修訂日期：v1 於 2026-05-25 提交；v2 於 2026-05-26 修訂（arXiv 顯示時間分別為 06:36:14 UTC 與 10:31:56 UTC）。
- 文獻狀態：此來源是預印本；本筆記不得將其稱為已同行評審的定論。

### S1 可支持的主張

1. 論文提出名為 LLM-Wiki 的 agent-native retrieval system，將外部知識視為可編譯、可組合、可自我演化的結構，而非靜態檢索索引。
2. 論文描述的系統會將文件編譯成有雙向連結的結構化 Wiki pages，並透過標準 tool-calling 介面提供 search、read 與 link-following 操作；另引入 Error Book 作持續的結構與語意自我修正。
3. **在該論文報告的評測設定與比較基線下**，其摘要宣稱在 HotpotQA、MuSiQue、2WikiMultiHopQA 相對 HippoRAG 2、LightRAG、GraphRAG 高出 2.0–8.1 F1 points，並在 AuthTrace 取得最佳 overall accuracy。

### S1 不可支持的主張

1. 「LLM-Wiki 對所有 RAG、所有 LLM、所有企業知識庫都更準確或更便宜。」論文摘要未提供這種跨模型、跨資料域與跨成本條件的普遍性保證。
2. 「LLM-Wiki 已在正式生產環境證明可靠、安全、合規或具 SLA。」預印本摘要沒有提供此類營運或治理驗證。
3. 「2.0–8.1 F1 points 是任何部署都能重現的收益。」這些是特定 benchmark、資料處理、模型與比較設定下的報告結果，不能外推成通用保證。
4. 「該研究已完成同行評審。」S1 是 arXiv 預印本，不能據此做出該判定。

## S2：RAG 原始論文

- 標題：*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*。
- 作者：Patrick Lewis、Ethan Perez、Aleksandra Piktus、Fabio Petroni、Vladimir Karpukhin、Naman Goyal、Heinrich Küttler、Mike Lewis、Wen-tau Yih、Tim Rocktäschel、Sebastian Riedel、Douwe Kiela。
- 正式書目：Patrick Lewis 等人，〈Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks〉，*Advances in Neural Information Processing Systems* 33（NeurIPS 2020），2020；[官方 proceedings](https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html)。
- 年份：2020；arXiv 記錄標示該文已被 NeurIPS 2020 接受。

### S2 可支持的主張

1. 該文研究 RAG：將預訓練語言模型的參數化記憶與可微分存取的非參數化記憶結合，用於語言生成。
2. 文中的非參數化記憶是由預訓練神經檢索器存取的 Wikipedia dense vector index；作者比較了整段生成共用 passages 與每個 token 可使用不同 passages 的兩種 RAG 形式。
3. **在該文的知識密集 NLP 評測及基線下**，作者報告在三個 open-domain QA 任務達到 state of the art，且在語言生成任務中相對該文採用的 parametric-only seq2seq baseline，輸出更 specific、diverse、factual。

### S2 不可支持的主張

1. 「RAG 必然消除幻覺、保證事實正確或總能提供正確 provenance。」論文指出 provenance 與世界知識更新本身仍是研究問題，且其實驗結果不是這些絕對保證。
2. 「任何向量資料庫、嵌入模型或現代 chat model 都會有相同效益。」S2 的模型、Wikipedia index、任務與比較設計皆有明確範圍。
3. 「S2 證明 LLM-Wiki 的實作或 benchmark 結果。」S2 發表於 2020 年，提出的是 RAG 架構研究；不能作為 S1 或 S3 的直接驗證。

## S3：Microsoft LLM Wiki GitHub 實作案例

- 專案：[`microsoft/llmwiki`](https://github.com/microsoft/llmwiki)。
- 已核對的 Microsoft branch（遠端分支）：`main`。
- 已核對的 Microsoft commit SHA：`b44df6ae95138d0edcbcc79b5b1d099c78bce5e0`（以 `git ls-remote https://github.com/microsoft/llmwiki.git refs/heads/main` 於 2026-08-15 查核）。
- README 定位：此專案自述為「A personal knowledge base where the LLM does all the maintenance」，並說明它是建立個人知識庫的 VS Code extension；LLM 會增量建立與維護持久化、具結構與互連的 Markdown wiki，而非在查詢時只從原始文件檢索。
- README 架構自述：Raw Sources 由人類擁有且不可變；Wiki 是 LLM 產生的 Markdown 檔；Schema（`AGENTS.md`）由人與 LLM 共演化。README 亦列出 `@llmwiki/core`（含 MCP server、ingest、search、lint 等）與 `llmwiki` VS Code extension 兩個套件。
- 使用邊界：S3 **僅作實作案例與專案自述**，不可當作 S1 論文之作者、方法、數字或 benchmark 的來源，也不可把 README 功能描述寫成獨立實驗結論。

### S3 可支持的主張

1. Microsoft 維護一個名為 LLM Wiki 的公開專案，README 將其定位為 VS Code extension／個人知識庫實作。
2. 在上述 commit 的 README 所描述範圍內，專案含有來源、wiki、schema 的三層概念，並提供核心套件與 VS Code extension 套件。

### S3 不可支持的主張

1. 「Microsoft 專案就是 S1 論文的官方程式碼、相同系統或同一份 benchmark 實作。」README 與儲存庫資訊不足以建立此等同關係。
2. 「README 描述已由獨立評測證實。」README 是專案自述，除非另有可稽核的研究或測試證據，不得提升為實證結論。

## 主張分類與文章用語

| 分類 | 可使用的證據 | 可寫法 | 不可混用 |
| --- | --- | --- | --- |
| 論文結果 | S1、S2 各自的論文內容 | 「S1 在其報告的 benchmark 設定中指出……」；「S2 在其評測中報告……」 | 不得把論文的條件式結果寫成產品保證、產線 KPI 或通用事實。 |
| 專案自述 | S3 README 與固定 commit | 「Microsoft 的 README 將此專案定位為……」 | 不得把 README 功能、架構或宣稱寫成同行評審的研究結果。 |
| 本文生產落地建議 | 本文作者的工程判斷；須明示為建議 | 「建議以離線評測、金絲雀發布、可回滾索引版本驗證……」 | 不得把建議偽裝成 S1/S2/S3 已證實的結論。 |

## 引用前使用規則

1. 每一個數字、benchmark 名稱、基線比較與「state of the art」敘述，都要明確標記來源與實驗範圍；S1 的 2.0–8.1 F1 points 僅能歸因於 S1 所報告的評測。
2. **明確禁止：不得把預印本 benchmark 寫成通用保證。**不得寫「LLM-Wiki 一定提升 2.0–8.1 F1」、「可保證所有知識庫更準確」，也不得暗示適用於所有模型、資料、語言或生產環境。
3. 引用 S1 時須標示「預印本」與 arXiv 版本 `v2`；不以它單獨證明生產可靠性、安全性、成本效益、合規性或 SLA。
4. 引用 S3 時須寫明「README／專案自述」及固定 branch/commit；不得以名稱相同推論其與 S1 的實作、作者或實驗存在直接關係。
5. 生產落地建議必須與研究結果分段呈現，並以本地資料、檢索品質、延遲、成本、失敗率與人工覆核等實測 KPI 驗證；需設計版本化、金絲雀與回滾機制。
