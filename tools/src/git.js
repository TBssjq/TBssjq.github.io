'use strict';

// 一键 Git 同步（零依赖）。
//
// 设计要点：
//   1. 只用 execFileSync('git', [args]) —— 不经过 shell、不拼接命令行字符串，
//      因此提交信息里带引号、分号、& 之类的字符也不会变成命令注入。
//   2. 所有 git 调用限定在 cfg.repoRoot 内，且带超时，卡住不会拖死服务。
//   3. 只读接口（status / log）随便调；写接口（sync）只能由后台按钮触发，
//      且服务端会再校验一次 enabled 开关。
//
// 用法：
//   const git = require('./git');
//   git.status();                       // 分支 / 改动数 / ahead-behind
//   git.sync({ message: '更新文章' });   // add -> commit -> pull --rebase -> push

const path = require('path');
const { execFileSync } = require('child_process');
const cfg = require('./config');

const ROOT = path.resolve(cfg.repoRoot);

class GitError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'GitError';
    this.status = 400;
    this.detail = String(detail || '').trim().slice(0, 2000);
  }
}

/* ── 底层调用 ── */

function run(args, timeout) {
  let out;
  try {
    out = execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 8 * 1024 * 1024,
      timeout: timeout || cfg.git.timeout,
    });
  } catch (e) {
    const stderr = String((e && e.stderr) || '').trim();
    const stdout = String((e && e.stdout) || '').trim();
    const detail = stderr || stdout;

    // 命令根本不存在（没装 git / 不在 PATH 里）
    if (e && e.code === 'ENOENT') {
      throw new GitError('未找到 git 命令，请先安装 Git 并确保它在 PATH 中', detail);
    }
    // 超时被 SIGTERM 杀掉
    if (e && (e.killed || e.signal === 'SIGTERM')) {
      throw new GitError('git ' + args[0] + ' 执行超时（' + (timeout || cfg.git.timeout) + 'ms）', detail);
    }
    if (e && e.code === 'EACCES') {
      throw new GitError('没有权限执行 git', detail);
    }

    const code = e && e.status !== undefined && e.status !== null ? '，退出码 ' + e.status : '';
    throw new GitError('git ' + args.join(' ') + ' 失败' + code, detail);
  }
  return String(out || '');
}

// 允许参数为 null/undefined 时安全过滤
function runSafe(args, timeout) {
  return run(args.filter(function (a) { return a !== null && a !== undefined && a !== ''; }), timeout);
}

/* ── 仓库探测 ── */

function isRepo() {
  try {
    const out = run(['rev-parse', '--is-inside-work-tree'], 10000).trim();
    return out === 'true';
  } catch (e) {
    return false;
  }
}

function currentBranch() {
  try {
    return run(['rev-parse', '--abbrev-ref', 'HEAD'], 10000).trim();
  } catch (e) {
    return '';
  }
}

function hasRemote(remote) {
  try {
    const out = run(['remote'], 10000);
    return out.split('\n').map(function (s) { return s.trim(); }).indexOf(remote) !== -1;
  } catch (e) {
    return false;
  }
}

// 该远程分支是否存在（决定能不能 pull / push 到它）
function hasRemoteBranch(remote, branch) {
  try {
    run(['ls-remote', '--exit-code', '--heads', remote, branch], 30000);
    return true;
  } catch (e) {
    return false;
  }
}

function upstreamOf(branch) {
  try {
    const out = run(['rev-parse', '--abbrev-ref', branch + '@{upstream}'], 10000).trim();
    return out && out.indexOf('@{upstream}') === -1 ? out : '';
  } catch (e) {
    return '';
  }
}

function identity() {
  const read = function (key) {
    try { return run(['config', '--get', key], 10000).trim(); } catch (e) { return ''; }
  };
  return { name: read('user.name'), email: read('user.email') };
}

/* ── 状态 ── */

