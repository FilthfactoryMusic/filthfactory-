import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { bufToB64, pickRecorderMime } from "@/lib/broadcast-ice";
import { postBoothChunk } from "@/lib/stream-api";

const KEY = (id: string) => `ff-stream:${id}`;
const SLICE_MS = 2000;

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
  rec: MediaRecorder | null;
  dead: boolean;
  unsub: () => void;
  seq: number;
  timer: number | null;
};

let run: Run | null = null;

function postFile(liveId: string, seq: number, mime: string, buf: ArrayBuffer) {
  const data = bufToB64(buf);
  if (data.length > 180_000) return Promise.resolve();
  const payload = { liveId, seq, mime, data, streamKey: readStreamKey(liveId) };
  return postBoothChunk({ data: payload }).catch(() =>
    new Promise((r) => setTimeout(r, 400)).then(() => postBoothChunk({ data: payload }).catch(() => {})),
  );
}

/** Stop/start so every blob is a full playable file (Xbox / Edge cannot play 400ms clusters). */
function arm(liveId: string, stream: MediaStream | null) {
  if (!run || run.liveId !== liveId || run.dead) return;
  try {
    run.rec?.stop();
  } catch {
    /* ignore */
  }
  if (run.timer != null) {
    window.clearTimeout(run.timer);
    run.timer = null;
  }
  run.rec = null;
  const audioTracks = stream?.getAudioTracks().filter((t) => t.readyState === "live" && t.enabled) ?? [];
  if (!audioTracks.length) return;
  const audioOnly = new MediaStream(audioTracks);
  const mime = pickRecorderMime(audioOnly) || "audio/webm";
  const slot = run;

  function cycle() {
    if (!run || run !== slot || slot.dead) return;
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(audioOnly, { mimeType: mime, audioBitsPerSecond: 96_000 });
    } catch {
      try {
        rec = new MediaRecorder(audioOnly);
      } catch {
        return;
      }
    }
    rec.ondataavailable = (ev) => {
      if (!ev.data.size || slot.dead) return;
      const n = ++slot.seq;
      const type = ev.data.type || rec.mimeType || mime;
      void ev.data.arrayBuffer().then((buf) => postFile(liveId, n, type, buf));
    };
    rec.start();
    slot.rec = rec;
    slot.timer = window.setTimeout(() => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      slot.timer = null;
      cycle();
    }, SLICE_MS);
  }

  cycle();
}

/** Phone → website. Survives navigating from booth to the live page. */
export function startHostRelay(liveId: string) {
  if (run?.liveId === liveId && !run.dead) {
    arm(liveId, getBoothStream());
    return;
  }
  stopHostRelay();
  const current: Run = { liveId, rec: null, dead: false, unsub: () => {}, seq: 0, timer: null };
  run = current;
  current.unsub = subscribeBoothStream((s) => arm(liveId, s));
  arm(liveId, getBoothStream());
}

export function stopHostRelay() {
  if (!run) return;
  run.dead = true;
  if (run.timer != null) window.clearTimeout(run.timer);
  try {
    run.rec?.stop();
  } catch {
    /* ignore */
  }
  run.unsub();
  run = null;
}
