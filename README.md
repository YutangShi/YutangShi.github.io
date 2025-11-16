# 技術微光 - Allen Shi 的個人網站

這是我的個人網站，包含個人簡介、作品集和技術文章分享。

## 網站特色

- 個人簡介與專業經驗
- 技術微光：技術文章與見解分享
- 作品集展示
- 專業服務介紹
- 聯絡資訊

## 技術棧

- [Astro](https://astro.build/) - 網站框架
- 純 CSS 樣式與排版
- 響應式設計

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產環境版本
npm run build

# 預覽生產版本
npm run preview
```

## 部署指南

### 自動部署到 GitHub Pages

這個專案設置了 GitHub Actions 工作流程，每當您推送到 `main` 分支時，網站會自動構建並部署到 GitHub Pages。

#### 設置步驟

1. 在 GitHub 創建一個新的儲存庫
2. 推送代碼到該儲存庫
3. 在儲存庫設置中啟用 GitHub Pages，選擇 "GitHub Actions" 作為來源
4. 完成！您的網站將自動部署到 `https://[您的GitHub用戶名].github.io`

### 手動部署

如果您想手動部署，可以使用以下步驟：

```bash
# 構建網站
npm run build

# 部署到您的網站主機
# 將 dist 目錄中的檔案上傳到您的網站空間
```

## 網站維護

- 要添加新文章，在 `src/content/blog/` 目錄下創建新的 Markdown 文件
- 要修改網站配置，編輯 `src/utils/config.ts` 文件
- 要更新作品集，在 `src/content/portfolio/` 目錄下添加或修改項目

## 許可協議

© 2024 Allen Shi. 保留所有權利。

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
