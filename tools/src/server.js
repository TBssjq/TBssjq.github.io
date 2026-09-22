'use strict';

// 零依赖 Node 后台服务。
//
//   /            静态预览：直接托管 cfg.outputDir（默认仓库 doc/）
//   /admin/      后台 UI（可直接管理文章、上传图片、一键构建）
//   /api/*       REST 接口，全部为 JSON
//
// 用法：
//   node src/server.js
//   ADMIN_PORT=8080 node src/server.js
//   ADMIN_HOST=0.0.0.0 node src/server.js   # 对外暴露（监听所有网卡）
//
// 安全默认值：
//   · 只监听 127.0.0.1，要对外必须显式设置 ADMIN_HOST
//   · 写接口只接受 application/json（配合 CSP 的 form-action 'none'，挡住跨站表单提交）
//   · 所有文件路径都过 store.js 的穿越校验，杜绝 ../ 越界

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFile } = require('child_process');
const cfg = require('./config');
const store = require('./store');
const git = require('./git');
const { render } = require('./markdown');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/* ── 控制台日志 ──
   把后台里发生的保存 / 删除 / 上传 / 构建 / 提交 / 推送等动作，
   同步打印到运行 `npm run admin` 的那个终端，方便不看浏览器也能盯进度。 */

function stamp() {
  const d = new Date();
  const p = function (n) { return n < 10 ? '0' + n : '' + n; };
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function logEvent(tag, message) {
  console.log('[' + stamp() + '] ' + tag + ' ' + message);
}

// 把多行输出压成一行（取首个非空行并截断），用于打印 git 的详细输出
function firstLine(text, max) {
  const first = String(text || '').split('\n')
    .map(function (l) { return l.trim(); })
    .filter(Boolean)[0] || '';
  const limit = max || 120;
  return first.length > limit ? first.slice(0, limit) + '…' : first;
}

function humanSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

/* ── 响应工具 ── */

function applySecurity(res, extra) {
  Object.keys(SECURITY_HEADERS).forEach(k => res.setHeader(k, SECURITY_HEADERS[k]));
  if (extra) Object.keys(extra).forEach(k => res.setHeader(k, extra[k]));
}

function isHead(res) {
  return !!(res.locals && res.locals.isHead);
}

function sendJson(res, status, data, extraHeaders) {
  const body = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  }, extraHeaders || {}));
  res.end(isHead(res) ? undefined : body);
}

function sendText(res, status, text, type) {
  const body = Buffer.from(text, 'utf8');
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  res.end(isHead(res) ? undefined : body);
}

function sendFile(req, res, file, extraHeaders) {
  const ext = path.extname(file).toLowerCase();
  const stat = fs.statSync(file);
  const type = MIME[ext] || 'application/octet-stream';
  const etag = etagOf(stat);

  const headers = Object.assign({
    'Content-Type': type,
    'ETag': etag,
    'Last-Modified': stat.mtime.toUTCString(),
  }, extraHeaders || {});

  // 后台资源与静态站点用不同缓存策略：后台不缓存，站点允许短缓存便于刷新预览
  if (!headers['Cache-Control']) headers['Cache-Control'] = 'no-cache';

  // 协商缓存命中：直接 304，不传正文
  if (req.headers['if-none-match'] === etag) {
    headers['Content-Length'] = 0;
    res.writeHead(304, Object.assign({}, SECURITY_HEADERS, headers));
    res.end();
    return;
  }

  // 可压缩的小文件走内存压缩，其余仍用流，避免大图片占内存
  if (COMPRESSIBLE.test(type) && stat.size <= COMPRESS_MAX) {
    const packed = compressBody(req, etag, fs.readFileSync(file));
    if (packed) {
      headers['Content-Encoding'] = packed.encoding;
      headers['Content-Length'] = packed.body.length;
      headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, Object.assign({}, SECURITY_HEADERS, headers));
      res.end(isHead(res) ? undefined : packed.body);
      return;
    }
  }

  headers['Content-Length'] = stat.size;
  res.writeHead(200, Object.assign({}, SECURITY_HEADERS, headers));
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file)
    .on('error', () => res.end())
    .pipe(res);
}

/* ── 请求体 ── */

