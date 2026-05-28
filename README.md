# FAQ JSON 生成器

用于生成 Shopify ClawGo FAQ 所需 JSON 数据结构的在线工具。

## 功能

- **单条问题模式** — 逐条编辑 FAQ 问题与答案
- **完整 FAQ 模式** — 管理多组 FAQ，支持拖拽排序、复制、删除
- **多种模板支持**
  - 问题模板：普通折叠 FAQ、静态说明卡片、静态标题块、步骤手风琴、新版分组步骤手风琴
  - 答案模板：HTML 内容、步骤图片列表、图片步骤切换器、静态图片教程网格、排错表格、四角边框提示框、图文并排提示、均高图片教程网格
- **导入/导出** — 粘贴 JSON 导入，一键生成并复制到剪贴板
- **实时预览** — 在暗色背景中预览 ClawGo 风格渲染效果
- **HTML 校验** — 内置 HTML 标签闭合校验和格式化
- **模板提示** — 编辑区会根据当前 questionTemplate / answerTemplate 显示用途和关键字段说明

## 模板对应关系

### Question Templates

| 模板值 | 作用 | 数据结构 |
| --- | --- | --- |
| `template1` | 普通折叠 FAQ；填写 `link` 时变成跳转入口 | `answers[]` |
| `template3` | 静态说明卡片，不折叠 | `answers[].content` |
| `template4` | 静态标题块，只展示 `title` | 无需 `answers` |
| `template5` | 旧版步骤手风琴 | 扁平 `answers[]` |
| `template6` | 新版分组步骤手风琴 | `answers[].contents[]` |

### Answer Templates

| 模板值 | 作用 | 关键字段 |
| --- | --- | --- |
| `template1` | 普通 HTML 内容 | `content` |
| `template3` | 带编号和箭头的步骤图片列表 | `stepsPerRow`、`stepList[].image`、`stepList[].desc` |
| `template4` | 图片步骤切换器/轮播 | `title`、`content`、`stepList[].image`、`stepList[].desc` |
| `template5` | 静态截图教程网格 | `stepList[].image`、`stepList[].content` |
| `template6` | 排错或对比表格 | `headers`、`rows[].columns` 或 `rows[].problem/cause/solution` |
| `template7` | 四角边框提示框 | `content` |
| `template8` | 图文并排提示组件 | `content`、`image`、`imageAlt` |
| `template9` | 等高截图教程网格 | `stepsPerRow`、`stepList[].headerContent`、`stepList[].image`、`stepList[].content` |

更完整的数据示例和主题代码说明见 ClawGo 仓库的 `FAQ_USAGE.md`。

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
