# SRE Brand Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the blog visual identity with a high-contrast SRE palette, responsive editorial layout, and local logo/favicon assets without changing routes, content collections, or deployment configuration.

**Architecture:** Keep the existing Astro page and component tree. Add local SVG brand assets under `public/images/`, configure them through the existing site config, and make surgical changes to global theme, header, homepage, and post-card styles. Tests verify that configuration points to real local assets and that the home page continues to use the existing blog collection.

**Tech Stack:** Astro 7, Tailwind CSS 4, Node built-in test runner, local SVG assets.

---

## Chunk 1: Brand assets and configuration

### Task 1: Add logo and favicon configuration

**Files:**
- Create: `public/images/allen-sre-mark.svg`
- Create: `public/images/favicon.svg`
- Modify: `src/config/config.json`
- Modify: `src/layouts/Base.astro`
- Test: `tests/brand-assets.test.mjs`

- [ ] **Step 1: Write the failing test**

Assert that site config references `/images/allen-sre-mark.svg` for both light and dark logos, `/images/favicon.svg` for the favicon, and that all three referenced assets exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/brand-assets.test.mjs`

Expected: FAIL because the asset configuration and SVG files do not exist.

- [ ] **Step 3: Add minimal production implementation**

Create one geometric, accessible SVG brand mark, reuse it as a standalone favicon, configure paths and header dimensions in `config.json`, and declare SVG favicon metadata in `Base.astro`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/brand-assets.test.mjs`

Expected: PASS.

## Chunk 2: Theme and layout refresh

### Task 2: Apply the SRE editorial design system without altering content flow

**Files:**
- Modify: `src/config/theme.json`
- Modify: `src/styles/base.css`
- Modify: `src/styles/navigation.css`
- Modify: `src/styles/buttons.css`
- Modify: `src/styles/components.css`
- Modify: `src/pages/index.astro`
- Test: `tests/brand-assets.test.mjs`

- [ ] **Step 1: Extend the failing test**

Assert that the homepage still loads posts through `getSinglePage("blog")`, retains the `home-post-grid` route-level layout hook, and declares the new `site-overview` section.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/brand-assets.test.mjs`

Expected: FAIL because `site-overview` does not exist.

- [ ] **Step 3: Add minimal production implementation**

Use graphite and teal semantic colors in both modes; refresh type hierarchy, focus states, header, buttons, homepage lead section, article grid, and card metadata. Keep the existing blog collection, routes, responsive behavior, and reduced-motion fallback intact.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/brand-assets.test.mjs`

Expected: PASS.

## Chunk 3: Verification

### Task 3: Verify architecture and static output

**Files:**
- Modify: `docs/superpowers/plans/2026-08-15-sre-brand-refresh.md`

- [ ] **Step 1: Run targeted tests**

Run: `node --test tests/brand-assets.test.mjs tests/site-branding-config.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run repository validation**

Run: `pnpm run check && pnpm run build`

Expected: both commands exit successfully and static pages are generated.

- [ ] **Step 3: Inspect generated output**

Verify the built homepage and a blog page contain the SVG favicon and logo paths, and that existing blog route output remains present.
