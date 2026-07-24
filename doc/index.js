// 暗色切换：跟随系统、localStorage 记忆
const root = document.documentElement;
const saved = localStorage.getItem('theme');
if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
}
document.getElementById('themeToggle')?.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
});
