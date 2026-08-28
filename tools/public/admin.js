'use strict';

// 后台前端。无构建、无框架、无内联代码 —— 服务端下发的是严格 CSP，
// 所以所有事件都必须用 addEventListener 绑定，样式一律走 class。

const $ = id => document.getElementById(id);

const state = {
  posts: [],
  current: null,   // { year, slug }
  dirty: false,
};

/* ── 日志 ── */

function log(msg, kind) {
  const el = $('log');
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line' + (kind ? ' log-line--' + kind : '');
  line.textContent = '[' + time + '] ' + msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

/* ── 请求 ── */

async function api(path, options) {
  const res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
  let data = null;
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    try { data = await res.json(); } catch (e) { data = null; }
  }
  if (!res.ok) {
    if (res.status === 401) showLogin();
    const err = new Error((data && data.error) || ('请求失败（' + res.status + '）'));
    err.status = res.status;
    throw err;
  }
  return data;
}

function apiJson(path, method, body) {
  return api(path, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/* ── 视图切换 ── */

function showLogin(info) {
  $('appView').hidden = true;
  $('loginView').hidden = false;
  if (info && info.tokenGenerated) {
    $('loginHint').textContent = '首次运行：管理口令已打印在启动服务的终端，并保存到 tools/.admin-token';
  } else {
    $('loginHint').textContent = '管理口令见 tools/.admin-token，或用 ADMIN_TOKEN 环境变量指定';
  }
  $('tokenInput').focus();
}

function showApp() {
  $('loginView').hidden = true;
  $('appView').hidden = false;
}

/* ── 文章列表 ── */

function renderList() {
  const list = $('postList');
  list.textContent = '';
  $('postCount').textContent = String(state.posts.length);

  const groups = new Map();
  state.posts.forEach(function (p) {
    if (!groups.has(p.year)) groups.set(p.year, []);
    groups.get(p.year).push(p);
  });

  groups.forEach(function (items, year) {
    const head = document.createElement('div');
    head.className = 'post-group';
    head.textContent = year + ' 年';
    list.appendChild(head);

    items.forEach(function (p) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'post-item';
      if (state.current && state.current.year === p.year && state.current.slug === p.slug) {
        btn.classList.add('is-active');
      }

      const title = document.createElement('span');
      title.textContent = p.title;
      btn.appendChild(title);

      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = p.date + ' · ' + p.slug + '.md';
      btn.appendChild(meta);

      btn.addEventListener('click', function () {
        if (state.dirty && !confirm('当前文章未保存，确定离开？')) return;
        openPost(p.year, p.slug);
      });

      list.appendChild(btn);
    });
  });
}

async function loadPosts() {
  const data = await api('/api/posts');
  state.posts = data.posts || [];
  renderList();
}

/* ── 编辑器 ── */

function fillForm(post) {
  $('postLoc').textContent = 'posts/' + post.year + '/' + post.slug + '.md';
  $('fTitle').value = post.title || '';
  $('fDate').value = post.date || '';
  $('fSlug').value = post.slug || '';
  $('fDateTag').value = post.dateTag || '';
  $('fExcerpt').value = post.excerpt || '';
  $('fBody').value = post.body || '';
  setDirty(false);
}

function setDirty(v) {
  state.dirty = v;
  $('btnSave').textContent = v ? '保存 ●' : '保存';
}

async function openPost(year, slug) {
  try {
    const data = await api('/api/posts/' + encodeURIComponent(year) + '/' + encodeURIComponent(slug));
    state.current = { year: year, slug: slug };
    $('emptyState').hidden = true;
    $('editorForm').hidden = false;
    fillForm(data.post);
    renderList();
    showTab('write');
    log('已打开 ' + year + '/' + slug + '.md');
  } catch (e) {
    log('打开失败: ' + e.message, 'err');
  }
}

function closeEditor() {
  state.current = null;
  $('editorForm').hidden = true;
  $('emptyState').hidden = false;
  renderList();
}

/* ── 保存 / 新建 / 删除 ── */

function collectForm() {
  return {
    title: $('fTitle').value.trim(),
    date: $('fDate').value.trim(),
    slug: $('fSlug').value.trim(),
    dateTag: $('fDateTag').value.trim(),
    excerpt: $('fExcerpt').value.trim(),
    body: $('fBody').value,
  };
}

async function savePost() {
  if (!state.current) return;
  const btn = $('btnSave');
  btn.disabled = true;
  try {
    const data = await apiJson(
      '/api/posts/' + encodeURIComponent(state.current.year) + '/' + encodeURIComponent(state.current.slug),
      'PUT',
      collectForm()
    );
    state.current = { year: data.post.year, slug: data.post.slug };
    setDirty(false);
    log('已保存 ' + data.post.year + '/' + data.post.slug + '.md（记得点「构建站点」刷新页面）', 'ok');
    await loadPosts();
  } catch (e) {
    log('保存失败: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
  }
}

async function createPost() {
  if (state.dirty && !confirm('当前文章未保存，确定新建？')) return;
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const date = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

  try {
    const data = await apiJson('/api/posts', 'POST', {
      title: '未命名文章',
      date: date,
      body: '在这里写正文。段落之间空一行。\n',
    });
    log('已新建 ' + data.post.year + '/' + data.post.slug + '.md', 'ok');
    await loadPosts();
    await openPost(data.post.year, data.post.slug);
    $('fTitle').select();
  } catch (e) {
    log('新建失败: ' + e.message, 'err');
  }
}

async function deletePost() {
  if (!state.current) return;
  const label = state.current.year + '/' + state.current.slug + '.md';
  if (!confirm('确定删除 ' + label + ' ？此操作会同时删除源文件与已生成页面。')) return;

  try {
    await api('/api/posts/' + encodeURIComponent(state.current.year) + '/' + encodeURIComponent(state.current.slug), { method: 'DELETE' });
    log('已删除 ' + label + '（记得点「构建站点」刷新目录页）', 'ok');
    closeEditor();
    await loadPosts();
  } catch (e) {
    log('删除失败: ' + e.message, 'err');
  }
}

/* ── 构建 ── */

async function runBuild() {
  const btn = $('btnBuild');
  btn.disabled = true;
  btn.textContent = '构建中…';
  log('开始构建…');
  try {
    const data = await api('/api/build', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    (data.log || []).forEach(function (line) { log('  ' + line); });
    log('构建完成，用时 ' + data.ms + 'ms', 'ok');
  } catch (e) {
    log('构建失败: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = '构建站点';
  }
}

/* ── 预览 ── */

async function showTab(name) {
  const write = name === 'write';
  $('fBody').hidden = !write;
  $('previewPane').hidden = write;

  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
    tab.classList.toggle('is-active', tab.dataset.tab === name);
  });

  if (!write) {
    const html = await renderMarkdown($('fBody').value).catch(function () { return ''; });
    $('previewPane').innerHTML = html;
  }
}

async function renderMarkdown(body) {
  const data = await apiJson('/api/preview', 'POST', { body: body });
  return data.html || '';
}

/* ── 图片上传 ── */

function toBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(String(reader.result).split(',')[1] || ''); };
    reader.onerror = function () { reject(new Error('读取文件失败')); };
    reader.readAsDataURL(file);
  });
}

