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
│   ├── css/interactive.css          # 互动实验室组件样式
│   ├── js/float-pager.js            # 悬浮翻页岛
│   └── js/interactive.js            # 互动实验室组件引擎（18 种组件）
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

每个"章"和每个"节"都必须是一个**独立 HTML 页面**，放在 `chapters/<篇目录>/` 下。

**页面命名规则**:
- 章总览页: `XX-<title>.html` (如 `04-machine-learning.html`)
- 节正文页: `XX-Y-<title>.html` (如 `04-1-supervised.html`)

**每个页面必须包含**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>§ X.Y · 标题 · 学海无涯</title>
  <link rel="stylesheet" href="../../_shared/css/theme.css">
  <!-- 用到互动组件时才加这一行 -->
  <link rel="stylesheet" href="../../_shared/css/interactive.css">
</head>
<body>
<article class="page">
  <!-- 顶部面包屑 -->
  <nav class="topbar">...</nav>
  <!-- 章节头：num 用 "§ X.Y · Section" 或 "Chapter · XX" -->
  <header class="chapter-head">...</header>
  <!-- 内容（含互动组件 div.lab） -->
  ...
  <!-- 底部翻页（.pager）：节用"上一节/下一节"，跨章用"上一章/下一章" -->
  <div class="pager">
    <a class="btn prev" href="...">← 上一节</a>
    <a class="home" href="../../index.html">☰ 主页</a>
    <a class="btn next" href="...">下一节 →</a>
  </div>
  <!-- 页脚格式：学海无涯 · <篇名> · § X.Y -->
  <div class="page-foot">学海无涯 · 界面篇 · § X.Y</div>
</article>
<!-- 用到互动组件时才加这一行，且必须在 float-pager 之前 -->
<script src="../../_shared/js/interactive.js"></script>
<!-- 必须引入悬浮翻页脚本 -->
<script src="../../_shared/js/float-pager.js"></script>
</body>
</html>
```

**禁止内联 `<style>`**——所有样式都放 `theme.css` / `interactive.css`，页面里不许写 `<style>` 块。

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
  words: "3200 字",            // 必填：内容字数（不再用"建议时间"）
  children: [],                // 必填（叶子节点空数组）
  href: "chapters/xxx.html",   // 可选：跳转链接
  color: "#4a6d8c"             // 可选：仅顶层分支设置，后代继承
}
```

**`words` 字段规范**（★ 已废弃"建议时间"）:
- **节节点** → 该节实际中文字数，如 `'3200 字'`；未上线的写 `'待撰写'`
- **章节点** → 该章所有节 + 总览页字数合计，如 `'约 1.8 万字'`
- **篇节点** → 该篇合计，如 `'约 6 万字'`
- 根节点 → 全站合计
- **理由**：阅读时间因人而异，字数是客观可核对的事实；也便于直接对照 §6 的 3000 字硬标准

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

**每个页面底部 `.pager` 必须正确链接**，形成一条贯穿全篇的线性阅读路径：

```
章总览 → §X.1 → §X.2 → … → §X.n → 下一章总览 → §(X+1).1 → …
```

**方向文字用词**:
- 同章内节与节之间 → `← 上一节` / `下一节 →`
- 节 → 本章总览 → `← 上一节`，标题写"第 X 章 · 总览"
- 本章最后一节 → 下一章总览 → `下一章 →`，标题写"第 X+1 章 · 章名"

**首尾处理**:
- 每篇第一章总览页的"上一章" → `class="btn prev disabled"`（无 href），标题写"已是本篇首章"
- 最后一个已上线节的"下一节" → `class="btn next disabled"`（无 href），标题写"第 X 章 · 章名（建设中）"

**新增章节时必须回头改前一章末节的 next**——否则阅读链断在那里。

### 6. 内容规范

**每个节正文页必须包含**（缺一不可）:
- `p.lead` — 核心观点（带 `<mark class="key">` 高亮）
- `div.scene` — 生活场景类比（带 emoji，含 `.scene-tag` / `.scene-title` / `.link`）
- 3–8 个 `h3` + `p` — 正文讲解
- `div.callout.analogy` — 至少一个譬喻框
- `ul.keylist` 或 `.table-wrap table` — 结构化信息
- **互动组件** `div.lab` — 见 §6.5，至少一个 `quiz`
- `div.callout` — 结尾 Recap 收束
- `div.pager` — 翻页

