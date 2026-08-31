// 主题预置脚本：必须在渲染前同步执行，否则会闪一下白底。
// 单独成文件是为了满足后台的严格 CSP（禁止内联脚本）。
(function () {
    var KEY = 'blog-admin-theme';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }

    var dark = saved === 'dark' ||
        (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
