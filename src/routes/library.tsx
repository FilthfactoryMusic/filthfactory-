import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BeatportBag } from "@/components/beatport-bag";
import { MixRow } from "@/components/mix-card";
import { getMix } from "@/lib/catalog";
import { WORLD_DJS } from "@/lib/feeds";
import { useLibrary } from "@/lib/library-store";
import type { Mix } from "@/lib/types";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const TABS = ["Likes", "Later", "History", "Following", "Beatport bag", "Reposts", "Your drops"] as const;

function LibraryPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Likes");
  const likes = useLibrary((s) => s.likes);
  const later = useLibrary((s) => s.later);
  const history = useLibrary((s) => s.history);
  const follows = useLibrary((s) => s.follows);
  const reposts = useLibrary((s) => s.reposts);
  const uploads = useLibrary((s) => s.uploads);

  const likeMixes = pickMixes(likes, uploads);
  const laterMixes = pickMixes(later, uploads);
  const histMixes = pickMixes(
    history.filter((h) => h.kind === "mix").map((h) => h.id),
    uploads,
  );
  const following = WORLD_DJS.filter((d) => follows.includes(d.id));
  const repostMixes = pickMixes(reposts, uploads);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Your crate</h1>
      <p className="mt-1 text-sm text-muted">Likes, later, history — stays on this phone.</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm ${tab === t ? "border-accent text-fg" : "border-transparent text-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Likes" ? <MixList mixes={likeMixes} empty="Like a mix and it lands here." /> : null}
        {tab === "Later" ? <MixList mixes={laterMixes} empty="Save mixes to play after the night." /> : null}
        {tab === "History" ? <MixList mixes={histMixes} empty="Play something and it will show up." /> : null}
        {tab === "Reposts" ? <MixList mixes={repostMixes} empty="Repost a mix to keep it in your crate." /> : null}
        {tab === "Your drops" ? (
          uploads.length ? (
            <MixList mixes={uploads} empty="" />
          ) : (
            <Empty>
              Nothing dropped yet.{" "}
              <Link to="/booth" className="underline">
                Open the booth
              </Link>
              .
            </Empty>
          )
        ) : null}
        {tab === "Beatport bag" ? <BeatportBag /> : null}
        {tab === "Following" ? (
          following.length ? (
            <ul className="space-y-3">
              {following.map((d) => (
                <li key={d.id}>
                  <Link to="/dj/$id" params={{ id: d.id }} className="flex items-center gap-3">
                    <img src={d.photo} alt="" className="size-12 rounded-full object-cover" />
                    <span>
                      <span className="block text-sm font-medium">{d.name}</span>
                      <span className="text-xs text-muted">
                        {d.city} · {d.show}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Follow a resident and they appear here.</Empty>
          )
        ) : null}
      </div>
    </div>
  );
}

function pickMixes(ids: string[], uploads: Mix[]) {
  return ids.map((id) => getMix(id) ?? uploads.find((m) => m.id === id)).filter((m): m is Mix => Boolean(m));
}

function MixList({ mixes, empty }: { mixes: Mix[]; empty: string }) {
  if (!mixes.length) return <Empty>{empty}</Empty>;
  const queue = mixes.map((m) => m.id);
  return (
    <div>
      {mixes.map((m) => (
        <MixRow key={m.id} mix={m} queue={queue} />
      ))}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-sm text-muted">{children}</p>;
}
