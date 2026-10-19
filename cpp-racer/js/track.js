import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const SEG = 1500;
const V_SCALE = 16;      // 一个路面纹理周期 = 16 单位

/**
 * 程序化赛道：闭合 Catmull-Rom 曲线 → 路面 / 发光边线 / 护栏 / 门。
 * 坐标全部在 xz 平面，y = 0。
 */
export class Track {
  constructor(level) {
    this.level = level;
    this.group = new THREE.Group();
    this.half = level.width / 2;
    this._disposables = [];

    const pts = level.points.map((p) => new THREE.Vector3(p[0], 0, p[1]));
    this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    this.curve.arcLengthDivisions = 2400;
    this.length = this.curve.getLength();

    this.samples = [];
    for (let i = 0; i < SEG; i++) {
      const t = i / SEG;
      const pos = this.curve.getPointAt(t);
      const tan = this.curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
      this.samples.push({ pos, tan, right, s: t * this.length });
    }
    this.ds = this.length / SEG;

    this._buildSurface();
    this._buildPosts();
    this._buildGates();
    this._buildBillboards();
    this._buildCity();
  }

  /* ── 几何工具 ───────────────────────────── */

  _ribbon(aOff, bOff, y, vScale = V_SCALE) {
    const N = SEG;
    const pos = new Float32Array(N * 2 * 3);
    const nor = new Float32Array(N * 2 * 3);
    const uv = new Float32Array(N * 2 * 2);
    const idx = new Uint32Array(N * 6);

    for (let i = 0; i < N; i++) {
      const sm = this.samples[i];
      const p = sm.pos;
      const r = sm.right;
      pos[i * 6 + 0] = p.x + r.x * aOff;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = p.z + r.z * aOff;
      pos[i * 6 + 3] = p.x + r.x * bOff;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = p.z + r.z * bOff;

      nor[i * 6 + 1] = 1;
      nor[i * 6 + 4] = 1;

      const v = sm.s / vScale;
      uv[i * 4 + 0] = 0;
      uv[i * 4 + 1] = v;
      uv[i * 4 + 2] = 1;
      uv[i * 4 + 3] = v;
    }

    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      idx[i * 6 + 0] = i * 2;
      idx[i * 6 + 1] = i * 2 + 1;
      idx[i * 6 + 2] = j * 2;
      idx[i * 6 + 3] = i * 2 + 1;
      idx[i * 6 + 4] = j * 2 + 1;
      idx[i * 6 + 5] = j * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    return geo;
  }

