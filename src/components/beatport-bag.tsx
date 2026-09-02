import { type FormEvent, useState } from "react";
import { ChartCard } from "@/components/chart-card";
import { MixGrid } from "@/components/section";
import { SUGGESTED_FOLLOWS } from "@/lib/bag-api";
import { useBagReleases } from "@/lib/use-bag";
import { useLibrary } from "@/lib/library-store";

export function BeatportBag({ compact }: { compact?: boolean }) {
  const bag = useLibrary((s) => s.bag);
  const addBag = useLibrary((s) => s.addBag);
  const removeBag = useLibrary((s) => s.removeBag);
  const { mixes, loading } = useBagReleases();
  const [draft, setDraft] = useState("");

  function onAdd(e: FormEvent) {
    e.preventDefault();
    addBag(draft);
    setDraft("");
  }

  return (
    <div>
      {!compact ? (
        <p className="text-sm text-muted">
          Beatport does not let other apps log into your Advanced account. Add the labels and artists you
          follow — we pull their latest, play a 30s licensed preview, and send you to Beatport for the full
          track.
        </p>
      ) : null}

      <form onSubmit={onAdd} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Hospital Records, NOTION, Critical…"
          className="min-w-0 flex-1 rounded-sm border border-border bg-raised px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-fg">
          Follow
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_FOLLOWS.filter((s) => !bag.some((b) => b.toLowerCase() === s.toLowerCase()))
          .slice(0, compact ? 6 : 14)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addBag(s)}
              className="rounded-sm border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-fg"
            >
              + {s}
            </button>
          ))}
      </div>

      {bag.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {bag.map((n) => (
            <li key={n} className="flex items-center gap-1 rounded-sm bg-surface px-2 py-1 text-xs">
              {n}
              <button type="button" className="text-muted hover:text-fg" onClick={() => removeBag(n)} aria-label={`Remove ${n}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {loading ? <p className="mt-4 text-sm text-muted">Pulling new releases…</p> : null}

      {mixes.length ? (
        <div className="mt-4">
          <MixGrid>
            {mixes.slice(0, compact ? 5 : 12).map((m) => (
              <ChartCard key={m.id} mix={m} queue={mixes.map((x) => x.id)} />
            ))}
          </MixGrid>
        </div>
      ) : null}
    </div>
  );
}
