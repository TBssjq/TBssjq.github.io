import * as THREE from 'three';
import { Stage } from './scene.js';
import { Track } from './track.js';
import { Car } from './car.js';
import { Particles } from './effects.js';
import { HUD } from './hud.js';
import { EngineAudio } from './audio.js';
import { Collectibles } from './collectibles.js';
import { Minimap } from './minimap.js';
import { Save } from './save.js';
import { Codex, highlight, richText } from './codex.js';
import { TOPICS, getTopic, categoryOf } from './content/index.js';
import { t, pick, getLang, toggleLang, applyI18n } from './i18n.js';
import { LEVELS, KMH } from './levels.js';

window.__ENGINE_BOOTED = true;

const canvas = document.getElementById('scene');
const stage = new Stage(canvas);
const hud = new HUD();
const audio = new EngineAudio();
const particles = new Particles(stage.scene, 1000);

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const FAR = new THREE.Vector3(1e6, 0, 1e6);

const fxSpeed = document.getElementById('fxSpeed');
const fxHit = document.getElementById('fxHit');
const waves = [];
let smokeCd = 0;

const state = {
  mode: 'boot',
  prevMode: 'racing',
  index: 0,
  level: LEVELS[0],
  track: null,
  car: null,
  collectibles: null,
  timeLeft: 0,
  timeTotal: 0,
  elapsed: 0,
  cpPassed: 0,
  nodePassed: 0,
  prevS: 0,
  startS: 0,
  topSpeed: 0,
  runTime: 0,
  shake: 0,
  wallCd: 0,
  countdown: 0,
  bootDone: false,
  studyTopic: null,
};

let overlayBuilder = null;
let minimap = null;
let last = performance.now();

/* ══════════════ 启动终端 ══════════════ */

const BOOT_LINES = [
  { t: '$ g++ -std=c++20 -O3 -march=native race_engine.cpp -o race_engine', c: 'cy' },
  { t: '  reading /usr/include/race/track.hpp .......... done', c: 'dim' },
  { t: '  reading /usr/include/race/codex.hpp ......... done', c: 'dim' },
  { t: '  reading /usr/include/race/vehicle.hpp ....... done', c: 'dim' },
  { t: '[ 12%] compiling  track.cpp', c: '' },
  { t: '[ 34%] compiling  vehicle.cpp', c: '' },
  { t: '[ 56%] linking     libneon.a  (bloom, fog, particles)', c: '' },
  { t: '[ 78%] optimizing  hot path  ->  -O3 -ffast-math', c: '' },
  { t: '[ 96%] inlining    check_collision()', c: '' },
  { t: '[100%] build succeeded in 0.418s', c: 'ok' },
  { t: '', c: '' },
  { t: 'RACE_ENGINE v0.4.0  //  3 stages · 25 codex topics', c: 'cy' },
  { t: 'tip: drive through the floating nodes to learn C++', c: 'am' },
  { t: '     press [TAB] anytime to open the codex', c: 'am' },
  { t: '', c: '' },
];

function typeBoot() {
  const el = document.getElementById('bootLog');
  let i = 0;

  const step = () => {
    if (i >= BOOT_LINES.length) {
      state.bootDone = true;
      document.getElementById('bootHint').classList.remove('hidden');
      return;
    }
    const line = BOOT_LINES[i++];
    const span = document.createElement('span');
    span.className = line.c || '';
    span.textContent = line.t + '\n';
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
    setTimeout(step, 42 + Math.random() * 80);
  };

  step();
}

function skipBoot() {
  const el = document.getElementById('bootLog');
  el.innerHTML = '';
  for (const line of BOOT_LINES) {
    const span = document.createElement('span');
    span.className = line.c || '';
    span.textContent = line.t + '\n';
    el.appendChild(span);
  }
  state.bootDone = true;
  document.getElementById('bootHint').classList.remove('hidden');
}

/* ══════════════ 知识库 / 学习卡 ══════════════ */

const codex = new Codex({
  onOpen: () => {
    if (state.mode !== 'codex') state.prevMode = state.mode;
    state.mode = 'codex';
    keys.clear();
  },
  onClose: () => {
    if (state.mode === 'codex') state.mode = state.prevMode || 'racing';
    last = performance.now();
  },
});

