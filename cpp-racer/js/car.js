import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/* ── 车身放样：用一组横截面生成流线型车壳 ── */

function section(w, y0, ys, yt) {
  const mid = y0 + (ys - y0) * 0.42;
  return {
    yMid: (y0 + yt) / 2,
    pts: [
      [w * 0.72, y0], [w, mid], [w, ys], [w * 0.5, yt],
      [-w * 0.5, yt], [-w, ys], [-w, mid], [-w * 0.72, y0],
    ],
  };
}

function loft(sections, caps = true) {
  const m = sections[0].pts.length;
  const n = sections.length;
  const pos = [];
  const idx = [];

  sections.forEach((s) => {
    s.pts.forEach((p) => pos.push(p[0], p[1], s.z));
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < m; j++) {
      const a = i * m + j;
      const b = i * m + ((j + 1) % m);
      const c = (i + 1) * m + ((j + 1) % m);
      const d = (i + 1) * m + j;
      idx.push(a, b, c, a, c, d);
    }
  }

  if (caps) {
    const head = pos.length / 3;
    pos.push(0, sections[0].yMid, sections[0].z);
    for (let j = 0; j < m; j++) idx.push(head, (j + 1) % m, j);

    const base = (n - 1) * m;
    const tail = pos.length / 3;
    pos.push(0, sections[n - 1].yMid, sections[n - 1].z);
    for (let j = 0; j < m; j++) idx.push(tail, base + j, base + ((j + 1) % m));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 赛车：放样车身 + 玻璃座舱 + 轮辐车轮 + 霓虹部件。
 * 车头朝 -Z，yaw 增加 = 左转。
 */
export class Car {
  constructor(scene, level) {
    this.level = level;
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);
    scene.add(this.group);

    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.speed = 0;
    this.nitro = 100;
    this.boosting = false;
    this.trackIndex = 0;
    this.wheelSpin = 0;
    this.impact = 0;
    this.wallTimer = 0;
    this._disposables = [];

    this._build(level.accent, level.accent2);
  }

  _build(accent, accent2) {
    const D = this._disposables;

    const paint = new THREE.MeshStandardMaterial({
      color: 0x1e3644,
      metalness: 0.5,
      roughness: 0.42,
      emissive: 0x05131b,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
      envMapIntensity: 0.6,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x0a1e2a,
      metalness: 0.3,
      roughness: 0.45,
      emissive: 0x001722,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
      envMapIntensity: 0.55,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x0a1016, metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x8ea8b8, metalness: 0.95, roughness: 0.25, envMapIntensity: 1.2,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x05070a, metalness: 0.12, roughness: 0.92 });
    const glow = new THREE.MeshBasicMaterial({ color: accent, toneMapped: false });
    const glow2 = new THREE.MeshBasicMaterial({ color: accent2, toneMapped: false });
    const white = new THREE.MeshBasicMaterial({ color: 0xdcf8ff, toneMapped: false });
    D.push(paint, glass, dark, rimMat, tireMat, glow, glow2, white);

    // 供展厅 / 自定义配色使用
    this.materials = { paint, glass, dark, rim: rimMat, tire: tireMat, glow, glow2, white };

    const add = (geo, mat, x, y, z, parent = this.body) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      D.push(geo);
      return mesh;
    };

    /* 车身 */
    const shellGeo = loft([
      { z: -2.34, ...section(0.46, 0.28, 0.34, 0.41) },
      { z: -2.02, ...section(0.72, 0.17, 0.42, 0.5) },
      { z: -1.5, ...section(0.94, 0.14, 0.56, 0.65) },
      { z: -0.82, ...section(1.01, 0.12, 0.67, 0.77) },
      { z: -0.08, ...section(1.03, 0.12, 0.71, 0.81) },
      { z: 0.72, ...section(1.01, 0.12, 0.71, 0.81) },
      { z: 1.52, ...section(0.97, 0.15, 0.67, 0.77) },
      { z: 2.14, ...section(0.9, 0.21, 0.58, 0.69) },
    ]);
    const shell = add(shellGeo, paint, 0, 0, 0);
    shell.name = 'shell';

    /* 座舱 */
    const cabinGeo = loft([
      { z: -0.78, ...section(0.56, 0.74, 0.78, 0.82) },
      { z: -0.36, ...section(0.63, 0.8, 0.98, 1.12) },
      { z: 0.42, ...section(0.6, 0.82, 1.0, 1.1) },
      { z: 0.9, ...section(0.5, 0.78, 0.86, 0.9) },
    ], false);
    const cabin = add(cabinGeo, glass, 0, 0, 0);
    cabin.name = 'cabin';

    /* 前分流器 / 后扩散器 */
    add(new THREE.BoxGeometry(1.66, 0.07, 0.42), dark, 0, 0.14, -2.18);
    add(new THREE.BoxGeometry(1.72, 0.06, 0.3), dark, 0, 0.16, 2.2);
    for (const x of [-0.52, 0, 0.52]) {
      add(new THREE.BoxGeometry(0.06, 0.16, 0.42), dark, x, 0.24, 2.16);
    }

    /* 侧裙 + 霓虹条 */
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(0.16, 0.14, 2.3), dark, s * 0.98, 0.2, 0.1);
      add(new THREE.BoxGeometry(0.045, 0.05, 2.1), glow, s * 1.03, 0.27, 0.1);
      // 侧进气口
      add(new THREE.BoxGeometry(0.06, 0.16, 0.5), dark, s * 1.0, 0.52, 0.55);
    }

    /* 尾翼 */
    add(new THREE.BoxGeometry(1.86, 0.06, 0.44), paint, 0, 1.02, 2.06);
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(0.05, 0.22, 0.52), dark, s * 0.92, 1.02, 2.06);
      add(new THREE.BoxGeometry(0.07, 0.34, 0.1), dark, s * 0.62, 0.88, 2.02);
    }
    add(new THREE.BoxGeometry(1.88, 0.035, 0.05), glow2, 0, 1.06, 2.28);

    /* 灯组 */
    add(new THREE.BoxGeometry(0.3, 0.06, 0.05), white, -0.3, 0.35, -2.33);
    add(new THREE.BoxGeometry(0.3, 0.06, 0.05), white, 0.3, 0.35, -2.33);
    add(new THREE.BoxGeometry(1.5, 0.07, 0.05), glow2, 0, 0.6, 2.19);
    add(new THREE.BoxGeometry(0.34, 0.1, 0.05), glow2, -0.62, 0.43, 2.2);
    add(new THREE.BoxGeometry(0.34, 0.1, 0.05), glow2, 0.62, 0.43, 2.2);

    /* 后视镜 */
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(0.2, 0.06, 0.12), dark, s * 0.95, 0.83, -0.62);
      add(new THREE.BoxGeometry(0.05, 0.05, 0.14), dark, s * 0.86, 0.8, -0.62);
    }

    /* 底盘光晕（径向渐变贴图） */
    const glowCv = document.createElement('canvas');
    glowCv.width = glowCv.height = 128;
    const g2 = glowCv.getContext('2d');
    const grad = g2.createRadialGradient(64, 64, 3, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255,255,255,.9)');
    grad.addColorStop(0.45, 'rgba(255,255,255,.28)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCv);

    const underGeo = new THREE.PlaneGeometry(3.0, 5.0);
    const underMat = new THREE.MeshBasicMaterial({
      map: glowTex, color: accent, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const under = new THREE.Mesh(underGeo, underMat);
    under.rotation.x = -Math.PI / 2;
    under.position.y = 0.03;
    this.body.add(under);
    D.push(underGeo, underMat, glowTex);

    /* 车轮 */
    const tireGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
    const rimGeo = new THREE.CylinderGeometry(0.62, 0.62, 1, 20);
    const spokeGeo = new THREE.BoxGeometry(1, 1, 1);
    const ringGeo = new THREE.TorusGeometry(0.66, 0.04, 6, 26);
    const capGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
    D.push(tireGeo, rimGeo, spokeGeo, ringGeo, capGeo);

    this.wheels = [];
    const spots = [
      [-0.94, -1.42, 0.4, 0.34, true], [0.94, -1.42, 0.4, 0.34, true],
      [-0.98, 1.5, 0.44, 0.42, false], [0.98, 1.5, 0.44, 0.42, false],
    ];

    for (const [x, z, radius, wdt, front] of spots) {
      const hub = new THREE.Group();
      hub.position.set(x, radius, z);

      const spin = new THREE.Group();

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.scale.set(radius, wdt, radius);
      tire.rotation.z = Math.PI / 2;

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.scale.set(radius, wdt * 1.03, radius);
      rim.rotation.z = Math.PI / 2;

      const ring = new THREE.Mesh(ringGeo, glow);
      ring.rotation.y = Math.PI / 2;
      ring.scale.setScalar(radius);
      ring.position.x = wdt * 0.53;

      const cap = new THREE.Mesh(capGeo, glow);
      cap.scale.set(radius * 0.3, wdt * 1.08, radius * 0.3);
      cap.rotation.z = Math.PI / 2;

      spin.add(tire, rim, ring, cap);

      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.scale.set(wdt * 0.82, radius * 1.86, radius * 0.13);
        spoke.rotation.x = (i / 5) * Math.PI;
        spin.add(spoke);
      }

      hub.add(spin);
      this.body.add(hub);
      this.wheels.push({ hub, spin, front });
    }

    /* 接地阴影：贴在路面上的椭圆软阴影，让车真正"落"在地面 */
    const shCv = document.createElement('canvas');
    shCv.width = 128;
    shCv.height = 256;
    const sg = shCv.getContext('2d');
    const shGrad = sg.createRadialGradient(64, 128, 4, 64, 128, 124);
    shGrad.addColorStop(0, 'rgba(0,0,0,.7)');
    shGrad.addColorStop(0.42, 'rgba(0,0,0,.34)');
    shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sg.setTransform(1, 0, 0, 0.42, 0, 0);
    sg.fillStyle = shGrad;
    sg.fillRect(0, 0, 128, 256);
    const shadowTex = new THREE.CanvasTexture(shCv);

    const shadowGeo = new THREE.PlaneGeometry(3.6, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex, transparent: true, opacity: 0.9, depthWrite: false,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.03;
    this.group.add(this.shadow);
    D.push(shadowGeo, shadowMat, shadowTex);

    /* 氮气尾焰 */    const flameGeo = new THREE.ConeGeometry(0.16, 1.0, 10);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xa8f6ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    D.push(flameGeo, flameMat);
    this.flames = [-0.34, 0.34].map((x) => {
      const f = new THREE.Mesh(flameGeo, flameMat);
      f.position.set(x, 0.44, 2.42);
      f.rotation.x = Math.PI / 2;
      this.body.add(f);
      return f;
    });
    this.flameMat = flameMat;

    /* 灯光 */
    const headlight = new THREE.SpotLight(0xcdefff, 220, 110, 0.42, 0.95, 1.7);
    headlight.position.set(0, 0.62, -2.1);
    headlight.target.position.set(0, -0.3, -40);
    this.body.add(headlight, headlight.target);
    this.headlight = headlight;

    const underLight = new THREE.PointLight(accent, 30, 15, 2);
    underLight.position.set(0, 0.2, 0);
    this.body.add(underLight);

    // 车顶补光改成贴近车身的前侧光，避免在车顶形成死白高光
    const fill = new THREE.PointLight(0xa8e8ff, 26, 14, 2);
    fill.position.set(0, 2.2, -3.2);
    this.body.add(fill);
  }

  /* ── 物理 ───────────────────────────────── */

  reset(pose) {
    this.pos.copy(pose.pos);
    this.yaw = pose.yaw;
    this.speed = 0;
    this.nitro = 100;
    this.boosting = false;
    this.trackIndex = 0;
    this.wallTimer = 0;
    this.wheelSpin = 0;
    this.body.rotation.set(0, 0, 0);
    this.flameMat.opacity = 0;
    this.sync();
  }

  update(dt, input, track, onWall) {
    const L = this.level;
    const boosting = input.boost && this.nitro > 0.5 && this.speed > 2;
    this.boosting = boosting;

    let accel = 0;
    if (input.throttle > 0) accel = L.accel * (1.05 - this.speed / (L.maxSpeed * 1.05));
    else if (input.throttle < 0) accel = -46 + Math.max(0, this.speed) * 0.55;
    if (boosting) accel += L.accel * 1.7;

    this.speed += accel * dt;
    this.speed -= this.speed * (boosting ? 0.24 : 0.5) * dt;

    const max = boosting ? L.boostSpeed : L.maxSpeed;
    this.speed = clamp(this.speed, -16, max);
    if (input.throttle === 0 && Math.abs(this.speed) < 0.3) this.speed = 0;

    if (boosting) this.nitro = Math.max(0, this.nitro - 27 * dt);
    else this.nitro = Math.min(100, this.nitro + 7.5 * dt);

    const ratio = Math.min(1, Math.abs(this.speed) / L.maxSpeed);
    const steerRate = 1.9 * (1 - ratio * 0.4);
    const grip = Math.min(1, Math.abs(this.speed) / 9);
    this.yaw = wrapAngle(this.yaw + input.steer * steerRate * grip * dt * Math.sign(this.speed || 1));

    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    this.pos.x += fx * this.speed * dt;
    this.pos.z += fz * this.speed * dt;

    const near = track.nearest(this.pos, this.trackIndex);
    this.trackIndex = near.index;

    this.wallTimer = Math.max(0, this.wallTimer - dt);

    const limit = track.half - 1.2;
    if (Math.abs(near.lateral) > limit) {
      const sign = Math.sign(near.lateral) || 1;
      const push = Math.abs(near.lateral) - limit;
      this.pos.x -= near.right.x * sign * push;
      this.pos.z -= near.right.z * sign * push;

      if (this.wallTimer <= 0) {
        const roadYaw = Math.atan2(-near.tan.x, -near.tan.z);
        const angle = Math.abs(wrapAngle(roadYaw - this.yaw));
        const bite = Math.min(1, angle / 1.15);
        const loss = 0.9 - bite * 0.55;
        if (Math.abs(this.speed) > 10) onWall(Math.abs(this.speed) * bite, near);
        this.speed *= loss;
        this.wallTimer = 0.28;
      }

      const roadYaw = Math.atan2(-near.tan.x, -near.tan.z);
      const diff = wrapAngle(roadYaw - this.yaw);
      this.yaw = wrapAngle(this.yaw + diff * 0.1);
    }

    this.impact = Math.max(0, this.impact - dt * 6);
    this.sync(dt, input, ratio);
    return near;
  }

  sync(dt = 0, input = null, ratio = 0) {
    this.group.position.copy(this.pos);
    this.group.rotation.y = this.yaw;

    if (dt > 0) {
      this.wheelSpin += (this.speed * dt) / 0.4;
      const steer = input ? input.steer : 0;
      for (const w of this.wheels) {
        w.spin.rotation.x = this.wheelSpin;
        w.hub.rotation.y = w.front ? steer * 0.42 : 0;
      }
      const lean = input ? -input.steer * 0.05 * (0.35 + ratio) : 0;
      const pitch = input ? -input.throttle * 0.02 * ratio : 0;
      this.body.rotation.z += (lean - this.body.rotation.z) * Math.min(1, dt * 8);
      this.body.rotation.x += (pitch - this.body.rotation.x) * Math.min(1, dt * 8);
      this.flameMat.opacity = this.boosting ? 0.55 + Math.random() * 0.4 : 0;
      const s = this.boosting ? 1.6 + Math.random() * 0.5 : 0.6;
      this.flames.forEach((f) => f.scale.set(1, s, 1));
    }
  }

  tailWorld(target = new THREE.Vector3()) {
    return target.set(
      this.pos.x + Math.sin(this.yaw) * 2.3,
      0.45,
      this.pos.z + Math.cos(this.yaw) * 2.3,
    );
  }

  /** 用于轮胎烟雾：某只后轮的世界坐标 */
  rearWheelWorld(side = 1, target = new THREE.Vector3()) {
    const lx = side * 1.0;
    const lz = 1.5;
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    return target.set(
      this.pos.x + lx * cos + lz * sin,
      0.15,
      this.pos.z - lx * sin + lz * cos,
    );
  }

  dispose() {
    this.group.removeFromParent();
    this._disposables.forEach((d) => d.dispose && d.dispose());
    this._disposables.length = 0;
  }
}