function readBody(req, limit) {
  return new Promise(function (resolve, reject) {
    let size = 0;
    let done = false;
    const chunks = [];
    req.on('data', function (chunk) {
      if (done) return;
      size += chunk.length;
      if (size > limit) {
        done = true;
        chunks.length = 0;
        const err = new Error('请求体超过上限 ' + Math.round(limit / 1024 / 1024) + 'MB');
        err.status = 413;
        reject(err);
        // 关键：这里不能 req.destroy()。销毁连接会让浏览器只拿到网络层错误
        // （Failed to fetch），看不到这条 413 文案。改为丢弃剩余数据，
        // 让上面的错误响应能正常发回前端。
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', function () { if (!done) resolve(Buffer.concat(chunks)); });
    req.on('error', function (e) { if (!done) reject(e); });
  });
}

function isJsonRequest(req) {
  const ct = String(req.headers['content-type'] || '').split(';')[0].trim();
  return /^application\/json$/i.test(ct);
}

async function readJson(req) {
  if (!isJsonRequest(req)) {
    const err = new Error('需要 Content-Type: application/json');
    err.status = 415;
    throw err;
  }
  const buf = await readBody(req, cfg.admin.maxBodyBytes);
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch (e) {
    const err = new Error('JSON 解析失败');
    err.status = 400;
    throw err;
  }
}

/* ── 静态资源：ETag 协商缓存 + gzip/brotli 压缩 ── */

// 只压缩文本类资源，且只对有收益的体积动手
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml|x-httpd-php)|image\/svg\+xml)/i;
const COMPRESS_MIN = 1024;
const COMPRESS_MAX = 4 * 1024 * 1024;
// 压缩结果缓存：key = ETag + 编码。站点文件少且小，缓存几十条足够
const compressedCache = new Map();
const COMPRESSED_CACHE_MAX = 48;

function etagOf(stat) {
  return '"' + stat.size.toString(16) + '-' + stat.mtimeMs.toString(16) + '"';
}

function pickEncoding(req) {
  const accept = String(req.headers['accept-encoding'] || '').toLowerCase();
  if (/\bbr\b/.test(accept) && typeof zlib.brotliCompressSync === 'function') return 'br';
  if (/\bgzip\b/.test(accept)) return 'gzip';
  if (/\bdeflate\b/.test(accept)) return 'deflate';
  return '';
}

function compressBody(req, etag, buf) {
  const encoding = pickEncoding(req);
  if (!encoding || buf.length < COMPRESS_MIN || buf.length > COMPRESS_MAX) return null;

  const key = etag + '|' + encoding;
  const hit = compressedCache.get(key);
  if (hit) return hit;

  let out;
  try {
    if (encoding === 'br') out = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 } });
    else if (encoding === 'gzip') out = zlib.gzipSync(buf, { level: 6 });
    else out = zlib.deflateSync(buf, { level: 6 });
  } catch (e) {
    return null;
  }
  // 压了反而更大就放弃
  if (out.length >= buf.length) return null;

  const entry = { encoding: encoding, body: out };
  if (compressedCache.size >= COMPRESSED_CACHE_MAX) {
    compressedCache.delete(compressedCache.keys().next().value);
  }
  compressedCache.set(key, entry);
  return entry;
}

// 把 URL 路径映射到 baseDir 内的文件；越界一律返回 null
function resolveInside(baseDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (e) {
    return null;
  }
  const root = path.resolve(baseDir);
  const full = path.resolve(root, '.' + (decoded.startsWith('/') ? decoded : '/' + decoded));
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  return full;
}

function firstExisting(file) {
  if (!file) return null;
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const index = path.join(file, 'index.html');
    if (fs.existsSync(index)) return index;
  }
  return null;
}

function serveAdminAsset(req, res, name) {
  // 只允许单层、白名单字符的资源名，杜绝任何 ../ 可能
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return sendText(res, 400, '非法资源名');
  const file = firstExisting(path.join(PUBLIC_DIR, name));
  if (!file) return sendText(res, 404, '资源不存在: ' + name);
  sendFile(req, res, file, {
    'Cache-Control': 'no-cache',
    // 后台页面启用严格 CSP：所有脚本/样式都来自同域文件，无内联代码。
    // 仅放行 Google Fonts（与博客同源的 Noto Serif SC / ZCOOL KuaiLe），
    // 加载失败会自动回落到系统字体，不影响功能。
    // 后台依赖 GSAP / 运行时动画产生的内联 style；保留同源脚本与字体，只放开必要的内联样式，
    // 这样仍可阻止第三方脚本和跨站表单，同时避免界面被动画/状态样式阻塞。
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  });
}

