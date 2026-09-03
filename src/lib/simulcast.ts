/** Destinations streamers open in one hit. HTTPS pages only — we do not store RTMP keys. */

export type KnownDesk = {
  id: "mixcloud" | "youtube" | "twitch" | "kick" | "restream";
  name: string;
  goLiveUrl: string;
};

export const KNOWN_DESKS: KnownDesk[] = [
  { id: "mixcloud", name: "Mixcloud", goLiveUrl: "https://www.mixcloud.com/live/" },
  { id: "youtube", name: "YouTube", goLiveUrl: "https://studio.youtube.com/" },
  { id: "twitch", name: "Twitch", goLiveUrl: "https://dashboard.twitch.tv/" },
  { id: "kick", name: "Kick", goLiveUrl: "https://kick.com/" },
  { id: "restream", name: "Restream", goLiveUrl: "https://restream.io/studio" },
];

export type CustomDest = { id: string; label: string; url: string };

export type SimulcastState = {
  desks: Record<string, boolean>;
  custom: CustomDest[];
};

const KEY = "ff-simulcast-v1";

const EMPTY: SimulcastState = {
  desks: { mixcloud: true, youtube: true, twitch: false, kick: false, restream: true },
  custom: [],
};

export function loadSimulcast(): SimulcastState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as SimulcastState;
    return {
      desks: { ...EMPTY.desks, ...(p.desks ?? {}) },
      custom: Array.isArray(p.custom) ? p.custom.filter((d) => typeof d?.url === "string") : [],
    };
  } catch {
    return EMPTY;
  }
}

export function saveSimulcast(state: SimulcastState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function factoryLiveUrl(liveId: string) {
  if (typeof window === "undefined") return `https://www.filthfactory.co.uk/live/${liveId}`;
  return `${window.location.origin}/live/${liveId}`;
}

export function openDesks(state: SimulcastState) {
  const urls: string[] = [];
  for (const d of KNOWN_DESKS) {
    if (state.desks[d.id]) urls.push(d.goLiveUrl);
  }
  for (const c of state.custom) {
    if (isHttpUrl(c.url)) urls.push(c.url.trim());
  }
  for (const url of urls) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return urls.length;
}
