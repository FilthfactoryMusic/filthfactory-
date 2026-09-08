import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasPlayableLiveMedia, hasTuneInAudio } from "./live-media.ts";
import type { LiveShow } from "./types.ts";

function show(partial: Partial<LiveShow>): LiveShow {
  return {
    id: "feed-x",
    djId: "x",
    title: "X",
    venue: "X",
    city: "London",
    citySlug: "london",
    artwork: "/art/x.jpg",
    genres: ["House"],
    engine: "house",
    bpm: 128,
    listeners: 1,
    durationMin: 60,
    description: "",
    tracklist: [],
    status: "live",
    seed: 1,
    ...partial,
  };
}

describe("hasPlayableLiveMedia", () => {
  it("accepts a real stream URL", () => {
    assert.equal(hasPlayableLiveMedia(show({ streamUrl: "https://example.com/radio.mp3" })), true);
  });
  it("accepts a restream/player embed", () => {
    assert.equal(
      hasPlayableLiveMedia(show({ embedUrl: "https://player.restream.io/?token=abc" })),
      true,
    );
  });
  it("rejects YouTube live_stream channel embeds", () => {
    assert.equal(
      hasPlayableLiveMedia(
        show({
          id: "feed-code-red",
          embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCQRp7g7irivIUb4HdiU1KiQ",
          watchUrl: "https://www.youtube.com/channel/UCQRp7g7irivIUb4HdiU1KiQ/live",
        }),
      ),
      false,
    );
  });
  it("rejects poster-only stations", () => {
    assert.equal(
      hasPlayableLiveMedia(show({ watchUrl: "https://lifefmtv.squarespace.com/" })),
      false,
    );
  });
  it("treats booth ids as playable while live", () => {
    assert.equal(hasPlayableLiveMedia(show({ id: "live-abc-1", status: "live" })), true);
    assert.equal(hasPlayableLiveMedia(show({ id: "live-abc-1", status: "upcoming" })), false);
  });
});

describe("hasTuneInAudio", () => {
  it("is true only for stream or booth", () => {
    assert.equal(hasTuneInAudio(show({ streamUrl: "https://x/s" })), true);
    assert.equal(hasTuneInAudio(show({ embedUrl: "https://player.restream.io/?token=abc" })), false);
    assert.equal(hasTuneInAudio(show({ id: "live-z-1" })), true);
  });
});
