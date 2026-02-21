# Workflow: Publish a New AI/SRE Article

1. Define article scope and KPI target.
2. Draft article using `codait/prompts/new-post.md`.
3. Place markdown in `src/content/blog/`.
4. Update metadata (title, description, tags, category).
5. Run `npm run build`.
6. If structure/behavior changes, add/update spec in `openspec/specs/`.
7. Deploy with `npm run deploy:cf`.
