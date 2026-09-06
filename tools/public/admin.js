'use strict';

// 后台前端：无构建、无框架、无内联代码（服务端下发严格 CSP）。
// 所有事件都用 addEventListener 绑定，列表节点一律用 DOM API 创建（天然免疫 XSS）。

const $ = id => document.getElementById(id);

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* 隐私模式忽略 */ }
}

function safeMatchMedia(query) {
  try { return typeof matchMedia === 'function' && matchMedia(query).matches; }
  catch (e) { return false; }
}

const THEME_KEY = 'blog-admin-theme';
const DRAFT_PREFIX = 'blog-admin-draft:';
const SPLIT_KEY = 'blog-admin-split';

const els = {};
const state = {
  posts: [],
  current: null,          // { year, slug }
  dirty: false,
  tags: [],
  tagPool: [],
  currentTags: [],
  filter: { tag: '__all__', query: '' },
  session: null,
  git: null,
  lastRendered: null,
  draftKey: '',
};

/* ══════════════════════════════════════════
   工具
   ══════════════════════════════════════════ */

function debounce(fn, wait) {
  let t = null;
  return function () {
    const args = arguments;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(null, args); }, wait);
  };
}

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function nowTime() {
  const d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

/* ══════════════════════════════════════════
   日志
   ══════════════════════════════════════════ */

function log(msg, kind) {
  const box = els.log;
  const line = el('div', 'log-line' + (kind ? ' log-line--' + kind : ''));
  line.textContent = '[' + nowTime() + '] ' + msg;
  box.appendChild(line);
  animLogLine(line);
  // 只保留最近 500 行，避免长时间运行后 DOM 越来越重
  while (box.childNodes.length > 500) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

/* ══════════════════════════════════════════
   动效（GSAP，离线 / 减弱动效时自动降级）
   ══════════════════════════════════════════ */
const ANIM_ON = typeof gsap !== 'undefined';
if (ANIM_ON && window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
if (ANIM_ON && window.Flip) gsap.registerPlugin(Flip);
if (ANIM_ON && window.SplitText) gsap.registerPlugin(SplitText);
const REDUCED = ANIM_ON && safeMatchMedia('(prefers-reduced-motion: reduce)');
if (ANIM_ON) gsap.defaults({ ease: 'power3.out', duration: 0.5 });

function animAppIn() {
  if (!ANIM_ON || REDUCED) return;
  const tl = gsap.timeline({
    defaults: { duration: 0.5, ease: 'power3.out' },
    onComplete: function () {
      gsap.set(['.topbar', '.sidebar', '.editor-pane', '.dock'], { clearProps: 'transform,opacity' });
    },
  });
  tl.fromTo('.topbar', { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, clearProps: 'transform,opacity', duration: 0.5, ease: 'power3.out' }, 0)
    .fromTo('.sidebar', { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, clearProps: 'transform,opacity', duration: 0.5, ease: 'power3.out' }, 0.05)
    .fromTo('.editor-pane', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, clearProps: 'transform,opacity', duration: 0.5, ease: 'power3.out' }, 0.12)
    .fromTo('.dock', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, clearProps: 'transform,opacity', duration: 0.5, ease: 'power3.out' }, 0.16);
}

function animListIn() {
  if (!ANIM_ON || REDUCED) return;
  const items = els.postList.querySelectorAll('.post-item');
  if (items.length) gsap.from(items, { x: -14, autoAlpha: 0, stagger: 0.04, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
}

function animEditorIn() {
  if (!ANIM_ON || REDUCED) return;
  gsap.fromTo(els.editorForm, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
}

function animLogLine(line) {
  if (!ANIM_ON || REDUCED) return;
  gsap.from(line, { autoAlpha: 0, x: -10, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
}

/* ══════════════════════════════════════════
   请求
   ══════════════════════════════════════════ */

async function api(path, options) {
  const res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
  let data = null;
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    try { data = await res.json(); } catch (e) { data = null; }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || ('请求失败（' + res.status + '）'));
    err.status = res.status;
    err.detail = data && data.detail ? data.detail : '';
    throw err;
  }
  return data;
}

function apiJson(path, method, body, signal) {
  return api(path, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal,
  });
}

/* ══════════════════════════════════════════
   主题
   ══════════════════════════════════════════ */

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  safeStorageSet(THEME_KEY, theme);
}

/* ══════════════════════════════════════════
   视图切换
   ══════════════════════════════════════════ */

function showApp() {
  els.appView.hidden = false;
  animAppIn();
}



/* ══════════════════════════════════════════
   侧栏：分类筛选 + 搜索 + 文章列表
   ══════════════════════════════════════════ */

function renderTagFilter() {
  const box = els.tagFilter;
  if (!box) return;
  box.textContent = '';

  const makeChip = function (value, label, count) {
    const chip = el('button', 'chip');
    chip.type = 'button';
    chip.dataset.tag = value;
    chip.appendChild(el('span', null, label));
    chip.appendChild(el('span', 'chip__count', count));
    if (state.filter.tag === value) chip.classList.add('is-active');
    chip.addEventListener('click', function () {
      state.filter.tag = value;
      renderTagFilter();
      renderList();
    });
    return chip;
  };

  box.appendChild(makeChip('__all__', '全部', state.posts.length));
  state.tags.forEach(function (t) {
    box.appendChild(makeChip(t.name, t.name, t.count));
  });
}

// 把一行输入切成一个个标签（按逗号 / 顿号 / 分号），保留空格（标签名可含空格）
function splitTagInput(s) {
  return String(s || '').split(/[,，、;；]+/).map(function (t) { return t.trim(); })
    .filter(function (t) { return t && t.length <= 40; });
}

// 当前文章的标签 chips
function renderTagChips() {
  const box = els.tagChips;
  if (!box) return;
  box.textContent = '';
  state.currentTags.forEach(function (t, i) {
    const chip = el('span', 'tag-chip');
    chip.appendChild(document.createTextNode(t));
    const x = el('button', 'tag-chip__remove', '×');
    x.type = 'button';
    x.title = '移除标签';
    x.addEventListener('click', function () {
      state.currentTags.splice(i, 1);
      renderTagChips();
      setDirty(true);
    });
    chip.appendChild(x);
    box.appendChild(chip);
  });
}

function addTagToPost(raw) {
  const list = splitTagInput(raw);
  let added = false;
  list.forEach(function (t) {
    if (state.currentTags.indexOf(t) === -1) { state.currentTags.push(t); added = true; }
  });
  if (added) { renderTagChips(); setDirty(true); }
}

// 标签管理面板
function renderTagManager() {
  const box = els.tagManagerList;
  if (!box) return;
  box.textContent = '';
  const tags = state.tags.slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  if (!tags.length) {
    box.appendChild(el('div', 'tag-manager__empty', '还没有标签'));
    return;
  }
  tags.forEach(function (t) {
    const item = el('span', 'tag-manager__item');
    item.appendChild(el('span', null, t.name + (t.count ? ' (' + t.count + ')' : '')));
    const del = el('button', 'tag-manager__del', '×');
    del.type = 'button';
    del.title = '删除标签（同时从其所有文章中移除）';
    del.addEventListener('click', function () { deleteTagGlobal(t.name); });
    item.appendChild(del);
    box.appendChild(item);
  });
}

async function addTagGlobal(name) {
  try {
    await apiJson('/api/tags', 'POST', { name: name });
    log('已添加标签：' + name, 'ok');
    await loadTags();
  } catch (e) {
    log('添加标签失败: ' + e.message, 'err');
  }
}

async function deleteTagGlobal(name) {
  if (!confirm('确定删除标签「' + name + '」？\n该标签会从所有文章中一并移除，且不可撤销。')) return;
  try {
    await apiJson('/api/tags', 'DELETE', { name: name });
    log('已删除标签：' + name, 'ok');
    await Promise.all([loadPosts(), loadTags()]);
  } catch (e) {
    log('删除标签失败: ' + e.message, 'err');
  }
}

function matchesFilter(p) {
  if (state.filter.tag !== '__all__' && (p.tags || []).indexOf(state.filter.tag) === -1) return false;
  const q = state.filter.query.trim().toLowerCase();
  if (!q) return true;
  return (p.title + ' ' + p.slug + ' ' + (p.tags || []).join(' ') + ' ' + p.excerpt)
    .toLowerCase().indexOf(q) !== -1;
}

function renderList() {
  const list = els.postList;
  list.textContent = '';

  const shown = state.posts.filter(matchesFilter);
  els.postCount.textContent = String(shown.length);

  if (!shown.length) {
    list.appendChild(el('div', 'list-empty', state.posts.length ? '没有匹配的文章' : '还没有文章，点顶部「新建」'));
    return;
  }

  const groups = new Map();
  shown.forEach(function (p) {
    if (!groups.has(p.year)) groups.set(p.year, []);
    groups.get(p.year).push(p);
  });

  groups.forEach(function (items, year) {
    list.appendChild(el('div', 'post-group', year + ' 年'));

    items.forEach(function (p) {
      const btn = el('button', 'post-item');
      btn.type = 'button';
      if (state.current && state.current.year === p.year && state.current.slug === p.slug) {
        btn.classList.add('is-active');
      }

      btn.appendChild(el('span', 'post-item__title', p.title));

      const meta = el('span', 'post-item__meta');
      const tags = el('span', 'post-tags');
      (p.tags || []).forEach(function (t) {
        tags.appendChild(el('span', 'post-tag', t));
      });
      meta.appendChild(tags);
      meta.appendChild(el('span', null, p.date));
      btn.appendChild(meta);

      btn.addEventListener('click', function () {
        if (state.dirty && !confirm('当前文章未保存，确定离开？')) return;
        openPost(p.year, p.slug);
      });

      list.appendChild(btn);
    });
  });

  animListIn();
}

async function loadPosts() {
  const data = await api('/api/posts');
  state.posts = (data.posts || []).map(normalizePost);
  renderTagFilter();
  renderList();
}

async function loadTags() {
  try {
    const data = await api('/api/tags');
    const used = data.tags || [];          // [{name, count}]
    const pool = data.pool || [];          // [name]
    const map = new Map();
    used.forEach(function (t) { map.set(t.name, t.count); });
    pool.forEach(function (n) { if (!map.has(n)) map.set(n, 0); });
    state.tags = Array.from(map.keys()).map(function (n) {
      return { name: n, count: map.get(n) };
    }).sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return a.name < b.name ? -1 : 1;
    });
    state.tagPool = pool;
  } catch (e) { /* 标签读取失败不阻塞主流程 */ }

  const tagList = $('tagList');
  if (tagList) {
    tagList.textContent = '';
    state.tagPool.forEach(function (t) {
      const opt = document.createElement('option');
      opt.value = t;
      tagList.appendChild(opt);
    });
  }
  renderTagFilter();
  renderTagManager();
}

