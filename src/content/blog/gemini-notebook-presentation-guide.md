---
title: "如何精準控制 Gemini Notebook 生成的簡報內容與版型"
meta_title: "NotebookLM 簡報：用 YAML 與大綱控制內容與版型"
description: "使用 YAML 定義視覺規格，搭配簡報大綱，降低 NotebookLM 生成簡報時的版面與內容落差。"
image: /images/blog/gemini-notebook-presentation-guide-cover.png
date: 2026-08-11T00:00:00.000Z
author: Allen Shi
categories:
  - AI 自動化
tags:
  - NotebookLM
  - Gemini
  - YAML
  - 簡報
draft: false
---

當我們請 AI 生成簡報時，最常遇到的問題不是內容不足，而是結果像在抽盲盒。只給「現代感」、「專業風」或「科技感」這類形容詞，AI 仍得自行猜測版面、字體與視覺元素，最後很容易出現擁擠、花俏，或缺乏一致性的投影片。

解法是把內容與風格拆開處理：先固定簡報大綱，再用 YAML 把配色、排版與每頁結構寫成可重複套用的規格。這篇文章會帶你完成這套流程，並說明生成後仍該人工檢查的地方。

<aside class="notebooklm-callout" aria-label="閱讀重點">
  <h2 id="article-workflow" class="notebooklm-callout__title">
    這篇文章的核心流程 <a class="notebooklm-anchor" href="#article-workflow" aria-label="連結至這篇文章的核心流程">#</a>
  </h2>
  <ol>
    <li><a href="#presentation-outline">整理可確認的簡報大綱。</a></li>
    <li><a href="#yaml-specification">用 YAML 定義全域視覺規格與每頁版型。</a></li>
    <li><a href="#generate-presentation">只選取大綱與 YAML 兩個來源後生成。</a></li>
    <li><a href="#review-presentation">逐頁檢查內容正確性、版面與品牌一致性。</a></li>
  </ol>
</aside>

YAML 是給人看得懂的結構化格式；在這裡，它扮演「視覺規格書」。你不必逐字照抄範例，但縮排與層級需要維持正確。

---

## 視覺概念：設計即程式碼 (Design as Code)

將視覺設計轉為結構化規格，能讓 AI 每次都依相同的規則執行。大綱負責內容的邏輯與順序；YAML 負責色彩、字體、留白和版面。兩者分開，後續修改才不會牽一髮動全身。

---

<h2 id="yaml-specification">一、如何設定全域的設計風格、文字與排版</h2>

### 1. 為什麼是 YAML？
**YAML**（YAML Ain't Markup Language，遞迴縮寫意為「YAML 不是標記語言」）是一種非常直觀、給人看得懂的資料格式。它不需要像 JSON 那樣寫滿各種大括號或雙引號，僅透過 **「縮排」** 與 **「清單（-）」** 就能把層級關係交代得一清二楚。

在 NotebookLM 與 Gemini Notebook 中，YAML 的核心價值在於：把主觀的視覺需求改寫成具體、可檢查的指示。AI 仍可能誤解規格，因此把它視為提高一致性的約束，而不是保證輸出的魔法指令。

### 2. 全域設計風格的四個控制維度
一份能完美約束 AI 的 YAML 點菜單，主要由以下四個核心參數組成：

*   **全域配色 (color_palette)：**
    不要跟 AI 說「深藍色」或「黃色」，那會帶來巨大的色差。我們應該直接給予精確的**十六進位色碼（Hex Code）**。此外，可以進一步描述「材質與紋理」（如磨砂玻璃、未打磨混凝土、絲滑金屬），讓 AI 模擬出光影深度。
*   **字體排版系統 (typography)：**
    字體能定調簡報的語氣。例如：標題用粗黑無襯線體（Sans-serif Bold）展現商務的俐落感；內文用高易讀性黑體並限制行高；甚至能因應主題設定像素字體（Pixel Font）或手寫感字體。
*   **視覺風格與場景描述 (design_system / layout_rules)：**
    這是最關鍵的「場景描述」。與其說「要有科技感」，不如寫出具體的畫面比喻。如：「乾淨的數位儀表板，所有資訊整齊懸浮在柔和的灰色背景上」，並定調構圖邏輯（如網格對齊、等距視角、黃金比例、呼吸留白等）。
*   **設計法律：輸出限制與禁止清單 (output_constraints)：**
    AI 常常會忍不住往畫面中亂塞元素。你必須明文畫出紅線，列出「禁止項目」（如：禁止發光的霓虹電路板、禁止賽博龐克風格、禁止擁擠排版、禁止 3D 複雜背景、不使用真實人物照片等）。

### 3. 實用全域 YAML 範例：高階顧問風 (Corporate Navy & Gold)
將以下內容儲存成獨立檔案，例如 Style_Consultant.yaml，再上傳至 NotebookLM 作為來源檔案。

