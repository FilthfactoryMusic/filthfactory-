import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  boothPublishAllowed,
  clientTransportPlan,
  liveKitConfigured,
  liveKitHostGrant,
  liveKitRoomName,
  liveKitViewerGrant,
  liveTransportInfo,
  resolveLiveTransport,
} from "./live-transport.ts";

const KEYS = {
  LIVEKIT_URL: "wss://x.livekit.cloud",
  LIVEKIT_API_KEY: "k",
  LIVEKIT_API_SECRET: "s",
} as const;

/** Plain JSON env — no process.env prototype, no TS object-literal surprises in CI. */
function box(overrides: Record<string, string | undefined> = {}) {
  return JSON.parse(
    JSON.stringify({
      LIVE_TRANSPORT: "",
      LIVEKIT_URL: "",
      LIVEKIT_API_KEY: "",
      LIVEKIT_API_SECRET: "",
      APP_URL: "",
      VERCEL_ENV: "",
      VERCEL_URL: "",
      VERCEL_PROJECT_PRODUCTION_URL: "",
      ...overrides,
    }),
  ) as Record<string, string | undefined>;
}

function exportBlock(src: string, name: string) {
  const start = src.indexOf(`export const ${name}`);
  assert.ok(start >= 0, `missing export ${name}`);
  const rest = src.slice(start + 1);
  const nextConst = rest.search(/\nexport const /);
  const nextFn = rest.search(/\nexport function /);
  const cuts = [nextConst, nextFn].filter((n) => n >= 0);
  const end = cuts.length ? start + 1 + Math.min(...cuts) : src.length;
  return src.slice(start, end);
}

function serverFnChain(block: string) {
  const i = block.indexOf("createServerFn");
  const h = block.indexOf(".handler(");
  assert.ok(i >= 0 && h > i, "expected createServerFn(...).handler");
  return block.slice(i, h);
}

describe("liveKitRoomName", () => {
  it("prefixes liveId", () => {
    assert.equal(liveKitRoomName("live-abc-1"), "live_live-abc-1");
  });
  it("rejects junk", () => {
    assert.throws(() => liveKitRoomName("live/../x"), /INVALID_LIVE_ID/);
  });
});

describe("resolveLiveTransport", () => {
  it("LIVE_TRANSPORT=mesh wins even when Cloud keys exist", () => {
    assert.equal(resolveLiveTransport(box({ LIVE_TRANSPORT: "mesh", VERCEL_ENV: "preview" })), "mesh");
    assert.equal(resolveLiveTransport(box({ LIVE_TRANSPORT: "mesh", ...KEYS })), "mesh");
  });
  it("production unset without keys stays mesh", () => {
    assert.equal(resolveLiveTransport(box({ VERCEL_ENV: "production" })), "mesh");
    assert.equal(
      resolveLiveTransport(box({ VERCEL_ENV: "production", APP_URL: "https://www.filthfactory.co.uk" })),
      "mesh",
    );
    assert.equal(
      resolveLiveTransport(box({ VERCEL_ENV: "production", APP_URL: "https://filthfactory.vercel.app" })),
      "mesh",
    );
  });
  it("configured LiveKit selects livekit, including production/www", () => {
    assert.equal(resolveLiveTransport(box({ ...KEYS })), "livekit");
    assert.equal(
      resolveLiveTransport(box({ VERCEL_ENV: "production", APP_URL: "https://www.filthfactory.co.uk", ...KEYS })),
      "livekit",
    );
    assert.equal(resolveLiveTransport(box({ VERCEL_ENV: "preview", ...KEYS })), "livekit");
    assert.equal(resolveLiveTransport(box({ LIVE_TRANSPORT: "livekit", ...KEYS })), "livekit");
  });
  it("never returns livekit without keys — missing keys stay mesh", () => {
    assert.equal(resolveLiveTransport(box()), "mesh");
    assert.equal(resolveLiveTransport(box({ VERCEL_ENV: "preview" })), "mesh");
    assert.equal(resolveLiveTransport(box({ LIVE_TRANSPORT: "livekit" })), "mesh");
    assert.equal(
      resolveLiveTransport(
        box({
          VERCEL_ENV: "production",
          APP_URL: "https://www.filthfactory.co.uk",
          LIVE_TRANSPORT: "livekit",
        }),
      ),
      "mesh",
    );
  });
});