function normalizePost(p) {
  p.tags = Array.isArray(p.tags) ? p.tags : [];
  return p;
}

/* ══════════════════════════════════════════
   编辑器
   ══════════════════════════════════════════ */

function fillForm(post) {
  els.postLoc.textContent = (post.year && post.slug)
    ? 'posts/' + post.year + '/' + post.slug + '.md'
    : '（新建，尚未保存）';
  els.fTitle.value = post.title || '';
  els.fDate.value = post.date || '';
  els.fSlug.value = post.slug || '';
  els.fDateTag.value = post.dateTag || '';
  state.currentTags = Array.isArray(post.tags) ? post.tags : [];
  renderTagChips();
  els.fExcerpt.value = post.excerpt || '';
  els.fBody.value = post.body || '';
  setDirty(false);
  updateStats();
}

function setDirty(v) {
  state.dirty = v;
  els.btnSave.textContent = v ? '保存 ●' : '保存';
  els.saveDot.classList.toggle('is-dirty', v);
}

function collectForm() {
  return {
    title: els.fTitle.value.trim(),
    date: els.fDate.value.trim(),
    slug: els.fSlug.value.trim(),
    dateTag: els.fDateTag.value.trim(),
    tags: state.currentTags,
    excerpt: els.fExcerpt.value.trim(),
    body: els.fBody.value,
  };
}

