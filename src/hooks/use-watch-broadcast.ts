import { useEffect, useRef, useState, type RefObject } from "react";
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
import { useLiveTransport } from "@/hooks/use-live-transport";
import { useWatchLiveKit } from "@/hooks/use-watch-livekit";
import type { WatchStatus } from "@/hooks/watch-status";

export type { WatchStatus };

export function useWatchBroadcast(liveId: string | null, enabled: boolean) {
  const transport = useLiveTransport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const livekitOn = enabled && transport.livekit;
  const livekit = useWatchLiveKit(liveId, livekitOn, videoRef, audioRef);
  const mesh = useWatchMesh(liveId, enabled, videoRef, audioRef);

  useEffect(() => {
    const node = audioRef.current;
    if (!node) return;
    return registerWatchEl(node);
  }, []);

  const livekitReady =
    livekitOn && !livekit.error && (livekit.status === "live" || livekit.status === "audio");

  if (livekitReady) {
    return {
      status: livekit.status as WatchStatus,
      remote: livekit.remote,
      videoRef,
      audioRef,
      error: null as string | null,
      unlock: livekit.unlock,
    };
  }

  return {
    status: mesh.status,
    remote: mesh.remote,
    videoRef,
    audioRef,
    error: null as string | null,
    unlock: mesh.unlock,
  };
}

function useWatchMesh(
  liveId: string | null,
  enabled: boolean,
  videoRef: RefObject<HTMLVideoElement | null>,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const [status, setStatus] = useState<WatchStatus>("connecting");
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

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
        const stream = ev.streams[0] ?? new MediaStream([ev.track]);
        setRemote(stream);
        setStatus(stream.getVideoTracks().length ? "live" : "audio");
        const v = videoRef.current;
        const a = audioRef.current;
        if (v && stream.getVideoTracks().length) {
          v.srcObject = stream;
          void v.play().catch(() => setStatus("blocked"));
        }
        if (a && !stream.getVideoTracks().length) {
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
      void leaveBoothStream({ data: { liveId, viewerId } }).catch(() => {});
      void postBoothSignal({
        data: { liveId, viewerId, fromRole: "viewer", kind: "hangup", payload: "{}" },
      }).catch(() => {});
      pcRef.current?.close();
      pcRef.current = null;
      setRemote(null);
    };
  }, [liveId, enabled]);

  const playerRef = useRef<HTMLAudioElement | null>(null);
  const unlockCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    unlockCtx.current = ctx;
    void ctx.resume().catch(() => {});
    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(ctx.destination);
    let nextAt = 0;
    let dead = false;
    let afterSeq = 0;
    const id = liveId;
    const seen = new Set<number>();

    async function playWav(buf: ArrayBuffer) {
      try {
        const copy = buf.slice(0);
        const decoded = await ctx.decodeAudioData(copy);
        if (dead) return;
        const src = ctx.createBufferSource();
        src.buffer = decoded;
        src.connect(gain);
        const now = ctx.currentTime;
        if (nextAt < now + 0.05) nextAt = now + 0.05;
        src.start(nextAt);
        nextAt += Math.max(0.2, decoded.duration - 0.04);
        setStatus("audio");
      } catch {
        /* skip a bad slice, keep the stream */
      }
    }

    let quiet = 0;
    async function tickChunks() {
      if (dead) return;
      void ctx.resume().catch(() => {});
      try {
        const rows = await pullBoothChunks({ data: { liveId: id, afterSeq } });
        if (!rows.length) {
          quiet += 1;
          if (quiet >= 6) {
            afterSeq = Math.max(0, afterSeq - 8);
            seen.clear();
            quiet = 0;
          }
        } else {
          quiet = 0;
        }
        for (const row of rows) {
          if (seen.has(row.seq)) continue;
          seen.add(row.seq);
          afterSeq = Math.max(afterSeq, row.seq);
          await playWav(b64ToBuf(row.data));
        }
      } catch {
        /* keep pulling */
      }
    }

    const poll = window.setInterval(() => void tickChunks(), 400);
    void tickChunks();
    return () => {
      dead = true;
      window.clearInterval(poll);
      void ctx.close().catch(() => {});
      unlockCtx.current = null;
    };
  }, [liveId, enabled]);

  function unlock() {
    const ctx = unlockCtx.current;
    if (ctx) void ctx.resume().then(() => setStatus("audio")).catch(() => setStatus("blocked"));
    const a = audioRef.current ?? playerRef.current;
    if (a) {
      a.muted = false;
      a.volume = 1;
      void a.play().catch(() => {});
    }
  }

  return { status, remote, videoRef, audioRef, unlock };
}
