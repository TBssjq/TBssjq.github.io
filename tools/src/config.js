'use strict';

const path = require('path');

// 所有路径都相对于 tools/ 目录（本文件所在目录的上一级是 tools/）
const TOOLS_DIR = path.resolve(__dirname, '..');

module.exports = {
  // 站点基本信息
  siteTitle: 'My Blog',
  brand: 'My Blog',
  pageTitle: '文章目录',
  pageDesc: '在隆冬，我终于知道，我身上有一个不可战胜的夏天',

  // 目录配置
  postsDir: path.join(TOOLS_DIR, 'posts'),     // Markdown 源文件
  themeDir: path.join(TOOLS_DIR, 'theme'),     // 静态主题资源（css/js）
  // 生成目标：仓库的 doc/（可用环境变量 BLOG_OUT 覆盖，便于预览而不改动 doc/）
  outputDir: process.env.BLOG_OUT
    ? path.resolve(TOOLS_DIR, process.env.BLOG_OUT)
    : path.join(TOOLS_DIR, '..', 'doc'),

  // 主题强调色（与 doc/article.css 保持一致）
  accent: '#f97316',

  // 没有文章、但想在目录页占位的年份（"即将发布"占位卡）
  comingYears: ['2025'],

  // Giscus 评论区配置（仅文章页使用；无需评论可留空对象）
  giscus: {
    repo: 'TBssjq/TBssjq.github.io',
    repoId: 'R_kgDOPdTWEg',
    category: 'General',
    categoryId: 'DIC_kwDOPdTWEs4DAcaC',
  },
};
