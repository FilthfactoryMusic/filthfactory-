export function HonestyBanner({ room }: { room: "booth" | "pay" | "stations" }) {
  const copy =
    room === "booth"
      ? "You go live on your own rights. Filthfactory does not hold a blanket PRS or PPL licence. Not legal advice."
      : room === "pay"
        ? "Membership is the booth. Listening stays free. Checkout is Stripe when it is on — never a fake till. Not legal advice."
        : "Station tiles only show Live or Listening when there is real audio or a working player. Dead desks stay off the board.";

  return (
    <p className="rounded-sm border border-border bg-raised px-3 py-2 text-xs leading-relaxed text-muted">{copy}</p>
  );
}
