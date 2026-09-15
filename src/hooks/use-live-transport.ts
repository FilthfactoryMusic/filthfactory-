import { useEffect, useState } from "react";
import { getLiveTransport } from "@/lib/livekit-api";
import {
  LIVEKIT_MISSING_MSG,
  clientTransportPlan,
  type LiveTransportMode,
} from "@/lib/live-transport";

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
  const initial = cached ? clientTransportPlan(cached) : null;
  const [mode, setMode] = useState<LiveTransportMode | null>(cached?.mode ?? null);
  const [error, setError] = useState<string | null>(initial?.error ?? null);
  const [livekit, setLivekit] = useState(Boolean(initial?.livekit));
  const [mesh, setMesh] = useState(Boolean(initial?.mesh));

  useEffect(() => {
    let on = true;
    void loadTransport()
      .then((info) => {
        if (!on) return;
        const plan = clientTransportPlan(info);
        setMode(info.mode);
        setError(plan.error);
        setLivekit(plan.livekit);
        setMesh(plan.mesh);
      })
      .catch(() => {
        if (!on) return;
        setMode("livekit");
        setError(LIVEKIT_MISSING_MSG);
        setLivekit(false);
        setMesh(false);
      });
    return () => {
      on = false;
    };
  }, []);

  return {
    mode,
    ready: mode !== null || error !== null,
    error,
    livekit,
    mesh,
  };
}

/** Open-join LiveKit is the only time we sell or claim live A/V. Mesh and missing keys stay Coming soon. */
export function useLiveProduct() {
  const t = useLiveTransport();
  const openJoin = Boolean(t.ready && t.livekit && !t.error);
  const comingSoon = !t.ready || !openJoin;
  return { ...t, openJoin, comingSoon };
}
