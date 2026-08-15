import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const articlePath = new URL('../src/content/blog/llm-wiki-vs-rag.md', import.meta.url);
const imagePath = new URL('../public/images/blog/llm-wiki-knowledge-workflow.png', import.meta.url);
const componentsStylePath = new URL('../src/styles/components.css', import.meta.url);

test('LLM Wiki article accurately focuses on Karpathy workflow and knowledge-management trade-offs', async () => {
  const article = await readFile(articlePath, 'utf8');
  const componentsStyle = await readFile(componentsStylePath, 'utf8');

  await access(imagePath);
  assert.match(article, /Karpathy LLM Wiki 是什麼/);
  assert.match(article, /## LLM Wiki 的核心：把整理工作變成持續編譯/);
  assert.match(article, /## 與卡片盒筆記法的真正差異：主題頁與原子卡片/);
  assert.match(article, /## 常見失敗模式與修正方式/);
  assert.match(article, /yu-wenhao\.com\/zh-TW\/blog\/karpathy-zettelkasten-comparison/);
  assert.match(article, /raw\//);
  assert.match(article, /wiki\//);
  assert.match(article, /image: \/images\/blog\/llm-wiki-knowledge-workflow\.png/);
  assert.match(article, /!\[[^\]]+\]\(\/images\/blog\/llm-wiki-knowledge-workflow\.png\)/);
  assert.match(article, /draft: false/);
  assert.doesNotMatch(article, /\bSRE\b/i);
  assert.doesNotMatch(article, /資安/);
  assert.doesNotMatch(article, /arxiv\.org\/abs\/2605\.25480/);
  assert.match(componentsStyle, /prose-code:text-text-dark dark:prose-code:text-darkmode-text-dark/);
  assert.match(componentsStyle, /prose-pre:bg-light prose-pre:text-text-dark/);
  assert.match(componentsStyle, /\.content pre code,\n\.content pre code \*/);
  assert.match(componentsStyle, /color: var\(--color-text-dark\);/);
});
