import * as THREE from 'three';

const VERT = /* glsl */`
attribute float aLife;
attribute float aSize;
attribute vec3 aColor;
varying float vLife;
varying vec3 vColor;
void main() {
  vLife = aLife;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (110.0 / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */`
varying float vLife;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.02, d) * clamp(vLife, 0.0, 1.0);
  gl_FragColor = vec4(vColor, a);
}
`;

/** GPU 点精灵粒子池（氮气尾焰 / 撞墙火花 / 检查点爆闪） */
export class Particles {
  constructor(scene, max = 900) {
    this.max = max;
    this.cursor = 0;

    this.positions = new Float32Array(max * 3);
    this.colors = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.maxLife = new Float32Array(max);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    geo.setAttribute('aLife', new THREE.BufferAttribute(this.life, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3000);

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);

    this.geo = geo;
    this.mat = mat;
    this._color = new THREE.Color();
  }

  emit(origin, count, opts = {}) {
    const {
      color = 0x22e6ff,
      speed = 7,
      size = 1.1,
      life = 0.7,
      spread = 0.7,
      dir = null,
    } = opts;

    const c = this._color.set(color);
    const max = this.max;

    for (let k = 0; k < count; k++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % max;

      const s = spread;
      this.positions[i * 3 + 0] = origin.x + (Math.random() - 0.5) * s;
      this.positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * s;
      this.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * s;

      let vx = (Math.random() - 0.5) * 2;
      let vy = (Math.random() - 0.5) * 2;
      let vz = (Math.random() - 0.5) * 2;
      const n = Math.hypot(vx, vy, vz) || 1;
      vx /= n; vy /= n; vz /= n;

      if (dir) {
        const power = 0.55 + Math.random() * 0.9;
        vx = dir.x * power + vx * 0.45;
        vy = dir.y * power + vy * 0.45;
        vz = dir.z * power + vz * 0.45;
      }

      const sp = speed * (0.55 + Math.random() * 0.9);
      this.vel[i * 3 + 0] = vx * sp;
      this.vel[i * 3 + 1] = vy * sp;
      this.vel[i * 3 + 2] = vz * sp;

      this.colors[i * 3 + 0] = c.r;
      this.colors[i * 3 + 1] = c.g;
      this.colors[i * 3 + 2] = c.b;

      this.life[i] = 1;
      this.maxLife[i] = life * (0.65 + Math.random() * 0.75);
      this.size[i] = size * (0.55 + Math.random() * 0.9);
    }

    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aLife.needsUpdate = true;
  }

  update(dt) {
    const { positions, vel, life, maxLife, size } = this;
    let active = false;

    for (let i = 0; i < this.max; i++) {
      if (life[i] <= 0) continue;
      active = true;

      life[i] -= dt / Math.max(0.05, maxLife[i]);
      if (life[i] <= 0) {
        life[i] = 0;
        size[i] = 0;
        continue;
      }

      const drag = Math.max(0, 1 - 2.1 * dt);
      vel[i * 3 + 0] *= drag;
      vel[i * 3 + 1] = vel[i * 3 + 1] * drag - 7.5 * dt;
      vel[i * 3 + 2] *= drag;

      positions[i * 3 + 0] += vel[i * 3 + 0] * dt;
      positions[i * 3 + 1] += vel[i * 3 + 1] * dt;
      positions[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }

    if (active) {
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.aLife.needsUpdate = true;
      this.geo.attributes.aSize.needsUpdate = true;
    }
  }

  dispose() {
    this.points.removeFromParent();
    this.geo.dispose();
    this.mat.dispose();
  }
}
