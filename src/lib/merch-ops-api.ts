import { createServerFn } from "@tanstack/react-start";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gatherOps, opsSummary, type OpsStatus } from "@/lib/merch-ops";

const FILE = path.join(process.cwd(), "data", "merch-ops.json");

type Store = { status: Record<string, OpsStatus>; updated: string };

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
  } catch {
    return { status: {}, updated: new Date().toISOString() };
  }
}

async function save(store: Store) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2));
}

export const loadOps = createServerFn({ method: "GET" }).handler(async () => {
  const store = await load();
  const lines = gatherOps(store.status);
  return { lines, summary: opsSummary(lines), updated: store.updated };
});

export const setOpsStatus = createServerFn({ method: "POST" })
  .validator((d: { sku: string; status: OpsStatus }) => d)
  .handler(async ({ data }) => {
    const store = await load();
    store.status[data.sku] = data.status;
    store.updated = new Date().toISOString();
    await save(store);
    const lines = gatherOps(store.status);
    return { lines, summary: opsSummary(lines), updated: store.updated };
  });
