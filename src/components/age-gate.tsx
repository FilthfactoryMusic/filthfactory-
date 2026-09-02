import { useEffect, useState } from "react";
import { MIN_AGE } from "@/lib/legal";

const KEY = "ff-age-18";
let memoryOk = false;

function readCookie() {
  try {
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${KEY}=1`));
  } catch {
    return false;
  }
}

export function readAgeOk() {
  if (memoryOk) return true;
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(KEY) === "1") return true;
  } catch {
    /* preview may block storage */
  }
  try {
    if (sessionStorage.getItem(KEY) === "1") return true;
  } catch {
    /* ignore */
  }
  return readCookie();
}

function persistAge() {
  memoryOk = true;
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${KEY}=1; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function AgeGate() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (readAgeOk()) {
      memoryOk = true;
      setAllowed(true);
    }
  }, []);

  if (allowed) return null;

  function confirm() {
    persistAge();
    window.dispatchEvent(new Event("ff-age"));
    setAllowed(true);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-start justify-center bg-bg px-4 pt-16 md:pt-24"
      style={{ pointerEvents: "auto" }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement | null)?.closest("a")) return;
        confirm();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center">
        <img src="/art/brand/logo.png" alt="Filthfactory" className="mx-auto size-28" />
        <h1 className="mt-5 font-display text-3xl font-semibold uppercase tracking-wide">{MIN_AGE}+ only</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This room is for people aged {MIN_AGE} or over in the UK. Lives, chat, membership and gifts stay behind this
          door. Tap anywhere to come in.
        </p>
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            confirm();
          }}
          onClick={(e) => {
            e.stopPropagation();
            confirm();
          }}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg"
        >
          I'm {MIN_AGE} or over — let me in
        </button>
        <p className="mt-4 text-xs text-faint" onPointerDown={(e) => e.stopPropagation()}>
          Under {MIN_AGE}? Close the tab.{" "}
          <a href="/privacy" className="underline underline-offset-2">
            Privacy
          </a>
          {" · "}
          <a href="/terms" className="underline underline-offset-2">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}
