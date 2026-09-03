import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FACTORY_MERCH, FACTORY_IG, FACTORY_TIKTOK, LABEL_INSTAGRAM, instagramUrl } from "@/lib/merch";
import { UK_BASS_LABELS } from "@/lib/uk-bass-labels";
import { startMerch } from "@/lib/merch-api";
import { Button } from "@/components/ui/button";
import { formatGbp } from "@/lib/utils";

export const Route = createFileRoute("/merch")({ component: MerchPage });

export function MerchPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(sku: string) {
    setBusy(sku);
    setError(null);
    try {
      const result = await startMerch({ data: { sku } });
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      setError("Checkout did not open. Stripe keys still need to be live.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      if (/STRIPE/i.test(raw)) setError("Stripe is not live yet. Add the keys, then this button takes the card.");
      else setError("Checkout failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Shop / merch</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Shop</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        The circular stamp on blanks — tees in black, white, grey and olive, hoodie, beanie, snapback, keyring. Printed
        to order, Stripe, UK post. Instagram{" "}
        <a href={instagramUrl(FACTORY_IG)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          @{FACTORY_IG}
        </a>
        . TikTok{" "}
        <a href={`https://www.tiktok.com/@${FACTORY_TIKTOK}`} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          @{FACTORY_TIKTOK}
        </a>
        .
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORY_MERCH.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-surface">
            <img src={item.image} alt={`${item.name} ${item.color}`} className="aspect-square w-full bg-white object-contain" />
            <div className="p-4">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{item.name}</h2>
              <p className="mt-0.5 text-xs uppercase tracking-widest text-muted">{item.color}</p>
              <p className="mt-1 text-sm text-muted">{item.blurb}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{formatGbp(item.pence)}</p>
                <Button size="sm" disabled={busy === item.id} onClick={() => void buy(item.id)}>
                  {busy === item.id ? "Opening…" : "Buy"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">Label shops</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Official store and Instagram. Their merch, their till. Not ours.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {UK_BASS_LABELS.map((lab) => {
          const ig = LABEL_INSTAGRAM[lab.name];
          return (
            <article key={lab.name} className="rounded-sm border border-border bg-surface p-3">
              <img src={lab.logo} alt="" className="aspect-square w-full rounded-sm bg-black object-contain" />
              <p className="mt-2 truncate text-sm font-medium">{lab.name}</p>
              <p className="flex flex-wrap gap-x-2 text-xs">
                <a href={lab.site} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Shop
                </a>
                {ig ? (
                  <a href={instagramUrl(ig)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    Instagram
                  </a>
                ) : null}
              </p>
            </article>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-faint">
        Catalog mockups of the circular stamp on blanks.{" "}
        <Link to="/terms" className="underline underline-offset-2">
          Terms
        </Link>
      </p>
    </main>
  );
}
