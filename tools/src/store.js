'use strict';

// 存储层：全站唯一接触 posts/ 文件系统的模块。
// 所有路径都在这里拼装并做目录穿越检查，上层（HTTP API）只处理校验过的参数。
//
// 数据源仍然是 posts/<year>/<slug>.md —— 与 build.js / new-post.js / remove-post.js
// 完全一致，后台只是给这份文件提供了一个浏览器入口，不引入数据库。

const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const YEAR_RE = /^\d{4}$/;
const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
// 必须带捕获组：slugFromDate / dateTagOf 依赖 m[2] m[3] 取月和日
const DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp'];

class StoreError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'StoreError';
    this.status = status || 400;
  }
}

/* ── 校验 ── */

function assertYear(year) {
  if (!YEAR_RE.test(String(year))) throw new StoreError('年份必须是 4 位数字: ' + year);
  return String(year);
}

function assertSlug(slug) {
  const s = String(slug || '');
  // 不允许以点开头（隐藏文件）、不允许 .. （穿越）、不允许路径分隔符
  if (!SLUG_RE.test(s) || s.indexOf('..') !== -1) {
    throw new StoreError('slug 只能包含字母、数字、点、下划线、连字符，且不能以点开头');
  }
  return s;
}

// 拼绝对路径，并确认解析结果仍在 base 之内
function safeJoin(base, ...segments) {
  const root = path.resolve(base);
  const full = path.resolve(root, ...segments);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new StoreError('非法路径');
  }
  return full;
}

function postFile(year, slug) {
  return safeJoin(cfg.postsDir, assertYear(year), assertSlug(slug) + '.md');
}

/* ── frontmatter ── */

// 与 build.js 的 parsePost 使用同一套解析规则，保证读写不漂移
function parseRaw(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    m[1].split('\n').forEach(function (line) {
      const l = line.replace(/\r$/, '').trim();
      const idx = l.indexOf(':');
      if (idx > 0) {
        const key = l.slice(0, idx).trim();
        const val = l.slice(idx + 1).trim();
        if (key && !/[^A-Za-z0-9_-]/.test(key)) meta[key] = val;
      }
    });
  }
  return { meta: meta, body: body };
}

const FM_ORDER = ['title', 'date', 'slug', 'dateTag', 'tags', 'excerpt'];

function serialize(meta, body) {
  const lines = ['---'];
  FM_ORDER.forEach(function (k) {
    const v = meta[k];
    if (v === undefined || v === null) return;
    // tags 允许是数组，统一写成 "a, b" 形式
    const text = Array.isArray(v) ? v.join(', ') : String(v);
    if (!text.trim()) return;
    lines.push(k + ': ' + text.replace(/[\r\n]+/g, ' '));
  });
  // 保留 frontmatter 里出现过的其它自定义键，避免编辑时被静默丢弃
  Object.keys(meta).forEach(function (k) {
    if (FM_ORDER.indexOf(k) === -1 && meta[k]) {
      lines.push(k + ': ' + String(meta[k]).replace(/[\r\n]+/g, ' '));
    }
  });
  lines.push('---', '');
  return lines.join('\n') + '\n' + String(body || '').replace(/\s+$/, '') + '\n';
}

/* ── 工具 ── */

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function dateTagOf(dateStr) {
  const m = DATE_RE.exec(dateStr);
  if (!m) return '';
  return parseInt(m[2], 10) + '月' + parseInt(m[3], 10) + '日';
}

function slugFromDate(dateStr) {
  const m = DATE_RE.exec(dateStr);
  if (!m) return 'post';
  return parseInt(m[2], 10) + '.' + parseInt(m[3], 10);
}

// 标签允许 "a, b" / "a、b" / "a b" 三种写法，统一收敛成去重后的数组
function normalizeTags(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,，、;；\s]+/);
  const seen = new Set();
  const out = [];
  raw.forEach(function (t) {
    const s = String(t || '').trim();
    if (!s || s.length > 40) return;
    if (seen.has(s)) return;
    seen.add(s);
    out.push(s);
  });
  return out.slice(0, 20);
}

// 从 frontmatter 里读出 tags（兼容旧文章：没有就是空标签）
function taxonomy(meta) {
  return {
    tags: normalizeTags(meta.tags),
  };
}

// ── 标签池：持久化在 tools/tags.json，支持后台「添加 / 删除标签」管理 ──
const TAGS_FILE = path.join(__dirname, '..', 'tags.json');

function readTagPool() {
  try {
    const arr = JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8'));
    if (Array.isArray(arr)) return arr.filter(function (t) { return typeof t === 'string'; });
  } catch (e) { /* 文件不存在或损坏时用空池 */ }
  return [];
}

function writeTagPool(names) {
  fs.writeFileSync(TAGS_FILE, JSON.stringify(Array.from(new Set(names)), null, 2) + '\n', 'utf8');
}

// 校验并加入标签池（已存在则幂等），返回规范化后的名称
function addTag(name) {
  const s = String(name || '').trim();
  if (!s || s.length > 40) throw new StoreError('标签名无效（1–40 字）', 400);
  const pool = readTagPool();
  if (pool.indexOf(s) === -1) {
    pool.push(s);
    writeTagPool(pool);
  }
  return s;
}

