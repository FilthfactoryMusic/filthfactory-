import { useEffect, useRef, useState } from "react";
import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { ICE, bufToB64, pickRecorderMime } from "@/lib/broadcast-ice";
import {
  pingBoothHost,
  postBoothChunk,
  postBoothSignal,
  pullBoothSignals,
  type Signal,
} from "@/lib/stream-api";

export function useHostBroadcast(liveId: string | null) {
  const [viewers, setViewers] = useState(0);
  const pcs = useRef(new Map<string, RTCPeerConnection>());
  const streamRef = useRef<MediaStream | null>(getBoothStream());

  useEffect(() => {
    streamRef.current = getBoothStream();
    return subscribeBoothStream((s) => {
      streamRef.current = s;
      pcs.current.forEach((pc) => {
        if (!s) return;
        const senders = pc.getSenders();
        s.getTracks().forEach((track) => {
          const match = senders.find((x) => x.track?.kind === track.kind);
          if (match) void match.replaceTrack(track);
          else pc.addTrack(track, s);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!liveId) return;
    const id = liveId;
    let rec: MediaRecorder | null = null;
    let seq = 0;
    let dead = false;

    function armRecorder(stream: MediaStream | null) {
      rec?.stop();
      rec = null;
      if (!stream || dead) return;
      const mime = pickRecorderMime(stream);
      if (!mime || !stream.getAudioTracks().length) return;
      try {
        const next = new MediaRecorder(stream, {
          mimeType: mime,
          audioBitsPerSecond: 96_000,
          videoBitsPerSecond: 350_000,
        });
        next.ondataavailable = (ev) => {
          if (!ev.data.size || dead) return;
          const n = seq++;
          void ev.data.arrayBuffer().then((buf) => {
            const data = bufToB64(buf);
            if (data.length > 78_000) return;
            return postBoothChunk({ data: { liveId: id, seq: n, mime, data } });
          }).catch(() => {});
        };
        next.start(900);
        rec = next;
      } catch {
        /* recorder optional — WebRTC still runs */
      }
    }

    armRecorder(streamRef.current);
    const unsub = subscribeBoothStream((s) => armRecorder(s));

    return () => {
      dead = true;
      unsub();
      try {
        rec?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [liveId]);

  useEffect(() => {
    if (!liveId) return;
    const id = liveId;
    let dead = false;

    async function offerTo(viewerId: string) {
      const existing = pcs.current.get(viewerId);
      if (existing && existing.connectionState !== "failed" && existing.connectionState !== "closed") {
        return;
      }
      existing?.close();
      const pc = new RTCPeerConnection(ICE);
      pcs.current.set(viewerId, pc);
      const local = streamRef.current;
      local?.getTracks().forEach((t) => pc.addTrack(t, local));
      pc.onicecandidate = (ev) => {
        if (!ev.candidate) return;
        void postBoothSignal({
          data: {
            liveId: id,
            viewerId,
            fromRole: "host",
            kind: "ice",
            payload: JSON.stringify(ev.candidate.toJSON()),
          },
        }).catch(() => {});
      };
      pc.onnegotiationneeded = () => {
        void (async () => {
          if (pc.signalingState !== "stable") return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await postBoothSignal({
            data: {
              liveId: id,
              viewerId,
              fromRole: "host",
              kind: "offer",
              payload: JSON.stringify(pc.localDescription),
            },
          });
        })().catch(() => {});
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await postBoothSignal({
        data: {
          liveId: id,
          viewerId,
          fromRole: "host",
          kind: "offer",
          payload: JSON.stringify(pc.localDescription),
        },
      });
    }

    async function onSignal(sig: Signal) {
      const pc = pcs.current.get(sig.viewerId);
      if (sig.kind === "hangup") {
        pc?.close();
        pcs.current.delete(sig.viewerId);
        return;
      }
      if (!pc) return;
      if (sig.kind === "answer") {
        const desc = JSON.parse(sig.payload) as RTCSessionDescriptionInit;
        if (pc.signalingState === "have-local-offer") await pc.setRemoteDescription(desc);
      } else if (sig.kind === "ice") {
        const c = JSON.parse(sig.payload) as RTCIceCandidateInit;
        await pc.addIceCandidate(c).catch(() => {});
      }
    }

    async function tick() {
      if (dead) return;
      try {
        const ping = await pingBoothHost({ data: { liveId: id } });
        if (dead) return;
        setViewers(ping.viewerIds.length);
        for (const vid of ping.viewerIds) await offerTo(vid);
        for (const vid of [...pcs.current.keys()]) {
          if (!ping.viewerIds.includes(vid)) {
            pcs.current.get(vid)?.close();
            pcs.current.delete(vid);
          }
        }
        const sigs = await pullBoothSignals({ data: { liveId: id, viewerId: "host", role: "host" } });
        for (const s of sigs) await onSignal(s);
      } catch {
        /* keep looping */
      }
    }

    const poll = window.setInterval(() => void tick(), 1200);
    void tick();

    return () => {
      dead = true;
      window.clearInterval(poll);
      pcs.current.forEach((pc) => pc.close());
      pcs.current.clear();
    };
  }, [liveId]);

  return { viewers };
}