<div class="notebooklm-yaml-example">
  <p class="notebooklm-yaml-example__title">簡報設計規範</p>
  <pre aria-label="全域 YAML 設計規範"><code class="language-yaml">global_design:
  atmosphere: "專業、俐落、高數據密度"
  
  color_scheme:
    background: "#FFFFFF"       # 絕對純白，確保列印與閱讀的最高清晰度
    primary_text: "#333333"     # 深炭灰，比純黑更舒適，用於所有內文
    corporate_navy: "#002060"   # 權威深藍，用於行動標題與主要數據圖表
    insight_gold: "#FFAB00"     # 強調金，少量使用，僅用於標示關鍵數據與洞察
    border_light: "#E1E4E8"     # 細線灰，用於分隔線與區塊線條
  
  typography:
    heading: "Arial / Noto Sans TC, Bold, 全部靠左對齊"
    body: "Inter / Noto Sans TC, Regular, 行高1.5倍, 易於閱讀"
    data: "Monospaced (等寬字體), 呈現精確的數據分析感"
  
  layout_rules:
    navigation: "左上角放置章節小標, 右下角顯示'頁碼/總頁數'"
    layout_design:
      - "採用網格系統 (Grid System)，所有元素嚴格靠左對齊，保持呼吸留白空間"
      - "禁止使用任何複雜的 3D 背景、漸層、或是過多裝飾性幾何"
    decorative_elements: "僅使用 1px 的細灰線進行模組化分隔，拒絕多餘點綴"

output_constraints:
  visual_style:
    - forbidden: "卡通插畫、發光霓虹、賽博龐克、真實情感人物照片"
    - forbidden: "任何陰影 (Drop Shadow) 或 立體特效"
  content_logic:
    - forbidden: "置中對齊的長篇文字，專業商務文件永遠左對齊，保持高資訊密度"
</code></pre>
</div>

---

## 二、 如何用 YAML 控制每頁的結構

除了全域的風格約束，我們還能進一步在 YAML 檔案中編寫**「簡報頁面規劃 (Presentation Map)」**，這就像是簡報的**施工圖紙**，精準告訴 AI 每一頁具體要用什麼版型、畫面如何構成。

我們可以在 YAML 的下半部分加入 slides 區塊，針對每一頁投影片進行細緻設計：

<div class="notebooklm-yaml-example">
  <p class="notebooklm-yaml-example__title">簡報頁面規劃</p>
  <pre aria-label="投影片 YAML 規劃"><code class="language-yaml">slides:
  p1:
    type: "封面"
    layout_style: "滿版視覺分割"
    visual_description: "左側 40% 為滿版權威深藍色區塊，置中放巨大白色標題；右側 60% 為純白背景，疊加極細幾何線條，營造高階商業感。"
    content:
      title: "大綱與 YAML 驅動簡報指南"
      subtitle: "徹底消除 AI 味的極致工作流"

  p2:
    type: "引言頁"
    layout_style: "中央聚焦式"
    visual_description: "純白背景，畫面中央放置一個精緻的細灰框卡片，框內為核心引言，右下角放置發言人姓名。畫面周圍留白超過 50%。"
    content:
      title: "核心理念"
      generation_prompt: "根據來源文檔的開頭，生成一句話（約 20 至 30 字）的核心引言，強調內容與風格拆開的核心價值，語氣具有啟發性。"

  p3:
    type: "內容與數據頁"
    layout_style: "左右二分欄圖文排版"
    visual_description: "左側 50% 為深灰色文字區，標題與條列重點嚴格靠左對齊；右側 50% 放置高對比的數據視覺化區塊，並使用強調金 (#FFAB00) 作為數據亮點。"
    content:
      title: "數據與趨勢分析"
      generation_prompt: "分析來源文檔中的核心數據，以極簡的條列式列出 3 個核心發現。每點不超過 15 字，數據部分必須加粗呈現。"
</code></pre>
</div>

### 控制每頁結構的好處
1.  **版面不跑偏：** AI 不會隨機決定要把字放中間還是放旁邊，而是完全遵循你所設計的 layout_style（如左右分割、三欄式、中央聚焦）。
2.  **內容與視覺完美對齊：** 透過 generation_prompt 指令，AI 會在抓取原始資料內容時，自動將其塞入指定的排版容器中。
3.  **高度可重複使用：** 下次要做新簡報，內容換掉，這份 YAML 頁面施工圖完全不用改，直接套用就能一鍵產出相同格式的新簡報。

---

## 三、 如何建立大綱後再來產生簡報

這套工作流的重點是先建立邏輯嚴密的「骨架」，再套上 YAML 定義的「視覺規格」。內容先定稿，設計才有穩定的依據。

以下是完整的四個實戰步驟：

