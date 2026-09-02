const KEY = "ff.viewerId";

export function getViewerId() {
  if (typeof sessionStorage === "undefined") return "anon";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function isBoothBroadcast(id: string) {
  return id.startsWith("live-");
}