// porcelain v1: XY <path>   X=暂存区状态  Y=工作区状态  ??=未跟踪
function parsePorcelain(text) {
  const files = [];
  text.split('\n').forEach(function (line) {
    if (line.length < 4) return;
    const x = line[0];
    const y = line[1];
    let p = line.slice(3);
    // 重命名 / 复制会写成  "old -> new"
    if (p.indexOf(' -> ') !== -1) p = p.split(' -> ')[1];
    // 路径可能被引号包裹（含中文或空格时 git 会加引号）
    if (p.length > 2 && p[0] === '"' && p[p.length - 1] === '"') {
      try { p = JSON.parse(p); } catch (e) { p = p.slice(1, -1); }
    }
    // 未跟踪文件的 XY 是 "??"，Y 不是空格，别把它算进「未暂存的修改」里
    files.push({
      path: p,
      staged: x !== ' ' && x !== '?',
      unstaged: y !== ' ' && y !== '?',
      untracked: x === '?' && y === '?',
      code: (x + y).trim() || '??',
    });
  });
  return files;
}

function status() {
  const base = {
    enabled: !!cfg.git.enabled,
    available: false,
    repoRoot: ROOT,
    branch: '',
    remote: cfg.git.remote,
    upstream: '',
    ahead: 0,
    behind: 0,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    clean: true,
    files: [],
    identity: { name: '', email: '' },
    warnings: [],
  };

  if (!cfg.git.enabled) {
    base.warnings.push('已通过设置 ADMIN_GIT=0 关闭 Git 功能');
    return base;
  }

  if (!isRepo()) {
    base.warnings.push('当前目录不是 Git 仓库：' + ROOT);
    return base;
  }

  base.available = true;
  base.branch = currentBranch();
  base.identity = identity();

  if (!base.identity.name || !base.identity.email) {
    base.warnings.push('尚未配置 Git 身份：git config user.name / user.email');
  }

  const files = parsePorcelain(run(['status', '--porcelain=v1', '-uall'], 30000));
  base.files = files.slice(0, 200);            // 只回传前 200 条，避免大仓库撑爆响应
  base.total = files.length;
  files.forEach(function (f) {
    if (f.staged) base.staged++;
    if (f.unstaged) base.unstaged++;
    if (f.untracked) base.untracked++;
  });
  base.clean = files.length === 0;

  const remote = cfg.git.remote;
  if (!hasRemote(remote)) {
    base.warnings.push('未配置远程 ' + remote);
    return base;
  }

  const upstream = upstreamOf(base.branch);
  base.upstream = upstream;

  if (upstream) {
    try {
      const out = run(['rev-list', '--left-right', '--count', upstream + '...' + base.branch], 30000).trim();
      const parts = out.split(/\s+/);
      base.behind = parseInt(parts[0], 10) || 0;
      base.ahead = parseInt(parts[1], 10) || 0;
    } catch (e) { /* 上游不存在时忽略 */ }
  } else {
    base.warnings.push('当前分支尚未设置上游，推送时需手动指定');
  }

  if (base.behind > 0) {
    base.warnings.push('落后远程 ' + base.behind + ' 个提交，建议同步前先拉取');
  }
  return base;
}

/* ── 提交历史 ── */

function log(n) {
  if (!isRepo()) return [];
  const sep = '\u001f';
  const fmt = ['%h', '%s', '%an', '%ar'].join(sep);
  const out = run(['log', '-n', String(n || 10), '--pretty=format:' + fmt], 30000);
  if (!out.trim()) return [];
  return out.split('\n').map(function (line) {
    const p = line.split(sep);
    return { hash: p[0] || '', subject: p[1] || '', author: p[2] || '', time: p[3] || '' };
  });
}

/* ── 提交信息净化 ── */

// git 本身不会执行命令，但提交信息里塞控制字符会污染日志与终端，这里统一清洗
function sanitizeMessage(raw) {
  let msg = String(raw || '').replace(/\r/g, '');
  msg = msg.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  msg = msg.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).join('\n');
  msg = msg.trim();
  if (msg.length > 300) msg = msg.slice(0, 300);
  return msg;
}

function defaultMessage() {
  const d = new Date();
  const pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  const time = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  return String(cfg.git.commitTemplate || 'chore(blog): 更新文章 {time}').replace('{time}', time);
}

/* ── 同步：add -> commit -> pull --rebase -> push ── */

