import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user } = useCurrentUserState();
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/account"
          className="hidden font-display text-sm font-semibold uppercase tracking-wide text-muted hover:text-fg sm:inline"
        >
          Account
        </Link>
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      search={{ redirect: "/booth" }}
      className="flex h-9 items-center rounded-sm border border-border bg-raised px-3 font-display text-sm font-semibold uppercase tracking-wide text-fg"
    >
      Sign in
    </Link>
  );
}
