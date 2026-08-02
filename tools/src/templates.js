'use strict';

const md = require('./markdown');

// 说明：本文件输出的 HTML 必须与 doc/ 下手写页面的排版风格完全一致：
//   - 4 空格缩进，逐层递进
//   - 多属性标签展开成多行（svg / path 等按原样换行）
//   - 块与块之间用空行分隔
// 因此这里统一使用带缩进的模板字符串，不做任何压缩。

const FONTS = [
  '    <link rel="preconnect" href="https://fonts.googleapis.com">',
  '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">',
].join('\n');

// 原 doc 文章页用的 Tailwind 配置（darkMode=class，accent 橙）
// compact=true 时输出早期手写页面的紧凑写法： colors: { accent: '#f97316' }
function tailwindConfig(compact) {
  if (compact) {
    return [
      '    <script>',
      '        tailwind.config = {',
      "            darkMode: 'class',",
      '            theme: {',
      '                extend: {',
      '                    fontFamily: {',
      "                        sans: ['Noto Serif SC', 'PingFang SC', 'system-ui', 'sans-serif'],",
      "                        display: ['ZCOOL KuaiLe', 'cursive'],",
      '                    },',
      "                    colors: { accent: '#f97316' }",
      '                }',
      '            }',
      '        }',
      '    <\/script>',
    ].join('\n');
  }
  return TAILWIND_CONFIG;
}

const TAILWIND_CONFIG = [
  '    <script>',
  '        tailwind.config = {',
  "            darkMode: 'class',",
  '            theme: {',
  '                extend: {',
  '                    fontFamily: {',
  "                        sans: ['Noto Serif SC', 'PingFang SC', 'system-ui', 'sans-serif'],",
  "                        display: ['ZCOOL KuaiLe', 'cursive'],",
  '                    },',
  '                    colors: {',
  "                        accent: '#f97316',",
  '                    }',
  '                }',
  '            }',
  '        }',
  '    <\/script>',
].join('\n');

const SUN_PATH = 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z';
const MOON_PATH = 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z';
const HOME_PATH = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-9V3a1 1 0 00-1-1h-3a1 1 0 00-1 1v9';
const ARROW_PATH = 'M9 5l7 7-7 7';

// ── 文章页 header（复刻 doc/2026/*.html 的 Tailwind 结构）──
function articleHeader(brand) {
  return [
    '    <header class="site-header fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 z-40">',
    '        <div class="h-full flex items-center justify-between px-6">',
    '            <a href="../index.html" class="text-xl font-bold text-gray-900 dark:text-white" target="_blank" rel="noopener noreferrer">' + md.escapeHtml(brand) + '</a>',
    '            <div class="flex items-center gap-3">',
    '                <div class="music-player music-player--top">',
    '                    <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=65546&auto=1&height=66"><\/iframe>',
    '                </div>',
    '                <button id="themeToggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">',
    '                <svg id="sunIcon" class="w-5 h-5 text-gray-600 dark:text-gray-400 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + SUN_PATH + '"/>',
    '                </svg>',
    '                <svg id="moonIcon" class="w-5 h-5 text-gray-600 dark:text-gray-400 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + MOON_PATH + '"/>',
    '                </svg>',
    '            </button>',
    '            </div>',
    '        </div>',
    '    </header>',
  ].join('\n');
}

// ── 目录页 header（复刻 doc/index.html 的语义类结构）──
function indexHeader(brand) {
  return [
    '    <header class="site-header">',
    '        <div class="header-inner">',
    '            <a href="index.html" class="brand">' + md.escapeHtml(brand) + '</a>',
    '            <div class="header-actions">',
    '                <a href="../index.html" class="back-link">',
    '                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + HOME_PATH + '"/>',
    '                    </svg>',
    '                    <span>返回主页</span>',
    '                </a>',
    '                <div class="music-player music-player--top">',
    '                    <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=65546&auto=1&height=66"><\/iframe>',
    '                </div>',
    '                <button id="themeToggle" class="theme-toggle" aria-label="切换主题">',
    '                    <svg id="sunIcon" class="icon sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + SUN_PATH + '"/>',
    '                    </svg>',
    '                    <svg id="moonIcon" class="icon moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + MOON_PATH + '"/>',
    '                    </svg>',
    '                </button>',
    '            </div>',
    '        </div>',
    '    </header>',
  ].join('\n');
}

