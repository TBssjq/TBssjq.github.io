// 构建验证：把站点生成到预览目录，再与仓库 doc/ 逐字节比对。
// 用法： node src/verify.js   或   npm run verify
// 退出码 0 = 与 doc 完全一致；1 = 存在差异。
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const TOOLS_DIR = path.join(__dirname, '..'); // tools/
const ROOT = path.join(TOOLS_DIR, '..');       // 仓库根
const DOC_DIR = path.join(ROOT, 'doc');
const PREVIEW = path.join(TOOLS_DIR, '.verify-preview');

// 1) 清理并构建到预览目录
if (fs.existsSync(PREVIEW)) fs.rmSync(PREVIEW, { recursive: true, force: true });
process.env.BLOG_OUT = PREVIEW;
execFileSync('node', [path.join(TOOLS_DIR, 'src', 'build.js')], { stdio: 'inherit' });
delete process.env.BLOG_OUT;

// 2) 收集 doc/ 下所有需要比对的文件（与 build 输出同源）
const CHECK = [
  'index.html',
  'article.css',
  'article.js',
  'index.css',
  'index.js',
];
fs.readdirSync(path.join(DOC_DIR, '2026')).forEach((f) => {
  if (f.endsWith('.html')) CHECK.push(path.join('2026', f));
});

// 3) 逐字节比对
let diffs = 0;
for (const rel of CHECK) {
  const a = path.join(DOC_DIR, rel);
  const b = path.join(PREVIEW, rel);
  if (!fs.existsSync(a) || !fs.existsSync(b)) {
    console.log('MISSING   ' + rel);
    diffs++;
    continue;
  }
  const same = fs.readFileSync(a).equals(fs.readFileSync(b));
  console.log((same ? 'IDENTICAL  ' : 'DIFF       ') + rel);
  if (!same) diffs++;
}

// 4) 清理预览目录
fs.rmSync(PREVIEW, { recursive: true, force: true });

if (diffs > 0) {
  console.log('\n存在 ' + diffs + ' 处差异。运行 `npm run build` 可将 doc/ 同步为最新生成结果。');
  process.exit(1);
} else {
  console.log('\n全部与 doc/ 逐字节一致。');
  process.exit(0);
}
