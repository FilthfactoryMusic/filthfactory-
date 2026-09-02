import { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { listMyBlocks } from "@/lib/moderation-api";

export function useMyBlocks() {
  const user = useCurrentUser();
  const [ids, setIds] = useState<string[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setIds([]);
      return;
    }
    void listMyBlocks()
      .then(setIds)
      .catch(() => setIds([]));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ids, refresh, has: (id: string | null | undefined) => Boolean(id && ids.includes(id)) };
}