const studyEl = {
  root: document.getElementById('study'),
  cat: document.getElementById('studyCat'),
  gain: document.getElementById('studyGain'),
  kicker: document.getElementById('studyKicker'),
  title: document.getElementById('studyTitle'),
  meta: document.getElementById('studyMeta'),
  text: document.getElementById('studyText'),
  code: document.getElementById('studyCode'),
  points: document.getElementById('studyPoints'),
  btn: document.getElementById('studyBtn'),
};

function renderStudy() {
  const topic = state.studyTopic;
  if (!topic) return;
  const lang = getLang();
  const cat = categoryOf(topic.cat);
  const points = (topic.points && topic.points[lang]) || [];

  studyEl.cat.textContent = pick(cat.name);
  studyEl.gain.textContent = t('study.gain', { s: state.level.nodeBonus || 3 });
  studyEl.kicker.textContent = `// ${t('study.node', { n: String(topic.__n || 1).padStart(2, '0') })}`;
  studyEl.title.textContent = pick(topic.title);
  studyEl.meta.textContent = pick(topic.meta);
  studyEl.text.innerHTML = richText(topic.body[lang] || topic.body.en);
  studyEl.code.innerHTML = highlight(topic.code);
  studyEl.points.innerHTML = points.map((p) => `<li>${p}</li>`).join('');
  studyEl.btn.textContent = t('study.continue');
}

function openStudy(item) {
  const topic = getTopic(item.topic);
  topic.__n = item.index + 1;
  state.studyTopic = topic;
  state.mode = 'study';
  renderStudy();
  studyEl.root.classList.remove('hidden');
  audio.blip(1320, 0.1, 'triangle', 0.14);
}

function closeStudy() {
  if (state.mode !== 'study') return;
  studyEl.root.classList.add('hidden');
  state.mode = 'racing';
  last = performance.now();
}

studyEl.btn.addEventListener('click', () => {
  studyEl.btn.blur();
  closeStudy();
});

window.addEventListener('langchange', () => {
  if (state.mode === 'study') renderStudy();
  if (overlayBuilder && !hud.el.overlay.classList.contains('hidden')) hud.overlay(overlayBuilder());
});

/* ══════════════ 关卡构建 ══════════════ */

function clearWaves() {
  for (const w of waves) {
    w.mesh.removeFromParent();
    w.geo.dispose();
    w.mat.dispose();
  }
  waves.length = 0;
}

function spawnWave(pos, color, y = 0.14) {
  const geo = new THREE.RingGeometry(0.55, 0.95, 48);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos.x, y, pos.z);
  mesh.rotation.x = -Math.PI / 2;
  stage.scene.add(mesh);
  waves.push({ mesh, geo, mat, t: 0 });
}

function updateWaves(dt) {
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i];
    w.t += dt;
    const k = w.t / 0.75;
    if (k >= 1) {
      w.mesh.removeFromParent();
      w.geo.dispose();
      w.mat.dispose();
      waves.splice(i, 1);
      continue;
    }
    const s = 1 + k * 15;
    w.mesh.scale.set(s, s, s);
    w.mat.opacity = 0.8 * (1 - k) * (1 - k);
  }
}

function buildLevel(index, preview = false) {
  clearWaves();
  if (state.track) {
    state.track.group.removeFromParent();
    state.track.dispose();
  }
  if (state.car) state.car.dispose();
  if (state.collectibles) {
    state.collectibles.dispose();
    state.collectibles = null;
  }

  const level = LEVELS[index];
  const track = new Track(level);
  stage.scene.add(track.group);

  const car = new Car(stage.scene, level);
  car.reset(track.startPose());
  car.trackIndex = track.nearest(car.pos, -1).index;

  const collectibles = new Collectibles(stage.scene, track, level);

  if (minimap) minimap.dispose();
  minimap = new Minimap(document.getElementById('minimap'), track, level);

  state.track = track;
  state.car = car;
  state.collectibles = collectibles;
  state.level = level;
  state.index = index;
  stage.setLevel(level);
  if (!preview) stage.snapTo(car);
}

