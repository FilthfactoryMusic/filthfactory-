import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { formatGbp } from "@/lib/utils";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const callbackURL = redirect && redirect.startsWith("/") ? redirect : "/booth";

  return (
    <div className="mx-auto max-w-sm py-10 text-center">
      <img src="/art/brand/logo.png" alt="" className="mx-auto size-28" />
      <p className="mt-5 font-display text-lg font-semibold uppercase tracking-widest">Filthfactory</p>
      <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        18+ only. Then join from {formatGbp(500)} a month to go live, drop mixes and gift DJs. They keep 50%.
      </p>
      {authEnabled ? (
        <div className="mt-8 space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL })}
              className="h-12 w-full rounded-sm border border-border bg-surface text-sm font-medium hover:bg-raised"
            >
              Continue with {p.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
      )}
      <p className="mt-8 text-xs text-faint">
        By continuing you agree to the{" "}
        <a href="/terms" className="underline underline-offset-2">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-2">
          Privacy policy
        </a>
        .
      </p>
    </div>
  );
}
