import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Section({
  title,
  to,
  children,
}: {
  title: string;
  to?: "/live" | "/charts" | "/library" | "/booth" | "/wow" | "/releases";
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{title}</h2>
        {to ? (
          <Link to={to} className="text-sm text-muted hover:text-fg">
            See all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function MixGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
