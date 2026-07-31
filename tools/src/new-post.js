'use strict';

// 新建文章工具：交互式或参数式创建 posts/<year>/<slug>.md
// 支持插入图片：可直接把本地图片复制进 posts/<year>/images/ 并写入 Markdown 图片语法。
//
// 用法：
//   node src/new-post.js                                  # 交互式问答
//   node src/new-post.js --title "标题" --date 2026-08-01  # 参数式
//   参数式可选： --slug 8.1 --excerpt "摘要(覆盖自动前15字)" --tag "8月1日"
//               --image "D:\pic\a.png"                    # 可重复多次
//               --image "D:\pic\b.png|图片说明"            # 竖线后为图注
//               --open                                    # 创建后用系统默认程序打开

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFile } = require('child_process');
const cfg = require('./config');

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.bmp'];

function parseArgs(argv) {
  const out = { images: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'open') { out.open = true; continue; }
    const val = argv[++i];
    if (val === undefined) continue;
    if (key === 'image' || key === 'img') out.images.push(val);
    else out[key] = val;
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

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

// 日期 -> doc 风格的 slug 与日期标签：2026-07-21 => "7.21" / "7月21日"
function deriveFromDate(dateStr) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr);
  if (!m) return null;
  const year = m[1], month = parseInt(m[2], 10), day = parseInt(m[3], 10);
  return { year: year, slug: month + '.' + day, dateTag: month + '月' + day + '日' };
}

// 把一张本地图片复制进 posts/<year>/images/，返回文章中可用的相对路径
function importImage(srcPath, yearDir, usedNames) {
  const abs = path.resolve(srcPath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw new Error('图片不存在: ' + srcPath);
  }
  const ext = path.extname(abs).toLowerCase();
  if (IMAGE_EXT.indexOf(ext) === -1) {
    throw new Error('不支持的图片格式: ' + ext);
  }
  const imgDir = path.join(yearDir, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  let base = path.basename(abs, ext)
    .replace(/[^\w\u4e00-\u9fa5.-]+/g, '-')
    .replace(/^[.\-]+/, '');            // 去掉开头的点/横线，避免生成隐藏文件
  if (!base) base = 'image';
  let name = base + ext;
  let n = 1;
  while (usedNames.has(name) || fs.existsSync(path.join(imgDir, name))) {
    name = base + '-' + (++n) + ext;
  }
  usedNames.add(name);
  fs.copyFileSync(abs, path.join(imgDir, name));
  return 'images/' + name;
}

// 生成 Markdown 图片块：独立成行时构建器会渲染成 doc 的 div.my-8 图片结构
function imageMarkdown(relPath, caption) {
  const alt = caption || '';
  return caption
    ? '![' + alt + '](' + relPath + ' "' + caption.replace(/"/g, '') + '")'
    : '![](' + relPath + ')';
}

function buildMarkdown(meta, imageBlocks) {
  const fm = [
    '---',
    'title: ' + meta.title,
    'date: ' + meta.date,
    'slug: ' + meta.slug,
    'dateTag: ' + meta.dateTag,
  ];
  if (meta.excerpt) fm.push('excerpt: ' + meta.excerpt); // 不写则构建时自动取正文前 15 字
  fm.push('---', '');

  const body = [];
  if (meta.body) {
    body.push(meta.body.trim(), '');
  } else {
    body.push('在这里写正文。段落之间空一行。', '');
    body.push('> 引用块像这样书写。', '');
  }

  imageBlocks.forEach(function (b) { body.push(b, ''); });

  if (!meta.body) {
    body.push('插入图片的写法（单独占一行会渲染成居中大图 + 图注）：', '');
    body.push('![替代文字](images/示例.png "图注文字")', '');
  }

  return fm.concat(body).join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const interactive = !args.title;

  let rl = null;
  if (interactive) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }

  const title = args.title || await ask(rl, '文章标题', '未命名文章');
  const date = args.date || (interactive ? await ask(rl, '发布日期 YYYY-MM-DD', todayStr()) : todayStr());

  const derived = deriveFromDate(date);
  if (!derived) {
    if (rl) rl.close();
    console.error('日期格式不正确，应为 YYYY-MM-DD，例如 2026-08-01');
    process.exit(1);
  }

  const slug = args.slug || (interactive ? await ask(rl, '文件名 slug', derived.slug) : derived.slug);
  const dateTag = args.tag || (interactive ? await ask(rl, '目录页日期标签', derived.dateTag) : derived.dateTag);
  // 摘要默认取正文前 15 字（由构建器自动完成），仅在显式传 --excerpt 时覆盖
  const excerpt = args.excerpt || '';

  // 收集图片
  const imageInputs = args.images.slice();
  if (interactive) {
    console.log('\n添加图片：输入本地图片路径后回车（可加 "|图注"），直接回车结束。');
    for (;;) {
      const line = await ask(rl, '  图片路径', '');
      if (!line) break;
      imageInputs.push(line);
    }
  }
  if (rl) rl.close();

  const yearDir = path.join(cfg.postsDir, derived.year);
  fs.mkdirSync(yearDir, { recursive: true });

  const target = path.join(yearDir, slug + '.md');
  if (fs.existsSync(target)) {
    console.error('文章已存在: ' + target);
    process.exit(1);
  }

  const used = new Set();
  const imageBlocks = [];
  imageInputs.forEach(function (raw) {
    const parts = raw.split('|');
    const p = parts[0].trim().replace(/^["']|["']$/g, '');
    const caption = (parts[1] || '').trim();
    try {
      const rel = importImage(p, yearDir, used);
      imageBlocks.push(imageMarkdown(rel, caption));
      console.log('  已导入图片: ' + rel);
    } catch (e) {
      console.error('  跳过图片(' + e.message + ')');
    }
  });

  const content = buildMarkdown({
    title: title, date: date, slug: slug, dateTag: dateTag,
    excerpt: excerpt, body: args.body,
  }, imageBlocks);

  fs.writeFileSync(target, content, 'utf8');
  console.log('\n已创建: ' + path.relative(path.resolve(__dirname, '..'), target));
  console.log('接下来编辑正文，然后运行: npm run build');

  if (args.open) {
    const cmd = process.platform === 'win32' ? 'notepad' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    execFile(cmd, [target], function () {});
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.message); process.exit(1); });
}

module.exports = { importImage: importImage, imageMarkdown: imageMarkdown, deriveFromDate: deriveFromDate };
