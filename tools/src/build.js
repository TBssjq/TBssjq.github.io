'use strict';

const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const md = require('./markdown');
const tpl = require('./templates');

// 把 Markdown 正文提取为纯文本（去语法符号），用于生成目录页摘要
function plainText(mdText) {
  return mdText
    .replace(/```[\s\S]*?```/g, ' ')          // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // 链接只留文字
    .replace(/[#>*_~`\-]/g, ' ')               // 标题/引用/强调等符号
    .replace(/\s+/g, ' ')                       // 空白折叠
    .trim();
}

// 读取一个 .md 文件，拆分 frontmatter 与正文
// 标签归一化：与 store.js 保持一致（"a, b" / "a、b" / "a b" 都认）
function splitTags(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,，、;；\s]+/);
  const seen = new Set();
  const out = [];
  raw.forEach(function (t) {
    const s = String(t || '').trim();
    if (!s || s.length > 40 || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  });
  return out.slice(0, 20);
}

function parsePost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    m[1].split('\n').forEach(function (line) {
      line = line.replace(/\r$/, '').trim();
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key && !/[^A-Za-z0-9_-]/.test(key)) meta[key] = val;
      }
    });
  }
  const base = path.basename(file, '.md');
  const dir = path.basename(path.dirname(file)); // 年份
  const date = meta.date || (dir.match(/^\d{4}$/) ? dir + '-01-01' : '1970-01-01');
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  // 目录页摘要：取正文纯文本前 15 个字（用户要求）
  const excerpt = (plainText(body).slice(0, 15) || '点击阅读全文') + '...';

  return {
    title: meta.title || base,
    date: date,
    year: d.getFullYear().toString(),
    dateTag: meta.dateTag || (month + '月' + day + '日'),
    slug: meta.slug || base,
    excerpt: excerpt,
    category: String(meta.category || '').trim().slice(0, 40) || (cfg.defaultCategory || '未分类'),
    tags: splitTags(meta.tags),
    markdown: body,
    // 兼容早期手写页面的排版细节
    titleSuffix: meta.titleSuffix,
    compactConfig: meta.compactConfig,
  };
}

// 汇总分类（按篇数降序、同篇数按名称升序）
function collectCategories(posts) {
  const map = new Map();
  posts.forEach(function (p) {
    map.set(p.category, (map.get(p.category) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(function (e) { return { name: e[0], count: e[1] }; })
    .sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return a.name < b.name ? -1 : 1;
    });
}

// 递归复制文章目录下的非 Markdown 资源（图片等）
function copyAssets(srcDir, dstDir) {
  fs.readdirSync(srcDir).forEach(function (name) {
    if (name.endsWith('.md')) return;
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    const st = fs.statSync(src);
    if (st.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      copyAssets(src, dst);
    } else {
      fs.copyFileSync(src, dst);
    }
  });
}

// doc/ 下的页面使用 CRLF 换行，写出时统一转换以保持完全一致
function writeHtml(file, html) {
  fs.writeFileSync(file, html.replace(/\r?\n/g, '\r\n'), 'utf8');
}

// 复制主题静态资源到输出目录
function copyTheme() {
  if (!fs.existsSync(cfg.themeDir)) return;
  fs.readdirSync(cfg.themeDir).forEach(function (f) {
    const src = path.join(cfg.themeDir, f);
    const dst = path.join(cfg.outputDir, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
  });
}

function build() {
  fs.mkdirSync(cfg.outputDir, { recursive: true });

  // 扫描 posts/<year>/*.md
  const posts = [];
  if (fs.existsSync(cfg.postsDir)) {
    fs.readdirSync(cfg.postsDir).forEach(function (yearDir) {
      const yearPath = path.join(cfg.postsDir, yearDir);
      if (!fs.statSync(yearPath).isDirectory()) return;
      fs.readdirSync(yearPath).forEach(function (file) {
        if (file.endsWith('.md')) {
          const post = parsePost(path.join(yearPath, file));
          posts.push(post);
          const outDir = path.join(cfg.outputDir, post.year);
          fs.mkdirSync(outDir, { recursive: true });
          const html = tpl.articlePage(cfg, post, md.render(post.markdown));
          writeHtml(path.join(outDir, post.slug + '.html'), html);
          console.log('  生成文章: ' + post.year + '/' + post.slug + '.html');
          // 复制该文章目录下的非 md 资源（图片等，含 images/ 子目录）到同年输出目录
          copyAssets(yearPath, outDir);
        }
      });
    });
  }

  // 按年份分组（新→旧）
  const groups = {};
  posts.forEach(function (p) { (groups[p.year] = groups[p.year] || []).push(p); });
  const years = Object.keys(groups)
    .sort(function (a, b) { return b - a; })
    .map(function (y) {
      groups[y].sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      return { name: y, posts: groups[y] };
    });

  const categories = collectCategories(posts);
  writeHtml(path.join(cfg.outputDir, 'index.html'), tpl.indexPage(cfg, years, categories));
  console.log('  生成目录: index.html');

  copyTheme();
  console.log('  已同步主题资源 -> ' + cfg.outputDir);
}

// 监听 posts/ 增量重建；package.json 的 `npm run dev` 依赖这个能力
function watch() {
  let timer = null;
  const rebuild = () => {
    clearTimeout(timer);
    // 编辑器保存往往会连续触发多次事件，合并成一次构建
    timer = setTimeout(() => {
      console.log('检测到变更，重新构建...');
      try {
        build();
      } catch (err) {
        console.error('构建失败: ' + err.message);
      }
    }, 150);
  };

  try {
    // Node 20+ 支持 recursive；Node 16/18 会抛错，走下面的兜底
    fs.watch(cfg.postsDir, { recursive: true }, rebuild);
  } catch (err) {
    if (!fs.existsSync(cfg.postsDir)) return;
    fs.readdirSync(cfg.postsDir).forEach(function (name) {
      const dir = path.join(cfg.postsDir, name);
      if (fs.statSync(dir).isDirectory()) fs.watch(dir, rebuild);
    });
  }
}

if (require.main === module) {
  console.log('构建博客...');
  build();
  console.log('完成。');
  if (process.argv.includes('--watch')) {
    console.log('监听 posts/ 变化（Ctrl+C 退出）...');
    watch();
  }
}

module.exports = { build: build, watch: watch, parsePost: parsePost };