function serveSite(req, res, pathname) {
  const file = firstExisting(resolveInside(cfg.outputDir, pathname));
  if (!file) {
    return sendText(res, 404, '404 Not Found: ' + pathname);
  }
  sendFile(req, res, file, { 'Cache-Control': 'no-cache' });
}

/* ── API ── */

async function apiCreatePost(req, res) {
  const data = await readJson(req);
  const result = store.create(data);
  logEvent('文章', '新建 ' + result.year + '/' + result.slug + ' 《' + (data.title || '未命名文章') + '》');
  return sendJson(res, 201, { ok: true, post: result });
}

async function apiSavePost(req, res, year, slug) {
  const data = await readJson(req);
  const result = store.save(year, slug, data);
  const from = year + '/' + slug;
  const to = result.year + '/' + result.slug;
  logEvent('文章', '保存 ' + from + (to !== from ? ' → ' + to : ''));
  return sendJson(res, 200, { ok: true, post: result });
}

// 实时预览会跟着打字高频触发，这里按正文哈希缓存渲染结果，
// 相同内容直接复用，避免重复解析整篇 Markdown。
const previewCache = new Map();
const PREVIEW_CACHE_MAX = 240;

function previewOf(body) {
  const key = crypto.createHash('sha1').update(body, 'utf8').digest('hex');
  const hit = previewCache.get(key);
  if (hit !== undefined) return hit;
  const html = render(body);
  if (previewCache.size >= PREVIEW_CACHE_MAX) {
    previewCache.delete(previewCache.keys().next().value);
  }
  previewCache.set(key, html);
  return html;
}

async function apiPreview(req, res) {
  const data = await readJson(req);
  return sendJson(res, 200, { html: previewOf(String(data.body || '')) });
}

function apiBuild(req, res) {
  try {
    const result = store.build();
    // 正文可能变了，预览缓存失效
    previewCache.clear();
    store.invalidateList();
    logEvent('构建', '完成，用时 ' + result.ms + 'ms');
    result.log.forEach(function (l) { console.log('        ' + l); });
    return sendJson(res, 200, { ok: true, ms: result.ms, log: result.log });
  } catch (e) {
    logEvent('构建', '失败: ' + e.message);
    return sendJson(res, 500, { error: '构建失败: ' + e.message, stack: String(e.stack || '').split('\n').slice(0, 5) });
  }
}

/* ── Git ── */

function apiGitStatus(req, res) {
  try {
    return sendJson(res, 200, git.status());
  } catch (e) {
    return sendJson(res, 500, { error: e.message || '读取 Git 状态失败', detail: String(e.detail || '') });
  }
}

function apiGitLog(req, res) {
  try {
    return sendJson(res, 200, { commits: git.log(10) });
  } catch (e) {
    return sendJson(res, 500, { error: e.message || '读取提交历史失败' });
  }
}

