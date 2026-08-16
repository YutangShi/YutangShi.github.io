import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentsStylePath = new URL('../src/styles/components.css', import.meta.url);

test('content code blocks use white text on their dark background', async () => {
  const componentsStyle = await readFile(componentsStylePath, 'utf8');

  assert.match(
    componentsStyle,
    /\.content pre code,\n\.content pre code \* \{\n  color: #fff !important;/,
  );
});
