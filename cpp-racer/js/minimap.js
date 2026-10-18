/**
 * minimap.js — 俯视小地图
 * 赛道底图预渲染到离屏 canvas，每帧只重绘标记，开销很小。
 */
export class Minimap {
  constructor(canvas, track, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.track = track;
    this.level = level;
    this.size = canvas.width;

    this._computeBounds();
    this._makeBase();
  }

  _computeBounds() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const s of this.track.samples) {
      if (s.pos.x < minX) minX = s.pos.x;
      if (s.pos.x > maxX) maxX = s.pos.x;
      if (s.pos.z < minZ) minZ = s.pos.z;
      if (s.pos.z > maxZ) maxZ = s.pos.z;
    }

    const pad = 14;
    const span = Math.max(maxX - minX, maxZ - minZ) || 1;
    const scale = (this.size - pad * 2) / span;

    this.scale = scale;
    this.ox = pad + (this.size - pad * 2 - (maxX - minX) * scale) / 2 - minX * scale;
    this.oz = pad + (this.size - pad * 2 - (maxZ - minZ) * scale) / 2 - minZ * scale;
  }

  _px(x) { return x * this.scale + this.ox; }
  _pz(z) { return z * this.scale + this.oz; }

  _makeBase() {
    const c = document.createElement('canvas');
    c.width = this.size;
    c.height = this.size;
    const g = c.getContext('2d');

    g.fillStyle = 'rgba(3, 10, 15, .82)';
    g.fillRect(0, 0, this.size, this.size);

    const pts = this.track.samples;
    g.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i].pos;
      const x = this._px(p.x);
      const y = this._pz(p.z);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();

    g.lineJoin = 'round';
    g.strokeStyle = 'rgba(34, 230, 255, .22)';
    g.lineWidth = 13;
    g.stroke();
    g.strokeStyle = 'rgba(34, 230, 255, .88)';
    g.lineWidth = 4.2;
    g.stroke();

    // 起终点刻线
    const start = pts[0].pos;
    g.fillStyle = '#dcf8ff';
    g.fillRect(this._px(start.x) - 7, this._pz(start.z) - 2, 14, 4);

    this.bg = c;
  }

  update(pos, yaw, checkpoints = [], collectedIds = [], dt = 0.016) {
    const { ctx, size } = this;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(this.bg, 0, 0);

    const tx = this._px(pos.x);
    const ty = this._pz(pos.z);

    // 车后拖尾
    if (!this.trail) this.trail = [];
    this.trail.push([tx, ty]);
    if (this.trail.length > 26) this.trail.shift();

    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0][0], this.trail[0][1]);
      for (let i = 1; i < this.trail.length; i++) ctx.lineTo(this.trail[i][0], this.trail[i][1]);
      ctx.strokeStyle = 'rgba(34, 230, 255, .3)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 雷达扫描
    this._scan = (this._scan || 0) + dt * 1.9;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(this._scan);
    const g = ctx.createRadialGradient(0, 0, 3, 0, 0, size * 0.34);
    g.addColorStop(0, 'rgba(34, 230, 255, .1)');
    g.addColorStop(1, 'rgba(34, 230, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, size * 0.4, -0.42, 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 检查点
    for (const cp of checkpoints) {
      const sm = this.track.sampleAtS(cp.s);
      ctx.save();
      ctx.translate(this._px(sm.pos.x), this._pz(sm.pos.z));
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = cp.passed ? 'rgba(141, 255, 184, .95)' : 'rgba(255, 47, 125, .9)';
      ctx.fillRect(-3.8, -3.8, 7.6, 7.6);
      ctx.restore();
    }

    // 知识点
    for (const n of (this.level.nodes || [])) {
      const sm = this.track.sampleAtS((n.t || 0) * this.track.length);
      const got = collectedIds.includes(n.topic);
      ctx.beginPath();
      ctx.arc(this._px(sm.pos.x), this._pz(sm.pos.z), got ? 2.4 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = got ? 'rgba(255, 204, 102, .3)' : 'rgba(255, 204, 102, .95)';
      ctx.fill();
    }

    // 车标
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const angle = Math.atan2(fx, -fz);

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -8.4);
    ctx.lineTo(5.6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5.6, 6);
    ctx.closePath();
    ctx.fillStyle = '#eafdff';
    ctx.shadowColor = 'rgba(34, 230, 255, .95)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }

  dispose() {
    this.bg = null;
  }
}
