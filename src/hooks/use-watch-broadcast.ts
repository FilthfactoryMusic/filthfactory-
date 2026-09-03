import { useEffect, useRef, useState } from "react";
import { ICE, b64ToBuf } from "@/lib/broadcast-ice";
import {
  joinBoothStream,
  leaveBoothStream,
  postBoothSignal,
  pullBoothChunks,
  pullBoothSignals,
  type Signal,
} from "@/lib/stream-api";
import { getViewerId } from "@/lib/viewer-id";
import { registerWatchEl } from "@/lib/watch-media";

export type WatchStatus = "connecting" | "live" | "audio" | "blocked" | "ended" | "full";

export function useWatchBroadcast(liveId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<WatchStatus>("connecting");
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const webrtcLive = useRef(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    return registerWatchEl(node);
  }, []);

  useEffect(() => {
    const node = audioRef.current;
    if (!node) return;
    return registerWatchEl(node);
  }, []);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const viewerId = getViewerId();
    let dead = false;
    const pendingIce: RTCIceCandidateInit[] = [];

    async function ensurePc() {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      pc.addTransceiver("audio", { direction: "recvonly" });
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.ontrack = (ev) => {
        webrtcLive.current = true;
        const stream = ev.streams[0] ?? new MediaStream([ev.track]);
        setRemote(stream);
        setStatus(stream.getVideoTracks().length ? "live" : "audio");
        const v = videoRef.current;
        const a = audioRef.current;
        if (v && stream.getVideoTracks().length) {
          v.srcObject = stream;
          void v.play().catch(() => setStatus("blocked"));
        }
        if (a) {
          a.removeAttribute("src");
          a.srcObject = stream;
          void a.play().catch(() => setStatus("blocked"));
        }
      };
      pc.onicecandidate = (ev) => {
        if (!ev.candidate || !liveId) return;
        void postBoothSignal({
          data: {
            liveId,
            viewerId,
            fromRole: "viewer",
            kind: "ice",
            payload: JSON.stringify(ev.candidate.toJSON()),
          },
        }).catch(() => {});
      };
      return pc;
    }

    async function onSignal(sig: Signal) {
      const pc = await ensurePc();
      if (sig.kind === "offer") {
        const desc = JSON.parse(sig.payload) as RTCSessionDescriptionInit;
        if (pc.signalingState !== "stable" && pc.remoteDescription) return;
        await pc.setRemoteDescription(desc);
        for (const c of pendingIce.splice(0)) await pc.addIceCandidate(c).catch(() => {});
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postBoothSignal({
          data: {
            liveId: sig.liveId,
            viewerId,
            fromRole: "viewer",
            kind: "answer",
            payload: JSON.stringify(pc.localDescription),
          },
        });
      } else if (sig.kind === "ice") {
        const c = JSON.parse(sig.payload) as RTCIceCandidateInit;
        if (pc.remoteDescription) await pc.addIceCandidate(c).catch(() => {});
        else pendingIce.push(c);
      } else if (sig.kind === "hangup") {
        setStatus("ended");
      }
    }

    async function tickRtc() {
      if (dead || !liveId) return;
      try {
        await joinBoothStream({ data: { liveId, viewerId } });
        const sigs = await pullBoothSignals({
          data: { liveId, viewerId, role: "viewer" },
        });
        for (const s of sigs) await onSignal(s);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("ENDED")) setStatus("ended");
        if (msg.includes("ROOM_FULL")) setStatus("full");
      }
    }

    const poll = window.setInterval(() => void tickRtc(), 1000);
    void tickRtc();

    return () => {
      dead = true;
      window.clearInterval(poll);
      webrtcLive.current = false;
      void leaveBoothStream({ data: { liveId, viewerId } }).catch(() => {});
      void postBoothSignal({
        data: { liveId, viewerId, fromRole: "viewer", kind: "hangup", payload: "{}" },
      }).catch(() => {});
      pcRef.current?.close();
      pcRef.current = null;
      setRemote(null);
    };
  }, [liveId, enabled]);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const player = audioRef.current;
    if (!player) return;
    const dest: HTMLAudioElement = player;
    let dead = false;
    let afterSeq = 0;
    let mime = "";
    let ms: MediaSource | null = null;
    let sb: SourceBuffer | null = null;
    const queue: ArrayBuffer[] = [];
    const id = liveId;

    function pump() {
      if (!sb || sb.updating || !queue.length) return;
      try {
        sb.appendBuffer(queue.shift()!);
      } catch {
        queue.length = 0;
      }
    }

    function attachMse(nextMime: string) {
      if (!("MediaSource" in window) || !MediaSource.isTypeSupported(nextMime)) return false;
      ms = new MediaSource();
      dest.srcObject = null;
      dest.src = URL.createObjectURL(ms);
      ms.addEventListener("sourceopen", () => {
        if (!ms) return;
        try {
          sb = ms.addSourceBuffer(nextMime);
          sb.mode = "sequence";
          sb.addEventListener("updateend", pump);
          pump();
        } catch {
          sb = null;
        }
      });
      void dest.play().catch(() => setStatus("blocked"));
      return true;
    }

    async function tickChunks() {
      if (dead || webrtcLive.current) return;
      try {
        const rows = await pullBoothChunks({ data: { liveId: id, afterSeq } });
        for (const row of rows) {
          afterSeq = row.seq;
          const buf = b64ToBuf(row.data);
          if (!mime) {
            mime = row.mime;
            if (!attachMse(mime)) {
              const blob = new Blob([buf], { type: mime });
              dest.srcObject = null;
              dest.src = URL.createObjectURL(blob);
              void dest.play().catch(() => setStatus("blocked"));
            }
            setStatus((s) => (s === "connecting" ? "audio" : s));
          } else if (sb) {
            queue.push(buf);
            pump();
          }
        }
      } catch {
        /* keep pulling */
      }
    }

    const poll = window.setInterval(() => void tickChunks(), 900);
    void tickChunks();
    return () => {
      dead = true;
      window.clearInterval(poll);
      try {
        if (ms && ms.readyState === "open") ms.endOfStream();
      } catch {
        /* ignore */
      }
    };
  }, [liveId, enabled]);

  return { status, remote, videoRef, audioRef };
}
