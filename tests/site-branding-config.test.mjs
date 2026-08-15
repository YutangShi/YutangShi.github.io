import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const config = JSON.parse(
  await readFile(new URL("../src/config/config.json", import.meta.url), "utf8"),
);

test("site shell hides the GitHub navigation button", () => {
  assert.equal(config.navigation_button.enable, false);
});

test("footer identifies the production framework and hosting without Astroplate attribution", () => {
  const copyright = config.params.copyright;

  assert.doesNotMatch(copyright, /Astroplate/i);
  assert.match(copyright, /Astro/i);
  assert.match(copyright, /Tailwind CSS/i);
  assert.match(copyright, /靜態網站/i);
  assert.match(copyright, /Cloudflare Pages/i);
});

test("site metadata uses the blog identifier instead of the Astroplate template name", async () => {
  const baseLayout = await readFile(
    new URL("../src/layouts/Base.astro", import.meta.url),
    "utf8",
  );

  assert.match(baseLayout, /name="theme-name" content="allen-ai-sre-blog"/);
  assert.doesNotMatch(baseLayout, /content="astroplate"/i);
});

test("NotebookLM presentation guide declares a local cover image", async () => {
  const post = await readFile(
    new URL(
      "../src/content/blog/gemini-notebook-presentation-guide.md",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    post,
    /^image: \/images\/blog\/gemini-notebook-presentation-guide-cover\.png$/m,
  );
});

test("NotebookLM YAML example forces every syntax token to white in light mode", async () => {
  const componentStyles = await readFile(
    new URL("../src/styles/components.css", import.meta.url),
    "utf8",
  );

  assert.match(
    componentStyles,
    /\.content \.notebooklm-yaml-example code \*\s*\{[^}]*color:\s*#fff !important;/s,
  );
});

test("the production domain exposes a root sitemap.xml index", async () => {
  const robots = await readFile(
    new URL("../public/robots.txt", import.meta.url),
    "utf8",
  );
  const sitemap = await readFile(
    new URL("../public/sitemap.xml", import.meta.url),
    "utf8",
  );

  assert.match(
    robots,
    /^Sitemap: https:\/\/allen-life\.dev\/sitemap\.xml$/m,
  );
  assert.equal(config.site.base_url, "https://allen-life.dev");
  assert.match(sitemap, /<sitemapindex[^>]*>/);
  assert.match(sitemap, /<loc>https:\/\/allen-life\.dev\/sitemap-0\.xml<\/loc>/);
});
