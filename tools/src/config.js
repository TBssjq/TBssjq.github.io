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

  // 仓库根目录（一键 Git 同步的作用范围）
  repoRoot: path.join(TOOLS_DIR, '..'),

  // Giscus 评论区配置（仅文章页使用；无需评论可留空对象）
  giscus: {
    repo: 'TBssjq/TBssjq.github.io',
    repoId: 'R_kgDOPdTWEg',
    category: 'General',
    categoryId: 'DIC_kwDOPdTWEs4DAcaC',
  },

  // ── 在线后台（Node 服务，见 src/server.js）──
  admin: {
    port: Number(process.env.ADMIN_PORT || 4321),
    // 默认只监听回环地址。要对外暴露必须显式 ADMIN_HOST=0.0.0.0
    host: process.env.ADMIN_HOST || '127.0.0.1',
    maxBodyBytes: Number(process.env.ADMIN_MAX_BODY || 12 * 1024 * 1024),
    maxImageBytes: Number(process.env.ADMIN_MAX_IMAGE || 5 * 1024 * 1024),
  },

  // ── 一键 Git 同步（见 src/git.js）──
  // 只在你点击「同步到 GitHub」时才会执行，平时后台不会碰仓库。
  git: {
    enabled: process.env.ADMIN_GIT !== '0',   // 设为 0 可彻底关闭 Git 面板
    remote: process.env.GIT_REMOTE || 'origin',
    branch: process.env.GIT_BRANCH || '',     // 留空 = 跟随当前所在分支
    pullBeforePush: process.env.GIT_PULL !== '0',
    push: process.env.GIT_PUSH !== '0',       // 设为 0 只提交不推送
    timeout: Number(process.env.GIT_TIMEOUT || 120000),
    // 默认提交信息；{time} 会替换成本地时间，留空则由前端填写
    commitTemplate: 'chore(blog): 更新文章 {time}',
  },
};