// 删除标签：同时从标签池与所有文章里摘掉它，返回受影响文章数
function deleteTag(name) {
  const s = String(name || '').trim();
  if (!s) throw new StoreError('标签名无效', 400);
  writeTagPool(readTagPool().filter(function (t) { return t !== s; }));
  let n = 0;
  list().forEach(function (p) {
    const file = postFile(p.year, p.slug);
    const parsed = parseRaw(file);
    const cur = normalizeTags(parsed.meta.tags);
    if (cur.indexOf(s) === -1) return;
    const tags = cur.filter(function (t) { return t !== s; });
    const meta = Object.assign({}, parsed.meta);
    if (tags.length) meta.tags = tags; else delete meta.tags;
    fs.writeFileSync(file, serialize(meta, parsed.body), 'utf8');
    n++;
  });
  invalidateList();
  return n;
}

function removeOutput(year, slug) {
  const html = safeJoin(cfg.outputDir, assertYear(year), assertSlug(slug) + '.html');
  if (fs.existsSync(html)) fs.unlinkSync(html);
}

// 年份目录里除 images/ 等资产外再无 .md 时，连带产物一起清理
function removeEmptyYear(year) {
  const yearDir = safeJoin(cfg.postsDir, assertYear(year));
  if (!fs.existsSync(yearDir)) return;
  const hasMd = fs.readdirSync(yearDir).some(f => f.endsWith('.md'));
  if (hasMd) return;
  fs.rmSync(yearDir, { recursive: true, force: true });
  const outYear = safeJoin(cfg.outputDir, assertYear(year));
  if (fs.existsSync(outYear)) fs.rmSync(outYear, { recursive: true, force: true });
}

/* ── 对外操作 ── */

// list() 每次都要遍历 posts/ 并逐个读文件，后台刷新很频繁。
// 这里做一层短 TTL 缓存；所有写操作都会主动失效它，因此不会读到脏数据。
const LIST_TTL = 1000;
let listCache = { at: 0, value: null };

function invalidateList() {
  listCache.at = 0;
  listCache.value = null;
}

function list() {
  const now = Date.now();
  if (listCache.value && now - listCache.at < LIST_TTL) return listCache.value;

  const base = path.resolve(cfg.postsDir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  fs.readdirSync(base, { withFileTypes: true }).forEach(function (entry) {
    if (!entry.isDirectory() || !YEAR_RE.test(entry.name)) return;
    const yearDir = path.join(base, entry.name);
    fs.readdirSync(yearDir).forEach(function (file) {
      if (!file.endsWith('.md')) return;
      const full = path.join(yearDir, file);
      let parsed;
      try {
        parsed = parseRaw(full);
      } catch (e) {
        return; // 读不动的文件跳过，不让后台整体崩掉
      }
      const slug = file.slice(0, -3);
      const stat = fs.statSync(full);
      out.push({
        year: entry.name,
        slug: slug,
        title: parsed.meta.title || slug,
        date: parsed.meta.date || entry.name + '-01-01',
        dateTag: parsed.meta.dateTag || '',
        excerpt: parsed.meta.excerpt || '',
        tags: normalizeTags(parsed.meta.tags),
        updatedAt: stat.mtime.toISOString(),
        size: stat.size,
      });
    });
  });

  const value = out.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug < b.slug ? -1 : 1;
  });
  listCache = { at: now, value: value };
  return value;
}

// 汇总全站标签
function listTags() {
  const map = new Map();
  list().forEach(function (p) {
    p.tags.forEach(function (t) {
      map.set(t, (map.get(t) || 0) + 1);
    });
  });
  return Array.from(map.entries())
    .map(function (e) { return { name: e[0], count: e[1] }; })
    .sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return a.name < b.name ? -1 : 1;
    });
}

function read(year, slug) {
  const file = postFile(year, slug);
  if (!fs.existsSync(file)) throw new StoreError('文章不存在: ' + year + '/' + slug, 404);
  const parsed = parseRaw(file);
  const tax = taxonomy(parsed.meta);
  return {
    year: assertYear(year),
    slug: assertSlug(slug),
    title: parsed.meta.title || slug,
    date: parsed.meta.date || year + '-01-01',
    dateTag: parsed.meta.dateTag || '',
    excerpt: parsed.meta.excerpt || '',
    tags: tax.tags,
    body: parsed.body,
  };
}

// 新建。slug 冲突时自动追加序号，避免覆盖已有文章
function create(data) {
  const date = DATE_RE.test(data.date || '') ? data.date : todayStr();
  const year = date.slice(0, 4);

  let slug = assertSlug(data.slug || slugFromDate(date));
  let file = safeJoin(cfg.postsDir, year, slug + '.md');
  let n = 1;
  while (fs.existsSync(file)) {
    slug = assertSlug((data.slug || slugFromDate(date)) + '-' + (++n));
    file = safeJoin(cfg.postsDir, year, slug + '.md');
  }

  const meta = {
    title: String(data.title || '').trim() || '未命名文章',
    date: date,
    slug: slug,
    dateTag: String(data.dateTag || '').trim() || dateTagOf(date),
  };
  const tags = normalizeTags(data.tags);
  if (tags.length) meta.tags = tags;
  if (data.excerpt) meta.excerpt = String(data.excerpt).trim();

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serialize(meta, data.body), 'utf8');
  invalidateList();
  return { year: year, slug: slug };
}

