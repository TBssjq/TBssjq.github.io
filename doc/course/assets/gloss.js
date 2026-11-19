/* 术语注释：为讲义中的专有名词加放大镜与释义卡片 */
(function () {
  'use strict';

  var STUDY = window.STUDY || {};
  var nameMap = Object.create(null);
  var seenName = Object.create(null);
  var names = [];

  function addEntry(entry) {
    if (!entry || !entry.term || !entry.def) return;
    var item = {
      term: entry.term,
      full: entry.full || '',
      def: entry.def,
      ch: entry.ch || 0,
      alias: entry.alias || []
    };
    [item.term].concat(item.alias).forEach(function (name) {
      var text = String(name == null ? '' : name).trim();
      if (!text) return;
      var key = text.toLowerCase();
      if (!nameMap[key]) nameMap[key] = [];
      if (nameMap[key].indexOf(item) < 0) nameMap[key].push(item);
      if (!seenName[key]) {
        seenName[key] = 1;
        names.push(text);
      }
    });
  }

  (STUDY.glossary || []).forEach(addEntry);
  (STUDY.terms || []).forEach(addEntry);

  names.sort(function (a, b) { return b.length - a.length; });

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var MATCH = names.length ? new RegExp(names.map(escapeRegExp).join('|'), 'gi') : null;

  function isAsciiWord(ch) {
    return /[A-Za-z0-9_]/.test(ch);
  }

  function boundaryOk(text, index, length) {
    var before = index > 0 ? text.charAt(index - 1) : '';
    var after = index + length < text.length ? text.charAt(index + length) : '';
    if (isAsciiWord(text.charAt(index)) && isAsciiWord(before)) return false;
    if (isAsciiWord(text.charAt(index + length - 1)) && isAsciiWord(after)) return false;
    return true;
  }

  var LENS_NS = 'http://www.w3.org/2000/svg';

  function lensSvg() {
    var svg = document.createElementNS(LENS_NS, 'svg');
    svg.setAttribute('class', 'term-lens');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var circle = document.createElementNS(LENS_NS, 'circle');
    circle.setAttribute('cx', '6.8');
    circle.setAttribute('cy', '6.8');
    circle.setAttribute('r', '4.5');
    var line = document.createElementNS(LENS_NS, 'path');
    line.setAttribute('d', 'M10.2 10.2 L14 14');
    svg.appendChild(circle);
    svg.appendChild(line);
    return svg;
  }

  function makeTerm(matched, entry) {
    var span = document.createElement('span');
    span.className = 'term';
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', entry.term + '，查看注释');
    span.setAttribute('aria-expanded', 'false');
    span.setAttribute('aria-controls', 'termPop');
    span.setAttribute('data-text', matched);
    span.entry = entry;
    span.appendChild(document.createTextNode(matched));
    span.appendChild(lensSvg());
    return span;
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    return !!parent.closest('script, style, code, pre, kbd, samp, textarea, input, select, option, a, button, .term, .katex, .katex-display, .fig-tag, .kicker, .card-k, .ch-glyph, .tl-year');
  }

  function pageChapter() {
    if (!window.App || !window.App.current) return 0;
    var current = window.App.current();
    if (!current || !current.parts || current.parts[0] !== 'chapter') return 0;
    return Number(current.parts[1]) || 0;
  }

  function chooseEntry(key, chapter) {
    var list = nameMap[key];
    if (!list || !list.length) return null;
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].ch === chapter) return list[i];
    }
    return list[list.length - 1];
  }

  function hostChapter(host) {
    var value = host.getAttribute('data-ch');
    if (value) return Number(value) || 0;
    return pageChapter();
  }

  function splitText(node, seen, chapter) {
    var text = node.nodeValue;
    var frag = null;
    var last = 0;
    var changed = false;
    var match;

    MATCH.lastIndex = 0;
    while ((match = MATCH.exec(text)) !== null) {
      var matched = match[0];
      if (!boundaryOk(text, match.index, matched.length)) continue;
      var entry = chooseEntry(matched.toLowerCase(), chapter);
      if (!entry) continue;
      var key = entry.term.toLowerCase() + '|' + entry.ch;
      if (seen[key]) continue;
      seen[key] = 1;
      if (!frag) frag = document.createDocumentFragment();
      if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      frag.appendChild(makeTerm(matched, entry));
      last = match.index + matched.length;
      changed = true;
    }

    if (!changed) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function annotateHost(host, seen, chapter) {
    if (host.getAttribute('data-terms-done') === '1') return;
    host.setAttribute('data-terms-done', '1');
    var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      if (shouldSkip(node)) continue;
      nodes.push(node);
    }
    nodes.forEach(function (node) { splitText(node, seen, chapter); });
  }

  var pop = null;
  var active = null;
  var pinned = false;
  var openTimer = 0;
  var closeTimer = 0;

  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.id = 'termPop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', '术语注释');
    document.body.appendChild(pop);
    pop.addEventListener('mouseenter', cancelClose);
    pop.addEventListener('mouseleave', function () { scheduleClose(false); });
    return pop;
  }

  function cancelClose() {
    window.clearTimeout(closeTimer);
  }

  function scheduleClose(force) {
    cancelClose();
    closeTimer = window.setTimeout(function () { hide(force); }, force ? 0 : 220);
  }

  function renderPop(entry, matched) {
    ensurePop();
    pop.textContent = '';

    var kicker = document.createElement('div');
    kicker.className = 'term-pop-kicker';
    kicker.textContent = entry.ch ? '术语注释 · 第 ' + entry.ch + ' 章' : '术语注释';

    var title = document.createElement('h4');
    title.className = 'term-pop-title';
    title.id = 'termPopTitle';
    title.textContent = entry.term;

    pop.appendChild(kicker);
    pop.appendChild(title);

    if (entry.full) {
      var full = document.createElement('div');
      full.className = 'term-pop-full';
      full.textContent = entry.full;
      pop.appendChild(full);
    }

    var def = document.createElement('p');
    def.className = 'term-pop-def';
    def.textContent = entry.def;
    pop.appendChild(def);

    if (matched && matched.toLowerCase() !== entry.term.toLowerCase()) {
      var alias = document.createElement('div');
      alias.className = 'term-pop-alias';
      alias.textContent = '文中写法：' + matched;
      pop.appendChild(alias);
    }

    pop.setAttribute('aria-labelledby', 'termPopTitle');
  }

  function place(trigger) {
    var rect = trigger.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var width = Math.min(360, vw - 24);
    pop.style.width = width + 'px';
    pop.style.left = '0px';
    pop.style.top = '0px';
    var height = pop.offsetHeight;
    var left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, vw - width - 12));
    var top = rect.bottom + 9;
    if (top + height > vh - 12) {
      var above = rect.top - height - 9;
      top = above > 12 ? above : Math.max(12, vh - height - 12);
    }
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';
  }

  function show(trigger, pin) {
    var entry = trigger.entry;
    if (!entry) return;
    window.clearTimeout(openTimer);
    cancelClose();
    ensurePop();
    if (active && active !== trigger) {
      active.classList.remove('is-open');
      active.setAttribute('aria-expanded', 'false');
    }
    active = trigger;
    pinned = !!pin;
    renderPop(entry, trigger.getAttribute('data-text'));
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    pop.classList.add('is-on');
    place(trigger);
  }

  function hide(force) {
    window.clearTimeout(openTimer);
    cancelClose();
    if (!active) return;
    if (pinned && !force) return;
    active.classList.remove('is-open');
    active.setAttribute('aria-expanded', 'false');
    active = null;
    pinned = false;
    if (pop) pop.classList.remove('is-on');
  }

  function openFromHover(trigger) {
    window.clearTimeout(openTimer);
    openTimer = window.setTimeout(function () { show(trigger, false); }, 110);
  }

  document.addEventListener('mouseover', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (!trigger || trigger.contains(event.relatedTarget)) return;
    cancelClose();
    openFromHover(trigger);
  });

  document.addEventListener('mouseout', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (!trigger || trigger.contains(event.relatedTarget)) return;
    if (trigger === active) scheduleClose(false);
  });

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (trigger) {
      var selection = window.getSelection ? window.getSelection() : null;
      if (selection && !selection.isCollapsed) return;
      if (active === trigger && pinned) { hide(true); return; }
      show(trigger, true);
      return;
    }
    if (pop && pop.contains(event.target)) return;
    hide(true);
  });

  document.addEventListener('keydown', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (event.key === 'Escape' && active) { hide(true); return; }
    if (!trigger) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (active === trigger && pinned) hide(true);
      else show(trigger, true);
    }
  });

  document.addEventListener('focusin', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (!trigger) return;
    if (trigger.matches && !trigger.matches(':focus-visible')) return;
    show(trigger, true);
  });

  document.addEventListener('focusout', function (event) {
    var trigger = event.target.closest ? event.target.closest('.term') : null;
    if (!trigger) return;
    window.setTimeout(function () {
      if (pop && pop.contains(document.activeElement)) return;
      if (document.activeElement && document.activeElement.classList.contains('term')) return;
      hide(true);
    }, 0);
  });

  var scrollRaf = 0;
  function onScroll() {
    if (!active || scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(function () {
      scrollRaf = 0;
      if (!active) return;
      var rect = active.getBoundingClientRect();
      if (rect.bottom < 8 || rect.top > window.innerHeight - 8) hide(true);
      else if (pop && pop.classList.contains('is-on')) place(active);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', function () { hide(true); });

  function annotate(root) {
    if (!MATCH || !root) return;
    hide(true);
    var hosts = [];
    if (root.nodeType === 1 && root.matches('[data-annotate]')) hosts.push(root);
    if (root.querySelectorAll) {
      Array.prototype.forEach.call(root.querySelectorAll('[data-annotate]'), function (host) {
        hosts.push(host);
      });
    }
    var seen = Object.create(null);
    hosts.forEach(function (host) { annotateHost(host, seen, hostChapter(host)); });
  }

  window.Terms = {
    annotate: annotate,
    close: function () { hide(true); },
    count: names.length
  };
})();
