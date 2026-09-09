import { useEffect } from "react";
import { usePlayer } from "@/lib/player-store";

export function useMediaSession(meta: { title: string; artist: string; artwork: string; live: boolean }) {
  const playing = usePlayer((s) => s.playing);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const now = usePlayer((s) => s.now);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !now) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title,
        artist: meta.artist || "Filthfactory",
        album: "Filthfactory",
        artwork: [{ src: meta.artwork || "/art/brand/logo.png", sizes: "512x512", type: "image/png" }],
      });
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => {
        if (!usePlayer.getState().playing) toggle();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (usePlayer.getState().playing) toggle();
      });
      navigator.mediaSession.setActionHandler("previoustrack", meta.live ? null : () => prev());
      navigator.mediaSession.setActionHandler("nexttrack", meta.live ? null : () => next());
    } catch {
      /* webview without session */
    }
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch {
        /* ignore */
      }
    };
  }, [now, playing, meta.title, meta.artist, meta.artwork, meta.live, toggle, next, prev]);
}
