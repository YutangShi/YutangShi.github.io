import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const configPath = new URL('../src/config/config.json', import.meta.url);

test('blog listings show six posts before pagination', async () => {
  const config = JSON.parse(await readFile(configPath, 'utf8'));

  assert.equal(config.settings.pagination, 6);
});
