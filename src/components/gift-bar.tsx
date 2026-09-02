import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GIFT_SKUS, splitGift } from "@/lib/billing";
import { listLiveGifts, sendLiveGift, type GiftRow } from "@/lib/billing-api";
import { useMyBilling } from "@/lib/use-billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn, formatGbp } from "@/lib/utils";

export function GiftBar({
  liveId,
  isHost,
  hostName,
  className,
}: {
  liveId: string;
  isHost: boolean;
  hostName: string;
  className?: string;
}) {
  const user = useCurrentUser();
  const billing = useMyBilling();
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    const tick = () => {
      void listLiveGifts({ data: liveId })
        .then((rows) => {
          if (on) setGifts(rows);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      on = false;
      clearInterval(id);
    };
  }, [liveId]);

  async function send(sku: string) {
    if (!user || !billing.member) return;
    setBusy(sku);
    try {
      const row = await sendLiveGift({
        data: { liveId, sku, fromName: user.displayName || "Member" },
      });
      setGifts((g) => [row, ...g.filter((x) => x.id !== row.id)]);
      toast(`${row.label} sent · DJ receives ${formatGbp(row.djSharePence)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("MEMBERSHIP")) toast("Membership required to gift");
      else if (msg.includes("own broadcast")) toast("You cannot gift your own broadcast");
      else toast("Gift failed");
    } finally {
      setBusy(null);
    }
  }

  const canGift = Boolean(user && billing.member && !isHost);

  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Gifts</h2>
          <p className="mt-1 text-xs text-muted">50% to {hostName}. 50% to Filthfactory. Digital, not refundable once sent.</p>
        </div>
        <p className="text-xs text-muted tabular-nums">{gifts.length} sent</p>
      </div>

      {isHost ? (
        <p className="mt-3 text-sm text-muted">Gifts land in Account as they come in. You keep 50%.</p>
      ) : !user ? (
        <Link
          to="/login"
          search={{ redirect: `/live/${liveId}` }}
          className="mt-4 inline-flex h-11 items-center text-sm underline underline-offset-4"
        >
          Sign in to gift
        </Link>
      ) : billing.loading && !billing.member ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3">
          {GIFT_SKUS.map((g) => (
            <div
              key={g.sku}
              className="min-h-14 rounded-md border border-border bg-bg px-2 py-2 text-center opacity-50"
            >
              <span className="block text-sm font-medium">{g.label}</span>
              <span className="block text-xs tabular-nums text-muted">{formatGbp(g.pence)}</span>
            </div>
          ))}
        </div>
      ) : !billing.member ? (
        <Link
          to="/membership"
          className="mt-4 inline-flex h-11 items-center text-sm underline underline-offset-4"
        >
          Membership required to gift — {formatGbp(500)} / month
        </Link>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3">
          {GIFT_SKUS.map((g) => {
            const { dj } = splitGift(g.pence);
            return (
              <button
                key={g.sku}
                type="button"
                disabled={!canGift || busy !== null}
                onClick={() => void send(g.sku)}
                className="min-h-14 rounded-md border border-border bg-bg px-2 py-2 text-center hover:border-accent disabled:opacity-50"
              >
                <span className="block text-sm font-medium">{busy === g.sku ? "Sending" : g.label}</span>
                <span className="block text-xs tabular-nums text-muted">{formatGbp(g.pence)}</span>
                <span className="block text-xs tabular-nums text-faint">DJ {formatGbp(dj)}</span>
              </button>
            );
          })}
        </div>
      )}

      {gifts.length ? (
        <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto text-sm">
          {gifts.slice(0, 12).map((g) => (
            <li key={g.id}>
              <span className="text-muted">{g.fromName}</span>
              <span className="text-fg">
                {" "}
                sent {g.label} · {formatGbp(g.amountPence)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">No gifts yet. Be the first.</p>
      )}
    </div>
  );
}
