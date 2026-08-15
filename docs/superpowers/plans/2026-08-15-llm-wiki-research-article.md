# LLM-Wiki 研究文章 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 發布一篇以技術讀者為對象的繁體中文研究文章，解釋 LLM-Wiki 的概念、運作原理、與 RAG 的邊界與選型方式，並以可查證來源清楚標示研究與實務主張。

**Architecture:** 文章採「概念澄清 → 知識生命週期 → 常見 chunk-based RAG 對照 → 評估與治理 → 選型與落地」結構。以 LLM-Wiki 論文的 agent-native retrieval 定義為技術主線，同時補充業界常見的 persistent Markdown wiki pattern；兩者同名但成熟度與實作範圍不同，必須分開描述。

**Tech Stack:** Astro Content Collections、Markdown、既有部落格版型、原生 SVG 圖解、Node.js 原生測試。

---

## 文章定位與研究邊界

- **暫定標題：** `LLM-Wiki 是什麼？從 Retrieval-as-Reasoning 看它與 RAG 的差異、限制與選型`
- **讀者：** 已理解 LLM、向量檢索或 RAG 基礎，正評估企業知識庫、研究系統或 agent memory 的工程師與技術決策者。
- **核心論點：** 常見的 chunk-based RAG 主要在回答時從原始語料找回片段；LLM-Wiki 則在攝取時將來源編譯為可連結、可維護、可供 agent 走訪的知識結構。本文比較的是這兩種常見 pipeline，不是宣稱 RAG 必然只有 flat chunks；RAG 也可以使用 metadata、hybrid retrieval、預先抽取的結構和多步 agentic retrieval。
- **不納入：** 不把 LLM-Wiki 描述為已確立的產業標準；不把論文中的 benchmark 結果泛化為所有知識庫情境；不把「LLM-Wiki」與所有 LLM 記憶、GraphRAG 或一般 Wiki 混為同一技術。
- **關鍵警語：** `Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki` 為 2026 年 arXiv 預印本。文中所有 2.0-8.1 F1 的結果須標註資料集、比較基線與預印本狀態，不能寫成通用效能保證。

## 來源策略

### 一級來源（正文主張必須優先引用）

