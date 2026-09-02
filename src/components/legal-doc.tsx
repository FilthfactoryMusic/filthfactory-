import { LEGAL_DOCS, type LegalDoc } from "@/lib/legal";

export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-muted">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">{doc.title}</h1>
      <p className="mt-2 text-sm text-muted">Updated {doc.updated}. Filthfactory · United Kingdom.</p>
      <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
        {LEGAL_DOCS.map((d) => (
          <a key={d.slug} href={`/${d.slug}`} className={d.slug === doc.slug ? "text-fg" : "hover:text-fg"}>
            {d.title}
          </a>
        ))}
      </nav>
      <div className="mt-8 space-y-8">
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-muted">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
