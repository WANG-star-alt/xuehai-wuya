---
name: "xuehai-wuya-requirements"
description: "学海无涯网站开发规范。当用户要求记住、整理、保存开发要求或修复 bug 时，必须写入此 skill。"
---

# 学海无涯 · 开发要求规范

## 网站基本信息

- **名称**: 学海无涯 (Xue Hai Wu Ya)
- **域名**: https://xuehai-wuya.pages.dev
- **仓库**: github.com/WANG-star-alt/xuehai-wuya
- **部署**: Cloudflare Pages (自动部署 main 分支)
- **技术栈**: 纯 HTML/CSS/JS，**数据驱动 SVG 自绘知识树**（已放弃 ECharts）

## 目录结构

```
xuehai-wuya/
├── index.html                       # 主页（封面 + 认知树 + 章节卡片）
├── assets/
│   ├── tree-data.js                 # 认知树节点数据（id/label/desc/time/children/href/color）
│   ├── cognition-tree.js            # 认知树渲染引擎（SVG 自绘 + 交互）
│   ├── cognition-tree.css           # 认知树样式（磨砂玻璃 + 节点卡片）
│   └── charts.js                    # 【已废弃】旧 ECharts 版，未使用
├── _shared/
│   ├── css/theme.css                # 所有子页面共享样式
│   └── js/float-pager.js            # 悬浮翻页岛
├── chapters/                        # 所有章节内容
│   ├── ai/                          # 智能篇 14 章
│   ├── network/                     # 网络篇 10 章
│   └── gui/                         # 界面篇 10 章
└── .trae/skills/                    # 本 skill 存放处
```

**参考规范**: 遵循 `COGNITION_TREE_FORMAT_SPEC.md`（用户提供的知识树设计规范）

## 核心开发规范（每次必须遵守）

### 0. 三级命名规范（篇 → 章 → 节）★ 最重要

全站严格遵守 **篇 → 章 → 节** 三级结构，**最小单位是"节"，不是"篇"**。

| 层级 | 命名格式 | 示例 | 对应文件 |
|---|---|---|---|
| **篇**（顶层分支） | `XX篇` | 智能篇 / 网络篇 / 界面篇 | 无独立页面，只是树上的分支 |
| **章**（第二层） | `第 X 章 · 名字`（**不带"篇"字**） | 第 5 章 · 神经网络 | `05-neural-network.html`（章总览页） |
| **节**（第三层） | `§ X.Y · 名字`（**不带"节"或"篇"字**） | § 5.1 · 神经元 | `05-1-neuron.html`（节正文页） |

**禁止事项**:
- ❌ 章级标题写成"第 5 章 · 神经网络**篇**"
- ❌ 节级标题写成"§ 5.1 · 神经元**篇**"或"§ 5.1 · 神经元**节**"
- ❌ 主页卡片 `<h3>` 写成"神经网络**篇**"
- ❌ 章总览页写"本章的六个**子篇**"（应写"本章的六**节**"）

**页面内标记**:
- 节页面 `chapter-head` 的 num 用 `§ X.Y · Section`（不是 `Sub-chapter`）
- 章页面 `chapter-head` 的 num 用 `Chapter · XX`
- 章总览页导航区标题用"本章的 X 节"

### 1. 章节结构规范

每个"篇"必须是一个**独立 HTML 页面**，放在 `chapters/<篇名>/` 下。

**页面命名规则**:
- 主页面: `XX-<title>.html` (如 `04-machine-learning.html`)
- 子篇章: `XX-Y-<title>.html` (如 `04-1-supervised.html`)

**每个页面必须包含**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>§ X.Y · 标题 · 学海无涯</title>
  <link rel="stylesheet" href="../../_shared/css/theme.css">
</head>
<body>
<article class="page">
  <!-- 顶部面包屑 -->
  <nav class="topbar">...</nav>
  <!-- 章节头 -->
  <header class="chapter-head">...</header>
  <!-- 内容 -->
  ...
  <!-- 底部翻页（.pager） -->
  <div class="pager">
    <a class="btn prev" href="...">← 上一篇</a>
    <a class="home" href="../../index.html">☰ 主页</a>
    <a class="btn next" href="...">下一篇 →</a>
  </div>
  <div class="page-foot">Xue Hai Wu Ya · ...</div>
