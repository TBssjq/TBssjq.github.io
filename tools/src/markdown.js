'use strict';

// 极简 Markdown 解析器（零依赖），输出对齐 doc/article.css 的 .prose 约定。
// 输出排版严格对齐 doc/2026/*.html 手写风格：
//   - 正文块统一缩进 20 空格（位于 .article-body 内层）
//   - 块与块之间空一行
//   - 图片块 / 引用块等多行结构逐层缩进

const PAD = '                    '; // 20 空格：doc 正文块的基准缩进

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 行内格式：先转义，再处理 行内代码 / 粗体 / 斜体 / 链接 / 图片
function inline(text) {
  const codes = [];
  text = text.replace(/`([^`]+)`/g, function (_, c) {
    codes.push(c);
    return '\u0000' + (codes.length - 1) + '\u0000';
  });

  text = escapeHtml(text);

  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    function (_, alt, src, title) {
      return '<img src="' + src + '" alt="' + alt + '"' +
        (title ? ' title="' + title + '"' : '') + ' loading="lazy">';
    });

  // 链接：URL 允许成对括号（如 https://x.com/a/b(c)），避免被第一个 ) 截断
  text = text.replace(/\[([^\]]+)\]\(((?:\([^)]*\)|[^()])+)\)/g,
    function (_, t, url) { return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'; });

  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  text = text.replace(/\u0000(\d+)\u0000/g, function (_, i) { return '<code>' + escapeHtml(codes[+i]) + '</code>'; });
  return text;
}

// 把多行片段整体缩进到正文基准位置
function indentBlock(lines, extra) {
  const pad = PAD + (extra || '');
  return lines.map(function (l) { return l === '' ? '' : pad + l; }).join('\n');
}

function render(mdText) {
  const lines = mdText.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  function pushList(items, ordered) {
    if (!items.length) return;
    const tag = ordered ? 'ol' : 'ul';
    const body = ['<' + tag + '>']
      .concat(items.map(function (li) { return '    <li>' + inline(li) + '</li>'; }))
      .concat(['</' + tag + '>']);
    blocks.push(indentBlock(body));
  }

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1] || '';
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { body.push(lines[i]); i++; }
      i++;
      const code = escapeHtml(body.join('\n'));
      blocks.push(indentBlock([
        '<div class="code-block">',
        '    <button class="copy-btn" aria-label="复制代码">',
        '        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
        '            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>',
        '        </svg>',
        '    </button>',
        '    <pre data-lang="' + lang + '"><code>' + code + '</code></pre>',
        '</div>',
      ]));
      continue;
    }

    // 标题
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const tag = level === 1 ? 'h2' : 'h' + level;
      blocks.push(indentBlock(['<' + tag + '>' + inline(h[2]) + '</' + tag + '>']));
      i++; continue;
    }

    // 分隔线
    if (/^---+\s*$/.test(line)) { blocks.push(indentBlock(['<hr>'])); i++; continue; }

    // 引用块
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      const body = ['<blockquote>']
        .concat(buf.filter(function (t) { return t.trim() !== ''; })
                   .map(function (t) { return '    <p>' + inline(t) + '</p>'; }))
        .concat(['</blockquote>']);
      blocks.push(indentBlock(body));
      continue;
    }

    // 无序列表
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      pushList(buf, false); continue;
    }

    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      pushList(buf, true); continue;
    }

    // 独立图片块 ![alt](src "说明") —— 复刻 doc/2026/4.24.html 的 div.my-8 结构
    const imgLine = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/);
    if (imgLine) {
      const alt = imgLine[1], src = imgLine[2], cap = imgLine[3];
      const body = [
        '<div class="my-8">',
        '    <img src="' + src + '" alt="' + alt + '" class="w-full rounded-xl shadow-lg" loading="lazy">',
      ];
      if (cap) body.push('    <p class="text-center text-sm text-gray-400 mt-2 no-dropcap">' + escapeHtml(cap) + '</p>');
      body.push('</div>');
      blocks.push(indentBlock(body));
      i++; continue;
    }

    // 空行
    if (line.trim() === '') { i++; continue; }

    // 段落
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^```/.test(lines[i]) && !/^#{1,3}\s/.test(lines[i]) &&
           !/^>\s?/.test(lines[i]) && !/^---+\s*$/.test(lines[i]) &&
           !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) &&
           !/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    if (para.length) blocks.push(indentBlock(['<p>' + para.map(inline).join('<br>') + '</p>']));
  }

  // doc 手写文章里，块与块之间空一行
  return blocks.join('\n\n');
}

module.exports = { render: render, escapeHtml: escapeHtml, inline: inline, PAD: PAD };
