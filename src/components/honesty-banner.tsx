import { useLiveProduct } from "@/hooks/use-live-transport";
import { boothHonesty, payHonesty } from "@/lib/live-copy";

export function HonestyBanner({ room }: { room: "booth" | "pay" | "stations" }) {
  const { openJoin } = useLiveProduct();
  const copy =
    room === "booth"
      ? boothHonesty(openJoin)
      : room === "pay"
        ? payHonesty(openJoin)
        : "Station tiles only show Live or Listening when there is real audio or a working player. Dead desks stay off the board.";

  return (
    <p className="rounded-sm border border-border bg-raised px-3 py-2 text-xs leading-relaxed text-muted">{copy}</p>
  );
}
