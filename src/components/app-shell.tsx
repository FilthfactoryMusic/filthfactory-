import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, Cpu, Disc3, Mic, Radio, Search, ShoppingBag, Sparkles, type LucideIcon } from "lucide-react";
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

const NAV = [
  { to: "/", label: "Home" },
  { to: "/releases", label: "NEW RELEASES", big: true },
  { to: "/shop", label: "SHOP", big: true },
  { to: "/live", label: "On air" },
  { to: "/wow", label: "WOW" },
  { to: "/software", label: "Software" },
  { to: "/school", label: "School" },
  { to: "/charts", label: "Charts" },
  { to: "/library", label: "Crate" },
  { to: "/booth", label: "Go live" },
  { to: "/open", label: "Open" },
  { to: "/membership", label: "£5" },
] as const;

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
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-[4.5rem] md:px-6">
          <Link to="/" className="text-fg" aria-label="Filthfactory home">
            <Wordmark />
          </Link>
          <nav className="hidden max-w-[calc(100%-12rem)] flex-wrap items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const on =
                pathname === item.to ||
                (item.to === "/releases" && (pathname.startsWith("/genre") || pathname.startsWith("/charts"))) ||
                (item.to === "/shop" && pathname.startsWith("/merch"));
              const big = "big" in item && item.big;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-sm px-3 py-2 font-display text-sm font-semibold uppercase tracking-wide",
                    big && "px-4 py-2 text-base",
                    big && on && "bg-accent text-accent-fg",
                    big && !on && "bg-raised text-fg hover:bg-accent hover:text-accent-fg",
                    !big && (on ? "text-fg" : "text-muted hover:text-fg"),
                  )}
                >
                  {item.label}
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
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <AuthSlot />
            <Link
              to="/search"
              search={{ q: "" }}
              className="flex size-11 items-center justify-center text-muted xl:hidden"
              aria-label="Search"
            >
              <Search className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8", now ? "pb-36 md:pb-28" : "pb-24")}>
        {children}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-24 text-xs text-faint md:px-6 md:pb-10">
        <p className="flex items-center gap-2">
          <img src="/art/brand/logo.png" alt="" className="size-5 rounded-full object-cover" />
          Filth Factory Music trading as Filthfactory · sole trader · UK · 18+
        </p>
        <p className="mt-1">Resident £5 / month. Gifts not on sale yet. legal@filthfactory.co.uk</p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link to="/shop" className="hover:text-fg">
            Shop
          </Link>
          <Link to="/software" className="hover:text-fg">
            DJ software
          </Link>
          <Link to="/school" className="hover:text-fg">
            School
          </Link>
          <Link to="/wow" className="hover:text-fg">
            Who's On What
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
        </nav>
      </footer>

      <PlayerBar />

      {!legal ? <AgeGate /> : null}
      {!legal ? <CookieNotice /> : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden">
        <div className="grid grid-cols-8">
          <MobileLink to="/" label="Home" icon={Compass} active={pathname === "/"} />
          <MobileLink
            to="/releases"
            label="NEW RELEASES"
            icon={Disc3}
            active={pathname.startsWith("/releases") || pathname.startsWith("/charts") || pathname.startsWith("/genre")}
            big
          />
          <MobileLink
            to="/shop"
            label="SHOP"
            icon={ShoppingBag}
            active={pathname.startsWith("/shop") || pathname.startsWith("/merch")}
            big
          />
          <MobileLink to="/software" label="SOFT" icon={Cpu} active={pathname.startsWith("/software")} />
          <MobileLink to="/school" label="School" icon={BookOpen} active={pathname.startsWith("/school")} />
          <MobileLink to="/live" label="On air" icon={Radio} active={pathname.startsWith("/live")} />
          <MobileLink to="/wow" label="WOW" icon={Sparkles} active={pathname.startsWith("/wow")} />
          <MobileLink to="/booth" label="Go live" icon={Mic} active={pathname.startsWith("/booth")} />
        </div>
      </nav>
    </div>
  );
}

function MobileLink({
  to,
  label,
  icon: Icon,
  active,
  big,
}: {
  to: "/" | "/live" | "/booth" | "/library" | "/wow" | "/releases" | "/shop" | "/software" | "/school";
  label: string;
  icon: LucideIcon;
  active: boolean;
  big?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-0.5 px-0.5 text-center font-display text-[10px] font-semibold uppercase leading-tight tracking-wide",
        big && "bg-accent/15 font-display font-semibold uppercase tracking-wide",
        active && big && "bg-accent text-accent-fg",
        active && !big && "text-fg",
        !active && !big && "text-muted",
        !active && big && "text-fg",
      )}
    >
      <Icon className="size-5" />
      {big && label === "NEW RELEASES" ? (
        <span className="leading-[1.05]">
          NEW
          <br />
          RELEASES
        </span>
      ) : (
        label
      )}
    </Link>
  );
}