function articlePage(cfg, post, htmlBody) {
  // 标题后缀：frontmatter 可写 titleSuffix: none 以还原早期页面的纯标题
  const pageTitle = post.titleSuffix === 'none'
    ? md.escapeHtml(post.title)
    : md.escapeHtml(post.title) + ' - ' + md.escapeHtml(cfg.siteTitle);

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '    <title>' + pageTitle + '</title>',
    '    <script src="https://cdn.tailwindcss.com"><\/script>',
    FONTS,
    tailwindConfig(post.compactConfig === 'true' || post.compactConfig === true),
    '    <link rel="stylesheet" href="../article.css">',
    '</head>',
    '<body class="min-h-screen">',
    articleHeader(cfg.brand),
    '',
    '    <main class="pt-16">',
    '        <div class="max-w-3xl mx-auto px-4 py-8 lg:py-12">',
    '            <article>',
    '                <h1 class="article-title text-3xl lg:text-4xl text-center mb-8">' + md.escapeHtml(post.title) + '</h1>',
    '',
    // 注意：doc/ 手写页面此处开标签缩进为 12 空格、闭标签为 16 空格，保持一致
    '            <div class="article-body prose text-gray-700 dark:text-gray-300">',
    htmlBody,
    '                </div>',
    '',
    '                <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">',
    '                    <div class="giscus"></div>',
    '                </div>',
    '                <div class="mt-8">',
    '                    <a href="../index.html" class="btn-back inline-flex items-center gap-2 px-8 py-3.5 text-white rounded-xl font-medium" target="_blank" rel="noopener noreferrer">',
    '                        <span>目录</span>',
    '                        <span class="font-semibold">Go!</span>',
    '                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + ARROW_PATH + '"/>',
    '                        </svg>',
    '                    </a>',
    '                </div>',
    '            </article>',
    '        </div>',
    '    </main>',
    '',
    '    <script src="../article.js" defer><\/script>',
    '',
    '',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function articleCard(year, post) {
  return [
    '                        <article class="article-card">',
    '                            <a href="' + year + '/' + post.slug + '.html" target="_blank" rel="noopener noreferrer">',
    '                                <div class="card-row">',
    '                                    <div class="card-body">',
    '                                        <h3 class="article-card__title">' + md.escapeHtml(post.title) + '</h3>',
    '                                        <p class="article-card__excerpt">' + md.escapeHtml(post.excerpt) + '</p>',
    '                                    </div>',
    '                                    <span class="date-tag">' + md.escapeHtml(post.dateTag) + '</span>',
    '                                </div>',
    '                            </a>',
    '                        </article>',
  ].join('\n');
}

function yearSection(year, posts) {
  return [
    '                <section class="year-section">',
    '                    <h2 class="year-heading">' + year + '</h2>',
    '                    <div class="year-list">',
    posts.map(function (p) { return articleCard(year, p); }).join('\n\n'),
    '                    </div>',
    '                </section>',
  ].join('\n');
}

function comingSection(year) {
  return [
    '                <section class="year-section">',
    '                    <h2 class="year-heading">' + year + '</h2>',
    '                    <div class="year-list">',
    '                        <article class="article-card is-coming">',
    '                            <div class="card-row">',
    '                                <div class="card-body">',
    '                                    <h3 class="article-card__title muted">即将发布</h3>',
    '                                    <p class="article-card__excerpt muted">更多文章即将到来...</p>',
    '                                </div>',
    '                                <span class="date-tag">敬请期待</span>',
    '                            </div>',
    '                        </article>',
    '                    </div>',
    '                </section>',
  ].join('\n');
}

function indexPage(cfg, years) {
  const sections = years
    .map(function (y) { return yearSection(y.name, y.posts); })
    .concat((cfg.comingYears || []).map(comingSection))
    .join('\n\n');

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '    <meta charset="UTF-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '    <title>' + md.escapeHtml(cfg.pageTitle) + ' - ' + md.escapeHtml(cfg.siteTitle) + '</title>',
    FONTS,
    '    <link rel="stylesheet" href="index.css">',
    '</head>',
    '<body>',
    indexHeader(cfg.brand),
    '',
    '    <main class="page-main">',
    '        <div class="page-wrap">',
    '            <div class="page-head">',
    '                <h1 class="page-title">' + md.escapeHtml(cfg.pageTitle) + '</h1>',
    '                <p class="page-desc">' + md.escapeHtml(cfg.pageDesc) + '</p>',
    '            </div>',
    '',
    '            <div class="article-list">',
    sections,
    '            </div>',
    '        </div>',
    '    </main>',
    '',
    '    <script src="index.js" defer><\/script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

module.exports = { articlePage: articlePage, indexPage: indexPage };
