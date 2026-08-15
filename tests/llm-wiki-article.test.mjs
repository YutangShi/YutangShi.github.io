import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const articlePath = new URL('../src/content/blog/llm-wiki-vs-rag.md', import.meta.url);
const lifecycleDiagramPath = new URL('../public/images/blog/diagrams/llm-wiki-vs-rag-lifecycle.svg', import.meta.url);
const hybridDiagramPath = new URL('../public/images/blog/diagrams/llm-wiki-hybrid-architecture.svg', import.meta.url);
const sourceNotesPath = new URL('../docs/research/llm-wiki-source-notes.md', import.meta.url);

test('LLM-Wiki article includes the research sources, decision sections, and accessible diagrams', async () => {
  const article = await readFile(articlePath, 'utf8');
  const sourceNotes = await readFile(sourceNotesPath, 'utf8');

  await access(lifecycleDiagramPath);
  await access(hybridDiagramPath);

  assert.match(article, /## LLM-Wiki 是什麼/);
  assert.match(article, /## LLM-Wiki 的運作原理/);
  assert.match(article, /## LLM-Wiki 與常見 chunk-based RAG 的比較/);
  assert.match(article, /## 風險、治理與可觀測性/);
  assert.match(article, /arxiv\.org\/abs\/2605\.25480/);
  assert.match(article, /arxiv\.org\/abs\/2005\.11401/);
  assert.match(article, /不是.*取代 RAG|RAG.*不是.*淘汰/);
  assert.match(article, /預印本|arXiv/);
  assert.match(article, /draft: false/);
  assert.match(article, /!\[[^\]]+\]\(\/images\/blog\/diagrams\/llm-wiki-vs-rag-lifecycle\.svg\)/);
  assert.match(article, /!\[[^\]]+\]\(\/images\/blog\/diagrams\/llm-wiki-hybrid-architecture\.svg\)/);
  assert.match(sourceNotes, /arXiv v2/);
  assert.match(sourceNotes, /存取日期/);
  assert.match(sourceNotes, /Microsoft.*branch/i);
  assert.match(sourceNotes, /Microsoft.*commit SHA/i);
});
