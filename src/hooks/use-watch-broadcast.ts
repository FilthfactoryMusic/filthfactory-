import { useEffect, useRef, useState } from "react";
import {
  joinBoothStream,
  leaveBoothStream,
  postBoothSignal,
  pullBoothSignals,
  type Signal,
} from "@/lib/stream-api";
import { getViewerId } from "@/lib/viewer-id";
import { registerWatchEl } from "@/lib/watch-media";

const ICE: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
  ],
};

export type WatchStatus = "connecting" | "live" | "audio" | "blocked" | "ended" | "full";

export function useWatchBroadcast(liveId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<WatchStatus>("connecting");
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    return registerWatchEl(el);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    return registerWatchEl(el);
  }, []);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const viewerId = getViewerId();
    let dead = false;

    async function ensurePc() {
      if (pcRef.current) return pcRef.current;
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      pc.ontrack = (ev) => {
        const stream = ev.streams[0] ?? new MediaStream([ev.track]);
        setRemote(stream);
        setStatus(stream.getVideoTracks().length ? "live" : "audio");
        const v = videoRef.current;
        const a = audioRef.current;
        if (v && stream.getVideoTracks().length) {
          v.srcObject = stream;
          void v.play().catch(() => setStatus("blocked"));
        } else if (a) {
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
        await pc.addIceCandidate(c).catch(() => {});
      } else if (sig.kind === "hangup") {
        setStatus("ended");
      }
    }

    async function tick() {
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

    const poll = window.setInterval(() => void tick(), 1200);
    void tick();

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

  return { status, remote, videoRef, audioRef };
}
