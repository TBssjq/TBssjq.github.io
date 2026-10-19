import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Car } from './car.js';
import { LEVELS } from './levels.js';

/* ══════════ 渲染器 / 场景 ══════════ */

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04070c);
scene.fog = new THREE.FogExp2(0x04070c, 0.012);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 240);
camera.position.set(7.6, 3.2, -9.3);

/* ══════════ 环境反射 ══════════ */

function buildEnv() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');

  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#01040a');
  grad.addColorStop(0.44, '#071724');
  grad.addColorStop(0.5, '#14384a');
  grad.addColorStop(0.54, '#061019');
  grad.addColorStop(1, '#010206');
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);

  g.fillStyle = 'rgba(34,230,255,.4)';
  g.fillRect(0, 256, 1024, 3);
  g.fillStyle = 'rgba(255,47,125,.35)';
  g.fillRect(0, 264, 1024, 2);
  g.fillStyle = 'rgba(34,230,255,.07)';
  g.fillRect(0, 268, 1024, 46);

  for (let i = 0; i < 70; i++) {
    g.fillStyle = `rgba(190,240,255,${0.1 + Math.random() * 0.45})`;
    g.fillRect(Math.random() * 1024, Math.random() * 180, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromEquirectangular(tex);
  scene.environment = rt.texture;
  tex.dispose();
  pmrem.dispose();
}
buildEnv();

/* ══════════ 展台 ══════════ */

const mirror = new Reflector(new THREE.PlaneGeometry(80, 80), {
  clipBias: 0.003,
  textureWidth: Math.min(1024, window.innerWidth * 2),
  textureHeight: Math.min(1024, window.innerHeight * 2),
  color: 0x0a1420,
});
mirror.rotation.x = -Math.PI / 2;
mirror.position.y = 0;
scene.add(mirror);

// 镜面上压一层半透明暗色圆盘，避免倒影过亮
const dampGeo = new THREE.CircleGeometry(30, 72);
const dampMat = new THREE.MeshBasicMaterial({
  color: 0x04070c, transparent: true, opacity: 0.42, depthWrite: false,
});
const damp = new THREE.Mesh(dampGeo, dampMat);
damp.rotation.x = -Math.PI / 2;
damp.position.y = 0.004;
scene.add(damp);

// 展台光圈
const ringGeo = new THREE.RingGeometry(7.3, 7.48, 96);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x22e6ff, transparent: true, opacity: 0.42,
  side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  depthWrite: false, toneMapped: false,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.01;
scene.add(ring);

// 地面网格（很淡）
const grid = new THREE.GridHelper(60, 60, 0x123a4c, 0x0a1c26);
grid.position.y = 0.006;
grid.material.transparent = true;
grid.material.opacity = 0.3;
grid.material.depthWrite = false;
scene.add(grid);

// 远处星尘，撑起空间纵深
(function stars() {
  const n = 460;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 22 + Math.random() * 46;
    const h = 4 + Math.random() * 26;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = h;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x9fdcff, size: 1.6, sizeAttenuation: false,
    transparent: true, opacity: 0.45, depthWrite: false, fog: false,
  });
  scene.add(new THREE.Points(geo, mat));
})();

/* ══════════ 灯光 ══════════ */

const hemi = new THREE.HemisphereLight(0x9fd8ff, 0x05070c, 0.5);
scene.add(hemi);

const key = new THREE.SpotLight(0xfff4e6, 780, 46, 0.55, 0.6, 1.25);
key.position.set(6.5, 12, 7.5);
key.target.position.set(0, 0.6, 0);
scene.add(key, key.target);

const fill = new THREE.PointLight(0x22e6ff, 130, 30, 2);
fill.position.set(-7, 3.2, -4);
scene.add(fill);

const rim = new THREE.PointLight(0xff2f7d, 170, 30, 2);
rim.position.set(2.5, 2.6, -8);
scene.add(rim);

const RIGS = {
  studio: { key: 780, keyColor: 0xfff4e6, fill: 110, fillColor: 0x8fe6ff, rim: 150, hemi: 0.5, exp: 0.98 },
  neon: { key: 420, keyColor: 0x9fe8ff, fill: 260, fillColor: 0x22e6ff, rim: 340, hemi: 0.34, exp: 1.04 },
  night: { key: 220, keyColor: 0xa8bcff, fill: 70, fillColor: 0x2f6bff, rim: 120, hemi: 0.18, exp: 0.94 },
};

