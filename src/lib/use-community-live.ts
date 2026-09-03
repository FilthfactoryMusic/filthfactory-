import { useEffect } from "react";
import { listBoothLives } from "@/lib/live-api";
import { useLibrary } from "@/lib/library-store";
import { liveNow } from "@/lib/catalog";
import type { LiveShow } from "@/lib/types";

export function useCommunityLive() {
  const setCommunityLive = useLibrary((s) => s.setCommunityLive);
  const communityLive = useLibrary((s) => s.communityLive);

  useEffect(() => {
    let on = true;
    const tick = () => {
      void listBoothLives()
        .then((rows) => {
          if (on) setCommunityLive(rows);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => {
      on = false;
      clearInterval(id);
    };
  }, [setCommunityLive]);

  return communityLive;
}

export function mergeLiveNow(community: LiveShow[]): LiveShow[] {
  const seeded = liveNow();
  const ids = new Set(community.map((s) => s.id));
  const merged = [...community, ...seeded.filter((s) => !ids.has(s.id))];
  return merged;
}
