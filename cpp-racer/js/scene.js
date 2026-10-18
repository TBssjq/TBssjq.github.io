import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = /* glsl */`
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
varying vec3 vDir;
void main() {
  float h = vDir.y;
  vec3 c = mix(uHorizon, uTop, smoothstep(0.02, 0.62, h));
  c = mix(uBottom, c, smoothstep(-0.4, 0.03, h));
  gl_FragColor = vec4(c, 1.0);
}
`;

/** 渲染舞台：相机、灯光、天空、后处理 */
export class Stage {
  constructor(canvas) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04070c, 0.0031);
    this.scene.background = new THREE.Color(0x04070c);

    this.camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 2800);
    this.camera.position.set(0, 160, 320);

    this._camPos = new THREE.Vector3().copy(this.camera.position);
    this._camLook = new THREE.Vector3(0, 0, 0);

    this._buildLights();
    this._buildSky();
    this._buildEnvironment();

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.62, 0.55, 0.72);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  _buildLights() {
    this.hemi = new THREE.HemisphereLight(0x9fd8ff, 0x0a0a14, 0.5);
    this.scene.add(this.hemi);

    this.dir = new THREE.DirectionalLight(0xd6f2ff, 0.75);
    this.dir.position.set(120, 220, 90);
    this.scene.add(this.dir);

    this.rim = new THREE.DirectionalLight(0xff2f7d, 0.35);
    this.rim.position.set(-160, 80, -140);
    this.scene.add(this.rim);
  }

  _buildSky() {
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0x02060c) },
      uHorizon: { value: new THREE.Color(0x0a2233) },
      uBottom: { value: new THREE.Color(0x020408) },
    };

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(2000, 32, 24),
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    );
    sky.frustumCulled = false;
    this.scene.add(sky);

    // 星尘
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.05 + Math.random() * 0.9);
      const r = 1250 + Math.random() * 480;
      pos[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.85 + 60;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xbfe9ff,
        size: 1.7,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        fog: false,
      }),
    );
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);

    // 地面网格
    this.grid = new THREE.GridHelper(6000, 300, 0x1d5068, 0x10303f);
    this.grid.position.y = -9;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.6;
    this.grid.material.depthWrite = false;
    this.scene.add(this.grid);
  }

  /** 用 canvas 画一张霓虹环境图，PMREM 后给车漆做反射 */
  _buildEnvironment() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const g = c.getContext('2d');

    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#01040a');
    grad.addColorStop(0.42, '#061420');
    grad.addColorStop(0.49, '#12323f');
    grad.addColorStop(0.52, '#071018');
    grad.addColorStop(1, '#010206');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 512);

    // 地平线霓虹带（压低亮度，避免车漆出现死白反光）
    g.fillStyle = 'rgba(34,230,255,.34)';
    g.fillRect(0, 256, 1024, 2);
    g.fillStyle = 'rgba(255,47,125,.3)';
    g.fillRect(0, 262, 1024, 2);
    g.fillStyle = 'rgba(34,230,255,.08)';
    g.fillRect(0, 266, 1024, 40);

    // 顶部零散灯点
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 190;
      g.fillStyle = `rgba(190,240,255,${0.15 + Math.random() * 0.5})`;
      g.fillRect(x, y, 1.6, 1.6);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromEquirectangular(tex);
    this.envMap = rt.texture;
    this.scene.environment = this.envMap;

    tex.dispose();
    pmrem.dispose();
  }

  setLevel(level) {
    this.scene.fog.color.set(level.fog);
    this.scene.background.set(level.fog);
    this.skyUniforms.uHorizon.value.set(level.fog).lerp(new THREE.Color(level.accent), 0.13);
    this.skyUniforms.uTop.value.set(level.fog).multiplyScalar(0.45);
    this.rim.color.set(level.accent2);
    this.hemi.color.set(level.accent).lerp(new THREE.Color(0xffffff), 0.75);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
  }

  snapTo(car) {
    const fx = -Math.sin(car.yaw);
    const fz = -Math.cos(car.yaw);
    this._camPos.set(car.pos.x - fx * 9.2, 4.4, car.pos.z - fz * 9.2);
    this._camLook.set(car.pos.x + fx * 12, 1.1, car.pos.z + fz * 12);
    this.camera.position.copy(this._camPos);
    this.camera.lookAt(this._camLook);
  }

  updateCamera(dt, car, shake = 0) {
    if (!car) {
      const t = performance.now() * 0.00006;
      this._camPos.set(Math.cos(t) * 400, 190, Math.sin(t) * 400);
      this.camera.position.copy(this._camPos);
      this.camera.lookAt(0, 10, 0);
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
      return;
    }

    const level = car.level;
    const ratio = Math.min(1.25, Math.abs(car.speed) / level.boostSpeed);
    const fx = -Math.sin(car.yaw);
    const fz = -Math.cos(car.yaw);

    const dist = 8.2 + ratio * 2.6;
    const height = 4.3 + ratio * 0.9;

    const px = car.pos.x - fx * dist;
    const pz = car.pos.z - fz * dist;
    const k = 1 - Math.exp(-7.5 * dt);
    this._camPos.x += (px - this._camPos.x) * k;
    this._camPos.y += (height - this._camPos.y) * k;
    this._camPos.z += (pz - this._camPos.z) * k;

    const lx = car.pos.x + fx * 13;
    const lz = car.pos.z + fz * 13;
    const kl = 1 - Math.exp(-9 * dt);
    this._camLook.x += (lx - this._camLook.x) * kl;
    this._camLook.y += (1.15 - this._camLook.y) * kl;
    this._camLook.z += (lz - this._camLook.z) * kl;

    this.camera.position.copy(this._camPos);
    if (shake > 0) {
      const s = Math.min(1.1, shake) * 0.55;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.position.z += (Math.random() - 0.5) * s;
    }
    this.camera.lookAt(this._camLook);

    const targetFov = 64 + ratio * 13 + (car.boosting ? 7 : 0);
    this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-4.5 * dt));
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.composer.render();
  }
}
