import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { bufToB64 } from "@/lib/broadcast-ice";
import { downsample, floatToWav } from "@/lib/pcm-wav";
import { postBoothChunk } from "@/lib/stream-api";

const KEY = (id: string) => `ff-stream:${id}`;
const TARGET_RATE = 16000;
const SLICE_SEC = 2;

export function rememberStreamKey(liveId: string, key: string) {
  try {
    sessionStorage.setItem(KEY(liveId), key);
  } catch {
    /* ignore */
  }
}

export function readStreamKey(liveId: string) {
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
};

let run: Run | null = null;

function postFile(liveId: string, seq: number, mime: string, buf: ArrayBuffer) {
  const data = bufToB64(buf);
  if (!data.length || data.length > 180_000) return Promise.resolve();
  const payload = { liveId, seq, mime, data, streamKey: readStreamKey(liveId) };
  return postBoothChunk({ data: payload }).catch(() =>
    new Promise((r) => setTimeout(r, 400)).then(() => postBoothChunk({ data: payload }).catch(() => {})),
  );
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
  const track = stream?.getAudioTracks().find((t) => t.readyState === "live" && t.enabled);
  if (!track) return;
  const slot = run;
  const audio = new MediaStream([track]);
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  void ctx.resume().catch(() => {});
  const src = ctx.createMediaStreamSource(audio);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  const pending: Float32Array[] = [];
  let count = 0;
  const need = Math.floor(ctx.sampleRate * SLICE_SEC);
  proc.onaudioprocess = (ev) => {
    if (slot.dead) return;
    const input = ev.inputBuffer.getChannelData(0);
    pending.push(new Float32Array(input));
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
    const slim = downsample(merged, ctx.sampleRate, TARGET_RATE);
    const wav = floatToWav(slim, TARGET_RATE);
    const n = ++slot.seq;
    void postFile(liveId, n, "audio/wav", wav);
  };
  src.connect(proc);
  proc.connect(mute);
  mute.connect(ctx.destination);
  slot.ctx = ctx;
  slot.proc = proc;
  slot.src = src;
}

export function startHostRelay(liveId: string) {
  if (run?.liveId === liveId && !run.dead) {
    arm(liveId, getBoothStream());
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
  };
  run = current;
  current.unsub = subscribeBoothStream((s) => arm(liveId, s));
  arm(liveId, getBoothStream());
}

export function stopHostRelay() {
  if (!run) return;
  run.dead = true;
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
