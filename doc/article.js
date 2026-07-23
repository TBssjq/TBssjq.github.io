// 用户没手动选过时，跟随系统暗色偏好
const root = document.documentElement;
const stored = localStorage.getItem('theme');
if (stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
}

// 评论区主题跟着站点手动暗色开关走（giscus 是跨域 iframe，只能靠 postMessage 同步）
const GISCUS_LIGHT = 'https://TBssjq.github.io/giscus-light.css';
const GISCUS_DARK = 'https://TBssjq.github.io/giscus-dark.css';
const giscusTheme = () => root.classList.contains('dark') ? GISCUS_DARK : GISCUS_LIGHT;

function updateGiscusTheme() {
    document.querySelector('iframe.giscus-frame')
        ?.contentWindow
        ?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, 'https://giscus.app');
}

// 没有 .giscus 挂载点（比如编辑器页）就不加载评论
function initGiscus() {
    if (!document.querySelector('.giscus')) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', 'TBssjq/TBssjq.github.io');
    s.setAttribute('data-repo-id', 'R_kgDOPdTWEg');
    s.setAttribute('data-category', 'General');
    s.setAttribute('data-category-id', 'DIC_kwDOPdTWEs4DAcaC');
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-lang', 'zh-CN');
    s.setAttribute('data-theme', giscusTheme());
    s.setAttribute('data-loading', 'lazy');
    document.body.appendChild(s);
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    updateGiscusTheme();
});

initGiscus();

const ICON_COPY = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
const ICON_OK = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

function copyCode(btn) {
    const code = btn.closest('.code-block')?.querySelector('code')?.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = ICON_OK;
        btn.style.opacity = '1';
        setTimeout(() => { btn.innerHTML = ICON_COPY; }, 2000);
    });
}
