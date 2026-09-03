import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandedText } from "@/components/brand-mark";
import { SchoolDiagram } from "@/components/school-diagrams";
import { SCHOOL, SCHOOL_CREDIT } from "@/lib/school";

export const Route = createFileRoute("/school")({
  component: SchoolPage,
  head: () => ({
    meta: [
      { title: "School — Filthfactory" },
      {
        name: "description",
        content: "Filthfactory DJ school. Control maps for mixer, cue, EQ, loops, stems. Original instruction, UK bass desk.",
      },
    ],
  }),
});

function SchoolPage() {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted">
        <img src="/art/brand/logo.png" alt="" className="size-5 rounded-full object-cover" />
        School
      </p>
      <h1 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">Tips & tricks</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Instruction manual for the desk. Still pictures, numbered controls, short steps. Written here — not copied from
        anyone’s scripts. Same topics a lot of DJs learn from{" "}
        <a href={SCHOOL_CREDIT.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          {SCHOOL_CREDIT.name}
        </a>{" "}
        on YouTube. Watch him for the moving version. This page is the paper version.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2">
        {SCHOOL.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className="rounded-sm border border-border px-2 py-1 text-xs uppercase tracking-wide text-muted hover:text-fg"
          >
            {l.n}. {l.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {SCHOOL.map((l) => (
          <section key={l.id} id={l.id} className="scroll-mt-24">
            <p className="text-xs uppercase tracking-[0.25em] text-faint">Lesson {l.n}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide">{l.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              <BrandedText text={l.blurb} />
            </p>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-sm border border-border">
                <SchoolDiagram kind={l.diagram} />
              </div>
              <ol className="space-y-3">
                {l.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-fg">
                      {i + 1}
                    </span>
                    <span>
                      <BrandedText text={s} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 max-w-xl text-xs text-faint">
        Not Carlo’s course and not his words. If you want the original videos, that’s his channel. Software updates live
        on{" "}
        <Link to="/software" className="underline underline-offset-2">
          SOFTWARE
        </Link>
        .
      </p>
    </div>
  );
}
