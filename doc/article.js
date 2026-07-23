// 用户没手动选过时，跟随系统暗色偏好
const root = document.documentElement;
const stored = localStorage.getItem('theme');
if (stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
});

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
