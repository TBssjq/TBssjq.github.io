'use strict';

/* ══════════════════════════════════════════════════════════════════════
   极简 Markdown 解析器（零依赖，可复用）

   公开 API：
     render(mdText)        → HTML 字符串（对齐 doc/ 的 .prose 排版与缩进约定）
     inline(text)          → 行内 HTML
     escapeHtml(text)      → 转义
     slugify(text)         → 由标题文本生成锚点 id
     PAD                   → 正文块基准缩进（20 空格）

   支持：标题 h1–h6、段落与硬换行、有序/无序/嵌套/任务列表、代码块（含语言、
   列表内缩进代码块）、引用块（可含子块）、GFM 表格（含对齐）、分隔线、
   图片（含图注）、链接与自动链接、粗体/斜体/删除线/行内代码。
   ══════════════════════════════════════════════════════════════════════ */

const PAD = '                    '; // 20 空格：doc 正文块的基准缩进

/* ── 基础工具 ── */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// escapeHtml 不处理引号；URL / alt 里出现 " 就会跳出属性、破坏结构。
// 值若已过 escapeHtml，这里只补引号，避免 & 被二次转义。
function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 按 n 个空格整体缩进（空行保持为空）
function indentText(text, n) {
  const pad = new Array(n + 1).join(' ');
  return String(text).split('\n').map(function (l) { return l === '' ? '' : pad + l; }).join('\n');
}

// 由标题生成锚点 id（保留中文，去标点，重复时追加序号）
const slugCount = new Map();
function slugify(text) {
  let t = String(text)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[*_~]/g, '')
    .replace(/[!\[\]()]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!t) t = 'section';
  const n = (slugCount.get(t) || 0) + 1;
  slugCount.set(t, n);
  return n > 1 ? t + '-' + n : t;
}

/* ── 行内格式 ── */

