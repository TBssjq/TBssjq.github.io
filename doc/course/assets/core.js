/* 学习台核心：状态、路由、渲染工具 */
window.App = (function () {
  'use strict';

  var S = window.STUDY;
  var LETTERS = 'ABCDEFGH';
  var KEY = 'ai-course-study-v1';

  var CHAPTERS = S.chapters.slice().sort(function (a, b) { return a.id - b.id; });
  var QMAP = new Map();
  CHAPTERS.forEach(function (ch) {
    ch.questions.forEach(function (q) { QMAP.set(ch.id + '-' + q.n, { q: q, ch: ch, bonus: false }); });
    (ch.bonus || []).forEach(function (q) { QMAP.set(ch.id + '-' + q.n, { q: q, ch: ch, bonus: true }); });
  });

  var EXAM_TOTAL = CHAPTERS.reduce(function (s, c) { return s + c.questions.length; }, 0);
  var BONUS_TOTAL = CHAPTERS.reduce(function (s, c) { return s + (c.bonus || []).length; }, 0);

  /* ---------- 存储 ---------- */
  var memoryOnly = false;
  (function probe() {
    var probeKey = KEY + '-probe';
    try {
      window.localStorage.setItem(probeKey, '1');
      window.localStorage.removeItem(probeKey);
    } catch (err) {
      memoryOnly = true;
    }
  })();

  function defaults() {
    return {
      theme: 'dark',
      records: {},
      wrong: {},
      notes: [],
      views: [],
      exams: [],
      marks: {},
      settings: {
        font: 17,
        instant: true,
        shuffleOpts: false,
        autoNext: false,
        withBonus: false,
        showTimer: true,
        density: 'cozy'
      },
      lastPractice: null
    };
  }

  var state = defaults();
  if (!memoryOnly) {
    var raw = window.localStorage.getItem(KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      Object.keys(state).forEach(function (k) {
        if (parsed[k] !== undefined) state[k] = parsed[k];
      });
      var d = defaults();
      Object.keys(d.settings).forEach(function (k) {
        if (state.settings[k] === undefined) state.settings[k] = d.settings[k];
      });
    }
  }

  function save() {
    if (memoryOnly) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function norm(s) {
    return String(s == null ? '' : s)
      .trim()
      .replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/[\s　]/g, '')
      .replace(/[。．.，,、；;：:「」『』“”"'（）()]/g, '')
      .toLowerCase();
  }

  function scoreOf(q, ch) {
    return typeof q.score === 'number' ? q.score : 100 / ch.questions.length;
  }

  function fmtScore(v) {
    return (Math.round(v * 100) / 100).toString();
  }

  function answerText(q, a) {
    if (a == null || a === '' || (Array.isArray(a) && !a.length)) return '未作答';
    if (q.type === 'blank') return String(a);
    if (Array.isArray(a)) return a.slice().sort().join('');
    return String(a);
  }

  function correctText(q) {
    if (q.type === 'blank') return q.ans.join(' / ');
    return q.ans;
  }

  function judge(q, a) {
    if (a == null || a === '' || (Array.isArray(a) && !a.length)) return false;
    if (q.type === 'blank') {
      var v = norm(a);
      if (!v) return false;
      return q.accept.some(function (x) { return norm(x) === v; });
    }
    if (q.type === 'multi') {
      if (!Array.isArray(a)) return false;
      return a.slice().sort().join('') === q.ans.split('').sort().join('');
    }
    return a === q.ans;
  }

  function shuffle(arr, seed) {
    var a = arr.slice();
    var s = seed == null ? Math.random() * 1e9 : seed;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function clock(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' : '') + pad(m) + ':' + pad(s);
  }

  function dateText(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function dueInfo(iso) {
    var due = new Date(iso).getTime();
    var left = due - Date.now();
    var days = Math.floor(Math.abs(left) / 86400000);
    var hours = Math.floor((Math.abs(left) % 86400000) / 3600000);
    var mins = Math.floor((Math.abs(left) % 3600000) / 60000);
    return {
      left: left,
      past: left < 0,
      urgent: left >= 0 && left < 3 * 86400000,
      text: left < 0 ? '已截止 ' + days + ' 天' : (days > 0 ? days + ' 天 ' + hours + ' 小时' : hours + ' 小时 ' + mins + ' 分'),
      stamp: new Date(iso)
    };
  }

  function chapterStats(ch) {
    var done = 0, right = 0;
    ch.questions.forEach(function (q) {
      var r = state.records[ch.id + '-' + q.n];
      if (r) { done++; if (r.ok) right++; }
    });
    return {
      total: ch.questions.length,
      done: done,
      right: right,
      pct: ch.questions.length ? Math.round(done / ch.questions.length * 100) : 0,
      acc: done ? Math.round(right / done * 100) : 0
    };
  }

  function overall() {
    var done = 0, right = 0;
    CHAPTERS.forEach(function (ch) {
      var s = chapterStats(ch);
      done += s.done; right += s.right;
    });
    return {
      total: EXAM_TOTAL, done: done, right: right,
      pct: Math.round(done / EXAM_TOTAL * 100),
      acc: done ? Math.round(right / done * 100) : 0,
      wrong: Object.keys(state.wrong).length
    };
  }

  /* ---------- 公式渲染 ---------- */
  function mathify(root) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$$', right: '$$', display: true }
      ],
      throwOnError: false,
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input']
    });
  }

  /* ---------- 提示条 ---------- */
  var toastTimer = null;
  function toast(msg, actionLabel, actionFn) {
    var host = document.getElementById('toast');
    host.innerHTML = '<span class="toast-msg">' + esc(msg) + '</span>' +
      (actionLabel ? '<button class="toast-act" type="button">' + esc(actionLabel) + '</button>' : '');
    host.classList.add('is-on');
    if (actionLabel) {
      host.querySelector('.toast-act').addEventListener('click', function () {
        actionFn();
        hideToast();
      });
    }
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, actionLabel ? 7000 : 2600);
  }
  function hideToast() {
    var host = document.getElementById('toast');
    host.classList.remove('is-on');
    window.clearTimeout(toastTimer);
  }

  /* ---------- 抽屉 ---------- */
  function drawer(title, html, onMount) {
    var host = document.getElementById('drawer');
    host.innerHTML =
      '<div class="drawer-scrim" data-close></div>' +
      '<aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<header class="drawer-head"><h3>' + esc(title) + '</h3>' +
      '<button class="icon-btn" type="button" data-close aria-label="关闭">✕</button></header>' +
      '<div class="drawer-body">' + html + '</div></aside>';
    host.classList.add('is-on');
    document.body.classList.add('no-scroll');
    host.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
    mathify(host);
    if (window.Terms) window.Terms.annotate(host);
    if (onMount) onMount(host);
  }
  function closeDrawer() {
    var host = document.getElementById('drawer');
    host.classList.remove('is-on');
    host.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  /* ---------- 路由 ---------- */
  var routes = [];
  var current = { path: '', parts: [], query: {} };

  function addRoute(pattern, handler) {
    routes.push({ pattern: pattern, handler: handler });
  }

  function parseHash() {
    var h = window.location.hash.replace(/^#/, '') || '/';
    var qi = h.indexOf('?');
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var query = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
    }
    if (path.length > 1 && path.slice(-1) === '/') path = path.slice(0, -1);
    return { path: path, parts: path.split('/').filter(Boolean), query: query };
  }

  function nav(to, replace) {
    if (replace) window.location.replace('#' + to);
    else window.location.hash = to;
  }

  function resolve() {
    current = parseHash();
    for (var i = 0; i < routes.length; i++) {
      var segs = routes[i].pattern.split('/').filter(Boolean);
      if (segs.length !== current.parts.length) continue;
      var params = {};
      var ok = true;
      for (var j = 0; j < segs.length; j++) {
        if (segs[j][0] === ':') params[segs[j].slice(1)] = current.parts[j];
        else if (segs[j] !== current.parts[j]) { ok = false; break; }
      }
      if (!ok) continue;
      routes[i].handler(params, current.query);
      return;
    }
    if (current.path !== '/') { nav('/', true); return; }
    document.getElementById('view').innerHTML = '<div class="empty"><h2>页面不存在</h2><p><a href="#/">回到总览</a></p></div>';
  }

  function render(html, opts) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    mathify(view);
    if (window.Terms) window.Terms.annotate(view);
    document.documentElement.style.setProperty('--read-size', state.settings.font + 'px');
    view.setAttribute('data-density', state.settings.density);
    if (!opts || !opts.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.FX) window.FX.afterRender(view);
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.fromTo(view, { autoAlpha: .35, y: 8 },
        { autoAlpha: 1, y: 0, duration: .32, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
    }
    syncNav();
  }

  function syncNav() {
    var top = current.parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-nav') === top);
    });
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.setAttribute('data-theme', state.theme);
    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', state.theme === 'dark' ? 'true' : 'false');
      btn.querySelector('.theme-label').textContent = state.theme === 'dark' ? '夜航' : '纸页';
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.theme === 'dark' ? '#070b1c' : '#f7f2e8');
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    save();
    applyTheme();
    if (window.FX) window.FX.themeChanged();
  }

  /* ---------- 导出 ---------- */
  function download(name, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  return {
    S: S, CHAPTERS: CHAPTERS, QMAP: QMAP, LETTERS: LETTERS,
    EXAM_TOTAL: EXAM_TOTAL, BONUS_TOTAL: BONUS_TOTAL,
    state: state, save: save, memoryOnly: memoryOnly,
    esc: esc, norm: norm, scoreOf: scoreOf, fmtScore: fmtScore,
    answerText: answerText, correctText: correctText, judge: judge,
    shuffle: shuffle, clock: clock, pad: pad, dateText: dateText, dueInfo: dueInfo,
    chapterStats: chapterStats, overall: overall, mathify: mathify,
    toast: toast, hideToast: hideToast, drawer: drawer, closeDrawer: closeDrawer,
    addRoute: addRoute, nav: nav, resolve: resolve, render: render, current: function () { return current; },
    applyTheme: applyTheme, toggleTheme: toggleTheme, download: download
  };
})();