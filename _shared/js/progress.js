// ============================================================
// 学海无涯 · 学习进度标记 progress.js
// 每节末尾「学完了 / 待改进」按钮 + 本机 localStorage 存储
//   1. 章节页：自动在底部 pager 前注入操作条（含待改进备注）
//   2. 主页：提供 XHY_PROGRESS API 供认知树画徽章/进度条，
//      并绑定工具栏「备份 / 导入」按钮
//   3. 标记变化通过回调 + storage 事件实时同步（含跨标签页）
// 存储：localStorage['xhy-progress-v1']
//   { version: 1, marks: { 节点ID: { status:'done'|'improve', ts, note } } }
// ============================================================
(function () {
  'use strict';

  const KEY = 'xhy-progress-v1';
  const listeners = [];

  // ---------- 存储 ----------
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { version: 1, marks: {} };
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || typeof data.marks !== 'object' || !data.marks) {
        return { version: 1, marks: {} };
      }
      return data;
    } catch (e) {
      return { version: 1, marks: {} };
    }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* 存储满 / 隐私模式：静默失败 */ }
    notify();
  }

  function notify() {
    listeners.forEach(fn => { try { fn(); } catch (e) {} });
  }

  // ---------- 公开 API ----------
  const XHY_PROGRESS = {
    KEY: KEY,
    get: function (id) {
      const m = read().marks[id];
      return m ? { status: m.status, ts: m.ts, note: m.note || '' } : null;
    },
    all: function () {
      const out = {};
      const marks = read().marks;
      Object.keys(marks).forEach(id => { out[id] = { status: marks[id].status, ts: marks[id].ts, note: marks[id].note || '' }; });
      return out;
    },
    mark: function (id, status) {
      if (!id) return;
      const data = read();
      if (!status) {
        delete data.marks[id];
      } else {
        const prev = data.marks[id];
        data.marks[id] = { status: status, ts: Date.now(), note: (prev && prev.note) || '' };
      }
      write(data);
    },
    setNote: function (id, note) {
      const data = read();
      const m = data.marks[id];
      if (!m) return;
      m.note = String(note || '').slice(0, 300);
      write(data);
    },
    counts: function (ids) {
      const marks = read().marks;
      const c = { done: 0, improve: 0 };
      ids.forEach(function (id) {
        const m = marks[id];
        if (m && c[m.status] !== undefined) c[m.status]++;
      });
      return c;
    },
    exportJSON: function () {
      return JSON.stringify(read(), null, 2);
    },
    importJSON: function (text) {
      let data = null;
      try { data = JSON.parse(text); } catch (e) { return { ok: false, msg: '文件不是合法的 JSON' }; }
      if (!data || typeof data !== 'object' || typeof data.marks !== 'object' || !data.marks) {
        return { ok: false, msg: '文件格式不对：缺少 marks 字段' };
      }
      const cur = read();
      let n = 0;
      Object.keys(data.marks).forEach(function (id) {
        const m = data.marks[id];
        if (m && (m.status === 'done' || m.status === 'improve')) {
          cur.marks[id] = { status: m.status, ts: m.ts || Date.now(), note: m.note || '' };
          n++;
        }
      });
      write(cur);
      return { ok: true, count: n };
    },
    clearAll: function () {
      write({ version: 1, marks: {} });
    },
    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    }
  };
  window.XHY_PROGRESS = XHY_PROGRESS;

  // 跨标签页同步：别的标签页改了标记，本页收到通知
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) notify();
  });

  // ---------- 节点 ID：从 URL 推导 ----------
  // /chapters/gui/04-1-event-loop.html → gui-04-1（节）
  // /chapters/network/09-toolbox.html → net-09（章总览页）
  // 多节共页特例：AI 篇第 3 章五个小节全写在 03-history.html 一页里，
  // 整页标记时需联动点亮树里这 5 个小节节点
  const PAGE_SECTIONS = {
    'chapters/ai/03-history.html': ['ai-03-early', 'ai-03-expert', 'ai-03-dl', 'ai-03-llm', 'ai-03-lessons']
  };

  function nodeFromLocation() {
    const path = decodeURIComponent(location.pathname);
    const m = path.match(/\/chapters\/(ai|network|gui|elec)\/(\d{2})(?:-(\d))?-/);
    if (!m) return null;
    const prefix = { ai: 'ai', network: 'net', gui: 'gui', elec: 'elec' }[m[1]];
    if (!prefix) return null;
    const node = m[3]
      ? { id: prefix + '-' + m[2] + '-' + m[3], kind: 'section' }
      : { id: prefix + '-' + m[2], kind: 'chapter' };
    Object.keys(PAGE_SECTIONS).forEach(function (k) {
      if (path.indexOf(k) !== -1) node.sections = PAGE_SECTIONS[k];
    });
    return node;
  }

  function fmtDate(ts) {
    const d = new Date(ts);
    const p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  // ---------- 章节页操作条 ----------
  function injectBar() {
    const node = nodeFromLocation();
    if (!node) return;
    const pager = document.querySelector('.pager');
    const article = document.querySelector('article.page');
    const mount = pager || article;
    if (!mount) return;

    const bar = document.createElement('div');
    bar.className = 'read-mark';
    bar.innerHTML =
      '<div class="rm-head">' +
        '<span class="rm-title">' + (node.kind === 'chapter' ? '这一章看完了吗？' : '这一节看完了吗？') + '</span>' +
        '<span class="rm-sub">标记只存本机浏览器 · 主页树状图同步显示</span>' +
      '</div>' +
      '<div class="rm-row">' +
        '<button type="button" class="rm-btn rm-done">✓ 学完了</button>' +
        '<button type="button" class="rm-btn rm-improve">⚠ 待改进</button>' +
        '<span class="rm-status"></span>' +
      '</div>' +
      '<div class="rm-note-row">' +
        '<input type="text" class="rm-note" maxlength="300" placeholder="记一笔：哪里需要改进？（可选，例如「类比太绕」「缺个演示」）">' +
      '</div>';

    if (pager) pager.parentNode.insertBefore(bar, pager);
    else article.appendChild(bar);

    const btnDone = bar.querySelector('.rm-done');
    const btnImprove = bar.querySelector('.rm-improve');
    const statusEl = bar.querySelector('.rm-status');
    const noteRow = bar.querySelector('.rm-note-row');
    const noteInput = bar.querySelector('.rm-note');

    function refresh() {
      const mk = XHY_PROGRESS.get(node.id);
      bar.classList.toggle('mk-done', !!mk && mk.status === 'done');
      bar.classList.toggle('mk-improve', !!mk && mk.status === 'improve');
      btnDone.classList.toggle('active', !!mk && mk.status === 'done');
      btnImprove.classList.toggle('active', !!mk && mk.status === 'improve');
      if (!mk) {
        statusEl.textContent = '';
      } else if (mk.status === 'done') {
        statusEl.textContent = '已学完 · ' + fmtDate(mk.ts) + '（再点一次取消）';
      } else {
        statusEl.textContent = '已标记待改进 · ' + fmtDate(mk.ts) + '（再点一次取消）';
      }
      noteRow.style.display = (mk && mk.status === 'improve') ? '' : 'none';
      if (mk) noteInput.value = mk.note || '';
    }

    function applyMark(status) {
      const mk = XHY_PROGRESS.get(node.id);
      const next = mk && mk.status === status ? null : status;
      XHY_PROGRESS.mark(node.id, next);
      (node.sections || []).forEach(function (sid) { XHY_PROGRESS.mark(sid, next); });
    }

    btnDone.addEventListener('click', function () { applyMark('done'); });
    btnImprove.addEventListener('click', function () { applyMark('improve'); });
    noteInput.addEventListener('change', function () {
      XHY_PROGRESS.setNote(node.id, noteInput.value);
    });

    XHY_PROGRESS.onChange(refresh);
    refresh();
  }

  // ---------- 主页：备份 / 导入 ----------
  function toast(msg) {
    let t = document.getElementById('xhy-progress-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'xhy-progress-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function bindHomeButtons() {
    const btnExport = document.getElementById('btn-export-progress');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        const data = XHY_PROGRESS.exportJSON();
        const d = new Date();
        const p = function (n) { return n < 10 ? '0' + n : '' + n; };
        const name = 'xuehai-progress-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '.json';
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        const n = Object.keys(XHY_PROGRESS.all()).length;
        toast(n ? '已备份 ' + n + ' 条学习标记：' + name : '还没有任何标记，导出了空文件');
      });
    }

    const btnImport = document.getElementById('btn-import-progress');
    if (btnImport) {
      btnImport.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.addEventListener('change', function () {
          const file = input.files && input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function () {
            const r = XHY_PROGRESS.importJSON(String(reader.result));
            toast(r.ok ? '已导入 ' + r.count + ' 条学习标记（合并写入）' : '导入失败：' + r.msg);
          };
          reader.readAsText(file);
        });
        input.click();
      });
    }
  }

  // ---------- 样式（自带，免改全站 CSS） ----------
  function injectStyles() {
    const css = [
      '.read-mark { margin: 2rem 0 1.2rem; padding: 0.9rem 1.1rem 1rem; background: var(--bg3, #fff); border: 1px solid var(--rule, #e2dccf); border-left: 3px solid var(--accent, #556b3d); border-radius: var(--radius, 6px); }',
      '.read-mark.mk-improve { border-left-color: #c2563a; }',
      '.rm-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.7rem; }',
      '.rm-title { font-weight: 700; font-size: 0.92rem; color: var(--ink, #2b2a26); }',
      '.rm-sub { font-size: 0.7rem; color: var(--muted, #8a8579); }',
      '.rm-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }',
      '.rm-btn { padding: 0.42rem 1.05rem; font-size: 0.85rem; font-family: inherit; color: var(--ink-soft, #4a4842); background: var(--bg3, #fff); border: 1.5px solid var(--rule, #d8d1c2); border-radius: 999px; cursor: pointer; transition: all 0.15s; }',
      '.rm-btn:hover { border-color: var(--muted, #8a8579); }',
      '.rm-btn.rm-done.active { background: #5b9c6d; border-color: #5b9c6d; color: #fff; }',
      '.rm-btn.rm-improve.active { background: #c2563a; border-color: #c2563a; color: #fff; }',
      '.rm-status { font-size: 0.74rem; color: var(--muted, #8a8579); }',
      '.rm-note-row { display: none; margin-top: 0.7rem; }',
      '.rm-note { width: 100%; box-sizing: border-box; padding: 0.5rem 0.7rem; font-size: 0.82rem; font-family: inherit; color: var(--ink, #2b2a26); background: var(--bg2, #f2ede4); border: 1px dashed var(--rule, #d8d1c2); border-radius: var(--radius, 6px); outline: none; }',
      '.rm-note:focus { border-color: #c2563a; border-style: solid; }',
      '#xhy-progress-toast { position: fixed; left: 50%; bottom: 2rem; transform: translateX(-50%) translateY(10px); padding: 0.55rem 1.1rem; font-size: 0.82rem; color: #fff; background: rgba(43, 42, 38, 0.92); border-radius: 999px; opacity: 0; pointer-events: none; transition: all 0.25s; z-index: 9999; max-width: 86vw; }',
      '#xhy-progress-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }'
    ].join('\n');
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- 启动 ----------
  function boot() {
    injectStyles();
    injectBar();
    bindHomeButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