async function openPost(year, slug) {
  try {
    const data = await api('/api/posts/' + encodeURIComponent(year) + '/' + encodeURIComponent(slug));
    const post = data.post;

    // 切换文章前把上一份草稿立即落盘（不能用防抖版，否则会写进新文章的 key）
    if (state.current) saveDraftNow();

    state.current = { year: year, slug: slug };
    state.draftKey = DRAFT_PREFIX + year + '/' + slug;
    state.lastRendered = null;

    els.emptyState.hidden = true;
    els.editorForm.hidden = false;
    animEditorIn();
    fillForm(post);
    renderList();
    checkDraft();
    renderPreview(true);
    log('已打开 ' + year + '/' + slug + '.md');
  } catch (e) {
    log('打开失败: ' + e.message, 'err');
  }
}

function closeEditor() {
  if (state.current) clearDraft();
  state.current = null;
  state.draftKey = '';
  els.editorForm.hidden = true;
  els.emptyState.hidden = false;
  renderList();
}

/* ── 本地草稿：防浏览器崩溃 / 误关页面丢内容 ── */

function saveDraftNow() {
  if (!state.draftKey || !state.dirty) return;
  try {
    safeStorageSet(state.draftKey, JSON.stringify({
      at: Date.now(),
      data: collectForm(),
    }));
  } catch (e) { /* 超配额时静默失败 */ }
}

const saveDraft = debounce(saveDraftNow, 900);

