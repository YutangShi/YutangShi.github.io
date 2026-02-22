# Allen 技術微光部落格

以 Astro 建置的個人技術部落格，主題聚焦在 AI 自動化、SRE、雲端平台與可觀測性。

## 本地開發

```bash
npm install
npm run dev
```

## 建置與預覽

```bash
npm run build
npm run preview
```

## 部署到 Cloudflare Pages

### 方式 1: Cloudflare 控制台（推薦）

1. 將此 repo 連接到 Cloudflare Pages。
2. Build command 設為 `npm run build`。
3. Build output directory 設為 `dist`。
4. Node.js 版本建議 20+。

### 方式 2: Wrangler CLI

```bash
# 第一次建立專案（只需一次）
wrangler pages project create allen-ai-sre-blog --production-branch main

# 設定 API Token（CI 或非互動環境必須）
export CLOUDFLARE_API_TOKEN=your_token
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# 建置並部署
npm run deploy:cf
```

> `wrangler.toml` 已設定 `pages_build_output_dir = "./dist"`。

## AI 協作設定

- 代理規範：`AGENTS.md`
- Codait 設定：`codait/`
- OpenSpec 規格：`openspec/`

### 使用順序（建議）

1. 先讀 `AGENTS.md`，確認本專案 AI 協作與交付規範。
2. 在 `codait/config.toml` 套用品質與守則。
3. 依任務選 `codait/agents.yaml` 的角色。
4. 套用 `codait/prompts/` 與 `codait/workflows/`。
5. 若有行為改動，新增或更新 `openspec/specs/*.md`。

## GA 與文章 SEO

### Google Analytics（GA4）

在部署環境設定以下任一方式即可啟用：

- `PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`（推薦）
- 或在 `src/utils/config.ts` 的 `analytics.gaMeasurementId` 填入 ID

### Google Tag Manager（GTM）

- `PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX`（推薦）
- 或在 `src/utils/config.ts` 的 `analytics.gtmContainerId` 填入容器 ID
- 若啟用 GTM，專案會自動停用直接 `gtag.js` 注入，避免 GA 重複計數

### 每篇文章 SEO 關鍵字

- 文章 frontmatter 支援 `seoKeywords`（可選）
- 若未提供 `seoKeywords`，系統會自動使用 `tags` 作為 keywords meta

### 可重複使用的 SEO/GA Prompt

- `codait/prompts/article-seo-keyword-generator.md`
- `codait/prompts/ga-seo-optimization-runbook.md`

## 內容維護

- 新增文章：`src/content/blog/*.md`
- 更新站點資訊：`src/utils/config.ts`
- 調整首頁/列表樣式：`src/pages/index.astro`、`src/pages/blog/index.astro`
