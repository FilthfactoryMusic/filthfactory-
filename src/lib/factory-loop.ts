/** 24/7 station loop. Audio/mp4 on Dropbox or Mixcloud — not YouTube embeds. */

export type LoopKind = "youtube" | "mixcloud" | "audio" | "clip" | null;

export type LoopPlay = {
  kind: LoopKind;
  src: string;
  watch: string;
};

export const DEFAULT_LOOP_URL =
  "https://www.dropbox.com/scl/fi/100cqtu4y5ion9054avtf/db955bec9fb63c9bf19fe0da88a268ba.mp4?rlkey=7op7y1q57hfuucchysh42k2ek&dl=1";

export const DEFAULT_LOOP_TITLE = "Filthfactory 24/7";

function withDropboxDl(href: string) {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "dropbox.com" || host.endsWith(".dropbox.com")) {
      u.searchParams.set("dl", "1");
      u.searchParams.delete("st");
    }
    return u.toString();
  } catch {
    return href;
  }
}

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
  const src = withDropboxDl(u.href);

  if (/\.(mp3|m4a|aac|ogg|wav|flac)(\?|$)/i.test(path)) {
    return { kind: "audio", src, watch: src };
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(path)) {
    return { kind: "clip", src, watch: src };
  }
  if (host === "dropbox.com" || host.endsWith(".dropbox.com") || host.endsWith("dropboxusercontent.com")) {
    return { kind: "clip", src, watch: src };
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
      src: `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=0&autoplay=0&feed=${encodeURIComponent(p + "/")}`,
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
