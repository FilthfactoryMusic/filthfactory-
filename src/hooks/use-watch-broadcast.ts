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
import type { WatchStatus } from "@/hooks/watch-status";

export type { WatchStatus };

export function useWatchBroadcast(liveId: string | null, enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Website WAV is the broadcast. LiveKit is not the listen path.
  const mesh = useWatchMesh(liveId, enabled, videoRef, audioRef);

  useEffect(() => {
    const node = audioRef.current;
    if (!node) return;
    return registerWatchEl(node);
  }, []);

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

  useEffect(() => {
    if (!liveId || !enabled) return;
    const player = new Audio();
    player.autoplay = true;
    player.preload = "auto";
    player.muted = false;
    player.volume = 1;
    player.setAttribute("playsinline", "true");
    playerRef.current = player;
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
    }
    let dead = false;
    let afterSeq = 0;
    const blobs: Blob[] = [];
    let blobPlaying = false;
    const id = liveId;

    function sink() {
      return audioRef.current ?? player;
    }

    function playBlobQueue() {
      if (blobPlaying || !blobs.length || dead) return;
      blobPlaying = true;
      const blob = blobs.shift()!;
      const url = URL.createObjectURL(blob);
      const el = sink();
      el.srcObject = null;
      el.src = url;
      el.muted = false;
      el.volume = 1;
      el.onplaying = () => setStatus("audio");
      void el.play().then(() => setStatus("audio")).catch(() => {
        blobPlaying = false;
        setStatus("blocked");
      });
      el.onended = () => {
        URL.revokeObjectURL(url);
        blobPlaying = false;
        playBlobQueue();
      };
    }

    async function tickChunks() {
      if (dead) return;
      try {
        const rows = await pullBoothChunks({ data: { liveId: id, afterSeq } });
        for (const row of rows) {
          afterSeq = row.seq;
          const buf = b64ToBuf(row.data);
          blobs.push(new Blob([buf], { type: row.mime || "audio/wav" }));
          playBlobQueue();
        }
      } catch {
        /* keep pulling the website */
      }
    }

    const poll = window.setInterval(() => void tickChunks(), 400);
    void tickChunks();
    return () => {
      dead = true;
      window.clearInterval(poll);
      player.pause();
      player.removeAttribute("src");
      playerRef.current = null;
    };
  }, [liveId, enabled]);

  function unlock() {
    const a = audioRef.current ?? playerRef.current;
    if (a) {
      a.muted = false;
      a.volume = 1;
      void a.play().then(() => setStatus("audio")).catch(() => setStatus("blocked"));
    }
  }

  return { status, remote, videoRef, audioRef, unlock };
}
