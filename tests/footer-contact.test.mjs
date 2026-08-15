import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const footerPath = new URL('../src/layouts/partials/Footer.astro', import.meta.url);

test('footer shows only the supplied contact details', async () => {
  const footer = await readFile(footerPath, 'utf8');

  assert.match(footer, /電子郵件/);
  assert.match(footer, /yutangshi@gmail\.com/);
  assert.match(footer, /LINE ID/);
  assert.match(footer, /yutang-shi/);
  assert.doesNotMatch(footer, /Logo|Social|config\.params\.copyright|footer\.map/);
});
