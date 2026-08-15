import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const aboutPath = new URL('../src/content/about/-index.md', import.meta.url);

test('about profile presents technical experience without employer names', async () => {
  const about = await readFile(aboutPath, 'utf8');

  assert.match(about, /雲端平台|Cloud Platform/);
  assert.match(about, /基礎設施即程式碼|Infrastructure as Code/);
  assert.match(about, /可觀測性|Observability/);
  assert.match(about, /降低.*35%/);
  assert.match(about, /AI.*概念驗證|AI.*PoC/);
  assert.doesNotMatch(about, /KKCompany|KKBOX|螞蟻互動|愛幫您/);
});
