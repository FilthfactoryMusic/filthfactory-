import { useCallback, useEffect, useState } from "react";
import { getMyBilling, getTillStatus, recoverMembership, type BillingSnapshot } from "@/lib/billing-api";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const empty: BillingSnapshot = {
  plan: null,
  status: null,
  renewsAt: null,
  amountPence: 0,
  walletAvailable: 0,
  walletLifetime: 0,
  sent: [],
  received: [],
  invoices: [],
  payouts: [],
};

export function useMyBilling() {
  const user = useCurrentUser();
  const [data, setData] = useState<BillingSnapshot>(empty);
  const [loading, setLoading] = useState(Boolean(user));

  const refresh = useCallback(() => {
    if (!user) {
      setData(empty);
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setLoading(false);
    }, 6000);
    return getMyBilling()
      .then(async (row) => {
        if (row.plan) return row;
        try {
          await recoverMembership();
          return await getMyBilling();
        } catch {
          return row;
        }
      })
      .then((row) => {
        if (!settled) setData(row);
      })
      .catch(() => {
        if (!settled) setData(empty);
      })
      .finally(() => {
        settled = true;
        clearTimeout(timer);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, refresh, member: Boolean(data.plan) };
}

export function useTillStatus() {
  const [till, setTill] = useState({ stripe: false, database: false, loaded: false });
  useEffect(() => {
    void getTillStatus()
      .then((d) => setTill({ ...d, loaded: true }))
      .catch(() => setTill({ stripe: false, database: false, loaded: true }));
  }, []);
  return till;
}
