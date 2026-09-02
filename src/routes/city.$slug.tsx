import { createFileRoute, Link } from "@tanstack/react-router";
import { LiveCard } from "@/components/live-card";
import { CITIES } from "@/lib/catalog";
import { WORLD_LIVE, WORLD_DJS } from "@/lib/feeds";

export const Route = createFileRoute("/city/$slug")({ component: CityPage });

function CityPage() {
  const { slug } = Route.useParams();
  const city = CITIES.find((c) => c.slug === slug);
  const name = city?.name ?? slug;
  const live = WORLD_LIVE.filter((s) => s.citySlug === slug);
  const djs = WORLD_DJS.filter((d) => d.citySlug === slug);

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted">City</p>
      <h1 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">{name}</h1>
      <p className="mt-2 text-sm text-muted">Real stations only. No made-up residents.</p>

      {djs.length ? (
        <div className="mt-8 flex flex-wrap gap-6">
          {djs.map((d) => (
            <Link key={d.id} to="/dj/$id" params={{ id: d.id }} className="flex items-center gap-3">
              <img src={d.photo} alt="" className="size-14 rounded-full object-cover" />
              <span>
                <span className="block text-sm font-medium">{d.name}</span>
                <span className="text-xs text-muted">{d.show}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {live.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {live.map((s) => (
            <LiveCard key={s.id} show={s} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">No live UK station tagged here right now. Try On air.</p>
      )}
    </div>
  );
}
