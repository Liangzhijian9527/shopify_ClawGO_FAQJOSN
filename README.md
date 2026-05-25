# FAQ JSON 生成器

用于生成 Shopify ClawGo FAQ 所需 JSON 数据结构的在线工具。

## 功能

- **单条问题模式** — 逐条编辑 FAQ 问题与答案
- **完整 FAQ 模式** — 管理多组 FAQ，支持拖拽排序、复制、删除
- **多种模板支持**
  - 问题模板：普通折叠 FAQ、静态说明卡片、静态标题块、步骤手风琴、新版分组步骤手风琴
  - 答案模板：HTML 内容、步骤图片列表、图片步骤切换器、静态图片教程网格、排错表格、四角边框提示框
- **导入/导出** — 粘贴 JSON 导入，一键生成并复制到剪贴板
- **实时预览** — 在暗色背景中预览 ClawGo 风格渲染效果
- **HTML 校验** — 内置 HTML 标签闭合校验和格式化

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- 原生 JavaScript (ES Modules)
- CSS 自定义属性

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 项目结构

```
.
├── index.html          # 入口 HTML
├── src/
│   ├── main.js         # 应用逻辑
│   └── style.css       # 样式
├── package.json
├── vite.config.js
└── .github/workflows/deploy.yml  # GitHub Pages 自动部署
```

## 部署

推送 `master` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。
