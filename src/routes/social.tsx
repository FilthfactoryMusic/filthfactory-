import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SOCIAL_PACK } from "@/lib/team";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/social")({ component: SocialPage });

function SocialPage() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      setCopied(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Social ops</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Rep</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        We write it. You post it. No auto-spam. No fake likes. Represent is the share.
      </p>
      <ul className="mt-8 space-y-3">
        {SOCIAL_PACK.map((line) => (
          <li key={line} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
            <p className="font-display text-sm font-semibold uppercase tracking-wide">{line}</p>
            <Button size="sm" variant="outline" onClick={() => void copy(line)}>
              {copied === line ? "Copied" : "Copy"}
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link to="/open" className="rounded-sm bg-accent px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-accent-fg">
          Open pack
        </Link>
        <Link to="/team" className="rounded-sm border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide">
          Firm
        </Link>
      </div>
    </main>
  );
}
