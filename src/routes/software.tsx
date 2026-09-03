import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandedText } from "@/components/brand-mark";
import { SOFT_DESKS } from "@/lib/software-scan";
import { useSoftware } from "@/lib/use-software";

export const Route = createFileRoute("/software")({
  component: SoftwarePage,
  head: () => ({
    meta: [
      { title: "DJ software — Filthfactory" },
      {
        name: "description",
        content: "Daily rekordbox, Serato DJ and Engine DJ software news and updates. Official desks.",
      },
    ],
  }),
});

function SoftwarePage() {
  const { digest, loading } = useSoftware();
  const items = digest?.items ?? [];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Software</p>
      <h1 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">DJ software</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        <BrandedText text="rekordbox, Serato, Engine DJ — official updates and news, pulled daily." /> Logos and download
        links. Tap through to the maker. Control maps live in{" "}
        <Link to="/school" className="underline underline-offset-2">
          School
        </Link>
        .
      </p>
      {loading ? <p className="mt-8 text-sm text-muted">Checking the three desks…</p> : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {SOFT_DESKS.map((desk) => {
          const rows = items.filter((i) => i.desk === desk.id);
          return (
            <section key={desk.id} className="rounded-lg border border-border bg-surface p-5">
              <img src={desk.logo} alt="" className="h-16 w-auto max-w-[220px] object-contain" />
              <h2 className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide">{desk.name}</h2>
              <p className="mt-1 text-sm text-muted">{desk.blurb}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 text-sm">
                <a href={desk.site} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  News
                </a>
                <a href={desk.download} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Download
                </a>
              </p>
              <ul className="mt-5 space-y-3">
                {rows.slice(0, 6).map((n) => (
                  <li key={n.id}>
                    <a href={n.url} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                      <BrandedText text={n.title} />
                    </a>
                    <p className="text-xs text-muted">
                      <BrandedText text={n.blurb} />
                    </p>
                  </li>
                ))}
                {!loading && !rows.length ? <li className="text-sm text-muted">No fresh notes this sweep.</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