describe("clientTransportPlan", () => {
  it("livekit mode never falls back to mesh when unconfigured", () => {
    const info = { mode: "livekit" as const, configured: false };
    assert.deepEqual(clientTransportPlan(info), {
      livekit: false,
      mesh: false,
      error: "LiveKit is not configured on this server.",
    });
    assert.deepEqual(boothPublishAllowed(info), {
      ok: false,
      error: "LiveKit is not configured on this server.",
    });
  });
  it("does not treat configured LiveKit as mesh", () => {
    const info = liveTransportInfo(box({ LIVE_TRANSPORT: "livekit", ...KEYS }));
    assert.equal(info.mode, "livekit");
    assert.deepEqual(clientTransportPlan(info), {
      livekit: true,
      mesh: false,
      error: null,
    });
    assert.deepEqual(boothPublishAllowed(info), { ok: true, error: null });
  });
  it("preview with Cloud keys is livekit, never mesh", () => {
    const plan = clientTransportPlan(liveTransportInfo(box({ VERCEL_ENV: "preview", ...KEYS })));
    assert.deepEqual(plan, { livekit: true, mesh: false, error: null });
    assert.deepEqual(boothPublishAllowed(liveTransportInfo(box({ VERCEL_ENV: "preview", ...KEYS }))), {
      ok: true,
      error: null,
    });
  });
  it("keeps mesh when mode is mesh", () => {
    assert.deepEqual(clientTransportPlan(liveTransportInfo(box({ LIVE_TRANSPORT: "mesh" }))), {
      livekit: false,
      mesh: true,
      error: null,
    });
    assert.deepEqual(boothPublishAllowed(liveTransportInfo(box({ LIVE_TRANSPORT: "mesh" }))), {
      ok: true,
      error: null,
    });
  });
});

describe("liveKit grants", () => {
  it("viewer is open join: subscribe only, no publish", () => {
    assert.deepEqual(liveKitViewerGrant("live_abc"), {
      roomJoin: true,
      room: "live_abc",
      roomCreate: false,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
  });
  it("host can publish; viewer cannot", () => {
    const host = liveKitHostGrant("live_abc");
    const viewer = liveKitViewerGrant("live_abc");
    assert.equal(host.canPublish, true);
    assert.equal(host.canSubscribe, true);
    assert.equal(host.roomCreate, true);
    assert.equal(host.canPublishData, true);
    assert.equal(host.roomJoin, true);
    assert.equal(viewer.canPublish, false);
    assert.equal(viewer.canSubscribe, true);
    assert.equal(viewer.roomCreate, false);
    assert.equal(viewer.canPublishData, false);
  });
});

describe("liveKitConfigured", () => {
  it("is false when any value is empty", () => {
    assert.equal(liveKitConfigured({ LIVEKIT_URL: "wss://x.livekit.cloud" }), false);
    assert.equal(
      liveKitConfigured({
        LIVEKIT_URL: "wss://x.livekit.cloud",
        LIVEKIT_API_KEY: "k",
        LIVEKIT_API_SECRET: "",
      }),
      false,
    );
  });
  it("is true when url, key and secret are set", () => {
    assert.equal(liveKitConfigured({ ...KEYS }), true);
  });
});

describe("anonymous viewer mint stays public", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "livekit-api.ts"), "utf8");

  it("exports LIVEKIT_VIEWER_MINT_REQUIRES_AUTH = false", () => {
    assert.match(src, /export const LIVEKIT_VIEWER_MINT_REQUIRES_AUTH = false as const/);
  });

  it("mintLiveKitViewerToken has no authMiddleware", () => {
    const chain = serverFnChain(exportBlock(src, "mintLiveKitViewerToken"));
    assert.doesNotMatch(chain, /authMiddleware/);
    assert.doesNotMatch(chain, /\.middleware\s*\(/);
    assert.match(exportBlock(src, "mintLiveKitViewerToken"), /liveKitViewerGrant/);
  });

  it("mintLiveKitHostToken stays behind authMiddleware", () => {
    const chain = serverFnChain(exportBlock(src, "mintLiveKitHostToken"));
    assert.match(chain, /authMiddleware/);
    assert.match(exportBlock(src, "mintLiveKitHostToken"), /liveKitHostGrant/);
  });
});
