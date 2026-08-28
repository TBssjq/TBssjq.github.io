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

const FM_ORDER = ['title', 'date', 'slug', 'dateTag', 'excerpt'];

function serialize(meta, body) {
  const lines = ['---'];
  FM_ORDER.forEach(function (k) {
    if (meta[k]) lines.push(k + ': ' + String(meta[k]).replace(/[\r\n]+/g, ' '));
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

function list() {
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
        updatedAt: stat.mtime.toISOString(),
        size: stat.size,
      });
    });
  });
  return out.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug < b.slug ? -1 : 1;
  });
}

function read(year, slug) {
  const file = postFile(year, slug);
  if (!fs.existsSync(file)) throw new StoreError('文章不存在: ' + year + '/' + slug, 404);
  const parsed = parseRaw(file);
  return {
    year: assertYear(year),
    slug: assertSlug(slug),
    title: parsed.meta.title || slug,
    date: parsed.meta.date || year + '-01-01',
    dateTag: parsed.meta.dateTag || '',
    excerpt: parsed.meta.excerpt || '',
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
  if (data.excerpt) meta.excerpt = String(data.excerpt).trim();

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serialize(meta, data.body), 'utf8');
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
  if (data.excerpt) meta.excerpt = String(data.excerpt).trim();

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, serialize(meta, data.body), 'utf8');

  // 位置变了：清掉旧源文件与旧产物，否则 doc/ 会残留死链
  if (targetFile !== srcFile) {
    fs.unlinkSync(srcFile);
    removeOutput(year, slug);
    removeEmptyYear(year);
  }
  return { year: targetYear, slug: targetSlug };
}

function remove(year, slug) {
  const file = postFile(year, slug);
  if (!fs.existsSync(file)) throw new StoreError('文章不存在: ' + year + '/' + slug, 404);
  fs.unlinkSync(file);
  removeOutput(year, slug);
  removeEmptyYear(year);
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
  read: read,
  create: create,
  save: save,
  remove: remove,
  saveImage: saveImage,
  listImages: listImages,
  build: build,
  parseRaw: parseRaw,
  serialize: serialize,
};
