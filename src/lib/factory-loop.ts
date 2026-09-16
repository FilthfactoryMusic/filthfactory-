/** 24/7 station loop. Host the 6-hour file on YouTube (unlisted) or Mixcloud — not on Vercel. */

export type LoopKind = "youtube" | "mixcloud" | "audio" | null;

export type LoopPlay = {
  kind: LoopKind;
  src: string;
  watch: string;
};

export function parseLoopUrl(raw: string): LoopPlay | null {
  const text = raw.trim();
  if (!text) return null;
  let u: URL;
  try {
    u = new URL(text);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname.toLowerCase();

  if (/\.(mp3|m4a|aac|ogg|wav|flac)(\?|$)/i.test(path) || /\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(u.search)) {
    return { kind: "audio", src: u.href, watch: u.href };
  }

  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").slice(0, 11);
    if (id.length !== 11) return null;
    return yt(id);
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v") || u.pathname.match(/\/(embed|live|shorts)\/([A-Za-z0-9_-]{11})/)?.[2];
    if (id && id.length === 11) return yt(id);
    return null;
  }
  if (host === "mixcloud.com") {
    const p = u.pathname.replace(/\/$/, "");
    if (p.length < 2) return null;
    return {
      kind: "mixcloud",
      src: `https://www.mixcloud.com/widget/iframe/?hide_cover=1&autoplay=0&feed=${encodeURIComponent(p + "/")}`,
      watch: `https://www.mixcloud.com${p}/`,
    };
  }
  return null;
}

function yt(id: string): LoopPlay {
  return {
    kind: "youtube",
    src: `https://www.youtube.com/embed/${id}?rel=0&loop=1&playlist=${id}&modestbranding=1&playsinline=1`,
    watch: `https://www.youtube.com/watch?v=${id}`,
  };
}
