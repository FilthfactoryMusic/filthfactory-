import { useCallback, useEffect, useState } from "react";
import { getMyBilling, type BillingSnapshot } from "@/lib/billing-api";
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
      return;
    }
    setLoading(true);
    void getMyBilling()
      .then(setData)
      .catch(() => setData(empty))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, refresh, member: Boolean(data.plan) };
}
