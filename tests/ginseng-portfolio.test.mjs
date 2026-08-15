import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const portfolioPath = new URL('../src/data/portfolio.ts', import.meta.url);
const imagePath = new URL('../public/images/portfolio/ginseng-store.png', import.meta.url);

test('portfolio includes the Ginseng official store case', async () => {
  const portfolio = await readFile(portfolioPath, 'utf8');

  assert.match(portfolio, /slug: "ginseng-official-store"/);
  assert.match(portfolio, /title: "金蔘官方購物網站"/);
  assert.match(portfolio, /website: "https:\/\/www\.ginseng\.com\.tw\/"/);
  assert.match(portfolio, /image: "\/images\/portfolio\/ginseng-store\.png"/);
  await access(imagePath);
});
