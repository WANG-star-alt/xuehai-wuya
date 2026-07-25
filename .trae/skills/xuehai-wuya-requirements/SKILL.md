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
- **技术栈**: 纯 HTML/CSS/JS, ECharts, 无框架

## 目录结构

```
xuehai-wuya/
├── index.html                 # 主页（封面 + 知识树 + 章节卡片）
├── assets/charts.js           # 知识树数据 + 渲染 + 交互
├── _shared/
│   ├── css/theme.css          # 所有子页面共享样式
│   ├── js/float-pager.js      # 悬浮翻页岛（自动克隆 .pager）
│   └── js/echarts.min.js      # ECharts 库
├── chapters/                  # 所有章节内容
│   ├── ai/                    # 智能篇 14 章
│   └── network/               # 网络篇 10 章
└── .trae/skills/              # 本 skill 存放处
```

## 核心开发规范（每次必须遵守）

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

### 3. 知识树规范

**数据位置**: `assets/charts.js` → `window.__xhwyTreeData`

**树结构**:
```
学海 (根)
├── 智能篇 · Intelligence (color: #4a6d8c)
│   ├── 第 1 章 · AI 是什么 (link: 'chapters/ai/01-what-is-ai.html', external: true)
│   │   ├── § 1.1 · 弱 AI · ANI 篇 (link: 'chapters/ai/01-1-ani.html', external: true)
│   │   └── ...
│   └── ... 共 14 章
│
└── 网络篇 · Network (color: #556b3d)
    ├── 第 1 章 · 网络是什么 (link: 'chapters/network/01-what-is-network.html', external: true)
    │   ├── § 1.1 · 主机 Host 篇 (link: 'chapters/network/01-1-host.html', external: true)
    │   └── ...
    └── ... 共 10 章
```

**节点规范**:
- 每个可点击节点必须有 `link` 字段（相对路径）
- 每个有 `link` 的节点必须有 `external: true`
- 子篇章（§ X.Y）必须有 `link` + `external: true`
- 未上线章节不加 `link`（显示为灰色/建设中）

**渲染规范**:
- 默认展开到二级: `expandToDepth(2)` 在渲染后强制执行
- 标签无背景色（黑暗模式友好）
- 控制按钮: 全部展开 / 全部收起 / 一级 / 二级 / 放大 / 缩小 / 还原
- **圆点要大要明显**: `symbolSize: 14`, `borderWidth: 2`
- **圆点颜色区分**: 有 link 的节点浅绿色（`accent` 边框 + 浅绿填充），无 link 的叶子节点浅灰色（`muted` 边框 + 浅灰填充）
- **点击节点**: 有 link → 跳转，无 link 但有子节点 → 展开/收起（不再区分圆点/文字，简化交互）

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

**每次修改 charts.js 或 index.html 后，必须更新缓存号**:

```html
<script src="./assets/charts.js?v=kmap-XX"></script>
```

XX 递增（当前 kmap-22）。

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

## 用户特殊要求记录

- **2026-07-26**: 知识树标签不要白色背景方块（黑暗模式友好）
- **2026-07-26**: 悬浮翻页岛要磨砂玻璃效果，不要贴底横条
- **2026-07-26**: 知识树默认展开到二级
- **2026-07-26**: 每个新页面必须有悬浮翻页岛（引入 float-pager.js）
- **2026-07-26**: 知识树圆点要大要明显（symbolSize: 14, borderWidth: 2）
- **2026-07-26**: 点击圆点 = 展开/收起，点击文字 = 跳转篇章（必须区分）
- **2026-07-26**: 圆点颜色区分——有 link 的节点浅绿色，无 link 的叶子节点浅灰色
- **2026-07-26**: 简化交互——点击节点有 link 跳转，无 link 展开/收起（不再区分圆点/文字）

## 待办事项

- [ ] 网络篇第 2 章 · 分层模型篇（未上线）
- [ ] 网络篇第 3 章剩余子篇: DNS / IP / 其他协议
- [ ] 智能篇第 5-14 章（未上线）
- [ ] 检查所有已上线页面是否都有 float-pager.js
