# Prompt: Article SEO Keyword Generator (zh-TW)

## Objective
Generate high-intent SEO keywords and metadata for one blog article.

## Inputs
- Article title
- Article description
- Article draft/body
- Target audience
- Primary category (`AI` | `自動化` | `SRE` | `N8N`)

## Prompt
```text
你是 SEO 編輯，請為以下技術文章產生可實作的 SEO 設定。

輸入資料：
- 標題：{title}
- 摘要：{description}
- 分類：{category}
- 目標受眾：{audience}
- 內文：{article_body}

請輸出 JSON，格式如下：
{
  "seo_title": "不超過 60 字元，保留主關鍵詞",
  "meta_description": "120-155 字元，說清楚文章價值",
  "focus_keyword": "1 個主關鍵詞",
  "secondary_keywords": ["4-8 個次關鍵詞"],
  "long_tail_keywords": ["3-6 個長尾關鍵詞"],
  "slug_suggestion": "英文小寫-kebab-case",
  "faq_keywords": ["3-5 個可做 FAQ 的問題詞"]
}

規則：
1) 關鍵詞需符合文章內容，不可憑空捏造。
2) 避免過度重複同義詞。
3) 優先使用繁體中文搜尋習慣詞。
4) 關鍵詞需包含可執行或可學習導向，例如「教學」「實作」「範例」。
```

## Post-process Mapping
- `focus_keyword + secondary_keywords` => frontmatter `seoKeywords`
- `meta_description` => frontmatter `description` (if better than existing)
- `slug_suggestion` => new article filename when creating new posts
