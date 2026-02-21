# Prompt: GA + SEO Optimization Runbook

## Objective
Use GA4 page performance and search behavior to improve article SEO iteratively.

## Inputs
- GA4 metrics export (page path, sessions, engagement rate, avg engagement time)
- Search query data (from GSC if available)
- Current article frontmatter (`title`, `description`, `tags`, `seoKeywords`)

## Prompt
```text
你是內容增長分析師，請根據 GA4 與 SEO 資料，為技術部落格提出文章優化建議。

輸入：
- 成效資料：{ga4_metrics}
- 搜尋資料：{search_queries}
- 文章清單與 metadata：{articles_metadata}

請輸出 Markdown 表格，欄位包含：
1. article_path
2. issue_type（曝光低 / 點擊低 / 停留短 / 跳出高）
3. root_cause_hypothesis
4. title_change_suggestion
5. meta_description_suggestion
6. seo_keywords_update（5-10 個）
7. content_update_actions（3 條）
8. expected_metric_impact

規則：
- 每篇文章至少給 1 個可執行更新項目。
- 不提供抽象建議，需可直接修改到 frontmatter 或段落。
- 優先優化高流量但低互動頁。
```

## Iteration Cadence
- Weekly: refresh top 20 article suggestions
- Monthly: rewrite low-performing titles/descriptions
- Quarterly: restructure learning-path articles based on engagement depth
