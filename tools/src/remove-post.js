'use strict';

// 删除文章工具：删除 posts/<year>/<slug>.md 对应的源文件与已生成产物，
// 并重新构建目录页（确保 doc/ 不再引用该文章）。
//
// 用法：
//   node src/remove-post.js                              # 交互式选择要删除的文章
//   node src/remove-post.js --slug 8.1                   # 按 slug 删除（自动定位年份）
//   node src/remove-post.js --year 2026 --slug 8.1       # 精确指定年份
//   node src/remove-post.js --slug 8.1 --no-build        # 只删除源与产物，不重新构建
//   node src/remove-post.js --dry                         # 预览将删除哪些文件，不实际删除
//
// 删除范围：
//   1. posts/<year>/<slug>.md（源文件）
//   2. doc/<year>/<slug>.html（已生成文章页，BLOG_OUT 覆盖时指向对应输出目录）
//   3. 若该年除 images/ 等资产外再无其它 .md，可加 --purge-year 一并删除整年目录
//   4. 重新运行构建，刷新 doc/index.html 目录页

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const cfg = require('./config');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'no-build' || key === 'dry' || key === 'purge-year') { out[key] = true; continue; }
    const val = argv[++i];
    if (val !== undefined) out[key] = val;
  }
  return out;
}

function ask(rl, question, fallback) {
  return new Promise(function (resolve) {
    const hint = fallback ? ' (' + fallback + ')' : '';
    rl.question(question + hint + ': ', function (ans) {
      resolve((ans || '').trim() || fallback || '');
    });
  });
}

// 扫描所有文章源文件，返回 [{year, slug, file, title}]
function listPosts() {
  const posts = [];
  if (!fs.existsSync(cfg.postsDir)) return posts;
  fs.readdirSync(cfg.postsDir).forEach(function (yearDir) {
    const yearPath = path.join(cfg.postsDir, yearDir);
    if (!fs.statSync(yearPath).isDirectory()) return;
    fs.readdirSync(yearPath).forEach(function (file) {
      if (!file.endsWith('.md')) return;
      const slug = file.slice(0, -3);
      const full = path.join(yearPath, file);
      let title = slug;
      try {
        const raw = fs.readFileSync(full, 'utf8');
        const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (m) {
          const tm = /title:\s*(.+)/.exec(m[1]);
          if (tm) title = tm[1].trim();
        }
      } catch (e) { /* 忽略读取失败，标题回退为 slug */ }
      posts.push({ year: yearDir, slug: slug, file: full, title: title });
    });
  });
  return posts;
}

// 删除文件或空目录（递归向上清理空目录）
function removeFile(file) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('  删除源文件: ' + path.relative(path.resolve(__dirname, '..'), file));
  }
}

function removeOutput(year, slug, dry) {
  const outHtml = path.join(cfg.outputDir, year, slug + '.html');
  const rel = path.relative(path.resolve(__dirname, '..'), outHtml);
  if (fs.existsSync(outHtml)) {
    if (dry) { console.log('  [dry] 将删除产物: ' + rel); return; }
    fs.unlinkSync(outHtml);
    console.log('  删除产物: ' + rel);
  } else {
    console.log('  产物不存在（跳过）: ' + rel);
  }
}

// 该年是否还有其它 .md（用于判断是否可清理整年目录）
function yearHasOtherMd(year, exceptSlug) {
  const yearPath = path.join(cfg.postsDir, year);
  if (!fs.existsSync(yearPath)) return false;
  return fs.readdirSync(yearPath).some(function (f) {
    return f.endsWith('.md') && f.slice(0, -3) !== exceptSlug;
  });
}

function emptyDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(function (name) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) emptyDirRecursive(p);
    else fs.unlinkSync(p);
  });
  fs.rmdirSync(dir);
}

async function runBuild(dry) {
  if (dry) { console.log('  [dry] 跳过重新构建'); return; }
  console.log('重新构建以刷新目录页...');
  try {
    require('./build').build();
  } catch (e) {
    // build.js 可能未导出 build，则用子进程方式
    const { execFileSync } = require('child_process');
    execFileSync(process.execPath, [path.join(__dirname, 'build.js')], { stdio: 'inherit' });
  }
  console.log('完成。doc/index.html 已更新。');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const posts = listPosts();

  if (posts.length === 0) {
    console.log('没有可删除的文章（posts/ 下为空）。');
    return;
  }

  let target = null;

  if (args.slug) {
    // 按 slug（可选配合 --year）定位
    const matches = posts.filter(function (p) {
      return p.slug === args.slug && (!args.year || p.year === args.year);
    });
    if (matches.length === 0) {
      console.error('未找到匹配文章: slug=' + args.slug + (args.year ? ' year=' + args.year : ''));
      process.exit(1);
    }
    if (matches.length > 1) {
      console.error('发现多个匹配，请用 --year 精确指定。候选：');
      matches.forEach(function (p) { console.error('  ' + p.year + '/' + p.slug + '  (' + p.title + ')'); });
      process.exit(1);
    }
    target = matches[0];
  } else {
    // 交互式选择
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('选择要删除的文章：');
    posts.forEach(function (p, i) {
      console.log('  [' + (i + 1) + '] ' + p.year + '/' + p.slug + '  ' + p.title);
    });
    const idx = parseInt(await ask(rl, '输入序号', ''), 10);
    rl.close();
    if (!Number.isInteger(idx) || idx < 1 || idx > posts.length) {
      console.error('无效序号。');
      process.exit(1);
    }
    target = posts[idx - 1];
  }

  console.log('\n将要删除：');
  console.log('  源文件: ' + path.relative(path.resolve(__dirname, '..'), target.file));
  removeOutput(target.year, target.slug, args.dry);
  if (args.purgeYear && !yearHasOtherMd(target.year, target.slug) && !args.dry) {
    const yearPath = path.join(cfg.postsDir, target.year);
    console.log('  清理空年份目录: ' + path.relative(path.resolve(__dirname, '..'), yearPath));
    emptyDirRecursive(yearPath);
    const outYear = path.join(cfg.outputDir, target.year);
    if (fs.existsSync(outYear)) emptyDirRecursive(outYear);
  }

  if (args.dry) {
    const rel = path.relative(path.resolve(__dirname, '..'), target.file);
    console.log('  [dry] 将删除源文件: ' + rel);
    if (args.purgeYear && !yearHasOtherMd(target.year, target.slug)) {
      console.log('  [dry] 将清理空年份目录: ' + target.year);
    }
    console.log('  [dry] 未实际删除源文件与重新构建。');
    return;
  }

  removeFile(target.file);

  if (args.noBuild) {
    console.log('已按 --no-build 跳过重新构建。记得稍后运行 npm run build 刷新目录页。');
    return;
  }

  await runBuild(false);
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.message); process.exit(1); });
}

module.exports = { listPosts: listPosts };