function startLevel(index) {
  buildLevel(index, false);

  state.mode = 'racing';
  state.timeLeft = state.level.limit;
  state.timeTotal = state.level.limit;
  state.elapsed = 0;
  state.cpPassed = 0;
  state.nodePassed = 0;
  state.topSpeed = 0;
  state.shake = 0;
  state.wallCd = 0;
  state.studyTopic = null;
  overlayBuilder = null;

  const startNear = state.track.nearest(state.car.pos, -1);
  state.prevS = startNear.s;
  state.startS = startNear.s;

  hud.show();
  hud.hideOverlay();
  hud.setLevel(state.level);
  hud.log(t('log.compiled', { f: state.level.file }), 'ok');
  hud.log(t('log.cpRegistered', { n: state.level.checkpoints.length }), 'ok');
  hud.log(t('log.nodeRegistered', { n: state.collectibles.total }), 'ok');
  state.countdown = 3;
  hud.toast('3', state.level.code, 'count', 980);

  audio.init();
  audio.blip(560, 0.08, 'square', 0.1);
}

/* ══════════════ 结算 ══════════════ */

function showOverlay(builder) {
  overlayBuilder = builder;
  hud.overlay(builder());
}

function passCheckpoint(cp) {
  cp.passed = true;
  state.track.markPassed(cp);
  state.cpPassed++;
  state.timeLeft += state.level.bonus;

  hud.setCounts({ cpPassed: state.cpPassed });
  hud.toast(
    t('toast.checkpoint'),
    t('toast.checkpointSub', { b: state.level.bonus, n: state.cpPassed, m: state.track.checkpoints.length }),
    '',
    1100,
  );
  hud.log(t('log.cpPassed', { n: String(cp.index + 1).padStart(2, '0'), b: state.level.bonus }), 'ok');

  const sm = state.track.sampleAtS(cp.s);
  particles.emit(sm.pos, 30, { color: 0x8dffb8, speed: 12, size: 0.75, life: 0.7, spread: 3 });
  spawnWave(sm.pos, 0x8dffb8);
  audio.blip(1180, 0.1, 'triangle', 0.14);
}

function collectNode(item) {
  const bonus = state.level.nodeBonus || 3;
  state.timeLeft += bonus;
  state.nodePassed = state.collectibles.collected;

  Save.markTopic(item.topic);

  hud.setCounts({ nodePassed: state.nodePassed });
  hud.toast(t('toast.node'), t('toast.nodeSub', { b: bonus }), 'ok', 1600);
  hud.log(t('log.nodePicked', { id: item.topic }), 'ok');

  particles.emit(state.car.pos, 24, { color: 0xffcc66, speed: 9, size: 0.6, life: 0.6, spread: 2 });
  spawnWave(state.car.pos, 0xffcc66);

  openStudy(item);
}

function completeLevel() {
  state.runTime += state.elapsed;
  audio.fanfare();

  const level = state.level;
  const record = Save.setBest(level.id, state.elapsed);
  Save.markCleared(level.id);

  const stats = () => [
    { k: t('stat.stage'), v: `${state.elapsed.toFixed(2)} s`, cls: 'good' },
    { k: t('stat.best'), v: `${Save.best(level.id).toFixed(2)} s`, cls: record ? 'good' : '' },
    { k: t('stat.top'), v: `${Math.round(state.topSpeed * KMH)} km/h` },
    { k: t('stat.cp'), v: `${state.cpPassed} / ${state.track.checkpoints.length}` },
    { k: t('stat.nodes'), v: `${state.nodePassed} / ${state.collectibles.total}` },
  ];

  const pose = state.car.pos;
  particles.emit(pose, 80, { color: 0x8dffb8, speed: 16, size: 0.9, life: 1.1, spread: 5 });

  if (state.index + 1 >= LEVELS.length) {
    state.mode = 'victory';
    showOverlay(() => ({
      kicker: t('overlay.winKicker'),
      title: t('overlay.winTitle'),
      sub: t('overlay.winSub'),
      stats: [...stats(), { k: t('stat.total'), v: `${state.runTime.toFixed(2)} s`, cls: 'good' }],
      btn: t('overlay.restart'),
    }));
    return;
  }

  state.mode = 'cleared';
  showOverlay(() => ({
    kicker: record ? t('overlay.recordKicker') : t('overlay.cleared'),
    title: `LEVEL ${String(level.id).padStart(2, '0')} CLEARED`,
    sub: record ? t('overlay.record', { code: level.code }) : t('overlay.clearedSub', { code: level.code }),
    stats: stats(),
    btn: t('overlay.next'),
  }));
}