function readDraft() {
  if (!state.draftKey) return null;
  try {
    const raw = safeStorageGet(state.draftKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearDraft() {
  if (!state.draftKey) return;
  try { localStorage.removeItem(state.draftKey); } catch (e) { /* ignore */ }
}

function checkDraft() {
  const draft = readDraft();
  if (!draft || !draft.data) { els.draftBar.hidden = true; return; }
  const same = JSON.stringify(draft.data) === JSON.stringify(collectForm());
  if (same) { clearDraft(); els.draftBar.hidden = true; return; }
  els.draftText.textContent = '发现本地草稿（' + new Date(draft.at).toLocaleString('zh-CN') + '）未保存';
  els.draftBar.hidden = false;
}

/* ══════════════════════════════════════════
   保存 / 新建 / 删除
   ══════════════════════════════════════════ */

async function savePost() {
  if (!els.fTitle.value.trim()) { log('标题不能为空', 'err'); els.fTitle.focus(); return; }
  // slug 仅在「已存在的文章」(PUT) 时必填；新建文章由服务端按日期自动生成
  if (state.current && !els.fSlug.value.trim()) { log('slug 不能为空', 'err'); els.fSlug.focus(); return; }

  els.btnSave.disabled = true;
  try {
    let data;
    if (!state.current) {
      // 新建：还没有服务器上的文章，先创建
      data = await apiJson('/api/posts', 'POST', collectForm());
    } else {
      data = await apiJson(
        '/api/posts/' + encodeURIComponent(state.current.year) + '/' + encodeURIComponent(state.current.slug),
        'PUT',
        collectForm()
      );
    }
    const moved = state.current && (data.post.year !== state.current.year || data.post.slug !== state.current.slug);
    state.current = { year: data.post.year, slug: data.post.slug };
    state.draftKey = DRAFT_PREFIX + data.post.year + '/' + data.post.slug;
    setDirty(false);
    clearDraft();
    els.draftBar.hidden = true;
    log('已保存 ' + data.post.year + '/' + data.post.slug + '.md' + (moved ? '（已移动到新位置）' : ''), 'ok');
    await Promise.all([loadPosts(), loadTags()]);
  } catch (e) {
    log('保存失败: ' + e.message, 'err');
  } finally {
    els.btnSave.disabled = false;
  }
}

async function createPost() {
  if (state.dirty && !confirm('当前文章未保存，确定新建？')) return;

  try {
    // 先打开空白编辑器，等到首次「保存」时再在服务器创建文章。
    // 这样就不会留下一篇默认名为「未命名文章」的占位文章，
    // 用户输入的标题必定被写回。
    state.current = null;
    state.draftKey = DRAFT_PREFIX + '__new__';
    state.lastRendered = null;
    els.emptyState.hidden = true;
    els.editorForm.hidden = false;
    animEditorIn();
    fillForm({
      title: '', date: todayStr(), slug: '', dateTag: '', tags: [], excerpt: '', body: '',
    });
    renderList();
    renderPreview(true);
    els.fTitle.focus();
    els.fTitle.select();
    log('已新建空白文章，填写后点保存', 'ok');
  } catch (e) {
    log('新建失败: ' + e.message, 'err');
  }
}

async function deletePost() {
  if (!state.current) return;
  const label = state.current.year + '/' + state.current.slug + '.md';
  if (!confirm('确定删除 ' + label + ' ？\n此操作会同时删除源文件与已生成页面，且不可撤销。')) return;

  try {
    // 写接口一律要求 application/json，DELETE 也带上（配合 SameSite=Strict 挡 CSRF）
    await apiJson(
      '/api/posts/' + encodeURIComponent(state.current.year) + '/' + encodeURIComponent(state.current.slug),
      'DELETE'
    );
    log('已删除 ' + label, 'ok');
    closeEditor();
    await Promise.all([loadPosts(), loadTags()]);
    if (state.git) loadGitStatus();
  } catch (e) {
    log('删除失败: ' + e.message, 'err');
  }
}

/* ══════════════════════════════════════════
   构建 / 预览
   ══════════════════════════════════════════ */

async function runBuild(silent) {
  els.btnBuild.disabled = true;
  const label = els.btnBuild.querySelector('.btn-label');
  const old = label ? label.textContent : '';
  if (label) label.textContent = '构建中';
  if (!silent) log('开始构建…');

  try {
    const data = await api('/api/build', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    (data.log || []).forEach(function (line) { log('  ' + line); });
    log('构建完成，用时 ' + data.ms + 'ms', 'ok');
    return true;
  } catch (e) {
    log('构建失败: ' + e.message, 'err');
    return false;
  } finally {
    if (label) label.textContent = old;
    els.btnBuild.disabled = false;
  }
}

// ── 实时预览：防抖 + 客户端缓存 + 过期响应丢弃 ──

const previewCache = new Map();
const PREVIEW_CACHE_MAX = 60;
let previewSeq = 0;
let previewAbort = null;
let previewTimer = null;

function cachePreview(body, html) {
  if (previewCache.size >= PREVIEW_CACHE_MAX) {
    previewCache.delete(previewCache.keys().next().value);
  }
  previewCache.set(body, html);
}

function setPreview(html) {
  const ratio = els.preview.scrollHeight > els.preview.clientHeight
    ? els.preview.scrollTop / (els.preview.scrollHeight - els.preview.clientHeight)
    : 0;
  els.preview.innerHTML = html || '<p class="preview-empty">开始写正文，这里会实时渲染</p>';
  if (ratio > 0) {
    els.preview.scrollTop = ratio * (els.preview.scrollHeight - els.preview.clientHeight);
  }
}

async function renderPreview(force) {
  if (els.panes.dataset.view === 'edit') return;
  const body = els.fBody.value;
  if (!force && body === state.lastRendered) return;

  if (previewCache.has(body)) {
    setPreview(previewCache.get(body));
    state.lastRendered = body;
    return;
  }

  const seq = ++previewSeq;
  if (previewAbort) previewAbort.abort();
  previewAbort = new AbortController();

  try {
    const data = await apiJson('/api/preview', 'POST', { body: body }, previewAbort.signal);
    if (seq !== previewSeq) return;              // 已有更新的请求发出，丢弃这次结果
    cachePreview(body, data.html || '');
    setPreview(data.html || '');
    state.lastRendered = body;
  } catch (e) {
    if (e.name === 'AbortError') return;         // 主动取消，不算错误
    log('预览渲染失败: ' + e.message, 'err');
  }
}

function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(function () { renderPreview(false); }, 220);
}

function setView(view) {
  els.panes.dataset.view = view;
  Array.prototype.forEach.call(els.viewSwitch.children, function (b) {
    b.classList.toggle('is-active', b.dataset.view === view);
  });
  if (view !== 'edit') renderPreview(true);
}

/* ── 滚动同步 ── */

let syncing = false;
function syncScroll(from) {
  if (els.panes.dataset.view !== 'split' || syncing) return;
  const a = from === 'edit' ? els.fBody : els.preview;
  const b = from === 'edit' ? els.preview : els.fBody;
  const aMax = a.scrollHeight - a.clientHeight;
  const bMax = b.scrollHeight - b.clientHeight;
  if (aMax <= 0 || bMax <= 0) return;
  syncing = true;
  b.scrollTop = (a.scrollTop / aMax) * bMax;
  requestAnimationFrame(function () { syncing = false; });
}

/* ── 字数统计 ── */

function updateStats() {
  const text = els.fBody.value;
  const cjk = (text.match(/[\u4e00-\u9fa5\u3040-\u30ff]/g) || []).length;
  const latin = (text.replace(/[\u4e00-\u9fa5\u3040-\u30ff]/g, ' ')
    .match(/[A-Za-z0-9_'-]+/g) || []).length;
  const words = cjk + latin;
  const lines = text ? text.split('\n').length : 0;

  els.statChars.textContent = text.length + ' 字';
  els.statWords.textContent = words + ' 词';
  els.statLines.textContent = lines + ' 行';
  els.statRead.textContent = '约 ' + Math.max(1, Math.round(words / 300)) + ' 分钟';
  els.statPath.textContent = state.current ? 'posts/' + state.current.year + '/' + state.current.slug + '.md' : '';
}

/* ══════════════════════════════════════════
   Markdown 工具栏
   ══════════════════════════════════════════ */

function replaceRange(start, end, text, selStart, selEnd) {
  const ta = els.fBody;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  ta.focus();
  ta.selectionStart = selStart === undefined ? start + text.length : selStart;
  ta.selectionEnd = selEnd === undefined ? ta.selectionStart : selEnd;
  setDirty(true);
  saveDraft();
  updateStats();
  schedulePreview();
}

// 包裹型：**加粗** / *斜体* / `代码`
function wrapSelection(before, after, placeholder) {
  const ta = els.fBody;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.slice(start, end);
  const value = ta.value;

  // 光标没选内容、且左右已经是被包裹的标记 → 取消包裹
  if (!selected &&
      value.slice(start - before.length, start) === before &&
      value.slice(end, end + after.length) === after) {
    const inner = value.slice(start, end);
    replaceRange(start - before.length, end + after.length, inner,
      start - before.length, start - before.length + inner.length);
    return;
  }

  const sel = selected || placeholder || '';
  replaceRange(start, end, before + sel + after, start + before.length, start + before.length + sel.length);
}

// 行首型：> 引用 / - 列表 / ## 标题
function prefixLines(prefix, placeholder) {
  const ta = els.fBody;
  const value = ta.value;
  let start = ta.selectionStart;
  let end = ta.selectionEnd;

  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  let lineEnd = value.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = value.length;

  let block = value.slice(lineStart, lineEnd);
  if (!block && placeholder) block = placeholder;

  const lines = block.split('\n');
  const allOn = lines.every(function (l) { return l.indexOf(prefix) === 0; });
  const next = lines.map(function (l) {
    return allOn ? l.slice(prefix.length) : prefix + l;
  }).join('\n');

  replaceRange(lineStart, lineEnd, next, lineStart, lineStart + next.length);
}

function prefixOrdered() {
  const ta = els.fBody;
  const value = ta.value;
  let start = ta.selectionStart;
  let end = ta.selectionEnd;

  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  let lineEnd = value.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = value.length;

  let block = value.slice(lineStart, lineEnd);
  if (!block) block = '列表项';

  const lines = block.split('\n');
  const allOn = lines.every(function (l) { return /^\d+\.\s/.test(l); });
  const next = lines
    .map(function (l, i) { return allOn ? l.replace(/^\d+\.\s/, '') : (i + 1) + '. ' + l; })
    .join('\n');

  replaceRange(lineStart, lineEnd, next, lineStart, lineStart + next.length);
}

function insertBlock(text, placeholderLine) {
  const ta = els.fBody;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const sel = ta.value.slice(start, end) || placeholderLine || '';
  const value = ta.value;
  const needBefore = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
  const needAfter = value[end] === undefined || value[end] === '\n' ? '\n' : '\n\n';
  replaceRange(start, end, needBefore + text + sel + needAfter);
}

const MD_ACTIONS = {
  bold: function () { wrapSelection('**', '**', '加粗'); },
  italic: function () { wrapSelection('*', '*', '斜体'); },
  inlinecode: function () { wrapSelection('`', '`', 'code'); },
  h2: function () { prefixLines('## ', '标题'); },
  h3: function () { prefixLines('### ', '小标题'); },
  quote: function () { prefixLines('> ', '引用'); },
  ul: function () { prefixLines('- ', '列表项'); },
  ol: prefixOrdered,
  task: function () { prefixLines('- [ ] ', '待办'); },
  code: function () { insertBlock('```\n', '代码'); },
  hr: function () { insertBlock('\n---\n'); },
  link: function () {
    const ta = els.fBody;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value.slice(start, end) || '链接文字';
    replaceRange(start, end, '[' + text + '](https://)', start + 1, start + 1 + text.length);
  },
  table: function () {
    insertBlock([
      '| 列 A | 列 B |',
      '| --- | --- |',
      '| 内容 | 内容 |',
    ].join('\n'));
  },
};

/* ══════════════════════════════════════════
   图片上传（按钮 / 拖拽 / 粘贴）
   ══════════════════════════════════════════ */

function toBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(String(reader.result).split(',')[1] || ''); };
    reader.onerror = function () { reject(new Error('读取文件失败')); };
    reader.readAsDataURL(file);
  });
}

async function uploadImages(files) {
  if (!state.current) { log('请先打开一篇文章再插入图片', 'err'); return; }
  const year = (els.fDate.value || '').slice(0, 4) || String(new Date().getFullYear());

  for (const file of files) {
    if (!/^image\//.test(file.type)) continue;
    try {
      const data = await apiJson('/api/images', 'POST', {
        year: year,
        name: file.name,
        data: await toBase64(file),
      });
      const ta = els.fBody;
      const snippet = '![](' + data.image.path + ')\n';
      const start = ta.selectionStart === null ? ta.value.length : ta.selectionStart;
      replaceRange(start, ta.selectionEnd === null ? start : ta.selectionEnd, snippet);
      log('已上传图片: ' + data.image.path, 'ok');
    } catch (e) {
      log('图片上传失败（' + file.name + '）: ' + e.message, 'err');
    }
  }
}

/* ══════════════════════════════════════════
   Git 面板
   ══════════════════════════════════════════ */

function renderGitStatus(st) {
  state.git = st;

  const sum = els.gitSummary;
  sum.textContent = '';

  const pill = function (label, value, kind) {
    const p = el('span', 'git-pill' + (kind ? ' is-' + kind : ''));
    p.appendChild(el('span', null, label));
    const strong = el('strong', null, value);
    p.appendChild(strong);
    return p;
  };

  if (!st.available) {
    sum.appendChild(pill('Git', '不可用', 'warn'));
    (st.warnings || []).forEach(function (w) {
      sum.appendChild(el('span', 'git-pill is-warn', w));
    });
  } else {
    sum.appendChild(pill('分支', st.branch || '(未检出)'));
    if (st.upstream) sum.appendChild(pill('上游', st.upstream));
    if (st.identity && (st.identity.name || st.identity.email)) {
      const gitIdentity = [st.identity.name, st.identity.email].filter(Boolean).join(' <') + (st.identity.email ? '>' : '');
      sum.appendChild(pill('身份', gitIdentity || '未配置'));
    }
    sum.appendChild(pill('待提交', String(st.staged + st.unstaged + st.untracked), st.clean ? '' : 'warn'));
    if (st.ahead) sum.appendChild(pill('待推送', String(st.ahead), 'warn'));
    if (st.behind) sum.appendChild(pill('待拉取', String(st.behind), 'warn'));
    if (st.clean && !st.ahead) sum.appendChild(pill('工作区', '干净', 'clean'));
    (st.warnings || []).forEach(function (w) {
      sum.appendChild(el('span', 'git-pill is-warn', w));
    });
  }

  const total = st.available ? (st.staged + st.unstaged + st.untracked + st.ahead) : 0;
  els.gitBadge.textContent = String(total);
  els.gitBadge.hidden = total === 0;

  const files = els.gitFiles;
  files.textContent = '';
  const list = st.files || [];
  if (!list.length) {
    files.appendChild(el('div', 'git-empty', st.available ? '没有改动' : '——'));
  } else {
    list.forEach(function (f) {
      const row = el('div', 'git-file');
      row.appendChild(el('span', 'git-file__code', f.code));
      const path = el('span', 'git-file__path', f.path);
      path.title = f.path;
      row.appendChild(path);
      files.appendChild(row);
    });
    if (st.total > list.length) {
      files.appendChild(el('div', 'git-empty', '… 还有 ' + (st.total - list.length) + ' 项未列出'));
    }
  }
}

function renderGitLog(commits) {
  const box = els.gitLog;
  box.textContent = '';
  if (!commits || !commits.length) {
    box.appendChild(el('div', 'git-empty', '暂无提交'));
    return;
  }
  commits.forEach(function (c) {
    const row = el('div', 'git-commit');
    row.appendChild(el('span', 'git-commit__hash', c.hash));
    const msg = el('span', 'git-commit__msg', c.subject);
    msg.title = c.author + ' · ' + c.time;
    row.appendChild(msg);
    box.appendChild(row);
  });
}

async function loadGitStatus() {
  try {
    const st = await api('/api/git/status');
    renderGitStatus(st);
  } catch (e) {
    log('读取 Git 状态失败: ' + e.message, 'err');
  }
}

async function loadGitLog() {
  try {
    const data = await api('/api/git/log');
    renderGitLog(data.commits || []);
  } catch (e) { /* 忽略 */ }
}

async function runGitSync(mode) {
  // mode: 'commit' = 只本地提交；'push' = 提交并推送
  const message = els.gitMessage.value.trim();
  const payload = {
    message: message,
    build: els.gitBuild.checked,
    pull: els.gitPull.checked,
    push: mode === 'push',
  };

  const btn = mode === 'push' ? els.btnGitPush : els.btnGitCommit;
  btn.disabled = true;
  log(mode === 'push' ? '开始同步到 GitHub…' : '开始本地提交…');

  try {
    const data = await apiJson('/api/git/sync', 'POST', payload);
    (data.log || []).forEach(function (line) { log('  ' + line); });

    (data.steps || []).forEach(function (s) {
      const text = 'git ' + s.step + (s.skipped ? '（跳过）' : '');
      log('  ' + text + (s.output ? ': ' + String(s.output).split('\n')[0] : ''),
        s.ok ? (s.skipped ? 'warn' : 'ok') : 'err');
    });

    if (data.ok) {
      log(data.pushed ? '已推送到 ' + data.remote + '/' + data.branch + '（' + data.ms + 'ms）'
        : '本地提交完成（' + data.ms + 'ms）', 'ok');
      els.gitMessage.value = '';
    } else {
      log(data.error || '同步未完全成功', 'err');
      if (data.detail) log(data.detail, 'err');
    }
    await Promise.all([loadGitStatus(), loadGitLog()]);
  } catch (e) {
    log('同步失败: ' + e.message, 'err');
    if (e.detail) log(e.detail, 'err');
  } finally {
    btn.disabled = false;
  }
}

function openGitPanel() {
  selectDock('git');
  els.dock.classList.remove('is-collapsed');
  loadGitStatus();
  loadGitLog();
}

function selectDock(name) {
  Array.prototype.forEach.call(document.querySelectorAll('.dock-tab'), function (t) {
    t.classList.toggle('is-active', t.dataset.dock === name);
  });
  els.log.hidden = name !== 'log';
  els.gitPanel.hidden = name !== 'git';
}

/* ══════════════════════════════════════════
   启动
   ══════════════════════════════════════════ */

async function boot() {
  let session;
  try {
    session = await api('/api/session');
  } catch (e) {
    session = {
      ok: true,
      outputDir: '(未读取到会话信息)',
      postsDir: '',
      git: { enabled: false },
    };
  }

  state.session = session;
  showApp();
  log('后台已就绪，输出目录: ' + (session && session.outputDir ? session.outputDir : '(未读取到会话信息)'));

  if (session && session.git && session.git.enabled) {
    log('Git 仓库: ' + session.git.repoRoot + '（远程 ' + session.git.remote + '）');
    els.gitMessage.placeholder = session.git.defaultMessage || 'chore(blog): 更新文章';
  } else {
    els.btnGit.disabled = true;
    els.btnGitPush.disabled = true;
    els.btnGitCommit.disabled = true;
    log('Git 功能已关闭（ADMIN_GIT=0）', 'warn');
  }

  await Promise.all([loadPosts(), loadTags()]);
  await Promise.all([loadGitStatus(), loadGitLog()]);
}

/* ══════════════════════════════════════════
   事件绑定
   ══════════════════════════════════════════ */

function bind() {
  // 顶部操作
  els.btnNew.addEventListener('click', createPost);
  els.btnBuild.addEventListener('click', function () { runBuild(false); });
  els.btnGit.addEventListener('click', function () {
    openGitPanel();
    els.gitMessage.value = els.gitMessage.value.trim() ||
      (state.session && state.session.git ? state.session.git.defaultMessage : '') || 'chore(blog): 更新文章';
  });
  els.btnTheme.addEventListener('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  // 搜索
  els.searchInput.addEventListener('input', debounce(function () {
    state.filter.query = els.searchInput.value;
    renderList();
  }, 160));

  // 编辑器
  els.btnSave.addEventListener('click', savePost);
  els.btnDelete.addEventListener('click', deletePost);

  // 拦截编辑器表单的默认提交：在单行输入框（标题/日期等）按 Enter 会触发隐式提交，
  // 导致整页重新加载、未保存内容丢失（新建的文章会一直停在「未命名文章」）。
  // 改为：Enter = 保存当前文章。多行正文（textarea）中的 Enter 仍插入换行，不受影响。
  els.editorForm.addEventListener('submit', function (e) {
    e.preventDefault();
    savePost();
  });

  ['fTitle', 'fDate', 'fSlug', 'fDateTag', 'fExcerpt', 'fBody'].forEach(function (id) {
    els[id].addEventListener('input', function () {
      setDirty(true);
      saveDraft();
      if (id === 'fBody') { updateStats(); schedulePreview(); }
    });
  });

  // 标签：输入回车 / 逗号添加，退格删最后一个；失焦也添加
  els.fTagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault();
      addTagToPost(els.fTagInput.value);
      els.fTagInput.value = '';
    } else if (e.key === 'Backspace' && !els.fTagInput.value && state.currentTags.length) {
      state.currentTags.pop();
      renderTagChips();
      setDirty(true);
    }
  });
  els.fTagInput.addEventListener('blur', function () {
    if (els.fTagInput.value.trim()) { addTagToPost(els.fTagInput.value); els.fTagInput.value = ''; }
  });

  // 标签管理：添加 / 删除
  els.btnTagManage.addEventListener('click', function () {
    els.tagManager.hidden = !els.tagManager.hidden;
  });
  els.tagAddForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = els.tagAddInput.value.trim();
    els.tagAddInput.value = '';
    if (name) addTagGlobal(name);
  });

  els.fBody.addEventListener('scroll', function () { syncScroll('edit'); });
  els.preview.addEventListener('scroll', function () { syncScroll('preview'); });

  els.btnRestoreDraft.addEventListener('click', function () {
    const draft = readDraft();
    if (!draft || !draft.data) return;
    const d = draft.data;
    els.fTitle.value = d.title || '';
    els.fDate.value = d.date || '';
    els.fSlug.value = d.slug || '';
    els.fDateTag.value = d.dateTag || '';
    state.currentTags = Array.isArray(d.tags) ? d.tags : splitTagInput(typeof d.tags === 'string' ? d.tags : '');
    renderTagChips();
    els.fExcerpt.value = d.excerpt || '';
    els.fBody.value = d.body || '';
    setDirty(true);
    els.draftBar.hidden = true;
    updateStats();
    renderPreview(true);
    log('已恢复本地草稿（记得点保存）', 'warn');
  });

  els.btnDropDraft.addEventListener('click', function () {
    clearDraft();
    els.draftBar.hidden = true;
    log('已丢弃本地草稿');
  });

  // Markdown 工具栏
  els.mdToolbar.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-md]');
    if (!btn || !MD_ACTIONS[btn.dataset.md]) return;
    MD_ACTIONS[btn.dataset.md]();
  });

  // 视图切换
  els.viewSwitch.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    setView(btn.dataset.view);
  });

  // 图片：按钮 / 拖拽 / 粘贴
  els.btnImage.addEventListener('click', function () { els.fileInput.click(); });
  els.fileInput.addEventListener('change', async function (e) {
    const files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    if (files.length) await uploadImages(files);
  });

  const panes = els.panes;
  ['dragenter', 'dragover'].forEach(function (type) {
    panes.addEventListener(type, function (e) {
      if (!e.dataTransfer) return;
      e.preventDefault();
      panes.classList.add('is-drop');
    });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    panes.addEventListener(type, function (e) {
      e.preventDefault();
      panes.classList.remove('is-drop');
    });
  });
  panes.addEventListener('drop', function (e) {
    const files = e.dataTransfer ? Array.prototype.slice.call(e.dataTransfer.files || []) : [];
    if (files.length) uploadImages(files);
  });
  els.fBody.addEventListener('paste', function (e) {
    if (!e.clipboardData) return;
    const files = Array.prototype.slice.call(e.clipboardData.files || []);
    if (!files.length) return;
    e.preventDefault();
    uploadImages(files);
  });

  // 底部面板
  document.querySelectorAll('.dock-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectDock(tab.dataset.dock);
      els.dock.classList.remove('is-collapsed');
      if (tab.dataset.dock === 'git') { loadGitStatus(); loadGitLog(); }
    });
  });
  els.btnClearLog.addEventListener('click', function () { els.log.textContent = ''; });
  els.btnToggleDock.addEventListener('click', function () {
    const collapsed = els.dock.classList.toggle('is-collapsed');
    els.btnToggleDock.textContent = collapsed ? '展开' : '收起';
  });

  // Git 操作
  els.btnGitRefresh.addEventListener('click', function () { loadGitStatus(); loadGitLog(); });
  els.btnGitCommit.addEventListener('click', function () { runGitSync('commit'); });
  els.btnGitPush.addEventListener('click', function () { runGitSync('push'); });

  // 主题切换：图标旋转反馈
  els.btnTheme.addEventListener('click', function () {
    if (ANIM_ON && !REDUCED) {
      gsap.fromTo(els.btnTheme, { rotation: -120 }, { rotation: 0, duration: 0.6, ease: 'back.out(1.7)' });
    }
  });

  // 通用点击「回弹」微交互（动画结束后清除内联 transform，避免覆盖 CSS hover）
  if (ANIM_ON && !REDUCED) {
    document.addEventListener('click', function (e) {
      const t = e.target.closest('.btn, .icon-btn, .tool, .chip, .post-item, .dock-tab, .filter-chip, .vs-btn, .git-tab');
      if (!t) return;
      gsap.fromTo(t, { scale: 0.93 }, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', clearProps: 'transform' });
    });
  }

  // 分栏拖拽
  initResizer();
  initDockResizer();

  // 快捷键
  document.addEventListener('keydown', function (e) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;

    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      if (state.current) savePost();
      return;
    }
    if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
      e.preventDefault();
      runBuild(false);
      return;
    }
    if (e.shiftKey && (e.key === 'G' || e.key === 'g')) {
      e.preventDefault();
      openGitPanel();
      runGitSync('push');
      return;
    }
    // 编辑器内快捷键
    if (document.activeElement === els.fBody) {
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); MD_ACTIONS.bold(); return; }
      if (e.key === 'i' || e.key === 'I') { e.preventDefault(); MD_ACTIONS.italic(); return; }
      if (e.key === 'k' || e.key === 'K') { e.preventDefault(); MD_ACTIONS.link(); return; }
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (state.dirty) { saveDraft(); e.preventDefault(); e.returnValue = ''; }
  });
}

