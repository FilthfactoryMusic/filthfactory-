import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: email.trim().split("@")[0] || "Resident",
        });
        if (err) throw new Error(err.message || "Could not create account");
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (err) throw new Error(err.message || "Could not sign in");
      }
      window.location.assign(callbackURL);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      if (/invalid origin/i.test(msg)) {
        setError("This domain is not on the sign-in list yet. Add BETTER_AUTH_URL in Vercel.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10 text-center">
      <img src="/art/brand/logo.png" alt="" className="mx-auto size-28" />
      <p className="mt-5 font-display text-lg font-semibold uppercase tracking-widest">Filthfactory</p>
      <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        18+ only. Then join from {formatGbp(500)} a month to go live and drop mixes.
      </p>
      {authEnabled ? (
        <div className="mt-8 space-y-3 text-left">
          <form onSubmit={(e) => void onEmail(e)} className="space-y-3">
            <label className="block text-xs uppercase tracking-widest text-muted">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg"
              />
            </label>
            <label className="block text-xs uppercase tracking-widest text-muted">
              Password
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg"
              />
            </label>
            {error ? <p className="text-sm text-live">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-sm bg-accent text-sm font-semibold text-accent-fg disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in with email"}
            </button>
          </form>
          <button
            type="button"
            className="w-full text-center text-sm text-muted underline underline-offset-4"
            onClick={() => {
              setMode(mode === "up" ? "in" : "up");
              setError(null);
            }}
          >
            {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
          <p className="pt-4 text-center text-xs uppercase tracking-widest text-faint">or</p>
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