// 保存。允许改 slug 与日期（日期跨年时会在年份目录之间搬家）
function save(year, slug, data) {
  const srcFile = postFile(year, slug);
  if (!fs.existsSync(srcFile)) throw new StoreError('文章不存在: ' + year + '/' + slug, 404);

  const date = DATE_RE.test(data.date || '') ? data.date : null;
  if (!date) throw new StoreError('日期格式应为 YYYY-MM-DD');

  const targetYear = date.slice(0, 4);
  const targetSlug = assertSlug(data.slug || slug);
  const targetFile = safeJoin(cfg.postsDir, targetYear, targetSlug + '.md');

  if (targetFile !== srcFile && fs.existsSync(targetFile)) {
    throw new StoreError('目标位置已存在文章: ' + targetYear + '/' + targetSlug, 409);
  }

  const meta = {
    title: String(data.title || '').trim() || targetSlug,
    date: date,
    slug: targetSlug,
    dateTag: String(data.dateTag || '').trim() || dateTagOf(date),
  };
  const tags = normalizeTags(data.tags);
  if (tags.length) meta.tags = tags;
  if (data.excerpt) meta.excerpt = String(data.excerpt).trim();

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, serialize(meta, data.body), 'utf8');

  // 位置变了：清掉旧源文件与旧产物，否则 doc/ 会残留死链
  if (targetFile !== srcFile) {
    fs.unlinkSync(srcFile);
    removeOutput(year, slug);
    removeEmptyYear(year);
  }
  invalidateList();
  return { year: targetYear, slug: targetSlug };
}

function remove(year, slug) {
  const file = postFile(year, slug);
  if (!fs.existsSync(file)) throw new StoreError('文章不存在: ' + year + '/' + slug, 404);
  fs.unlinkSync(file);
  removeOutput(year, slug);
  removeEmptyYear(year);
  invalidateList();
  return { year: assertYear(year), slug: assertSlug(slug) };
}

/* ── 图片 ── */

function saveImage(year, filename, buffer) {
  const y = assertYear(year);
  const ext = path.extname(String(filename)).toLowerCase();
  if (IMAGE_EXT.indexOf(ext) === -1) throw new StoreError('不支持的图片格式: ' + ext);
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new StoreError('图片内容为空');
  if (buffer.length > cfg.admin.maxImageBytes) {
    throw new StoreError('图片超过大小上限 ' + Math.round(cfg.admin.maxImageBytes / 1024 / 1024) + 'MB', 413);
  }

  const base = path.basename(filename, ext)
    .replace(/[^\w\u4e00-\u9fa5.-]+/g, '-')
    .replace(/^[.\-]+/, '');
  const imgDir = safeJoin(cfg.postsDir, y, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  const stem = base || 'image';
  let name = stem + ext;
  let n = 1;
  while (fs.existsSync(path.join(imgDir, name))) name = stem + '-' + (++n) + ext;

  fs.writeFileSync(path.join(imgDir, name), buffer);
  // url 指向构建产物：build.js 会把_posts/<year>/images 复制到 doc/<year>/images
  return {
    year: y,
    path: 'images/' + name,
    url: '/' + y + '/images/' + name,
  };
}

function listImages(year) {
  const imgDir = safeJoin(cfg.postsDir, assertYear(year), 'images');
  if (!fs.existsSync(imgDir)) return [];
  return fs.readdirSync(imgDir)
    .filter(f => IMAGE_EXT.indexOf(path.extname(f).toLowerCase()) !== -1)
    .map(f => ({
      name: f,
      path: 'images/' + f,
      url: '/' + assertYear(year) + '/images/' + f,
      size: fs.statSync(path.join(imgDir, f)).size,
    }));
}

/* ── 构建 ── */

// 捕获 build() 打到 console 的日志，一并返回给后台 UI
function build() {
  const started = Date.now();
  const lines = [];
  const original = console.log;
  console.log = function () {
    lines.push(Array.prototype.join.call(arguments, ' '));
  };
  try {
    require('./build').build();
  } finally {
    console.log = original;
  }
  return { ms: Date.now() - started, log: lines };
}

module.exports = {
  StoreError: StoreError,
  list: list,
  listTags: listTags,
  readTagPool: readTagPool,
  addTag: addTag,
  deleteTag: deleteTag,
  read: read,
  create: create,
  save: save,
  remove: remove,
  saveImage: saveImage,
  listImages: listImages,
  build: build,
  parseRaw: parseRaw,
  serialize: serialize,
  normalizeTags: normalizeTags,
  invalidateList: invalidateList,
};
