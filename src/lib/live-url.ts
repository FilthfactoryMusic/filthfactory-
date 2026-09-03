/** Public watch URLs we can list. No TikTok scrape. No RTMP keys. */

export type LiveSource = "youtube" | "mixcloud" | "twitch" | "kick";

export type ParsedLiveUrl = {
  source: LiveSource;
  watchUrl: string;
  embedUrl: string;
  thumb: string;
  label: string;
};

const ALLOWED: LiveSource[] = ["youtube", "mixcloud", "twitch", "kick"];

export function isAllowedLiveHost(host: string) {
  const h = host.replace(/^www\./, "").toLowerCase();
  return (
    h === "youtube.com" ||
    h === "youtu.be" ||
    h === "m.youtube.com" ||
    h === "mixcloud.com" ||
    h === "twitch.tv" ||
    h === "kick.com"
  );
}

function parentHosts() {
  if (typeof window === "undefined") return ["www.filthfactory.co.uk", "filthfactory.co.uk"];
  const host = window.location.hostname.replace(/^www\./, "");
  return [...new Set([host, `www.${host}`, "www.filthfactory.co.uk", "filthfactory.co.uk"])];
}

export function parseLiveUrl(raw: string, parent?: string): ParsedLiveUrl | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const parents = parentHosts();
  if (parent) parents.unshift(parent);

  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").slice(0, 11);
    if (id.length !== 11) return null;
    return yt(id, u.href);
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v && v.length === 11) return yt(v, `https://www.youtube.com/watch?v=${v}`);
    const live = u.pathname.match(/^\/live\/([A-Za-z0-9_-]{11})/);
    if (live?.[1]) return yt(live[1], `https://www.youtube.com/watch?v=${live[1]}`);
    const embed = u.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/);
    if (embed?.[1]) return yt(embed[1], `https://www.youtube.com/watch?v=${embed[1]}`);
    const chan = u.pathname.match(/^\/(channel\/|@)([^/]+)/);
    if (chan) {
      const watchUrl = `https://www.youtube.com${u.pathname}`;
      return {
        source: "youtube",
        watchUrl,
        embedUrl: watchUrl,
        thumb: "/art/brand/logo.png?v=chrome3",
        label: "YouTube",
      };
    }
    return null;
  }
  if (host === "mixcloud.com") {
    const path = u.pathname.replace(/\/$/, "");
    if (path.length < 2) return null;
    return {
      source: "mixcloud",
      watchUrl: `https://www.mixcloud.com${path}/`,
      embedUrl: `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(path + "/")}`,
      thumb: "/art/brand/logo.png?v=chrome3",
      label: "Mixcloud",
    };
  }
  if (host === "twitch.tv") {
    const channel = u.pathname.split("/").filter(Boolean)[0];
    if (!channel || channel === "videos" || channel === "directory") return null;
    const parentQs = parents.map((p) => `parent=${encodeURIComponent(p)}`).join("&");
    return {
      source: "twitch",
      watchUrl: `https://www.twitch.tv/${channel}`,
      embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parentQs}`,
      thumb: "/art/brand/logo.png?v=chrome3",
      label: "Twitch",
    };
  }
  if (host === "kick.com") {
    const channel = u.pathname.split("/").filter(Boolean)[0];
    if (!channel) return null;
    return {
      source: "kick",
      watchUrl: `https://kick.com/${channel}`,
      embedUrl: `https://player.kick.com/${encodeURIComponent(channel)}`,
      thumb: "/art/brand/logo.png?v=chrome3",
      label: "Kick",
    };
  }
  return null;
}

function yt(id: string, watchUrl: string): ParsedLiveUrl {
  return {
    source: "youtube",
    watchUrl,
    embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    label: "YouTube",
  };
}

export function embedFromWatch(url: string | undefined, parent?: string) {
  if (!url) return null;
  return parseLiveUrl(url, parent)?.embedUrl ?? null;
}

export { ALLOWED };
