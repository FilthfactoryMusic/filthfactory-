import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { liveKitConfigured, liveKitRoomName, resolveLiveTransport } from "./live-transport.ts";

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
  it("defaults preview/staging to livekit", () => {
    assert.equal(resolveLiveTransport({ VERCEL_ENV: "preview" }), "livekit");
    assert.equal(
      resolveLiveTransport({ APP_URL: "https://staging.example.com", VERCEL_ENV: "production" }),
      "livekit",
    );
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
  it("defaults local/preview sandboxes to livekit", () => {
    assert.equal(resolveLiveTransport({}), "livekit");
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
