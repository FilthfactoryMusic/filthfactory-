import { cn } from "@/lib/utils";

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-live px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider text-live-fg",
        className,
      )}
    >
      <span className="live-dot size-1.5 rounded-full bg-live-fg" />
      Live
    </span>
  );
}
