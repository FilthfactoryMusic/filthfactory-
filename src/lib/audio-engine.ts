import type { EngineGenre } from "./types";
import { mulberry32 } from "./utils";

export type EngineOpts = {
  engine: EngineGenre;
  bpm: number;
  seed: number;
  duration: number;
  offset?: number;
  volume?: number;
  onEnded?: () => void;
};

const BPM_DEFAULT: Record<EngineGenre, number> = {
  ukg: 132,
  dnb: 174,
  techno: 136,
  house: 126,
  grime: 140,
  jungle: 162,
  bassline: 136,
  breaks: 132,
  funky: 130,
  disco: 122,
  electro: 128,
  industrial: 138,
  trance: 138,
  hardhouse: 145,
};

function midi(n: number) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

class CellarEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private timer: number | null = null;
  private playing = false;
  private paused = false;
  private nextNote = 0;
  private step = 0;
  private startedAt = 0;
  private offset = 0;
  private pauseAt = 0;
  private duration = 0;
  private bpm = 130;
  private genre: EngineGenre = "ukg";
  private rng = mulberry32(1);
  private onEnded: (() => void) | null = null;
  private noise: AudioBuffer | null = null;
  private key = 0;

  async ensure() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;
    const master = ctx.createGain();
    master.gain.value = 0.7;
    compressor.connect(master);
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.compressor = compressor;
    this.master = master;
    this.noise = this.makeNoise(ctx);
  }

  private makeNoise(ctx: AudioContext) {
    const len = ctx.sampleRate * 1.2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private out() {
    return this.compressor!;
  }

  isPlaying() {
    return this.playing && !this.paused;
  }

  currentTime() {
    if (!this.ctx) return this.offset;
    if (this.paused || !this.playing) return this.offset + this.pauseAt;
    return this.offset + (this.ctx.currentTime - this.startedAt);
  }

  async start(opts: EngineOpts) {
    await this.ensure();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    this.stopInternal(false);
    this.genre = opts.engine;
    this.bpm = opts.bpm || BPM_DEFAULT[opts.engine];
    this.duration = opts.duration;
    this.rng = mulberry32(opts.seed);
    this.key = opts.seed % 12;
    this.offset = opts.offset ?? 0;
    this.onEnded = opts.onEnded ?? null;
    if (opts.volume != null && this.master) this.master.gain.value = opts.volume;
    this.playing = true;
    this.paused = false;
    this.startedAt = ctx.currentTime;
    this.pauseAt = 0;
    const spb = 60 / this.bpm;
    const six = spb / 4;
    this.step = Math.floor(this.offset / six);
    this.nextNote = ctx.currentTime + 0.06;
    this.timer = window.setInterval(() => this.scheduler(), 25);
    this.scheduler();
  }

  pause() {
    if (!this.playing || this.paused || !this.ctx) return;
    this.pauseAt = this.ctx.currentTime - this.startedAt;
    this.paused = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.03);
    }
  }

  async resume() {
    if (!this.playing || !this.paused) return;
    await this.ensure();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    if (this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.04);
    }
    this.paused = false;
    this.startedAt = ctx.currentTime - this.pauseAt;
    const spb = 60 / this.bpm;
    const six = spb / 4;
    const t = this.offset + this.pauseAt;
    this.step = Math.floor(t / six);
    this.nextNote = ctx.currentTime + 0.05;
    this.timer = window.setInterval(() => this.scheduler(), 25);
  }

  async seek(seconds: number) {
    const vol = this.master?.gain.value ?? 0.7;
    const was = this.playing && !this.paused;
    const opts: EngineOpts = {
      engine: this.genre,
      bpm: this.bpm,
      seed: this.key + 11,
      duration: this.duration,
      offset: Math.max(0, seconds),
      volume: vol,
      onEnded: this.onEnded ?? undefined,
    };
    // Keep seed-derived key; re-seed from existing rng state by not resetting key
    const key = this.key;
    const onEnded = this.onEnded;
    const genre = this.genre;
    const bpm = this.bpm;
    const duration = this.duration;
    if (!was) {
      this.offset = Math.max(0, seconds);
      this.pauseAt = 0;
      return;
    }
    await this.start({
      engine: genre,
      bpm,
      seed: key + 99,
      duration,
      offset: Math.max(0, seconds),
      volume: vol,
      onEnded: onEnded ?? undefined,
    });
    this.key = key;
    void opts;
  }

  setVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx.currentTime, 0.02);
    }
  }

  stop() {
    this.stopInternal(true);
  }

  private stopInternal(reset: boolean) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.playing = false;
    this.paused = false;
    if (reset) {
      this.offset = 0;
      this.pauseAt = 0;
      this.onEnded = null;
    }
  }

  private scheduler() {
    const ctx = this.ctx;
    if (!ctx || !this.playing || this.paused) return;
    const t = this.currentTime();
    if (t >= this.duration) {
      this.stop();
      this.onEnded?.();
      return;
    }
    const spb = 60 / this.bpm;
    const six = spb / 4;
    while (this.nextNote < ctx.currentTime + 0.12) {
      this.scheduleStep(this.step, this.nextNote);
      const swing = this.step % 2 === 1 ? six * 0.16 : 0;
      this.nextNote += six + swing;
      this.step += 1;
    }
  }

  private scheduleStep(step: number, time: number) {
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const g = this.genre;
    if (g === "ukg" || g === "funky") this.ukg(s, bar, time, g === "funky");
    else if (g === "bassline") this.bassline(s, bar, time);
    else if (g === "dnb" || g === "jungle") this.dnb(s, bar, time, g === "jungle");
    else if (g === "grime") this.grime(s, bar, time);
    else if (g === "techno" || g === "industrial") this.techno(s, bar, time, g === "industrial");
    else if (g === "breaks" || g === "electro") this.breaks(s, bar, time, g === "electro");
    else this.house(s, bar, time, g === "disco");
  }

  private kick(time: number, pitch = 110, dur = 0.18, gain = 0.9) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + dur);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + dur + 0.02);
    this.click(time, 0.22);
  }

  private click(time: number, gain = 0.2) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "highpass";
    bp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.out());
    src.start(time);
    src.stop(time + 0.04);
  }

  private hat(time: number, open = false, gain = 0.07) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = open ? 6000 : 9000;
    const g = ctx.createGain();
    const dur = open ? 0.18 : 0.035;
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.out());
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  private snare(time: number, gain = 0.28) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.out());
    src.start(time);
    src.stop(time + 0.16);
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 180;
    og.gain.setValueAtTime(gain * 0.4, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(og);
    og.connect(this.out());
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private bass(time: number, note: number, dur: number, gain = 0.22, type: OscillatorType = "sine") {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midi(note);
    f.type = "lowpass";
    f.frequency.setValueAtTime(420, time);
    f.frequency.exponentialRampToValueAtTime(180, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(f);
    f.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private stab(time: number, note: number, dur = 0.18, gain = 0.08) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = midi(note);
    f.type = "lowpass";
    f.frequency.value = 1100;
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(f);
    f.connect(g);
    g.connect(this.out());
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private root() {
    return 36 + this.key;
  }

  private ukg(s: number, bar: number, time: number, funky: boolean) {
    if (s === 0 || s === 10) this.kick(time, 118, 0.16, 0.85);
    if (s === 6) this.kick(time, 100, 0.12, 0.7);
    if (s === 4 || s === 12) this.snare(time, 0.22);
    if (s % 2 === 0) this.hat(time, false, 0.055);
    if (s % 2 === 1) this.hat(time, false, 0.03);
    if (s === 14) this.hat(time, true, 0.06);
    if (s === 0 || s === 8) this.bass(time, this.root() - (bar % 8 === 4 ? 5 : 0), 0.38, 0.26);
    if (funky && (s === 3 || s === 11)) this.stab(time, this.root() + 12 + (s === 11 ? 3 : 7), 0.12, 0.07);
  }

  private bassline(s: number, _bar: number, time: number) {
    if (s === 0 || s === 4 || s === 8 || s === 12) this.kick(time, 120, 0.14, 0.82);
    if (s === 4 || s === 12) this.snare(time, 0.2);
    if (s % 2 === 0) this.hat(time, false, 0.06);
    if (s === 6 || s === 14) this.hat(time, true, 0.05);
    const notes = [0, 0, 7, 0, 3, 0, 10, 7];
    if (s % 2 === 0) this.bass(time, this.root() + notes[(s / 2) % 8]! - 12, 0.22, 0.28, "sawtooth");
  }

  private dnb(s: number, bar: number, time: number, jungle: boolean) {
    if (s === 0 || s === 10) this.kick(time, 100, 0.12, 0.8);
    if (jungle && s === 3) this.kick(time, 90, 0.08, 0.45);
    if (s === 4 || s === 12) this.snare(time, jungle ? 0.32 : 0.26);
    if (jungle && s === 7) this.snare(time, 0.12);
    this.hat(time, false, 0.045);
    if (s === 0 || s === 8) {
      this.bass(time, this.root() + (bar % 4 === 2 ? -5 : 0) - 12, 0.42, 0.24, "sawtooth");
    }
  }

  private grime(s: number, bar: number, time: number) {
    if (s === 0) this.kick(time, 80, 0.28, 0.95);
    if (s === 8 && bar % 2 === 1) this.kick(time, 70, 0.2, 0.5);
    if (s === 4 || s === 12) this.snare(time, 0.24);
    if (s === 2 || s === 6 || s === 10 || s === 14) this.hat(time, false, 0.05);
    if (s === 0) this.bass(time, this.root() - 12, 0.55, 0.3, "square");
    if (s === 10 && bar % 4 === 0) this.stab(time, this.root() + 7, 0.08, 0.06);
  }

  private techno(s: number, bar: number, time: number, industrial: boolean) {
    if (s === 0 || s === 4 || s === 8 || s === 12) this.kick(time, industrial ? 90 : 110, 0.16, 0.88);
    if (s === 4 || s === 12) this.snare(time, industrial ? 0.18 : 0.12);
    if (s % 2 === 1) this.hat(time, false, industrial ? 0.07 : 0.05);
    if (s === 0 && bar % 8 !== 7) this.bass(time, this.root() - 12, 0.46, industrial ? 0.22 : 0.18, "sawtooth");
    if (industrial && s === 0) this.click(time, 0.12);
  }

  private house(s: number, bar: number, time: number, disco: boolean) {
    if (s === 0 || s === 4 || s === 8 || s === 12) this.kick(time, 115, 0.16, 0.86);
    if (s === 4 || s === 12) this.snare(time, disco ? 0.16 : 0.14);
    if (s % 2 === 1) this.hat(time, false, 0.06);
    if (s === 14) this.hat(time, true, 0.05);
    if (s === 0 || s === 8) this.bass(time, this.root() + (bar % 4 === 2 ? 3 : 0) - 12, 0.4, 0.2);
    if (disco && (s === 0 || s === 8)) this.stab(time, this.root() + 12 + (s === 8 ? 4 : 7), 0.22, 0.06);
  }

  private breaks(s: number, bar: number, time: number, electro: boolean) {
    if (s === 0 || s === 6 || s === 10) this.kick(time, 105, 0.14, 0.8);
    if (s === 4 || s === 11 || s === 13) this.snare(time, s === 4 ? 0.26 : 0.12);
    if (s % 2 === 0) this.hat(time, false, 0.05);
    if (electro && s === 0) this.stab(time, this.root() + 19, 0.1, 0.07);
    if (s === 0 || s === 8) this.bass(time, this.root() - 12 + (bar % 2 ? 7 : 0), 0.3, 0.2, electro ? "square" : "sine");
  }
}

let engine: CellarEngine | null = null;

export function getEngine() {
  if (typeof window === "undefined") return null;
  if (!engine) engine = new CellarEngine();
  return engine;
}
