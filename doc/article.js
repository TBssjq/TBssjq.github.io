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

const ICON_COPY = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 0 01-2-2V6a2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
const ICON_OK = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

function copyCode(btn) {
    const code = btn.closest('.code-block')?.querySelector('code')?.textContent;
    if (!code) return;

    // 非 HTTPS / 权限被拒时 clipboard API 会 reject，不能静默吞掉
    navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = ICON_OK;
        btn.style.opacity = '1';
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' });
        }
        setTimeout(() => { btn.innerHTML = ICON_COPY; }, 2000);
    }).catch(() => {
        btn.style.opacity = '1';
        btn.title = '复制失败，请手动选择代码';
        setTimeout(() => { btn.title = ''; }, 2000);
    });
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    updateGiscusTheme();
    if (typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo('#themeToggle', { rotation: -90 }, { rotation: 0, duration: 0.6, ease: 'back.out(1.7)' });
    }
});

initGiscus();

// 代码块复制按钮：绑定事件
document.querySelectorAll('.code-block .copy-btn').forEach((b) => {
    b.addEventListener('click', () => copyCode(b));
});

/* ═══════════════════════════════════════════
   GSAP 动效（文章页）
   ═══════════════════════════════════════════ */
(function initArticleAnim() {
    if (typeof gsap === 'undefined') return;
    if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
    gsap.defaults({ ease: 'power3.out', duration: 0.6 });

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s) => document.querySelector(s);

    // ── 阅读进度条 ──
    const prog = document.createElement('div');
    prog.className = 'read-progress';
    document.body.appendChild(prog);
    gsap.set(prog, { scaleX: 0, transformOrigin: 'left center' });
    const setProg = gsap.quickTo(prog, 'scaleX', { duration: 0.18, ease: 'none' });

    // ── 标题入场 ──
    const title = $('.article-title');
    if (title) {
        if (reduced) {
            gsap.set(title, { autoAlpha: 1 });
        } else {
            gsap.from(title, { yPercent: 28, autoAlpha: 0, duration: 0.7, ease: 'power3.out' });
        }
    }
    if ($('.article-meta') && !reduced) {
        gsap.from('.article-meta', { y: 14, autoAlpha: 0, duration: 0.5, delay: 0.18 });
    }

    // ── 正文逐块进入视口浮现 ──
    const blocks = Array.prototype.slice.call(
        document.querySelectorAll('.article-body > p, .article-body > h2, .article-body > h3, .article-body > blockquote, .article-body > ul, .article-body > ol, .article-body > pre, .article-body > .code-block, .article-body > table, .article-body > hr')
    );

    if (reduced || !('IntersectionObserver' in window)) {
        gsap.set(blocks, { autoAlpha: 1 });
    } else {
        gsap.set(blocks, { autoAlpha: 0, y: 26 });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                // 同一批进入的元素做轻微错峰
                const delay = Math.min(0.12, (el.__ioIndex || 0) * 0.03);
                gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.6, delay, ease: 'power3.out', overwrite: 'auto' });
                io.unobserve(el);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        blocks.forEach((el, i) => { el.__ioIndex = i % 6; io.observe(el); });
    }

    // ── 图片载入淡入 ──
    document.querySelectorAll('.article-body img').forEach((img) => {
        if (img.complete) return;
        img.style.opacity = '0';
        img.addEventListener('load', () => {
            if (typeof gsap !== 'undefined' && !reduced) gsap.to(img, { opacity: 1, duration: 0.6 });
            else img.style.opacity = '1';
        });
    });

    // ── 返回顶部按钮 ──
    const btt = document.createElement('button');
    btt.className = 'back-to-top';
    btt.type = 'button';
    btt.setAttribute('aria-label', '返回顶部');
    btt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btt);
    gsap.set(btt, { autoAlpha: 0, scale: 0.6, y: 10 });

    btt.addEventListener('click', () => {
        if (window.ScrollToPlugin) gsap.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: 'power2.inOut' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── 滚动驱动：进度条 + 返回顶部显隐 ──
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            const p = max > 0 ? doc.scrollTop / max : 0;
            setProg(p);
            const show = doc.scrollTop > 360;
            gsap.to(btt, { autoAlpha: show ? 1 : 0, scale: show ? 1 : 0.6, y: show ? 0 : 10, duration: 0.3, overwrite: 'auto' });
            ticking = false;
        });
    }, { passive: true });
})();
