import type { LiveShow } from "./types";

function isBoothId(id: string) {
  return id.startsWith("live-");
}

/** YouTube channel `/embed/live_stream` is empty whenever the desk is offline. */
function isDeadEmbed(url: string | undefined) {
  if (!url) return false;
  return /youtube\.com\/embed\/live_stream/i.test(url);
}

/** Real audio or a working video embed — never a live badge on a poster-only tile. */
export function hasPlayableLiveMedia(show: LiveShow | null | undefined): boolean {
  if (!show) return false;
  if (isBoothId(show.id) && show.status === "live") return true;
  if (show.streamUrl?.trim()) return true;
  if (show.embedUrl?.trim() && !isDeadEmbed(show.embedUrl)) return true;
  return false;
}

export function hasTuneInAudio(show: LiveShow | null | undefined): boolean {
  if (!show) return false;
  if (isBoothId(show.id) && show.status === "live") return true;
  return Boolean(show.streamUrl?.trim());
}
