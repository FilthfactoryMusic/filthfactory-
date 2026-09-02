/** Chart week starts Friday 00:00 Europe/London (midnight Thursday). */

const SINCE_FRIDAY: Record<string, number> = {
  Fri: 0,
  Sat: 1,
  Sun: 2,
  Mon: 3,
  Tue: 4,
  Wed: 5,
  Thu: 6,
};

function londonParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

export function chartWeekId(now = new Date()) {
  const p = londonParts(now);
  const back = SINCE_FRIDAY[p.weekday] ?? 0;
  const utc = Date.UTC(p.year, p.month - 1, p.day) - back * 86_400_000;
  const d = new Date(utc);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nextChartFlip(now = new Date()) {
  const id = chartWeekId(now);
  const [y, m, d] = id.split("-").map(Number);
  const next = new Date(Date.UTC(y!, m! - 1, d! + 7));
  const ny = next.getUTCFullYear();
  const nm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(next.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function formatChartWeek(weekId: string) {
  const [y, m, d] = weekId.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!));
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