function sync(options) {
  const opts = options || {};
  const steps = [];

  if (!cfg.git.enabled) throw new GitError('Git 功能已关闭（ADMIN_GIT=0）');
  if (!isRepo()) throw new GitError('当前目录不是 Git 仓库：' + ROOT);

  const branch = cfg.git.branch || currentBranch();
  if (!branch) throw new GitError('无法确认当前分支');

  const id = identity();
  if (!id.name || !id.email) {
    throw new GitError('尚未配置 Git 身份，请先执行：git config user.name "你的名字" && git config user.email "you@example.com"');
  }

  // 1) 暂存全部改动
  run(['add', '-A'], 60000);
  steps.push({ step: 'add', ok: true, output: 'git add -A' });

  // 2) 没有待提交内容就到此为止（不算失败）
  let pending = '';
  try {
    pending = run(['diff', '--cached', '--name-only'], 30000).trim();
  } catch (e) {
    pending = 'x';
  }
  if (!pending) {
    steps.push({ step: 'commit', ok: true, skipped: true, output: '没有需要提交的改动' });
    // 仓库干净时仍然尝试推送，把之前未推送的提交补上去
    return finish(steps, branch, { committed: false });
  }

  // 3) 提交
  const message = sanitizeMessage(opts.message) || defaultMessage();
  const commitOut = runSafe(['commit', '-m', message], 60000);
  steps.push({ step: 'commit', ok: true, output: (commitOut || '(无输出)').trim() });

  return finish(steps, branch, { committed: true, message: message }, {
    pull: opts.pull === undefined ? cfg.git.pullBeforePush : !!opts.pull,
    push: opts.push === undefined ? cfg.git.push : !!opts.push,
  });
}

function finish(steps, branch, extra, flags) {
  const pullBeforePush = flags && flags.pull !== undefined ? flags.pull : cfg.git.pullBeforePush;
  const doPush = flags && flags.push !== undefined ? flags.push : cfg.git.push;
  const remote = cfg.git.remote;
  const result = Object.assign({
    ok: true,
    steps: steps,
    branch: branch,
    remote: remote,
    pushed: false,
    pulled: false,
  }, extra || {});

  const remoteBranch = cfg.git.branch || branch;

  if (!hasRemote(remote)) {
    steps.push({ step: 'push', ok: false, skipped: true, output: '未配置远程 ' + remote + '，已跳过推送' });
    return result;
  }

  // 4) 推送前先变基拉取，尽量避开 non-fast-forward 冲突
  if (pullBeforePush) {
    const upstream = upstreamOf(branch) || (hasRemoteBranch(remote, remoteBranch) ? remote + '/' + remoteBranch : '');
    if (upstream) {
      try {
        const out = runSafe(['pull', '--rebase', '--autostash', remote, remoteBranch], cfg.git.timeout);
        result.pulled = true;
        steps.push({ step: 'pull', ok: true, output: (out || '(已是最新)').trim() });
      } catch (e) {
        steps.push({ step: 'pull', ok: false, output: e instanceof GitError ? e.message + (e.detail ? '\n' + e.detail : '') : String(e.message) });
        result.ok = false;
        result.error = '拉取失败，已中止推送（可能发生了 rebase 冲突，请到命令行处理）';
        return result;
      }
    } else {
      steps.push({ step: 'pull', ok: true, skipped: true, output: '远程尚无该分支，跳过拉取' });
    }
  }

  // 5) 推送
  if (!doPush) {
    steps.push({ step: 'push', ok: true, skipped: true, output: '已关闭推送（本次只提交到本地）' });
    return result;
  }

  try {
    const out = runSafe(['push', remote, branch + ':' + remoteBranch], cfg.git.timeout);
    result.pushed = true;
    steps.push({ step: 'push', ok: true, output: (out || '(已是最新)').trim() });
  } catch (e) {
    const detail = e instanceof GitError ? e.detail : '';
    // 首次推送到空分支时 git 会提示设置上游，这里自动补一次 -u
    if (/has no upstream branch|no upstream branch|set-upstream/i.test(detail)) {
      const out = runSafe(['push', '-u', remote, branch + ':' + remoteBranch], cfg.git.timeout);
      result.pushed = true;
      steps.push({ step: 'push', ok: true, output: (out || '').trim() });
    } else {
      steps.push({ step: 'push', ok: false, output: (e instanceof GitError ? e.message + (detail ? '\n' + detail : '') : String(e.message)) });
      result.ok = false;
      result.error = '推送失败（若是认证问题，请检查凭证或改用 SSH）';
    }
  }

  return result;
}

module.exports = {
  GitError: GitError,
  isRepo: isRepo,
  currentBranch: currentBranch,
  status: status,
  log: log,
  sync: sync,
  defaultMessage: defaultMessage,
  sanitizeMessage: sanitizeMessage,
  identity: identity,
  repoRoot: ROOT,
};