// 一键同步：构建 → git add → commit → pull --rebase → push
async function apiGitSync(req, res) {
  const data = await readJson(req);
  if (!cfg.git.enabled) {
    return sendJson(res, 403, { error: 'Git 功能已关闭（ADMIN_GIT=0）' });
  }

  const log = [];
  let ms = 0;

  logEvent('同步', '开始（' +
    '构建 ' + (data.build !== false ? '开' : '关') +
    ' · 拉取 ' + (data.pull !== false ? '开' : '关') +
    ' · 推送 ' + (data.push !== false ? '开' : '关') + '）');

  try {
    if (data.build !== false) {
      const t0 = Date.now();
      const built = store.build();
      ms += Date.now() - t0;
      log.push('构建完成，用时 ' + built.ms + 'ms');
      built.log.forEach(function (l) { log.push('  ' + l); });
      previewCache.clear();
      store.invalidateList();
      logEvent('同步', '构建完成，用时 ' + built.ms + 'ms');
    }

    const t1 = Date.now();
    const result = git.sync({ message: data.message, pull: data.pull, push: data.push });
    ms += Date.now() - t1;

    // 把 add / commit / pull / push 每一步的结果都打到控制台
    (result.steps || []).forEach(function (s) {
      const state = s.skipped ? '跳过' : (s.ok ? '成功' : '失败');
      const brief = firstLine(s.output);
      logEvent('git', s.step + ' · ' + state + (brief ? ' — ' + brief : ''));
    });

    logEvent('同步', (result.ok ? '完成' : '未完成') +
      (result.committed === false ? '（无改动）' : '') +
      (result.message ? '：' + result.message : '') +
      (result.pulled ? ' · 已拉取' : '') +
      (result.pushed ? ' · 已推送' : '') +
      '，用时 ' + ms + 'ms' +
      (result.error ? ' —— ' + result.error : ''));

    return sendJson(res, 200, Object.assign({ log: log, ms: ms }, result));
  } catch (e) {
    const detail = String(e.detail || '').trim();
    logEvent('同步', '失败: ' + (e.message || '同步失败') + (detail ? ' — ' + firstLine(detail) : ''));
    return sendJson(res, e.status || 500, {
      error: e.message || '同步失败',
      detail: detail,
      log: log,
      ms: ms,
    });
  }
}

async function apiUploadImage(req, res) {
  const data = await readJson(req);
  if (!data.name || !data.data) {
    const err = new Error('缺少 name 或 data(base64)');
    err.status = 400;
    throw err;
  }
  const buf = Buffer.from(String(data.data), 'base64');
  const saved = store.saveImage(data.year || String(new Date().getFullYear()), data.name, buf);
  logEvent('上传', '图片 ' + saved.year + '/' + saved.path + '（' + humanSize(buf.length) + '）');
  return sendJson(res, 201, { ok: true, image: saved });
}

const POST_ROUTE = /^\/api\/posts\/(\d{4})\/([^/]+)$/;
const IMAGE_ROUTE = /^\/api\/images\/(\d{4})$/;

async function handleApi(req, res, pathname) {
  const method = req.method;

  if (pathname === '/api/session') {
    return sendJson(res, 200, {
      ok: true,
      outputDir: path.resolve(cfg.outputDir),
      postsDir: path.resolve(cfg.postsDir),
      git: {
        enabled: !!cfg.git.enabled,
        repoRoot: path.resolve(cfg.repoRoot),
        remote: cfg.git.remote,
        push: !!cfg.git.push,
        defaultMessage: cfg.git.enabled ? git.defaultMessage() : '',
        identity: cfg.git.enabled ? git.identity() : { name: '', email: '' },
      },
    });
  }

  // 后台接口直接放行：进入 admin.html 即可操作，无需任何登录 / 口令
  if (method !== 'GET' && !isJsonRequest(req)) {
    return sendJson(res, 415, { error: '需要 Content-Type: application/json' });
  }

  try {
    if (pathname === '/api/posts' && method === 'GET') {
      return sendJson(res, 200, { posts: store.list() });
    }
    if (pathname === '/api/posts' && method === 'POST') {
      return await apiCreatePost(req, res);
    }

    const m = POST_ROUTE.exec(pathname);
    if (m) {
      const year = m[1];
      const slug = decodeURIComponent(m[2]);
      if (method === 'GET') return sendJson(res, 200, { post: store.read(year, slug) });
      if (method === 'PUT') return await apiSavePost(req, res, year, slug);
      if (method === 'DELETE') {
        const removed = store.remove(year, slug);
        logEvent('文章', '删除 ' + removed.year + '/' + removed.slug);
        return sendJson(res, 200, { ok: true, post: removed });
      }
      return sendJson(res, 405, { error: '方法不允许' });
    }

    if (pathname === '/api/preview' && method === 'POST') return await apiPreview(req, res);
    if (pathname === '/api/build' && method === 'POST') return apiBuild(req, res);

    // 标签（文章管理用）：tags = 文章中实际使用的标签（含篇数），pool = 标签池（含 0 篇的）
    if (pathname === '/api/tags' && method === 'GET') {
      return sendJson(res, 200, {
        tags: store.listTags(),
        pool: store.readTagPool(),
      });
    }
    if (pathname === '/api/tags' && method === 'POST') {
      const body = await readJson(req, res);
      const name = store.addTag(body && body.name);
      logEvent('标签', '新增「' + name + '」');
      return sendJson(res, 200, { ok: true, name: name });
    }
    if (pathname === '/api/tags' && method === 'DELETE') {
      const body = await readJson(req, res);
      const n = store.deleteTag(body && body.name);
      logEvent('标签', '删除「' + (body && body.name) + '」，影响 ' + n + ' 篇文章');
      return sendJson(res, 200, { ok: true, name: body && body.name, posts: n });
    }

    // Git：一键同步
    if (pathname === '/api/git/status' && method === 'GET') return apiGitStatus(req, res);
    if (pathname === '/api/git/log' && method === 'GET') return apiGitLog(req, res);
    if (pathname === '/api/git/sync' && method === 'POST') return await apiGitSync(req, res);

    if (pathname === '/api/images' && method === 'POST') return await apiUploadImage(req, res);

    const im = IMAGE_ROUTE.exec(pathname);
    if (im && method === 'GET') {
      return sendJson(res, 200, { images: store.listImages(im[1]) });
    }

    return sendJson(res, 404, { error: '接口不存在: ' + pathname });
  } catch (e) {
    if (e instanceof store.StoreError) {
      logEvent('错误', e.message);
      return sendJson(res, e.status, { error: e.message });
    }
    logEvent('错误', e.message || '服务器内部错误');
    return sendJson(res, e.status || 500, { error: e.message || '服务器内部错误' });
  }
}

