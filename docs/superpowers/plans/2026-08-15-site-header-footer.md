# Site Header and Footer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the GitHub call-to-action from the header and provide complete, accurate deployment information in the footer without Astroplate attribution.

**Architecture:** The active site shell uses `src/layouts/partials/Header.astro` and `src/layouts/partials/Footer.astro`, with header CTA and footer copyright sourced from `src/config/config.json`. Disable the CTA in configuration, then replace the footer metadata with a self-contained Astro and Cloudflare Pages statement.

**Tech Stack:** Astro 7, TypeScript, Tailwind CSS, Node.js assertions, Cloudflare Pages.

---

### Task 1: Define the requested configuration behavior

**Files:**
- Create: `tests/site-branding-config.test.mjs`
- Modify: `src/config/config.json:32-40`
- Modify: `src/layouts/Base.astro:50`

- [x] **Step 1: Write the failing test**

Assert that `navigation_button.enable` is `false`, the footer copyright does not mention Astroplate, and it states both Astro and Cloudflare Pages.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/site-branding-config.test.mjs`
Expected: FAIL because the GitHub navigation button is enabled and the copyright contains Astroplate.

- [x] **Step 3: Update configuration**

Disable the navigation button, replace its copyright value with a complete site-building statement, and replace the inherited Astroplate theme metadata with the site's identifier.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/site-branding-config.test.mjs`
Expected: PASS.

### Task 2: Verify generated site output

**Files:**
- Modify: `src/layouts/partials/Footer.astro:30-38`

- [x] **Step 1: Build the static site**

Run: `npm run build`
Expected: exit code 0 and generated HTML containing the updated footer statement.

- [x] **Step 2: Inspect rendered HTML**

Confirm that the footer contains the configured statement and does not contain the removed Astroplate attribution; confirm the header does not expose the GitHub CTA.