function applyRig(name) {
  const r = RIGS[name] || RIGS.studio;
  key.intensity = r.key;
  key.color.set(r.keyColor);
  fill.intensity = r.fill;
  fill.color.set(r.fillColor);
  rim.intensity = r.rim;
  hemi.intensity = r.hemi;
  renderer.toneMappingExposure = r.exp;
}

/* ══════════ 车辆 ══════════ */

const level = LEVELS[0];
const car = new Car(scene, level);
car.group.position.set(0, 0, 0);
car.headlight.intensity = 0;
car.group.traverse((o) => {
  if (o.isPointLight) o.intensity = 0;
});

/* ══════════ 相机控制 ══════════ */

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.8;
controls.minDistance = 5.5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.22;
controls.maxPolarAngle = Math.PI * 0.485;
controls.target.set(0, 0.62, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.update();

/* ══════════ 后期 ══════════ */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, 0.6, 0.72,
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ══════════ 热点 ══════════ */

const HOTSPOTS = [
  {
    id: 'shell',
    pos: [0, 0.88, 0.42],
    title: '碳纤维单体壳',
    text: '由 8 段横截面沿车长放样而成的流线车壳：车头收窄、车肩外扩、车顶内收。漆面使用金属度 0.5 / 粗糙度 0.42 的材质，配合 PMREM 环境贴图产生流动高光。',
    meta: ['8-section loft', 'metalness .50', 'roughness .42'],
  },
  {
    id: 'cabin',
    pos: [0, 1.18, 0.02],
    title: '深色玻璃座舱',
    text: '低矮的泪滴形座舱把风挡倾角压到极限，前缘与车壳平滑过渡。深蓝玻璃带微弱自发光，避免在夜景里变成纯黑块，同时保留反射层次。',
    meta: ['low-drag canopy', 'emissive .5', 'envMap .55'],
  },
  {
    id: 'wheel',
    pos: [1.02, 0.46, -1.42],
    title: '锻造轮组',
    text: '轮胎由缩放圆柱构成，内部是金属轮毂盘 + 5 根贯穿辐条，外缘嵌一圈青色发光环。前轮随转向偏转，滚动时辐条跟着轮轴旋转，半径与宽度前后不等。',
    meta: ['front R .40', 'rear R .44', '5-spoke'],
  },
  {
    id: 'wing',
    pos: [0, 1.14, 2.02],
    title: '双层尾翼',
    text: '碳黑主翼面配端板与双立柱，后缘嵌一条品红霓虹灯带。翼面在视觉上把车尾压低，同时为整车提供稳定的下压力造型语言。',
    meta: ['rear wing', 'endplates', 'neon trailing edge'],
  },
  {
    id: 'diffuser',
    pos: [0, 0.24, 2.26],
    title: '后扩散器与尾灯',
    text: '车尾底部是 3 片导流叶片的扩散器，上方是贯穿式尾灯与两颗方形灯组。发光部件全部使用 toneMapped=false 的加法混合材质，在泛光下形成霓虹光带。',
    meta: ['3-vane diffuser', 'full-width tail light', 'additive glow'],
  },
];

const hotspotLayer = document.getElementById('hotspots');
hotspotLayer.innerHTML = HOTSPOTS.map(
  (h) => `<button class="hotspot" data-id="${h.id}"><span>${h.id}</span></button>`,
).join('');
const hotspotEls = Array.from(hotspotLayer.querySelectorAll('.hotspot'));

const detail = document.getElementById('detail');
const detailKicker = document.getElementById('detailKicker');
const detailTitle = document.getElementById('detailTitle');
const detailText = document.getElementById('detailText');
const detailMeta = document.getElementById('detailMeta');

let activeId = null;
let focusVec = null;

function selectHotspot(id) {
  const h = HOTSPOTS.find((x) => x.id === id);
  if (!h) return;

  activeId = id;
  hotspotEls.forEach((el) => el.classList.toggle('is-active', el.dataset.id === id));

  detailKicker.textContent = `component // ${h.id}`;
  detailTitle.textContent = h.title;
  detailText.textContent = h.text;
  detailMeta.innerHTML = h.meta.map((m) => `<span>${m}</span>`).join('');
  detail.classList.remove('hidden');

  focusVec = new THREE.Vector3(...h.pos);
  controls.autoRotate = false;
  spinBtn.classList.remove('is-on');
}

function clearHotspot() {
  activeId = null;
  focusVec = null;
  detail.classList.add('hidden');
  hotspotEls.forEach((el) => el.classList.remove('is-active'));
}

hotspotLayer.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-id]');
  if (btn) selectHotspot(btn.dataset.id);
});