/* ── 路由 ── */

function handle(req, res) {
  res.locals = { isHead: req.method === 'HEAD' };

  let url;
  try {
    url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  } catch (e) {
    return sendText(res, 400, '非法 URL');
  }

  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    applySecurity(res);
    handleApi(req, res, pathname).catch(function (err) {
      logEvent('错误', (err && err.message) || '服务器内部错误');
      sendJson(res, err.status || 500, { error: err.message || '服务器内部错误' });
    });
    return;
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    applySecurity(res);
    return serveAdminAsset(req, res, 'admin.html');
  }
  if (pathname.startsWith('/admin/')) {
    applySecurity(res);
    return serveAdminAsset(req, res, pathname.slice('/admin/'.length));
  }

  applySecurity(res);
  serveSite(req, res, pathname);
}

/* ── 启动 ── */

function start() {
  const server = http.createServer(handle);

  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.error('端口 ' + cfg.admin.port + ' 已被占用，换一个：ADMIN_PORT=8080 npm run serve');
      process.exit(1);
    }
    throw err;
  });

  server.listen(cfg.admin.port, cfg.admin.host, function () {
    const shown = cfg.admin.host === '0.0.0.0' || cfg.admin.host === '::'
      ? '本机所有网卡'
      : cfg.admin.host;
    console.log('');
    console.log('  博客后台已启动');
    console.log('    后台地址 : http://' + (cfg.admin.host === '0.0.0.0' ? '127.0.0.1' : cfg.admin.host) + ':' + cfg.admin.port + '/admin/');
    console.log('    站点预览 : http://' + (cfg.admin.host === '0.0.0.0' ? '127.0.0.1' : cfg.admin.host) + ':' + cfg.admin.port + '/');
    console.log('    监听地址 : ' + cfg.admin.host + ' (' + shown + ')');
    console.log('    输出目录 : ' + path.resolve(cfg.outputDir));
    if (cfg.git.enabled && git.isRepo()) {
      const st = git.status();
      console.log('    Git 仓库 : ' + (st.branch || '(未检出)') +
        '  待提交 ' + (st.staged + st.unstaged + st.untracked) + ' 项' +
        (st.ahead ? '  领先 ' + st.ahead : '') + (st.behind ? '  落后 ' + st.behind : ''));
    } else if (!cfg.git.enabled) {
      console.log('    Git 同步 : 已关闭（ADMIN_GIT=0）');
    } else {
      console.log('    Git 同步 : 不可用（当前不是 Git 仓库）');
    }
    console.log('');
  });

  return server;
}

if (require.main === module) {
  start();

  if (process.argv.includes('--open')) {
    const url = 'http://127.0.0.1:' + cfg.admin.port + '/admin/';
    const cmd = process.platform === 'win32' ? 'cmd' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    execFile(cmd, args, function () {});
  }
}

module.exports = { start: start };
