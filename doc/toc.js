/* ══════════════════════════════════════════════════════════════════════
   文章目录组件（可复用，零依赖）

   用法（自动初始化）：
       <aside data-toc></aside>                 ← 目录挂载点
       <div class="article-body" data-toc-content>…</div>   ← 内容容器
       <script src="toc.js" defer></script>

   用法（手动，任意页面）：
       BlogTOC.init({ mount: '#myToc', content: '#myContent',
                      levels: [2,3,4], min: 2, title: '目录' });

   行为：
     · 为缺失 id 的标题补锚点，重复标题自动去重
     · 按 h2/h3/h4 生成缩进导航；点击平滑滚动（尊重 scroll-margin-top）
     · 滚动高亮当前小节，并把它滚进目录自身可视区
     · 桌面端常驻展开，窄屏折叠为可点开的 <details>
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var DESKTOP = '(min-width: 1100px)';
    var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function slugify(text) {
        var t = String(text).toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return t || 'section';
    }

    function uniqueId(el, used) {
        if (el.id) return el.id;
        var base = slugify(el.textContent);
        var id = base;
        var n = 1;
        while (used[id] || document.getElementById(id)) { id = base + '-' + (++n); }
        used[id] = true;
        el.id = id;
        return id;
    }

    function resolve(ref) {
        return typeof ref === 'string' ? document.querySelector(ref) : ref;
    }

    function init(options) {
        var opts = options || {};
        var mount = resolve(opts.mount) || document.querySelector('[data-toc]');
        var content = resolve(opts.content) || document.querySelector('[data-toc-content]') ||
            document.querySelector('.article-body') || document.querySelector('article');
        if (!mount || !content) return null;

        var levels = opts.levels || [2, 3, 4];
        var min = opts.min == null ? 2 : opts.min;
        var title = opts.title || '文章目录';

        var headings = Array.prototype.slice
            .call(content.querySelectorAll(levels.map(function (l) { return 'h' + l; }).join(',')))
            .filter(function (h) { return h.textContent.trim() !== ''; });

        if (headings.length < min) { mount.hidden = true; return null; }

        var used = {};
        var items = headings.map(function (h) {
            return { el: h, id: uniqueId(h, used), level: +h.tagName.slice(1), text: h.textContent.trim() };
        });

        // ── 结构：<details><summary>标题</summary><nav><a>…</nav></details> ──
        var box = document.createElement('details');
        box.className = 'toc-box';

        var summary = document.createElement('summary');
        summary.className = 'toc-summary';
        summary.textContent = title;
        box.appendChild(summary);

        var nav = document.createElement('nav');
        nav.className = 'toc-nav';
        nav.setAttribute('aria-label', title);

        var links = {};
        items.forEach(function (it) {
            var a = document.createElement('a');
            a.className = 'toc-link toc-link--h' + it.level;
            a.href = '#' + it.id;
            a.textContent = it.text;
            a.addEventListener('click', function (e) {
                var target = document.getElementById(it.id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
                history.replaceState(null, '', '#' + it.id);
                if (!mq.matches) box.open = false;   // 窄屏点完收起
            });
            nav.appendChild(a);
            links[it.id] = a;
        });
        box.appendChild(nav);
        mount.hidden = false;
        mount.appendChild(box);

        // ── 桌面展开 / 窄屏折叠 ──
        var mq = window.matchMedia(DESKTOP);
        function applyMode() { box.open = mq.matches; }
        applyMode();
        if (mq.addEventListener) mq.addEventListener('change', applyMode);
        else if (mq.addListener) mq.addListener(applyMode);

        // ── 滚动高亮 ──
        var activeId = null;
        function setActive(id) {
            if (id === activeId) return;
            if (activeId && links[activeId]) links[activeId].classList.remove('is-active');
            activeId = id;
            var a = links[id];
            if (!a) return;
            a.classList.add('is-active');
            // 让高亮项始终在目录可视区内
            var top = a.offsetTop;
            var navTop = nav.scrollTop;
            var navH = nav.clientHeight;
            if (top < navTop || top > navTop + navH - 32) {
                nav.scrollTop = Math.max(0, top - navH / 2);
            }
        }

        var ticking = false;
        function update() {
            var offset = 130;   // 固定头部 + 余量
            var current = items[0].id;
            for (var k = 0; k < items.length; k++) {
                if (items[k].el.getBoundingClientRect().top <= offset) current = items[k].id;
                else break;
            }
            setActive(current);
            ticking = false;
        }
        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();

        return { destroy: function () { mount.hidden = true; mount.innerHTML = ''; } };
    }

    window.BlogTOC = { init: init };

    function autoInit() {
        var mount = document.querySelector('[data-toc]');
        if (mount) init({ mount: mount });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
})();
