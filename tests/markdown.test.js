const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const md = require('../tools/src/markdown');

/* ── 工具 ── */

// 取出第一个代码块的正文
function firstCode(html) {
  const m = /<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/.exec(html);
  return m ? m[1] : null;
}

// 逐个取出代码块正文（避免贪婪匹配跨越多个块）
function eachCode(html, fn) {
  const re = /<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/g;
  let m;
  while ((m = re.exec(html))) fn(m[1]);
}

function render(markdown) {
  return md.render(markdown.join('\n'));
}

function stripFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? m[2] : raw;
}

/* ══════════════════════════════════════════════════════════════
   回归：块级重排版不得破坏「空白敏感」的内容（代码块）
   —— 曾经的 bug：render() 会给块内每一行加 20 空格基准缩进，
      而 <pre> 是 white-space: pre，代码于是整体右移。
   ══════════════════════════════════════════════════════════════ */

test('顶层代码块：正文逐字节保留（含缩进 / 空行 / 行尾空格 / tab）', () => {
  const code = 'void f(int x) {\n    x = 99;\n}\n\nint main() {\n    int a = 1;\n}';
  const html = render(['```c', code, '```']);
  assert.equal(firstCode(html), code);
});

test('代码块：tab 与行尾空格不被改写', () => {
  const code = 'a\tb\nc   \n\nd';
  assert.equal(firstCode(render(['```text', code, '```'])), code);
});

test('列表项内的缩进代码块：按围栏缩进正确去缩进', () => {
  const html = render([
    '- 说明：',
    '  ```js',
    '  const a = 1;',
    '      indented',
    '  const b = 2;',
    '  ```',
    '  后面一段',
  ]);
  assert.equal(firstCode(html), 'const a = 1;\n    indented\nconst b = 2;');
  assert.match(html, /<li>/, '应仍在同一个列表项内');
});

test('引用块内的代码块同样保留原样', () => {
  const html = render(['> 引用', '> ```c', '> int x;', '>     int y;', '> ```']);
  assert.equal(firstCode(html), 'int x;\n    int y;');
});

test('空代码块', () => {
  assert.equal(firstCode(render(['```', '```'])), '');
});

test('4 个反引号的围栏：闭合不被误吞（代码里可含 ```）', () => {
  const html = render(['````md', '```js', 'x', '```', '````', '', '后续段落']);
  assert.equal(firstCode(html), '```js\nx\n```');
  assert.match(html, /后续段落/, '围栏后的内容不应被吞掉');
});

test('波浪号围栏 ~~~ 同样支持', () => {
  const html = render(['~~~python', 'print(1)', '~~~']);
  assert.equal(firstCode(html), 'print(1)');
  assert.match(html, /data-lang="python"/);
});

test('代码块中绝不出现占位符残留，也不出现基准缩进', () => {
  const html = render(['- a', '  ```c', '  int x;', '  ```', '> ```c', '> int y;', '> ```']);
  assert.doesNotMatch(html, /\u0000/, '不应泄漏内部占位符');
  eachCode(html, (body) => {
    assert.doesNotMatch(body, /\n {20,}\S/, '代码块内不应出现 20 空格基准缩进');
  });
});

/* ══════════════════════════════════════════════════════════════
   其它结构与转义
   ══════════════════════════════════════════════════════════════ */

test('表格：行内代码里的竖线不当作分隔符', () => {
  const html = render(['| a | b |', '|---|---|', '| `x|y` | 2 |']);
  const cells = html.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [];
  assert.equal(cells.length, 2, '应只有 2 个单元格');
  assert.match(html, /<code>x\|y<\/code>/);
});

test('表格对齐标记生成对应 class', () => {
  const html = render(['| 左 | 中 | 右 |', '|:---|:--:|---:|', '| 1 | 2 | 3 |']);
  assert.match(html, /class="is-left"/);
  assert.match(html, /class="is-center"/);
  assert.match(html, /class="is-right"/);
});

test('任务列表 / 硬换行 / 标题锚点唯一', () => {
  const html = render(['- [x] 已完成', '- [ ] 待办', '', '第一行  ', '第二行', '', '## 标题', '## 标题']);
  assert.match(html, /class="task-list"/);
  assert.match(html, /checked/);
  assert.match(html, /<br>/, '行尾两空格应产生硬换行');
  assert.match(html, /id="标题"/);
  assert.match(html, /id="标题-2"/);
});

test('嵌套列表结构正确', () => {
  const html = render(['- 外层', '  - 内层', '- 外层2']);
  assert.equal((html.match(/<ul/g) || []).length, 2, '应有内外两层列表');
});

test('属性值转义：URL 里的引号不会跳出属性', () => {
  const html = render(['![x](a"onerror="alert(1))', '', '[点我](b"onmouseover="x)']);
  assert.doesNotMatch(html, /onerror="/, '不应产生注入出来的属性');
  assert.doesNotMatch(html, /onmouseover="/);
  assert.match(html, /&quot;/);
});

test('正文标题整体降一级并带锚点', () => {
  assert.match(render(['# 一级']), /<h2 id="一级">/);
  assert.match(render(['## 二级']), /<h3 id="二级">/);
  assert.match(render(['### 三级']), /<h4 id="三级">/);
});

/* ══════════════════════════════════════════════════════════════
   全量文章体检：任何一篇的代码块都不应被重排版污染
   ══════════════════════════════════════════════════════════════ */

test('全部文章：代码块无占位符残留、无基准缩进污染', () => {
  const dir = path.join(__dirname, '..', 'tools', 'posts');
  const files = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.md')) files.push(full);
    });
  })(dir);

  assert.ok(files.length > 0, '应当能扫描到文章');

  files.forEach((file) => {
    const html = md.render(stripFrontmatter(fs.readFileSync(file, 'utf8')));
    const rel = path.relative(path.join(__dirname, '..'), file);
    assert.doesNotMatch(html, /\u0000/, rel + ' 泄漏了内部占位符');
    eachCode(html, (body) => {
      assert.doesNotMatch(body, /\n {20,}\S/, rel + ' 的代码块出现 20 空格基准缩进');
    });
  });
});
