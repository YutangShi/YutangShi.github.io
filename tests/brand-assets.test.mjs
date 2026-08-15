import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const configPath = new URL("../src/config/config.json", import.meta.url);
const baseLayoutPath = new URL("../src/layouts/Base.astro", import.meta.url);
const componentsStylesPath = new URL("../src/styles/components.css", import.meta.url);
const homePagePath = new URL("../src/pages/index.astro", import.meta.url);
const publicDirectory = new URL("../public/", import.meta.url);

async function readSiteConfig() {
  return JSON.parse(await readFile(configPath, "utf8"));
}

test("site configuration uses the local Allen SRE SVG brand assets", async () => {
  const config = await readSiteConfig();

  assert.equal(config.site.logo, "/images/allen-sre-mark.svg");
  assert.equal(config.site.logo_darkmode, "/images/allen-sre-mark.svg");
  assert.equal(config.site.favicon, "/images/favicon.svg");

  await Promise.all(
    [config.site.logo, config.site.logo_darkmode, config.site.favicon].map(
      (assetPath) => access(new URL(assetPath.slice(1), publicDirectory)),
    ),
  );
});

test("base layout declares the configured favicon as an SVG", async () => {
  const baseLayout = await readFile(baseLayoutPath, "utf8");

  assert.match(
    baseLayout,
    /<link rel="icon" type="image\/svg\+xml" href=\{config\.site\.favicon\} \/>/,
  );
});

test("navigation logo presents the Allen 科技觀察 blog name", async () => {
  const [config, logo] = await Promise.all([
    readSiteConfig(),
    readFile(
      new URL("../src/layouts/components/Logo.astro", import.meta.url),
      "utf8",
    ),
  ]);

  assert.equal(config.site.logo_text, "Allen 科技觀察");
  assert.match(logo, /class="navbar-brand-label"/);
  assert.match(logo, /\{brandName\}/);
});

test("homepage preserves the blog collection and editorial layout hooks", async () => {
  const homepage = await readFile(homePagePath, "utf8");

  assert.match(homepage, /getSinglePage\("blog"\)/);
  assert.match(homepage, /class="home-post-grid"/);
  assert.match(homepage, /class="site-overview"/);
});

test("homepage has one primary heading and semantic theme colors", async () => {
  const [homepage, baseLayout] = await Promise.all([
    readFile(homePagePath, "utf8"),
    readFile(baseLayoutPath, "utf8"),
  ]);

  assert.equal((homepage.match(/<h1\b/g) ?? []).length, 1);
  assert.match(
    baseLayout,
    /media="\(prefers-color-scheme: light\)"\s+content="#F8FAFC"/,
  );
  assert.match(
    baseLayout,
    /media="\(prefers-color-scheme: dark\)"\s+content="#111827"/,
  );
});

test("homepage article heading keeps its editorial h2 styling", async () => {
  const componentsStyles = await readFile(componentsStylesPath, "utf8");

  assert.match(componentsStyles, /\.home-articles-heading h2\s*\{/);
});
