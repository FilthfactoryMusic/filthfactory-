import { useEffect, useState } from "react";
import { rememberCharts } from "@/lib/chart-cache";
import { loadUkCharts } from "@/lib/charts-api";
import type { Mix } from "@/lib/types";

export function useUkCharts() {
  const [featured, setFeatured] = useState<Mix[]>([]);
  const [trending, setTrending] = useState<Mix[]>([]);
  const [weekId, setWeekId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let on = true;
    void loadUkCharts()
      .then((data) => {
        if (!on) return;
        rememberCharts([...data.featured, ...data.trending]);
        setFeatured(data.featured);
        setTrending(data.trending);
        setWeekId(data.weekId);
        setLoading(false);
      })
      .catch(() => {
        if (!on) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      on = false;
    };
  }, []);

  return { featured, trending, weekId, loading, error };
}