**章总览页必须包含**: `p.lead` + "本章要回答什么" + `div.callout.analogy` + `div.cards`（各节导航卡片）+ "学之前先记住这一点" `ul.keylist` + `div.pager`。章总览页**不放互动组件**。

**字数要求（硬标准 · 只算中文字符，不含标点数字英文）**:

| 页面类型 | 下限 | 目标区间 | 说明 |
|---|---|---|---|
| **节正文页** | **3000 字** | 3000–4000 字 | 低于 3000 视为不合格，必须补写 |
| **章总览页** | 600 字 | 600–900 字 | 只做导航和总览，不要写长 |

节正文页要靠**内容密度**撑起字数，不是灌水：3–8 个 `h3` 小节、每节 2–4 段实质讲解、配足类比和表格。宁可多举一个例子、多拆一层原理，也不要用空话凑数。

**字数自查命令**（写完必须跑）:
```python
# 去掉 script/style/lab 组件后统计中文字符
s = re.sub(r'<script.*?</script>|<style.*?</style>', '', html, flags=re.S)
s = re.sub(r'<div class="lab"[^>]*></div>', '', s)
len(re.findall(r'[\u4e00-\u9fff]', re.sub(r'<[^>]+>', '', s)))
```

**代码示例**: 用 `<pre><code>` 包裹，HTML 标签要转义（`&lt;` / `&gt;`）。`theme.css` 已有全局 `pre` 样式，不要在页面里另写。

### 6.5 互动实验室规范（★ 重要 · 每篇都要考虑）

**核心原则**: 讲到"可以动手试"的概念时，**必须配一个互动组件让用户亲自玩**，而不是只用文字描述。讲颜色就给色盘，讲布局就给可拖的盒模型，讲帧率就给能调速的动画。

**引入方式**（需要用组件的页面才引，不用的不引）:
```html
<!-- head 里，theme.css 之后 -->
<link rel="stylesheet" href="../../_shared/css/interactive.css">
<!-- body 末尾，float-pager.js 之前 -->
<script src="../../_shared/js/interactive.js"></script>
```

**使用方式**: 只写一个空 div，JS 自动扫描 `data-lab` 并渲染，无需手写内部结构。
```html
<div class="lab" data-lab="color-picker"></div>
```

**现有 18 个组件**:

**通用 · 任何篇都能用**

| `data-lab` | 组件 | 适合放在讲什么的地方 |
|---|---|---|
| `quiz` | 单选小测验 + 判定 + 解析 | **每一节的结尾都要有**，检验理解 |

**界面篇专用**

| `data-lab` | 组件 | 适合放在讲什么的地方 |
|---|---|---|
| `color-picker` | HSL 调色盘 + 三种色值 + 预设色 | 颜色、RGB/HSL、配色、主题色 |
| `contrast` | 对比度检查器 + WCAG 徽章 | 可读性、无障碍、深色模式 |
| `box-model` | 盒模型四层可拖演示 | 盒模型、margin/padding、布局计算 |
| `flexbox` | Flex 属性下拉 + 实时代码输出 | Flexbox、一维布局、对齐 |
| `pixel-zoom` | 网格数可调的像素化圆 | 像素、分辨率、锯齿、抗锯齿 |
| `event-flow` | 三层嵌套点击 + 冒泡日志 + stopPropagation 开关 | 事件冒泡、事件委托、事件循环 |
| `fps` | 帧率可调的小球动画 | 帧率、60fps、卡顿、动画性能 |
| `converter` | PPI / DPR 换算器 | 分辨率、DPI、@2x 图、Retina |
| `cmd-break` | 命令行三段结构拆解器 | CLI、命令语法、选项与参数 |

**智能篇专用**

