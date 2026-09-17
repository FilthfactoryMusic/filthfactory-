import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseLoopUrl } from "@/lib/factory-loop";

export const getStationLoop = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ url: string; title: string }>`
      select url, title from station_loop where id = 'main'
    `;
    const row = rows[0];
    if (!row?.url) return { url: "", title: "Filthfactory 24/7" };
    return { url: row.url, title: row.title || "Filthfactory 24/7" };
  } catch {
    return { url: "", title: "Filthfactory 24/7" };
  }
});

export const setStationLoop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { url: string; title?: string }) => d)
  .handler(async ({ data }) => {
    const parsed = parseLoopUrl(data.url);
    if (!parsed || parsed.kind === "youtube") throw new Error("LOOP_URL_BAD");
    const title = (data.title ?? "Filthfactory 24/7").trim().slice(0, 80) || "Filthfactory 24/7";
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into station_loop (id, url, title, updated_at)
      values ('main', ${parsed.watch}, ${title}, now())
      on conflict (id) do update set url = excluded.url, title = excluded.title, updated_at = now()
    `;
    return { url: parsed.watch, title };
  });
