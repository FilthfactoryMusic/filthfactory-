const KEY = "filthfactory-handle";

export function sanitizeHandle(raw: string) {
  return raw
    .trim()
    .replace(/^@+/, "")
    .replace(/[^\w-]/g, "")
    .slice(0, 20)
    .toUpperCase();
}

function emailLocal(email: string | null | undefined) {
  return (email ?? "").split("@")[0]?.trim().toLowerCase() ?? "";
}

function looksPrivate(name: string, email?: string | null) {
  const n = name.trim();
  if (!n) return true;
  if (n.includes("@")) return true;
  const local = emailLocal(email);
  if (local && n.toLowerCase() === local) return true;
  return false;
}

export function readHandle() {
  if (typeof window === "undefined") return "";
  try {
    return sanitizeHandle(localStorage.getItem(KEY) ?? "");
  } catch {
    return "";
  }
}

export function writeHandle(raw: string) {
  const next = sanitizeHandle(raw);
  if (typeof window !== "undefined") {
    try {
      if (next) localStorage.setItem(KEY, next);
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  return next;
}

/** On-air name. Never an email. Owner seeds FILTHFACTORY. */
export function publicHandle(user?: { displayName?: string | null; primaryEmail?: string | null } | null) {
  const stored = readHandle();
  if (stored) return stored;
  const name = user?.displayName?.trim() ?? "";
  if (name && !looksPrivate(name, user?.primaryEmail)) return sanitizeHandle(name);
  const email = (user?.primaryEmail ?? "").toLowerCase();
  if (email.startsWith("rosslewis") || email.includes("filthfactory")) return "FILTHFACTORY";
  return "RESIDENT";
}
