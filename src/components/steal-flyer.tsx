import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  kicker?: string;
  sub?: string;
  artwork: string;
  live?: boolean;
  href?: string;
};

async function loadImage(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  return img;
}

export async function renderFlyer(props: Props) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  try {
    const art = await loadImage(props.artwork);
    const scale = Math.max(W / art.width, H / art.height);
    const dw = art.width * scale;
    const dh = art.height * scale;
    ctx.drawImage(art, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } catch {
    /* solid fallback */
  }

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(10,10,10,0.55)");
  g.addColorStop(0.45, "rgba(10,10,10,0.12)");
  g.addColorStop(0.72, "rgba(10,10,10,0.55)");
  g.addColorStop(1, "rgba(10,10,10,0.96)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  try {
    const logo = await loadImage("/art/brand/logo-stamp.png");
    const ls = 220;
    ctx.drawImage(logo, (W - ls) / 2, 90, ls, ls);
  } catch {
    /* skip */
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f4f0";
  if (props.live) {
    ctx.fillStyle = "#c4453c";
    ctx.fillRect(W / 2 - 70, 360, 140, 48);
    ctx.fillStyle = "#fff6f4";
    ctx.font = "600 22px 'IBM Plex Sans', sans-serif";
    ctx.fillText("LIVE", W / 2, 392);
  } else if (props.kicker) {
    ctx.fillStyle = "#8a8a86";
    ctx.font = "600 22px 'IBM Plex Sans', sans-serif";
    ctx.fillText(props.kicker.toUpperCase(), W / 2, 390);
  }

  ctx.fillStyle = "#f4f4f0";
  ctx.font = "700 92px Oswald, sans-serif";
  const lines = props.title.toUpperCase().split("\n");
  let y = 1320;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y, 980);
    y += 100;
  }
  if (props.sub) {
    ctx.fillStyle = "#b4b4ae";
    ctx.font = "400 28px 'IBM Plex Sans', sans-serif";
    ctx.fillText(props.sub, W / 2, y + 12, 960);
  }
  ctx.fillStyle = "#5c5c58";
  ctx.font = "500 22px 'IBM Plex Sans', sans-serif";
  ctx.fillText("FILTHFACTORY  ·  18+", W / 2, 1840);

  return canvas;
}

export function StealFlyer(props: Props) {
  const [busy, setBusy] = useState(false);

  async function steal() {
    setBusy(true);
    try {
      const canvas = await renderFlyer(props);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.92);
      });
      const file = new File([blob], "filthfactory-flyer.jpg", { type: "image/jpeg" });
      const nav = navigator as Navigator & {
        share?: (data: ShareData & { files?: File[] }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "Filthfactory",
          text: props.title.replaceAll("\n", " "),
          url: props.href ? new URL(props.href, window.location.origin).toString() : window.location.href,
        });
        toast("Flyer sent");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "filthfactory-flyer.jpg";
      a.click();
      URL.revokeObjectURL(a.href);
      if (props.href) {
        try {
          await navigator.clipboard.writeText(props.href);
        } catch {
          /* ignore */
        }
      }
      toast("Flyer saved — post it");
    } catch {
      toast("Couldn't build the flyer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void steal()} disabled={busy}>
      <Share2 className="size-4" />
      {busy ? "Printing…" : "Steal flyer"}
    </Button>
  );
}
