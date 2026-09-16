import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { bufToB64 } from "@/lib/broadcast-ice";
import { downsample, floatToWav } from "@/lib/pcm-wav";
import { postBoothChunk } from "@/lib/stream-api";

const KEY = (id: string) => `ff-stream:${id}`;
/** Native-ish rate so mixes don't sound like a phone call. */
const TARGET_RATE = 44100;
const SLICE_SEC = 0.4;

const memKeys = new Map<string, string>();

export function rememberStreamKey(liveId: string, key: string) {
  memKeys.set(liveId, key);
  try {
    sessionStorage.setItem(KEY(liveId), key);
  } catch {
    /* ignore */
  }
}

export function readStreamKey(liveId: string) {
  const mem = memKeys.get(liveId);
  if (mem) return mem;
  try {
    return sessionStorage.getItem(KEY(liveId)) ?? "";
  } catch {
    return "";
  }
}

type Run = {
  liveId: string;
  dead: boolean;
  unsub: () => void;
  seq: number;
  ctx: AudioContext | null;
  proc: ScriptProcessorNode | null;
  src: MediaStreamAudioSourceNode | null;
  keep: number | null;
  frames: number | null;
  vis: (() => void) | null;
  wake: WakeLockSentinel | null;
  hv: HTMLVideoElement | null;
};

let run: Run | null = null;

function postFile(liveId: string, seq: number, mime: string, buf: ArrayBuffer) {
  const data = bufToB64(buf);
  if (!data.length || data.length > 350_000) return Promise.resolve();
  const payload = { liveId, seq, mime, data, streamKey: readStreamKey(liveId) };
  return postBoothChunk({ data: payload }).catch(() =>
    new Promise((r) => setTimeout(r, 400)).then(() => postBoothChunk({ data: payload }).catch(() => {})),
  );
}

function mixDown(ev: AudioProcessingEvent) {
  const l = ev.inputBuffer.getChannelData(0);
  const n = l.length;
  const out = new Float32Array(n);
  if (ev.inputBuffer.numberOfChannels < 2) {
    out.set(l);
    return out;
  }
  const r = ev.inputBuffer.getChannelData(1);
  for (let i = 0; i < n; i++) out[i] = ((l[i] ?? 0) + (r[i] ?? 0)) * 0.5;
  return out;
}

function lift(pcm: Float32Array) {
  for (let i = 0; i < pcm.length; i++) {
    const s = (pcm[i] ?? 0) * 1.45;
    pcm[i] = s > 1 ? 1 : s < -1 ? -1 : s;
  }
  return pcm;
}

function jpegFrom(video: HTMLVideoElement): ArrayBuffer | null {
  if (!video.videoWidth) return null;
  const c = document.createElement("canvas");
  const w = 360;
  const h = Math.max(202, Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w));
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  g.drawImage(video, 0, 0, w, h);
  let q = 0.48;
  let url = c.toDataURL("image/jpeg", q);
  while (url.length > 90_000 && q > 0.26) {
    q -= 0.08;
    url = c.toDataURL("image/jpeg", q);
  }
  const b64 = url.split(",")[1];
  if (!b64) return null;
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function armVideo(liveId: string, stream: MediaStream | null) {
  if (!run || run.dead) return;
  const vt = stream?.getVideoTracks().find((t) => t.readyState === "live");
  if (!vt) return;
  if (!run.hv) {
    const hv = document.createElement("video");
    hv.muted = true;
    hv.playsInline = true;
    hv.setAttribute("playsinline", "");
    hv.setAttribute("autoplay", "");
    run.hv = hv;
  }
  run.hv.srcObject = new MediaStream([vt]);
  void run.hv.play().catch(() => {});
  if (run.frames != null) return;
  const slot = run;
  let jpegBusy = false;
  run.frames = window.setInterval(() => {
    if (!slot || slot.dead || !slot.hv || jpegBusy) return;
    const buf = jpegFrom(slot.hv);
    if (!buf || buf.byteLength < 400) return;
    jpegBusy = true;
    const n = ++slot.seq;
    void postFile(liveId, n, "image/jpeg", buf).finally(() => {
      jpegBusy = false;
    });
  }, 340);
}

