/* 视觉动效与启动 */
window.FX = (function () {
  'use strict';
  var A = window.App;

  /* ---------- 星图画布 ---------- */
  var H = { c: null, ctx: null, w: 0, h: 0, dpr: 1, nodes: [], pulses: [], raf: 0, visible: true, mx: -9999, my: -9999, last: 0, io: null };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function palette() {
    var dark = document.documentElement.classList.contains('dark');
    return dark
      ? { node: '#8fa4ff', edge: [93, 122, 255], hot: '#00e5ff', warm: '#ff2d78', glow: 'rgba(0,229,255,' }
      : { node: '#3d5afe', edge: [36, 56, 184], hot: '#00a5bb', warm: '#c2185b', glow: 'rgba(0,165,187,' };
  }

  function hero() {
    var c = document.getElementById('heroCanvas');
    stopHero();
    if (!c) return;
    H.c = c;
    H.ctx = c.getContext('2d');
    sizeHero();
    var count = Math.max(26, Math.min(78, Math.round(H.w * H.h / 16000)));
    H.nodes = [];
    for (var i = 0; i < count; i++) {
      H.nodes.push({
        x: Math.random() * H.w, y: Math.random() * H.h,
        vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16,
        r: 1.1 + Math.random() * 2.1, ph: Math.random() * Math.PI * 2,
        kind: Math.random() < .16 ? 1 : Math.random() < .3 ? 2 : 0
      });
    }
    H.pulses = [];
    H.visible = true;
    if (H.io) H.io.disconnect();
    H.io = new IntersectionObserver(function (en) {
      H.visible = en[0].isIntersecting && !document.hidden;
      if (H.visible) startHero(); else stopHero();
    }, { threshold: 0 });
    H.io.observe(c);
    c.addEventListener('pointermove', onPointer);
    c.addEventListener('pointerleave', function () { H.mx = -9999; H.my = -9999; });
    if (reduce) { drawHero(0); return; }
    startHero();
  }

  function onPointer(e) {
    var r = H.c.getBoundingClientRect();
    H.mx = e.clientX - r.left; H.my = e.clientY - r.top;
  }

  function sizeHero() {
    if (!H.c) return;
    H.dpr = Math.min(window.devicePixelRatio || 1, 2);
    H.w = H.c.clientWidth; H.h = H.c.clientHeight;
    H.c.width = Math.round(H.w * H.dpr);
    H.c.height = Math.round(H.h * H.dpr);
    H.ctx.setTransform(H.dpr, 0, 0, H.dpr, 0, 0);
  }

  function startHero() {
    if (H.raf || !H.ctx) return;
    H.last = performance.now();
    H.raf = window.requestAnimationFrame(tick);
  }
  function stopHero() {
    if (H.raf) { window.cancelAnimationFrame(H.raf); H.raf = 0; }
  }

  function tick(ts) {
    H.raf = window.requestAnimationFrame(tick);
    var dt = Math.min(48, ts - H.last);
    H.last = ts;
    drawHero(dt);
  }

  function drawHero(dt) {
    var ctx = H.ctx;
    if (!ctx) return;
    var p = palette();
    ctx.clearRect(0, 0, H.w, H.h);
    var n = H.nodes, i, j;
    var step = dt / 16.67;

    for (i = 0; i < n.length; i++) {
      var a = n[i];
      a.x += a.vx * step; a.y += a.vy * step; a.ph += .018 * step;
      if (a.x < -20) a.x = H.w + 20; if (a.x > H.w + 20) a.x = -20;
      if (a.y < -20) a.y = H.h + 20; if (a.y > H.h + 20) a.y = -20;
      if (H.mx > -999) {
        var dx = a.x - H.mx, dy = a.y - H.my, d2 = dx * dx + dy * dy;
        if (d2 < 20000 && d2 > 1) {
          var f = (1 - d2 / 20000) * .5;
          a.x += dx / Math.sqrt(d2) * f * step;
          a.y += dy / Math.sqrt(d2) * f * step;
        }
      }
    }

    ctx.lineWidth = 1;
    var links = [];
    for (i = 0; i < n.length; i++) {
      for (j = i + 1; j < n.length; j++) {
        var dx2 = n[i].x - n[j].x, dy2 = n[i].y - n[j].y;
        var d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d < 138) {
          var al = (1 - d / 138) * .34;
          ctx.strokeStyle = 'rgba(' + p.edge[0] + ',' + p.edge[1] + ',' + p.edge[2] + ',' + al.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(n[i].x, n[i].y); ctx.lineTo(n[j].x, n[j].y); ctx.stroke();
          if (al > .2) links.push([i, j]);
        }
      }
    }

    if (!reduce && links.length && H.pulses.length < 7 && Math.random() < .06) {
      var L = links[Math.floor(Math.random() * links.length)];
      H.pulses.push({ a: L[0], b: L[1], t: 0, sp: .006 + Math.random() * .012, warm: Math.random() < .3 });
    }
    for (i = H.pulses.length - 1; i >= 0; i--) {
      var pu = H.pulses[i];
      pu.t += pu.sp * step;
      if (pu.t >= 1) { H.pulses.splice(i, 1); continue; }
      var na = n[pu.a], nb = n[pu.b];
      var px = na.x + (nb.x - na.x) * pu.t, py = na.y + (nb.y - na.y) * pu.t;
      var col = pu.warm ? p.warm : p.hot;
      ctx.fillStyle = col;
      ctx.globalAlpha = Math.sin(pu.t * Math.PI) * .95;
      ctx.beginPath(); ctx.arc(px, py, 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (i = 0; i < n.length; i++) {
      var b = n[i];
      var breathe = .6 + Math.sin(b.ph) * .4;
      var color = b.kind === 1 ? p.hot : b.kind === 2 ? p.warm : p.node;
      if (b.kind) {
        ctx.fillStyle = p.glow + (.16 * breathe).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 5.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = b.kind ? .95 : .5 + breathe * .35;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 入场 ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .04 });

  /* ---------- 课件配图灯箱 ---------- */
  var lb = null;
  function ensureLightbox() {
    if (lb) return lb;
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', '图片预览');
    lb.innerHTML = '<button class="lightbox-close" type="button" aria-label="关闭预览">✕</button>' +
      '<img alt=""><div class="lightbox-cap"></div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lightbox-close')) closeLightbox();
    });
    return lb;
  }
  function openLightbox(img) {
    var box = ensureLightbox();
    var big = box.querySelector('img');
    var cap = box.querySelector('.lightbox-cap');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    var fig = img.closest('.lesson-fig');
    var fc = fig ? fig.querySelector('figcaption') : null;
    cap.textContent = fc ? fc.textContent.replace(/^课件原图\s*/, '') : (img.alt || '');
    box.classList.add('is-on');
    document.body.classList.add('no-scroll');
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('is-on');
    document.body.classList.remove('no-scroll');
    var big = lb.querySelector('img');
    window.setTimeout(function () { if (!lb.classList.contains('is-on')) big.src = ''; }, 250);
  }

  function afterRender(root) {
    var items = root.querySelectorAll('.rv:not(.in)');
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i, 8) * 45 + 'ms';
      revealIO.observe(el);
    });
    // 配图点击放大
    root.querySelectorAll('.lesson-fig img[data-zoom], .lesson-fig img').forEach(function (img) {
      if (img.__lbBound) return;
      img.__lbBound = true;
      img.addEventListener('click', function () { openLightbox(img); });
    });
  }

  /* ---------- 倒计时 ---------- */
  function refreshDue() {
    document.querySelectorAll('[data-due]').forEach(function (el) {
      var info = A.dueInfo(el.getAttribute('data-due'));
      el.textContent = info.text;
      var row = el.closest('.due-row');
      if (row) { row.classList.toggle('is-urgent', info.urgent); row.classList.toggle('is-past', info.past); }
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    A.applyTheme();
    document.documentElement.style.setProperty('--read-size', A.state.settings.font + 'px');

    document.getElementById('themeBtn').addEventListener('click', A.toggleTheme);

    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');
    function closeMenu() {
      if (!links.classList.contains('is-open')) return;
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.textContent = '☰';
    }
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? '✕' : '☰';
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (burger.contains(e.target) || links.contains(e.target)) return;
      closeMenu();
    });

    document.getElementById('searchBtn').addEventListener('click', window.Views.openSearch);

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); window.Views.openSearch(); return;
      }
      if (e.key === '/' && !typing) { e.preventDefault(); window.Views.openSearch(); return; }
      if (e.key === 'Escape') {
        closeMenu();
        window.Views.closeSearch();
        A.closeDrawer();
        A.hideToast();
        closeLightbox();
      }
    });

    var nav = document.getElementById('nav');
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (H.c && document.body.contains(H.c)) { sizeHero(); if (reduce) drawHero(0); }
      }, 140);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopHero();
      else if (H.c && document.body.contains(H.c) && H.visible) startHero();
    });

    window.addEventListener('hashchange', function () {
      if (!window.location.hash.startsWith('#/practice') && H.c) { stopHero(); if (H.io) H.io.disconnect(); H.c = null; }
      A.resolve();
    });

    window.setInterval(refreshDue, 30000);
    window.Views.syncBadge();
    A.resolve();
    refreshDue();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    hero: hero,
    afterRender: afterRender,
    themeChanged: function () { if (H.c && reduce) drawHero(0); }
  };
})();