| `data-lab` | 组件 | 适合放在讲什么的地方 |
|---|---|---|
| `tokenizer` | 分词器模拟 + token 计数统计 | Token、分词、上下文窗口、计费 |
| `temperature` | 温度调节 + softmax 概率条形图 | Temperature、Top-p、采样策略 |
| `embedding` | 二维向量夹角 + 余弦相似度 | Embedding、语义搜索、RAG、CLIP |
| `neuron` | 神经元加权求和 + 四种激活函数 | 神经元、权重偏置、激活函数、非线性 |

**网络篇专用**

| `data-lab` | 组件 | 适合放在讲什么的地方 |
|---|---|---|
| `subnet` | 子网掩码计算器 + 32 位可视化 | IP、子网划分、CIDR、掩码 |
| `handshake` | TCP 三次握手分步演示 + 状态机 | TCP、握手挥手、连接建立 |
| `latency` | 时延账本（RTT + 传输时间分解） | 时延、带宽、RTT、CDN、性能指标 |
| `status-code` | 13 个 HTTP 状态码点击查询 | HTTP、状态码、错误排查 |

**小测验写法**（唯一需要传参数的组件）:
```html
<div class="lab" data-lab="quiz"
     data-q="题干，可含 <code>行内代码</code>"
     data-opts="选项A|选项B|选项C|选项D"
     data-answer="1"
     data-explain="答案解析——不只说对错，要讲清为什么。"></div>
```
`data-answer` 是**从 0 开始**的正确选项下标。

**放置原则**:
- 互动组件插在**对应概念讲完的那一段之后**，不要堆在文末
- 每篇 **1-3 个**互动组件为宜，`quiz` 固定放在结尾 Recap 之前
- 组件是"讲完再练"，不能代替文字讲解——先把道理说明白，再让用户动手验证

**扩展新组件**: 在 `interactive.js` 的 `builders` 注册表里加一个 `'名字': build函数`，配套样式加到 `interactive.css`。函数签名 `function(box)`，box 就是那个 `.lab` 容器。

### 7. 缓存规范

**每次修改 `tree-data.js` / `cognition-tree.js` / `cognition-tree.css` / `index.html` 后，必须更新缓存号**:

```html
<link rel="stylesheet" href="./assets/cognition-tree.css?v=ct-N" />
<script src="./assets/tree-data.js?v=ct-N"></script>
<script src="./assets/cognition-tree.js?v=ct-N"></script>
```

`N` 递增（**当前 `ct-17`**，每次改完 +1）。旧版 `kmap-XX` 已废弃。

### 7.5 交付前自检规范（★ 每次改完必做）

**批量操作优先用脚本**——新增/修改多个页面时，写一个临时 Python 脚本放在临时工作目录跑，不要逐个手改。避免高频工具调用触发 `AccountRateLimitExceeded`（HTTP 429）。

**每次交付前必须跑一遍自检**，检查项：
- [ ] 每个页面都有 `.pager` 且引入了 `float-pager.js`
- [ ] 用了互动组件的页面，`interactive.css` 和 `interactive.js` 都引了；没用的页面不要引
- [ ] 所有 `data-lab` 的值都在 `interactive.js` 的 `builders` 注册表里
- [ ] 每个 `quiz` 的 `data-q` / `data-opts` / `data-answer` / `data-explain` 四项齐全，且 `data-answer` 下标不越界
- [ ] 没有内联 `<style>` 块
- [ ] 命名符合 §0：节标题不带"节/篇"字，章标题不带"篇"字
- [ ] 树数据里新上线的节点已加 `href`（否则圆点还是灰的）
- [ ] 主页对应卡片已从 `wip` 改成 `ready`
- [ ] 缓存号已递增

**注意**: 校验 quiz 参数的正则不能用 `[^>]*`——`data-q` 里可能含 `<code>` 标签，会被提前截断。要用 `(.*?)></div>` 配 `re.S`。

**浏览器验证**：需要验证交互逻辑时，优先用一次 `browser_evaluate` 批量取回多个断言结果，不要反复截图和抓页面快照（快照返回上万字，极易触发限流）。

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

