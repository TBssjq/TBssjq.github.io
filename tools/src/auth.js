'use strict';

// 后台鉴权：口令校验 + 服务端会话 + 登录爆破限速。
// 全部基于 Node 内置 crypto，保持项目零依赖。
//
// 口令来源优先级：
//   1. 环境变量 ADMIN_TOKEN
//   2. tools/.admin-token 文件（首次启动时自动生成，权限 0600）
//
// 会话：进程内 Map，随机 32 字节 sid。不存任何敏感内容，重启即失效。
// CSRF：会话 cookie 使用 SameSite=Strict，且所有写接口只接受 application/json，
//       跨站表单既发不出 JSON 也带不上 cookie，因此不再额外发 token。

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('./config');

const TOKEN_FILE = path.join(__dirname, '..', '.admin-token');
const COOKIE_NAME = 'blog_admin';

/* ── 口令 ── */

function digest(str) {
  return crypto.createHash('sha256').update(String(str)).digest();
}

// 先取 sha256 再比较：长度恒为 32 字节，不会因为输入长度不同而提前返回
function safeEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function loadToken() {
  if (process.env.ADMIN_TOKEN) {
    return { token: process.env.ADMIN_TOKEN, source: 'env', generated: false };
  }
  if (fs.existsSync(TOKEN_FILE)) {
    const token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    if (token) return { token: token, source: 'file', generated: false };
  }
  const token = crypto.randomBytes(24).toString('base64url');
  // 注意：mode 在 Windows 上会被忽略，那里请自行控制文件访问权限
  fs.writeFileSync(TOKEN_FILE, token + '\n', { mode: 0o600, encoding: 'utf8' });
  return { token: token, source: 'file', generated: true };
}

function verifyToken(provided) {
  return safeEqual(String(provided || ''), current.token);
}

const current = loadToken();

/* ── 会话 ── */

const sessions = new Map();  // sid -> { expires, ip, ua }

function createSession(ip, ua) {
  const sid = crypto.randomBytes(32).toString('base64url');
  sessions.set(sid, {
    expires: Date.now() + cfg.admin.sessionTTL * 1000,
    ip: ip || '',
    ua: String(ua || '').slice(0, 200),
  });
  return sid;
}

function getSession(sid) {
  if (!sid) return null;
  const s = sessions.get(sid);
  if (!s) return null;
  if (s.expires <= Date.now()) {
    sessions.delete(sid);
    return null;
  }
  // 滑动续期：活跃用户不会被中途踢下线
  s.expires = Date.now() + cfg.admin.sessionTTL * 1000;
  return s;
}

function destroySession(sid) {
  if (sid) sessions.delete(sid);
}

function activeSessions() {
  return sessions.size;
}

/* ── 登录限速 ── */

const attempts = new Map();  // ip -> { count, first }

function lockedOut(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > cfg.admin.loginWindowMs) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= cfg.admin.maxLoginAttempts;
}

function recordFailure(ip) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > cfg.admin.loginWindowMs) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    a.count += 1;
  }
}

function clearAttempts(ip) {
  attempts.delete(ip);
}

/* ── Cookie ── */

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach(function (part) {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    if (!k) return;
    try {
      out[k] = decodeURIComponent(part.slice(i + 1).trim());
    } catch (e) {
      out[k] = part.slice(i + 1).trim();
    }
  });
  return out;
}

function sessionCookie(sid) {
  const parts = [
    COOKIE_NAME + '=' + sid,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=' + cfg.admin.sessionTTL,
  ];
  // 走 HTTPS 反向代理时显式开启，否则浏览器不会回传 cookie
  if (process.env.ADMIN_SECURE_COOKIE === '1') parts.push('Secure');
  return parts.join('; ');
}

const CLEAR_COOKIE = COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';

/* ── 过期会话回收 ── */

function startGc() {
  const timer = setInterval(function () {
    const now = Date.now();
    sessions.forEach(function (s, sid) {
      if (s.expires <= now) sessions.delete(sid);
    });
  }, 5 * 60 * 1000);
  if (typeof timer.unref === 'function') timer.unref();
  return timer;
}

module.exports = {
  COOKIE_NAME: COOKIE_NAME,
  CLEAR_COOKIE: CLEAR_COOKIE,
  token: current,
  verifyToken: verifyToken,
  createSession: createSession,
  getSession: getSession,
  destroySession: destroySession,
  activeSessions: activeSessions,
  lockedOut: lockedOut,
  recordFailure: recordFailure,
  clearAttempts: clearAttempts,
  parseCookies: parseCookies,
  sessionCookie: sessionCookie,
  startGc: startGc,
};