function failLevel() {
  state.mode = 'failed';
  audio.fail();
  state.shake = 0.7;

  const rel = ((state.prevS - state.startS) % state.track.length + state.track.length) % state.track.length;
  const progress = Math.round((rel / state.track.length) * 100);

  showOverlay(() => ({
    kicker: t('overlay.failKicker'),
    title: t('overlay.failTitle'),
    sub: t('overlay.failSub'),
    stats: [
      { k: t('stat.progress'), v: `${progress}%`, cls: 'bad' },
      { k: t('stat.cp'), v: `${state.cpPassed} / ${state.track.checkpoints.length}` },
      { k: t('stat.top'), v: `${Math.round(state.topSpeed * KMH)} km/h` },
    ],
    btn: t('overlay.retry'),
    bad: true,
  }));
}

function togglePause() {
  if (state.mode === 'racing') {
    state.mode = 'paused';
    showOverlay(() => ({
      head: t('overlay.pausedHead'),
      kicker: t('overlay.pauseKicker'),
      title: t('overlay.pauseTitle'),
      sub: t('overlay.pauseSub'),
      stats: [
        { k: 'level', v: state.level.code },
        { k: t('stat.left'), v: `${Math.max(0, state.timeLeft).toFixed(1)} s` },
      ],
      btn: t('overlay.resume'),
    }));
  } else if (state.mode === 'paused') {
    state.mode = 'racing';
    hud.hideOverlay();
    overlayBuilder = null;
    last = performance.now();
  }
}

/* ══════════════ 输入 ══════════════ */

const keys = new Set();

function readInput() {
  const up = keys.has('KeyW') || keys.has('ArrowUp');
  const down = keys.has('KeyS') || keys.has('ArrowDown');
  const left = keys.has('KeyA') || keys.has('ArrowLeft');
  const right = keys.has('KeyD') || keys.has('ArrowRight');
  return {
    throttle: (up ? 1 : 0) - (down ? 1 : 0),
    steer: (left ? 1 : 0) - (right ? 1 : 0),
    boost: keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('Space'),
  };
}

function handleAction() {
  audio.init();
  switch (state.mode) {
    case 'boot':
      if (!state.bootDone) { skipBoot(); return; }
      launch();
      break;
    case 'cleared':
      startLevel(state.index + 1);
      break;
    case 'failed':
      startLevel(state.index);
      break;
    case 'paused':
      state.mode = 'racing';
      hud.hideOverlay();
      overlayBuilder = null;
      last = performance.now();
      break;
    case 'victory':
      state.runTime = 0;
      startLevel(0);
      break;
    default:
      break;
  }
}

function hideBoot() {
  const boot = document.getElementById('boot');
  boot.classList.add('fade');
  setTimeout(() => boot.classList.add('hidden'), 380);
}

function launch(index = 0) {
  hideBoot();
  state.runTime = 0;
  startLevel(index);
}

/* ══════════════ 关卡选择 ══════════════ */

function renderLevelPicker() {
  const el = document.getElementById('bootLevels');
  if (!el) return;

  el.innerHTML = LEVELS.map((lv, i) => {
    const cleared = Save.isCleared(lv.id);
    const best = Save.best(lv.id);
    const meta = cleared
      ? `${t('ui.cleared')}${best ? ` · ${best.toFixed(2)}s` : ''}`
      : (best ? `${t('hud.bestShort')} ${best.toFixed(2)}s` : `${t('ui.enter')} →`);

    return `<button class="lvlbtn${cleared ? ' is-cleared' : ''}" data-index="${i}">
      <span class="lvlbtn__id">LEVEL ${String(lv.id).padStart(2, '0')}</span>
      <span class="lvlbtn__name">${lv.code}</span>
      <span class="lvlbtn__meta">${meta}</span>
    </button>`;
  }).join('');
}

