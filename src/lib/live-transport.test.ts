import { describe, it } from "node:test";
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

describe("liveKitRoomName", () => {
  it("prefixes liveId", () => {
    assert.equal(liveKitRoomName("live-abc-1"), "live_live-abc-1");
  });
  it("rejects junk", () => {
    assert.throws(() => liveKitRoomName("live/../x"), /INVALID_LIVE_ID/);
  });
});

describe("resolveLiveTransport", () => {
  it("honors LIVE_TRANSPORT=livekit", () => {
    assert.equal(resolveLiveTransport({ LIVE_TRANSPORT: "livekit" }), "livekit");
  });
  it("honors LIVE_TRANSPORT=mesh", () => {
    assert.equal(
      resolveLiveTransport({
        LIVE_TRANSPORT: "mesh",
        VERCEL_ENV: "preview",
      }),
      "mesh",
    );
  });
  it("defaults preview to livekit and fail-closes without keys", () => {
    assert.equal(resolveLiveTransport({ VERCEL_ENV: "preview" }), "livekit");
    const plan = clientTransportPlan(liveTransportInfo({ VERCEL_ENV: "preview" }));
    assert.equal(plan.livekit, false);
    assert.equal(plan.mesh, false);
    assert.equal(plan.error, "LiveKit is not configured on this server.");
  });
  it("uses LiveKit on preview when Cloud keys exist — never mesh", () => {
    const env = {
      VERCEL_ENV: "preview",
      LIVEKIT_URL: "wss://x.livekit.cloud",
      LIVEKIT_API_KEY: "k",
      LIVEKIT_API_SECRET: "s",
    };
    assert.equal(resolveLiveTransport(env), "livekit");
    assert.deepEqual(clientTransportPlan(liveTransportInfo(env)), {
      livekit: true,
      mesh: false,
      error: null,
    });
  });
  it("keeps www production on mesh when unset", () => {
    assert.equal(
      resolveLiveTransport({
        VERCEL_ENV: "production",
        APP_URL: "https://www.filthfactory.co.uk",
      }),
      "mesh",
    );
  });
  it("keeps any production deploy on mesh when LIVE_TRANSPORT is unset", () => {
    assert.equal(resolveLiveTransport({ VERCEL_ENV: "production" }), "mesh");
    assert.equal(
      resolveLiveTransport({
        VERCEL_ENV: "production",
        APP_URL: "https://filthfactory.vercel.app",
      }),
      "mesh",
    );
  });
  it("does not default production to livekit — only an explicit flag flips it", () => {
    assert.equal(
      resolveLiveTransport({
        VERCEL_ENV: "production",
        APP_URL: "https://www.filthfactory.co.uk",
        LIVE_TRANSPORT: "livekit",
      }),
      "livekit",
    );
  });
  it("keeps www on mesh even when LiveKit Cloud keys are present", () => {
    const env = {
      VERCEL_ENV: "production",
      APP_URL: "https://www.filthfactory.co.uk",
      LIVEKIT_URL: "wss://x.livekit.cloud",
      LIVEKIT_API_KEY: "k",
      LIVEKIT_API_SECRET: "s",
    };
    assert.equal(resolveLiveTransport(env), "mesh");
    assert.deepEqual(clientTransportPlan(liveTransportInfo(env)), {
      livekit: false,
      mesh: true,
      error: null,
    });
    assert.equal(
      resolveLiveTransport({
        VERCEL_ENV: "production",
        APP_URL: "https://filthfactory.co.uk",
        LIVEKIT_URL: "wss://x.livekit.cloud",
        LIVEKIT_API_KEY: "k",
        LIVEKIT_API_SECRET: "s",
      }),
      "mesh",
    );
  });
  it("defaults local/preview sandboxes to livekit", () => {
    assert.equal(resolveLiveTransport({}), "livekit");
  });
});

describe("clientTransportPlan", () => {
  it("fails closed when LiveKit is on and keys are missing", () => {
    const info = liveTransportInfo({ LIVE_TRANSPORT: "livekit" });
    assert.equal(info.mode, "livekit");
    assert.equal(info.configured, false);
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
    const info = liveTransportInfo({
      LIVE_TRANSPORT: "livekit",
      LIVEKIT_URL: "wss://x.livekit.cloud",
      LIVEKIT_API_KEY: "k",
      LIVEKIT_API_SECRET: "s",
    });
    assert.deepEqual(clientTransportPlan(info), {
      livekit: true,
      mesh: false,
      error: null,
    });
    assert.deepEqual(boothPublishAllowed(info), { ok: true, error: null });
  });
  it("never enables mesh when LiveKit is requested but unconfigured", () => {
    const preview = clientTransportPlan(
      liveTransportInfo({ VERCEL_ENV: "preview" }),
    );
    assert.equal(preview.mesh, false);
    assert.equal(preview.livekit, false);
    assert.equal(preview.error, "LiveKit is not configured on this server.");
  });
  it("keeps mesh only when LIVE_TRANSPORT=mesh", () => {
    assert.deepEqual(clientTransportPlan(liveTransportInfo({ LIVE_TRANSPORT: "mesh" })), {
      livekit: false,
      mesh: true,
      error: null,
    });
    assert.deepEqual(boothPublishAllowed(liveTransportInfo({ LIVE_TRANSPORT: "mesh" })), {
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
    assert.equal(viewer.canPublish, false);
    assert.equal(viewer.canSubscribe, true);
    assert.equal(viewer.roomCreate, false);
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
    assert.equal(
      liveKitConfigured({
        LIVEKIT_URL: "wss://x.livekit.cloud",
        LIVEKIT_API_KEY: "k",
        LIVEKIT_API_SECRET: "s",
      }),
      true,
    );
  });
});
