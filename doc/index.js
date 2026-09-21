// 目录页交互：暗色切换 + 代码复制 + 分类筛选 + GSAP 动效
// 零依赖、无内联代码；构建时同步到 doc/index.js

function safeStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // 隐私模式 / 存储受限时忽略，页面仍应可用
    }
}

function safeMatchMedia(query) {
    try {
        return typeof matchMedia === 'function' && matchMedia(query).matches;
    } catch (error) {
        return false;
    }
}

/* ── 暗色切换：跟随系统、localStorage 记忆 ── */
const root = document.documentElement;
const saved = safeStorageGet('theme');
if (saved === 'dark' || (!saved && safeMatchMedia('(prefers-color-scheme: dark)')) ) {
    root.classList.add('dark');
}
document.getElementById('themeToggle')?.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    safeStorageSet('theme', dark ? 'dark' : 'light');
});

/* ── 分类筛选（含 Flip 布局过渡）── */
(function initFilter() {
    const chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    const cards = Array.prototype.slice.call(document.querySelectorAll('.article-card'));
    const sections = Array.prototype.slice.call(document.querySelectorAll('.year-section'));
    const emptyHint = document.getElementById('filterEmpty');
    if (!chips.length || !cards.length) return;

    const canFlip = typeof gsap !== 'undefined' && typeof Flip !== 'undefined' &&
        !safeMatchMedia('(prefers-reduced-motion: reduce)');

    // 支持 URL hash 直达某个分类：#随笔
    function applyFilter(value) {
        const state = canFlip ? Flip.getState(cards, { props: 'opacity' }) : null;

        let shown = 0;
        cards.forEach((card) => {
            const match = value === '__all__' || (card.dataset.tags || '').split(' ').indexOf(value) !== -1;
            card.classList.toggle('is-hidden', !match);
            if (match) shown++;
        });

        // 整段年份如果一张卡都不剩就折叠起来，避免出现空标题
        sections.forEach((section) => {
            if (section.classList.contains('is-coming')) return;   // 占位年份始终保留
            const visible = section.querySelectorAll('.article-card:not(.is-hidden)').length;
            section.classList.toggle('is-hidden', visible === 0);
        });

        if (emptyHint) emptyHint.hidden = shown > 0;

        chips.forEach((chip) => {
            const active = chip.dataset.filter === value;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (state) {
            Flip.from(state, {
                duration: 0.5,
                ease: 'power2.inOut',
                scale: true,
                absolute: true,
                onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 },
                    { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }),
                onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.28 }),
            });
        }
    }

    chips.forEach((chip) => {
        chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
        chip.addEventListener('click', () => {
            const value = chip.dataset.filter;
            applyFilter(value);
            // 记录到 hash，方便分享/刷新后保持
            if (value === '__all__') {
                history.replaceState(null, '', location.pathname + location.search);
            } else {
                history.replaceState(null, '', '#' + encodeURIComponent(value));
            }
        });
    });

    const fromHash = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (fromHash && chips.some((c) => c.dataset.filter === fromHash)) applyFilter(fromHash);
})();

/* ═══════════════════════════════════════════
   GSAP 动效（目录页）
   仅做增强：gsap 未加载（如离线）时页面照常工作
   ═══════════════════════════════════════════ */
(function initSiteAnim() {
    if (typeof gsap === 'undefined') return;
    if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
    if (window.Flip) gsap.registerPlugin(Flip);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    const reduced = safeMatchMedia('(prefers-reduced-motion: reduce)');
    gsap.defaults({ ease: 'power3.out', duration: 0.6 });

    const $ = (s) => document.querySelector(s);
    const all = (s) => Array.prototype.slice.call(document.querySelectorAll(s));

    // ── 入场时间线 ──
    if (reduced) {
        gsap.set(['.page-title', '.page-desc', '.filter-bar', '.year-section', '.article-card'], { autoAlpha: 1, clearProps: 'transform' });
    } else {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const title = $('.page-title');
        // 注意：.page-title 用了 background-clip:text 做渐变文字，
        // SplitText 拆字后会包 span，导致渐变失效、字透明不可见 —— 因此这里不用 SplitText，
        // 直接整体上浮入场即可。
        if (title) {
            tl.from(title, { y: 26, autoAlpha: 0, duration: 0.6 }, 0);
        }
        if ($('.page-desc')) tl.from('.page-desc', { y: 18, autoAlpha: 0, duration: 0.5 }, 0.12);
        if ($('.filter-bar')) tl.from('.filter-bar', { y: 18, autoAlpha: 0, duration: 0.5 }, 0.2);

        // 年份标题 + 卡片错峰上浮
        all('.year-section').forEach((sec, i) => {
            tl.from(sec.querySelector('.year-heading'), { x: -16, autoAlpha: 0, duration: 0.5 }, 0.25 + i * 0.08);
            const cards = sec.querySelectorAll('.article-card');
            tl.from(cards, { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.55, clearProps: 'transform' }, 0.3 + i * 0.08);
        });

        // 安全网：时间线跑完后强制清掉 .article-card / .page-title 上的内联 opacity / visibility，
        // 避免 GSAP 与 .article-card 的 transition:all .45s 互相干扰后留下半透明态。
        tl.set(['.page-title', '.article-card'], { clearProps: 'opacity,visibility' });
    }

    // ── 卡片悬停：轻微跟随光标的 3D 倾斜（仅桌面、非减弱动效）──
    const mm = gsap.matchMedia();
    mm.add('(hover: hover) and (min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const setters = new WeakMap();
        const cleanups = [];
        all('.article-card').forEach((card) => {
            const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
            const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
            setters.set(card, { rotX, rotY });
            gsap.set(card, { transformPerspective: 800, transformOrigin: 'center' });
            const enter = () => gsap.to(card, { z: 18, duration: 0.4, ease: 'power2.out' });
            const move = (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                rotY(px * 8); rotX(-py * 8);
            };
            const leave = () => { rotX(0); rotY(0); gsap.to(card, { z: 0, duration: 0.5 }); };
            card.addEventListener('mouseenter', enter);
            card.addEventListener('mousemove', move);
            card.addEventListener('mouseleave', leave);
            cleanups.push(() => { card.removeEventListener('mouseenter', enter); card.removeEventListener('mousemove', move); card.removeEventListener('mouseleave', leave); });
        });
        return () => cleanups.forEach((fn) => fn());
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

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const show = window.scrollY > 320;
            gsap.to(btt, { autoAlpha: show ? 1 : 0, scale: show ? 1 : 0.6, y: show ? 0 : 10, duration: 0.3, overwrite: 'auto' });
            ticking = false;
        });
    }, { passive: true });
})();