### 步驟一：善用提問深度萃取內容
不要直接把幾萬字的原始資料丟給 AI 叫它「做簡報」。
1. 先將原始資料、網頁連結或 PDF 檔案上傳至 NotebookLM。
2. 透過內建的提問功能，進行深入的 **Deep Research** 與探究，將覺得有價值、邏輯清晰的回答儲存為「記事」。
3. 這樣可以確保簡報的內容是經過提煉、最貼近你真實意圖的精華。

<h3 id="presentation-outline">步驟二：生成並固定「簡報大綱（骨架）」</h3>
當內容滿意後，我們需要將其標準化，打造不變的「骨架」。
1. 下達以下提示詞，請 AI 將內容整理成層級分明、毫無視覺干擾的純文本文檔：
   > **「請分析這份簡報內容，用層級分明的條列式，整理出每頁的標題與內文。請完整複製所有文字，不要做任何刪減或添加。」**
2. 將 AI 整理好的內容進行微調後，複製並儲存為一個獨立的文字檔，命名為 **00_簡報大綱.txt**（或 00_簡報大綱.md）。
3. **關鍵：將此大綱檔案上傳為 NotebookLM 的全新來源。** 這樣做能繞過單次對話字數限制，並能極度嚴格地限制 AI「不要即興發揮」，牢牢鎖定簡報的邏輯與頁數。

### 步驟三：寫出風格「視覺皮膚（YAML 檔案）」
1. 依照第一、二部分所學，將你期望的視覺風格（可以去 Pinterest 等平台尋找靈感並請 AI 轉寫為參數）整理成 YAML 格式。
2. 存檔命名為 **風格_高階顧問.yaml**，並同樣上傳為 NotebookLM 的來源。

<h3 id="generate-presentation">步驟四：雙軌融合生成簡報</h3>
現在，你的 NotebookLM 中同時擁有這兩份經過淬煉的檔案。
1. **關鍵動作：在來源列表中，取消勾選其他所有雜亂的原始文檔，僅勾選 00_簡報大綱.txt 與 風格_高階顧問.yaml 這兩份檔案。**
2. 在對話框中輸入以下**「大師級編譯提示詞 (Compiler Prompt)」**：
   > **「你現在是一位專業的簡報設計師。請針對來源檔案『00_簡報大綱』進行內容轉化，並產出投影片規劃。**
   > 
   > **請務必遵守以下三大原則：**
   > 1. **結構一致性：投影片的總頁數、每一頁的標題與內容重點，必須依據『00_簡報大綱』生成，但形式不一定局限於條列式。**
   > 2. **內容封閉性：僅處理檔案內的資訊，不要為了讓內容看起來豐富而自行添加外部資料或分析。**
   > 3. **風格一致性：在規劃每一頁的視覺呈現與排版邏輯時，必須全程套用『風格＿高階顧問』的美學框架。」**

---

<h2 id="review-presentation">四、終極後製與進階技巧</h2>

完成上述流程後，你會得到一份可供審閱的簡報草稿。請逐頁確認資料、數字、專有名詞與版面是否正確；AI 生成內容不能取代事實查核與設計審稿。接著可視需要使用以下技巧後製。

### 1. 解決投影片無法編輯的痛點（文字後製）
NotebookLM 所產出的簡報，在底層技術上本質上是**「純圖片（PDF 頁面）」**，無法像一般 PPT 檔直接點擊編輯文字。若需要微調文字，可以使用以下 AI 「圖轉文」後製工具：
*   **Canva - Magic Grab (魔法抓取)：** 能夠一鍵選取並拖動圖片中的文字元素，操作極度直觀。
*   **Lovart - Edit Elements：** 能將 PDF 圖片深度解析為可編輯的「文字層」、「前景」與「背景」，文字可直接在畫面上重新打字修改（需注意簡繁轉換與 OCR 準確度）。

### 2. 繞過 30 頁生成上限的「分批生成術 (Batch Generation)」
若你的專案大綱非常長，超出了 NotebookLM 單次 30 頁的上限：
1. **拆分大綱：** 將 00_簡報大綱.txt 拆分為 Part_1.txt 與 Part_2.txt。
2. **第一輪生成：** 僅勾選 Part_1.txt 與風格 YAML，生成簡報前半部分並下載。
3. **第二輪生成：** 取消勾選 Part 1，改勾選 Part_2.txt 與風格 YAML，生成後半部分並下載。
4. **合併 PDF：** 使用 PDF 合併工具將兩份成品合而為一，完美保持前後視覺的一致。

---

## 結語

使用 **YAML 規範**搭配**大綱驅動**，就像是賦予了 AI 一套「設計說明書」與「施工圖」。我們不再隨機抽盲盒，而是成為精準掌控全局的簡報總指揮。

現在就打開你的 Gemini Notebook，告別 AI 醜簡報，打造令人驚艷的專業演示吧！
