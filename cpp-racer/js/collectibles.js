import * as THREE from 'three';

/**
 * 赛道上的「知识点节点」：八面体 + 线框外壳 + 地面光柱。
 * 车靠近即收集，返回节点数据交给主循环弹出知识卡。
 */
export class Collectibles {
  constructor(scene, track, level) {
    this.group = new THREE.Group();
    this.items = [];
    this._t = 0;

    const color = level.accent2;
    const coreGeo = new THREE.OctahedronGeometry(0.52, 0);
    const shellGeo = new THREE.IcosahedronGeometry(0.98, 0);
    const ringGeo = new THREE.RingGeometry(0.85, 1.3, 32);
    const beamGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.4, 6);

    const coreMat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const shellMat = new THREE.MeshBasicMaterial({
      color, wireframe: true, transparent: true, opacity: 0.5, toneMapped: false,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.32, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const beamMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });

    this._disposables = [coreGeo, shellGeo, ringGeo, beamGeo, coreMat, shellMat, ringMat, beamMat];

    (level.nodes || []).forEach((node, i) => {
      const s = node.t * track.length;
      const sm = track.sampleAtS(s);
      const side = i % 2 === 0 ? 1 : -1;
      const offset = i === 0 ? 0 : side * Math.min(2.2, track.half * 0.22);

      const base = sm.pos.clone().addScaledVector(sm.right, offset);
      const holder = new THREE.Group();
      holder.position.set(base.x, 0, base.z);

      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 1.6;

      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.position.y = 1.6;

      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06;

      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.7;

      holder.add(core, shell, ring, beam);
      this.group.add(holder);

      this.items.push({
        ...node,
        index: i,
        holder,
        core,
        shell,
        s,
        baseY: 1.6,
        phase: Math.random() * Math.PI * 2,
        taken: false,
      });
    });

    scene.add(this.group);
    this.collected = 0;
  }

  get total() {
    return this.items.length;
  }

  /**
   * @param {number} carS 赛车当前弧长（横向不敏感，只要开过就收集）
   */
  update(dt, carPos, carS = Number.NEGATIVE_INFINITY, total = 1) {
    this._t += dt;
    let hit = null;

    for (const item of this.items) {
      if (item.taken) continue;

      const bob = Math.sin(this._t * 1.8 + item.phase) * 0.28;
      item.core.position.y = item.baseY + bob;
      item.shell.position.y = item.baseY + bob;
      item.core.rotation.y += dt * 1.7;
      item.core.rotation.x += dt * 0.6;
      item.shell.rotation.y -= dt * 0.9;
      item.shell.rotation.z += dt * 0.4;

      let d = Math.abs(carS - item.s);
      if (d > total / 2) d = total - d;

      if (d < 4.5) {
        item.taken = true;
        item.holder.visible = false;
        this.collected++;
        hit = item;
      }
    }

    return hit;
  }

  dispose() {
    this.group.removeFromParent();
    this.group.clear();
    this._disposables.forEach((d) => d.dispose && d.dispose());
    this._disposables.length = 0;
    this.items.length = 0;
  }
}