- **2026-08-01**: **要求文章加入互动元素**——讲到特定内容时要提供合适的动手互动，比如讲选颜色就给一个色盘让用户自己选。已建成互动实验室组件库（`_shared/css/interactive.css` + `_shared/js/interactive.js`，18 种组件），并写入 §6.5 规范。**以后每写一节都要考虑配什么互动组件**。
- **2026-08-01**: 互动组件已**覆盖全站三个篇**——组件库从 10 种扩到 18 种（新增智能篇 4 种：tokenizer / temperature / embedding / neuron；网络篇 4 种：subnet / handshake / latency / status-code）。已上线的 53 篇文章全部配好组件，共 67 处。`temperature` / `embedding` / `flexbox` 预留给尚未写的 §8.4 / §9.2 / §3.3。
- **2026-08-01**: **不要频繁触发限流**——批量改文件用脚本一次跑完；验证交互用一次 `browser_evaluate` 批量断言，不要反复抓页面快照。已写入 §7.5。
- **通用**: 用户要求"记住"、"写进规范"、"更新制作规范"时，**必须写入本 skill 文件**，不能只在对话里答应。
- **通用**: 每次改动完成后**主动跑自检 + 提交推送**，不要等用户催。
- **2026-08-01**: **字数标准提高到 3000 字**（原 2500），并**取消所有"建议时间"改为字数**——树数据 `time` 字段更名为 `words`，节点详情面板显示"内容字数"。理由：阅读时间因人而异，字数客观可核对。已批量换算全部 225 个节点。
- **2026-08-01**: 发现**智能篇前 4 章、网络篇全部**字数严重不达标（智能篇 §1.1–§2.4 仅 691–1036 字，网络篇平均 1202 字），需逐节补写至 3000 字以上。
- **2026-08-02**: **已完成 31 篇扩写**（智能篇 CH1/CH2/CH4/CH6 共 19 篇 + 网络篇 CH1/CH2/CH3 共 12 篇），全部从 700–1900 字扩到 5000–9600 字。全站字数从约 8 万涨到 **30 万字**。剩余 11 篇（智能篇 CH5 神经网络 5 篇 + CH7 Transformer 5 篇 + `ai-05-4`）字数在 2508–2740，接近但未达 3000，用户指示**暂缓处理**，留作后续待办。

### 品牌视觉规范

- **Logo 意象**：方形印章（圆角 14）+ 三道水波（上蓝 `#4a6d8c` 智能 / 中绿 `#556b3d` 网络 / 下紫 `#8a5a7a` 界面）+ 顶部橙点 `#a05a2c`（书舟，"学海泛舟"）
- **禁止**：标题重复出现同一组字（如既写 `学 · 海 · 无 · 涯` 又写 `Xue Hai Wu Ya · 学 · 海 · 无 · 涯`）
- **三色分隔线** `.rule-tri`：96×2px，三等分渐变，用于封面标题下方
- 中文标题用字距（`letter-spacing`）营造高级感，必须配同值 `text-indent` 抵消末字右侧空白以保持视觉居中

## 待办事项

- [ ] **界面篇第 5 章 · 桌面 GUI 工具箱（14 节）—— 用户重点学习目标，优先级最高**
- [ ] 智能篇 CH5（5 节）、CH7（5 节）扩写至 3000 字（当前 2508–2740，用户已指示暂缓）
- [ ] 界面篇 CH03 布局与排版（6 节）、CH04 事件与交互（6 节）
- [ ] 界面篇 CH06-10（Web 前端 / 前端框架 / 移动端 / HCI / AI 时代界面）
- [ ] 智能篇第 8-14 章（未上线）
- [ ] 网络篇第 3 章剩余节: § 3.4 DNS / § 3.5 IP / § 3.6 其他协议
- [ ] 网络篇第 4-10 章（未上线）
- [x] ~~智能篇第 5-7 章~~（2026-07-26 已上线，各拆 5-6 节）
- [x] ~~界面篇分支骨架~~（2026-08-01 已加入认知树 + 主页）
- [x] ~~界面篇第 1-2 章~~（2026-08-01 已上线，共 2 个章总览 + 10 节正文，每节 3000+ 字）
