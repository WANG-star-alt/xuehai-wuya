// ============================================================
// 学海无涯 · 认知知识树渲染引擎
// 遵循 COGNITION_TREE_FORMAT_SPEC 规范
// 数据驱动 · SVG 自绘 · 展开/收起/搜索/缩放/拖动
// ============================================================

(function () {
  'use strict';

  // ============ 常量配置 ============
  const NODE_W_DEFAULT = 224;
  const NODE_W_MIN = 120;
  const NODE_W_MAX = 420;
  const NODE_H_BASE = 54;   // 单行小字时的节点高度
  const META_LH = 12;       // 小字每多一行增加的高度（10px 等宽字体的行高）
  const COL_GAP = 80;      // 列间距（额外距离）
  const ROW_GAP = 22;      // 行间距
  const PAD_LEFT = 40;
  const PAD_TOP = 40;
  const PAD_RIGHT = 40;
  const PAD_BOTTOM = 40;
  const MIN_SCALE = 0.55;
  const MAX_SCALE = 2.5;

  // ============ 状态变量 ============
  let NODE_W = NODE_W_DEFAULT;          // 节点宽度（可由滑块调节）
  let NODE_LABEL_MAX = 14;              // 显示字符数上限，随宽度联动
  let selectedNodeId = null;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let dragState = null;

  const collapsedNodes = new Set();
  const nodeIndex = new Map();
  const parentIndex = new Map();
  const depthIndex = new Map();
  const branchIndex = new Map();

  // ============ 索引构建 ============
  function buildIndexes(root) {
    function walk(node, parent, depth, branch) {
      nodeIndex.set(node.id, node);
      parentIndex.set(node.id, parent);
      depthIndex.set(node.id, depth);

      // 分支色继承：顶层分支设定 color，后代继承
      const currentBranch = node.color ? node : branch;
      if (currentBranch) branchIndex.set(node.id, currentBranch);

      (node.children || []).forEach(c => walk(c, node, depth + 1, currentBranch));
    }
    walk(root, null, 0, null);
  }

  // ============ 可见树 ============
  function createVisibleTree(node) {
    const copy = { id: node.id, label: node.label, children: [] };
    if (!collapsedNodes.has(node.id)) {
      copy.children = (node.children || []).map(createVisibleTree);
    }
    return copy;
  }

  // ============ 布局计算 ============
  // 返回 { positions: Map<id, {x,y}>, heights: Map<id, h>, worldW, worldH }
  // y 一律指节点顶部；小字换行多的节点更高，行距随各自高度累加
  function layout(visibleRoot) {
    const positions = new Map();
    const heights = new Map();
    let cursorY = PAD_TOP;

    function assignY(node) {
      const real = nodeIndex.get(node.id);
      const h = real ? nodeHeight(real) : NODE_H_BASE;
      heights.set(node.id, h);
      if (!node.children.length) {
        positions.set(node.id, { x: 0, y: cursorY });
        cursorY += h + ROW_GAP;
        return cursorY - ROW_GAP - h / 2;   // 返回节点垂直中心
      }
      const childCenters = node.children.map(assignY);
      const center = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
      positions.set(node.id, { x: 0, y: center - h / 2 });
      return center;
    }
    assignY(visibleRoot);

    // 再计算 x（深度决定）
    function assignX(node, depth) {
      const pos = positions.get(node.id);
      pos.x = PAD_LEFT + depth * (NODE_W + COL_GAP);
      node.children.forEach(c => assignX(c, depth + 1));
    }
    assignX(visibleRoot, 0);

    // 计算世界尺寸
    let maxX = 0;
    positions.forEach(p => { if (p.x > maxX) maxX = p.x; });
    return {
      positions,
      heights,
      worldW: maxX + NODE_W + PAD_RIGHT,
      worldH: Math.max(NODE_H_BASE, cursorY - ROW_GAP) + PAD_BOTTOM
    };
  }

  // ============ 工具：文字截断 ============
  function truncate(text, max) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }

  // ============ 工具：小字（meta）按框宽自动换行 ============
  // 估宽系数按真实渲染标定（10px JetBrains Mono + CJK 回退）：
  // CJK/全角=10px；「·」「–」「—」等由 CJK 回退字体渲染，同为 10px；
  // 数字、字母、空格、半角标点 = 5px。逐字符求和比整串实测略宽，安全方向。
  const WIDE_CHARS = new Set(['·', '–', '—', '～', '×', '→', '§', '℃', '％']);
  function estTextW(s) {
    let w = 0;
    for (const ch of String(s)) {
      const code = ch.codePointAt(0);
      if (code >= 0x2E80 || WIDE_CHARS.has(ch)) w += 10;
      else w += 5;
    }
    return w;
  }

  // 先按「 · 」分段，段装不下再整段换行；单段仍超宽则按字符硬折
  function wrapMeta(text, availW) {
    if (!text) return [];
    const segs = String(text).split(' · ');
    const lines = [];
    let cur = '';
    segs.forEach(seg => {
      if (estTextW(seg) > availW) {
        if (cur) { lines.push(cur); cur = ''; }
        let piece = '';
        for (const ch of seg) {
          if (estTextW(piece + ch) > availW && piece) { lines.push(piece); piece = ch; }
          else piece += ch;
        }
        cur = piece;
        return;
      }
      const tryLine = cur ? cur + ' · ' + seg : seg;
      if (!cur || estTextW(tryLine) <= availW) cur = tryLine;
      else { lines.push(cur); cur = seg; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  // 节点小字的行数组（依赖当前 NODE_W，滑块拖动时随 render 重算）
  function metaLinesOf(realNode) {
    const hasChildren = realNode.children && realNode.children.length > 0;
    const nodeWords = realNode.words || realNode.time || '';
    const text = hasChildren
      ? nodeWords + ' · ' + realNode.children.length + ' 项'
      : nodeWords;
    return wrapMeta(text, NODE_W - 28 - 8);
  }

  // 节点高度 = 基础高度 + 小字额外行数 × 行高
  function nodeHeight(realNode) {
    const n = metaLinesOf(realNode).length;
    return NODE_H_BASE + Math.max(0, n - 1) * META_LH;
  }

  // ============ 工具：SVG 命名空间元素创建 ============
  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // ============ 渲染 ============
  function render() {
    const root = window.__cognitionTreeData;
    if (!root) return;

    const visible = createVisibleTree(root);
    const { positions, heights, worldW, worldH } = layout(visible);

    // 找到画布元素
    const edgesG = document.getElementById('tree-edges');
    const nodesG = document.getElementById('tree-nodes');
    const sceneG = document.getElementById('tree-scene');
    if (!edgesG || !nodesG || !sceneG) return;

    // 清空
    edgesG.innerHTML = '';
    nodesG.innerHTML = '';

    // 递归绘制连接线和节点
    function drawNode(vnode) {
      const pos = positions.get(vnode.id);
      const realNode = nodeIndex.get(vnode.id);
      const H = heights.get(vnode.id) || NODE_H_BASE;
      const branch = branchIndex.get(vnode.id);
      const branchColor = branch && branch.color ? branch.color : '#8a8579';

      // 先画到子节点的连线
      vnode.children.forEach(child => {
        const cpos = positions.get(child.id);
        const cH = heights.get(child.id) || NODE_H_BASE;
        const startX = pos.x + NODE_W;
        const startY = pos.y + H / 2;
        const endX = cpos.x;
        const endY = cpos.y + cH / 2;
        const midX = (startX + endX) / 2;
        const path = svg('path', {
          class: 'edge',
          d: `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
        });
        edgesG.appendChild(path);
        drawNode(child);
      });

      // 画节点
      const isSelected = vnode.id === selectedNodeId;
      const hasChildren = realNode.children && realNode.children.length > 0;
      const isCollapsed = collapsedNodes.has(vnode.id);

      const g = svg('g', {
        class: 'node' + (isSelected ? ' selected' : ''),
        'data-id': vnode.id,
        transform: `translate(${pos.x} ${pos.y})`,
        role: 'button',
        tabindex: '0',
        'aria-label': realNode.label
      });

      // 背景圆角矩形（高度随小字行数自适应）
      g.appendChild(svg('rect', {
        class: 'node-bg',
        width: NODE_W,
        height: H,
        rx: 10,
        ry: 10
      }));

      // 前面的状态圆点：深绿=可跳转 / 浅绿=可展开 / 浅灰=叶子
      const hasHref = !!realNode.href;
      let dotClass = 'branch-dot leaf';
      if (hasHref) dotClass = 'branch-dot has-link';
      else if (hasChildren) dotClass = 'branch-dot expandable';

      g.appendChild(svg('circle', {
        class: dotClass,
        cx: 14,
        cy: H / 2,
        r: 6
      }));

      // 节点名称
      const title = svg('text', {
        class: 'node-title',
        x: 28,
        y: 24,
        'dominant-baseline': 'middle'
      });
      title.textContent = truncate(realNode.label, NODE_LABEL_MAX);
      g.appendChild(title);

      // 元信息（时间 / 子节点数）——按框宽自动换行，多行时节点加高
      const metaLines = metaLinesOf(realNode);
      metaLines.forEach((line, i) => {
        const meta = svg('text', {
          class: 'node-meta',
          x: 28,
          y: 41 + i * META_LH,
          'dominant-baseline': 'middle'
        });
        meta.textContent = line;
        g.appendChild(meta);
      });

      // 改造状态标记（右侧竖直居中的小圆点）——只对有正文的节点显示
      // spec: 'pass' 已达标（绿） / 'todo' 待改造（橙） / 未定义则不显示
      if (realNode.spec) {
        const isPass = realNode.spec === 'pass';
        const dot = svg('circle', {
          class: 'spec-dot ' + (isPass ? 'pass' : 'todo'),
          cx: NODE_W - 11,
          cy: H / 2,
          r: 4
        });
        // 悬停提示
        const tip = svg('title', {});
        tip.textContent = isPass ? '已按当前规范改造完成' : '待改造：字数 / 大白话 / 生活类比未达标';
        dot.appendChild(tip);
        g.appendChild(dot);
      }

      // 学习标记徽章：右上角 ✓ 已学完（绿）/ ! 待改进（朱红）——读者自己打的标记
      const mark = getMark(vnode.id);
      if (mark) {
        const mg = svg('g', { class: 'mark-badge ' + mark.status });
        mg.appendChild(svg('circle', { cx: NODE_W - 13, cy: 13, r: 9 }));
        const glyph = svg('text', {
          class: 'mark-glyph',
          x: NODE_W - 13,
          y: 13.8,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle'
        });
        glyph.textContent = mark.status === 'done' ? '✓' : '!';
        mg.appendChild(glyph);
        const mtip = svg('title', {});
        mtip.textContent = (mark.status === 'done' ? '已学完' : '待改进')
          + ' · ' + fmtMarkDate(mark.ts)
          + (mark.note ? ' · 备注：' + mark.note : '');
        mg.appendChild(mtip);
        g.appendChild(mg);
      }

      // 学习进度条：节点底部双色细条（绿=已学占比 / 朱红=待改进占比）
      if (hasChildren && window.XHY_PROGRESS) {
        const st = markStats(realNode);
        if (st.done > 0 || st.improve > 0) {
          const bw = NODE_W - 20;
          const bg = svg('rect', { class: 'markbar-bg', x: 10, y: H - 6, width: bw, height: 3, rx: 1.5 });
          const btip = svg('title', {});
          btip.textContent = '学习进度：已学 ' + st.done + ' / ' + st.total
            + (st.improve ? ' · 待改进 ' + st.improve : '');
          bg.appendChild(btip);
          g.appendChild(bg);
          if (st.done > 0) {
            g.appendChild(svg('rect', {
              class: 'markbar-done',
              x: 10, y: H - 6,
              width: bw * st.done / st.total, height: 3, rx: 1.5
            }));
          }
          if (st.improve > 0) {
            g.appendChild(svg('rect', {
              class: 'markbar-improve',
              x: 10 + bw * st.done / st.total, y: H - 6,
              width: bw * st.improve / st.total, height: 3, rx: 1.5
            }));
          }
        }
      }

      // 后面不再显示状态圆点（前面的圆点已经区分了）

      // 事件
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(vnode.id);
      });
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNode(vnode.id);
        }
      });

      nodesG.appendChild(g);
    }

    drawNode(visible);

    // 更新画布尺寸——SVG viewBox 用 canvas 像素尺寸（1:1），让 scene transform 完全掌控缩放
    const canvas = document.getElementById('tree-canvas');
    if (canvas) {
      const svgEl = canvas.querySelector('svg');
      if (svgEl) {
        const cw = canvas.clientWidth || 800;
        const ch = canvas.clientHeight || 600;
        svgEl.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
        svgEl.dataset.worldW = worldW;
        svgEl.dataset.worldH = worldH;
      }
    }

    // 应用当前变换
    applyTransform();

    // 更新详情面板
    updateDetailPanel();
  }

  // ============ 选中节点 ============
  function selectNode(id) {
    selectedNodeId = id;
    const node = nodeIndex.get(id);
    if (node && node.children && node.children.length) {
      // 有子节点 → 切换展开/收起
      toggleNode(id);
    } else {
      // 叶子节点 → 只更新面板
      render();
    }
  }

  function toggleNode(id) {
    if (collapsedNodes.has(id)) collapsedNodes.delete(id);
    else collapsedNodes.add(id);
    render();
  }

  // ============ 详情面板 ============
  function updateDetailPanel() {
    const panel = document.getElementById('tree-detail');
    if (!panel) return;

    const id = selectedNodeId || 'root';
    const node = nodeIndex.get(id);
    if (!node) {
      panel.innerHTML = '<div class="detail-empty">选中一个节点查看详情</div>';
      return;
    }

    const depth = depthIndex.get(id);
    const branch = branchIndex.get(id);
    const branchColor = branch && branch.color ? branch.color : '#8a8579';

    // 构建完整路径
    const pathNodes = [];
    let cur = node;
    while (cur) {
      pathNodes.unshift(cur);
      cur = parentIndex.get(cur.id);
    }
    const pathText = pathNodes.map(n => n.label).join(' / ');

    // 按钮
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes.has(id);
    let buttons = '';
    if (hasChildren) {
      buttons += `<button class="detail-btn primary" data-action="toggle">
        ${isCollapsed ? '展开下一层' : '收起下一层'}
      </button>`;
    }
    if (node.href) {
      buttons += `<button class="detail-btn accent" data-action="open">打开完整学习章节 →</button>`;
    }

    // 我的学习状态块（progress.js 存在时才显示）
    let markBlock = '';
    if (window.XHY_PROGRESS) {
      const mk = getMark(id);
      const st = hasChildren ? markStats(node) : null;
      const statusHtml = !mk
        ? '<span class="mark-chip none">未标记</span>'
        : mk.status === 'done'
          ? '<span class="mark-chip done">已学完 · ' + fmtMarkDate(mk.ts) + '</span>'
          : '<span class="mark-chip improve">待改进 · ' + fmtMarkDate(mk.ts) + '</span>';
      markBlock = `
        <div class="detail-mark">
          <div class="meta-label">我的学习状态</div>
          <div class="mark-status-row">${statusHtml}</div>
          ${st && (st.done > 0 || st.improve > 0)
            ? `<div class="mark-counts">包含小节：已学 ${st.done} / ${st.total}` + (st.improve > 0 ? ` · 待改进 ${st.improve}` : '') + '</div>'
            : ''}
          ${mk && mk.note ? `<div class="mark-note">备注：${escapeHtml(mk.note)}</div>` : ''}
          <div class="mark-actions">
            <button class="detail-btn mark-toggle done${mk && mk.status === 'done' ? ' active' : ''}" data-action="mark" data-status="done">✓ 标记已学完</button>
            <button class="detail-btn mark-toggle improve${mk && mk.status === 'improve' ? ' active' : ''}" data-action="mark" data-status="improve">⚠ 标记待改进</button>
          </div>
          ${mk && mk.status === 'improve'
            ? `<input type="text" class="mark-note-input" maxlength="300" placeholder="记一笔：哪里需要改进？（可选）" value="${escapeHtml(mk.note || '')}">`
            : ''}
        </div>`;
    }

    panel.innerHTML = `
      <div class="detail-header" style="border-left-color:${branchColor}">
        <div class="detail-depth">第 ${depth} 层</div>
        <div class="detail-title">${escapeHtml(node.label)}</div>
      </div>
      <div class="detail-body">
        <div class="detail-desc">${escapeHtml(node.desc || '')}</div>
        <div class="detail-meta">
          <div class="meta-item"><span class="meta-label">内容字数</span><span class="meta-value">${escapeHtml(node.words || node.time || '待撰写')}</span></div>
          <div class="meta-item"><span class="meta-label">子节点</span><span class="meta-value">${hasChildren ? node.children.length + ' 项' : '叶子节点'}</span></div>
          ${node.spec ? `<div class="meta-item"><span class="meta-label">规范状态</span><span class="meta-value spec-${node.spec}">${node.spec === 'pass' ? '已达标' : '待改造'}</span></div>` : ''}
        </div>
        ${markBlock}
        <div class="detail-path">
          <div class="path-label">完整路径</div>
          <div class="path-value">${escapeHtml(pathText)}</div>
        </div>
        <div class="detail-actions">${buttons}</div>
      </div>
    `;

    // 绑定按钮事件
    panel.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'toggle') toggleNode(id);
        else if (action === 'open' && node.href) window.location.href = node.href;
        else if (action === 'mark' && window.XHY_PROGRESS) {
          const status = btn.getAttribute('data-status');
          const cur = window.XHY_PROGRESS.get(id);
          window.XHY_PROGRESS.mark(id, cur && cur.status === status ? null : status);
          render();
        }
      });
    });

    // 备注输入框（仅待改进状态显示）
    const noteInput = panel.querySelector('.mark-note-input');
    if (noteInput) {
      noteInput.addEventListener('change', () => {
        window.XHY_PROGRESS.setNote(id, noteInput.value);
        updateDetailPanel();
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  // ============ 学习进度标记（progress.js 提供 window.XHY_PROGRESS） ============
  function getMark(id) {
    return window.XHY_PROGRESS ? window.XHY_PROGRESS.get(id) : null;
  }

  // 统计节点所有叶子后代的学习标记（章节进度 = 小节进度的合计）
  function markStats(node) {
    const ids = [];
    (function walk(n) {
      if (!n.children || !n.children.length) { ids.push(n.id); return; }
      n.children.forEach(walk);
    })(node);
    const c = window.XHY_PROGRESS ? window.XHY_PROGRESS.counts(ids) : { done: 0, improve: 0 };
    return { done: c.done, improve: c.improve, total: ids.length };
  }

  function fmtMarkDate(ts) {
    const d = new Date(ts);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  // ============ 缩放/拖动 ============
  function applyTransform() {
    const sceneG = document.getElementById('tree-scene');
    if (sceneG) {
      sceneG.setAttribute('transform', `translate(${translateX} ${translateY}) scale(${scale})`);
    }
  }

  function fitCanvas() {
    const canvas = document.getElementById('tree-canvas');
    if (!canvas) return;
    const svgEl = canvas.querySelector('svg');
    if (!svgEl) return;
    const worldW = parseFloat(svgEl.dataset.worldW) || 1000;
    const worldH = parseFloat(svgEl.dataset.worldH) || 800;
    const availW = canvas.clientWidth || 800;
    const availH = canvas.clientHeight || 600;
    // 更新 viewBox 到当前画布像素尺寸，保证 scene transform 是 1:1 像素坐标
    svgEl.setAttribute('viewBox', `0 0 ${availW} ${availH}`);
    // 留 5% 内边距，避免树贴边
    const padding = 0.95;
    const sx = (availW * padding) / worldW;
    const sy = (availH * padding) / worldH;
    // 取较小的缩放（保证完整可见），允许放大到 1.4x（小树也能填满画布）
    scale = Math.min(sx, sy, 1.4);
    scale = Math.max(scale, MIN_SCALE);
    // 居中
    translateX = (availW - worldW * scale) / 2;
    translateY = (availH - worldH * scale) / 2;
    applyTransform();
    console.log('[cognition-tree] fitCanvas:', { availW, availH, worldW, worldH, scale });
  }

  function zoom(delta, cx, cy) {
    const old = scale;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
    if (next === old) return;
    // 若给了焦点（鼠标位置 / 双指中心），让该点在缩放前后保持不动
    if (typeof cx === 'number' && typeof cy === 'number') {
      const canvas = document.getElementById('tree-canvas');
      const r = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      const px = cx - r.left;
      const py = cy - r.top;
      translateX = px - (px - translateX) * (next / old);
      translateY = py - (py - translateY) * (next / old);
    }
    scale = next;
    applyTransform();
  }

  // ============ 展开层级 ============
  function expandToDepth(depth) {
    collapsedNodes.clear();
    nodeIndex.forEach((node, id) => {
      const d = depthIndex.get(id);
      if (d >= depth && node.children && node.children.length) {
        collapsedNodes.add(id);
      }
    });
    render();
    setTimeout(fitCanvas, 50);
  }

  function collapseAll() {
    collapsedNodes.clear();
    nodeIndex.forEach((node, id) => {
      if (id !== window.__cognitionTreeData.id && node.children && node.children.length) {
        collapsedNodes.add(id);
      }
    });
    render();
    setTimeout(fitCanvas, 50);
  }

  // ============ 搜索 ============
  function search(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const results = [];
    nodeIndex.forEach(node => {
      const inLabel = node.label && node.label.toLowerCase().includes(q);
      const inDesc = node.desc && node.desc.toLowerCase().includes(q);
      if (inLabel || inDesc) results.push(node);
    });
    return results.slice(0, 20);
  }

  function jumpToNode(id) {
    // 展开所有祖先
    let cur = parentIndex.get(id);
    while (cur) {
      collapsedNodes.delete(cur.id);
      cur = parentIndex.get(cur.id);
    }
    selectedNodeId = id;
    render();
    setTimeout(fitCanvas, 50);
  }

  // ============ 节点宽度调节 ============
  function setNodeWidth(w, doFit) {
    NODE_W = Math.max(NODE_W_MIN, Math.min(NODE_W_MAX, Math.round(w)));
    // 字符数上限随宽度线性联动：184px ≈ 14 字（右侧留出状态圆点的位置）
    NODE_LABEL_MAX = Math.max(6, Math.round((NODE_W - 58) / 8.75));
    const out = document.getElementById('node-width-value');
    if (out) out.textContent = NODE_W + 'px';
    render();
    if (doFit) fitCanvas();
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 工具栏按钮
    document.getElementById('btn-fit')?.addEventListener('click', fitCanvas);
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => zoom(1.2));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => zoom(1 / 1.2));
    document.getElementById('btn-depth-1')?.addEventListener('click', () => expandToDepth(1));
    document.getElementById('btn-depth-2')?.addEventListener('click', () => expandToDepth(2));
    document.getElementById('btn-depth-3')?.addEventListener('click', () => expandToDepth(3));
    document.getElementById('btn-collapse-all')?.addEventListener('click', collapseAll);

    // 节点宽度滑块
    const widthSlider = document.getElementById('node-width-slider');
    if (widthSlider) {
      widthSlider.min = String(NODE_W_MIN);
      widthSlider.max = String(NODE_W_MAX);
      widthSlider.value = String(NODE_W);
      // 拖动过程：只重绘，不 fit（避免画面乱跳）
      widthSlider.addEventListener('input', () => {
        setNodeWidth(parseInt(widthSlider.value, 10), false);
      });
      // 松手后：适应画布
      widthSlider.addEventListener('change', () => {
        setNodeWidth(parseInt(widthSlider.value, 10), true);
      });
    }
    // 双击滑块恢复默认宽度
    document.getElementById('node-width-reset')?.addEventListener('click', () => {
      if (widthSlider) widthSlider.value = String(NODE_W_DEFAULT);
      setNodeWidth(NODE_W_DEFAULT, true);
    });

    // 搜索
    const searchInput = document.getElementById('tree-search');
    const searchResults = document.getElementById('search-results');
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', () => {
        const results = search(searchInput.value);
        if (!results.length) {
          searchResults.innerHTML = '';
          searchResults.classList.remove('active');
          return;
        }
        searchResults.innerHTML = results.map(r => `
          <button class="search-result" data-id="${r.id}">
            <strong>${escapeHtml(r.label)}</strong>
            <small>${escapeHtml(r.desc || '')}</small>
          </button>
        `).join('');
        searchResults.classList.add('active');
        searchResults.querySelectorAll('.search-result').forEach(btn => {
          btn.addEventListener('click', () => {
            jumpToNode(btn.getAttribute('data-id'));
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
          });
        });
      });
    }

    // 画布拖动
    const canvas = document.getElementById('tree-canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        // 只在空白处拖动（点节点不拖）
        if (e.target.closest('.node')) return;
        dragState = { x: e.clientX, y: e.clientY, tx: translateX, ty: translateY };
        canvas.style.cursor = 'grabbing';
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragState) return;
        translateX = dragState.tx + (e.clientX - dragState.x);
        translateY = dragState.ty + (e.clientY - dragState.y);
        applyTransform();
      });
      window.addEventListener('mouseup', () => {
        dragState = null;
        if (canvas) canvas.style.cursor = 'grab';
      });

      // 滚轮缩放（以鼠标位置为焦点）
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 / 1.1 : 1.1;
        zoom(delta, e.clientX, e.clientY);
      }, { passive: false });

      // ===== 触摸支持：单指拖动 / 双指捏合缩放 / 双击缩放 =====
      let touchDrag = null;   // 单指平移状态
      let pinch = null;       // 双指缩放状态
      let lastTap = 0;        // 上一次单指抬起的时间（用于识别双击）

      const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const mid = (a, b) => ({
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2
      });

      // SVG 元素的 closest() 在个别旧版移动浏览器上不可靠，这里手动向上找
      const inNode = (el) => {
        let n = el;
        while (n && n !== canvas) {
          const c = n.getAttribute && n.getAttribute('class');
          if (c && /\bnode\b/.test(c)) return true;
          n = n.parentNode;
        }
        return false;
      };

      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          // 手指按在节点上时不平移，留给节点自己的点击
          if (inNode(e.target)) { touchDrag = null; return; }
          const t = e.touches[0];
          touchDrag = { x: t.clientX, y: t.clientY, tx: translateX, ty: translateY };
          pinch = null;
        } else if (e.touches.length === 2) {
          // 双指：进入捏合缩放，禁掉平移
          touchDrag = null;
          const [a, b] = [e.touches[0], e.touches[1]];
          const m = mid(a, b);
          pinch = { d: dist(a, b), s: scale, cx: m.x, cy: m.y };
          e.preventDefault();
        }
      }, { passive: false });

      canvas.addEventListener('touchmove', (e) => {
        if (pinch && e.touches.length === 2) {
          const [a, b] = [e.touches[0], e.touches[1]];
          const nd = dist(a, b);
          if (pinch.d > 0) {
            // 相对起始状态整体计算，避免累积误差
            const target = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinch.s * (nd / pinch.d)));
            zoom(target / scale, pinch.cx, pinch.cy);
          }
          e.preventDefault();
        } else if (touchDrag && e.touches.length === 1) {
          const t = e.touches[0];
          translateX = touchDrag.tx + (t.clientX - touchDrag.x);
          translateY = touchDrag.ty + (t.clientY - touchDrag.y);
          applyTransform();
          e.preventDefault();
        }
      }, { passive: false });

      canvas.addEventListener('touchend', (e) => {
        // 双指松开一根后，避免残留状态导致跳变
        if (e.touches.length < 2) pinch = null;
        if (e.touches.length === 0) {
          // 双击缩放：两次轻触间隔小于 300ms 且未发生拖动
          const now = Date.now();
          const moved = touchDrag &&
            (Math.abs(translateX - touchDrag.tx) > 6 || Math.abs(translateY - touchDrag.ty) > 6);
          if (!moved && e.changedTouches.length === 1 &&
              !inNode(e.changedTouches[0].target)) {
            if (now - lastTap < 300) {
              const t = e.changedTouches[0];
              zoom(scale < MAX_SCALE * 0.6 ? 1.6 : 1 / 1.6, t.clientX, t.clientY);
              lastTap = 0;
            } else {
              lastTap = now;
            }
          }
          touchDrag = null;
        }
      });

      canvas.addEventListener('touchcancel', () => { touchDrag = null; pinch = null; });
    }

    // 窗口尺寸变化
    window.addEventListener('resize', () => {
      setTimeout(fitCanvas, 50);
    });
  }

  // ============ 初始化 ============
  function init() {
    if (!window.__cognitionTreeData) {
      console.warn('[cognition-tree] data not ready, retry');
      setTimeout(init, 100);
      return;
    }
    buildIndexes(window.__cognitionTreeData);
    selectedNodeId = window.__cognitionTreeData.id;

    // 统计规范改造进度，填到图例右侧
    (function fillLegendStat() {
      const el = document.getElementById('legend-stat');
      if (!el) return;
      let pass = 0, todo = 0, none = 0;
      const leafIds = [];
      nodeIndex.forEach(node => {
        const isLeaf = !node.children || !node.children.length;
        if (!isLeaf) return;
        leafIds.push(node.id);
        if (node.spec === 'pass') pass++;
        else if (node.spec === 'todo') todo++;
        else none++;
      });
      const written = pass + todo;
      const pct = written ? Math.round(pass / written * 100) : 0;
      let text = `已达标 ${pass} / 已撰写 ${written}（${pct}%）· 未撰写 ${none}`;
      if (window.XHY_PROGRESS) {
        const c = window.XHY_PROGRESS.counts(leafIds);
        text += ` · 已学 ${c.done}/${leafIds.length}` + (c.improve > 0 ? ` · 待改进 ${c.improve}` : '');
      }
      el.textContent = text;
    })();

    // 默认收起所有 depth >= 2 的分支
    nodeIndex.forEach((node, id) => {
      const d = depthIndex.get(id);
      if (d >= 2 && node.children && node.children.length) {
        collapsedNodes.add(id);
      }
    });

    bindEvents();
    // 学习标记变化时整树重绘（含跨标签页 storage 事件触发的场景）
    if (window.XHY_PROGRESS) {
      window.XHY_PROGRESS.onChange(() => render());
    }
    // 同步滑块显示值
    const wOut = document.getElementById('node-width-value');
    if (wOut) wOut.textContent = NODE_W + 'px';
    render();
    // 用 requestAnimationFrame 确保 SVG 已经布局完成再计算缩放
    requestAnimationFrame(() => {
      requestAnimationFrame(fitCanvas);
    });
    // 额外兜底：200ms 后再 fit 一次（应对慢速加载）
    setTimeout(fitCanvas, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
