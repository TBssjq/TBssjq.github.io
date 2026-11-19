/* 视图：总览、章节、讲义、错题本、笔记、速查、搜索 */
(function () {
  'use strict';
  var A = window.App, S = A.S, esc = A.esc;

  function chById(id) {
    return A.CHAPTERS.filter(function (c) { return c.id === Number(id); })[0];
  }
  function hueStyle(ch) { return ' style="--hue:' + ch.hue + '"'; }

  function dueGroups() {
    var map = new Map();
    A.CHAPTERS.forEach(function (ch) {
      var k = ch.exam.due;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ch);
    });
    return Array.from(map.entries()).sort(function (a, b) { return new Date(a[0]) - new Date(b[0]); });
  }

  /* ============ 总览 ============ */
  function home() {
    var o = A.overall();
    var groups = dueGroups();
    var dueHtml = groups.map(function (g) {
      var info = A.dueInfo(g[0]);
      var names = g[1].map(function (c) { return '第' + c.id + '章'; }).join(' · ');
      return '<div class="due-row' + (info.past ? ' is-past' : info.urgent ? ' is-urgent' : '') + '"' +
        ' style="--hue:' + g[1][0].hue + '">' +
        '<span class="due-dot"></span>' +
        '<span class="due-name">' + esc(names) + '<small>' + esc(g[1].map(function (c) { return c.exam.rule; }).join(' / ')) + '</small></span>' +
        '<span class="due-time" data-due="' + esc(g[0]) + '">' + esc(info.text) + '</span></div>';
    }).join('');

    var recent = Object.keys(A.state.wrong).map(function (k) {
      return { k: k, w: A.state.wrong[k], e: A.QMAP.get(k) };
    }).filter(function (x) { return x.e; }).sort(function (a, b) { return b.w.last - a.w.last; }).slice(0, 4);

    var recentHtml = recent.length ? '<div class="row-list">' + recent.map(function (x) {
      return '<div class="row"' + hueStyle(x.e.ch) + '><span class="ch-glyph">' + esc(x.e.ch.glyph) + '</span>' +
        '<div class="row-main"><div class="row-title"><a href="#/practice?keys=' + encodeURIComponent(x.k) + '">第' + x.e.q.n + '题 · ' + esc(x.e.q.point || x.e.ch.title) + '</a></div>' +
        '<div class="row-meta"><span class="pill">错 ' + x.w.times + ' 次</span><span>' + esc(A.dateText(x.w.last)) + '</span></div></div>' +
        '<div class="row-acts"><a class="btn btn--sm" href="#/chapter/' + x.e.ch.id + '">看讲义</a></div></div>';
    }).join('') + '</div>' : '<div class="empty"><h3>错题本是空的</h3><p>做错的题会自动收进来，答对之后可以一键移出。先去刷一组题。</p><a class="btn btn--primary" href="#/practice">开始刷题</a></div>';

    var html =
      '<section class="hero"><canvas id="heroCanvas" aria-hidden="true"></canvas><div class="shell">' +
      '<div class="hero-grid"><div>' +
      '<span class="hero-eyebrow"><i></i>人工智能通识导论 · 八章全景</span>' +
      '<h1 class="hero-title"><span class="g1">从零开始</span><br><span class="g2">读懂人工智能</span><br><span class="g3">并把题做对</span></h1>' +
      '<p class="hero-desc">把八份课程文档和八套课件整理成一条可以走完的路：先读小白讲义，再刷真题，错的题自动进错题本，考前用速查手册过一遍。全部 ' + A.EXAM_TOTAL + ' 道考核题都来自课程文档，答案与解析逐题核对。</p>' +
      '<div class="hero-cta"><a class="btn btn--primary" href="#/practice">开始刷题</a>' +
      '<a class="btn" href="#/chapters">浏览八章讲义</a>' +
      '<a class="btn btn--ghost" href="#/exam">模拟考试</a></div>' +
      '</div><div class="hero-panel"><h3>考核倒计时</h3>' + dueHtml +
      '<div class="due-row" style="--hue:var(--cyan)"><span class="due-dot"></span><span class="due-name">题库总量<small>另有 ' + A.BONUS_TOTAL + ' 道课件自测题</small></span><span class="due-time">' + A.EXAM_TOTAL + ' 题</span></div>' +
      '</div></div>' +
      '<div class="stat-strip">' +
      '<div class="stat" style="--hue:#3d5afe"><b>' + A.EXAM_TOTAL + '</b><span>考核真题</span></div>' +
      '<div class="stat" style="--hue:#00c2a8"><b>' + o.done + '</b><span>已练习</span></div>' +
      '<div class="stat" style="--hue:#ffb020"><b>' + (o.done ? o.acc + '%' : '—') + '</b><span>练习正确率</span></div>' +
      '<div class="stat" style="--hue:#ff2d78"><b>' + o.wrong + '</b><span>待攻克错题</span></div>' +
      '</div></div></section>' +

      '<div class="shell page">' +
      (A.memoryOnly ? '<div class="notice">当前浏览器禁止本地存储，本次练习进度只保留在内存中，关闭页面后不会保存。学习内容本身不受影响。</div>' : '') +
      '<div class="sec-head rv"><div><h2>八章进度</h2><p>点进任意一章，先读讲义再做题</p></div><a class="btn btn--sm" href="#/chapters">全部章节</a></div>' +
      '<div class="grid grid--4">' + A.CHAPTERS.map(chapterCard).join('') + '</div>' +

      '<div class="sec-head rv"><div><h2>最近错的题</h2><p>错题本会自动记录，答对后可移出</p></div><a class="btn btn--sm" href="#/wrong">打开错题本</a></div>' +
      recentHtml +

      '<div class="sec-head rv"><div><h2>怎么用这个学习台</h2><p>四步走完一轮复习</p></div></div>' +
      '<div class="grid grid--4">' +
      stepCard(1, '#f5a524', '读讲义', '每章按课件顺序拆成小节，术语第一次出现就解释，公式配算例。左侧目录可以跳转。', '#/chapter/1') +
      stepCard(2, '#2f6bff', '刷题', '右侧控制区随时调题量、顺序、题型、字号。答完立刻给判定与逐项解析。', '#/practice') +
      stepCard(3, '#ff2d78', '错题攻坚', '错题自动归集，可按章节筛选、批量重练、查看完整解析。', '#/wrong') +
      stepCard(4, '#06b6d4', '模考与速查', '限时组卷、答题卡、自动判分与成绩历史；考前扫一遍公式与判别口诀。', '#/exam') +
      '</div></div>';

    A.render(html);
    if (window.FX) window.FX.hero();
  }

  function stepCard(n, hue, title, body, href) {
    return '<a class="ch-card rv" style="--hue:' + hue + '" href="' + href + '">' +
      '<div class="ch-top"><span class="ch-glyph">0' + n + '</span><span class="ch-title">' + esc(title) + '</span></div>' +
      '<p class="ch-tag">' + esc(body) + '</p><span class="pill pill--hue">进入</span></a>';
  }

  function chapterCard(ch) {
    var s = A.chapterStats(ch);
    var info = A.dueInfo(ch.exam.due);
    return '<a class="ch-card rv"' + hueStyle(ch) + ' href="#/chapter/' + ch.id + '">' +
      '<div class="ch-top"><span class="ch-glyph">' + esc(ch.glyph) + '</span>' +
      '<span><span class="ch-title">' + esc(ch.title) + '</span><br><span class="ch-sub">' + esc(ch.subtitle) + '</span></span></div>' +
      '<p class="ch-tag">' + esc(ch.tagline) + '</p>' +
      '<div class="ch-meta"><span class="pill pill--hue">' + ch.questions.length + ' 题</span>' +
      '<span class="pill">' + ch.sections.length + ' 小节</span>' +
      '<span class="pill ' + (info.past ? '' : info.urgent ? 'pill--danger' : 'pill--warn') + '">' + esc(info.past ? '已截止' : info.text) + '</span></div>' +
      '<div class="bar"><i style="width:' + s.pct + '%"></i></div>' +
      '<div class="ch-foot"><span>已练 ' + s.done + '/' + s.total + '</span><span>' + (s.done ? '正确率 ' + s.acc + '%' : '未开始') + '</span></div></a>';
  }

  /* ============ 章节列表 ============ */
  var chSort = 'id';
  function chapters() {
    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">CHAPTERS</div><h1 class="page-title">八章<em>知识地图</em></h1>' +
      '<p class="page-sub">从「机器能思考吗」一路走到「技术应当如何被治理」。每章都标了考核题量、分值规则与截止时间。</p></div>' +
      '<div class="toolbar rv"><span class="ctrl-label" style="margin:0">排序</span>' +
      '<div class="seg" id="chSort">' +
      ['id:章节顺序', 'count:题量', 'due:截止时间', 'progress:练习进度'].map(function (x) {
        var p = x.split(':');
        return '<button type="button" data-v="' + p[0] + '"' + (chSort === p[0] ? ' class="is-on"' : '') + '>' + p[1] + '</button>';
      }).join('') + '</div>' +
      '<span class="spacer"></span><a class="btn btn--sm btn--primary" href="#/practice">全部题目开始练习</a></div>' +
      '<div class="grid grid--3" id="chGrid"></div></div>';
    A.render(html);
    paintChapters();
    document.getElementById('chSort').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      chSort = b.getAttribute('data-v');
      this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      paintChapters();
    });
  }
  function paintChapters() {
    var list = A.CHAPTERS.slice();
    if (chSort === 'count') list.sort(function (a, b) { return b.questions.length - a.questions.length; });
    if (chSort === 'due') list.sort(function (a, b) { return new Date(a.exam.due) - new Date(b.exam.due); });
    if (chSort === 'progress') list.sort(function (a, b) { return A.chapterStats(b).pct - A.chapterStats(a).pct; });
    var host = document.getElementById('chGrid');
    host.innerHTML = list.map(chapterCard).join('');
    if (window.FX) window.FX.afterRender(host);
  }

  /* ============ 讲义 ============ */
  function chapter(params) {
    var ch = chById(params.id);
    if (!ch) { A.nav('/chapters', true); return; }
    var s = A.chapterStats(ch);
    var info = A.dueInfo(ch.exam.due);

    var toc = '<div class="toc-title">本章目录</div>' + ch.sections.map(function (sec) {
      return '<a href="#/chapter/' + ch.id + '/' + sec.id + '" data-sec="' + sec.id + '">' + esc(sec.title) + '</a>';
    }).join('') + '<a href="#/chapter/' + ch.id + '/exam" data-sec="exam">本章考核</a>' +
      '<div class="toc-cta"><a class="btn btn--primary btn--sm" href="#/practice?ch=' + ch.id + '">刷本章 ' + ch.questions.length + ' 题</a>' +
      (ch.bonus && ch.bonus.length ? '<a class="btn btn--sm" href="#/practice?ch=' + ch.id + '&bonus=1">课件自测 ' + ch.bonus.length + ' 题</a>' : '') +
      '<a class="btn btn--sm btn--ghost" href="#/notes?ch=' + ch.id + '">本章笔记</a></div>';

    var secs = ch.sections.map(function (sec) {
      return '<section class="study-sec rv" id="sec-' + sec.id + '" data-sec="' + sec.id + '">' +
        '<h2><span class="kicker">' + esc(sec.kicker) + '</span>' + esc(sec.title) + '</h2>' +
        '<div class="prose">' + sec.html + '</div></section>';
    }).join('');

    var keyRows = ch.questions.map(function (q) {
      return '<tr><td class="num">' + q.n + '</td><td>' + typeName(q.type) + '</td>' +
        '<td class="num">' + A.fmtScore(A.scoreOf(q, ch)) + '</td>' +
        '<td class="k">' + esc(A.correctText(q)) + '</td><td>' + esc(q.point || '') + '</td>' +
        '<td><a href="#/practice?keys=' + ch.id + '-' + q.n + '">练习</a></td></tr>';
    }).join('');

    var html = '<div class="shell page"' + hueStyle(ch) + '><div class="study-layout">' +
      '<aside class="toc" id="toc">' + toc + '</aside><div>' +
      '<div class="ch-hero rv"><span class="ch-glyph">' + esc(ch.glyph) + '</span>' +
      '<h1>' + esc(ch.title) + '</h1><div class="ch-sub">' + esc(ch.subtitle) + '</div>' +
      '<p class="lead" data-annotate>' + esc(ch.lead) + '</p>' +
      '<div class="ch-hero-meta"><span class="pill pill--hue">' + esc(ch.exam.name) + '</span>' +
      '<span class="pill">' + esc(ch.exam.rule) + '</span>' +
      '<span class="pill ' + (info.past ? '' : info.urgent ? 'pill--danger' : 'pill--warn') + '">' + esc(info.past ? '已截止' : '剩余 ' + info.text) + '</span>' +
      '<span class="pill pill--ok">已练 ' + s.done + '/' + s.total + '</span></div>' +
      '<p class="term-hint"><svg class="term-lens" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="6.8" cy="6.8" r="4.5"></circle><path d="M10.2 10.2 L14 14"></path></svg>正文中带放大镜标记的词语，点开可以查看术语注释。</p>' +
      (ch.exam.note ? '<div class="note note--warn" style="margin-bottom:0">' + esc(ch.exam.note) + '</div>' : '') +
      '</div><div class="study-annotated" data-annotate>' + secs +
      '<section class="study-sec rv" id="sec-exam" data-sec="exam"><h2><span class="kicker">考核</span>本章题目与答案</h2>' +
      '<div class="prose"><p>共 ' + ch.questions.length + ' 题。答案与解析全部来自课程文档，点右侧「练」进入单题练习。</p></div>' +
      '<div class="tbl"><table class="key-table"><thead><tr><th>题号</th><th>题型</th><th>分值</th><th>答案</th><th>考点</th><th>练习</th></tr></thead><tbody>' + keyRows + '</tbody></table></div>' +
      '<div class="q-actions"><a class="btn btn--primary" href="#/practice?ch=' + ch.id + '">刷本章全部题目</a>' +
      '<a class="btn" href="#/exam?ch=' + ch.id + '">用本章组卷模考</a>' +
      (ch.id < 8 ? '<a class="btn btn--ghost" href="#/chapter/' + (ch.id + 1) + '">下一章：' + esc(chById(ch.id + 1).title) + '</a>' : '<a class="btn btn--ghost" href="#/cheats">去速查手册</a>') +
      '</div></section></div></div></div></div>';

    A.render(html);
    bindToc(ch);
    var target = params.sec;
    if (target) {
      var el = document.getElementById('sec-' + target);
      if (el) window.setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    }
  }

  function typeName(t) { return t === 'multi' ? '多选' : t === 'blank' ? '填空' : '单选'; }

  function bindToc(ch) {
    var links = Array.prototype.slice.call(document.querySelectorAll('#toc a[data-sec]'));
    var secs = Array.prototype.slice.call(document.querySelectorAll('.study-sec[data-sec]'));
    function mark(id) {
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-sec') === id); });
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-sec');
        var el = document.getElementById('sec-' + id);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); mark(id); }
        window.history.replaceState(null, '', '#/chapter/' + ch.id + '/' + id);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (x) { return x.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible.length) mark(visible[0].target.getAttribute('data-sec'));
    }, { rootMargin: '-80px 0px -62% 0px', threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
    mark(ch.sections[0].id);
  }

  /* ============ 错题本 ============ */
  var wrongUI = { q: '', ch: 'all', sort: 'recent', sel: new Set() };
  function wrong() {
    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">MISTAKES</div><h1 class="page-title">错题<em>攻坚区</em></h1>' +
      '<p class="page-sub">答错的题自动进来，重练答对后一键移出。支持搜索、按章筛选、批量重练与删除撤销。</p></div>' +
      '<div class="toolbar rv">' +
      '<input class="inp grow" id="wq" type="search" placeholder="搜索题干、考点或解析" value="' + esc(wrongUI.q) + '">' +
      '<select class="inp" id="wch"><option value="all">全部章节</option>' +
      A.CHAPTERS.map(function (c) { return '<option value="' + c.id + '"' + (wrongUI.ch === String(c.id) ? ' selected' : '') + '>第' + c.id + '章 ' + esc(c.title) + '</option>'; }).join('') +
      '</select>' +
      '<select class="inp" id="wsort">' +
      [['recent', '最近错的'], ['times', '错得最多'], ['ch', '按章节']].map(function (x) {
        return '<option value="' + x[0] + '"' + (wrongUI.sort === x[0] ? ' selected' : '') + '>' + x[1] + '</option>';
      }).join('') + '</select>' +
      '<button class="btn btn--sm" id="wAll" type="button">全选</button>' +
      '<button class="btn btn--sm btn--primary" id="wDrill" type="button">重练全部</button>' +
      '</div><div id="wList"></div><div id="wBulk"></div></div>';
    A.render(html);
    paintWrong();
    document.getElementById('wq').addEventListener('input', function () { wrongUI.q = this.value; paintWrong(); });
    document.getElementById('wch').addEventListener('change', function () { wrongUI.ch = this.value; wrongUI.sel.clear(); paintWrong(); });
    document.getElementById('wsort').addEventListener('change', function () { wrongUI.sort = this.value; paintWrong(); });
    document.getElementById('wAll').addEventListener('click', function () {
      var list = wrongList();
      if (wrongUI.sel.size === list.length) wrongUI.sel.clear();
      else list.forEach(function (x) { wrongUI.sel.add(x.k); });
      paintWrong();
    });
    document.getElementById('wDrill').addEventListener('click', function () {
      var list = wrongList();
      if (!list.length) { A.toast('错题本是空的'); return; }
      A.nav('/practice?keys=' + encodeURIComponent(list.map(function (x) { return x.k; }).join(',')));
    });
  }

  function wrongList() {
    var q = A.norm(wrongUI.q);
    var list = Object.keys(A.state.wrong).map(function (k) {
      return { k: k, w: A.state.wrong[k], e: A.QMAP.get(k) };
    }).filter(function (x) { return x.e; });
    if (wrongUI.ch !== 'all') list = list.filter(function (x) { return String(x.e.ch.id) === wrongUI.ch; });
    if (q) list = list.filter(function (x) {
      return A.norm(x.e.q.stem + ' ' + (x.e.q.point || '') + ' ' + x.e.q.why + ' ' + x.e.ch.title).indexOf(q) >= 0;
    });
    if (wrongUI.sort === 'recent') list.sort(function (a, b) { return b.w.last - a.w.last; });
    if (wrongUI.sort === 'times') list.sort(function (a, b) { return b.w.times - a.w.times; });
    if (wrongUI.sort === 'ch') list.sort(function (a, b) { return a.e.ch.id - b.e.ch.id || a.e.q.n - b.e.q.n; });
    return list;
  }

  function paintWrong() {
    var list = wrongList();
    var host = document.getElementById('wList');
    if (!list.length) {
      host.innerHTML = '<div class="empty"><h3>' + (Object.keys(A.state.wrong).length ? '没有匹配的错题' : '错题本是空的') + '</h3>' +
        '<p>' + (Object.keys(A.state.wrong).length ? '换个关键词或章节试试。' : '做错的题会自动收进来。先去刷一组题，系统会替你记录。') + '</p>' +
        '<a class="btn btn--primary" href="#/practice">开始刷题</a></div>';
      document.getElementById('wBulk').innerHTML = '';
      return;
    }
    host.innerHTML = '<div class="row-list">' + list.map(function (x) {
      var on = wrongUI.sel.has(x.k);
      return '<div class="row' + (on ? ' is-sel' : '') + '"' + hueStyle(x.e.ch) + ' data-k="' + x.k + '">' +
        '<label class="row-check"><input type="checkbox" data-sel="' + x.k + '"' + (on ? ' checked' : '') + ' aria-label="选择第' + x.e.q.n + '题"></label>' +
        '<div class="row-main"><div class="row-title">第' + x.e.ch.id + '章 第' + x.e.q.n + '题 · ' + esc(x.e.q.point || '') + '</div>' +
        '<div class="row-meta"><span class="pill pill--hue">' + esc(x.e.ch.title) + '</span><span class="pill">' + typeName(x.e.q.type) + '</span>' +
        '<span class="pill pill--danger">错 ' + x.w.times + ' 次</span><span>' + esc(A.dateText(x.w.last)) + '</span>' +
        '<span class="pill">正确答案 ' + esc(A.correctText(x.e.q)) + '</span></div>' +
        '<div class="row-body">' + esc(x.e.q.stem) + '</div></div>' +
        '<div class="row-acts">' +
        '<button class="btn btn--sm" type="button" data-detail="' + x.k + '">解析</button>' +
        '<a class="btn btn--sm" href="#/practice?keys=' + x.k + '">重练</a>' +
        '<button class="btn btn--sm" type="button" data-clear="' + x.k + '">已掌握</button>' +
        '<button class="btn btn--sm btn--danger" type="button" data-del="' + x.k + '">删除</button>' +
        '</div></div>';
    }).join('') + '</div>';

    host.querySelectorAll('[data-sel]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var k = cb.getAttribute('data-sel');
        if (cb.checked) wrongUI.sel.add(k); else wrongUI.sel.delete(k);
        paintWrong();
      });
    });
    host.querySelectorAll('[data-detail]').forEach(function (b) {
      b.addEventListener('click', function () { detailDrawer(b.getAttribute('data-detail')); });
    });
    host.querySelectorAll('[data-clear]').forEach(function (b) {
      b.addEventListener('click', function () { removeWrong([b.getAttribute('data-clear')], '已移出错题本'); });
    });
    host.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () { removeWrong([b.getAttribute('data-del')], '已删除 1 条错题'); });
    });
    paintWrongBulk();
    if (window.FX) window.FX.afterRender(host);
  }

  function paintWrongBulk() {
    var host = document.getElementById('wBulk');
    var n = wrongUI.sel.size;
    if (!n) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="bulk-bar"><b>已选 ' + n + ' 题</b>' +
      '<button class="btn btn--sm btn--primary" type="button" id="wbDrill">重练这些</button>' +
      '<button class="btn btn--sm" type="button" id="wbClear">标为已掌握</button>' +
      '<button class="btn btn--sm btn--danger" type="button" id="wbDel">删除</button>' +
      '<span class="spacer"></span><button class="btn btn--sm btn--ghost" type="button" id="wbNone">取消选择</button></div>';
    document.getElementById('wbDrill').addEventListener('click', function () {
      A.nav('/practice?keys=' + encodeURIComponent(Array.from(wrongUI.sel).join(',')));
    });
    document.getElementById('wbClear').addEventListener('click', function () { removeWrong(Array.from(wrongUI.sel), '已移出 ' + n + ' 条错题'); });
    document.getElementById('wbDel').addEventListener('click', function () { removeWrong(Array.from(wrongUI.sel), '已删除 ' + n + ' 条错题'); });
    document.getElementById('wbNone').addEventListener('click', function () { wrongUI.sel.clear(); paintWrong(); });
  }

  function removeWrong(keys, msg) {
    var backup = {};
    keys.forEach(function (k) { backup[k] = A.state.wrong[k]; delete A.state.wrong[k]; });
    wrongUI.sel.clear();
    A.save(); paintWrong(); syncBadge();
    A.toast(msg, '撤销', function () {
      Object.keys(backup).forEach(function (k) { A.state.wrong[k] = backup[k]; });
      A.save(); paintWrong(); syncBadge();
    });
  }

  function detailDrawer(k) {
    var e = A.QMAP.get(k);
    if (!e) return;
    var q = e.q, ch = e.ch;
    var rec = A.state.records[k];
    var opts = q.type === 'blank' ? '' : '<div class="opts">' + q.opts.map(function (o, i) {
      var L = A.LETTERS[i];
      var right = q.ans.indexOf(L) >= 0;
      return '<div class="opt opt--show' + (right ? ' is-right' : '') + '"><span class="opt-key">' + L + '</span><span>' + esc(o) + '</span></div>';
    }).join('') + '</div>';
    A.drawer('第' + ch.id + '章 第' + q.n + '题', '<div' + hueStyle(ch) + '>' +
      '<div class="ch-meta"><span class="pill pill--hue">' + esc(ch.title) + '</span><span class="pill">' + typeName(q.type) + '</span>' +
      '<span class="pill">' + A.fmtScore(A.scoreOf(q, ch)) + ' 分</span>' +
      (rec ? '<span class="pill ' + (rec.ok ? 'pill--ok' : 'pill--danger') + '">上次作答 ' + esc(A.answerText(q, rec.a)) + '</span>' : '') + '</div>' +
      '<p class="q-stem" data-annotate data-ch="' + ch.id + '">' + esc(q.stem) + '</p>' +
      (q.figure ? '<div class="q-figure prose" data-annotate data-ch="' + ch.id + '">' + q.figure + '</div>' : '') + opts +
      '<div class="verdict verdict--ok"><div class="verdict-head"><span class="tag">答案</span>' + esc(A.correctText(q)) + '</div>' +
      '<div class="verdict-body" data-annotate data-ch="' + ch.id + '">' + q.why + '</div>' +
      '<div class="verdict-meta"><span class="pill pill--hue">' + esc(q.point || '') + '</span>' +
      (q.anchor ? '<span class="pill">' + esc(q.anchor) + '</span>' : '') + '</div></div>' +
      '<div class="q-actions"><a class="btn btn--primary btn--sm" href="#/practice?keys=' + k + '">重练这题</a>' +
      '<a class="btn btn--sm" href="#/chapter/' + ch.id + '">回到讲义</a>' +
      '<button class="btn btn--sm" type="button" id="dNote">写笔记</button></div></div>',
      function (host) {
        host.querySelector('#dNote').addEventListener('click', function () {
          A.closeDrawer();
          noteEditor(null, { ch: ch.id, title: '第' + ch.id + '章 第' + q.n + '题 · ' + (q.point || ''), body: '正确答案：' + A.correctText(q) + '\n' + (q.anchor || '') });
        });
      });
  }

  /* ============ 笔记 ============ */
  var noteUI = { q: '', ch: 'all', sort: 'manual', sel: new Set(), view: null };
  function notes(params, query) {
    if (query && query.ch) noteUI.ch = String(query.ch);
    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">NOTEBOOK</div><h1 class="page-title">我的<em>学习笔记</em></h1>' +
      '<p class="page-sub">把没弄懂的地方记下来。支持拖动排序、按章筛选、保存常用筛选视图，删除后可撤销。</p></div>' +
      '<div class="saved-views" id="nViews"></div>' +
      '<div class="toolbar rv">' +
      '<input class="inp grow" id="nq" type="search" placeholder="搜索标题或正文" value="' + esc(noteUI.q) + '">' +
      '<select class="inp" id="nch"><option value="all">全部章节</option><option value="0"' + (noteUI.ch === '0' ? ' selected' : '') + '>通用</option>' +
      A.CHAPTERS.map(function (c) { return '<option value="' + c.id + '"' + (noteUI.ch === String(c.id) ? ' selected' : '') + '>第' + c.id + '章 ' + esc(c.title) + '</option>'; }).join('') +
      '</select>' +
      '<select class="inp" id="nsort">' +
      [['manual', '自定义顺序'], ['new', '最新创建'], ['old', '最早创建'], ['ch', '按章节']].map(function (x) {
        return '<option value="' + x[0] + '"' + (noteUI.sort === x[0] ? ' selected' : '') + '>' + x[1] + '</option>';
      }).join('') + '</select>' +
      '<button class="btn btn--sm" id="nSaveView" type="button">保存视图</button>' +
      '<button class="btn btn--sm" id="nExport" type="button">导出</button>' +
      '<button class="btn btn--sm btn--primary" id="nNew" type="button">新建笔记</button>' +
      '</div><div id="nList"></div><div id="nBulk"></div></div>';
    A.render(html);
    paintViews(); paintNotes();
    document.getElementById('nq').addEventListener('input', function () { noteUI.q = this.value; noteUI.view = null; paintViews(); paintNotes(); });
    document.getElementById('nch').addEventListener('change', function () { noteUI.ch = this.value; noteUI.sel.clear(); noteUI.view = null; paintViews(); paintNotes(); });
    document.getElementById('nsort').addEventListener('change', function () { noteUI.sort = this.value; noteUI.view = null; paintViews(); paintNotes(); });
    document.getElementById('nNew').addEventListener('click', function () { noteEditor(null, { ch: noteUI.ch === 'all' ? 0 : Number(noteUI.ch) }); });
    document.getElementById('nSaveView').addEventListener('click', saveViewDialog);
    document.getElementById('nExport').addEventListener('click', function () { exportNotes(); });
  }

  function noteList() {
    var q = A.norm(noteUI.q);
    var list = A.state.notes.slice();
    if (noteUI.ch !== 'all') list = list.filter(function (n) { return String(n.ch) === noteUI.ch; });
    if (q) list = list.filter(function (n) { return A.norm(n.title + ' ' + n.body).indexOf(q) >= 0; });
    if (noteUI.sort === 'new') list.sort(function (a, b) { return b.at - a.at; });
    if (noteUI.sort === 'old') list.sort(function (a, b) { return a.at - b.at; });
    if (noteUI.sort === 'ch') list.sort(function (a, b) { return a.ch - b.ch || a.at - b.at; });
    if (noteUI.sort === 'manual') list.sort(function (a, b) { return a.order - b.order; });
    return list;
  }

  function paintViews() {
    var host = document.getElementById('nViews');
    if (!host) return;
    if (!A.state.views.length) { host.innerHTML = ''; return; }
    host.innerHTML = A.state.views.map(function (v) {
      return '<span class="view-chip' + (noteUI.view === v.id ? ' is-on' : '') + '" data-view="' + v.id + '"><b>' + esc(v.name) + '</b>' +
        '<span class="x" data-vdel="' + v.id + '" role="button" tabindex="0" aria-label="删除视图">✕</span></span>';
    }).join('');
    host.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-vdel')) return;
        var v = A.state.views.filter(function (x) { return x.id === el.getAttribute('data-view'); })[0];
        noteUI.q = v.q; noteUI.ch = v.ch; noteUI.sort = v.sort; noteUI.view = v.id; noteUI.sel.clear();
        document.getElementById('nq').value = v.q;
        document.getElementById('nch').value = v.ch;
        document.getElementById('nsort').value = v.sort;
        paintViews(); paintNotes();
      });
    });
    host.querySelectorAll('[data-vdel]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = el.getAttribute('data-vdel');
        var backup = A.state.views.filter(function (x) { return x.id === id; })[0];
        A.state.views = A.state.views.filter(function (x) { return x.id !== id; });
        if (noteUI.view === id) noteUI.view = null;
        A.save(); paintViews();
        A.toast('已删除视图「' + backup.name + '」', '撤销', function () {
          A.state.views.push(backup); A.save(); paintViews();
        });
      });
    });
  }

  function saveViewDialog() {
    A.drawer('保存当前筛选', '<p class="page-sub" style="margin-top:0">把当前的关键词、章节与排序存成一个视图，下次一键切换。</p>' +
      '<div class="ctrl"><div class="ctrl-label">视图名称</div><input class="inp" id="vName" maxlength="20" placeholder="例如：第三章待复习"></div>' +
      '<div class="note">关键词：' + esc(noteUI.q || '无') + ' · 章节：' + esc(noteUI.ch === 'all' ? '全部' : noteUI.ch === '0' ? '通用' : '第' + noteUI.ch + '章') + ' · 排序：' + esc(noteUI.sort) + '</div>' +
      '<div class="q-actions"><button class="btn btn--primary" id="vOk" type="button">保存</button>' +
      '<button class="btn btn--ghost" id="vNo" type="button">取消</button></div>',
      function (host) {
        var inp = host.querySelector('#vName');
        inp.focus();
        host.querySelector('#vNo').addEventListener('click', A.closeDrawer);
        host.querySelector('#vOk').addEventListener('click', function () {
          var name = inp.value.trim();
          if (!name) { inp.focus(); A.toast('请填写视图名称'); return; }
          var v = { id: 'v' + Date.now(), name: name, q: noteUI.q, ch: noteUI.ch, sort: noteUI.sort };
          A.state.views.push(v); noteUI.view = v.id; A.save();
          A.closeDrawer(); paintViews(); A.toast('视图已保存');
        });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') host.querySelector('#vOk').click(); });
      });
  }

  function paintNotes() {
    var host = document.getElementById('nList');
    if (!host) return;
    var list = noteList();
    if (!list.length) {
      host.innerHTML = '<div class="empty"><h3>' + (A.state.notes.length ? '没有匹配的笔记' : '还没有笔记') + '</h3>' +
        '<p>' + (A.state.notes.length ? '换个关键词或章节试试。' : '读到卡住的地方就记一条。也可以从错题解析里直接生成笔记。') + '</p>' +
        '<button class="btn btn--primary" type="button" id="nEmptyNew">写第一条笔记</button></div>';
      host.querySelector('#nEmptyNew').addEventListener('click', function () { noteEditor(null, { ch: 0 }); });
      document.getElementById('nBulk').innerHTML = '';
      return;
    }
    host.innerHTML = '<div class="row-list" id="nRows">' + list.map(function (n) {
      var ch = n.ch ? chById(n.ch) : null;
      var on = noteUI.sel.has(n.id);
      return '<div class="row' + (on ? ' is-sel' : '') + '" style="--hue:' + (ch ? ch.hue : '#7d92ff') + '" draggable="true" data-id="' + n.id + '">' +
        '<label class="row-check"><input type="checkbox" data-nsel="' + n.id + '"' + (on ? ' checked' : '') + ' aria-label="选择笔记"></label>' +
        '<div class="row-main"><div class="row-title"><span class="row-grip" title="拖动排序">⠿</span> ' + esc(n.title) + '</div>' +
        '<div class="row-meta"><span class="pill pill--hue">' + esc(ch ? '第' + ch.id + '章 ' + ch.title : '通用') + '</span>' +
        '<span>' + esc(A.dateText(n.at)) + '</span></div>' +
        '<div class="row-body">' + esc(n.body) + '</div></div>' +
        '<div class="row-acts"><button class="btn btn--sm" type="button" data-nedit="' + n.id + '">编辑</button>' +
        (ch ? '<a class="btn btn--sm" href="#/chapter/' + ch.id + '">讲义</a>' : '') +
        '<button class="btn btn--sm btn--danger" type="button" data-ndel="' + n.id + '">删除</button></div></div>';
    }).join('') + '</div>';

    host.querySelectorAll('[data-nsel]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.getAttribute('data-nsel');
        if (cb.checked) noteUI.sel.add(id); else noteUI.sel.delete(id);
        paintNotes();
      });
    });
    host.querySelectorAll('[data-nedit]').forEach(function (b) {
      b.addEventListener('click', function () {
        noteEditor(A.state.notes.filter(function (x) { return x.id === b.getAttribute('data-nedit'); })[0]);
      });
    });
    host.querySelectorAll('[data-ndel]').forEach(function (b) {
      b.addEventListener('click', function () { deleteNotes([b.getAttribute('data-ndel')]); });
    });
    bindDrag(host);
    paintNoteBulk();
    if (window.FX) window.FX.afterRender(host);
  }

  function bindDrag(host) {
    var dragId = null;
    host.querySelectorAll('.row[draggable]').forEach(function (row) {
      row.addEventListener('dragstart', function (e) {
        dragId = row.getAttribute('data-id');
        row.classList.add('is-drag');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragId);
      });
      row.addEventListener('dragend', function () {
        row.classList.remove('is-drag');
        host.querySelectorAll('.is-over').forEach(function (x) { x.classList.remove('is-over'); });
      });
      row.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (row.getAttribute('data-id') !== dragId) row.classList.add('is-over');
      });
      row.addEventListener('dragleave', function () { row.classList.remove('is-over'); });
      row.addEventListener('drop', function (e) {
        e.preventDefault();
        row.classList.remove('is-over');
        var targetId = row.getAttribute('data-id');
        if (!dragId || dragId === targetId) return;
        var arr = A.state.notes.slice().sort(function (a, b) { return a.order - b.order; });
        var from = arr.findIndex(function (x) { return x.id === dragId; });
        var to = arr.findIndex(function (x) { return x.id === targetId; });
        var moved = arr.splice(from, 1)[0];
        arr.splice(to, 0, moved);
        arr.forEach(function (x, i) { x.order = i; });
        noteUI.sort = 'manual';
        document.getElementById('nsort').value = 'manual';
        A.save(); paintNotes(); A.toast('顺序已更新');
      });
    });
  }

  function paintNoteBulk() {
    var host = document.getElementById('nBulk');
    var n = noteUI.sel.size;
    if (!n) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="bulk-bar"><b>已选 ' + n + ' 条</b>' +
      '<button class="btn btn--sm btn--danger" type="button" id="nbDel">删除</button>' +
      '<button class="btn btn--sm" type="button" id="nbExp">导出所选</button>' +
      '<span class="spacer"></span><button class="btn btn--sm btn--ghost" type="button" id="nbNone">取消选择</button></div>';
    document.getElementById('nbDel').addEventListener('click', function () { deleteNotes(Array.from(noteUI.sel)); });
    document.getElementById('nbExp').addEventListener('click', function () {
      exportNotes(A.state.notes.filter(function (x) { return noteUI.sel.has(x.id); }));
    });
    document.getElementById('nbNone').addEventListener('click', function () { noteUI.sel.clear(); paintNotes(); });
  }

  function deleteNotes(ids) {
    var backup = A.state.notes.filter(function (x) { return ids.indexOf(x.id) >= 0; });
    A.state.notes = A.state.notes.filter(function (x) { return ids.indexOf(x.id) < 0; });
    noteUI.sel.clear(); A.save(); paintNotes();
    A.toast('已删除 ' + backup.length + ' 条笔记', '撤销', function () {
      A.state.notes = A.state.notes.concat(backup); A.save(); paintNotes();
    });
  }

  function noteEditor(note, preset) {
    var isNew = !note;
    var d = note || { title: (preset && preset.title) || '', body: (preset && preset.body) || '', ch: (preset && preset.ch) || 0 };
    A.drawer(isNew ? '新建笔记' : '编辑笔记',
      '<div class="ctrl"><div class="ctrl-label">标题</div><input class="inp" id="eTitle" maxlength="60" value="' + esc(d.title) + '" placeholder="例如：精确率和召回率总是搞混"></div>' +
      '<div class="ctrl"><div class="ctrl-label">归属章节</div><select class="inp" id="eCh"><option value="0">通用</option>' +
      A.CHAPTERS.map(function (c) { return '<option value="' + c.id + '"' + (Number(d.ch) === c.id ? ' selected' : '') + '>第' + c.id + '章 ' + esc(c.title) + '</option>'; }).join('') + '</select></div>' +
      '<div class="ctrl"><div class="ctrl-label">正文</div><textarea class="inp" id="eBody" placeholder="用自己的话写一遍，比抄一遍管用。">' + esc(d.body) + '</textarea></div>' +
      '<div class="q-actions"><button class="btn btn--primary" id="eOk" type="button">' + (isNew ? '创建' : '保存') + '</button>' +
      '<button class="btn btn--ghost" id="eNo" type="button">取消</button></div>',
      function (host) {
        var t = host.querySelector('#eTitle');
        t.focus();
        host.querySelector('#eNo').addEventListener('click', A.closeDrawer);
        host.querySelector('#eOk').addEventListener('click', function () {
          var title = t.value.trim();
          var body = host.querySelector('#eBody').value.trim();
          if (!title && !body) { A.toast('标题和正文至少填一个'); t.focus(); return; }
          var ch = Number(host.querySelector('#eCh').value);
          if (isNew) {
            var maxOrder = A.state.notes.reduce(function (m, x) { return Math.max(m, x.order); }, -1);
            A.state.notes.push({ id: 'n' + Date.now(), title: title || '未命名笔记', body: body, ch: ch, at: Date.now(), order: maxOrder + 1 });
          } else {
            note.title = title || '未命名笔记'; note.body = body; note.ch = ch;
          }
          A.save(); A.closeDrawer(); paintNotes(); A.toast(isNew ? '笔记已创建' : '笔记已保存');
        });
      });
  }

  function exportNotes(subset) {
    var list = subset || noteList();
    if (!list.length) { A.toast('没有可导出的笔记'); return; }
    var text = '# 我的学习笔记\n\n' + list.map(function (n) {
      var ch = n.ch ? chById(n.ch) : null;
      return '## ' + n.title + '\n\n归属：' + (ch ? '第' + ch.id + '章 ' + ch.title : '通用') + '\n时间：' + A.dateText(n.at) + '\n\n' + n.body + '\n';
    }).join('\n---\n\n');
    A.download('学习笔记.md', text, 'text/markdown');
    A.toast('已导出 ' + list.length + ' 条笔记');
  }

  /* ============ 速查 ============ */
  var glossaryAll = null;
  function allGlossary() {
    if (glossaryAll) return glossaryAll;
    var list = [], seen = Object.create(null);
    function add(g) {
      if (!g || !g.term || !g.def || !chById(g.ch)) return;
      var key = String(g.term).toLowerCase() + '|' + g.ch;
      if (seen[key]) return;
      seen[key] = 1;
      list.push(g);
    }
    ((window.STUDY && window.STUDY.terms) || []).forEach(add);
    S.glossary.forEach(add);
    glossaryAll = list;
    return list;
  }

  function cheats(params, query) {
    var glossary = allGlossary();
    var kw = query && query.q ? query.q : '';
    var keyRows = A.CHAPTERS.map(function (ch) {
      var keys = ch.questions.map(function (q) { return q.n + '.' + A.correctText(q); }).join('　');
      return '<tr' + hueStyle(ch) + '><td class="num">' + ch.id + '</td><td>' + esc(ch.title) + '</td>' +
        '<td class="num">' + ch.questions.length + '</td><td>' + esc(ch.exam.rule) + '</td>' +
        '<td class="k">' + esc(keys) + '</td></tr>';
    }).join('');

    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">CHEAT SHEET</div><h1 class="page-title">考前<em>速查手册</em></h1>' +
      '<p class="page-sub">公式、指标选择、判别口诀、易混对照与术语表。输入关键词可以即时过滤术语。</p></div>' +
      S.cheats.map(function (g) {
        return '<section class="cheat-sec rv" style="--hue:' + g.hue + '"><div class="k">' + esc(g.kicker) + '</div>' +
          '<h2>' + esc(g.title) + '</h2><div class="prose">' + g.html + '</div></section>';
      }).join('') +
      '<section class="cheat-sec rv" style="--hue:#ffb020"><div class="k">答案串</div><h2>八章答案速查</h2>' +
      '<div class="prose"><p>按课程文档原顺序排列，题号与答案一一对应。</p></div>' +
      '<div class="tbl"><table class="key-table"><thead><tr><th>章</th><th>标题</th><th>题量</th><th>分值规则</th><th>答案</th></tr></thead><tbody>' + keyRows + '</tbody></table></div></section>' +
      '<section class="cheat-sec rv" id="sec-glossary" style="--hue:#8b5cf6"><div class="k">术语 ' + glossary.length + ' 条</div><h2>缩写与术语</h2>' +
      '<div class="toolbar" style="margin:.8rem 0 1rem"><input class="inp grow" id="glq" type="search" placeholder="输入缩写或中文，例如 VLA、召回、隐私" value="' + esc(kw) + '"></div>' +
      '<div class="glossary" id="glList"></div></section></div>';
    A.render(html);
    paintGlossary(kw);
    document.getElementById('glq').addEventListener('input', function () { paintGlossary(this.value); });
    if (kw) {
      window.setTimeout(function () {
        var sec = document.getElementById('sec-glossary');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  function paintGlossary(kw) {
    var q = A.norm(kw);
    var list = allGlossary().filter(function (g) {
      return !q || A.norm(g.term + ' ' + (g.full || '') + ' ' + g.def).indexOf(q) >= 0;
    });
    var host = document.getElementById('glList');
    if (!list.length) { host.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>没有匹配的术语</h3><p>换个关键词试试。</p></div>'; return; }
    host.innerHTML = list.map(function (g) {
      var ch = chById(g.ch);
      return '<div class="gl-item" style="--hue:' + ch.hue + '"><div class="gl-term">' + esc(g.term) + '</div>' +
        '<div class="gl-full">' + esc(g.full) + '</div><div class="gl-def">' + esc(g.def) + '</div>' +
        '<a class="gl-ch" href="#/chapter/' + ch.id + '">第' + ch.id + '章 ' + esc(ch.title) + ' →</a></div>';
    }).join('');
  }

  /* ============ 搜索 ============ */
  var index = null;
  function buildIndex() {
    if (index) return index;
    index = [];
    A.CHAPTERS.forEach(function (ch) {
      index.push({ kind: '章节', hue: ch.hue, title: '第' + ch.id + '章 ' + ch.title, snip: ch.tagline, href: '#/chapter/' + ch.id, text: ch.title + ' ' + ch.subtitle + ' ' + ch.tagline + ' ' + ch.lead });
      ch.sections.forEach(function (sec) {
        var plain = sec.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        index.push({ kind: '讲义', hue: ch.hue, title: sec.title, snip: plain.slice(0, 90), href: '#/chapter/' + ch.id + '/' + sec.id, text: sec.title + ' ' + sec.kicker + ' ' + plain });
      });
      ch.questions.concat(ch.bonus || []).forEach(function (q) {
        var plain = q.why.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        index.push({
          kind: '题目', hue: ch.hue, title: '第' + ch.id + '章 第' + q.n + '题 · ' + (q.point || ''),
          snip: q.stem, href: '#/practice?keys=' + ch.id + '-' + q.n,
          text: q.stem + ' ' + (q.opts || []).join(' ') + ' ' + (q.point || '') + ' ' + plain
        });
      });
    });
    allGlossary().forEach(function (g) {
      index.push({ kind: '术语', hue: chById(g.ch).hue, title: g.term + ' · ' + (g.full || ''), snip: g.def, href: '#/cheats?q=' + encodeURIComponent(g.term), text: g.term + ' ' + (g.full || '') + ' ' + g.def + ' ' + (g.alias || []).join(' ') });
    });
    S.cheats.forEach(function (g) {
      var plain = g.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      index.push({ kind: '速查', hue: g.hue, title: g.title, snip: plain.slice(0, 90), href: '#/cheats', text: g.title + ' ' + plain });
    });
    return index;
  }

  var searchCur = 0, searchHits = [];
  function openSearch() {
    var host = document.getElementById('search');
    host.innerHTML = '<div class="search-scrim" data-sclose></div><div class="search-box">' +
      '<input class="search-input" id="sInput" type="search" placeholder="搜索讲义、题目、术语、公式…" autocomplete="off">' +
      '<div class="search-results" id="sResults"></div>' +
      '<div class="search-foot"><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span><span id="sCount"></span></div></div>';
    host.classList.add('is-on');
    document.body.classList.add('no-scroll');
    var inp = document.getElementById('sInput');
    inp.focus();
    host.querySelector('[data-sclose]').addEventListener('click', closeSearch);
    inp.addEventListener('input', function () { runSearch(inp.value); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSearch(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSearch(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); openHit(); }
      else if (e.key === 'Escape') { closeSearch(); }
    });
    runSearch('');
  }
  function closeSearch() {
    var host = document.getElementById('search');
    host.classList.remove('is-on'); host.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }
  function runSearch(kw) {
    var q = A.norm(kw);
    var all = buildIndex();
    searchHits = !q ? all.filter(function (x) { return x.kind === '章节'; })
      : all.map(function (x) {
        var t = A.norm(x.text);
        var i = t.indexOf(q);
        if (i < 0) return null;
        return { hit: x, score: (A.norm(x.title).indexOf(q) >= 0 ? 0 : 100) + i };
      }).filter(Boolean).sort(function (a, b) { return a.score - b.score; }).slice(0, 40).map(function (x) { return x.hit; });
    searchCur = 0;
    var host = document.getElementById('sResults');
    document.getElementById('sCount').textContent = searchHits.length + ' 条结果';
    if (!searchHits.length) { host.innerHTML = '<div class="empty" style="border:0"><h3>没有找到</h3><p>试试「召回率」「VLA」「信息茧房」「卷积」。</p></div>'; return; }
    host.innerHTML = searchHits.map(function (h, i) {
      return '<a class="sr-item' + (i === 0 ? ' is-cur' : '') + '" style="--hue:' + h.hue + '" href="' + h.href + '" data-i="' + i + '">' +
        '<div class="sr-kind">' + esc(h.kind) + '</div><div class="sr-title">' + esc(h.title) + '</div>' +
        '<div class="sr-snip">' + markHit(h.snip, kw) + '</div></a>';
    }).join('');
    host.querySelectorAll('.sr-item').forEach(function (el) {
      el.addEventListener('click', function () { closeSearch(); });
      el.addEventListener('mouseenter', function () { searchCur = Number(el.getAttribute('data-i')); paintSearchCur(); });
    });
  }
  function markHit(text, kw) {
    var safe = esc(text);
    if (!kw) return safe;
    var i = safe.toLowerCase().indexOf(kw.toLowerCase());
    if (i < 0) return safe;
    return safe.slice(0, i) + '<mark>' + safe.slice(i, i + kw.length) + '</mark>' + safe.slice(i + kw.length);
  }
  function moveSearch(d) {
    if (!searchHits.length) return;
    searchCur = (searchCur + d + searchHits.length) % searchHits.length;
    paintSearchCur();
    var el = document.querySelector('.sr-item.is-cur');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function paintSearchCur() {
    document.querySelectorAll('.sr-item').forEach(function (el) {
      el.classList.toggle('is-cur', Number(el.getAttribute('data-i')) === searchCur);
    });
  }
  function openHit() {
    var h = searchHits[searchCur];
    if (!h) return;
    closeSearch();
    A.nav(h.href.replace(/^#/, ''));
  }

  /* ============ 徽标 ============ */
  function syncBadge() {
    var b = document.getElementById('wrongBadge');
    var n = Object.keys(A.state.wrong).length;
    b.textContent = n; b.hidden = n === 0;
  }

  window.Views = {
    home: home, chapters: chapters, chapter: chapter, wrong: wrong, notes: notes, cheats: cheats,
    openSearch: openSearch, closeSearch: closeSearch, syncBadge: syncBadge,
    detailDrawer: detailDrawer, noteEditor: noteEditor, chById: chById, typeName: typeName
  };

  A.addRoute('/', home);
  A.addRoute('/chapters', chapters);
  A.addRoute('/chapter', function () { A.nav('/chapter/1', true); });
  A.addRoute('/chapter/:id', chapter);
  A.addRoute('/chapter/:id/:sec', chapter);
  A.addRoute('/wrong', wrong);
  A.addRoute('/notes', notes);
  A.addRoute('/cheats', cheats);
})();