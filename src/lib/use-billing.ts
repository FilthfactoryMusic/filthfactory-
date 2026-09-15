import { useCallback, useEffect, useState } from "react";
import { getMyBilling, getTillStatus, type BillingSnapshot } from "@/lib/billing-api";
import type { PlanId } from "@/lib/billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";

const CACHE = "ff-plan";

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

function readPlan(): PlanId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CACHE);
    if (v === "resident" || v === "featured") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function writePlan(plan: PlanId | null) {
  try {
    if (plan) localStorage.setItem(CACHE, plan);
    else localStorage.removeItem(CACHE);
  } catch {
    /* ignore */
  }
}

export function useMyBilling() {
  const user = useCurrentUser();
  const userId = user?.id ?? null;
  const [data, setData] = useState<BillingSnapshot>(() => {
    const plan = readPlan();
    return plan ? { ...empty, plan, status: "active" } : empty;
  });
  const [loading, setLoading] = useState(() => Boolean(userId) && !readPlan());

  const refresh = useCallback(() => {
    if (!userId) {
      setData(empty);
      setLoading(false);
      writePlan(null);
      return Promise.resolve();
    }
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setLoading(false);
    }, 2500);
    return getMyBilling()
      .then((row) => {
        if (settled) return;
        setData(row);
        if (row.plan) writePlan(row.plan);
      })
      .catch(() => {
        /* keep last known plan so the booth does not dump them */
      })
      .finally(() => {
        settled = true;
        clearTimeout(timer);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    void refresh();
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