/* 分栏宽度拖拽 */
function initResizer() {
  const edit = els.panes.querySelector('.pane-edit');
  const preview = els.panes.querySelector('.pane-preview');

  const applyRatio = function (pct) {
    edit.style.flex = '0 0 ' + pct + '%';
    preview.style.flex = '0 0 ' + (100 - pct) + '%';
  };

  const saved = parseFloat(safeStorageGet(SPLIT_KEY));
  if (saved >= 20 && saved <= 80) applyRatio(saved);

  let dragging = false;

  const onMove = function (e) {
    if (!dragging) return;
    const rect = els.panes.getBoundingClientRect();
    const pct = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100));
    applyRatio(pct);
  };
  const onUp = function () {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    const m = /flex:\s*0\s+0\s+([\d.]+)%/.exec(edit.style.flex || '');
    if (m) safeStorageSet(SPLIT_KEY, m[1]);
  };

  els.paneResizer.addEventListener('mousedown', function (e) {
    if (els.panes.dataset.view !== 'split') return;
    dragging = true;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

function initDockResizer() {
  const dock = els.dock;
  const resizer = els.dockResizer;
  if (!dock || !resizer) return;

  const MIN = 120;
  const MAX = 420;
  let dragging = false;
  let startY = 0;
  let startHeight = 0;

  const onMove = function (e) {
    if (!dragging) return;
    const next = Math.min(MAX, Math.max(MIN, startHeight - (e.clientY - startY)));
    dock.style.height = next + 'px';
  };

  const onUp = function () {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  resizer.addEventListener('mousedown', function (e) {
    if (dock.classList.contains('is-collapsed')) {
      dock.classList.remove('is-collapsed');
      dock.style.height = '190px';
    }
    dragging = true;
    startY = e.clientY;
    startHeight = dock.getBoundingClientRect().height;
    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

/* ══════════════════════════════════════════
   入口
   ══════════════════════════════════════════ */

function cacheEls() {
  const ids = [
    'appView', 'btnNew', 'btnBuild', 'btnGit', 'btnPreview', 'btnTheme',
    'searchInput', 'tagFilter', 'postCount', 'postList',
    'emptyState', 'editorForm', 'fTitle', 'postLoc', 'btnDelete', 'btnSave',
    'draftBar', 'draftText', 'btnRestoreDraft', 'btnDropDraft',
    'fDate', 'fSlug', 'fDateTag', 'fExcerpt', 'fBody',
    'fTagInput', 'tagChips', 'tagManager', 'tagManagerList', 'tagAddForm', 'tagAddInput', 'btnTagManage',
    'mdToolbar', 'btnImage', 'fileInput', 'saveDot',
    'panes', 'paneResizer', 'previewPane',
    'statChars', 'statWords', 'statLines', 'statRead', 'statPath', 'viewSwitch',
    'dock', 'dockResizer', 'log', 'gitPanel', 'gitSummary', 'gitMessage', 'gitBuild', 'gitPull',
    'btnGitRefresh', 'btnGitCommit', 'btnGitPush', 'gitFiles', 'gitLog', 'gitBadge',
    'btnClearLog', 'btnToggleDock',
  ];
  ids.forEach(function (id) { els[id] = $(id); });
  els.preview = els.previewPane;   // 预览容器
}

cacheEls();
bind();
setView(els.panes.dataset.view || 'split'); // 让视图切换按钮显示正确的高亮态
boot();
