// ============================================================
// 学海无涯 · 认知知识树渲染引擎
// 遵循 COGNITION_TREE_FORMAT_SPEC 规范
// 数据驱动 · SVG 自绘 · 展开/收起/搜索/缩放/拖动
// ============================================================

(function () {
  'use strict';

  // ============ 常量配置 ============
  const NODE_W_DEFAULT = 184;
  const NODE_W_MIN = 120;
  const NODE_W_MAX = 420;
  const NODE_H = 54;
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
  let NODE_LABEL_MAX = 16;              // 显示字符数上限，随宽度联动
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
  // 返回 { positions: Map<id, {x,y}>, worldW, worldH }
  function layout(visibleRoot) {
    const positions = new Map();
    let leafIndex = 0;

    // 先计算叶子节点 y
    function assignY(node) {
      if (!node.children.length) {
        const y = PAD_TOP + leafIndex * (NODE_H + ROW_GAP);
        positions.set(node.id, { x: 0, y });
        leafIndex++;
        return y;
      }
      const childYs = node.children.map(assignY);
      const avg = childYs.reduce((a, b) => a + b, 0) / childYs.length;
      positions.set(node.id, { x: 0, y: avg });
      return avg;
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
    let maxX = 0, maxY = 0;
    positions.forEach(p => {
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    return {
      positions,
      worldW: maxX + NODE_W + PAD_RIGHT,
      worldH: maxY + NODE_H + PAD_BOTTOM
    };
  }

  // ============ 工具：文字截断 ============
  function truncate(text, max) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
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
    const { positions, worldW, worldH } = layout(visible);

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
      const branch = branchIndex.get(vnode.id);
      const branchColor = branch && branch.color ? branch.color : '#8a8579';

      // 先画到子节点的连线
      vnode.children.forEach(child => {
        const cpos = positions.get(child.id);
        const startX = pos.x + NODE_W;
        const startY = pos.y + NODE_H / 2;
        const endX = cpos.x;
        const endY = cpos.y + NODE_H / 2;
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

      // 背景圆角矩形
      g.appendChild(svg('rect', {
        class: 'node-bg',
        width: NODE_W,
        height: NODE_H,
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
        cy: NODE_H / 2,
        r: 6
      }));

      // 节点名称
      const title = svg('text', {
        class: 'node-title',
        x: 28,
        y: NODE_H / 2 - 3,
        'dominant-baseline': 'middle'
      });
      title.textContent = truncate(realNode.label, NODE_LABEL_MAX);
      g.appendChild(title);

      // 元信息（时间 / 子节点数）
      const meta = svg('text', {
        class: 'node-meta',
        x: 28,
        y: NODE_H / 2 + 14,
        'dominant-baseline': 'middle'
      });
      const nodeWords = realNode.words || realNode.time || '';
      const metaText = hasChildren
        ? `${nodeWords} · ${realNode.children.length} 项`
        : nodeWords;
      meta.textContent = metaText;
      g.appendChild(meta);

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
        </div>
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
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
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

  function zoom(delta) {
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
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
    // 字符数上限随宽度线性联动：184px ≈ 16 字
    NODE_LABEL_MAX = Math.max(6, Math.round((NODE_W - 44) / 8.75));
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

      // 滚轮缩放
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 / 1.1 : 1.1;
        zoom(delta);
      }, { passive: false });
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

    // 默认收起所有 depth >= 2 的分支
    nodeIndex.forEach((node, id) => {
      const d = depthIndex.get(id);
      if (d >= 2 && node.children && node.children.length) {
        collapsedNodes.add(id);
      }
    });

    bindEvents();
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
