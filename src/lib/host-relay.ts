import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { bufToB64, pickRecorderMime } from "@/lib/broadcast-ice";
import { postBoothChunk } from "@/lib/stream-api";

const KEY = (id: string) => `ff-stream:${id}`;

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

type Run = { liveId: string; rec: MediaRecorder | null; dead: boolean; unsub: () => void; seq: number };

let run: Run | null = null;

function arm(liveId: string, stream: MediaStream | null) {
  if (!run || run.liveId !== liveId || run.dead) return;
  try {
    run.rec?.stop();
  } catch {
    /* ignore */
  }
  run.rec = null;
  if (!stream?.getAudioTracks().length) return;
  const mime = pickRecorderMime(stream);
  if (!mime) return;
  const slot = run;
  function send(ev: BlobEvent, useMime: string) {
    if (!ev.data.size || slot.dead) return;
    const n = ++slot.seq;
    void ev.data
      .arrayBuffer()
      .then((buf) => {
        const data = bufToB64(buf);
        if (data.length > 180_000) return;
        return postBoothChunk({
          data: { liveId, seq: n, mime: useMime, data, streamKey: readStreamKey(liveId) },
        });
      })
      .catch(() => {});
  }
  try {
    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      audioBitsPerSecond: 96_000,
      videoBitsPerSecond: 250_000,
    });
    rec.ondataavailable = (ev) => send(ev, mime);
    rec.start(400);
    run.rec = rec;
  } catch {
    /* try audio-only */
    try {
      const audioOnly = new MediaStream(stream.getAudioTracks());
      const audioMime = pickRecorderMime(audioOnly) || "audio/webm";
      const rec = new MediaRecorder(audioOnly, { mimeType: audioMime, audioBitsPerSecond: 96_000 });
      rec.ondataavailable = (ev) => send(ev, audioMime);
      rec.start(400);
      run.rec = rec;
    } catch {
      /* device cannot record */
    }
  }
}

/** Phone → website. Survives navigating from booth to the live page. */
export function startHostRelay(liveId: string) {
  if (run?.liveId === liveId && !run.dead) {
    arm(liveId, getBoothStream());
    return;
  }
  stopHostRelay();
  const current: Run = { liveId, rec: null, dead: false, unsub: () => {}, seq: 0 };
  run = current;
  current.unsub = subscribeBoothStream((s) => arm(liveId, s));
  arm(liveId, getBoothStream());
}

export function stopHostRelay() {
  if (!run) return;
  run.dead = true;
  try {
    run.rec?.stop();
  } catch {
    /* ignore */
  }
  run.unsub();
  run = null;
}