function inline(text) {
  const codes = [];

  // 行内代码先摘出，避免其中的 * _ [ ] | 被当作标记
  text = String(text).replace(/`([^`]+)`/g, function (_, c) {
    codes.push(c);
    return '\u0000' + (codes.length - 1) + '\u0000';
  });

  text = escapeHtml(text);

  // 图片 ![alt](src "title")
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    function (_, alt, src, title) {
      return '<img src="' + escapeAttr(src) + '" alt="' + escapeAttr(alt) + '"' +
        (title ? ' title="' + escapeAttr(title) + '"' : '') + ' loading="lazy">';
    });

  // 链接 [text](url)（URL 允许成对括号）
  text = text.replace(/\[([^\]]+)\]\(((?:\([^)]*\)|[^()])+)\)/g,
    function (_, t, url) {
      return '<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
    });

  // 自动链接 <https://…>
  text = text.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, function (_, url) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
  });

  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, '$1<em>$2</em>');

  // 还原行内代码
  text = text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
    return '<code>' + escapeHtml(codes[+i]) + '</code>';
  });
  return text;
}

/* ── 块级识别 ── */

const FENCE = /^(\s*)(`{3,}|~{3,})\s*(.*?)\s*$/;
const HEADING = /^(\s*)(#{1,6})\s+(.*?)\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s*>\s?(.*)$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

function splitRow(line) {
  let s = String(line).trim();
  if (s.charAt(0) === '|') s = s.slice(1);
  if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let inCode = false;
  for (let k = 0; k < s.length; k++) {
    const ch = s.charAt(k);
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) { cells.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur);
  return cells.map(function (c) { return c.trim(); });
}

function isTableDelim(line) {
  const s = String(line).trim();
  if (!s || s.indexOf('-') === -1) return false;
  if (!/^[|\s:-]+$/.test(s)) return false;
  return splitRow(s).every(function (c) { return /^:?-+:?$/.test(c); });
}

function cellAlign(cell) {
  const c = String(cell).trim();
  const l = c.charAt(0) === ':';
  const r = c.charAt(c.length - 1) === ':';
  if (l && r) return 'is-center';
  if (r) return 'is-right';
  if (l) return 'is-left';
  return '';
}

function isBlockStart(line, next) {
  if (FENCE.test(line)) return true;
  if (HEADING.test(line)) return true;
  if (HR.test(line)) return true;
  if (QUOTE.test(line)) return true;
  if (LIST_ITEM.test(line)) return true;
  if (line.indexOf('|') !== -1 && next !== undefined && isTableDelim(next)) return true;
  return false;
}

/* ── 各类块渲染 ── */

// 代码正文先寄存，等整体缩进结束后再替换回来。
// 否则 indentText 会把代码里的每个换行都当成「新行」并加上基准缩进，
// 而 white-space: pre 会把这些空格原样显示 —— 页面上代码就会整体右移。
const codeBodies = [];

function codeBlock(lang, code) {
  const token = '\u0000CODE' + (codeBodies.push(escapeHtml(code)) - 1) + '\u0000';
  return [
    '<div class="code-block">',
    '    <button class="copy-btn" aria-label="复制代码">',
    '        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>',
    '        </svg>',
    '    </button>',
    '    <pre' + (lang ? ' data-lang="' + escapeAttr(escapeHtml(lang)) + '"' : '') + '><code>' + token + '</code></pre>',
    '</div>',
  ].join('\n');
}

function heading(level, text) {
  const tag = 'h' + Math.min(level + 1, 6); // 页面已有 h1 标题，正文标题整体降一级
  return '<' + tag + ' id="' + slugify(text) + '">' + inline(text) + '</' + tag + '>';
}

function figure(alt, src, cap) {
  const body = [
    '<figure class="md-figure">',
    '    <img src="' + escapeAttr(src) + '" alt="' + escapeAttr(alt) + '" loading="lazy">',
  ];
  if (cap) body.push('    <figcaption>' + inline(cap) + '</figcaption>');
  body.push('</figure>');
  return body.join('\n');
}

function paragraph(lines) {
  const parts = lines.map(function (raw) {
    let l = raw;
    let hard = false;
    if (/\\$/.test(l)) { l = l.replace(/\\+$/, ''); hard = true; }
    else if (/ {2,}$/.test(l)) { l = l.replace(/ +$/, ''); hard = true; }
    return { html: inline(l), hard: hard };
  });
  let out = '';
  for (let k = 0; k < parts.length; k++) {
    if (k > 0) out += parts[k - 1].hard ? '<br>' : '\n';
    out += parts[k].html;
  }
  return '<p>' + out + '</p>';
}

function table(header, aligns, rows) {
  const th = header.map(function (c, k) {
    const a = aligns[k] ? ' class="' + aligns[k] + '"' : '';
    return '                <th' + a + '>' + inline(c) + '</th>';
  });
  const body = rows.map(function (r) {
    const tds = header.map(function (_, k) {
      const a = aligns[k] ? ' class="' + aligns[k] + '"' : '';
      return '                <td' + a + '>' + inline(r[k] === undefined ? '' : r[k]) + '</td>';
    });
    return '            <tr>\n' + tds.join('\n') + '\n            </tr>';
  });
  return [
    '<div class="table-wrap">',
    '    <table>',
    '        <thead>',
    '            <tr>',
    th.join('\n'),
    '            </tr>',
    '        </thead>',
    '        <tbody>',
    body.join('\n'),
    '        </tbody>',
    '    </table>',
    '</div>',
  ].join('\n');
}

function renderItem(content) {
  let task = null;
  const tm = /^\[([ xX])\]\s*(.*)$/.exec(content[0] || '');
  if (tm) {
    task = tm[1].toLowerCase() === 'x';
    content = content.slice();
    content[0] = tm[2];
  }

  const blocks = parseBlocks(content, 0, content.length);
  const check = task === null
    ? ''
    : '<input class="task-check" type="checkbox" disabled' + (task ? ' checked' : '') + '> ';

  if (blocks.length === 1 && /^<p>[\s\S]*<\/p>$/.test(blocks[0])) {
    return '<li>' + check + blocks[0].replace(/^<p>/, '').replace(/<\/p>$/, '') + '</li>';
  }
  if (blocks.length === 0) return '<li>' + check + '</li>';
  return '<li>' + check + '\n' + blocks.map(function (b) { return indentText(b, 4); }).join('\n') + '\n</li>';
}

function parseList(lines, start, end) {
  const first = LIST_ITEM.exec(lines[start]);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let i = start;

  while (i < end) {
    const m = LIST_ITEM.exec(lines[i]);
    if (!m || m[1].length !== baseIndent) break;
    if (/\d/.test(m[2]) !== ordered) break;

    const contentIndent = baseIndent + m[2].length + 1;
    const content = [m[3]];
    i++;

    while (i < end) {
      const l = lines[i];
      if (l.trim() === '') {
        let j = i + 1;
        while (j < end && lines[j].trim() === '') j++;
        if (j >= end) { i = j; break; }
        const nx = lines[j];
        const nxInd = /^\s*/.exec(nx)[0].length;
        const nxIsItem = LIST_ITEM.test(nx) && nxInd === baseIndent;
        if (nxIsItem) { i = j; break; }                 // 松散列表：空行分隔
        if (nxInd > baseIndent) { content.push(''); i++; continue; }
        i = j; break;
      }
      const ind = /^\s*/.exec(l)[0].length;
      if (ind >= contentIndent) { content.push(l.slice(contentIndent)); i++; continue; }
      if (ind > baseIndent) { content.push(l.slice(ind)); i++; continue; }
      break;
    }
    items.push(content);
  }

  const hasTask = items.some(function (c) { return /^\[[ xX]\]\s/.test(c[0] || ''); });
  const tag = ordered ? 'ol' : 'ul';
  let open = '<' + tag;
  if (ordered && startNum !== 1) open += ' start="' + startNum + '"';
  if (hasTask) open += ' class="task-list"';
  open += '>';

  const lis = items.map(function (c) { return indentText(renderItem(c), 4); });
  return { html: open + '\n' + lis.join('\n') + '\n</' + tag + '>', next: i };
}

function parseTable(lines, start, end) {
  const header = splitRow(lines[start]);
  const aligns = splitRow(lines[start + 1]).map(cellAlign);
  const rows = [];
  let i = start + 2;
  while (i < end && lines[i].trim() !== '' && lines[i].indexOf('|') !== -1) {
    rows.push(splitRow(lines[i]));
    i++;
  }
  return { html: table(header, aligns, rows), next: i };
}

/* ── 块级主循环 ── */

function parseBlocks(lines, start, end) {
  const out = [];
  let i = start;

  while (i < end) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // 代码块（允许缩进：常见于列表项内部）
    const fence = FENCE.exec(line);
    if (fence) {
      const fenceIndent = fence[1].length;
      const marker = fence[2];
      const ch = marker.charAt(0);
      const lang = fence[3] || '';
      // 闭合围栏必须是同一种字符、且长度不少于开启围栏（CommonMark）
      const closeRe = new RegExp('^\\s*' + (ch === '~' ? '~' : '`') + '{' + marker.length + ',}\\s*$');
      const body = [];
      i++;
      while (i < end) {
        if (closeRe.test(lines[i])) { i++; break; }
        const lead = /^\s*/.exec(lines[i])[0].length;
        body.push(lines[i].slice(Math.min(fenceIndent, lead)));
        i++;
      }
      out.push(codeBlock(lang, body.join('\n')));
      continue;
    }

    // 标题
    const h = HEADING.exec(line);
    if (h) { out.push(heading(h[2].length, h[3])); i++; continue; }

    // 分隔线
    if (HR.test(line)) { out.push('<hr>'); i++; continue; }

    // 引用块（递归解析内部块）
    if (QUOTE.test(line)) {
      const buf = [];
      while (i < end && QUOTE.test(lines[i])) { buf.push(QUOTE.exec(lines[i])[1]); i++; }
      const inner = parseBlocks(buf, 0, buf.length);
      out.push('<blockquote>\n' + inner.map(function (b) { return indentText(b, 4); }).join('\n') + '\n</blockquote>');
      continue;
    }

    // 表格
    if (line.indexOf('|') !== -1 && i + 1 < end && isTableDelim(lines[i + 1])) {
      const res = parseTable(lines, i, end);
      out.push(res.html);
      i = res.next;
      continue;
    }

    // 列表
    if (LIST_ITEM.test(line)) {
      const res = parseList(lines, i, end);
      out.push(res.html);
      i = res.next;
      continue;
    }

    // 独立图片（带图注）
    const imgLine = /^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/.exec(line);
    if (imgLine) {
      out.push(figure(imgLine[1], imgLine[2], imgLine[3]));
      i++;
      continue;
    }

    // 段落
    const para = [];
    while (i < end && lines[i].trim() !== '' &&
           !isBlockStart(lines[i], lines[i + 1])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(paragraph(para));
    else i++;   // 防御：任何情况下都保证指针前进，避免死循环
  }

  return out;
}

/* ── 入口 ── */

function render(mdText) {
  slugCount.clear();
  codeBodies.length = 0;
  const lines = String(mdText == null ? '' : mdText).replace(/\r\n?/g, '\n').split('\n');
  const blocks = parseBlocks(lines, 0, lines.length);
  return blocks
    .map(function (b) { return indentText(b, PAD.length); })
    .join('\n\n')
    .replace(/\u0000CODE(\d+)\u0000/g, function (_, i) { return codeBodies[+i]; });
}

module.exports = {
  render: render,
  inline: inline,
  escapeHtml: escapeHtml,
  escapeAttr: escapeAttr,
  slugify: slugify,
  PAD: PAD,
};