  _add(geo, mat) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    this.group.add(mesh);
    this._disposables.push(geo, mat);
    return mesh;
  }

  /* ── 路面 ───────────────────────────────── */

  _roadTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const g = c.getContext('2d');

    g.fillStyle = '#161f2a';
    g.fillRect(0, 0, 256, 512);

    // 沥青噪点
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      const a = Math.random() * 0.1;
      g.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.6})`;
      g.fillRect(x, y, 1.6, 1.6);
    }

    // 中心虚线（周期 16 单位 → 6 单位实线）
    g.fillStyle = 'rgba(215, 244, 255, .55)';
    g.fillRect(124, 36, 8, 190);

    // 内侧边线
    g.fillStyle = 'rgba(180, 235, 255, .35)';
    g.fillRect(22, 0, 3, 512);
    g.fillRect(231, 0, 3, 512);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this._disposables.push(tex);
    return tex;
  }

  _buildSurface() {
    const { accent, accent2 } = this.level;
    const w = this.level.width;
    const half = this.half;

    // 主路面
    const roadMat = new THREE.MeshStandardMaterial({
      map: this._roadTexture(),
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.18,
      emissive: 0x0a1620,
      emissiveIntensity: 0.5,
      envMapIntensity: 0.35,
    });
    this._add(this._ribbon(-half, half, 0), roadMat);

    // 路肩上的一圈暗色边条，增加厚度感
    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x0b1420,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x04121a,
      emissiveIntensity: 1,
    });
    this._add(this._ribbon(-half - 1.5, -half, 0.04), shoulderMat);
    this._add(this._ribbon(half, half + 1.5, 0.04), shoulderMat);

    // 霓虹边线
    const edgeL = new THREE.MeshBasicMaterial({ color: accent, toneMapped: false });
    const edgeR = new THREE.MeshBasicMaterial({ color: accent2, toneMapped: false });
    this._add(this._ribbon(-half - 0.14, -half + 0.16, 0.07), edgeL);
    this._add(this._ribbon(half - 0.16, half + 0.14, 0.07), edgeR);

    this.edgeMats = [edgeL, edgeR];
    this.edgeBase = [new THREE.Color(accent), new THREE.Color(accent2)];

    // 外侧光晕
    const glowL = new THREE.MeshBasicMaterial({
      color: accent, transparent: true, opacity: 0.13,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const glowR = new THREE.MeshBasicMaterial({
      color: accent2, transparent: true, opacity: 0.13,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    this._add(this._ribbon(-half - 3.2, -half, 0.05), glowL);
    this._add(this._ribbon(half, half + 3.2, 0.05), glowR);

    // 路缘石（红白相间，真实赛道的标志物）
    const curbMat = new THREE.MeshStandardMaterial({
      map: this._curbTexture(),
      roughness: 0.7,
      metalness: 0.05,
      envMapIntensity: 0.3,
    });
    this._add(this._ribbon(half + 0.05, half + 1.35, 0.09, 2), curbMat);
    this._add(this._ribbon(-half - 1.35, -half - 0.05, 0.09, 2), curbMat);
  }

  _curbTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const g = c.getContext('2d');

    for (let y = 0; y < 128; y += 16) {
      g.fillStyle = (y / 16) % 2 === 0 ? '#eef4f8' : '#d8435e';
      g.fillRect(0, y, 64, 16);
    }

    // 顶部暗边与底部磨损，让条纹有厚度感
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillRect(0, 0, 64, 2);
    g.fillRect(0, 126, 64, 2);
    for (let i = 0; i < 140; i++) {
      g.fillStyle = `rgba(0,0,0,${Math.random() * 0.22})`;
      g.fillRect(Math.random() * 64, Math.random() * 128, 1.4, 1.4);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this._disposables.push(tex);
    return tex;
  }

  /* ── 护栏灯柱 ───────────────────────────── */

  _buildPosts() {
    const { accent, accent2 } = this.level;
    const step = 11;
    const half = this.half + 1.6;
    const count = Math.floor(this.length / step) * 2;

    const geo = new THREE.BoxGeometry(0.16, 1.5, 0.16);
    const ballGeo = new THREE.SphereGeometry(0.15, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xffffff });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const balls = new THREE.InstancedMesh(ballGeo, mat, count);
    inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    balls.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const m = new THREE.Matrix4();
    const colL = new THREE.Color(accent);
    const colR = new THREE.Color(accent2);
    let k = 0;

    for (let s = 0; s < this.length && k < count; s += step) {
      const i = Math.floor(s / this.ds) % SEG;
      const sm = this.samples[i];
      for (let side = -1; side <= 1; side += 2) {
        if (k >= count) break;
        const x = sm.pos.x + sm.right.x * half * side;
        const z = sm.pos.z + sm.right.z * half * side;

        m.makeTranslation(x, 0.72, z);
        inst.setMatrixAt(k, m);
        m.makeTranslation(x, 1.56, z);
        balls.setMatrixAt(k, m);

        inst.setColorAt(k, side < 0 ? colL : colR);
        balls.setColorAt(k, side < 0 ? colL : colR);
        k++;
      }
    }
    inst.count = k;
    balls.count = k;
    inst.instanceMatrix.needsUpdate = true;
    balls.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    if (balls.instanceColor) balls.instanceColor.needsUpdate = true;
    inst.frustumCulled = false;
    balls.frustumCulled = false;
    this.group.add(inst, balls);
    this._disposables.push(geo, ballGeo, mat);
  }

  /* ── 门（起终点 / 检查点） ─────────────── */

  _labelTexture(text, color) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 96;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 512, 96);
    g.font = 'bold 52px ui-monospace, Consolas, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = color;
    g.shadowBlur = 22;
    g.fillStyle = color;
    g.fillText(text, 256, 50);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this._disposables.push(tex);
    return tex;
  }

  _makeGate(s, color, label) {
    const i = Math.round(s / this.ds) % SEG;
    const sm = this.samples[i];
    const half = this.half + 1.1;
    const h = 6.2;

    const g = new THREE.Group();
    g.position.copy(sm.pos);
    g.rotation.y = Math.atan2(-sm.right.z, sm.right.x);

    const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const pillarGeo = new THREE.BoxGeometry(0.42, h, 0.42);
    const beamGeo = new THREE.BoxGeometry((half + 1.1) * 2, 0.34, 0.42);

    const pL = new THREE.Mesh(pillarGeo, mat);
    pL.position.set(-half, h / 2, 0);
    const pR = new THREE.Mesh(pillarGeo, mat);
    pR.position.set(half, h / 2, 0);
    const beam = new THREE.Mesh(beamGeo, mat);
    beam.position.set(0, h, 0);

    g.add(pL, pR, beam);

    const tex = this._labelTexture(label, '#' + new THREE.Color(color).getHexString());
    const labelMat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, side: THREE.DoubleSide,
      depthWrite: false, toneMapped: false,
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.7), labelMat);
    plate.position.set(0, h - 0.9, 0.3);
    g.add(plate);

    // 地面光带：从门脚下铺一道横向光，标示要通过的位置
    const floorGeo = new THREE.PlaneGeometry((half + 1.1) * 2, 2.8);
    const beamMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.26,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const floorBeam = new THREE.Mesh(floorGeo, beamMat);
    floorBeam.rotation.x = -Math.PI / 2;
    floorBeam.position.set(0, 0.05, 0);
    g.add(floorBeam);

    this._disposables.push(pillarGeo, beamGeo, mat, labelMat, plate.geometry, floorGeo, beamMat);
    g.userData.materials = [mat, beamMat];
    g.userData.passed = false;
    return g;
  }

  _buildGates() {
    this.startGate = this._makeGate(0.6, this.level.accent, 'START // FINISH');
    this.group.add(this.startGate);

    this.checkpoints = this.level.checkpoints.map((t, i) => {
      const s = t * this.length;
      const mesh = this._makeGate(s, this.level.accent2, `CP ${String(i + 1).padStart(2, '0')}`);
      this.group.add(mesh);
      return { index: i, s, mesh, passed: false };
    });
  }

  /** 广告牌缓慢摆动，增加场景动感 */
  tick(t) {
    if (!this.billboards) return;
    for (let i = 0; i < this.billboards.length; i++) {
      this.billboards[i].rotation.y = this.billboardYaw[i] + Math.sin(t * 0.5 + i * 1.1) * 0.2;
    }
  }

  /** 边线呼吸灯：加速时更亮 */
  pulse(time, boost = false) {
    if (!this.edgeMats) return;
    const k = 0.85 + Math.sin(time * 2.4) * 0.12 + (boost ? 0.3 : 0);
    this.edgeMats[0].color.copy(this.edgeBase[0]).multiplyScalar(k);
    this.edgeMats[1].color.copy(this.edgeBase[1]).multiplyScalar(k);
  }

  /* ── 远景城市剪影 ───────────────────────── */

  _buildCity() {
    const count = 34;

    let radius = 0;
    for (const s of this.samples) {
      const d = Math.hypot(s.pos.x, s.pos.z);
      if (d > radius) radius = d;
    }
    radius += 70;

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x0a1420,
      roughness: 0.92,
      metalness: 0.08,
      emissive: 0x05101a,
      emissiveIntensity: 0.55,
    });
    const lightGeo = new THREE.BoxGeometry(1, 1, 1);
    const lightMat = new THREE.MeshBasicMaterial({ toneMapped: false });

    const inst = new THREE.InstancedMesh(boxGeo, boxMat, count);
    const lights = new THREE.InstancedMesh(lightGeo, lightMat, count);
    inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    lights.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const m = new THREE.Matrix4();
    const palette = [
      new THREE.Color(this.level.accent),
      new THREE.Color(this.level.accent2),
      new THREE.Color(0xffcc66),
    ];

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.34;
      const r = radius + Math.random() * 210;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const w = 12 + Math.random() * 24;
      const h = 22 + Math.random() * 84;
      const d = 12 + Math.random() * 24;

      m.makeScale(w, h, d);
      m.setPosition(x, h / 2 - 2, z);
      inst.setMatrixAt(i, m);

      m.makeScale(w * 0.42, 1.3, d * 0.42);
      m.setPosition(x, h - 2.3, z);
      lights.setMatrixAt(i, m);
      lights.setColorAt(i, palette[Math.random() * palette.length | 0]);
    }

    inst.instanceMatrix.needsUpdate = true;
    lights.instanceMatrix.needsUpdate = true;
    if (lights.instanceColor) lights.instanceColor.needsUpdate = true;
    inst.frustumCulled = false;
    lights.frustumCulled = false;
    this.group.add(inst, lights);
    this._disposables.push(boxGeo, boxMat, lightGeo, lightMat);
  }

  /* ── 路边霓虹广告牌 ─────────────────────── */
  _billboardTexture(text, color) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 384;
    const g = c.getContext('2d');
    const hex = '#' + new THREE.Color(color).getHexString();

    g.fillStyle = 'rgba(4, 12, 18, .9)';
    g.fillRect(0, 0, 1024, 384);

    g.strokeStyle = hex;
    g.lineWidth = 7;
    g.shadowColor = hex;
    g.shadowBlur = 26;
    g.strokeRect(16, 16, 992, 352);

    g.shadowBlur = 0;
    g.font = 'bold 32px ui-monospace, Consolas, monospace';
    g.fillStyle = 'rgba(150, 220, 240, .5)';
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillText('// cpp', 48, 78);

    g.shadowColor = hex;
    g.shadowBlur = 28;
    g.fillStyle = hex;
    g.font = 'bold 92px ui-monospace, Consolas, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 512, 214);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this._disposables.push(tex);
    return tex;
  }

  _buildBillboards() {
    const texts = ['std::vector', 'O(n log n)', 'constexpr', 'RAII', 'noexcept', 'template<T>', 'std::move', 'O(1)'];
    const accent = this.level.accent;
    const accent2 = this.level.accent2;
    const w = 15;
    const h = 5.6;
    const y = 8.4;

    const planeGeo = new THREE.PlaneGeometry(w, h);
    const postGeo = new THREE.BoxGeometry(0.36, y, 0.36);
    const postMat = new THREE.MeshBasicMaterial({ color: 0x16323f, toneMapped: false });
    this._disposables.push(planeGeo, postGeo, postMat);

    this.billboards = [];
    this.billboardYaw = [];

    for (let i = 0; i < texts.length; i++) {
      const t = (i + 0.38) / texts.length;
      const idx = Math.floor(t * SEG) % SEG;
      const sm = this.samples[idx];
      const side = i % 2 === 0 ? 1 : -1;
      const dist = this.half + 22 + (i % 3) * 6;
      const px = sm.pos.x + sm.right.x * side * dist;
      const pz = sm.pos.z + sm.right.z * side * dist;

      const dir = sm.right.clone().multiplyScalar(-side);
      const yaw = Math.atan2(dir.x, dir.z);

      const tex = this._billboardTexture(texts[i], i % 2 === 0 ? accent : accent2);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, side: THREE.DoubleSide,
        toneMapped: false,
      });
      this._disposables.push(mat);

      const panel = new THREE.Mesh(planeGeo, mat);
      panel.position.set(px, y, pz);
      panel.rotation.y = yaw;
      this.group.add(panel);
      this.billboards.push(panel);
      this.billboardYaw.push(yaw);

      const lateral = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      for (const s of [-1, 1]) {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(
          px + lateral.x * s * (w / 2 - 1.2),
          y / 2,
          pz + lateral.z * s * (w / 2 - 1.2),
        );
        this.group.add(post);
      }
    }
  }

  markPassed(checkpoint) {
    if (checkpoint.passed) return;
    checkpoint.passed = true;
    checkpoint.mesh.userData.materials.forEach((m) => m.color.set(0x8dffb8));
  }

  resetCheckpoints() {
    this.checkpoints.forEach((cp) => {
      cp.passed = false;
      cp.mesh.userData.materials.forEach((m) => m.color.set(this.level.accent2));
    });
  }

  /* ── 查询 ───────────────────────────────── */

  nearest(pos, lastIndex = -1) {
    let best = 0;
    let bestD = Infinity;

    if (lastIndex < 0) {
      for (let i = 0; i < SEG; i++) {
        const d = (pos.x - this.samples[i].pos.x) ** 2 + (pos.z - this.samples[i].pos.z) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
    } else {
      const win = 80;
      for (let k = -win; k <= win; k++) {
        const i = (lastIndex + k + SEG) % SEG;
        const d = (pos.x - this.samples[i].pos.x) ** 2 + (pos.z - this.samples[i].pos.z) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      // 命中窗口边缘 → 视为脱离赛道，做一次全局搜索
      let off = Math.abs((best - lastIndex + SEG) % SEG);
      if (off > SEG / 2) off = SEG - off;
      if (off >= win - 2) {
        bestD = Infinity;
        for (let i = 0; i < SEG; i++) {
          const d = (pos.x - this.samples[i].pos.x) ** 2 + (pos.z - this.samples[i].pos.z) ** 2;
          if (d < bestD) { bestD = d; best = i; }
        }
      }
    }

    const sm = this.samples[best];
    const dx = pos.x - sm.pos.x;
    const dz = pos.z - sm.pos.z;
    return {
      index: best,
      s: best * this.ds,
      center: sm.pos,
      right: sm.right,
      tan: sm.tan,
      lateral: dx * sm.right.x + dz * sm.right.z,
    };
  }

  sampleAtS(s) {
    const i = Math.round(((s % this.length) + this.length) % this.length / this.ds) % SEG;
    return this.samples[i];
  }

  startPose() {
    const sm = this.samples[0];
    const yaw = Math.atan2(-sm.tan.x, -sm.tan.z);
    const pos = sm.pos.clone().addScaledVector(sm.tan, -6);
    return { pos, yaw };
  }

  dispose() {
    this._disposables.forEach((d) => d.dispose && d.dispose());
    this._disposables.length = 0;
    this.group.clear();
  }
}
