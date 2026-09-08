import { useState } from "react";
import { toast } from "sonner";
import { renderFlyer } from "@/components/steal-flyer";

type Props = {
  title: string;
  artwork: string;
  live?: boolean;
};

const TARGETS = [
  {
    id: "wa",
    label: "WhatsApp",
    mark: "Wa",
    href: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "x",
    label: "X",
    mark: "X",
    href: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "fb",
    label: "Facebook",
    mark: "f",
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "tg",
    label: "Telegram",
    mark: "Tg",
    href: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
] as const;

export function RepresentShare(props: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function pageUrl() {
    return typeof window === "undefined" ? "https://www.filthfactory.co.uk" : window.location.href;
  }

  function text() {
    return `${props.title} — live on Filthfactory`;
  }

  async function nativeShare() {
    setBusy(true);
    try {
      const url = pageUrl();
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: "Filthfactory", text: text(), url });
        toast("Shared");
        return;
      }
      await navigator.clipboard.writeText(`${text()} ${url}`);
      toast("Link copied");
    } catch {
      /* user cancelled */
    } finally {
      setBusy(false);
    }
  }

  async function saveFlyer() {
    setBusy(true);
    try {
      const canvas = await renderFlyer({
        title: props.title,
        artwork: props.artwork,
        live: props.live,
        kicker: "FILTHFACTORY",
        sub: "If it's filthy it bangs",
        href: pageUrl(),
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.92);
      });
      const file = new File([blob], "filthfactory-live.jpg", { type: "image/jpeg" });
      const nav = navigator as Navigator & {
        share?: (data: ShareData & { files?: File[] }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Filthfactory", text: text(), url: pageUrl() });
        toast("Ready to post");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "filthfactory-live.jpg";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Flyer saved");
    } catch {
      toast("Could not build flyer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 min-w-28 flex-col items-center justify-center rounded-md border border-border px-4 leading-none"
      >
        <span className="font-display text-sm font-semibold uppercase tracking-wide">Represent</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest text-muted">Share</span>
      </button>
      {open ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {TARGETS.map((t) => (
            <a
              key={t.id}
              href={t.href(pageUrl(), text())}
              target="_blank"
              rel="noreferrer"
              className="grid size-11 place-items-center rounded-full border border-border bg-raised font-display text-sm font-semibold"
              aria-label={`Share to ${t.label}`}
              title={t.label}
            >
              {t.mark}
            </a>
          ))}
          <button
            type="button"
            onClick={() => void nativeShare()}
            disabled={busy}
            className="grid size-11 place-items-center rounded-full border border-border bg-raised text-[10px] uppercase tracking-widest"
            aria-label="Instagram, TikTok and more"
            title="Instagram / TikTok / more"
          >
            IG
          </button>
          <button
            type="button"
            onClick={() => void saveFlyer()}
            disabled={busy}
            className="h-11 rounded-md border border-border px-3 text-xs uppercase tracking-widest text-muted"
          >
            {busy ? "…" : "Flyer"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