function insertAtCursor(text) {
  const ta = $('fBody');
  const start = ta.selectionStart === null ? ta.value.length : ta.selectionStart;
  const end = ta.selectionEnd === null ? start : ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}

async function uploadImages(files) {
  if (!state.current) { log('请先打开一篇文章', 'err'); return; }
  const year = ($('fDate').value || '').slice(0, 4) || String(new Date().getFullYear());

  for (const file of files) {
    try {
      const data = await apiJson('/api/images', 'POST', {
        year: year,
        name: file.name,
        data: await toBase64(file),
      });
      insertAtCursor('![](' + data.image.path + ')\n');
      log('已上传图片: ' + data.image.path, 'ok');
    } catch (e) {
      log('图片上传失败（' + file.name + '）: ' + e.message, 'err');
    }
  }
}

/* ── 启动 ── */

async function boot() {
  try {
    const session = await api('/api/session');
    if (!session.ok) { showLogin(session); return; }
    showApp();
    log('后台已就绪，输出目录: ' + session.outputDir);
    await loadPosts();
  } catch (e) {
    showLogin();
  }
}

function bind() {
  $('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = $('loginBtn');
    btn.disabled = true;
    $('loginError').textContent = '';
    try {
      await apiJson('/api/login', 'POST', { token: $('tokenInput').value });
      $('tokenInput').value = '';
      showApp();
      log('登录成功');
      await loadPosts();
    } catch (err) {
      $('loginError').textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $('btnLogout').addEventListener('click', async function () {
    try { await api('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); } catch (e) { /* 忽略 */ }
    closeEditor();
    state.posts = [];
    showLogin();
  });

  $('btnNew').addEventListener('click', createPost);
  $('btnSave').addEventListener('click', savePost);
  $('btnDelete').addEventListener('click', deletePost);
  $('btnBuild').addEventListener('click', runBuild);

  $('btnImage').addEventListener('click', function () { $('fileInput').click(); });
  $('fileInput').addEventListener('change', async function (e) {
    const files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    if (files.length) await uploadImages(files);
  });

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { showTab(tab.dataset.tab); });
  });

  $('btnClearLog').addEventListener('click', function () { $('log').textContent = ''; });

  // 表单任何改动都标记为未保存
  ['fTitle', 'fDate', 'fSlug', 'fDateTag', 'fExcerpt', 'fBody'].forEach(function (id) {
    $(id).addEventListener('input', function () { setDirty(true); });
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (state.current) savePost();
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });
}

bind();
boot();
