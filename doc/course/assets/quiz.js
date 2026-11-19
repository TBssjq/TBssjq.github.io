/* 刷题与模拟考试 */
(function () {
  'use strict';
  var A = window.App, esc = A.esc, V = window.Views;

  /* ================= 刷题 ================= */
  var P = {
    cfg: {
      chs: new Set(A.CHAPTERS.map(function (c) { return c.id; })),
      n: 10, order: 'seq', type: 'all', only: 'all'
    },
    seed: 1234, pool: [], full: 0, idx: 0,
    answers: {}, locked: {}, cleared: {}, optOrder: {},
    fixed: null, elapsed: 0, mounted: false
  };
  var saveTimer = 0;

  function settings() { return A.state.settings; }

  function validKey(key) { return A.QMAP.has(key); }

  function cleanMap(raw, onlyTrue) {
    var out = {};
    if (!raw || typeof raw !== 'object') return out;
    Object.keys(raw).forEach(function (key) {
      if (!validKey(key)) return;
      var value = raw[key];
      if (onlyTrue) { if (value) out[key] = true; }
      else if (value != null) out[key] = value;
    });
    return out;
  }

  function cleanOptOrder(raw) {
    var out = {};
    if (!raw || typeof raw !== 'object') return out;
    Object.keys(raw).forEach(function (key) {
      var entry = A.QMAP.get(key);
      var order = raw[key];
      if (!entry || entry.q.type === 'blank' || !Array.isArray(order)) return;
      if (order.length !== entry.q.opts.length) return;
      var seen = {};
      var ok = order.every(function (n) {
        if (!Number.isInteger(n) || n < 0 || n >= entry.q.opts.length || seen[n]) return false;
        seen[n] = true;
        return true;
      });
      if (ok) out[key] = order.slice();
    });
    return out;
  }

  function applySaved(saved) {
    if (!saved || saved.v !== 1) return false;
    if (saved.cfg) {
      var ids = Array.isArray(saved.cfg.chs) ? saved.cfg.chs.map(Number).filter(function (id) {
        return A.CHAPTERS.some(function (c) { return c.id === id; });
      }) : [];
      if (Array.isArray(saved.cfg.chs)) P.cfg.chs = new Set(ids);
      P.cfg.n = Math.max(1, Number(saved.cfg.n) || P.cfg.n);
      if (['seq', 'rand', 'rev'].indexOf(saved.cfg.order) >= 0) P.cfg.order = saved.cfg.order;
      if (['all', 'undone', 'wrong'].indexOf(saved.cfg.only) >= 0) P.cfg.only = saved.cfg.only;
      if (['all', 'single', 'multi', 'blank'].indexOf(saved.cfg.type) >= 0) P.cfg.type = saved.cfg.type;
    }
    P.seed = Number(saved.seed) || P.seed;
    P.answers = cleanMap(saved.answers, false);
    P.locked = cleanMap(saved.locked, true);
    P.cleared = cleanMap(saved.cleared, true);
    P.optOrder = cleanOptOrder(saved.optOrder);
    P.elapsed = Math.max(0, Number(saved.elapsed) || 0);
    P.fixed = Array.isArray(saved.fixed) ? saved.fixed.filter(validKey) : null;
    if (P.fixed && !P.fixed.length) P.fixed = null;
    return true;
  }

  function restorePool(saved) {
    var keys = Array.isArray(saved.pool) ? saved.pool.filter(validKey) : [];
    if (!keys.length) return false;
    P.pool = keys.map(function (key) {
      var entry = A.QMAP.get(key);
      return { q: entry.q, ch: entry.ch, key: entry.ch.id + '-' + entry.q.n, bonus: entry.bonus };
    });
    P.full = Math.max(P.pool.length, poolItems().length);
    P.idx = Math.max(0, Math.min(Number(saved.idx) || 0, P.pool.length - 1));
    return true;
  }

  function hydratePool() {
    P.pool.forEach(function (x) {
      if (P.cleared[x.key]) return;
      var rec = A.state.records[x.key];
      if (!rec) return;
      var answered = rec.a != null && rec.a !== '' && (!Array.isArray(rec.a) || rec.a.length);
      if (!answered) return;
      if (P.answers[x.key] == null) P.answers[x.key] = rec.a;
      if (!P.locked[x.key]) P.locked[x.key] = true;
    });
  }

  function saveSession() {
    window.clearTimeout(saveTimer);
    A.state.lastPractice = {
      v: 1,
      cfg: {
        chs: Array.from(P.cfg.chs),
        n: P.cfg.n,
        order: P.cfg.order,
        type: P.cfg.type,
        only: P.cfg.only
      },
      seed: P.seed,
      fixed: P.fixed ? P.fixed.slice() : null,
      pool: P.pool.map(function (x) { return x.key; }),
      full: P.full,
      idx: P.idx,
      answers: cleanMap(P.answers, false),
      locked: cleanMap(P.locked, true),
      cleared: cleanMap(P.cleared, true),
      optOrder: cleanOptOrder(P.optOrder),
      elapsed: P.elapsed,
      at: Date.now()
    };
    A.save();
  }

  function queueSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveSession, 300);
  }

  function poolItems() {
    var items = [];
    A.CHAPTERS.forEach(function (ch) {
      if (!P.cfg.chs.has(ch.id)) return;
      ch.questions.forEach(function (q) { items.push({ q: q, ch: ch, key: ch.id + '-' + q.n, bonus: false }); });
      if (settings().withBonus) (ch.bonus || []).forEach(function (q) { items.push({ q: q, ch: ch, key: ch.id + '-' + q.n, bonus: true }); });
    });
    if (P.cfg.type !== 'all') items = items.filter(function (x) { return x.q.type === P.cfg.type; });
    if (P.cfg.only === 'undone') items = items.filter(function (x) { return !A.state.records[x.key]; });
    if (P.cfg.only === 'wrong') items = items.filter(function (x) { return !!A.state.wrong[x.key]; });
    if (P.cfg.order === 'rand') items = A.shuffle(items, P.seed);
    if (P.cfg.order === 'rev') items = items.slice().reverse();
    return items;
  }

  function rebuild(keepIndex) {
    var items = poolItems();
    P.full = items.length;
    if (P.fixed) {
      P.pool = P.fixed.map(function (k) { return A.QMAP.get(k); }).filter(Boolean)
        .map(function (e) { return { q: e.q, ch: e.ch, key: e.ch.id + '-' + e.q.n, bonus: e.bonus }; });
    } else {
      P.pool = items.slice(0, Math.min(P.cfg.n, items.length));
    }
    P.pool.forEach(function (x) {
      if (settings().shuffleOpts && x.q.type !== 'blank' && !P.optOrder[x.key]) {
        P.optOrder[x.key] = A.shuffle(x.q.opts.map(function (_, i) { return i; }), P.seed + x.q.n * 31 + x.ch.id);
      }
      if (!settings().shuffleOpts) delete P.optOrder[x.key];
    });
    if (!keepIndex) P.idx = 0;
    P.idx = Math.max(0, Math.min(P.idx, Math.max(0, P.pool.length - 1)));
    hydratePool();
  }

  function practice(params, query) {
    query = query || {};
    var saved = A.state.lastPractice;
    var restored = false;
    var keepPool = false;
    var fromQuery = !!(query.keys || query.ch || query.bonus);
    if (saved && applySaved(saved)) {
      restored = true;
      keepPool = !fromQuery && restorePool(saved);
    }
    if (query.keys) {
      P.fixed = query.keys.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    } else {
      if (!keepPool) P.fixed = null;
      if (query.ch) {
        P.cfg.chs = new Set(query.ch.split(',').map(Number));
        P.cfg.n = 999;
      }
      if (query.bonus) { settings().withBonus = true; A.save(); }
    }
    if (!keepPool) rebuild(false);
    else hydratePool();
    P.mounted = true;
    var doneCount = P.pool.filter(function (x) { return P.locked[x.key]; }).length;
    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">PRACTICE</div><h1 class="page-title">刷题<em>训练场</em></h1>' +
      '<p class="page-sub">右侧控制区随时可调，改动立刻生效；本组题目、作答与当前位置会自动记在本机，下次打开继续。键盘 1–4 或 A–D 选项，Enter 提交或下一题，左右方向键翻题。</p></div>' +
      (P.fixed ? '<div class="notice">当前练习的是指定的 ' + P.fixed.length + ' 道题。<button class="btn btn--sm" type="button" id="pFree" style="margin-left:.6rem">返回自由组卷</button></div>' : '') +
      '<div class="practice-layout"><div id="pMain"></div><aside class="rail" id="pRail"></aside></div></div>';
    A.render(html);
    paintRail();
    paintQuestion();
    saveSession();
    if (restored && !fromQuery && (doneCount > 0 || P.idx > 0)) {
      A.toast('已恢复上次练习：第 ' + (P.idx + 1) + ' 题，已完成 ' + doneCount + ' / ' + P.pool.length);
    }
    if (P.fixed) {
      document.getElementById('pFree').addEventListener('click', function () {
        P.fixed = null;
        P.cfg.chs = new Set(A.CHAPTERS.map(function (c) { return c.id; }));
        P.cfg.n = 10;
        P.idx = 0;
        rebuild(false);
        saveSession();
        A.nav('/practice');
      });
    }
  }

  function railHtml() {
    var st = settings();
    var maxN = Math.max(1, P.full);
    var doneCount = P.pool.filter(function (x) { return P.locked[x.key]; }).length;
    var rightCount = P.pool.filter(function (x) { return P.locked[x.key] && A.state.records[x.key] && A.state.records[x.key].ok; }).length;
    return '<div class="rail-head"><h3>练习控制</h3><span class="rail-live"><i></i>LIVE</span></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>章节范围</span><span class="ctrl-val">' + P.cfg.chs.size + '/8</span></div>' +
      '<div class="chips" id="cCh">' + A.CHAPTERS.map(function (c) {
        return '<button class="chip' + (P.cfg.chs.has(c.id) ? ' is-on' : '') + '" type="button" data-ch="' + c.id + '" style="--hue:' + c.hue + '">' + c.id + '</button>';
      }).join('') + '<button class="chip" type="button" data-ch="all">全选</button></div></div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>本组题量</span><span class="ctrl-val">' + P.pool.length + ' / ' + maxN + '</span></div>' +
      '<input type="range" id="cN" min="1" max="' + maxN + '" value="' + Math.min(P.cfg.n, maxN) + '"></div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>出题顺序</span></div>' +
      seg('cOrder', [['seq', '顺序'], ['rand', '随机'], ['rev', '倒序']], P.cfg.order) + '</div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>题目范围</span></div>' +
      seg('cOnly', [['all', '全部'], ['undone', '未做'], ['wrong', '错题']], P.cfg.only) + '</div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>题型</span></div>' +
      seg('cType', [['all', '全部'], ['single', '单选'], ['multi', '多选'], ['blank', '填空']], P.cfg.type) + '</div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>正文字号</span><span class="ctrl-val">' + st.font + 'px</span></div>' +
      '<input type="range" id="cFont" min="14" max="24" step="1" value="' + st.font + '"></div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>排版密度</span></div>' +
      seg('cDensity', [['cozy', '舒适'], ['compact', '紧凑']], st.density) + '</div>' +

      '<div class="ctrl"><label class="switch"><span>即时判定与解析</span><input type="checkbox" id="cInstant"' + (st.instant ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><label class="switch"><span>打乱选项顺序</span><input type="checkbox" id="cShuffle"' + (st.shuffleOpts ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><label class="switch"><span>答对自动下一题</span><input type="checkbox" id="cAuto"' + (st.autoNext ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><label class="switch"><span>显示用时</span><input type="checkbox" id="cTimer"' + (st.showTimer ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><label class="switch"><span>含课件自测题</span><input type="checkbox" id="cBonus"' + (st.withBonus ? ' checked' : '') + '><span class="track"></span></label></div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>本组进度</span><span class="ctrl-val">' + doneCount + '/' + P.pool.length + '</span></div>' +
      '<div class="bar" style="--hue:var(--ok)"><i style="width:' + (P.pool.length ? doneCount / P.pool.length * 100 : 0) + '%"></i></div>' +
      '<div class="ch-foot"><span>答对 ' + rightCount + '</span><span data-clock="practice">' + (st.showTimer ? A.clock(P.elapsed) : '计时关闭') + '</span></div></div>' +

      '<div class="ctrl"><div class="ctrl-label"><span>答题卡</span></div><div class="sheet" id="pSheet">' +
      P.pool.map(function (x, i) {
        var r = A.state.records[x.key];
        var stateText = '未做';
        var cls = i === P.idx ? 'is-cur' : '';
        if (P.locked[x.key]) {
          stateText = r && r.ok ? '已答对' : '已答错';
          cls += r ? (r.ok ? ' is-right' : ' is-wrong') : ' is-done';
        } else if (P.answers[x.key] != null) {
          stateText = '已选择未提交';
          cls += ' is-done';
        }
        return '<button type="button" class="' + cls + '" data-go="' + i + '" aria-label="第' + (i + 1) + '题，' + stateText + '">' + (i + 1) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="rail-actions">' +
      '<button class="btn btn--sm" type="button" id="aReshuffle">重新组卷</button>' +
      '<button class="btn btn--sm" type="button" id="aRandom">随机一题</button>' +
      '<button class="btn btn--sm" type="button" id="aExport">导出本组</button>' +
      '<button class="btn btn--sm btn--danger" type="button" id="aClear">清空作答</button>' +
      '<a class="btn btn--sm btn--primary btn--wide" href="#/exam">进入模拟考试</a>' +
      '</div>';
  }

  function seg(id, items, cur) {
    return '<div class="seg" id="' + id + '">' + items.map(function (x) {
      return '<button type="button" data-v="' + x[0] + '"' + (cur === x[0] ? ' class="is-on"' : '') + '>' + x[1] + '</button>';
    }).join('') + '</div>';
  }

  function paintRail() {
    var host = document.getElementById('pRail');
    if (!host) return;
    host.innerHTML = railHtml();
    bindRail(host);
  }

  function bindRail(host) {
    var st = settings();
    host.querySelector('#cCh').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var v = b.getAttribute('data-ch');
      if (v === 'all') {
        if (P.cfg.chs.size === 8) P.cfg.chs = new Set();
        else P.cfg.chs = new Set(A.CHAPTERS.map(function (c) { return c.id; }));
      } else {
        var id = Number(v);
        if (P.cfg.chs.has(id)) P.cfg.chs.delete(id); else P.cfg.chs.add(id);
      }
      P.fixed = null; rebuild(false); saveSession(); paintRail(); paintQuestion();
    });
    host.querySelector('#cN').addEventListener('input', function () {
      P.cfg.n = Number(this.value); P.fixed = null; rebuild(true);
      saveSession(); paintRail(); paintQuestion();
    });
    [['cOrder', 'order'], ['cOnly', 'only'], ['cType', 'type']].forEach(function (pair) {
      host.querySelector('#' + pair[0]).addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        P.cfg[pair[1]] = b.getAttribute('data-v'); P.fixed = null; rebuild(false);
        saveSession(); paintRail(); paintQuestion();
      });
    });
    host.querySelector('#cDensity').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      st.density = b.getAttribute('data-v'); A.save();
      document.getElementById('view').setAttribute('data-density', st.density);
      this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
    });
    host.querySelector('#cFont').addEventListener('input', function () {
      st.font = Number(this.value);
      document.documentElement.style.setProperty('--read-size', st.font + 'px');
      this.previousElementSibling.querySelector('.ctrl-val').textContent = st.font + 'px';
      A.save();
    });
    [['cInstant', 'instant'], ['cShuffle', 'shuffleOpts'], ['cAuto', 'autoNext'], ['cTimer', 'showTimer'], ['cBonus', 'withBonus']].forEach(function (pair) {
      host.querySelector('#' + pair[0]).addEventListener('change', function () {
        st[pair[1]] = this.checked; A.save();
        if (pair[1] === 'shuffleOpts' || pair[1] === 'withBonus') { rebuild(true); }
        saveSession(); paintRail(); paintQuestion();
      });
    });
    host.querySelector('#pSheet').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      P.idx = Number(b.getAttribute('data-go')); saveSession(); paintRail(); paintQuestion();
    });
    host.querySelector('#aReshuffle').addEventListener('click', function () {
      P.seed = Math.floor(Math.random() * 1e6) + 1;
      P.optOrder = {}; P.idx = 0; P.elapsed = 0; P.fixed = null;
      rebuild(false); saveSession(); paintRail(); paintQuestion();
      A.toast('已重新组卷，作答记录保留');
    });
    host.querySelector('#aRandom').addEventListener('click', function () {
      if (!P.pool.length) { A.toast('当前筛选没有题目'); return; }
      P.idx = Math.floor(Math.random() * P.pool.length); saveSession(); paintRail(); paintQuestion();
    });
    host.querySelector('#aExport').addEventListener('click', exportSet);
    host.querySelector('#aClear').addEventListener('click', function () {
      var backupA = Object.assign({}, P.answers), backupL = Object.assign({}, P.locked), backupC = Object.assign({}, P.cleared), backupE = P.elapsed;
      P.pool.forEach(function (x) {
        delete P.answers[x.key];
        delete P.locked[x.key];
        P.cleared[x.key] = true;
      });
      P.elapsed = 0;
      saveSession(); paintRail(); paintQuestion();
      A.toast('已清空本组作答', '撤销', function () {
        P.answers = backupA; P.locked = backupL; P.cleared = backupC; P.elapsed = backupE;
        saveSession(); paintRail(); paintQuestion();
      });
    });
  }

  function exportSet() {
    if (!P.pool.length) { A.toast('当前没有题目可导出'); return; }
    var text = '# 练习卷 · ' + A.dateText(Date.now()) + '\n\n' + P.pool.map(function (x, i) {
      var q = x.q;
      var body = '## ' + (i + 1) + '. （第' + x.ch.id + '章 第' + q.n + '题 · ' + V.typeName(q.type) + '）\n\n' + q.stem + '\n\n';
      if (q.type !== 'blank') body += q.opts.map(function (o, j) { return A.LETTERS[j] + '. ' + o; }).join('\n') + '\n\n';
      body += '**答案：' + A.correctText(q) + '**\n\n' + q.why.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() + '\n';
      return body;
    }).join('\n---\n\n');
    A.download('练习卷.md', text, 'text/markdown');
    A.toast('已导出 ' + P.pool.length + ' 道题');
  }

  function paintQuestion() {
    var host = document.getElementById('pMain');
    if (!host) return;
    if (!P.pool.length) {
      host.innerHTML = '<div class="empty"><h3>当前筛选没有题目</h3><p>放宽章节范围、题型或题目范围，再试一次。错题范围为空说明错题本里没有符合的题。</p>' +
        '<button class="btn btn--primary" type="button" id="pReset">恢复默认筛选</button></div>';
      host.querySelector('#pReset').addEventListener('click', function () {
        P.cfg.chs = new Set(A.CHAPTERS.map(function (c) { return c.id; }));
        P.cfg.type = 'all'; P.cfg.only = 'all'; P.cfg.order = 'seq'; P.cfg.n = 10; P.fixed = null;
        rebuild(false); saveSession(); paintRail(); paintQuestion();
      });
      return;
    }
    var x = P.pool[P.idx], q = x.q, ch = x.ch;
    var locked = !!P.locked[x.key];
    var picked = P.answers[x.key];
    var rec = A.state.records[x.key];
    var order = P.optOrder[x.key] || q.opts && q.opts.map(function (_, i) { return i; });

    var body = '';
    if (q.type === 'blank') {
      var val = picked == null ? '' : String(picked);
      body = '<div class="blank-row"><input class="blank-input' + (locked ? (rec && rec.ok ? ' is-right' : ' is-wrong') : '') + '" id="qBlank" type="text" value="' + esc(val) + '" placeholder="输入答案后按 Enter"' + (locked ? ' disabled' : '') + '>' +
        (locked ? '' : '<button class="btn btn--primary" type="button" id="qSubmit">提交</button>') + '</div>';
    } else {
      body = '<div class="opts" id="qOpts">' + order.map(function (oi, pos) {
        var L = A.LETTERS[oi];
        var isPicked = q.type === 'multi' ? (Array.isArray(picked) && picked.indexOf(L) >= 0) : picked === L;
        var cls = 'opt';
        if (locked) {
          if (q.ans.indexOf(L) >= 0) cls += ' is-right';
          else if (isPicked) cls += ' is-wrong';
        } else if (isPicked) cls += ' is-picked';
        return '<button class="' + cls + '" type="button" data-l="' + L + '"' + (locked ? ' disabled' : '') + '>' +
          '<span class="opt-key">' + A.LETTERS[pos] + '</span><span>' + esc(q.opts[oi]) +
          (locked && q.ans.indexOf(L) >= 0 ? '<span class="opt-flag good">正确答案</span>' : '') +
          (locked && isPicked && q.ans.indexOf(L) < 0 ? '<span class="opt-flag bad">你的选择</span>' : '') +
          '</span></button>';
      }).join('') + '</div>' +
        (!locked && (q.type === 'multi' || !settings().instant)
          ? '<div class="q-actions"><button class="btn btn--primary" type="button" id="qSubmit">提交答案</button>' +
            '<span class="q-progress">' + (q.type === 'multi' ? '可多选，选完再提交' : '即时判定已关闭，选完手动提交') + '</span></div>'
          : '');
    }

    var verdict = '';
    if (locked && rec) {
      verdict = '<div class="verdict ' + (rec.ok ? 'verdict--ok' : 'verdict--no') + '">' +
        '<div class="verdict-head"><span class="tag">' + (rec.ok ? '答对' : '答错') + '</span>' +
        '正确答案 ' + esc(A.correctText(q)) + ' · 你的答案 ' + esc(A.answerText(q, rec.a)) + '</div>' +
        '<div class="verdict-body" data-annotate data-ch="' + ch.id + '">' + q.why + '</div>' +
        '<div class="verdict-meta"><span class="pill pill--hue">' + esc(q.point || '') + '</span>' +
        (q.anchor ? '<span class="pill">' + esc(q.anchor) + '</span>' : '') +
        (q.reconstructed ? '<span class="pill pill--warn">题干据课程文档整理</span>' : '') +
        (x.bonus ? '<span class="pill">课件自测题</span>' : '') + '</div></div>';
    }

    var allDone = P.pool.every(function (p) { return P.locked[p.key]; });
    var summary = '';
    if (allDone) {
      var right = P.pool.filter(function (p) { return A.state.records[p.key] && A.state.records[p.key].ok; }).length;
      summary = '<div class="verdict verdict--ok" style="margin-top:1rem"><div class="verdict-head"><span class="tag">本组完成</span>' +
        right + ' / ' + P.pool.length + ' 题答对，正确率 ' + Math.round(right / P.pool.length * 100) + '%</div>' +
        '<div class="q-actions"><button class="btn btn--sm btn--primary" type="button" id="qAgain">再来一组</button>' +
        '<a class="btn btn--sm" href="#/wrong">去看错题本</a><a class="btn btn--sm" href="#/exam">试试限时模考</a></div></div>';
    }

    host.innerHTML = '<article class="q-card" style="--hue:' + ch.hue + '">' +
      '<div class="q-head"><span class="q-no">' + String(P.idx + 1).padStart(2, '0') + '</span>' +
      '<span class="pill pill--hue">第' + ch.id + '章 ' + esc(ch.title) + '</span>' +
      '<span class="pill">原卷第' + (q.orig || q.n) + '题</span>' +
      '<span class="pill">' + V.typeName(q.type) + '</span>' +
      '<span class="pill">' + A.fmtScore(A.scoreOf(q, ch)) + ' 分</span>' +
      (A.state.wrong[x.key] ? '<span class="pill pill--danger">错题本</span>' : '') +
      '</div>' +
      '<p class="q-stem" data-annotate data-ch="' + ch.id + '">' + esc(q.stem) + '</p>' +
      (q.figure ? '<div class="q-figure prose" data-annotate data-ch="' + ch.id + '">' + q.figure + '</div>' : '') +
      body + verdict +
      '<div class="q-actions">' +
      '<button class="btn btn--sm" type="button" id="qPrev"' + (P.idx === 0 ? ' disabled' : '') + '>上一题</button>' +
      '<button class="btn btn--sm btn--primary" type="button" id="qNext"' + (P.idx >= P.pool.length - 1 ? ' disabled' : '') + '>下一题</button>' +
      (locked ? '<button class="btn btn--sm" type="button" id="qRetry">重做本题</button>' : '') +
      '<button class="btn btn--sm btn--ghost" type="button" id="qNote">记笔记</button>' +
      '<a class="btn btn--sm btn--ghost" href="#/chapter/' + ch.id + '">看讲义</a>' +
      '<span class="q-progress">' + (P.idx + 1) + ' / ' + P.pool.length + '</span>' +
      '</div>' + summary + '</article>';

    A.mathify(host);
    if (window.Terms) window.Terms.annotate(host);
    bindQuestion(host, x, order);
    if (window.FX) window.FX.afterRender(host);
  }

  function bindQuestion(host, x, order) {
    var q = x.q, key = x.key;
    var opts = host.querySelector('#qOpts');
    if (opts) {
      opts.addEventListener('click', function (e) {
        var b = e.target.closest('.opt'); if (!b || b.disabled) return;
        pick(x, b.getAttribute('data-l'), order);
      });
    }
    var blank = host.querySelector('#qBlank');
    if (blank) {
      blank.addEventListener('input', function () {
        P.answers[key] = this.value;
        delete P.cleared[key];
        queueSave();
      });
      blank.addEventListener('blur', function () { paintRail(); });
      blank.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(x); }
      });
      blank.focus();
    }
    var sub = host.querySelector('#qSubmit');
    if (sub) sub.addEventListener('click', function () { commit(x); });
    var prev = host.querySelector('#qPrev');
    if (prev) prev.addEventListener('click', function () { go(-1); });
    var next = host.querySelector('#qNext');
    if (next) next.addEventListener('click', function () { go(1); });
    var retry = host.querySelector('#qRetry');
    if (retry) retry.addEventListener('click', function () {
      delete P.locked[key];
      delete P.answers[key];
      P.cleared[key] = true;
      saveSession(); paintRail(); paintQuestion();
    });
    var note = host.querySelector('#qNote');
    if (note) note.addEventListener('click', function () {
      V.noteEditor(null, {
        ch: x.ch.id,
        title: '第' + x.ch.id + '章 第' + q.n + '题 · ' + (q.point || ''),
        body: '题目：' + q.stem + '\n正确答案：' + A.correctText(q) + '\n记忆点：' + (q.anchor || '') + '\n我的理解：'
      });
    });
    var again = host.querySelector('#qAgain');
    if (again) again.addEventListener('click', function () {
      P.seed = Math.floor(Math.random() * 1e6) + 1;
      P.pool.forEach(function (item) {
        delete P.answers[item.key];
        delete P.locked[item.key];
        P.cleared[item.key] = true;
      });
      P.elapsed = 0; P.idx = 0;
      rebuild(false); saveSession(); paintRail(); paintQuestion();
    });
  }

  function pick(x, letter, order) {
    var q = x.q, key = x.key;
    delete P.cleared[key];
    if (q.type === 'multi') {
      var cur = Array.isArray(P.answers[key]) ? P.answers[key].slice() : [];
      var i = cur.indexOf(letter);
      if (i >= 0) cur.splice(i, 1); else cur.push(letter);
      P.answers[key] = cur;
      queueSave(); paintQuestion(); paintRail();
      return;
    }
    P.answers[key] = letter;
    if (settings().instant) commit(x);
    else { queueSave(); paintQuestion(); paintRail(); }
  }

  function commit(x) {
    var q = x.q, key = x.key;
    var a = P.answers[key];
    if (a == null || a === '' || (Array.isArray(a) && !a.length)) { A.toast('先选择一个答案'); return; }
    var ok = A.judge(q, a);
    P.locked[key] = true;
    delete P.cleared[key];
    var prev = A.state.records[key];
    A.state.records[key] = { a: a, ok: ok, at: Date.now(), tries: (prev ? prev.tries : 0) + 1 };
    if (!ok) {
      var w = A.state.wrong[key];
      A.state.wrong[key] = { times: (w ? w.times : 0) + 1, last: Date.now() };
    }
    saveSession();
    V.syncBadge();
    paintRail(); paintQuestion();
    if (ok && settings().autoNext && P.idx < P.pool.length - 1) {
      window.setTimeout(function () { if (P.mounted) go(1); }, 700);
    }
  }

  function go(d) {
    var n = P.idx + d;
    if (n < 0 || n >= P.pool.length) return;
    P.idx = n; saveSession(); paintRail(); paintQuestion();
    var card = document.querySelector('.q-card');
    if (card) {
      var top = card.getBoundingClientRect().top + window.scrollY - 84;
      if (window.scrollY > top + 40 || window.scrollY < top - 200) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  function keyHandler(e) {
    if (!P.mounted) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (document.getElementById('search').classList.contains('is-on')) return;
    if (document.getElementById('drawer').classList.contains('is-on')) return;
    if (!P.pool.length) return;
    var x = P.pool[P.idx];
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (P.locked[x.key]) go(1); else commit(x);
      return;
    }
    if (x.q.type === 'blank' || P.locked[x.key]) return;
    var order = P.optOrder[x.key] || x.q.opts.map(function (_, i) { return i; });
    var pos = -1;
    if (/^[1-8]$/.test(e.key)) pos = Number(e.key) - 1;
    else if (/^[a-hA-H]$/.test(e.key)) pos = A.LETTERS.indexOf(e.key.toUpperCase());
    if (pos >= 0 && pos < order.length) { e.preventDefault(); pick(x, A.LETTERS[order[pos]], order); }
  }

  /* ================= 模拟考试 ================= */
  var E = {
    cfg: { chs: new Set(A.CHAPTERS.map(function (c) { return c.id; })), n: 20, min: 20, pass: 60, shuffleOpts: false, review: true },
    active: null, remain: 0, phase: 'config', result: null, seed: 7
  };
  var examSaveTimer = 0;

  function examCfgSnapshot() {
    return {
      chs: Array.from(E.cfg.chs).map(Number).sort(function (a, b) { return a - b; }),
      n: E.cfg.n, min: E.cfg.min, pass: E.cfg.pass,
      shuffleOpts: !!E.cfg.shuffleOpts, review: !!E.cfg.review
    };
  }

  function applyExamCfg(raw) {
    if (!raw || typeof raw !== 'object') return;
    var ids = Array.isArray(raw.chs) ? raw.chs.map(Number).filter(function (id) {
      return A.CHAPTERS.some(function (c) { return c.id === id; });
    }) : [];
    if (ids.length) E.cfg.chs = new Set(ids);
    E.cfg.n = Math.max(1, Math.min(999, Number(raw.n) || E.cfg.n));
    E.cfg.min = Math.max(5, Math.min(120, Number(raw.min) || E.cfg.min));
    E.cfg.pass = Math.max(50, Math.min(95, Number(raw.pass) || E.cfg.pass));
    E.cfg.shuffleOpts = !!raw.shuffleOpts;
    E.cfg.review = raw.review !== false;
  }

  function saveExam() {
    window.clearTimeout(examSaveTimer);
    var s = E.active;
    var active = null;
    if (s) {
      active = {
        id: s.id, at: s.at,
        scope: s.scope.slice(),
        items: s.items.map(function (it) {
          return { key: it.key, a: Array.isArray(it.a) ? it.a.slice() : it.a, mark: !!it.mark };
        }),
        idx: s.idx, pass: s.pass, shuffleOpts: s.shuffleOpts, review: s.review,
        dur: s.dur, optOrder: cleanOptOrder(s.optOrder)
      };
    }
    A.state.lastExam = {
      v: 1,
      cfg: examCfgSnapshot(),
      active: active,
      remain: E.remain,
      at: Date.now()
    };
    A.save();
  }

  function queueExamSave() {
    window.clearTimeout(examSaveTimer);
    examSaveTimer = window.setTimeout(saveExam, 300);
  }

  function applyExamSaved(saved) {
    if (!saved || saved.v !== 1) return false;
    applyExamCfg(saved.cfg);
    var a = saved.active;
    if (!a || !Array.isArray(a.items)) { E.phase = 'config'; return false; }
    var items = a.items.map(function (it) {
      if (!it || !validKey(it.key)) return null;
      return { key: it.key, a: Array.isArray(it.a) ? it.a.slice() : it.a, mark: !!it.mark };
    }).filter(Boolean);
    if (!items.length) { E.phase = 'config'; return false; }
    var scope = (Array.isArray(a.scope) ? a.scope : []).map(Number).filter(function (id) {
      return A.CHAPTERS.some(function (c) { return c.id === id; });
    });
    if (!scope.length) {
      var set = {};
      items.forEach(function (it) { set[A.QMAP.get(it.key).ch.id] = 1; });
      scope = Object.keys(set).map(Number);
    }
    var dur = Math.max(60, Number(a.dur) || 1200);
    E.active = {
      id: a.id || ('x' + Date.now()), at: Number(a.at) || Date.now(),
      scope: scope, items: items,
      idx: Math.max(0, Math.min(Number(a.idx) || 0, items.length - 1)),
      pass: Math.max(50, Math.min(95, Number(a.pass) || 60)),
      shuffleOpts: !!a.shuffleOpts, review: a.review !== false,
      dur: dur, optOrder: cleanOptOrder(a.optOrder)
    };
    E.phase = 'running';
    E.remain = Math.max(0, Math.min(dur, Number(saved.remain) || 0));
    return true;
  }

  function exam(params, query) {
    P.mounted = false;
    if (!E.active && E.phase !== 'running') {
      var saved = A.state.lastExam;
      if (saved) applyExamSaved(saved);
    }
    if (E.phase === 'running' && E.active) {
      if (E.remain <= 0) { submitExam(true); return; }
      paintExamRunning(); return;
    }
    if (query.ch) E.cfg.chs = new Set(query.ch.split(',').map(Number));
    if (E.phase === 'result' && E.result) { paintResult(); return; }
    paintExamConfig();
  }

  function paintExamConfig(keepScroll) {
    E.phase = 'config';
    var pool = examPool();
    var maxN = Math.max(1, pool.length);
    var hist = A.state.exams.slice().sort(function (a, b) { return b.at - a.at; });
    var html = '<div class="shell page"><div class="page-head rv">' +
      '<div class="page-kicker">MOCK EXAM</div><h1 class="page-title">限时<em>模拟考试</em></h1>' +
      '<p class="page-sub">按真实分值组卷，交卷后自动判分、把错题收进错题本，并留下成绩记录。</p></div>' +
      '<div class="practice-layout"><div>' +
      '<div class="q-card rv" style="--hue:#3d5afe"><h3 style="margin-bottom:.6rem">这一场考什么</h3>' +
      '<div class="prose"><p>从所选章节随机抽题，覆盖单选、多选与填空。多选题必须全对才得分，填空题按课程文档给出的等价答案判定。</p></div>' +
      '<div class="tbl"><table><thead><tr><th>章节</th><th>题量</th><th>分值规则</th><th>截止时间</th></tr></thead><tbody>' +
      A.CHAPTERS.filter(function (c) { return E.cfg.chs.has(c.id); }).map(function (c) {
        var i = A.dueInfo(c.exam.due);
        return '<tr style="--hue:' + c.hue + '"><td>第' + c.id + '章 ' + esc(c.title) + '</td><td class="num">' + c.questions.length + '</td><td>' + esc(c.exam.rule) + '</td><td class="num">' + esc(i.past ? '已截止' : i.text) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="q-actions"><button class="btn btn--primary" type="button" id="eStart">开始考试</button>' +
      '<button class="btn" type="button" id="eRandom">随机配置</button></div></div>' +

      '<div class="sec-head rv"><div><h2>成绩记录</h2><p>共 ' + hist.length + ' 场</p></div>' +
      (hist.length ? '<button class="btn btn--sm btn--danger" type="button" id="eClearHist">清空记录</button>' : '') + '</div>' +
      (hist.length ? '<div class="row-list">' + hist.map(function (h) {
        return '<div class="row" style="--hue:' + (h.pct >= h.pass ? '#16c784' : '#ff3b5c') + '">' +
          '<span class="ch-glyph">' + h.pct + '</span><div class="row-main">' +
          '<div class="row-title">' + (h.pct >= h.pass ? '通过' : '未通过') + ' · ' + A.fmtScore(h.got) + ' / ' + A.fmtScore(h.full) + ' 分</div>' +
          '<div class="row-meta"><span class="pill">' + esc(A.dateText(h.at)) + '</span><span class="pill">' + h.items.length + ' 题</span>' +
          '<span class="pill">用时 ' + A.clock(h.used) + '</span><span class="pill pill--hue">范围 ' + esc(h.scope.join('、')) + ' 章</span></div></div>' +
          '<div class="row-acts"><button class="btn btn--sm" type="button" data-hview="' + h.id + '">查看</button>' +
          '<button class="btn btn--sm btn--danger" type="button" data-hdel="' + h.id + '">删除</button></div></div>';
      }).join('') + '</div>' : '<div class="empty"><h3>还没有考试记录</h3><p>完成一场模拟考试后，成绩、用时与逐题作答都会保存在这里。</p></div>') +
      '</div><aside class="rail" id="eRail">' + examRailHtml(maxN) + '</aside></div></div>';
    A.render(html, keepScroll ? { keepScroll: true } : undefined);
    bindExamRail(maxN);
    document.getElementById('eStart').addEventListener('click', startExam);
    document.getElementById('eRandom').addEventListener('click', function () {
      E.cfg.n = Math.max(4, Math.min(maxN, 5 + Math.floor(Math.random() * 30)));
      E.cfg.min = [10, 15, 20, 30, 45][Math.floor(Math.random() * 5)];
      E.cfg.pass = [60, 70, 80][Math.floor(Math.random() * 3)];
      E.cfg.shuffleOpts = Math.random() > .5;
      E.seed = Math.floor(Math.random() * 1e6) + 1;
      paintExamConfig(true); A.toast('已随机生成考试配置');
    });
    var ch = document.getElementById('eClearHist');
    if (ch) ch.addEventListener('click', function () {
      var backup = A.state.exams.slice();
      A.state.exams = []; A.save(); paintExamConfig(true);
      A.toast('已清空 ' + backup.length + ' 条成绩记录', '撤销', function () {
        A.state.exams = backup; A.save(); paintExamConfig(true);
      });
    });
    document.querySelectorAll('[data-hview]').forEach(function (b) {
      b.addEventListener('click', function () {
        var h = A.state.exams.filter(function (x) { return x.id === b.getAttribute('data-hview'); })[0];
        historyDrawer(h);
      });
    });
    document.querySelectorAll('[data-hdel]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-hdel');
        var backup = A.state.exams.filter(function (x) { return x.id === id; })[0];
        A.state.exams = A.state.exams.filter(function (x) { return x.id !== id; });
        A.save(); paintExamConfig(true);
        A.toast('已删除这条成绩', '撤销', function () { A.state.exams.push(backup); A.save(); paintExamConfig(true); });
      });
    });
    saveExam();
  }

  function examPool() {
    var items = [];
    A.CHAPTERS.forEach(function (ch) {
      if (!E.cfg.chs.has(ch.id)) return;
      ch.questions.forEach(function (q) { items.push({ q: q, ch: ch, key: ch.id + '-' + q.n }); });
    });
    return items;
  }

  function examRailHtml(maxN) {
    return '<div class="rail-head"><h3>考试设置</h3><span class="rail-live"><i></i>LIVE</span></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>命题章节</span><span class="ctrl-val">' + E.cfg.chs.size + '/8</span></div>' +
      '<div class="chips" id="eCh">' + A.CHAPTERS.map(function (c) {
        return '<button class="chip' + (E.cfg.chs.has(c.id) ? ' is-on' : '') + '" type="button" data-ch="' + c.id + '" style="--hue:' + c.hue + '">' + c.id + '</button>';
      }).join('') + '<button class="chip" type="button" data-ch="all">全选</button></div></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>题量</span><span class="ctrl-val">' + Math.min(E.cfg.n, maxN) + ' / ' + maxN + '</span></div>' +
      '<input type="range" id="eN" min="1" max="' + maxN + '" value="' + Math.min(E.cfg.n, maxN) + '"></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>考试时长</span><span class="ctrl-val">' + E.cfg.min + ' 分钟</span></div>' +
      '<input type="range" id="eMin" min="5" max="120" step="5" value="' + E.cfg.min + '"></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>及格线</span><span class="ctrl-val">' + E.cfg.pass + ' 分</span></div>' +
      '<input type="range" id="ePass" min="50" max="95" step="5" value="' + E.cfg.pass + '"></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>正文字号</span><span class="ctrl-val">' + settings().font + 'px</span></div>' +
      '<input type="range" id="eFont" min="14" max="24" step="1" value="' + settings().font + '"></div>' +
      '<div class="ctrl"><label class="switch"><span>打乱选项顺序</span><input type="checkbox" id="eShuf"' + (E.cfg.shuffleOpts ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><label class="switch"><span>回顾全部题目</span><input type="checkbox" id="eRev"' + (E.cfg.review ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="rail-actions"><button class="btn btn--sm btn--primary btn--wide" type="button" id="eStart2">开始考试</button></div>';
  }

  function bindExamRail(maxN) {
    var host = document.getElementById('eRail');
    host.querySelector('#eCh').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var v = b.getAttribute('data-ch');
      if (v === 'all') E.cfg.chs = new Set(A.CHAPTERS.map(function (c) { return c.id; }));
      else {
        var id = Number(v);
        if (E.cfg.chs.has(id)) E.cfg.chs.delete(id); else E.cfg.chs.add(id);
      }
      if (!E.cfg.chs.size) E.cfg.chs.add(1);
      paintExamConfig(true);
    });
    [['eN', 'n'], ['eMin', 'min'], ['ePass', 'pass']].forEach(function (pair) {
      host.querySelector('#' + pair[0]).addEventListener('input', function () {
        E.cfg[pair[1]] = Number(this.value);
        this.previousElementSibling.querySelector('.ctrl-val').textContent =
          pair[1] === 'min' ? E.cfg.min + ' 分钟' : pair[1] === 'pass' ? E.cfg.pass + ' 分' : Math.min(E.cfg.n, maxN) + ' / ' + maxN;
        queueExamSave();
      });
    });
    host.querySelector('#eFont').addEventListener('input', function () {
      settings().font = Number(this.value);
      document.documentElement.style.setProperty('--read-size', settings().font + 'px');
      this.previousElementSibling.querySelector('.ctrl-val').textContent = settings().font + 'px';
      A.save();
    });
    host.querySelector('#eShuf').addEventListener('change', function () { E.cfg.shuffleOpts = this.checked; queueExamSave(); });
    host.querySelector('#eRev').addEventListener('change', function () { E.cfg.review = this.checked; queueExamSave(); });
    host.querySelector('#eStart2').addEventListener('click', startExam);
  }

  function startExam() {
    var pool = examPool();
    if (!pool.length) { A.toast('请至少选择一个章节'); return; }
    var picked = A.shuffle(pool, E.seed).slice(0, Math.min(E.cfg.n, pool.length));
    E.active = {
      id: 'x' + Date.now(), at: Date.now(), scope: Array.from(E.cfg.chs).sort(function (a, b) { return a - b; }),
      items: picked.map(function (x) { return { key: x.key, a: null, mark: false }; }),
      idx: 0, pass: E.cfg.pass, shuffleOpts: E.cfg.shuffleOpts, review: E.cfg.review,
      dur: E.cfg.min * 60, optOrder: {}
    };
    if (E.cfg.shuffleOpts) {
      picked.forEach(function (x) {
        if (x.q.type !== 'blank') E.active.optOrder[x.key] = A.shuffle(x.q.opts.map(function (_, i) { return i; }), E.seed + x.q.n * 17 + x.ch.id);
      });
    }
    E.remain = E.active.dur;
    E.phase = 'running';
    E.result = null;
    saveExam();
    paintExamRunning();
    A.toast('考试开始，共 ' + picked.length + ' 题，限时 ' + E.cfg.min + ' 分钟');
  }

  function paintExamRunning() {
    var html = '<div class="shell page"><div class="practice-layout"><div id="xMain"></div>' +
      '<aside class="rail" id="xRail"></aside></div></div>';
    A.render(html);
    paintExamRail();
    paintExamQuestion();
  }

  function paintExamRail() {
    var s = E.active;
    var host = document.getElementById('xRail');
    if (!host) return;
    var answered = s.items.filter(function (i) { return i.a != null && i.a !== '' && !(Array.isArray(i.a) && !i.a.length); }).length;
    host.innerHTML = '<div class="rail-head"><h3>考试进行中</h3><span class="rail-live"><i></i>LIVE</span></div>' +
      '<div class="exam-clock' + (E.remain < 60 ? ' is-low' : '') + '" id="examClock" data-clock="exam">' + A.clock(E.remain) + '</div>' +
      '<div class="exam-clock-sub">剩余时间 · 共 ' + A.clock(s.dur) + '</div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>已作答</span><span class="ctrl-val">' + answered + '/' + s.items.length + '</span></div>' +
      '<div class="bar" style="--hue:var(--indigo)"><i style="width:' + (answered / s.items.length * 100) + '%"></i></div></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>答题卡</span><span class="ctrl-val">第 ' + (s.idx + 1) + ' 题</span></div>' +
      '<div class="sheet" id="xSheet">' + s.items.map(function (it, i) {
        var done = it.a != null && it.a !== '' && !(Array.isArray(it.a) && !it.a.length);
        var cls = i === s.idx ? 'is-cur' : done ? 'is-done' : '';
        if (it.mark) cls += ' is-mark';
        var stateText = done ? '已作答' : '未作答';
        if (it.mark) stateText += '，已标记';
        return '<button type="button" class="' + cls + '" data-go="' + i + '" aria-label="第' + (i + 1) + '题，' + stateText + '">' + (i + 1) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>正文字号</span><span class="ctrl-val">' + settings().font + 'px</span></div>' +
      '<input type="range" id="xFont" min="14" max="24" step="1" value="' + settings().font + '"></div>' +
      '<div class="ctrl"><label class="switch"><span>标记本题待检查</span><input type="checkbox" id="xMark"' + (s.items[s.idx].mark ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="ctrl"><div class="ctrl-label"><span>及格线</span><span class="ctrl-val">' + s.pass + ' 分</span></div>' +
      '<input type="range" id="xPass" min="50" max="95" step="5" value="' + s.pass + '"></div>' +
      '<div class="rail-actions">' +
      '<button class="btn btn--sm" type="button" id="xPrev"' + (s.idx === 0 ? ' disabled' : '') + '>上一题</button>' +
      '<button class="btn btn--sm" type="button" id="xNext"' + (s.idx >= s.items.length - 1 ? ' disabled' : '') + '>下一题</button>' +
      '<button class="btn btn--sm btn--primary btn--wide" type="button" id="xSubmit">交卷判分</button>' +
      '<button class="btn btn--sm btn--danger btn--wide" type="button" id="xQuit">放弃本场</button>' +
      '</div>';
    host.querySelector('#xSheet').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      s.idx = Number(b.getAttribute('data-go')); saveExam(); paintExamRail(); paintExamQuestion();
    });
    host.querySelector('#xFont').addEventListener('input', function () {
      settings().font = Number(this.value);
      document.documentElement.style.setProperty('--read-size', settings().font + 'px');
      this.previousElementSibling.querySelector('.ctrl-val').textContent = settings().font + 'px';
      A.save();
    });
    host.querySelector('#xMark').addEventListener('change', function () {
      s.items[s.idx].mark = this.checked; saveExam(); paintExamRail();
    });
    host.querySelector('#xPass').addEventListener('input', function () {
      s.pass = Number(this.value);
      this.previousElementSibling.querySelector('.ctrl-val').textContent = s.pass + ' 分';
      queueExamSave();
    });
    host.querySelector('#xPrev').addEventListener('click', function () { examGo(-1); });
    host.querySelector('#xNext').addEventListener('click', function () { examGo(1); });
    host.querySelector('#xSubmit').addEventListener('click', function () { submitExam(false); });
    host.querySelector('#xQuit').addEventListener('click', function () {
      A.drawer('放弃本场考试', '<p>放弃后本场作答不会计入成绩记录。确定要放弃吗？</p>' +
        '<div class="q-actions"><button class="btn btn--danger" id="qYes" type="button">放弃</button>' +
        '<button class="btn btn--ghost" id="qNo" type="button">继续考试</button></div>', function (h) {
        h.querySelector('#qNo').addEventListener('click', A.closeDrawer);
        h.querySelector('#qYes').addEventListener('click', function () {
          A.closeDrawer(); E.active = null; E.phase = 'config'; E.remain = 0;
          saveExam(); paintExamConfig(); A.toast('已放弃本场考试');
        });
      });
    });
  }

  function paintExamQuestion() {
    var host = document.getElementById('xMain');
    if (!host || !E.active) return;
    var s = E.active, it = s.items[s.idx];
    var e = A.QMAP.get(it.key), q = e.q, ch = e.ch;
    var order = s.optOrder[it.key] || (q.opts ? q.opts.map(function (_, i) { return i; }) : []);
    var body;
    if (q.type === 'blank') {
      body = '<div class="blank-row"><input class="blank-input" id="xBlank" type="text" value="' + esc(it.a == null ? '' : it.a) + '" placeholder="输入答案"></div>';
    } else {
      body = '<div class="opts" id="xOpts">' + order.map(function (oi, pos) {
        var L = A.LETTERS[oi];
        var on = q.type === 'multi' ? (Array.isArray(it.a) && it.a.indexOf(L) >= 0) : it.a === L;
        return '<button class="opt' + (on ? ' is-picked' : '') + '" type="button" data-l="' + L + '">' +
          '<span class="opt-key">' + A.LETTERS[pos] + '</span><span>' + esc(q.opts[oi]) + '</span></button>';
      }).join('') + '</div>';
    }
    host.innerHTML = '<article class="q-card" style="--hue:' + ch.hue + '">' +
      '<div class="q-head"><span class="q-no">' + String(s.idx + 1).padStart(2, '0') + '</span>' +
      '<span class="pill pill--hue">第' + ch.id + '章 ' + esc(ch.title) + '</span>' +
      '<span class="pill">' + V.typeName(q.type) + '</span>' +
      '<span class="pill">' + A.fmtScore(A.scoreOf(q, ch)) + ' 分</span>' +
      (it.mark ? '<span class="pill pill--warn">已标记</span>' : '') + '</div>' +
      '<p class="q-stem" data-annotate data-ch="' + ch.id + '">' + esc(q.stem) + '</p>' +
      (q.figure ? '<div class="q-figure prose" data-annotate data-ch="' + ch.id + '">' + q.figure + '</div>' : '') + body +
      '<div class="q-actions"><button class="btn btn--sm" type="button" id="xPrev2"' + (s.idx === 0 ? ' disabled' : '') + '>上一题</button>' +
      '<button class="btn btn--sm btn--primary" type="button" id="xNext2"' + (s.idx >= s.items.length - 1 ? ' disabled' : '') + '>下一题</button>' +
      '<button class="btn btn--sm btn--ghost" type="button" id="xSkip">跳过</button>' +
      '<span class="q-progress">' + (s.idx + 1) + ' / ' + s.items.length + '</span></div></article>';
    A.mathify(host);
    if (window.Terms) window.Terms.annotate(host);
    var opts = host.querySelector('#xOpts');
    if (opts) opts.addEventListener('click', function (ev) {
      var b = ev.target.closest('.opt'); if (!b) return;
      var L = b.getAttribute('data-l');
      if (q.type === 'multi') {
        var cur = Array.isArray(it.a) ? it.a.slice() : [];
        var i = cur.indexOf(L);
        if (i >= 0) cur.splice(i, 1); else cur.push(L);
        it.a = cur;
      } else {
        it.a = L;
      }
      saveExam(); paintExamRail(); paintExamQuestion();
    });
    var bl = host.querySelector('#xBlank');
    if (bl) {
      bl.addEventListener('input', function () { it.a = this.value; queueExamSave(); paintExamRail(); });
      bl.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); examGo(1); } });
      bl.focus();
    }
    host.querySelector('#xPrev2').addEventListener('click', function () { examGo(-1); });
    host.querySelector('#xNext2').addEventListener('click', function () { examGo(1); });
    host.querySelector('#xSkip').addEventListener('click', function () { examGo(1); });
    if (window.FX) window.FX.afterRender(host);
  }

  function examGo(d) {
    var s = E.active;
    var n = s.idx + d;
    if (n < 0 || n >= s.items.length) return;
    s.idx = n; saveExam(); paintExamRail(); paintExamQuestion();
  }

  function submitExam(auto) {
    var s = E.active;
    if (!s) return;
    var unanswered = s.items.filter(function (i) { return i.a == null || i.a === '' || (Array.isArray(i.a) && !i.a.length); }).length;
    if (!auto && unanswered) {
      A.drawer('还有 ' + unanswered + ' 题未作答', '<p>未作答的题目按零分计。可以回去补答，也可以直接交卷。</p>' +
        '<div class="q-actions"><button class="btn btn--primary" id="sBack" type="button">回去补答</button>' +
        '<button class="btn btn--danger" id="sNow" type="button">直接交卷</button></div>', function (h) {
        h.querySelector('#sBack').addEventListener('click', function () {
          var i = s.items.findIndex(function (x) { return x.a == null || x.a === '' || (Array.isArray(x.a) && !x.a.length); });
          s.idx = i < 0 ? s.idx : i;
          A.closeDrawer(); paintExamRail(); paintExamQuestion();
        });
        h.querySelector('#sNow').addEventListener('click', function () { A.closeDrawer(); submitExam(true); });
      });
      return;
    }
    var got = 0, full = 0, right = 0;
    var detail = s.items.map(function (it) {
      var e = A.QMAP.get(it.key);
      var pts = A.scoreOf(e.q, e.ch);
      var answered = it.a != null && it.a !== '' && (!Array.isArray(it.a) || it.a.length);
      var ok = answered && A.judge(e.q, it.a);
      full += pts;
      if (ok) { got += pts; right++; }
      else if (answered) {
        var w = A.state.wrong[it.key];
        A.state.wrong[it.key] = { times: (w ? w.times : 0) + 1, last: Date.now() };
      }
      if (answered) {
        var prev = A.state.records[it.key];
        A.state.records[it.key] = { a: it.a, ok: ok, at: Date.now(), tries: (prev ? prev.tries : 0) + 1 };
      }
      return { k: it.key, a: it.a, ok: ok, pts: pts };
    });
    var pct = full ? Math.round(got / full * 1000) / 10 : 0;
    var rec = {
      id: s.id, at: s.at, scope: s.scope, dur: s.dur, used: s.dur - E.remain,
      got: got, full: full, pct: pct, pass: s.pass, review: s.review, items: detail
    };
    A.state.exams.push(rec);
    E.result = rec;
    E.active = null;
    E.phase = 'result';
    saveExam();
    V.syncBadge();
    paintResult();
    A.toast(auto ? '时间到，已自动交卷' : '已交卷，得分 ' + A.fmtScore(got) + ' / ' + A.fmtScore(full));
  }

  function paintResult() {
    var r = E.result;
    var pass = r.pct >= r.pass;
    var right = r.items.filter(function (i) { return i.ok; }).length;
    var shown = r.review === false ? r.items.filter(function (i) { return !i.ok; }) : r.items;
    var review = shown.map(function (it) {
      var i = r.items.indexOf(it);
      var e = A.QMAP.get(it.k);
      var q = e.q, ch = e.ch;
      return '<div class="review-item ' + (it.ok ? 'is-right' : 'is-wrong') + '" style="--hue:' + ch.hue + '">' +
        '<div class="q-head"><span class="q-no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="pill pill--hue">第' + ch.id + '章 第' + q.n + '题</span>' +
        '<span class="pill ' + (it.ok ? 'pill--ok' : 'pill--danger') + '">' + (it.ok ? '+' + A.fmtScore(it.pts) : '0') + ' 分</span>' +
        '<span class="pill">你的答案 ' + esc(A.answerText(q, it.a)) + '</span>' +
        '<span class="pill">正确答案 ' + esc(A.correctText(q)) + '</span></div>' +
        '<p class="q-stem" style="font-size:1rem" data-annotate data-ch="' + ch.id + '">' + esc(q.stem) + '</p>' +
        (it.ok ? '' : '<div class="verdict verdict--no"><div class="verdict-body" data-annotate data-ch="' + ch.id + '">' + q.why + '</div>' +
          '<div class="verdict-meta"><span class="pill pill--hue">' + esc(q.point || '') + '</span></div></div>') +
        '<div class="q-actions"><a class="btn btn--sm" href="#/practice?keys=' + it.k + '">重练</a>' +
        '<a class="btn btn--sm btn--ghost" href="#/chapter/' + ch.id + '">讲义</a></div></div>';
    }).join('');

    var html = '<div class="shell page"><div class="result-hero rv" style="--hue:' + (pass ? '#16c784' : '#ff3b5c') + '">' +
      '<div class="page-kicker">RESULT</div>' +
      '<div class="score-big ' + (pass ? 'pass' : 'fail') + '">' + r.pct + '</div>' +
      '<div class="score-sub">百分制得分 · 原始分 ' + A.fmtScore(r.got) + ' / ' + A.fmtScore(r.full) + ' · 及格线 ' + r.pass + ' 分 · ' + (pass ? '通过' : '未通过') + '</div>' +
      '<div class="result-stats">' +
      '<div><b>' + right + '</b><span>答对题数</span></div>' +
      '<div><b>' + (r.items.length - right) + '</b><span>答错题数</span></div>' +
      '<div><b>' + A.clock(r.used) + '</b><span>本场用时</span></div>' +
      '<div><b>' + r.items.length + '</b><span>总题量</span></div></div>' +
      '<div class="q-actions" style="justify-content:center;margin-top:1.2rem">' +
      '<button class="btn btn--primary" type="button" id="rAgain">再考一场</button>' +
      '<a class="btn" href="#/wrong">去错题本</a>' +
      '<button class="btn" type="button" id="rExport">导出成绩单</button>' +
      '<button class="btn btn--ghost" type="button" id="rBack">返回考试设置</button></div></div>' +
      '<div class="sec-head rv"><div><h2>逐题回顾</h2><p>' + (r.review === false ? '只列出答错的题，它们已自动收进错题本' : '答错的题已自动收进错题本') + '</p></div></div>' +
      (review || '<div class="empty"><h3>全部答对</h3><p>这一场没有错题，换个章节范围或提高及格线再练一场。</p></div>') + '</div>';
    A.render(html);
    document.getElementById('rAgain').addEventListener('click', function () {
      E.seed = Math.floor(Math.random() * 1e6) + 1; E.phase = 'config'; E.result = null; startExam();
    });
    document.getElementById('rBack').addEventListener('click', function () {
      E.phase = 'config'; E.result = null; paintExamConfig();
    });
    document.getElementById('rExport').addEventListener('click', function () {
      var text = '# 模拟考试成绩单\n\n时间：' + A.dateText(r.at) + '\n范围：第 ' + r.scope.join('、') + ' 章\n' +
        '得分：' + A.fmtScore(r.got) + ' / ' + A.fmtScore(r.full) + '（百分制 ' + r.pct + '）\n用时：' + A.clock(r.used) + '\n\n' +
        r.items.map(function (it, i) {
          var e = A.QMAP.get(it.k);
          return (i + 1) + '. 第' + e.ch.id + '章第' + e.q.n + '题　' + (it.ok ? '正确' : '错误') +
            '　你的答案：' + A.answerText(e.q, it.a) + '　正确答案：' + A.correctText(e.q);
        }).join('\n');
      A.download('模拟考试成绩单.md', text, 'text/markdown');
      A.toast('成绩单已导出');
    });
  }

  function historyDrawer(h) {
    var rows = h.items.map(function (it, i) {
      var e = A.QMAP.get(it.k);
      return '<tr><td class="num">' + (i + 1) + '</td><td>第' + e.ch.id + '章 第' + e.q.n + '题</td>' +
        '<td>' + esc(A.answerText(e.q, it.a)) + '</td><td class="k">' + esc(A.correctText(e.q)) + '</td>' +
        '<td class="' + (it.ok ? 'good' : 'bad') + '">' + (it.ok ? '正确' : '错误') + '</td></tr>';
    }).join('');
    A.drawer('成绩详情 · ' + A.dateText(h.at),
      '<div class="ch-meta"><span class="pill pill--hue">百分制 ' + h.pct + '</span>' +
      '<span class="pill">' + A.fmtScore(h.got) + ' / ' + A.fmtScore(h.full) + ' 分</span>' +
      '<span class="pill">用时 ' + A.clock(h.used) + '</span><span class="pill">' + h.items.length + ' 题</span></div>' +
      '<div class="tbl"><table class="key-table"><thead><tr><th>序</th><th>题目</th><th>你的答案</th><th>正确答案</th><th>结果</th></tr></thead><tbody>' + rows + '</tbody></table></div>');
  }

  /* ================= 计时 ================= */
  window.setInterval(function () {
    var pc = document.querySelector('[data-clock="practice"]');
    if (pc && P.mounted) {
      P.elapsed++;
      if (settings().showTimer) pc.textContent = A.clock(P.elapsed);
      if (P.elapsed % 10 === 0) saveSession();
    }
    var ec = document.getElementById('examClock');
    if (ec && E.active && E.phase === 'running') {
      E.remain--;
      ec.textContent = A.clock(E.remain);
      ec.classList.toggle('is-low', E.remain < 60);
      if (E.remain % 10 === 0) saveExam();
      if (E.remain <= 0) submitExam(true);
    }
  }, 1000);

  document.addEventListener('keydown', function (e) {
    if (A.current().parts[0] === 'practice') keyHandler(e);
    else if (A.current().parts[0] === 'exam' && E.phase === 'running' && E.active) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (document.getElementById('drawer').classList.contains('is-on')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); examGo(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); examGo(1); }
      else {
        var s = E.active, it = s.items[s.idx], en = A.QMAP.get(it.key);
        if (en.q.type === 'blank') return;
        var order = s.optOrder[it.key] || en.q.opts.map(function (_, i) { return i; });
        var pos = -1;
        if (/^[1-8]$/.test(e.key)) pos = Number(e.key) - 1;
        else if (/^[a-hA-H]$/.test(e.key)) pos = A.LETTERS.indexOf(e.key.toUpperCase());
        if (pos >= 0 && pos < order.length) {
          e.preventDefault();
          var L = A.LETTERS[order[pos]];
          if (en.q.type === 'multi') {
            var cur = Array.isArray(it.a) ? it.a.slice() : [];
            var i = cur.indexOf(L);
            if (i >= 0) cur.splice(i, 1); else cur.push(L);
            it.a = cur;
          } else it.a = L;
          paintExamRail(); paintExamQuestion();
        }
      }
    }
  });

  window.addEventListener('hashchange', function () {
    var parts = window.location.hash.replace(/^#/, '').split('?')[0].split('/').filter(Boolean);
    var route = parts[0] || 'home';
    if (P.mounted && route !== 'practice') saveSession();
    P.mounted = route === 'practice';
    if (E.phase === 'running' && E.active && route !== 'exam') saveExam();
  });

  window.addEventListener('pagehide', function () {
    if (P.mounted) saveSession();
    if (E.phase === 'running' && E.active) saveExam();
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) return;
    if (P.mounted) saveSession();
    if (E.phase === 'running' && E.active) saveExam();
  });

  window.Quiz = { practice: practice, exam: exam };

  A.addRoute('/practice', practice);
  A.addRoute('/exam', exam);
})();