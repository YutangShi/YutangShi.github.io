// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://YutangShi.github.io/YutangShi.github.io/', // 您的GitHub用戶名
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ['astro:content']
    }
  }
});
