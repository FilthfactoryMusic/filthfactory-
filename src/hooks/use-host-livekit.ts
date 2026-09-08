import { useEffect, useRef, useState } from "react";
import { getBoothStream, subscribeBoothStream } from "@/lib/booth-stream";
import { mintLiveKitHostToken } from "@/lib/livekit-api";
import { LIVEKIT_MISSING_MSG } from "@/lib/live-transport";
import { pingBoothHost } from "@/lib/stream-api";

export function useHostLiveKit(liveId: string | null, enabled: boolean) {
  const [viewers, setViewers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<{ disconnect: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!liveId || !enabled) return;
    const id = liveId;
    let dead = false;

    let stop: (() => void) | undefined;

    void (async () => {
      try {
        const [{ Room, RoomEvent, Track }, minted] = await Promise.all([
          import("livekit-client"),
          mintLiveKitHostToken({ data: { liveId: id } }),
        ]);
        if (dead) return;

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const count = () => {
          setViewers(Math.max(0, room.remoteParticipants.size));
        };
        room.on(RoomEvent.ParticipantConnected, count);
        room.on(RoomEvent.ParticipantDisconnected, count);
        room.on(RoomEvent.Disconnected, () => {
          if (!dead) setViewers(0);
        });

        await room.connect(minted.url, minted.token);
        if (dead) {
          await room.disconnect();
          return;
        }
        count();

        async function publish(stream: MediaStream | null) {
          if (!stream || dead) return;
          const lp = room.localParticipant;
          for (const media of stream.getTracks()) {
            const pubs = [...lp.trackPublications.values()];
            const existing = pubs.find((p) => p.track?.mediaStreamTrack?.kind === media.kind);
            if (existing?.track && "replaceTrack" in existing.track) {
              await existing.track.replaceTrack(media);
              continue;
            }
            await lp.publishTrack(media, {
              source: media.kind === "video" ? Track.Source.Camera : Track.Source.Microphone,
            });
          }
          const haveVideo = stream.getVideoTracks().some((t) => t.readyState === "live");
          if (!haveVideo) {
            for (const pub of lp.videoTrackPublications.values()) {
              if (pub.track) await lp.unpublishTrack(pub.track, false);
            }
          }
        }

        await publish(getBoothStream());
        const unsub = subscribeBoothStream((s) => {
          void publish(s).catch(() => {});
        });

        const beat = window.setInterval(() => {
          void pingBoothHost({ data: { liveId: id } }).catch(() => {});
        }, 8000);
        void pingBoothHost({ data: { liveId: id } }).catch(() => {});

        stop = () => {
          unsub();
          window.clearInterval(beat);
          void room.disconnect();
        };
        if (dead) stop();
      } catch (err) {
        if (dead) return;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("MEMBERSHIP")) setError("Resident or Featured membership is required to publish.");
        else if (msg.includes("ENDED") || msg.includes("NOT_HOST")) setError("This broadcast is not on air.");
        else setError(LIVEKIT_MISSING_MSG);
      }
    })();

    return () => {
      dead = true;
      stop?.();
      void roomRef.current?.disconnect().catch(() => {});
      roomRef.current = null;
    };
  }, [liveId, enabled]);

  return { viewers, error };
}
