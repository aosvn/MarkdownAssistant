# Markdown Assistant

基于Tauri和Vditor的功能完善的本地化Markdown编辑器应用。

## 功能特性

- **三种编辑模式**：
  - WYSIWYG（所见即所得）- 对普通用户友好
  - IR（即时渲染）- 对开发者友好
  - SV（分屏预览）- 传统分屏模式

- **丰富的内容渲染**：
  - 数学公式（LaTeX）支持
  - Mermaid图表（流程图、甘特图、时序图等）
  - 多语言代码块高亮
  - 表格、引用、列表等标准Markdown语法

- **系统集成**：
  - 本地文件操作（新建、打开、保存）
  - 快捷键支持
  - 文件修改状态提示

## 开发环境

### 前置要求

- Node.js 18+
- Rust 1.70+
- 系统构建工具（Windows需要Visual Studio Build Tools）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 构建生产版本

```bash
npm run tauri:build
```

## 快捷键

- `Ctrl+N` - 新建文件
- `Ctrl+O` - 打开文件
- `Ctrl+S` - 保存文件
- `Ctrl+Shift+S` - 另存为

## 技术栈

- **前端框架**：Vanilla JavaScript + Vite
- **Markdown编辑器**：Vditor
- **桌面应用框架**：Tauri
- **后端**：Rust
