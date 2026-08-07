/* 学海无涯 · 主题切换
   在页面右上角注入一个日/夜切换按钮，点击在浅色与深色之间切换。

   为什么需要它：
   手机浏览器的「强制深色网页」会反转 CSS 背景，但反转不了 SVG 的
   fill —— 知识树节点底被染深、节点文字仍是深墨，字就消失了。
   与浏览器较劲不如自己控制：页面声明 only light 拒绝被反转，
   再由这个按钮切换 <html data-theme>，走我们自己的深色配色。

   选择记在 localStorage，跨页面、跨会话保持一致。 */
(function () {
  var KEY = 'xhwy-theme';          // localStorage 键名
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    // 同步浏览器 UI 配色（地址栏等），避免深色页面配白色地址栏
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'dark' ? '#1c1e1b' : '#faf7f2');
  }

  function label(btn, theme) {
    // 按钮显示「将要切换到的模式」，符合用户预期
    btn.textContent = theme === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    btn.setAttribute('title', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  }

  function init() {
    // 建按钮
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    label(btn, current());

    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      label(btn, next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });

    document.body.appendChild(btn);
  }

  // 读取已保存的选择（尽早执行，减少闪烁）
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'dark') apply('dark');
  } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