canvas.addEventListener('pointerdown', () => {
  // 拖拽开始就不再追踪某个热点，避免相机被拽回去
  focusVec = null;
});

/* ══════════ 颜色 / 灯光 / 旋转 ══════════ */

const PAINTS = [
  { id: 'neon', hex: 0x2b4c60, css: '#2b4c60' },
  { id: 'magenta', hex: 0x4a1a3c, css: '#4a1a3c' },
  { id: 'gold', hex: 0x4c3718, css: '#4c3718' },
  { id: 'frost', hex: 0x3b4d5c, css: '#3b4d5c' },
];

const swatches = document.getElementById('swatches');
swatches.innerHTML = PAINTS.map(
  (p, i) => `<button class="swatch${i === 0 ? ' is-on' : ''}" data-paint="${p.id}"
    style="background:${p.css}" title="${p.id}"></button>`,
).join('');

swatches.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-paint]');
  if (!btn) return;
  const paint = PAINTS.find((p) => p.id === btn.dataset.paint);
  if (!paint) return;
  car.materials.paint.color.setHex(paint.hex);
  swatches.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('is-on', s === btn));
});

const RIG_LIST = [
  { id: 'studio', label: 'studio' },
  { id: 'neon', label: 'neon' },
  { id: 'night', label: 'night' },
];

const rigs = document.getElementById('rigs');
rigs.innerHTML = RIG_LIST.map(
  (r, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-rig="${r.id}">${r.label}</button>`,
).join('');

rigs.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rig]');
  if (!btn) return;
  applyRig(btn.dataset.rig);
  rigs.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-on', c === btn));
});

const spinBtn = document.getElementById('spinBtn');
spinBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  spinBtn.classList.toggle('is-on', controls.autoRotate);
  focusVec = null;
});

document.getElementById('resetBtn').addEventListener('click', () => {
  camera.position.set(7.6, 3.2, -9.3);
  controls.target.set(0, 0.62, 0);
  clearHotspot();
  controls.autoRotate = true;
  spinBtn.classList.add('is-on');
});

/* ══════════ 循环 ══════════ */

const INTRO_FROM = new THREE.Vector3(13, 6.4, -16);
const INTRO_TO = new THREE.Vector3(7.6, 3.2, -9.3);
let intro = 0;
controls.autoRotate = false;

const _v = new THREE.Vector3();
let prev = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  // 入场推进
  if (intro < 1) {
    intro = Math.min(1, intro + dt / 1.5);
    const e = 1 - Math.pow(1 - intro, 3);
    camera.position.lerpVectors(INTRO_FROM, INTRO_TO, e);
    if (intro >= 1) {
      controls.autoRotate = true;
      spinBtn.classList.add('is-on');
    }
  }

  // 热点聚焦
  if (focusVec) {
    controls.target.lerp(focusVec, 1 - Math.exp(-5 * dt));
  }

  // 车轮缓慢转动
  car.wheels.forEach((w) => { w.spin.rotation.x += dt * 0.5; });

  // 展台光圈呼吸
  ringMat.opacity = 0.42 + Math.sin(now * 0.0016) * 0.14;

  controls.update();

  // 热点投影
  for (let i = 0; i < HOTSPOTS.length; i++) {
    const el = hotspotEls[i];
    _v.set(...HOTSPOTS[i].pos).project(camera);
    const x = (_v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
    const visible = _v.z < 1;
    el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.style.opacity = visible ? '1' : '0';
    el.style.pointerEvents = visible ? 'auto' : 'none';
  }

  composer.render();

  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
});

applyRig('studio');
car.materials.paint.color.setHex(0x1d3546);
car.materials.paint.metalness = 0.42;
car.materials.paint.roughness = 0.46;
car.materials.paint.envMapIntensity = 0.9;
document.getElementById('loading').classList.add('hidden');
requestAnimationFrame(frame);
