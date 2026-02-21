# AGENTS.md

This file defines how AI agents should work in this repository.

## Project Scope
- Project: Allen AI Automation SRE Blog
- Stack: Astro 5, static site output
- Primary language: Traditional Chinese content with technical English terms
- Deployment target: Cloudflare Pages

## Goals For AI Agents
- Keep the blog focused on AI automation, SRE, observability, and platform engineering.
- Prefer practical, reproducible content over high-level theory.
- Preserve SEO quality, accessibility, and mobile responsiveness.

## Repository Map
- `src/pages/`: route pages
- `src/content/blog/`: markdown blog posts
- `src/layouts/`, `src/components/`: site UI building blocks
- `src/utils/config.ts`: site metadata and navigation
- `codait/`: AI operation rules, workflows, and prompt assets
- `openspec/`: change specs and decision records

## Working Rules
- Do not delete existing user content unless explicitly requested.
- Keep URLs stable for existing blog posts.
- Use clear commit scopes and explain user-facing impact.
- Validate changes with `npm run build` before handoff.

## Content Rules
- New AI/SRE articles should include:
  - problem statement
  - architecture or workflow
  - implementation steps
  - failure modes and rollback plan
  - measurable outcome or KPI
- Prefer examples that can run in real production environments.

## UI/UX Rules
- Maintain high contrast and visible focus states.
- Respect `prefers-reduced-motion`.
- Keep touch targets at least 44px where interactive.

## Deployment Rules
- Build command: `npm run build`
- Output directory: `dist`
- Cloudflare deploy command: `npm run deploy:cf`
- Required env in non-interactive environment:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

## Handoff Checklist
- [ ] Build passes locally.
- [ ] No broken internal links.
- [ ] Metadata (`title`, `description`, OG) updated if needed.
- [ ] Spec changes documented under `openspec/specs/` when behavior changes.
