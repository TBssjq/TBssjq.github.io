/**
 * i18n.js — 双语支持（中 / 英）
 * 知识内容以 { zh, en } 对象存放，用 pick() 取当前语言。
 */

export const LANGS = ['zh', 'en'];
const STORAGE_KEY = 'race_engine_lang';

const DICT = {
  zh: {
    'ui.codex': '知识库',
    'ui.openCodex': '打开知识库',
    'ui.close': '关闭',
    'ui.lang': '中文',
    'ui.levels': '选择关卡',
    'ui.cleared': '已通关',
    'ui.locked': '未解锁',
    'ui.enter': '进入',

    'hud.level': '关卡',
    'hud.velocity': '速度',
    'hud.timeLeft': '剩余时间',
    'hud.nitro': '氮气',
    'hud.foot': 'W / S 油门 · 刹车   A / D 转向   SHIFT 氮气   TAB 知识库   ESC 暂停   R 重开   L 语言',
    'hud.checkpoint': '检查点 {n} / {m}',
    'hud.nodes': '知识点 {n} / {m}',
    'hud.map': '赛道',
    'hud.best': '最佳 --',
    'hud.bestShort': '最佳',

    'codex.title': 'C++ 知识库',
    'codex.sub': '{n} 个知识点 · 已收集 {got} · 中英双语',
    'codex.hint': '选一个分类开始阅读',

    'study.node': '知识点 {n}',
    'study.gain': '+{s}s',
    'study.continue': '[ ENTER ] 继续比赛',

    'overlay.head': '运行日志',
    'overlay.pausedHead': '进程控制',
    'overlay.cleared': '// 关卡通过',
    'overlay.next': '[ ENTER ] 下一关',
    'overlay.retry': '[ ENTER ] 重试本关',
    'overlay.resume': '[ ENTER ] 继续',
    'overlay.pauseKicker': '// 进程已挂起',
    'overlay.pauseTitle': 'PAUSED',
    'overlay.pauseSub': '收到 SIGSTOP · ESC 或 ENTER 继续运行',
    'overlay.failKicker': '// 运行时错误',
    'overlay.failTitle': 'SEGMENTATION FAULT',
    'overlay.failSub': '时间耗尽 · 赛道未完成 (core dumped)',
    'overlay.winKicker': '// 构建成功',
    'overlay.winTitle': 'ALL LEVELS CLEARED',
    'overlay.winSub': '三段赛程全部编译通过 · 没有内存泄漏',
    'overlay.restart': '[ ENTER ] 从第一关重来',
    'overlay.clearedSub': '{code} · 退出码 0',
    'overlay.recordKicker': '// 新纪录',
    'overlay.record': '最快通关 {code} · 退出码 0',

    'stat.stage': '关卡用时',
    'stat.left': '剩余时间',
    'stat.top': '最高速度',
    'stat.cp': '检查点',
    'stat.total': '总用时',
    'stat.progress': '进度',
    'stat.nodes': '知识点',
    'stat.best': '最佳成绩',

    'toast.level': '关卡 {n}',
    'toast.checkpoint': '检查点',
    'toast.checkpointSub': '+{b}s · 检查点 {n} / {m}',
    'toast.node': '知识点已收集',
    'toast.nodeSub': '+{b}s · TAB 打开知识库继续阅读',

    'log.compiled': '[ OK ] 已编译 {f}',
    'log.cpRegistered': '[ OK ] 注册 {n} 个检查点',
    'log.nodeRegistered': '[ OK ] 加载 {n} 个知识点节点',
    'log.cpPassed': '[ OK ] 检查点 {n} 通过  +{b}s',
    'log.nodePicked': '[ OK ] 知识点 {id} 已收集',
    'log.wall': '[WARN] 撞墙  {v} km/h',
    'log.muted': '[WARN] 已静音',
    'log.unmuted': '[ OK ] 取消静音',
    'log.lang': '[ OK ] language: English',

    'fatal.title': '链接失败：无法加载三维引擎。',
    'fatal.body': '请通过 HTTP 打开本页（本地用 run.cmd，GitHub Pages 直接访问），并确认可访问 cdn.jsdelivr.net。',
  },

  en: {
    'ui.codex': 'CODEX',
    'ui.openCodex': 'open codex',
    'ui.close': 'close',
    'ui.lang': 'EN',
    'ui.levels': 'select stage',
    'ui.cleared': 'cleared',
    'ui.locked': 'locked',
    'ui.enter': 'enter',

    'hud.level': 'LEVEL',
    'hud.velocity': 'velocity',
    'hud.timeLeft': 'time_left',
    'hud.nitro': 'nitro',
    'hud.foot': 'W / S throttle · brake   A / D steer   SHIFT nitro   TAB codex   ESC pause   R restart   L language',
    'hud.checkpoint': 'checkpoint {n} / {m}',
    'hud.nodes': 'knowledge {n} / {m}',
    'hud.map': 'track',
    'hud.best': 'best --',
    'hud.bestShort': 'best',

    'codex.title': 'C++ CODEX',
    'codex.sub': '{n} topics · {got} collected · bilingual',
    'codex.hint': 'pick a category to start reading',

    'study.node': 'knowledge node {n}',
    'study.gain': '+{s}s',
    'study.continue': '[ ENTER ] back to race',

    'overlay.head': 'runtime log',
    'overlay.pausedHead': 'process control',
    'overlay.cleared': '// level cleared',
    'overlay.next': '[ ENTER ] next level',
    'overlay.retry': '[ ENTER ] retry level',
    'overlay.resume': '[ ENTER ] resume',
    'overlay.pauseKicker': '// process suspended',
    'overlay.pauseTitle': 'PAUSED',
    'overlay.pauseSub': 'SIGSTOP received · ESC or ENTER to resume',
    'overlay.failKicker': '// runtime error',
    'overlay.failTitle': 'SEGMENTATION FAULT',
    'overlay.failSub': 'time limit exceeded · track unfinished (core dumped)',
    'overlay.winKicker': '// build successful',
    'overlay.winTitle': 'ALL LEVELS CLEARED',
    'overlay.winSub': 'all three stages compiled · no leaks detected',
    'overlay.restart': '[ ENTER ] restart from level 01',
    'overlay.clearedSub': '{code} · exit code 0',
    'overlay.recordKicker': '// new record',
    'overlay.record': 'fastest clear · {code} · exit code 0',

    'stat.stage': 'stage_time',
    'stat.left': 'time_left',
    'stat.top': 'top_speed',
    'stat.cp': 'checkpoints',
    'stat.total': 'total_time',
    'stat.progress': 'progress',
    'stat.nodes': 'knowledge',
    'stat.best': 'best_time',

    'toast.level': 'LEVEL {n}',
    'toast.checkpoint': 'CHECKPOINT',
    'toast.checkpointSub': '+{b}s · checkpoint {n} / {m}',
    'toast.node': 'KNOWLEDGE ACQUIRED',
    'toast.nodeSub': '+{b}s · press TAB to keep reading',

    'log.compiled': '[ OK ] compiled {f}',
    'log.cpRegistered': '[ OK ] {n} checkpoints registered',
    'log.nodeRegistered': '[ OK ] {n} knowledge nodes loaded',
    'log.cpPassed': '[ OK ] cp_{n} passed  +{b}s',
    'log.nodePicked': '[ OK ] knowledge {id} collected',
    'log.wall': '[WARN] wall collision  {v} km/h',
    'log.muted': '[WARN] audio muted',
    'log.unmuted': '[ OK ] audio unmuted',
    'log.lang': '[ OK ] 语言：中文',

    'fatal.title': 'Link failed: 3D engine could not be loaded.',
    'fatal.body': 'Serve this page over HTTP (run.cmd locally, or GitHub Pages) and make sure cdn.jsdelivr.net is reachable.',
  },
};

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch (e) { /* 隐私模式可能禁用它 */ }
  const nav = (navigator.language || '').toLowerCase();
  return nav.startsWith('zh') ? 'zh' : 'en';
}

let current = detect();

export function getLang() {
  return current;
}

export function isZh() {
  return current === 'zh';
}

export function t(key, vars) {
  const table = DICT[current] || DICT.en;
  let s = table[key];
  if (s === undefined) s = (DICT.en[key] !== undefined ? DICT.en[key] : key);
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return s;
}

/** 取双语对象中的当前语言文本 */
export function pick(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[current] !== undefined ? obj[current] : (obj.en || '');
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = current === 'zh' ? 'EN' : '中文';
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
}

export function setLang(lang) {
  if (!LANGS.includes(lang) || lang === current) return current;
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  applyI18n();
  window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  return current;
}

export function toggleLang() {
  return setLang(current === 'zh' ? 'en' : 'zh');
}
