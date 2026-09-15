import { Link } from "@tanstack/react-router";
import { useLiveProduct } from "@/hooks/use-live-transport";
import { LIVE_COMING_SOON, LIVE_GO_LIVE } from "@/lib/live-copy";
import { cn } from "@/lib/utils";

export function LiveBoothCta({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "xl";
  className?: string;
}) {
  const { openJoin, ready } = useLiveProduct();
  const selling = ready && openJoin;
  const label = selling ? LIVE_GO_LIVE : LIVE_COMING_SOON;
  const to = selling ? "/booth" : "/live";

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-display font-semibold uppercase tracking-[0.2em]",
        size === "xl" && "h-16 w-full max-w-md bg-live px-8 text-2xl tracking-[0.25em] text-live-fg",
        size === "md" && "h-14 w-full max-w-sm bg-live px-8 text-xl text-live-fg",
        size === "sm" && "h-11 bg-live px-4 text-sm tracking-wide text-live-fg",
        !selling && "bg-raised text-muted",
        className,
      )}
    >
      {label}
    </Link>
  );
}
