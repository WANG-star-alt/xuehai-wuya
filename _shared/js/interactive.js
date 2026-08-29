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

  // ============ 组件 11 · 分词器（Tokenizer 模拟） ============
  function buildTokenizer(box) {
    head(box, 'Try it', '分词器 · 看看模型眼里你的话被切成了什么');

    const row = el('div', 'lab-row');
    row.appendChild(el('label', null, '输入'));
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = box.dataset.default || '学海无涯，AI tokenization 很有意思！';
    inp.style.flex = '1'; inp.style.minWidth = '150px';
    row.appendChild(inp);
    box.appendChild(row);

    const stage = el('div', 'lab-token-stage');
    box.appendChild(stage);

    const stat = el('div', 'lab-convert-grid');
    box.appendChild(stat);

    function tokenize(text) {
      // 近似规则：CJK 单字成 token；英文按词根+常见后缀粗切；数字整体；标点单独
      const toks = [];
      const re = /[\u4e00-\u9fff]|[A-Za-z]+|[0-9]+|\s+|[^\s]/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const t = m[0];
        if (/^\s+$/.test(t)) continue;
        if (/^[A-Za-z]+$/.test(t) && t.length > 6) {
          // 长英文词常被拆成子词
          toks.push(t.slice(0, 4));
          let rest = t.slice(4);
          while (rest.length > 0) { toks.push(rest.slice(0, 4)); rest = rest.slice(4); }
        } else {
          toks.push(t);
        }
      }
      return toks;
    }

    function update() {
      const text = inp.value;
      const toks = tokenize(text);
      stage.innerHTML = '';
      toks.forEach((t, i) => {
        const s = el('span', 'lab-token', t.replace(/</g, '&lt;'));
        s.style.background = ['#eaece1', '#e4ebf0', '#f0e6ec', '#f3e8dd'][i % 4];
        s.title = 'token #' + (i + 1);
        stage.appendChild(s);
      });
      const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
      stat.innerHTML =
        '<div class="lab-convert-cell"><b>字符数</b><span>' + text.length + '</span></div>' +
        '<div class="lab-convert-cell"><b>Token 数</b><span>' + toks.length + '</span></div>' +
        '<div class="lab-convert-cell"><b>中文字</b><span>' + cjk + '</span></div>' +
        '<div class="lab-convert-cell"><b>字符/Token</b><span>' +
          (toks.length ? (text.length / toks.length).toFixed(2) : '0') + '</span></div>';
    }
    inp.addEventListener('input', update);
    update();

    foot(box, '这是近似演示，真实分词器（BPE / SentencePiece）规则更复杂。关键结论：<mark class="key">一个中文字通常约等于 1 个 token，而英文单词可能被拆成好几个</mark>——所以同样内容，中文的 token 数往往比英文多，计费也就更贵。');
  }

  // ============ 组件 12 · 温度采样模拟 ============
  function buildTemperature(box) {
    head(box, 'Try it', 'Temperature · 调节"想象力"看概率怎么变');

    const T = slider('温度', 1, 200, 100);
    T.input.step = 1;
    box.appendChild(T.row);

    const bars = el('div', 'lab-bars');
    box.appendChild(bars);

    // 模型对"今天天气真___"的原始打分（logits）
    const words = ['好', '不错', '糟糕', '奇怪', '魔幻'];
    const logits = [3.2, 2.4, 1.1, 0.3, -0.6];

    function update() {
      const t = +T.input.value / 100;
      T.output.textContent = t.toFixed(2);
      const ex = logits.map(l => Math.exp(l / Math.max(0.01, t)));
      const sum = ex.reduce((a, b) => a + b, 0);
      const probs = ex.map(e => e / sum);
      bars.innerHTML = '';
      words.forEach((w, i) => {
        const p = probs[i];
        const r = el('div', 'lab-bar-row');
        r.innerHTML =
          '<span class="lab-bar-label">' + w + '</span>' +
          '<span class="lab-bar-track"><i style="width:' + (p * 100).toFixed(1) + '%"></i></span>' +
          '<span class="lab-bar-val">' + (p * 100).toFixed(1) + '%</span>';
        bars.appendChild(r);
      });
    }
    T.input.addEventListener('input', update);
    update();

    foot(box, '温度接近 0 时概率极度集中在最高分那个词——输出稳定但呆板；温度调高，低分词也有机会被选中——更有创意但也更容易胡说。<mark class="key">要准确就调低，要发散就调高</mark>。');
  }

  // ============ 组件 13 · 向量相似度 ============
  function buildEmbedding(box) {
    head(box, 'Try it', '语义向量 · 拖动看两个词"有多像"');

    const stage = el('div', 'lab-vec-stage');
    stage.innerHTML =
      '<svg viewBox="0 0 220 160" class="lab-vec-svg">' +
      '<line x1="20" y1="140" x2="210" y2="140" stroke="#e2dccf" stroke-width="1"/>' +
      '<line x1="20" y1="140" x2="20" y2="10" stroke="#e2dccf" stroke-width="1"/>' +
      '<line id="vA" x1="20" y1="140" x2="150" y2="40" stroke="#4a6d8c" stroke-width="2.5"/>' +
      '<line id="vB" x1="20" y1="140" x2="120" y2="70" stroke="#a05a2c" stroke-width="2.5"/>' +
      '<text id="tA" x="152" y="38" font-size="9" fill="#4a6d8c">猫</text>' +
      '<text id="tB" x="122" y="68" font-size="9" fill="#a05a2c">狗</text>' +
      '</svg>';
    box.appendChild(stage);

    const A = slider('向量 A', 0, 90, 38);
    const B = slider('向量 B', 0, 90, 55);
    [A, B].forEach(s => box.appendChild(s.row));

    const res = el('div', 'lab-convert-grid');
    box.appendChild(res);

    function update() {
      const a = +A.input.value, b = +B.input.value;
      A.output.textContent = a + '°';
      B.output.textContent = b + '°';
      const R = 130;
      const svg = stage.querySelector('svg');
      const set = (id, ang, tid) => {
        const rad = (90 - ang) * Math.PI / 180;
        const x = 20 + R * Math.cos(rad), y = 140 - R * Math.sin(rad);
        svg.querySelector('#' + id).setAttribute('x2', x.toFixed(1));
        svg.querySelector('#' + id).setAttribute('y2', y.toFixed(1));
        const t = svg.querySelector('#' + tid);
        t.setAttribute('x', (x + 3).toFixed(1)); t.setAttribute('y', (y - 2).toFixed(1));
      };
      set('vA', a, 'tA'); set('vB', b, 'tB');
      const diff = Math.abs(a - b);
      const cos = Math.cos(diff * Math.PI / 180);
      let verdict = cos > 0.95 ? '几乎同义' : cos > 0.8 ? '高度相关' : cos > 0.5 ? '有点关系' : cos > 0.1 ? '基本无关' : '毫不相干';
      res.innerHTML =
        '<div class="lab-convert-cell"><b>夹角</b><span>' + diff + '°</span></div>' +
        '<div class="lab-convert-cell"><b>余弦相似度</b><span>' + cos.toFixed(3) + '</span></div>' +
        '<div class="lab-convert-cell"><b>判定</b><span style="font-size:.8rem">' + verdict + '</span></div>';
    }
    [A, B].forEach(s => s.input.addEventListener('input', update));
    update();

    foot(box, '真实的词向量有几百到几千维，这里简化成二维。核心思想不变：<mark class="key">语义相近的词，向量方向也相近，夹角越小余弦值越接近 1</mark>。这就是语义搜索和 RAG 检索的数学基础。');
  }

  // ============ 组件 14 · 神经元计算器 ============
  function buildNeuron(box) {
    head(box, 'Try it', '神经元 · 亲手算一次加权求和 + 激活');

    const X1 = slider('输入 x₁', -20, 20, 8, 1);
    const W1 = slider('权重 w₁', -20, 20, 12, 1);
    const X2 = slider('输入 x₂', -20, 20, -5, 1);
    const W2 = slider('权重 w₂', -20, 20, 7, 1);
    const Bs = slider('偏置 b', -20, 20, 2, 1);
    [X1, W1, X2, W2, Bs].forEach(s => box.appendChild(s.row));

    const rowFn = el('div', 'lab-row');
    rowFn.appendChild(el('label', null, '激活'));
    const sel = document.createElement('select');
    ['ReLU', 'Sigmoid', 'Tanh', '无（线性）'].forEach(v => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
    });
    rowFn.appendChild(sel);
    box.appendChild(rowFn);

    const out = el('div', 'lab-formula');
    box.appendChild(out);

    function update() {
      const x1 = +X1.input.value / 10, w1 = +W1.input.value / 10;
      const x2 = +X2.input.value / 10, w2 = +W2.input.value / 10;
      const b = +Bs.input.value / 10;
      X1.output.textContent = x1.toFixed(1); W1.output.textContent = w1.toFixed(1);
      X2.output.textContent = x2.toFixed(1); W2.output.textContent = w2.toFixed(1);
      Bs.output.textContent = b.toFixed(1);
      const z = x1 * w1 + x2 * w2 + b;
      let a, name = sel.value;
      if (name === 'ReLU') a = Math.max(0, z);
      else if (name === 'Sigmoid') a = 1 / (1 + Math.exp(-z));
      else if (name === 'Tanh') a = Math.tanh(z);
      else a = z;
      out.innerHTML =
        '<div class="lab-formula-line">z = x₁·w₁ + x₂·w₂ + b</div>' +
        '<div class="lab-formula-line">z = (' + x1.toFixed(1) + '×' + w1.toFixed(1) + ') + (' +
          x2.toFixed(1) + '×' + w2.toFixed(1) + ') + ' + b.toFixed(1) +
          ' = <b>' + z.toFixed(3) + '</b></div>' +
        '<div class="lab-formula-line">输出 = ' + name + '(' + z.toFixed(3) + ') = <b class="hi">' +
          a.toFixed(4) + '</b></div>';
    }
    [X1, W1, X2, W2, Bs].forEach(s => s.input.addEventListener('input', update));
    sel.addEventListener('change', update);
    update();

    foot(box, '一个神经元就这两步：<mark class="key">先算加权和，再过激活函数</mark>。注意 ReLU 会把负数直接压成 0——这个"非线性"是神经网络能拟合复杂规律的关键，没有它，再多层也只等于一层线性变换。');
  }

  // ============ 组件 15 · 子网掩码计算器 ============
  function buildSubnet(box) {
    head(box, 'Try it', '子网计算器 · 拖动前缀看网络怎么被切分');

    const row = el('div', 'lab-row');
    row.appendChild(el('label', null, 'IP'));
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = box.dataset.default || '192.168.1.100';
    inp.style.flex = '1'; inp.style.minWidth = '110px';
    row.appendChild(inp);
    box.appendChild(row);

    const P = slider('前缀 /', 8, 32, 24);
    box.appendChild(P.row);

    const grid = el('div', 'lab-convert-grid');
    box.appendChild(grid);
    const bits = el('div', 'lab-bits');
    box.appendChild(bits);

    function update() {
      const p = +P.input.value;
      P.output.textContent = '/' + p;
      const parts = inp.value.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
        grid.innerHTML = '<div class="lab-convert-cell"><b>提示</b><span style="font-size:.75rem">IP 格式不对</span></div>';
        bits.innerHTML = '';
        return;
      }
      const ipNum = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
      const maskNum = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
      const netNum = (ipNum & maskNum) >>> 0;
      const bcNum = (netNum | (~maskNum >>> 0)) >>> 0;
      const toIp = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
      const hosts = p >= 31 ? 0 : Math.pow(2, 32 - p) - 2;
      grid.innerHTML =
        '<div class="lab-convert-cell"><b>子网掩码</b><span style="font-size:.78rem">' + toIp(maskNum) + '</span></div>' +
        '<div class="lab-convert-cell"><b>网络地址</b><span style="font-size:.78rem">' + toIp(netNum) + '</span></div>' +
        '<div class="lab-convert-cell"><b>广播地址</b><span style="font-size:.78rem">' + toIp(bcNum) + '</span></div>' +
        '<div class="lab-convert-cell"><b>可用主机</b><span>' + hosts.toLocaleString() + '</span></div>';
      // 32 位可视化
      let html = '';
      for (let i = 31; i >= 0; i--) {
        const bit = (ipNum >>> i) & 1;
        const isNet = (31 - i) < p;
        html += '<i class="' + (isNet ? 'net' : 'host') + '">' + bit + '</i>';
        if (i % 8 === 0 && i !== 0) html += '<u>.</u>';
      }
      bits.innerHTML = html +
        '<div class="lab-bits-legend"><span><i class="net">0</i> 网络部分（前 ' + p + ' 位）</span>' +
        '<span><i class="host">0</i> 主机部分（后 ' + (32 - p) + ' 位）</span></div>';
    }
    inp.addEventListener('input', update);
    P.input.addEventListener('input', update);
    update();

    foot(box, '子网掩码的作用就是<mark class="key">用一条线把 32 位地址切成"网络部分"和"主机部分"</mark>。前缀越小，网络越大、能容纳的主机越多。<code>/24</code> 是最常见的家用网段，正好 254 台设备。');
  }

  // ============ 组件 16 · 三次握手动画 ============
  function buildHandshake(box) {
    head(box, 'Try it', 'TCP 三次握手 · 点一步走一步');

    const stage = el('div', 'lab-hs-stage');
    stage.innerHTML =
      '<div class="lab-hs-side"><b>客户端</b><div class="lab-hs-state" id="hsC">CLOSED</div></div>' +
      '<div class="lab-hs-mid" id="hsMid"></div>' +
      '<div class="lab-hs-side"><b>服务器</b><div class="lab-hs-state" id="hsS">LISTEN</div></div>';
    box.appendChild(stage);

    const row = el('div', 'lab-row');
    const btnNext = document.createElement('button');
    btnNext.className = 'primary'; btnNext.textContent = '下一步 →';
    const btnReset = document.createElement('button');
    btnReset.textContent = '重来';
    row.appendChild(btnNext); row.appendChild(btnReset);
    box.appendChild(row);

    const log = el('div', 'lab-log', '<div class="empty">点「下一步」开始建立连接…</div>');
    box.appendChild(log);

    const steps = [
      { arrow: '→', text: 'SYN seq=x', c: 'SYN-SENT', s: 'LISTEN',
        note: '客户端发起：我想连你，我的初始序号是 x' },
      { arrow: '←', text: 'SYN+ACK seq=y ack=x+1', c: 'SYN-SENT', s: 'SYN-RCVD',
        note: '服务器回应：收到你的 x，我同意；我的初始序号是 y' },
      { arrow: '→', text: 'ACK ack=y+1', c: 'ESTABLISHED', s: 'ESTABLISHED',
        note: '客户端确认：收到你的 y。至此双向通道打通，可以传数据了' }
    ];
    let step = 0, empty = true;

    function render() {
      const mid = stage.querySelector('#hsMid');
      if (step === 0) {
        mid.innerHTML = '<span class="lab-hs-idle">尚未开始</span>';
        stage.querySelector('#hsC').textContent = 'CLOSED';
        stage.querySelector('#hsS').textContent = 'LISTEN';
        return;
      }
      const s = steps[step - 1];
      mid.innerHTML = '<span class="lab-hs-packet ' + (s.arrow === '→' ? 'fwd' : 'bwd') + '">' +
        s.arrow + ' ' + s.text + '</span>';
      stage.querySelector('#hsC').textContent = s.c;
      stage.querySelector('#hsS').textContent = s.s;
      if (empty) { log.innerHTML = ''; empty = false; }
      const d = el('div', null, '<b>第 ' + step + ' 次</b> ' + s.text + ' —— ' + s.note);
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      if (step === 3) btnNext.disabled = true;
    }

    btnNext.addEventListener('click', () => { if (step < 3) { step++; render(); } });
    btnReset.addEventListener('click', () => {
      step = 0; empty = true; btnNext.disabled = false;
      log.innerHTML = '<div class="empty">点「下一步」开始建立连接…</div>';
      render();
    });
    render();

    foot(box, '为什么必须三次而不是两次？因为<mark class="key">双方都要确认"对方能收到我的消息"</mark>。前两次只能证明服务器收到了客户端，第三次才让服务器确认客户端也收到了自己的回复。');
  }

  // ============ 组件 17 · 时延计算器 ============
  function buildLatency(box) {
    head(box, 'Try it', '时延账本 · 加载一个网页要等多久');

    const D = slider('单程距离 km', 10, 20000, 1000, 10);
    const B = slider('带宽 Mbps', 1, 1000, 100, 1);
    const S = slider('页面大小 KB', 50, 10000, 2000, 50);
    [D, B, S].forEach(s => box.appendChild(s.row));

    const grid = el('div', 'lab-convert-grid');
    box.appendChild(grid);
    const bd = el('div', 'lab-bars');
    box.appendChild(bd);

    function update() {
      const d = +D.input.value, b = +B.input.value, s = +S.input.value;
      D.output.textContent = d + 'km';
      B.output.textContent = b + 'M';
      S.output.textContent = s + 'KB';
      // 光纤中光速约 2/3 真空光速
      const rtt = (d / 200000) * 2 * 1000;   // ms
      const dns = rtt * 1.0;
      const tcp = rtt * 1.0;
      const tls = rtt * 2.0;
      const req = rtt * 1.0;
      const trans = (s * 8 / (b * 1000)) * 1000;
      const total = dns + tcp + tls + req + trans;
      grid.innerHTML =
        '<div class="lab-convert-cell"><b>单程 RTT/2</b><span>' + (rtt / 2).toFixed(1) + 'ms</span></div>' +
        '<div class="lab-convert-cell"><b>往返 RTT</b><span>' + rtt.toFixed(1) + 'ms</span></div>' +
        '<div class="lab-convert-cell"><b>传输耗时</b><span>' + trans.toFixed(0) + 'ms</span></div>' +
        '<div class="lab-convert-cell"><b>总计</b><span>' + total.toFixed(0) + 'ms</span></div>';
      const items = [['DNS 查询', dns], ['TCP 握手', tcp], ['TLS 握手', tls], ['请求响应', req], ['数据传输', trans]];
      bd.innerHTML = '';
      items.forEach(([name, v]) => {
        const r = el('div', 'lab-bar-row');
        r.innerHTML =
          '<span class="lab-bar-label" style="min-width:5.2em">' + name + '</span>' +
          '<span class="lab-bar-track"><i style="width:' + (v / total * 100).toFixed(1) + '%"></i></span>' +
          '<span class="lab-bar-val">' + v.toFixed(0) + 'ms</span>';
        bd.appendChild(r);
      });
    }
    [D, B, S].forEach(s => s.input.addEventListener('input', update));
    update();

    foot(box, '把距离拉到 15000km（跨洋）会发现：<mark class="key">再大的带宽也救不了物理距离带来的时延</mark>。这就是 CDN 存在的全部理由——把内容搬到离用户近的地方，RTT 才是真正的瓶颈。');
  }

  // ============ 组件 18 · 状态码查询 ============
  function buildStatusCode(box) {
    head(box, 'Try it', 'HTTP 状态码 · 点一个看它什么意思');

    const codes = [
      ['200', 'OK', '请求成功，响应体里有你要的东西。最常见的正常状态。', 'ok'],
      ['301', 'Moved Permanently', '永久重定向。资源换地址了，浏览器会记住并下次直接去新地址。', 'redir'],
      ['302', 'Found', '临时重定向。这次去别处拿，但下次还来问我。登录跳转常用。', 'redir'],
      ['304', 'Not Modified', '你缓存的版本还是最新的，不用重新下载。省流量的关键。', 'redir'],
      ['400', 'Bad Request', '你的请求本身格式就有问题，服务器看不懂。', 'cli'],
      ['401', 'Unauthorized', '你没有出示身份凭证。注意：它其实是"未认证"，不是"未授权"。', 'cli'],
      ['403', 'Forbidden', '身份我认了，但你没权限访问这个东西。', 'cli'],
      ['404', 'Not Found', '这个地址上没有东西。最出名的一个状态码。', 'cli'],
      ['429', 'Too Many Requests', '你请求太频繁了，被限流了。等一会儿再来。', 'cli'],
      ['500', 'Internal Server Error', '服务器自己代码崩了。跟你的请求无关，是它的问题。', 'srv'],
      ['502', 'Bad Gateway', '网关/代理找上游服务器要数据，上游给了个无效响应。', 'srv'],
      ['503', 'Service Unavailable', '服务器暂时不可用——过载、维护中，或者正在重启。', 'srv'],
      ['504', 'Gateway Timeout', '网关等上游服务器等太久，超时放弃了。', 'srv']
    ];

    const wrap = el('div', 'lab-codes');
    box.appendChild(wrap);
    const detail = el('div', 'lab-quiz-explain', '点上面任意一个状态码，这里会显示它的含义。');
    box.appendChild(detail);

    codes.forEach(([c, en, zh, kind]) => {
      const b = document.createElement('button');
      b.className = 'lab-code-btn ' + kind;
      b.textContent = c;
      b.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        detail.innerHTML = '<b>' + c + ' ' + en + '</b><br>' + zh;
      });
      wrap.appendChild(b);
    });

    const legend = el('div', 'lab-box-legend');
    legend.innerHTML =
      '<span><i style="background:#d4e2c8"></i>2xx 成功</span>' +
      '<span><i style="background:#dde6ee"></i>3xx 重定向</span>' +
      '<span><i style="background:#f3e4d8"></i>4xx 客户端错误</span>' +
      '<span><i style="background:#f0d8d0"></i>5xx 服务器错误</span>';
    box.appendChild(legend);

    foot(box, '记住首位数字就够了：<mark class="key">2 成功、3 换地方、4 你的错、5 我的错</mark>。排查问题时先看首位，能立刻判断该查自己还是找后端。');
  }

  // ============ 组件 19 · Tab 顺序演示 focus-order ============
  function buildFocusOrder(box) {
    head(box, 'Try it', 'Tab 顺序 · 在六个元素里按一遍 Tab 看队列');

    // 按 DOM 排列的六个元素；ok=有聚焦资格，ti=tabindex（0 自然入队，正数插队）
    const items = [
      { label: '按钮 A',   note: 'button',            ok: true,  ti: 0 },
      { label: 'DIV B',    note: 'div（无 tabindex）', ok: false, ti: null },
      { label: '输入框 C', note: 'input',             ok: true,  ti: 0 },
      { label: 'DIV D',    note: 'div tabindex=2',    ok: true,  ti: 2 },
      { label: '按钮 E',   note: 'button tabindex=1', ok: true,  ti: 1 },
      { label: 'DIV F',    note: 'div tabindex=0',    ok: true,  ti: 0 }
    ];

    // 浏览器真实规则：正数 tabindex 按数值从小到大先走，再按 DOM 顺序走 0
    const pool = items.map((it, i) => ({ label: it.label, note: it.note, ok: it.ok, ti: it.ti, i: i }))
      .filter(it => it.ok);
    const queue = pool.filter(it => it.ti > 0).sort((a, b) => a.ti - b.ti)
      .concat(pool.filter(it => !(it.ti > 0)));

    const stage = el('div', 'lab-fo-stage');
    const chips = [];
    items.forEach((it, i) => {
      const chip = el('div', 'lab-fo-chip' + (it.ok ? '' : ' dim'));
      chip.innerHTML =
        '<span class="lab-fo-tag">DOM 第 ' + (i + 1) + ' 位</span>' +
        '<b>' + it.label + '</b>' +
        '<span class="lab-fo-note">' + it.note + '</span>';
      stage.appendChild(chip);
      chips.push(chip);
    });
    box.appendChild(stage);

    queue.forEach((it, k) => {
      chips[it.i].appendChild(el('span', 'lab-fo-rank', '焦点队列第 ' + (k + 1) + ' 站'));
    });
    items.forEach((it, i) => {
      if (!it.ok) chips[i].appendChild(el('span', 'lab-fo-rank skip', '被跳过'));
    });

    const row = el('div', 'lab-row');
    const btnNext = document.createElement('button');
    btnNext.textContent = 'Tab →';
    const btnPrev = document.createElement('button');
    btnPrev.textContent = '← Shift+Tab';
    const btnReset = document.createElement('button');
    btnReset.textContent = '重置';
    row.appendChild(btnNext); row.appendChild(btnPrev); row.appendChild(btnReset);
    box.appendChild(row);

    const log = el('div', 'lab-log', '<div class="empty">点「Tab →」出发：注意队伍不按 DOM 顺序走——持正数 tabindex 的先插队…</div>');
    box.appendChild(log);
    let pos = -1, started = false;

    function render() {
      chips.forEach(c => c.classList.remove('hit'));
      if (pos >= 0) chips[queue[pos].i].classList.add('hit');
    }
    function noteOf(it) {
      if (it.ti > 0) return 'tabindex=' + it.ti + ' 插队先行';
      return 'tabindex=0 按名单顺序';
    }
    btnNext.addEventListener('click', () => {
      pos = (pos + 1) % queue.length;
      started = true;
      writeLog();
      render();
    });
    btnPrev.addEventListener('click', () => {
      pos = started ? (pos - 1 + queue.length) % queue.length : 0;
      started = true;
      log.innerHTML = '';
      log.appendChild(el('div', null, '倒退一步：焦点回到 <b>' + queue[pos].label + '</b>（Shift+Tab 同样只在队列里走，永远落不到没资格的 DIV B）'));
      render();
    });
    btnReset.addEventListener('click', () => {
      pos = -1; started = false;
      log.innerHTML = '<div class="empty">队列清空，重新出发。</div>';
      render();
    });
    function writeLog() {
      log.innerHTML = '';
      log.appendChild(el('div', null, '焦点走到第 ' + (pos + 1) + ' 站：<b>' + queue[pos].label + '</b>（DOM 第 ' + (queue[pos].i + 1) + ' 位 · ' + noteOf(queue[pos]) + '）'));
    }

    foot(box, '真实浏览器里按 Tab 走的就是这条队列：正数 tabindex 像<strong>插队卡</strong>，持卡人按卡号从小到大先走（E 的 1 号卡、D 的 2 号卡），然后才轮到 tabindex=0 的按 DOM 顺序（A→C→F）；没资格的 DIV B 连队都排不上。<mark class="key">视觉顺序和焦点顺序一旦打架，键盘用户就迷路——纪律是：正数 tabindex 一律别用，顺序交给 DOM。</mark>');
  }

  // ============ 组件 20 · 选型决策机 stack-picker ============
  function buildStackPicker(box) {
    head(box, 'Try it', '选型决策机 · 三问定路线');

    const steps = [
      { q: '① 你要做什么？', opts: ['给自己用的小工具', '正经桌面软件', '数据面板 / AI 演示'] },
      { q: '② 你顺手的语言？', opts: ['Python', '前端 JavaScript', 'C#', '零基础'] },
      { q: '③ 成品给谁用？', opts: ['只有自己', '同事 / 小圈子', '陌生公众'] }
    ];

    const answers = [null, null, null];
    const optRows = [];

    steps.forEach((step, si) => {
      box.appendChild(el('div', 'lab-sp-q', step.q));
      const row = el('div', 'lab-sp-opts');
      step.opts.forEach((opt, oi) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          answers[si] = oi;
          row.querySelectorAll('button').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          render();
        });
        row.appendChild(btn);
      });
      box.appendChild(row);
      optRows.push(row);
    });

    const out = el('div', 'lab-sp-result');
    box.appendChild(out);

    const ctrl = el('div', 'lab-row');
    ctrl.style.marginTop = '0.8rem';
    const reset = document.createElement('button');
    reset.textContent = '重新选择';
    ctrl.appendChild(reset);
    box.appendChild(ctrl);
    reset.addEventListener('click', () => {
      answers.fill(null);
      optRows.forEach(r => r.querySelectorAll('button').forEach(b => b.classList.remove('on')));
      render();
    });

    function recommend() {
      const job = answers[0], lang = answers[1], who = answers[2];
      let r;
      if (job === 2) {
        r = { name: 'Streamlit / Gradio / NiceGUI', why: '浏览器即界面：零前端知识、免安装、手机也能看——数据面板与 AI 演示的命定路线。', sec: '§ 5.4' };
      } else if (job === 0) {
        if (lang === 0) r = { name: 'Tkinter + CustomTkinter', why: '标准库自带零安装，小工具从想法到能跑，常常不超过一小时。', sec: '§ 5.2' };
        else if (lang === 1) r = { name: 'Tauri（或直接写网页）', why: '前端手艺原封复用，体积还体面；不需要桌面壳的话，一张网页更省。', sec: '§ 5.5' };
        else if (lang === 2) r = { name: 'WinForms', why: 'C# 拖控件的最快出活路线，Visual Studio 里二十分钟拖出一个窗体。', sec: '§ 5.5' };
        else r = { name: 'Tkinter', why: '零基础配 Python 起步坡度最缓——先会做东西，再谈换工具。', sec: '§ 5.2' };
      } else {
        if (lang === 0) r = { name: 'PySide6（Qt）', why: 'Python 阵营的工业级全包：多窗口、拖拽设计器、信号槽，正经软件该有的一样不缺。', sec: '§ 5.3' };
        else if (lang === 1) r = { name: 'Electron 或 Tauri', why: '生态最大 vs 体积最省：内存不敏感选 Electron，讲究体面选 Tauri。', sec: '§ 5.5' };
        else if (lang === 2) r = { name: 'Avalonia / WinUI 3', why: 'C# 原生嫡系：Windows 深度集成，要跨平台就 Avalonia。', sec: '§ 5.5' };
        else r = { name: 'Tkinter 起步 → PySide6 进阶', why: '零基础别直接上重装备：先在 § 5.2 站住脚，再迁到 § 5.3——皮和芯分开写，迁移就只是换皮。', sec: '§ 5.2 → § 5.3' };
      }
      let note;
      if (who === 2) note = '受众是陌生公众：§ 5.6 的打包、签名、自动更新三关提前规划——发不出去比功能不全更致命。';
      else if (who === 1) note = '发同事用：按 § 5.6 打包成单文件 exe，对方双击就能跑，别让他装环境。';
      else note = '只有自己用：连打包都可以省，环境即部署，界面丑点无妨。';
      return { r: r, note: note };
    }

    function render() {
      if (answers.some(a => a === null)) {
        out.innerHTML = '<div class="empty">三个问题答完，这里会亮出你的路线。</div>';
        return;
      }
      const m = recommend();
      out.innerHTML =
        '<div class="lab-sp-name">推荐路线 → ' + m.r.name + '</div>' +
        '<div class="lab-sp-why">' + m.r.why + '</div>' +
        '<div class="lab-sp-note">📍 ' + m.note + '</div>' +
        '<div class="lab-sp-sec">施工细节见 ' + m.r.sec + '</div>';
    }

    render();

    foot(box, '这台决策机就是正文那棵决策树的活版：先用途、再语言、后受众。注意「受众」一问不改变路线本身，只决定你在 § 5.6 打包分发上要花多少功夫——<mark class="key">给自己用和发给陌生人，是家常菜和开餐厅的区别，成本天差地别。</mark>');
  }

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
    'cmd-break': buildCmdBreak,
    'tokenizer': buildTokenizer,
    'temperature': buildTemperature,
    'embedding': buildEmbedding,
    'neuron': buildNeuron,
    'subnet': buildSubnet,
    'handshake': buildHandshake,
    'latency': buildLatency,
    'status-code': buildStatusCode,
    'focus-order': buildFocusOrder,
    'stack-picker': buildStackPicker
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
