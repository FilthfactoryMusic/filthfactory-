import { Link } from "@tanstack/react-router";
import { GIFTS_ON_SALE } from "@/lib/legal";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4", className)}>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Gifts</h2>
      {GIFTS_ON_SALE ? null : (
        <>
          <p className="mt-2 text-sm text-muted">
            Not on sale. {hostName} cannot be tipped from here yet — we will not take gift money until Stripe
            can pay the DJ 50%.
          </p>
          {isHost ? (
            <p className="mt-2 text-xs text-faint">When gifts ship, they land in Account. Minimum payout £20.</p>
          ) : (
            <Link to="/membership" className="mt-3 inline-flex text-sm underline underline-offset-4">
              Membership is the paid product for now
            </Link>
          )}
        </>
      )}
      {/* liveId kept so existing call sites do not change */}
      <span className="sr-only">{liveId}</span>
    </div>
  );
}
