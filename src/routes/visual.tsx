import { createFileRoute, Link } from "@tanstack/react-router";
import { QC_GATES } from "@/lib/merch-ops";

export const Route = createFileRoute("/visual")({ component: VisualPage });

function VisualPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Visual desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Art</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Circle stamp. Drip letters. Cropped lockups. No photo squares. No Elbourt.
      </p>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm">
        {QC_GATES.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link to="/ops" className="rounded-sm bg-accent px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-accent-fg">
          Ops OK
        </Link>
        <Link to="/shop" className="rounded-sm border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide">
          Shop
        </Link>
        <Link to="/team" className="rounded-sm border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide">
          Firm
        </Link>
      </div>
    </main>
  );
}