document.getElementById('bootLevels').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-index]');
  if (!btn) return;
  btn.blur();
  launch(Number(btn.dataset.index));
});

window.addEventListener('langchange', () => renderLevelPicker());

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();

  // 学习界面拦截按键
  if (e.code === 'Tab') {
    e.preventDefault();
    codex.toggle();
    return;
  }
  if (state.mode === 'study') {
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Escape') closeStudy();
    return;
  }
  if (state.mode === 'codex') {
    if (e.code === 'Escape' || e.code === 'Enter') codex.close();
    return;
  }

  keys.add(e.code);
  if (e.repeat) return;

  if (e.code === 'Enter' || e.code === 'NumpadEnter') { handleAction(); return; }
  if (e.code === 'Escape') { togglePause(); return; }
  if (e.code === 'KeyR' && (state.mode === 'racing' || state.mode === 'paused')) {
    startLevel(state.index);
    return;
  }
  if (e.code === 'KeyL') {
    toggleLang();
    hud.log(t('log.lang'), 'ok');
    return;
  }
  if (e.code === 'KeyM') {
    const muted = audio.toggleMute();
    hud.log(muted ? t('log.muted') : t('log.unmuted'), muted ? 'warn' : 'ok');
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

/* ── 触屏虚拟按键（映射到同一套 keys） ── */

const touchPad = document.getElementById('touch');
touchPad.querySelectorAll('[data-key]').forEach((btn) => {
  const key = btn.dataset.key;
  const down = (e) => {
    e.preventDefault();
    keys.add(key);
    btn.classList.add('down');
  };
  const up = () => {
    keys.delete(key);
    btn.classList.remove('down');
  };
  btn.addEventListener('touchstart', down, { passive: false });
  btn.addEventListener('touchend', up);
  btn.addEventListener('touchcancel', up);
  btn.addEventListener('mousedown', down);
  btn.addEventListener('mouseup', up);
  btn.addEventListener('mouseleave', up);
});

const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
if (isCoarse || 'ontouchstart' in window) touchPad.classList.add('on');

document.getElementById('ovBtn').addEventListener('click', (e) => {
  e.currentTarget.blur();
  handleAction();
});

document.getElementById('ovCodex').addEventListener('click', (e) => {
  e.currentTarget.blur();
  codex.open();
});

document.getElementById('codexBtn').addEventListener('click', (e) => {
  e.currentTarget.blur();
  codex.toggle();
});

document.getElementById('langBtn').addEventListener('click', (e) => {
  e.currentTarget.blur();
  toggleLang();
  hud.log(t('log.lang'), 'ok');
});

/* ══════════════ 主循环 ══════════════ */

function onWall(speed) {
  state.shake = Math.min(1.15, state.shake + speed / 55);
  audio.crash();

  particles.emit(state.car.pos, 18, {
    color: 0xffcc66, speed: 11, size: 0.7, life: 0.5, spread: 1.1,
  });

  if (speed * KMH > 25) {
    fxHit.classList.remove('on');
    void fxHit.offsetWidth;
    fxHit.classList.add('on');
  }

  if (state.wallCd <= 0 && speed * KMH > 22) {
    hud.log(t('log.wall', { v: Math.round(speed * KMH) }), 'warn');
    state.wallCd = 1.2;
  }
}

function tickCountdown(dt) {
  const before = Math.ceil(state.countdown);
  state.countdown = Math.max(0, state.countdown - dt);
  const after = Math.ceil(state.countdown);

  if (after !== before && after > 0) {
    hud.toast(String(after), '', 'count', 980);
    audio.blip(560, 0.07, 'square', 0.1);
  } else if (before > 0 && after === 0) {
    hud.toast('GO', '', 'count go', 900);
    audio.blip(1080, 0.16, 'square', 0.13);
    state.shake = Math.max(state.shake, 0.18);
  }
}

function update(dt) {
  const { car, track } = state;

  const frozen = state.countdown > 0;
  if (frozen) tickCountdown(dt);

  const input = frozen ? { throttle: 0, steer: 0, boost: false } : readInput();
  const near = car.update(dt, input, track, onWall);

  if (!frozen) {
    state.elapsed += dt;
    state.timeLeft -= dt;
  }
  state.shake = Math.max(0, state.shake - dt * 2.4);
  state.wallCd = Math.max(0, state.wallCd - dt);
  state.topSpeed = Math.max(state.topSpeed, car.speed);

  const s = near.s;
  const prev = state.prevS;
  state.prevS = s;

  const wrapped = s < prev - track.length * 0.5;

  for (const cp of track.checkpoints) {
    if (cp.passed) continue;
    const hit = wrapped
      ? (cp.s >= prev || cp.s <= s)
      : (cp.s > prev && cp.s <= s);
    if (hit) passCheckpoint(cp);
  }

  if (wrapped && track.checkpoints.every((c) => c.passed)) {
    completeLevel();
    return;
  }

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    failLevel();
    return;
  }

  // 知识点节点
  const picked = state.collectibles.update(dt, car.pos, near.s, track.length);
  if (picked) {
    collectNode(picked);
    return;
  }

  if (car.boosting) {
    const tail = car.tailWorld(_v1);
    _v2.set(Math.sin(car.yaw), 0.08, Math.cos(car.yaw)).normalize();
    particles.emit(tail, 3, {
      color: 0x8ff6ff, speed: 5.5, size: 0.45, life: 0.3, spread: 0.28, dir: _v2,
    });
  }

  // 急转 / 刹车时的轮胎烟
  const slipping = Math.abs(car.speed) > 24
    && (Math.abs(input.steer) > 0.5 || (input.throttle < 0 && car.speed > 26));
  if (!frozen && slipping) {
    smokeCd -= dt;
    if (smokeCd <= 0) {
      smokeCd = 0.05;
      for (const side of [-1, 1]) {
        const p = car.rearWheelWorld(side, _v3);
        particles.emit(p, 1, { color: 0x9fc4d4, speed: 1.9, size: 0.95, life: 0.5, spread: 0.5 });
      }
    }
  }

  // 高速速度线
  const speedRatio = Math.min(1, Math.abs(car.speed) / state.level.boostSpeed);
  const lineK = Math.max(0, (speedRatio - 0.28) / 0.72);
  fxSpeed.style.opacity = Math.min(1, lineK * (car.boosting ? 1.2 : 0.8)).toFixed(2);

  minimap.update(car.pos, car.yaw, track.checkpoints, Save.topics(), dt);

  hud.update({
    kmh: Math.abs(car.speed) * KMH,
    timeLeft: state.timeLeft,
    timeTotal: state.timeTotal,
    nitro: car.nitro,
    boosting: car.boosting,
    progress: (((s - state.startS) % track.length) + track.length) % track.length / track.length,
  });

  audio.update(Math.min(1, Math.abs(car.speed) / state.level.boostSpeed), car.boosting);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.mode === 'racing') {
    update(dt);
  } else {
    state.shake = Math.max(0, state.shake - dt * 2.4);
    fxSpeed.style.opacity = '0';
    if (state.collectibles) state.collectibles.update(dt, FAR, -1000, state.track.length);
  }

  if (state.track) {
    state.track.pulse(now * 0.001, !!(state.car && state.car.boosting && state.mode === 'racing'));
    state.track.tick(now * 0.001);
  }

  particles.update(dt);
  updateWaves(dt);
  stage.updateCamera(dt, state.mode === 'boot' ? null : state.car, state.shake);
  stage.render();

  requestAnimationFrame(frame);
}

/* ══════════════ 启动 ══════════════ */

applyI18n();
renderLevelPicker();
buildLevel(0, true);
typeBoot();
requestAnimationFrame(frame);

// 调试接口（也方便自动化测试读取状态）
window.__race = state;
window.__stage = stage;
