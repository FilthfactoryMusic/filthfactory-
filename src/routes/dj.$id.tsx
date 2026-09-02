import { createFileRoute, Link } from "@tanstack/react-router";
import { MixCard } from "@/components/mix-card";
import { MixGrid } from "@/components/section";
import { getDj, liveNow, liveUpcoming, mixesByDj } from "@/lib/catalog";
import { useLibrary } from "@/lib/library-store";
import { formatCount } from "@/lib/utils";
import { ReportControl } from "@/components/report-control";

export const Route = createFileRoute("/dj/$id")({ component: DjPage });

function DjPage() {
  const { id } = Route.useParams();
  const dj = getDj(id);
  const mixes = mixesByDj(id);
  const follows = useLibrary((s) => s.follows);
  const toggleFollow = useLibrary((s) => s.toggleFollow);
  const live = [...liveNow(), ...liveUpcoming()].filter((s) => s.djId === id);

  if (!dj) return <p className="text-muted">DJ not found.</p>;

  return (
    <div>
      <div className="overflow-hidden rounded-sm bg-surface">
        <div className="h-36 bg-raised md:h-48">
          <img src={mixes[0]?.artwork ?? dj.photo} alt="" className="h-full w-full object-cover opacity-50" />
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6">
          <img
            src={dj.photo}
            alt=""
            className="-mt-10 size-28 rounded-full border-4 border-surface object-cover md:size-36"
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-xs uppercase tracking-widest text-muted">{dj.show}</p>
            <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">{dj.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {dj.city} · {dj.genres.join(" / ")} · {formatCount(dj.followers)} followers
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleFollow(dj.id)}
            className="h-11 shrink-0 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg"
          >
            {follows.includes(dj.id) ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-muted">{dj.bio}</p>
      <div className="mt-4">
        <ReportControl targetType="user" targetId={dj.id} blockId={dj.id} />
      </div>

      {live.length ? (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Broadcasts</h2>
          <ul className="mt-3 space-y-2">
            {live.map((s) => (
              <li key={s.id}>
                <Link to="/live/$id" params={{ id: s.id }} className="text-sm hover:underline">
                  {s.status === "live" ? "Live now — " : "Upcoming — "}
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">Mixes</h2>
      <div className="mt-4">
        <MixGrid>
          {mixes.map((m) => (
            <MixCard key={m.id} mix={m} queue={mixes.map((x) => x.id)} />
          ))}
        </MixGrid>
      </div>
    </div>
  );
}
