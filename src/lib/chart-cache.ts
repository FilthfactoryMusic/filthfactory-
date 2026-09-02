import type { Mix } from "./types";

const byId = new Map<string, Mix>();

export function rememberCharts(mixes: Mix[]) {
  mixes.forEach((m) => byId.set(m.id, m));
}

export function getChartMix(id: string) {
  return byId.get(id);
}
