import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandedText } from "@/components/brand-mark";
import { FACTORY_MERCH, SPOOF_MERCH, CAMO_MERCH, CLASH_MERCH, LABEL_INSTAGRAM, instagramUrl, tagFor, type MerchSku } from "@/lib/merch";
import { UK_BASS_LABELS } from "@/lib/uk-bass-labels";
import { FEATURED_CONTROLLERS, UK_DJ_SHOPS, shopById, shopHref } from "@/lib/dj-shops";
import { startMerch } from "@/lib/merch-api";
import { Button } from "@/components/ui/button";
import { formatGbp } from "@/lib/utils";

export const Route = createFileRoute("/merch")({ component: MerchPage });

function MerchCard({
  item,
  busy,
  onBuy,
}: {
  item: MerchSku;
  busy: string | null;
  onBuy: (id: string) => void;
}) {
  const [view, setView] = useState<"piece" | "tag">("piece");
  const tag = item.tag ?? tagFor(item.kind, item.color);
  const src = view === "tag" ? tag : item.image;
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface">
      <button type="button" className="relative block w-full" onClick={() => setView(view === "piece" ? "tag" : "piece")}>
        <img src={src} alt={view === "tag" ? `${item.name} clothing tag` : `${item.name} ${item.color}`} className="aspect-square w-full bg-white object-contain" />
        <span className="absolute bottom-2 right-2 rounded-sm bg-bg/80 px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-wide">
          {view === "tag" ? "Tag" : "Tap for tag"}
        </span>
      </button>
      <div className="p-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{item.name}</h2>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-muted">{item.color}</p>
        <p className="mt-1 text-sm text-muted">{item.blurb}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{formatGbp(item.pence)}</p>
          <Button size="sm" disabled={busy === item.id} onClick={() => onBuy(item.id)}>
            {busy === item.id ? "Opening…" : "Buy"}
          </Button>
        </div>
      </div>
    </article>
  );
}

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
      <p className="mt-3 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Controllers from UK desks. Factory print. Label merch.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">DJ controllers</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        The main buy. Opens the UK shop. Full catalogues underneath.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {FEATURED_CONTROLLERS.map((deck) => {
          const shop = shopById(deck.shopId);
          return (
            <article key={deck.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <img
                src={deck.image}
                alt={`${deck.brand} ${deck.name}`}
                loading="lazy"
                decoding="async"
                className="aspect-video w-full bg-white object-contain p-3"
              />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted">{deck.brand}</p>
                <h3 className="mt-1 font-display text-xl font-semibold uppercase tracking-wide">{deck.name}</h3>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-muted">{deck.software}</p>
                <p className="mt-2 text-sm text-muted">{deck.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={shopHref(deck.url, deck.shopId)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center rounded-sm bg-accent px-4 font-display text-sm font-semibold uppercase tracking-wide text-accent-fg"
                  >
                    Buy at {shop?.name ?? "UK shop"}
                  </a>
                  {shop ? (
                    <a
                      href={shopHref(shop.controllers, shop.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold uppercase tracking-wide"
                    >
                      Full shop
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">UK DJ shops</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Real UK suppliers. Controllers and the full shop.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {UK_DJ_SHOPS.map((shop) => (
          <article key={shop.id} className="rounded-sm border border-border bg-surface p-4">
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{shop.name}</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted">{shop.city}</p>
            <p className="mt-2 text-sm text-muted">{shop.blurb}</p>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <a
                href={shopHref(shop.controllers, shop.id)}
                target="_blank"
                rel="noreferrer"
                className="font-display font-semibold uppercase tracking-wide underline underline-offset-2"
              >
                Controllers
              </a>
              <a
                href={shopHref(shop.site, shop.id)}
                target="_blank"
                rel="noreferrer"
                className="font-display font-semibold uppercase tracking-wide underline underline-offset-2"
              >
                Full shop
              </a>
            </p>
          </article>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">Warehouse</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Jungle, workwear, xerox. Not neon bikini.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CLASH_MERCH.map((item) => (
          <MerchCard key={item.id} item={item} busy={busy} onBuy={buy} />
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">Drip</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Your FILTH FACTORY letters. Thick black outline. Tees and hoodies.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORY_MERCH.filter((i) => i.id.startsWith("drip-")).map((item) => (
          <MerchCard key={item.id} item={item} busy={busy} onBuy={buy} />
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">Factory print</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Circle stamp, drip letters, original factory mark. Colourways. Clothing tags. UK post.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORY_MERCH.filter((i) => !i.id.startsWith("drip-")).map((item) => (
          <MerchCard key={item.id} item={item} busy={busy} onBuy={buy} />
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">Jungle camo</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Woodland and snow. Drip FILTH FACTORY.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CAMO_MERCH.map((item) => (
          <MerchCard key={item.id} item={item} busy={busy} onBuy={buy} />
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">UK spoofs</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Original gags. Black, white, olive. Logos can be swapped later.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPOOF_MERCH.map((item) => (
          <MerchCard key={item.id} item={item} busy={busy} onBuy={buy} />
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold uppercase tracking-wide">UK bass labels</h2>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Their merch, their till. We just link it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {UK_BASS_LABELS.map((lab) => {
          const ig = LABEL_INSTAGRAM[lab.name];
          return (
            <article key={lab.name} className="rounded-sm border border-border bg-surface p-3">
              <img src={lab.logo} alt={lab.name} className="aspect-square w-full rounded-sm bg-black object-contain" />
              <p className="mt-2 truncate font-display text-sm font-semibold uppercase tracking-wide">{lab.name}</p>
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
        <BrandedText text="Hardware is theirs. Factory print is ours." />{" "}
        <Link to="/terms" className="underline underline-offset-2">
          Terms
        </Link>
        {" · "}
        <Link to="/ops" className="underline underline-offset-2">
          Ops desk
        </Link>
      </p>
    </main>
  );
}
