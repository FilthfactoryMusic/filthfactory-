import { useEffect, useState } from "react";
import { loadSoftware, type SoftDigest } from "@/lib/software-scan";

export function useSoftware() {
  const [digest, setDigest] = useState<SoftDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    void loadSoftware()
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
