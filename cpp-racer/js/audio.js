/** WebAudio 合成音效：引擎、风噪、检查点提示、撞击 */
export class EngineAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ready = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(ctx.destination);

    // 引擎：锯齿 + 方波 → 低通
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 400;
    this.filter.Q.value = 5;

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0.06;
    this.filter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    this.oscA = ctx.createOscillator();
    this.oscA.type = 'sawtooth';
    this.oscA.frequency.value = 60;
    this.oscA.connect(this.filter);

    this.oscB = ctx.createOscillator();
    this.oscB.type = 'square';
    this.oscB.frequency.value = 91;
    const bGain = ctx.createGain();
    bGain.gain.value = 0.35;
    this.oscB.connect(bGain);
    bGain.connect(this.filter);

    this.oscA.start();
    this.oscB.start();

    // 风噪
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.noise = ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 900;
    this.noiseFilter.Q.value = 0.8;

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.01;

    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.master);
    this.noise.start();

    this.master.gain.setTargetAtTime(this.muted ? 0.0001 : 0.5, ctx.currentTime, 0.4);
    this.ready = true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0.0001 : 0.5, this.ctx.currentTime, 0.15);
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  update(ratio, boosting) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const f = 56 + ratio * 210;
    this.oscA.frequency.setTargetAtTime(f, t, 0.07);
    this.oscB.frequency.setTargetAtTime(f * 1.51, t, 0.07);
    this.filter.frequency.setTargetAtTime(240 + ratio * 2400 + (boosting ? 900 : 0), t, 0.09);
    this.engineGain.gain.setTargetAtTime(0.055 + ratio * 0.1, t, 0.12);
    this.noiseGain.gain.setTargetAtTime(0.008 + ratio * 0.03, t, 0.15);
    this.noiseFilter.frequency.setTargetAtTime(700 + ratio * 1800, t, 0.15);
  }

  blip(freq = 880, dur = 0.09, type = 'square', vol = 0.16) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  chord(freqs, dur = 0.16) {
    freqs.forEach((f, i) => setTimeout(() => this.blip(f, dur, 'triangle', 0.13), i * 90));
  }

  crash() {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.32);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(220, t + 0.3);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

    src.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    src.start(t);
  }

  fanfare() {
    this.chord([523.25, 659.25, 783.99, 1046.5], 0.2);
  }

  fail() {
    this.chord([392, 311.13, 233.08], 0.24);
  }
}
