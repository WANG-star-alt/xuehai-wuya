/* 学海无涯 · 悬浮翻页条
   自动把文章底部的 .pager 复制一份，固定到屏幕底部。
   原文末的 .pager 保留（滚到底部也能看到），悬浮条随时可见。 */
(function () {
  function init() {
    var pager = document.querySelector('.pager');
    if (!pager) return;

    // 标记 body，加底部留白
    document.body.classList.add('has-float-pager');

    // 克隆一份，改成悬浮样式
    var float = pager.cloneNode(true);
    float.classList.remove('pager');
    float.classList.add('pager-float');

    // 插到 body 末尾
    document.body.appendChild(float);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
