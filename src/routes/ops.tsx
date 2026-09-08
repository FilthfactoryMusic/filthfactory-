import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandedText } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { loadOps, setOpsStatus } from "@/lib/merch-ops-api";
import { QC_GATES, SUPPLIERS, type OpsLine, type OpsStatus } from "@/lib/merch-ops";
import { formatGbp } from "@/lib/utils";

export const Route = createFileRoute("/ops")({ component: OpsPage });

function OpsPage() {
  const [lines, setLines] = useState<OpsLine[]>([]);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [thin, setThin] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const data = await loadOps();
    setLines(data.lines);
    setPending(data.summary.pending);
    setApproved(data.summary.approved);
    setThin(data.summary.thin);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function setStatus(sku: string, status: OpsStatus) {
    setBusy(sku);
    try {
      const data = await setOpsStatus({ data: { sku, status } });
      setLines(data.lines);
      setPending(data.summary.pending);
      setApproved(data.summary.approved);
      setThin(data.summary.thin);
    } finally {
      setBusy(null);
    }
  }

  const waiting = lines.filter((l) => l.status === "pending");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Filthfactory ops</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Approve</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Design gather, price check, print partner, QC. Bots recommend. You tap OK. Nothing ships until you do.{" "}
        <Link to="/desk" className="underline underline-offset-2">
          Chief of staff
        </Link>
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Waiting on you" value={String(pending)} />
        <Stat label="Approved" value={String(approved)} />
        <Stat label="Thin margin" value={String(thin)} />
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">QC</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
        {QC_GATES.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Print partners</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">Typical UK bands. Not a live quote until the account is linked.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUPPLIERS.map((s) => (
          <article key={s.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="font-display text-sm font-semibold uppercase tracking-wide">{s.name}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">{s.kind}</p>
            <p className="mt-2 text-sm text-muted">{s.blurb}</p>
            <a href={s.site} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs underline underline-offset-2">
              Site
            </a>
          </article>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Waiting</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {waiting.map((line) => (
          <article key={line.sku} className="overflow-hidden rounded-lg border border-border bg-surface">
            <img src={line.image} alt={line.name} className="aspect-square w-full bg-white object-contain" />
            <div className="p-4">
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{line.name}</h3>
              <p className="text-xs uppercase tracking-widest text-muted">
                {line.color} · {line.method} · {line.partner}
              </p>
              <p className="mt-2 text-sm">
                Sell {formatGbp(line.sell)} · cost {formatGbp(line.costLow)}–{formatGbp(line.costHigh)}
              </p>
              <p className={`mt-1 text-sm ${line.marginLow < 300 ? "text-accent" : "text-muted"}`}>
                Margin after card {formatGbp(line.marginLow)}–{formatGbp(line.marginHigh)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" disabled={busy === line.sku} onClick={() => void setStatus(line.sku, "approved")}>
                  OK
                </Button>
                <Button size="sm" variant="outline" disabled={busy === line.sku} onClick={() => void setStatus(line.sku, "hold")}>
                  Hold
                </Button>
                <Button size="sm" variant="outline" disabled={busy === line.sku} onClick={() => void setStatus(line.sku, "reject")}>
                  No
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {waiting.length === 0 ? <p className="mt-4 text-sm text-muted">Nothing waiting. Desk is clear.</p> : null}

      <p className="mt-10 text-xs text-faint">
        <BrandedText text="Print partners fulfil after the account is linked. Bots do not spend money." />
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
