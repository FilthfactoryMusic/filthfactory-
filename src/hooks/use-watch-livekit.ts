import { useEffect, useState, type RefObject } from "react";
import { mintLiveKitViewerToken } from "@/lib/livekit-api";
import { LIVEKIT_MISSING_MSG } from "@/lib/live-transport";
import { getViewerId } from "@/lib/viewer-id";
import type { WatchStatus } from "@/hooks/watch-status";

export function useWatchLiveKit(
  liveId: string | null,
  enabled: boolean,
  videoRef: RefObject<HTMLVideoElement | null>,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const [status, setStatus] = useState<WatchStatus>("connecting");
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const id = liveId;
    let dead = false;
    let room: { disconnect: () => Promise<void> } | null = null;

    void (async () => {
      try {
        const [{ Room, RoomEvent, Track }, minted] = await Promise.all([
          import("livekit-client"),
          mintLiveKitViewerToken({ data: { liveId: id, viewerId: getViewerId() } }),
        ]);
        if (dead) return;

        const next = new Room({ adaptiveStream: true, dynacast: true });
        room = next;

        function attach() {
          const stream = new MediaStream();
          let video = 0;
          let audio = 0;
          for (const p of next.remoteParticipants.values()) {
            for (const pub of p.trackPublications.values()) {
              const track = pub.track;
              if (!track) continue;
              const media = track.mediaStreamTrack;
              if (!media) continue;
              stream.addTrack(media);
              if (track.kind === Track.Kind.Video) {
                video += 1;
                const el = videoRef.current;
                if (el) track.attach(el);
              }
              if (track.kind === Track.Kind.Audio) {
                audio += 1;
                const el = audioRef.current;
                if (el) track.attach(el);
              }
            }
          }
          if (!audio && !video) {
            setRemote(null);
            setStatus((s) => (s === "ended" || s === "full" ? s : "connecting"));
            return;
          }
          setRemote(stream);
          setStatus(video ? "live" : "audio");
          const v = videoRef.current;
          const a = audioRef.current;
          if (v && video) void v.play().catch(() => setStatus("blocked"));
          if (a && audio) void a.play().catch(() => setStatus("blocked"));
        }

        next.on(RoomEvent.TrackSubscribed, attach);
        next.on(RoomEvent.TrackUnsubscribed, attach);
        next.on(RoomEvent.Disconnected, () => {
          if (!dead) setStatus("ended");
        });

        await next.connect(minted.url, minted.token);
        if (dead) {
          await next.disconnect();
          return;
        }
        attach();
      } catch (err) {
        if (dead) return;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("ENDED")) setStatus("ended");
        else setError(LIVEKIT_MISSING_MSG);
      }
    })();

    return () => {
      dead = true;
      void room?.disconnect().catch(() => {});
      setRemote(null);
    };
  }, [liveId, enabled]);

  function unlock() {
    const v = videoRef.current;
    const a = audioRef.current;
    const plays: Promise<void>[] = [];
    if (v) plays.push(v.play().then(() => undefined));
    if (a) plays.push(a.play().then(() => undefined));
    void Promise.all(plays)
      .then(() => {
        setStatus((s) => (s === "blocked" ? (remote?.getVideoTracks().length ? "live" : "audio") : s));
      })
      .catch(() => setStatus("blocked"));
  }

  return { status, remote, videoRef, audioRef, error, unlock };
}
