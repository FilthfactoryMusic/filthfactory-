import { useCallback, useEffect, useState } from "react";
import { postLiveChat, pullLiveChat, type ChatLine } from "@/lib/stream-api";

export function useLiveChat(liveId: string, enabled: boolean) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let on = true;
    let after = "";
    async function tick() {
      try {
        const rows = await pullLiveChat({ data: { liveId, after } });
        if (!on || !rows.length) return;
        after = new Date(rows[rows.length - 1]!.at).toISOString();
        setLines((cur) => {
          const have = new Set(cur.map((m) => m.id));
          const extra = rows.filter((r) => !have.has(r.id));
          return extra.length ? [...cur, ...extra].slice(-120) : cur;
        });
      } catch {
        /* keep polling */
      }
    }
    void tick();
    const t = window.setInterval(() => void tick(), 1500);
    return () => {
      on = false;
      window.clearInterval(t);
    };
  }, [liveId, enabled]);

  const send = useCallback(
    async (user: string, text: string) => {
      const body = text.trim();
      if (!body || busy) return;
      setBusy(true);
      try {
        await postLiveChat({ data: { liveId, user, text: body } });
      } finally {
        setBusy(false);
      }
    },
    [liveId, busy],
  );

  return { lines, send, busy };
}
