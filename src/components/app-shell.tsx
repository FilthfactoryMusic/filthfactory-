import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, Disc3, Mic, Radio, Search, type LucideIcon } from "lucide-react";
import { useEffect, type FormEvent, type ReactNode } from "react";
import { PlayerBar } from "@/components/player-bar";
import { Wordmark } from "@/components/wordmark";
import { AuthSlot } from "@/components/auth-slot";
import { Input } from "@/components/ui/input";
import { AgeGate } from "@/components/age-gate";
import { CookieNotice } from "@/components/cookie-notice";
import { useLibrary } from "@/lib/library-store";
import { usePlayer } from "@/lib/player-store";
import { isLegalPath } from "@/lib/legal";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    to: "/live" as const,
    label: "Radio & Live",
    short: "Radio",
    icon: Radio,
    match: (p: string) => p.startsWith("/live") || p.startsWith("/wow"),
  },
  {
    to: "/releases" as const,
    label: "Library & Crate",
    short: "Crate",
    icon: Disc3,
    match: (p: string) =>
      p.startsWith("/releases") ||
      p.startsWith("/library") ||
      p.startsWith("/charts") ||
      p.startsWith("/genre") ||
      p.startsWith("/shop") ||
      p.startsWith("/merch") ||
      p.startsWith("/search"),
  },
  {
    to: "/school" as const,
    label: "Education & Tools",
    short: "School",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/school") || p.startsWith("/software") || p.startsWith("/trade"),
  },
  {
    to: "/booth" as const,
    label: "Booth & Membership",
    short: "Booth",
    icon: Mic,
    live: true,
    match: (p: string) => p.startsWith("/booth") || p.startsWith("/membership") || p.startsWith("/login"),
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = usePlayer((s) => s.now);
  const toggle = usePlayer((s) => s.toggle);
  const hydrate = useLibrary((s) => s.hydrate);
  const navigate = useNavigate();
  const legal = isLegalPath(pathname);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "");
    void navigate({ to: "/search", search: { q } });
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-3 md:h-24 md:px-6">
          <Link to="/" className="shrink-0 text-fg" aria-label="Filthfactory home">
            <Wordmark />
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
            {PILLARS.map((item) => {
              const on = item.match(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    "rounded-sm px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wide md:text-sm",
                    item.live && "bg-live px-4 text-live-fg",
                    !item.live && on && "bg-fg text-bg",
                    !item.live && !on && "text-muted hover:text-fg",
                  )}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.short}</span>
                </Link>
              );
            })}
          </nav>
          <form onSubmit={onSearch} className="ml-auto hidden w-44 xl:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
              <Input name="q" placeholder="Find a mix, a DJ, a city" className="h-10 pl-9" />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <AuthSlot />
            <Link
              to="/search"
              search={{ q: "" }}
              className="ff-hit text-muted xl:hidden"
              aria-label="Search"
            >
              <Search className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8",
          now ? "pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-28" : "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-24",
        )}
      >
        {children}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-28 text-xs text-faint md:px-6 md:pb-10">
        <p className="flex items-center gap-2">
          <img src="/art/brand/logo.png" alt="" className="size-5 rounded-full object-cover" />
          Filth Factory Music trading as Filthfactory · sole trader · UK · 18+
        </p>
        <p className="mt-1">Resident £5 / month. Gifts not on sale yet. legal@filthfactory.co.uk</p>
        <p className="mt-1">
          No blanket PRS or PPL licence. Only go live or drop mixes you have the rights to. Not legal advice.
        </p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link to="/shop" className="hover:text-fg">
            Shop
          </Link>
          <Link to="/software" className="hover:text-fg">
            DJ software
          </Link>
          <Link to="/library" className="hover:text-fg">
            Crate
          </Link>
          <Link to="/wow" className="hover:text-fg">
            Who's On What
          </Link>
          <Link to="/membership" className="hover:text-fg">
            Membership
          </Link>
          <Link to="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-fg">
            Terms
          </Link>
          <Link to="/community" className="hover:text-fg">
            Community
          </Link>
          <Link to="/cookies" className="hover:text-fg">
            Cookies
          </Link>
          <Link to="/safety" className="hover:text-fg">
            Safety
          </Link>
          <Link to="/unsubscribe" className="hover:text-fg">
            Unsubscribe
          </Link>
        </nav>
      </footer>

      <PlayerBar />

      {!legal ? <AgeGate /> : null}
      {!legal ? <CookieNotice /> : null}

      <nav className="ff-tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface sm:hidden">
        <div className="grid grid-cols-4">
          {PILLARS.map((item) => (
            <MobileLink
              key={item.to}
              to={item.to}
              label={item.short}
              ariaLabel={item.label}
              icon={item.icon}
              active={item.match(pathname)}
              live={item.live}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileLink({
  to,
  label,
  ariaLabel,
  icon: Icon,
  active,
  live,
}: {
  to: "/live" | "/booth" | "/releases" | "/school";
  label: string;
  ariaLabel: string;
  icon: LucideIcon;
  active: boolean;
  live?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center font-display text-[10px] font-semibold uppercase leading-tight tracking-wide",
        live && "bg-live text-live-fg",
        active && !live && "text-fg",
        !active && !live && "text-muted",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
