import { t } from './i18n.js';
import { Save } from './save.js';

const $ = (id) => document.getElementById(id);

/** 终端风格 HUD：数字、进度、日志与结算面板 */
export class HUD {
  constructor() {
    this.el = {
      hud: $('hud'),
      level: $('hudLevel'),
      code: $('hudCode'),
      cp: $('hudCp'),
      cpMini: $('hudCpMini'),
      cpDot: $('cpDot'),
      nodes: $('hudNodes'),
      best: $('hudBest'),
      timer: $('hudTimer'),
      timerPanel: $('timerPanel'),
      timeBar: $('hudTimeBar'),
      speed: $('hudSpeed'),
      gaugeTrack: document.querySelector('.gauge__track'),
      gaugeFill: document.querySelector('.gauge__fill'),
      gaugeTicks: document.querySelector('.gauge__ticks'),
      gaugeNeedle: document.querySelector('.gauge__needle'),
      nitro: $('hudNitro'),
      nitroBar: $('hudNitroBar'),
      nitroPanel: document.querySelector('.nitro'),
      progress: $('hudProgress'),
      log: $('hudLog'),
      toast: $('hudToast'),
      overlay: $('overlay'),
      ovHead: $('ovHead'),
      ovKicker: $('ovKicker'),
      ovTitle: $('ovTitle'),
      ovSub: $('ovSub'),
      ovStats: $('ovStats'),
      ovBtn: $('ovBtn'),
    };

    this._toastTimer = 0;
    this._prev = {};
    this.level = null;
    this._initGauge();
    this.cpTotal = 0;
    this.cpPassed = 0;
    this.nodeTotal = 0;
    this.nodePassed = 0;

    window.addEventListener('langchange', () => this.refreshStatic());
  }

  show() { this.el.hud.classList.remove('hidden'); }

  hide() { this.el.hud.classList.add('hidden'); }

  /** 半圆仪表：150°→-90° 扫过 240°，指针从 7 点钟到 5 点钟 */
  _initGauge() {
    const R = 66;
    const CX = 100;
    const CY = 70;
    const A0 = 150;   // 起始角（左下方）
    const SPAN = 240; // 扫过角度

    const pt = (a, r) => {
      const rad = (a * Math.PI) / 180;
      return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
    };

    const [x0, y0] = pt(A0, R);
    const [x1, y1] = pt(A0 - SPAN, R);
    const d = `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 1 0 ${x1.toFixed(2)} ${y1.toFixed(2)}`;

    this.el.gaugeTrack.setAttribute('d', d);
    this.el.gaugeFill.setAttribute('d', d);
    this.gaugeLen = 2 * Math.PI * R * (SPAN / 360);
    this.el.gaugeFill.style.strokeDasharray = `0 ${this.gaugeLen.toFixed(1)}`;

    const ticks = [];
    for (let i = 0; i <= 14; i++) {
      const a = A0 - (i / 14) * SPAN;
      const inner = i % 2 === 0 ? 22 : 16;
      const [ax, ay] = pt(a, R - 11);
      const [bx, by] = pt(a, R - inner);
      ticks.push(`<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" />`);
    }
    this.el.gaugeTicks.innerHTML = ticks.join('');

    this.gaugeCenter = [CX, CY];
  }

  setGauge(kmh) {
    const ratio = Math.max(0, Math.min(1, kmh / 280));
    this.el.gaugeFill.style.strokeDasharray = `${(this.gaugeLen * ratio).toFixed(1)} ${this.gaugeLen.toFixed(1)}`;
    this.el.gaugeNeedle.setAttribute('transform', `rotate(${(60 - ratio * 240).toFixed(1)} 100 70)`);
  }

  setLevel(level) {
    this.level = level;
    this.cpTotal = level.checkpoints.length;
    this.nodeTotal = (level.nodes || []).length;
    this.cpPassed = 0;
    this.nodePassed = 0;

    this.el.level.textContent = String(level.id).padStart(2, '0');
    this.el.code.textContent = level.code;
    this.el.log.innerHTML = '';
    this._prev = {};
    this.refreshStatic();
    this.el.progress.style.width = '0%';
  }

  refreshStatic() {
    const e = this.el;
    e.cp.textContent = t('hud.checkpoint', { n: this.cpPassed, m: this.cpTotal });
    e.cpMini.textContent = `${this.cpPassed}/${this.cpTotal}`;
    e.nodes.textContent = t('hud.nodes', { n: this.nodePassed, m: this.nodeTotal });
    e.cpDot.style.background = this.cpPassed >= this.cpTotal && this.cpTotal > 0 ? '#8dffb8' : '';

    if (this.level && e.best) {
      const best = Save.best(this.level.id);
      e.best.textContent = best
        ? `${t('hud.bestShort')} ${best.toFixed(2)}s`
        : t('hud.best');
    }
  }

  setCounts({ cpPassed, nodePassed }) {
    if (cpPassed !== undefined) this.cpPassed = cpPassed;
    if (nodePassed !== undefined) this.nodePassed = nodePassed;
    this.refreshStatic();
  }

  update(s) {
    const kmh = Math.round(s.kmh);
    if (kmh !== this._prev.kmh) {
      this.el.speed.textContent = String(kmh).padStart(3, '0');
      this._prev.kmh = kmh;
    }
    this.setGauge(s.kmh);

    const tl = Math.max(0, s.timeLeft);
    const tt = tl.toFixed(1);
    if (tt !== this._prev.time) {
      this.el.timer.textContent = tt;
      this.el.timerPanel.classList.toggle('is-low', tl <= 10);
      this._prev.time = tt;
    }
    const ratio = Math.max(0, Math.min(1, tl / Math.max(1, s.timeTotal)));
    this.el.timeBar.style.width = `${ratio * 100}%`;

    const n = Math.round(s.nitro);
    if (n !== this._prev.nitro) {
      this.el.nitro.textContent = `${n}%`;
      this.el.nitroBar.style.width = `${n}%`;
      this._prev.nitro = n;
    }

    if (s.boosting !== this._prev.boosting) {
      this.el.nitroPanel.classList.toggle('boosting', !!s.boosting);
      this.el.hud.classList.toggle('is-boost', !!s.boosting);
      this._prev.boosting = s.boosting;
    }

    const p = Math.max(0, Math.min(1, s.progress));
    this.el.progress.style.width = `${p * 100}%`;
  }

  log(text, cls = '') {
    const div = document.createElement('div');
    div.className = cls;
    div.textContent = text;
    this.el.log.appendChild(div);
    while (this.el.log.children.length > 5) this.el.log.removeChild(this.el.log.firstChild);
  }

  toast(title, sub = '', cls = '', ms = 1400) {
    const el = this.el.toast;
    el.className = `toast ${cls}`;
    const b = el.querySelector('b');
    b.textContent = title;
    el.querySelector('span').textContent = sub;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  overlay({ head, kicker, title, sub = '', stats = [], btn, bad = false }) {
    const e = this.el;
    e.ovHead.textContent = head || t('overlay.head');
    e.ovKicker.textContent = kicker;
    e.ovKicker.classList.toggle('bad', bad);
    e.ovTitle.textContent = title;
    e.ovSub.textContent = sub;
    e.ovStats.innerHTML = stats
      .map((s) => `<div class="stat"><span>${s.k}</span><b class="${s.cls || ''}">${s.v}</b></div>`)
      .join('');
    e.ovBtn.textContent = btn;
    e.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
  }
}