1. [LLM-Wiki 論文（arXiv 2605.25480）](https://arxiv.org/abs/2605.25480)：方法定義、元件、工具介面、Error Book、HotpotQA／MuSiQue／2WikiMultiHopQA／AuthTrace 的實驗結果與限制。來源筆記必須記錄 arXiv 版本、提交／修訂日期與存取日期。
2. [Microsoft LLM Wiki 專案 README](https://github.com/microsoft/llmwiki)：只作為一個實作案例，描述該專案宣稱／採用的 persistent personal wiki pattern、攝取時整合與來源檔案的關係。來源筆記必須記錄 branch、commit SHA 與存取日期；不得將 README 的產品敘述視為普遍結論。
3. RAG 原始論文：[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)：RAG 的正式定義與基線背景。
4. 若討論圖檢索基線，只引用原始論文或正式專案文件；不得以部落格文章替代技術主張。

### 二級來源（僅作實務案例或延伸閱讀）

- [nashsu/llm_wiki](https://github.com/nashsu/llm_wiki)：示範 markdown-first、知識圖與選用 vector search 的工程實作；不可用它證明論文效能。
- 社群文章僅可協助找案例，不可單獨支持定義、benchmark 或安全結論。

### 引用規則

- 任何評估數字都要在同一句或同段結尾附來源，並標示資料集和評估指標。
- 每個 Wiki 頁面都應保留原始來源連結、攝取日期、最後檢閱日期與信任標記；此為本文的**生產落地建議**，不宣稱是所有 LLM-Wiki 的內建能力。
- 對未證實、相互衝突或過期內容，要描述「待審核／需回溯來源」，而不是讓模型自行選定事實。

## 建議文章結構

### 0. 摘要與讀者收穫（180-220 字）

- 用一個具體問題開場：文件越多，問答越常重複摘要、難以追溯、跨文件推理不穩。
- 先給結論：LLM-Wiki 改變的是「知識組織與維護時間點」，不是單純換一個 embedding database。
- 列出讀完後能回答的三個問題：它如何運作、何時優於單純 RAG、何時不該用。

### 1. 介紹：LLM-Wiki 是什麼，解決什麼問題

1. 定義兩層含義：
   - **研究系統 LLM-Wiki：** 將文件編譯為具雙向連結的 Wiki，讓 agent 透過 search、read、follow-link 等工具進行 retrieval-as-reasoning。
   - **實務 pattern：** 由 LLM 增量維護的 Markdown／Wiki 型知識庫，將摘要、實體頁、概念頁、反向連結和來源脈絡保存下來。
2. 說明傳統文件庫的痛點：chunk 缺少全局脈絡、每次問答重複整理、跨文件關係難表示、文件版本與矛盾不易治理。
3. 用一個 SRE 例子貫穿全文：新事故後同時攝取 runbook、變更紀錄、監控截圖與事後報告，系統如何更新「服務」、「症狀」、「根因」、「緩解措施」等 Wiki 頁，而不是只新增幾個向量 chunk。
4. 明確說明它不是：不是 Wikipedia clone、不是自動可信、不是取代原始文件、也不是不用檢索。

### 2. 原理：從 raw source 到可推理的知識結構

使用「一次攝取、多次重用」作為主軸，搭配圖一。

1. **來源攝取與正規化：** 收集 PDF、文件、網頁、事件紀錄；保留 source ID、版本、時間、權限與段落定位。
2. **知識編譯：** LLM 擷取實體、概念、事件、關係、事實與不確定性，將其寫入 topic page／entity page／index page；每個斷言都要回連 source ID。
3. **連結與導覽：** 建立雙向連結、相關主題、父子階層與索引。讀者應理解「連結是可供 agent 操作的檢索路徑」，不是只有 UI 功能。
4. **回答時的 retrieval-as-reasoning：** agent 先搜尋入口頁，再讀取高相關頁，依證據需求跟隨連結並回查原始來源；設定停止條件（已取得足夠、可交叉驗證的證據）。
5. **增量維護與錯誤修正：** 新來源進來時更新既有頁、標示衝突、提出待審核工作；論文的 Error Book 應在此節拆解「錯誤記錄 → 結構／語義修正 → 後續檢索改善」的迴圈。
6. **人類治理：** 高風險領域必須有權限、審核、版本、來源追蹤與回滾；禁止讓模型直接覆寫已核可的規範頁。

### 3. LLM-Wiki 與常見 chunk-based RAG 的比較

先以一句話定義：RAG 是一組 retrieval-augmented generation 方法，而本文表格中的「常見 RAG」特指以原始文件切塊、索引並於查詢時取回 top-k context 的 pipeline；LLM-Wiki 是攝取時間的知識編譯與維護層。接著提供下表，並在表後說明「Hybrid」方案。

| 面向 | 常見 chunk-based RAG | LLM-Wiki 研究系統／實務 pattern | 建議判讀 |
| --- | --- | --- | --- |
| 主要單位 | 原始文件 chunk | 研究系統的 linked Wiki pages；實務 pattern 常採主題／實體／概念頁 | Wiki page 仍可回連 chunk 或原文 |
| 知識整理時間 | 查詢時選取與拼接內容 | 攝取時編譯，更新時增量修訂 | Wiki 將成本前移到 ingestion |
| 檢索方式 | keyword／vector／reranker，也可 hybrid 或 agentic | 論文提出 search、read、link traversal 等 agent tools | 比較的是預設介面，不排除 RAG 的進階設計 |
| 回答上下文 | 通常由 top-k chunks 組成 | 由 agent 逐步蒐集的結構化證據 | 需要明確的停止與成本控制 |
| 來源可追溯性 | 取決於 chunk metadata 與 UI | 實務上應讓頁面斷言回連原始來源 | 兩者都不會自動保證可信；後者是本文建議 |
| 資料更新 | 重新切塊／重嵌入或增量索引 | 研究系統強調自演化；實務上更新頁面、連結與衝突紀錄 | Wiki 需額外處理摘要過期與錯誤傳播 |
| 最適情境 | 大量、變化快、尚未整理的原始語料 | 穩定累積、跨文件關聯、多跳研究與 agent memory | 從資料與問題型態選擇，不從流行詞選擇 |
| 主要風險 | 漏檢、chunk 脫離語境、檢索噪音 | 編譯錯誤被累積、維護成本、治理不足 | Hybrid 通常更務實 |

**Hybrid 段落：** Wiki 先作為高密度導覽與已審核摘要；當問題需要原文、長尾細節或新文件時，再以 RAG 檢索原始語料並把可驗證的新洞見送入 review queue。這是本文的**參考架構建議**，不是論文或 Microsoft 專案的保證功能；需畫清楚 RAG 是 evidence retrieval，不是被淘汰的技術。

### 4. 其他必要章節：風險、治理與可觀測性

這是原始題綱最需要補足的一章，避免文章只談理想架構。本節的 ACL、citation validator、review queue、schema、回滾與 KPI 均標示為**本文的生產落地延伸**，不是 LLM-Wiki 論文或 Microsoft 專案已證實的內建能力。

1. **摘要錯誤累積：** 一次攝取時的錯誤可能傳播到多個頁面；用來源連結、斷言等級、差異比對與人工審核降低 blast radius。
2. **衝突與新舊資訊：** 不要覆寫舊結論；保存版本、時間範圍與衝突欄位，讓讀者看到「何時、根據什麼」得出結論。
3. **權限與資料外洩：** 建議讓每個 source／page／link 的 ACL 可繼承或明確裁決；回答時權限過濾要發生在檢索前與生成前。
4. **評估方法：** 除了 answer correctness，加入 citation precision、source coverage、stale-page rate、conflict-resolution time、human-review acceptance rate、ingestion cost、query latency。
5. **成本模型：** 比較 RAG 的 query-time token／retrieval 成本與 LLM-Wiki 的 ingestion-time 編譯、重編譯、review 成本；不能主張任何一方必然便宜。
6. **何時先不要導入：** 語料很少、資料瞬息變動且沒有 owner、無法建立來源與審核責任、或只需要一次性語意搜尋時，先選簡單 RAG 或文件搜尋。

### 5. 落地藍圖：從最小可行 Wiki 到 Hybrid 系統

1. 選擇單一領域與 20-50 份有 owner 的來源，例如 SRE runbook 與事故報告；不要一開始匯入整個雲端硬碟。
2. 定義最小 schema：`source`、`topic`、`entity`、`claim`、`link`、`review_status`、`updated_at`、`source_citation`。
3. 建立 ingest → compile → review → publish 的工作流，並保留每次 LLM 修改的 diff；明確標註這是本文建議的治理流程。
4. 對 agent 提供 read-only query tools（search、read、follow links、open source）；把 write tools 與人工 review 分開。此為本文建議的權限模型。
5. 保留向量／keyword retrieval 作 raw source fallback，建立「Wiki 命中不足時才展開原文」的路由。
6. 以 10-20 個真實問題做前後對照：單跳、跨文件、時間敏感、矛盾來源、無答案與權限不足。

### 6. 結論：選型檢核表與下一步

- 用 6 個 yes/no 問題協助讀者判斷：是否有長期累積的來源、跨文件問題、可指定 owner、可接受攝取前成本、需審計與可追溯、是否已有 raw-source fallback。
- 以「先建立可治理的知識，再優化檢索」收束，但保留 RAG 在廣泛原始語料與即時更新情境的重要性。
- 提供延伸閱讀：論文、RAG 原始論文、Microsoft 實作，以及 GraphRAG／agent memory 的後續比較文章。

## 圖表與附錄規劃

1. **圖一：資料生命週期對照圖（必要）**
   - 常見 chunk-based RAG（比較基準）：`Raw documents → chunk/embed/index → query → retrieve top-k → prompt → answer`；圖註需註明進階 RAG 也可採 hybrid、結構化或 agentic retrieval。
   - LLM-Wiki：`Raw sources → extract/compile → linked wiki + provenance → agent search/read/follow links → answer → review/error feedback → wiki update`
   - 圖上必須標示人類 review gate、原始來源回查與權限過濾位置。
2. **圖二：Hybrid reference architecture（建議）**
   - `Agent router → Wiki navigator → Wiki pages` 與 `Raw-source RAG fallback` 並行，最終回到 `citation validator`。
3. **表一：LLM-Wiki vs RAG 比較表（必要）**
   - 使用第三章的表，加入「不是互斥」註解。
4. **附錄 A：SRE runbook Wiki page 範例（建議）**
   - 示範 Markdown frontmatter：`status`、`owner`、`last_verified`、`source_refs`、`related_pages`、`confidence`。
   - 附上「禁止直接以模型摘要當唯一事實」的 reviewer checklist。

## 寫作與 SEO 規格

- **分類：** `AI 自動化`
- **標籤：** `LLM`、`RAG`、`Agent`、`知識庫`、`可觀測性`
- **Meta title：** `LLM-Wiki 與 RAG：原理、差異、風險與落地選型`
- **Meta description：** `解析 LLM-Wiki 的知識編譯與 agent-native retrieval 原理，對照 RAG 的適用情境、治理風險與 hybrid 落地方式。`
- 所有縮寫第一次出現須附中文或英文全名；避免用「取代 RAG」、「永遠更準」、「零維護」等絕對化字眼。
- 文章標題層級使用單一 H1（由 frontmatter／頁面處理）並自 H2 開始正文；內部錨點使用穩定、可讀的英文 slug。

## 實作工作清單

### Task 1: 建立已查證的研究來源筆記

**Files:**
- Create: `docs/research/llm-wiki-source-notes.md`

- [ ] **Step 1: 建立來源矩陣**

記錄每個一級來源的 URL、發布日期、作者／維護者、可支持的主張、不能支持的主張與引用位置。

- [ ] **Step 2: 驗證論文主張**

逐一核對 abstract、method 與 experiment：LLM-Wiki 元件、資料集、比較基線、F1 指標與預印本狀態。

- [ ] **Step 3: 建立主張到來源的映射**

每個含數字、效能、安全或架構結論的段落都要有至少一個一級來源；找不到來源就改為假設、建議或刪除。

- [ ] **Step 4: Commit**

```bash
git add docs/research/llm-wiki-source-notes.md
git commit -m "docs: add llm-wiki research sources"
```

### Task 2: 建立文章視覺素材

**Files:**
- Create: `public/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg`
- Create: `public/images/blog/diagrams/llm-wiki-hybrid-architecture.svg`

- [ ] **Step 1: 定義圖一節點與箭頭**

使用本計畫「圖一」的兩條資料生命週期，加入 source provenance、human review、ACL filter 與 error feedback 節點。

- [ ] **Step 2: 撰寫 SVG**

使用現有 `public/images/blog/diagrams/` 的 SVG 視覺語言；所有文字在 1200px 寬度下可讀，且提供 `<title>`、`<desc>` 與足夠對比。

- [ ] **Step 3: 視覺檢查**

Run: `npm run build` 後，以瀏覽器分別在 1440px 與 375px viewport 開啟文章頁並截圖檢查。

Expected: 兩張 SVG 均可讀、沒有截斷文字，且在 desktop／mobile viewport 具高對比；SVG 均有 `<title>`、`<desc>`，文章 `<img>` 均有描述性 alt text。

- [ ] **Step 4: Commit**

```bash
git add public/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg public/images/blog/diagrams/llm-wiki-hybrid-architecture.svg
git commit -m "feat: add llm-wiki article diagrams"
```

### Task 3: 以文章結構撰寫 LLM-Wiki 研究文

**Files:**
- Create: `src/content/blog/llm-wiki-vs-rag.md`
- Modify: `src/content/blog/-index.md`（僅在現有文章索引機制需要手動登錄時）

- [ ] **Step 1: 寫 frontmatter 與文章大綱**

使用本計畫的 SEO 規格；設定 `draft: true`，直到來源、圖表與內容審核完成。

- [ ] **Step 2: 撰寫第 0-2 節**

交代名詞範圍、問題場景、攝取到回答的完整流程；插入圖一，並為每個技術主張附外部連結。

- [ ] **Step 3: 撰寫第 3 節比較表與 Hybrid 段落**

逐維度比較常見 chunk-based RAG 與 LLM-Wiki，結論明確為「可組合」，不是二選一。

- [ ] **Step 4: 撰寫第 4-6 節**

完成治理、風險、可觀測性、成本、落地藍圖與選型檢核表；插入圖二與 SRE runbook 範例。

- [ ] **Step 5: 寫入失敗模式與回滾方案**

明列摘要錯誤傳播、過期頁、權限外洩、錯誤合併與成本失控；針對每項提供 source-level rollback、page diff rollback、review queue 與 raw-source fallback。

- [ ] **Step 6: 將文章由 draft 轉為正式發布前的候選版本**

確認無未標示的推論、無未支持的 benchmark 主張、所有圖表具 alt text 後，才將 `draft` 設為 `false`。

### Task 4: 建立內容防回歸檢查

**Files:**
- Create: `tests/llm-wiki-article.test.mjs`

- [ ] **Step 1: 寫 failing test**

```js
test('LLM-Wiki article includes required research and decision sections', async () => {
  const article = await readFile(articlePath, 'utf8');
  await access(lifecycleDiagramPath);
  await access(hybridDiagramPath);
  await access(sourceNotesPath);
  const sourceNotes = await readFile(sourceNotesPath, 'utf8');
  assert.match(article, /## LLM-Wiki 是什麼/);
  assert.match(article, /## LLM-Wiki 的運作原理/);
  assert.match(article, /## LLM-Wiki 與常見 chunk-based RAG 的比較/);
  assert.match(article, /## 風險、治理與可觀測性/);
  assert.match(article, /arxiv\.org\/abs\/2605\.25480/);
  assert.match(article, /arxiv\.org\/abs\/2005\.11401/);
  assert.match(article, /不是.*取代 RAG|RAG.*不是.*淘汰/);
  assert.match(article, /預印本|arXiv/);
  assert.match(article, /draft: false/);
  assert.match(article, /!\[[^\]]+\]\(\/images\/blog\/diagrams\/llm-wiki-vs-rag-lifecycle\.svg\)/);
  assert.match(article, /!\[[^\]]+\]\(\/images\/blog\/diagrams\/llm-wiki-hybrid-architecture\.svg\)/);
  assert.match(sourceNotes, /arXiv v2/);
  assert.match(sourceNotes, /存取日期/);
  assert.match(sourceNotes, /Microsoft.*branch/i);
  assert.match(sourceNotes, /Microsoft.*commit SHA/i);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `node --test tests/llm-wiki-article.test.mjs`

Expected: FAIL，原因是文章尚未建立或缺少必要章節。

- [ ] **Step 3: 完成文章後執行測試**

Run: `node --test tests/llm-wiki-article.test.mjs`

Expected: PASS，並另以 `access()` 驗證兩張 SVG 與 `docs/research/llm-wiki-source-notes.md` 存在；來源筆記需包含 `arXiv v2`、存取日期、Microsoft `branch` 與 `commit SHA`。

- [ ] **Step 4: Commit**

```bash
git add src/content/blog/llm-wiki-vs-rag.md tests/llm-wiki-article.test.mjs
git commit -m "feat: publish llm-wiki research article"
```

### Task 5: 最終驗證與發布準備

**Files:**
- Verify: `src/content/blog/llm-wiki-vs-rag.md`
- Verify: `public/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg`
- Verify: `public/images/blog/diagrams/llm-wiki-hybrid-architecture.svg`

- [ ] **Step 1: 執行全量測試**

Run: `node --test tests/*.test.mjs`

Expected: PASS，無失敗測試。

- [ ] **Step 2: 執行正式建置**

Run: `npm run build`

Expected: exit code 0，且產生 `/blog/llm-wiki-vs-rag/`。

- [ ] **Step 3: 檢查輸出與連結**

Run: `test -f dist/blog/llm-wiki-vs-rag/index.html && rg -n 'LLM-Wiki|RAG|arxiv.org' dist/blog/llm-wiki-vs-rag/index.html`

Expected: 文章、圖表與一級來源連結均存在。

- [ ] **Step 4: 人工內容審查**

核對術語、所有量化主張、圖表 alt text、繁體中文用語、可讀性與 mobile layout；確認未將預印本說成既定結論。

- [ ] **Step 5: Confirm the prior scoped commits are present**

Run: `git log --oneline -- docs/research/llm-wiki-source-notes.md src/content/blog/llm-wiki-vs-rag.md public/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg`

Expected: Task 1, Task 2 and Task 4 commits are present; only make an additional final commit if there are intentional unstaged review corrections.
