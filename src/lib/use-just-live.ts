import { useEffect, useState } from "react";
import { loadJustLive, type LivePick } from "@/lib/live-scan";

export function useJustLive() {
  const [picks, setPicks] = useState<LivePick[]>([]);
  const [scannedAt, setScannedAt] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    void loadJustLive()
      .then((data) => {
        if (!on) return;
        setPicks(data.picks);
        setScannedAt(data.scannedAt);
        setLoading(false);
      })
      .catch(() => {
        if (on) setLoading(false);
      });
    return () => {
      on = false;
    };
  }, []);

  return { picks, scannedAt, loading };
}