</article>
<!-- 必须引入悬浮翻页脚本 -->
<script src="../../_shared/js/float-pager.js"></script>
</body>
</html>
```

### 2. 悬浮翻页岛规范（重要）

**每个章节页面底部必须有 `.pager`**，并引入 `float-pager.js`。

**float-pager.js 会自动**:
- 克隆 `.pager` → 创建 `.pager-float`（悬浮岛）
- 给 body 加 `has-float-pager` 类（底部留白）

**悬浮岛样式**:
- 磨砂玻璃: `rgba(255,255,255,0.55)` + `backdrop-filter: blur(20px)`
- 圆角胶囊: `border-radius: 999px`
- 居中悬浮: `position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%)`

**检查清单**（每次新建页面后）:
- [ ] 页面有 `.pager` 元素
- [ ] 页面引入了 `../../_shared/js/float-pager.js`
- [ ] 浏览器测试：滚动时悬浮岛始终可见

### 3. 认知知识树规范（当前实现 · SVG 自绘）

**数据位置**: `assets/tree-data.js` → `window.__cognitionTreeData`

**节点数据结构**（严格按 COGNITION_TREE_FORMAT_SPEC）:
```javascript
{
  id: "唯一稳定英文ID",        // 必填
  label: "节点显示名称",        // 必填
  desc: "节点简要说明",         // 必填
  time: "建议投入时间",         // 必填
  children: [],                // 必填（叶子节点空数组）
  href: "chapters/xxx.html",   // 可选：跳转链接
  color: "#4a6d8c"             // 可选：仅顶层分支设置，后代继承
}
```

**树结构**:
```
学海无涯 (root)
├── 智能篇 (color: #4a6d8c)
│   └── 第 1-14 章
├── 网络篇 (color: #556b3d)
│   └── 第 1-10 章
└── 界面篇 (color: #8a5a7a)
    └── 第 1-10 章
```

**顶层分支配色**:
- 智能篇 `#4a6d8c`（蓝）· 主页 banner `.vol-banner`
- 网络篇 `#556b3d`（绿）· 主页 banner `.vol-banner.net`
- 界面篇 `#8a5a7a`（紫褐）· 主页 banner `.vol-banner.gui`

**节点规范**:
- ID 全树唯一，只用英文/数字/连字符
- 叶子节点必须有空 `children: []`
- 有内容的节点填 `href`，无内容的不填（视觉自动区分）
- 禁止五级嵌套：最多 4 级（root → 篇 → 章 → 子篇）
- 若子篇章已合并成一篇文章，树上只保留一个链接节点
- 例外：文章有清晰分段时可加锚点 `#section-id`，拆成多个子节点（如简史 5 个时代节点）

**视觉规范**:
- **文字前圆点颜色**（唯一状态标识）：
  - **深绿** `#556b3d` = 可跳转（有 `href`）
  - **浅绿** `#d4e2c8` = 可展开（无 `href` 但有子节点）
  - **浅灰** `#d8d4cb` = 叶子节点
- **不显示** `[+]/[-]` 加号按钮、右侧状态圆点、下划线等其他标识
- 节点卡片：184×54 圆角矩形，磨砂玻璃背景
- 连接线：真实 SVG 三次贝塞尔曲线，`<g class="edges">` 先绘制，`<g class="nodes">` 后绘制
- 三区结构：工具栏 + 树画布（磨砂玻璃）+ 详情面板（磨砂玻璃）

**交互规范**:
- **单击节点** → 若有子节点则展开/收起，同时更新详情面板
- **详情面板"打开完整学习章节"按钮** → 跳转 `href`
- **搜索** → 匹配 label + desc，只展开祖先路径，不展开后代
- **缩放**：滚轮、`＋/−` 按钮，范围 `0.55x ~ 2.5x`
- **拖动**：只在画布空白处拖动，不拖节点
- **展开层级**：Ⅰ 一级 / Ⅱ 二级 / Ⅲ 三级 / ⊟ 收起

**节点宽度滑块**（`#node-width-slider`）:
- 工具栏提供"框宽"滑块，范围 `120px ~ 420px`，默认 `184px`，步长 4
- `NODE_W` 是**可变状态**（不是常量），滑块改它后调 `render()` 重算布局
- `NODE_LABEL_MAX`（文字截断字符数）随宽度线性联动：`(NODE_W - 44) / 8.75`，下限 6 字
- `input` 事件只重绘（拖动流畅）；`change` 事件（松手）才 `fitCanvas()`，避免画面乱跳
- `#node-width-reset`（↺ 按钮）恢复默认 184px

**默认缩放规范**（重要）:
- **`fitCanvas()` 必须让树"正好装下"画布**，不能太小
- 上限 `1.4x`（小树自动放大填充画布），下限 `MIN_SCALE=0.55`
- 留 5% 内边距（`padding = 0.95`），不贴边
- SVG `viewBox` **必须用画布像素尺寸**（`0 0 clientW clientH`），不能用 world 尺寸——否则 SVG 自动缩放会和 `scene transform` 叠加，导致我的 scale 失效
- 初始化时用 `requestAnimationFrame × 2 + setTimeout 200ms 兜底`，确保 SVG 布局完成再计算
- window resize 时自动重新 fit

**索引系统**（初始化时构建）:
```javascript
const nodeIndex = new Map();     // id → node
const parentIndex = new Map();   // id → parent node
const depthIndex = new Map();    // id → depth
const branchIndex = new Map();   // id → 顶层分支节点（含 color）
```

**状态管理**:
```javascript
const collapsedNodes = new Set();  // 唯一的展开状态来源
let selectedNodeId;
let scale, translateX, translateY;
```

### 4. 主页卡片规范

**位置**: `index.html` → `.vol-banner` 下的 `.chapters`

**卡片状态**:
- **已上线**: `class="ch-card ready"`, `<span class="badge">已上线</span>`, `href="./chapters/ai/XX.html"`
- **建设中**: `class="ch-card wip"`, `<span class="badge">建设中</span>`, `href="#"`

**每完成一章，必须**:
1. 把 `wip` 改成 `ready`
2. 把 `badge` 文字从"建设中"改成"已上线"
3. 把 `href="#"` 改成真实链接

### 5. 翻页链规范

**每篇文章底部 `.pager` 必须正确链接**:

- **上一篇**: 同篇内上一章，或上一篇的最后一章
- **下一篇**: 同篇内下一章，或下一篇的第一章
- **主页**: `../../index.html`

**首尾处理**:
- 第一篇的"上一篇" → `disabled`（不可点）
- 最后一篇的"下一篇" → `disabled`（不可点）

**跨篇衔接**（重要）:
- 智能篇 §2.5 末页"下一章" → 指向第 3 章
- 智能篇 §4.5 末页"下一章" → 指向第 5 章（未上线则 disabled）
- 网络篇 §1.6 末页"下一章" → 指向第 2 章（未上线则 disabled）

### 6. 内容规范

**每篇必须包含**:
- `p.lead` — 核心观点（带 `<mark class="key">` 高亮）
- `div.scene` — 生活场景类比（带 🎯 图标）
- `h3` + `p` — 正文讲解
- `div.callout` — 提示框（Recap/Note/Analogy）
- `ul.keylist` 或 `table` — 结构化信息
- `div.pager` — 翻页

**字数要求**: 每篇 2500+ 字，通俗易懂，贴近生活。

### 7. 缓存规范

**每次修改 `tree-data.js` / `cognition-tree.js` / `cognition-tree.css` / `index.html` 后，必须更新缓存号**:

```html
<link rel="stylesheet" href="./assets/cognition-tree.css?v=ct-N" />
<script src="./assets/tree-data.js?v=ct-N"></script>
<script src="./assets/cognition-tree.js?v=ct-N"></script>
```

`N` 递增（当前 `ct-5`）。旧版 `kmap-XX` 已废弃。

### 8. 推送规范

**每次修改后必须**:
```powershell
git add . ; git commit -m '<type>(<scope>): <description>' ; git push
```

**commit 类型**:
- `feat`: 新功能/新章节
- `fix`: bug 修复
- `style`: 样式调整
- `refactor`: 重构

## 常见 bug 记录

### Bug 1: 悬浮翻页岛不显示
**原因**: 新页面忘了引入 `float-pager.js` 或没有 `.pager` 元素。
**修复**: 检查页面底部是否有 `<script src="../../_shared/js/float-pager.js"></script>` 和 `<div class="pager">`。

### Bug 2: 知识树点击不能展开/收起
**原因**: `expandAndCollapse: true` 导致 ECharts 内部状态和数据不同步。
**修复**: 已改为 `expandAndCollapse: false` + 手动 toggle `collapsed`。

### Bug 3: 展开后 zoom 倒退
**原因**: `setOption` 时 ECharts 用旧数据重绘。
**修复**: 每次 `setOption` 都传入最新 `data`。

### Bug 4: 默认展开不生效
**原因**: `initialTreeDepth` 被数据中的 `collapsed: true` 覆盖。
**修复**: 渲染后强制执行 `expandToDepth(2)`。

### Bug 5: 认知树默认缩放太小
**原因**: SVG 有两层缩放叠加——`viewBox="0 0 worldW worldH"` 让 SVG 自动缩放内容，同时 `scene transform: scale(x)` 又缩放一次，两者叠加导致我的 scale 失效。
**修复**: SVG `viewBox` 改用**画布像素尺寸** (`0 0 clientW clientH`)，让 `scene transform` 完全掌控缩放。同时初始化用 `requestAnimationFrame × 2 + setTimeout 200ms 兜底`，确保 SVG 布局完成。

## 用户特殊要求记录

- **2026-07-26**: 知识树标签不要白色背景方块（黑暗模式友好）
- **2026-07-26**: 悬浮翻页岛要磨砂玻璃效果，不要贴底横条
- **2026-07-26**: 知识树默认展开到二级
- **2026-07-26**: 每个新页面必须有悬浮翻页岛（引入 float-pager.js）
- **2026-07-26**: 知识树圆点要大要明显（symbolSize: 14, borderWidth: 2）
- **2026-07-26**: 点击圆点 = 展开/收起，点击文字 = 跳转篇章（必须区分）
- **2026-07-26**: 圆点颜色区分——有 link 的节点浅绿色，无 link 的叶子节点浅灰色
- **2026-07-26**: 简化交互——点击节点有 link 跳转，无 link 展开/收起（不再区分圆点/文字）
- **2026-07-26**: 圆点必须不透明，不能透过圆点看到线条
- **2026-07-26**: 有子节点的节点，折叠时 label 显示 `[+]`，展开时显示 `[-]`
- **2026-07-26**: 交互方式改为——单击展开/收起，双击跳转（ECharts 无法区分 symbol/label 点击，用单击/双击分离）
- **2026-07-26**: 树结构优化——如果子篇章已合并成一篇完整文章，树上只保留一个链接节点（如 OSI 七层、简史）
- **2026-07-26**: **重大重构**——放弃 ECharts，改用数据驱动的 SVG 自绘认知树，遵循 COGNITION_TREE_FORMAT_SPEC 规范。数据在 `assets/tree-data.js`（node: id/label/desc/time/children/href/color），渲染在 `assets/cognition-tree.js`，样式在 `assets/cognition-tree.css`。三区结构：工具栏 + 树画布 + 详情面板。
- **2026-07-26**: 节点右侧状态圆点——**深绿色**（`#556b3d`）= 可跳转（有 href），**浅绿色**（`#d4e2c8`）= 可展开（无 href 但有子节点），无圆点 = 叶子节点。不再用 `[+]/[-]` 加号按钮。
- **2026-07-26**: 最终方案——只保留**文字前面**的圆点（`.branch-dot`），颜色区分：**深绿**（`#556b3d`）= 可跳转 / **浅绿**（`#d4e2c8`）= 可展开 / **浅灰**（`#d8d4cb`）= 叶子。文字后面的 `.status-dot` 不再显示。
- **2026-07-26**: 认知树默认缩放必须"正好装下"画布——`fitCanvas` 允许放大到 1.4x，留 5% 边距，SVG viewBox 用画布像素尺寸（避免和 scene transform 叠加缩放）
- **2026-08-01**: 新增第三个顶层分支**界面篇**（`#8a5a7a` 紫褐），10 章 GUI/前端/HCI 内容，目录 `chapters/gui/`
- **2026-08-01**: 三个分支的**第三层节点全部补齐**（智能篇 14 章 / 网络篇 10 章 / 界面篇 10 章，共 34 章 · 180+ 节）。未写文章的节点不带 `href`，圆点显示浅灰色；写完后加 `href` 即自动变深绿色。
- **2026-08-01**: 全站统一 **篇 → 章 → 节** 三级命名（见 §0 规范），最小单位是"节"
- **2026-08-01**: 认知树工具栏加**框宽滑块**（120-420px），可自由调节节点框宽度
- **2026-08-01**: **界面篇第 5 章是用户重点学习目标**——从 5 节扩到 **14 节**，覆盖 Python / C++ / C# / Web / Rust 五大技术栈：Tkinter、PySide6/PyQt6、Qt Designer、CustomTkinter、Flet、NiceGUI、Dear PyGui、Streamlit/Gradio、Windows 原生栈、Avalonia/.NET MAUI、Electron、Tauri、打包分发。写这一章时要**多给可运行代码示例**。
- **2026-08-01**: **封面改为简洁印章式**——不要重复堆字。结构：SVG 印章 logo（方章 + 三色水波对应三篇 + 橙点书舟）→ `学海无涯`（只出现一次，字距 0.22em）→ `Xue Hai Wu Ya` 小字 → 三色分隔线 → `智能 · 网络 · 界面`。页脚也精简为`学海无涯 · 2026`。已加同款 SVG favicon（内联 data URI）。

### 品牌视觉规范

- **Logo 意象**：方形印章（圆角 14）+ 三道水波（上蓝 `#4a6d8c` 智能 / 中绿 `#556b3d` 网络 / 下紫 `#8a5a7a` 界面）+ 顶部橙点 `#a05a2c`（书舟，"学海泛舟"）
- **禁止**：标题重复出现同一组字（如既写 `学 · 海 · 无 · 涯` 又写 `Xue Hai Wu Ya · 学 · 海 · 无 · 涯`）
- **三色分隔线** `.rule-tri`：96×2px，三等分渐变，用于封面标题下方
- 中文标题用字距（`letter-spacing`）营造高级感，必须配同值 `text-indent` 抵消末字右侧空白以保持视觉居中

## 待办事项

- [ ] **界面篇第 5 章 · 桌面 GUI 工具箱（14 节）—— 用户重点学习目标，优先级最高**
- [ ] 界面篇 CH03 布局与排版（6 节）、CH04 事件与交互（6 节）
- [ ] 界面篇 CH06-10（Web 前端 / 前端框架 / 移动端 / HCI / AI 时代界面）
- [ ] 智能篇第 8-14 章（未上线）
- [ ] 网络篇第 3 章剩余节: § 3.4 DNS / § 3.5 IP / § 3.6 其他协议
- [ ] 网络篇第 4-10 章（未上线）
- [x] ~~智能篇第 5-7 章~~（2026-07-26 已上线，各拆 5-6 节）
- [x] ~~界面篇分支骨架~~（2026-08-01 已加入认知树 + 主页）
- [x] ~~界面篇第 1-2 章~~（2026-08-01 已上线，共 2 个章总览 + 10 节正文，每节 3000+ 字）