function arm(liveId: string, stream: MediaStream | null) {
  if (!run || run.liveId !== liveId || run.dead) return;
  try {
    run.proc?.disconnect();
    run.src?.disconnect();
    void run.ctx?.close();
  } catch {
    /* ignore */
  }
  run.proc = null;
  run.src = null;
  run.ctx = null;
  armVideo(liveId, stream);
  const track = stream?.getAudioTracks().find((t) => t.readyState === "live" && t.enabled);
  if (!track) return;
  const slot = run;
  const audio = new MediaStream([track]);
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  void ctx.resume().catch(() => {});
  const src = ctx.createMediaStreamSource(audio);
  const ch = Math.min(2, Math.max(1, audio.getAudioTracks()[0] ? 2 : 1));
  const proc = ctx.createScriptProcessor(4096, ch, ch);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  const pending: Float32Array[] = [];
  let count = 0;
  const need = Math.floor(ctx.sampleRate * SLICE_SEC);
  proc.onaudioprocess = (ev) => {
    if (slot.dead) return;
    const input = mixDown(ev);
    pending.push(input);
    count += input.length;
    if (count < need) return;
    let total = 0;
    for (const p of pending) total += p.length;
    const merged = new Float32Array(total);
    let o = 0;
    for (const p of pending) {
      merged.set(p, o);
      o += p.length;
    }
    pending.length = 0;
    count = 0;
    const rate = Math.min(ctx.sampleRate, TARGET_RATE);
    const slim = lift(downsample(merged, ctx.sampleRate, rate));
    const wav = floatToWav(slim, rate);
    const n = ++slot.seq;
    void postFile(liveId, n, "audio/wav", wav);
  };
  src.connect(proc);
  proc.connect(mute);
  mute.connect(ctx.destination);
  slot.ctx = ctx;
  slot.proc = proc;
  slot.src = src;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.value = 0.00008;
    osc.frequency.value = 18;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
  } catch {
    /* keep-alive tone optional */
  }
}

export function startHostRelay(liveId: string) {
  if (run?.liveId === liveId && !run.dead) {
    void run.ctx?.resume().catch(() => {});
    return;
  }
  stopHostRelay();
  const current: Run = {
    liveId,
    dead: false,
    unsub: () => {},
    seq: 0,
    ctx: null,
    proc: null,
    src: null,
    keep: null,
    frames: null,
    vis: null,
    wake: null,
    hv: null,
  };
  run = current;
  current.unsub = subscribeBoothStream((s) => arm(liveId, s));
  arm(liveId, getBoothStream());
  current.keep = window.setInterval(() => {
    if (current.dead) return;
    void current.ctx?.resume().catch(() => {});
    const s = getBoothStream();
    const t = s?.getAudioTracks()[0];
    if (t && t.readyState !== "live") arm(liveId, s);
    void current.hv?.play().catch(() => {});
  }, 2000);
  current.vis = () => {
    if (document.visibilityState === "visible") {
      void current.ctx?.resume().catch(() => {});
      void grabWake(current);
    }
  };
  document.addEventListener("visibilitychange", current.vis);
  void grabWake(current);
}

async function grabWake(slot: Run) {
  try {
    slot.wake?.release().catch(() => {});
    slot.wake = (await navigator.wakeLock?.request("screen")) ?? null;
  } catch {
    slot.wake = null;
  }
}

export function stopHostRelay() {
  if (!run) return;
  run.dead = true;
  if (run.keep != null) window.clearInterval(run.keep);
  if (run.frames != null) window.clearInterval(run.frames);
  if (run.vis) document.removeEventListener("visibilitychange", run.vis);
  try {
    void run.wake?.release();
  } catch {
    /* ignore */
  }
  try {
    run.hv?.pause();
    run.hv = null;
  } catch {
    /* ignore */
  }
  try {
    run.proc?.disconnect();
    run.src?.disconnect();
    void run.ctx?.close();
  } catch {
    /* ignore */
  }
  run.unsub();
  run = null;
}
