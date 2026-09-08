import { useEffect, useState } from "react";
import { getLiveTransport } from "@/lib/livekit-api";
import { LIVEKIT_MISSING_MSG, type LiveTransportMode } from "@/lib/live-transport";

let cached: { mode: LiveTransportMode; configured: boolean } | null = null;
let inflight: Promise<{ mode: LiveTransportMode; configured: boolean }> | null = null;

function loadTransport() {
  inflight ??= getLiveTransport()
    .then((info) => {
      cached = info;
      return info;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function useLiveTransport() {
  const [mode, setMode] = useState<LiveTransportMode | null>(cached?.mode ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    void loadTransport()
      .then((info) => {
        if (!on) return;
        if (info.mode === "livekit" && !info.configured) {
          setError(LIVEKIT_MISSING_MSG);
          setMode("livekit");
          return;
        }
        setMode(info.mode);
      })
      .catch(() => {
        if (on) setError(LIVEKIT_MISSING_MSG);
      });
    return () => {
      on = false;
    };
  }, []);

  return {
    mode,
    ready: mode !== null || error !== null,
    error,
    livekit: mode === "livekit" && !error,
    mesh: mode === "mesh",
  };
}
