/* ============================================================
   学海无涯 · 互动实验室组件库
   自动扫描 [data-lab] 容器并初始化对应组件
   用法：<div class="lab" data-lab="color-picker"></div>
   ============================================================ */

(function () {
  'use strict';

  // ============ 工具函数 ============
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function head(box, tag, title, hint) {
    const h = el('div', 'lab-head');
    h.appendChild(el('span', 'lab-tag', tag));
    h.appendChild(el('span', 'lab-title', title));
    box.appendChild(h);
    if (hint) box.dataset.hint = hint;
  }

  function foot(box, hint) {
    if (hint) box.appendChild(el('div', 'lab-hint', hint));
  }

  function slider(labelText, min, max, val, step) {
    const row = el('div', 'lab-row');
    const lb = el('label', null, labelText);
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = min; inp.max = max; inp.value = val; inp.step = step || 1;
    const out = el('output', null, val);
    row.appendChild(lb); row.appendChild(inp); row.appendChild(out);
    return { row: row, input: inp, output: out };
  }

  // HSL → RGB
  function hsl2rgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }

  function rgb2hex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function hex2rgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  // 相对亮度（WCAG）
  function luminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function contrastRatio(c1, c2) {
    const l1 = luminance.apply(null, hex2rgb(c1));
    const l2 = luminance.apply(null, hex2rgb(c2));
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  // ============ 组件 1 · 色盘 ============
  function buildColorPicker(box) {
    head(box, 'Try it', '调色盘 · 拖动滑块调出你想要的颜色');

    const stage = el('div', 'lab-color-stage');
    const swatch = el('div', 'lab-swatch');
    const codes = el('div', 'lab-color-codes');
    codes.innerHTML =
      '<div class="lab-code"><b>HEX</b><span data-k="hex">#556B3D</span></div>' +
      '<div class="lab-code"><b>RGB</b><span data-k="rgb">rgb(85, 107, 61)</span></div>' +
      '<div class="lab-code"><b>HSL</b><span data-k="hsl">hsl(85, 27%, 33%)</span></div>';
    stage.appendChild(swatch); stage.appendChild(codes);
    box.appendChild(stage);

    const H = slider('色相 H', 0, 360, 85);
    const S = slider('饱和 S', 0, 100, 27);
    const L = slider('亮度 L', 0, 100, 33);
    [H, S, L].forEach(s => box.appendChild(s.row));

    const presets = el('div', 'lab-presets');
    [['#556B3D', '本站主绿'], ['#4A6D8C', '智能蓝'], ['#8A5A7A', '界面紫'],
     ['#A05A2C', '强调橙'], ['#2B2A26', '墨黑'], ['#FAF7F2', '纸白']]
      .forEach(([hex, name]) => {
        const b = document.createElement('button');
        b.style.background = hex;
        b.title = name + ' ' + hex;
        b.addEventListener('click', () => setFromHex(hex));
        presets.appendChild(b);
      });
    box.appendChild(presets);

    function update() {
      const h = +H.input.value, s = +S.input.value, l = +L.input.value;
      H.output.textContent = h + '°';
      S.output.textContent = s + '%';
      L.output.textContent = l + '%';
      const [r, g, b] = hsl2rgb(h, s, l);
      swatch.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
      codes.querySelector('[data-k="hex"]').textContent = rgb2hex(r, g, b);
      codes.querySelector('[data-k="rgb"]').textContent = 'rgb(' + r + ', ' + g + ', ' + b + ')';
      codes.querySelector('[data-k="hsl"]').textContent = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }

    function setFromHex(hex) {
      const [r, g, b] = hex2rgb(hex);
      // RGB → HSL
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
      const d = mx - mn;
      let h = 0;
      if (d !== 0) {
        if (mx === rn) h = ((gn - bn) / d) % 6;
        else if (mx === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h = Math.round(h * 60); if (h < 0) h += 360;
      }
      const l = (mx + mn) / 2;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      H.input.value = h; S.input.value = Math.round(s * 100); L.input.value = Math.round(l * 100);
      update();
    }

    [H, S, L].forEach(s => s.input.addEventListener('input', update));
    update();

    foot(box, '点击色值可直接选中复制。HSL 比 RGB 更适合手调——固定色相只改亮度，就能得到一整套同色系深浅。');
  }

  // ============ 组件 2 · 对比度检查 ============
  function buildContrast(box) {
    head(box, 'Try it', '对比度检查器 · 文字在背景上够清楚吗');

    const preview = el('div', 'lab-contrast-preview');
    preview.innerHTML = '<div class="big">学海无涯</div><div class="small">正文小字预览 · 14px sample text</div>';
    box.appendChild(preview);

    const row1 = el('div', 'lab-row');
    row1.innerHTML = '<label>文字色</label>';
    const fg = document.createElement('input'); fg.type = 'color'; fg.value = '#2B2A26';
    row1.appendChild(fg);
    const row2 = el('div', 'lab-row');
    row2.innerHTML = '<label>背景色</label>';
    const bg = document.createElement('input'); bg.type = 'color'; bg.value = '#FAF7F2';
    row2.appendChild(bg);
    box.appendChild(row1); box.appendChild(row2);

    const ratio = el('div', 'lab-ratio');
    box.appendChild(ratio);

    function update() {
      preview.style.color = fg.value;
      preview.style.background = bg.value;
      const r = contrastRatio(fg.value, bg.value);
      const rs = r.toFixed(2);
      const aaSmall = r >= 4.5, aaLarge = r >= 3, aaaSmall = r >= 7;
      ratio.innerHTML =
        '<span class="num">' + rs + ' : 1</span>' +
        '<span class="lab-badge ' + (aaSmall ? 'pass' : 'fail') + '">AA 正文 ' + (aaSmall ? '通过' : '不足') + '</span>' +
        '<span class="lab-badge ' + (aaLarge ? 'pass' : 'fail') + '">AA 大字 ' + (aaLarge ? '通过' : '不足') + '</span>' +
        '<span class="lab-badge ' + (aaaSmall ? 'pass' : 'fail') + '">AAA ' + (aaaSmall ? '通过' : '不足') + '</span>';
    }

    fg.addEventListener('input', update);
    bg.addEventListener('input', update);
    update();

    foot(box, 'WCAG 标准：正文需 ≥ 4.5:1，大字（18pt 以上或 14pt 粗体）需 ≥ 3:1，最高等级 AAA 需 ≥ 7:1。浅灰字配白底是最常见的踩坑。');
  }

  // ============ 组件 3 · 盒模型 ============
  function buildBoxModel(box) {
    head(box, 'Try it', '盒模型拆解 · 拖动看四层怎么叠出来');

    const stage = el('div', 'lab-box-stage');
    const m = el('div', 'lab-box-margin');
    const b = el('div', 'lab-box-border');
    const p = el('div', 'lab-box-padding');
    const c = el('div', 'lab-box-content', 'content');
    p.appendChild(c); b.appendChild(p); m.appendChild(b); stage.appendChild(m);
    box.appendChild(stage);

    const M = slider('margin', 0, 40, 16);
    const B = slider('border', 0, 20, 6);
    const P = slider('padding', 0, 40, 14);
    [M, B, P].forEach(s => box.appendChild(s.row));

    const legend = el('div', 'lab-box-legend');
    legend.innerHTML =
      '<span><i style="background:rgba(160,90,44,.3)"></i>margin 外边距</span>' +
      '<span><i style="background:rgba(85,107,61,.5)"></i>border 边框</span>' +
      '<span><i style="background:rgba(74,109,140,.35)"></i>padding 内边距</span>' +
      '<span><i style="background:#fff;border:1px dashed #e2dccf"></i>content 内容</span>';
    box.appendChild(legend);

    function update() {
      m.style.padding = M.input.value + 'px';
      b.style.padding = B.input.value + 'px';
      p.style.padding = P.input.value + 'px';
      M.output.textContent = M.input.value + 'px';
      B.output.textContent = B.input.value + 'px';
      P.output.textContent = P.input.value + 'px';
    }
    [M, B, P].forEach(s => s.input.addEventListener('input', update));
    update();

    foot(box, '默认 <code>box-sizing: content-box</code> 下，width 只算 content；改成 <code>border-box</code> 后 width 含 padding 和 border——这就是现代 CSS 几乎都写 <code>box-sizing: border-box</code> 的原因。');
  }

  // ============ 组件 4 · Flexbox 演练场 ============
  function buildFlexbox(box) {
    head(box, 'Try it', 'Flexbox 演练场 · 换个值立刻看效果');

    const stage = el('div', 'lab-flex-stage');
    stage.innerHTML = '<div>1</div><div>2</div><div>3</div><div>4</div>';
    box.appendChild(stage);

    const opts = {
      'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
      'justify-content': ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
      'align-items': ['stretch', 'flex-start', 'center', 'flex-end'],
      'flex-wrap': ['nowrap', 'wrap']
    };

    const codeOut = el('pre', null, '');
    Object.keys(opts).forEach(prop => {
      const row = el('div', 'lab-row');
      row.appendChild(el('label', null, prop.replace('flex-', '').replace('justify-', 'justify')));
      const sel = document.createElement('select');
      opts[prop].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => { stage.style[prop] = sel.value; render(); });
      row.appendChild(sel);
      box.appendChild(row);
      opts[prop + '_el'] = sel;
    });

    box.appendChild(codeOut);

    function render() {
      const lines = ['.container {', '  display: flex;'];
      Object.keys(opts).forEach(p => {
        if (p.endsWith('_el')) return;
        const sel = opts[p + '_el'];
        if (sel && sel.value !== opts[p][0]) lines.push('  ' + p + ': ' + sel.value + ';');
      });
      lines.push('}');
      codeOut.innerHTML = '<code>' + lines.join('\n') + '</code>';
    }
    render();

    foot(box, 'Flex 是一维布局——先用 <code>flex-direction</code> 定主轴方向，再用 <code>justify-content</code> 管主轴排列、<code>align-items</code> 管交叉轴对齐。记住这个分工就不会混。');
  }

  // ============ 组件 5 · 像素放大镜 ============
  function buildPixelZoom(box) {
    head(box, 'Try it', '像素放大镜 · 分辨率越低越糊');

    const grid = el('div', 'lab-pixel-grid');
    box.appendChild(grid);

    const N = slider('网格数', 4, 48, 12);
    box.appendChild(N.row);

    function update() {
      const n = +N.input.value;
      N.output.textContent = n + '×' + n;
      grid.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
      grid.innerHTML = '';
      const cx = (n - 1) / 2, cy = (n - 1) / 2, R = n * 0.36;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const cell = document.createElement('div');
          // 圆形边缘做灰度过渡，模拟抗锯齿
          const t = Math.max(0, Math.min(1, R - d));
          const v = Math.round(255 - t * 190);
          cell.style.background = 'rgb(' + v + ',' + Math.round(v * 0.98) + ',' + Math.round(v * 0.93) + ')';
          grid.appendChild(cell);
        }
      }
    }
    N.input.addEventListener('input', update);
    update();

    foot(box, '同一个圆，网格少时边缘全是锯齿，网格多时才平滑。这就是分辨率的意义——也是为什么矢量图要在具体尺寸下重新光栅化一遍。');
  }

  // ============ 组件 6 · 事件冒泡 ============
  function buildEventFlow(box) {
    head(box, 'Try it', '事件冒泡 · 点最里层，看它一路往外传');

    const stage = el('div', 'lab-event-stage');
    const outer = el('div', 'lab-event-layer', 'div.outer');
    const middle = el('div', 'lab-event-layer', 'div.middle');
    const inner = el('div', 'lab-event-layer', 'button.inner &nbsp;👈 点我');
    middle.appendChild(inner); outer.appendChild(middle); stage.appendChild(outer);
    box.appendChild(stage);

    const row = el('div', 'lab-row');
    const btnStop = document.createElement('button');
    btnStop.textContent = '开启 stopPropagation';
    let stop = false;
    btnStop.addEventListener('click', () => {
      stop = !stop;
      btnStop.className = stop ? 'primary' : '';
      btnStop.textContent = stop ? '已开启 stopPropagation' : '开启 stopPropagation';
    });
    const btnClear = document.createElement('button');
    btnClear.textContent = '清空日志';
    row.appendChild(btnStop); row.appendChild(btnClear);
    box.appendChild(row);

    const log = el('div', 'lab-log', '<div class="empty">点击上面的方块，这里会显示事件传播路径…</div>');
    box.appendChild(log);
    let empty = true;

    function write(txt) {
      if (empty) { log.innerHTML = ''; empty = false; }
      const d = el('div', null, txt);
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }

    btnClear.addEventListener('click', () => {
      log.innerHTML = '<div class="empty">点击上面的方块，这里会显示事件传播路径…</div>';
      empty = true;
    });

    [[inner, 'button.inner'], [middle, 'div.middle'], [outer, 'div.outer']].forEach(([node, name]) => {
      node.addEventListener('click', function (e) {
        node.classList.add('hit');
        setTimeout(() => node.classList.remove('hit'), 380);
        write('<b>' + name + '</b> 收到 click（冒泡阶段）');
        if (stop && node === inner) {
          e.stopPropagation();
          write('&nbsp;&nbsp;↳ stopPropagation() —— 传播中断，外层收不到了');
        }
      });
    });

    foot(box, '一次点击会先从最外层"捕获"进来、命中目标、再一路"冒泡"出去。事件委托就是利用冒泡——在父元素上挂一个监听器，管理成百上千个子元素。');
  }

  // ============ 组件 7 · 帧率模拟 ============
  function buildFps(box) {
    head(box, 'Try it', '帧率对比 · 60fps 和 20fps 差多少');

    const t1 = el('div', 'lab-fps-track');
    const b1 = el('div', 'lab-fps-ball');
    t1.appendChild(b1); box.appendChild(t1);

    const F = slider('帧率', 5, 60, 60);
    box.appendChild(F.row);

    let x = 0, dir = 1, last = 0;
    function loop(ts) {
      const fps = +F.input.value;
      const interval = 1000 / fps;
      if (ts - last >= interval) {
        last = ts;
        const w = t1.clientWidth - 26;
        x += dir * (w / (fps * 1.6));
        if (x >= w) { x = w; dir = -1; }
        if (x <= 0) { x = 0; dir = 1; }
        b1.style.transform = 'translateX(' + x + 'px)';
      }
      requestAnimationFrame(loop);
    }
    F.input.addEventListener('input', () => { F.output.textContent = F.input.value + ' fps'; });
    F.output.textContent = '60 fps';
    requestAnimationFrame(loop);

    foot(box, '60fps 意味着每帧只有 <code>16.7ms</code> 预算。拉到 20fps 以下，肉眼立刻能察觉到"一顿一顿"——这就是掉帧的感觉。');
  }

  // ============ 组件 8 · DPR 换算器 ============
  function buildConverter(box) {
    head(box, 'Try it', 'DPI / DPR 换算器 · 算算你的屏幕多精细');

    const W = slider('横向像素', 640, 7680, 1920, 1);
    const H2 = slider('纵向像素', 480, 4320, 1080, 1);
    const D = slider('屏幕英寸', 4, 40, 27, 0.1);
    [W, H2, D].forEach(s => box.appendChild(s.row));

    const grid = el('div', 'lab-convert-grid');
    box.appendChild(grid);

    function update() {
      const w = +W.input.value, h = +H2.input.value, d = +D.input.value;
      W.output.textContent = w + 'px';
      H2.output.textContent = h + 'px';
      D.output.textContent = d + '″';
      const diagPx = Math.sqrt(w * w + h * h);
      const ppi = diagPx / d;
      const dpr = ppi >= 260 ? 3 : ppi >= 180 ? 2 : 1;
      grid.innerHTML =
        '<div class="lab-convert-cell"><b>PPI</b><span>' + ppi.toFixed(0) + '</span></div>' +
        '<div class="lab-convert-cell"><b>对角像素</b><span>' + diagPx.toFixed(0) + '</span></div>' +
        '<div class="lab-convert-cell"><b>推荐 DPR</b><span>' + dpr + 'x</span></div>' +
        '<div class="lab-convert-cell"><b>逻辑宽度</b><span>' + Math.round(w / dpr) + '</span></div>';
    }
    [W, H2, D].forEach(s => s.input.addEventListener('input', update));
    update();

    foot(box, 'PPI = 对角线像素数 ÷ 对角线英寸。大约 160 PPI 是 1x 基准；iPhone 一类 460 PPI 的屏幕用 3x，所以要准备 @3x 图。');
  }

  // ============ 组件 9 · 小测验 ============
  function buildQuiz(box) {
    const q = box.dataset.q || '这道题还没配置。';
    const opts = (box.dataset.opts || '').split('|').filter(Boolean);
    const answer = parseInt(box.dataset.answer || '0', 10);
    const explain = box.dataset.explain || '';

    head(box, 'Check', '随手一测 · 看看真的懂了没');
    box.appendChild(el('div', 'lab-quiz-q', q));

    const wrap = el('div', 'lab-quiz-opts');
    const explainBox = el('div', 'lab-quiz-explain', explain);
    explainBox.style.display = 'none';

    opts.forEach((text, i) => {
      const b = document.createElement('button');
      b.textContent = text;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        Array.from(wrap.children).forEach((c, j) => {
          c.disabled = true;
          if (j === answer) c.classList.add('correct');
          else if (j === i) c.classList.add('wrong');
        });
        explainBox.style.display = '';
      });
      wrap.appendChild(b);
    });

    box.appendChild(wrap);
    box.appendChild(explainBox);
  }

  // ============ 组件 10 · 命令拆解器 ============
  function buildCmdBreak(box) {
    head(box, 'Try it', '命令拆解器 · 看清一条命令的三段结构');

    const row = el('div', 'lab-row');
    row.appendChild(el('label', null, '命令'));
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = box.dataset.default || 'git commit -m "fix bug" --amend';
    inp.style.flex = '1';
    inp.style.minWidth = '160px';
    row.appendChild(inp);
    box.appendChild(row);

    const out = el('div', 'lab-log', '');
    box.appendChild(out);

    function parse() {
      const raw = inp.value.trim();
      // 简易分词：保留引号内整体
      const parts = raw.match(/"[^"]*"|'[^']*'|\S+/g) || [];
      if (!parts.length) { out.innerHTML = '<div class="empty">输入一条命令试试…</div>'; return; }
      const rows = [];
      parts.forEach((p, i) => {
        let kind;
        if (i === 0) kind = '命令 command —— 要调用哪个程序';
        else if (/^--/.test(p)) kind = '长选项 long option —— 完整单词形式的开关';
        else if (/^-/.test(p)) kind = '短选项 short option —— 单字母开关';
        else if (i === 1 && !/^-/.test(p)) kind = '子命令 / 参数 —— 操作对象或子功能';
        else kind = '参数 argument —— 传给命令的值';
        rows.push('<div><b>' + p.replace(/</g, '&lt;') + '</b> · ' + kind + '</div>');
      });
      out.innerHTML = rows.join('');
    }
    inp.addEventListener('input', parse);
    parse();

    foot(box, '几乎所有命令行工具都遵循「命令 + 选项 + 参数」三段结构。认出这个模式，看陌生命令就不再懵。');
  }

  // ============ 注册表 ============
  const builders = {
    'color-picker': buildColorPicker,
    'contrast': buildContrast,
    'box-model': buildBoxModel,
    'flexbox': buildFlexbox,
    'pixel-zoom': buildPixelZoom,
    'event-flow': buildEventFlow,
    'fps': buildFps,
    'converter': buildConverter,
    'quiz': buildQuiz,
    'cmd-break': buildCmdBreak
  };

  // ============ 自动初始化 ============
  function init() {
    document.querySelectorAll('[data-lab]').forEach(box => {
      if (box.dataset.labReady === '1') return;
      const type = box.dataset.lab;
      const fn = builders[type];
      if (!fn) { console.warn('[interactive] unknown lab type:', type); return; }
      try {
        fn(box);
        box.dataset.labReady = '1';
      } catch (err) {
        console.error('[interactive] build failed:', type, err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__xhwyLab = { init: init, builders: builders };
})();
