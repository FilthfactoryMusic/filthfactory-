import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "ff-cookie-ok";

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        const age = localStorage.getItem("ff-age-18") === "1";
        setShow(age && localStorage.getItem(KEY) !== "1");
      } catch {
        setShow(false);
      }
    }
    sync();
    window.addEventListener("ff-age", sync);
    return () => window.removeEventListener("ff-age", sync);
  }, []);

  if (!show) return null;

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 top-16 z-40 px-3 md:top-[4.5rem]">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          Essential cookies only — sign-in and age. No ads.{" "}
          <a href="/cookies" className="underline underline-offset-2">
            Cookies
          </a>
        </p>
        <Button size="sm" className="shrink-0" onClick={accept}>
          OK
        </Button>
      </div>
    </div>
  );
}
