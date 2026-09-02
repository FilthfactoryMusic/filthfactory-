import { useEffect, useState } from "react";
import { loadBagReleases } from "@/lib/bag-api";
import { rememberCharts } from "@/lib/chart-cache";
import { useLibrary } from "@/lib/library-store";
import type { Mix } from "@/lib/types";

export function useBagReleases() {
  const bag = useLibrary((s) => s.bag);
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bag.length) {
      setMixes([]);
      return;
    }
    let on = true;
    setLoading(true);
    void loadBagReleases({ data: { names: bag } })
      .then((data) => {
        if (!on) return;
        rememberCharts(data.mixes);
        setMixes(data.mixes);
        setLoading(false);
      })
      .catch(() => {
        if (!on) return;
        setLoading(false);
      });
    return () => {
      on = false;
    };
  }, [bag.join("|")]);

  return { mixes, loading, bag };
}
