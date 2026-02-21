# Workflow: Release Site Changes

1. Confirm no secret values are committed.
2. Run `npm run build` and verify generated routes.
3. Check navigation and key pages (`/`, `/blog`, `/about`).
4. Deploy via Cloudflare Pages.
5. Record notable behavior changes in `openspec/specs/`.
