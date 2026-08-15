import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../src/pages/contact.astro', import.meta.url);
const contentPath = new URL('../src/content/contact/-index.md', import.meta.url);
const menuPath = new URL('../src/config/menu.json', import.meta.url);
const headerPath = new URL('../src/components/Header.astro', import.meta.url);
const aboutPath = new URL('../src/content/about/-index.md', import.meta.url);
const contentConfigPath = new URL('../src/content.config.ts', import.meta.url);

test('removes the contact page and its internal entry points', async () => {
  await assert.rejects(access(pagePath));
  await assert.rejects(access(contentPath));

  const [menu, header, about, contentConfig] = await Promise.all([
    readFile(menuPath, 'utf8'),
    readFile(headerPath, 'utf8'),
    readFile(aboutPath, 'utf8'),
    readFile(contentConfigPath, 'utf8'),
  ]);

  assert.doesNotMatch(menu, /"url"\s*:\s*"\/contact"/);
  assert.doesNotMatch(header, /href="\/contact"/);
  assert.doesNotMatch(about, /\]\(\/contact\)/);
  assert.doesNotMatch(contentConfig, /contactCollection|contact:\s*contactCollection/);
});
