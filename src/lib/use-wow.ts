import { useEffect, useState } from "react";
import { loadWow, type WowDigest } from "@/lib/wow-scan";

export function useWow() {
  const [digest, setDigest] = useState<WowDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    void loadWow()
      .then((d) => {
        if (!on) return;
        setDigest(d);
        setLoading(false);
      })
      .catch(() => {
        if (on) setLoading(false);
      });
    return () => {
      on = false;
    };
  }, []);

  return { digest, loading };
}
