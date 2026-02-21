---
title: "AI學習地圖 05：內容與設計應用（圖像生成與素材草稿）"
description: "把 AI 用在行銷內容與視覺草稿：先定義品牌語氣，再產生多版本素材，最後人工審核。"
publishDate: 2026-02-21
heroImage: "/images/blog/diagrams/ai-text-to-image-image-to-image-map.svg"
category: "AI"
tags: ["AI學習地圖", "內容生成", "圖像設計", "行銷"]
seoKeywords: ["AI學習地圖", "內容生成", "圖像設計", "行銷", "ChatGPT Image", "Nano Banana", "文字生圖", "圖生圖"]
draft: false
featured: false
author: "Allen Shi"
readingTime: 8
---

這篇重點只做一件事：  
**讓你真的會用 AI 做「文字生圖（Text-to-Image）」和「圖生圖（Image-to-Image）」。**

![AI 文字生圖與圖生圖流程圖](/images/blog/diagrams/ai-text-to-image-image-to-image-map.svg)

我先根據官方文件（OpenAI、Midjourney、Adobe Firefly）整理後，再把流程改成新手可直接跟著做的版本。

## 你看完會得到什麼

- 你會懂：文字生圖與圖生圖的差異  
- 你會做：一個完整「草圖 -> 精修 -> 上架」流程  
- 你會有：可直接複製的 Prompt 模板（含文字生圖/圖生圖）

## 先懂的名詞（每個 2 句內）

1. 文字生圖（Text-to-Image）：只靠文字描述生成圖片。適合探索創意方向和快速出草圖。  
2. 圖生圖（Image-to-Image）：先給一張原圖，再讓模型做風格或細節變化。適合做一致性與精修。  
3. Prompt：你給模型的需求規格。越清楚描述主體、場景、風格、構圖，結果越穩定。  
4. 參考圖：你希望模型「靠近」的視覺方向。它能降低風格飄移。  
5. 品牌一致性：顏色、排版、人物風格要能連續。這是商業素材最重要的驗收點。

## 文字生圖怎麼做（新手版）

### 步驟

1. 先定義用途：社群貼文、Banner、簡報封面  
2. 寫 1 段主 Prompt：主體 + 場景 + 風格 + 光線 + 構圖  
3. 一次產 4 張版本，先選方向再微調  
4. 只改 1 到 2 個參數重跑（不要一次改太多）

### 可直接複製的文字生圖 Prompt

```text
任務：產生一張「AI 學習地圖」社群主視覺。
主體：一杯咖啡、科技感線條、學習路徑節點。
場景：明亮白底、清楚分區、資訊圖表風格。
風格：乾淨、現代、可讀性高，不要過度花俏。
構圖：16:9，主標題置中，三個步驟區塊由左到右排列。
色彩：淺藍 + 暖橘，符合品牌調性。

輸出：
1) 4 張不同構圖版本
2) 每張附一句設計說明
3) 保留可放文字的留白區域

限制：
- 不要雜訊背景
- 不要不可讀的小字
- 不要使用侵權商標與名人肖像
```

## 圖生圖怎麼做（精修版）

### 什麼時候該用圖生圖

- 你已經有一張方向正確的圖，只想改色調/材質/背景  
- 你要保持角色或構圖一致，但換不同版位  
- 你要做 A/B 版本，但不想整張重來

### 可直接複製的圖生圖 Prompt

```text
任務：基於這張原圖做圖生圖精修。
保留：主體位置、主標題區塊、整體構圖比例。
調整：
1) 背景改成更乾淨的淺色漸層
2) 咖啡杯外框更清晰
3) 科技線條密度降低 20%，避免雜亂
4) 留出右下角 CTA 區塊

輸出：
- 3 個版本（保守版 / 平衡版 / 高對比版）
- 16:9 與 1:1 各一組
```

## 工具建議（你可以直接用）

1. ChatGPT Image：適合從文字快速出概念圖，並做多輪對話調整。  
2. Gemini（Nano Banana）：適合用範例庫快速找靈感，再複製 prompt 實作。  

Nano Banana 參考頁：  
https://nanobanana-prompt.manus.space/

## 可直接複製的範例 Prompt（給使用者貼上就能跑）

### 範例 1：極簡咖啡廳（文字生圖）

```text
Minimalist coffee shop interior, white walls, light wood furniture, large windows with natural sunlight, potted plants, clean lines, architectural photography, bright and airy, 16:9, high resolution
```

![範例結果 A：極簡咖啡廳](/images/blog/examples/text-to-image-minimal-coffee.svg)

### 範例 2：未來城市夜景（文字生圖）

```text
Futuristic cyberpunk city street at night, neon lights, rain reflections on wet pavement, towering skyscrapers with holographic advertisements, cinematic lighting, highly detailed, photorealistic, 8k
```

![範例結果 B：未來城市夜景](/images/blog/examples/text-to-image-future-city.svg)

### 範例 3：產品海報（文字生圖，商業用途）

```text
Professional product hero shot of a premium coffee cup on a clean studio background, soft rim lighting, subtle steam, elegant composition, ample negative space for headline text, commercial advertising style, 4k
```

### 範例 4：圖生圖精修（把原圖改成品牌視覺）

```text
Use the uploaded image as base composition. Keep the cup position and overall layout. Change background to a bright blue gradient, simplify distracting details, improve edge sharpness, add a clean empty area on the right for CTA text, maintain premium and modern style.
```

![範例結果 C：圖生圖精修後海報](/images/blog/examples/image-to-image-product-poster.svg)

### 範例 5：社群貼文三版輸出（一次拿 A/B/C）

```text
Create 3 variants of the same campaign visual for social media:
Variant A: clean and minimalist
Variant B: energetic and colorful
Variant C: premium and cinematic
Keep the same product and composition, only change mood and lighting. Output in 1:1 and 9:16.
```

## 新手最常踩坑（以及怎麼避開）

1. 一次塞太多需求  
先把「主體、場景、風格」三件事寫清楚，再加細節。

2. 看到可用版本就直接上線  
至少做一次圖生圖精修，讓品牌一致性上來。

3. 沒有版權與合規檢查  
商業素材上線前，一定要做人工複核（商標、人物、文字聲明）。

## 7 天開始計畫（每天 30 分鐘）

1. Day1：先做 10 個關鍵字詞庫（風格、光線、構圖）  
2. Day2：同題目跑 4 張文字生圖  
3. Day3：挑 1 張做圖生圖精修  
4. Day4：做 16:9 / 1:1 / 9:16 三版  
5. Day5：加上品牌色與字體規範  
6. Day6：找 3 個同事做可讀性檢查  
7. Day7：沉澱成可重複模板

## 下一步學習建議（3 條）

1. 先固定一個主題，連續做 7 天，建立你的圖像 Prompt 模板。  
2. 每次都保留「原圖 + 精修圖 + 上線圖」三版本，方便回顧。  
3. 要自動化時，再把流程接到 n8n（提交需求 -> 生成草圖 -> 人工審核）。
