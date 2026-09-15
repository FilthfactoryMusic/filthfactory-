import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertBoothGate,
  assertHomeHtml,
  assertLiveOk,
  DEFAULT_SMOKE_BASE_URL,
  runSmoke,
  skipReason,
  smokeBaseUrl,
  visibleText,
} from "./livekit-preview-smoke.mjs";

const comingSoonHome = `
<html><body>
  <p>The live booth is coming soon.</p>
  <a class="cta" href="/live">Coming soon</a>
  <p>No blanket PRS. Only go live or drop mixes you have the rights to.</p>
</body></html>`;

const sellingDishonest = `
<html><body>
  <a class="cta" href="/booth">Go live</a>
</body></html>`;

const sellingHonest = `
<html><body>
  <p>Anyone who joins a live session gets the audio and video.</p>
  <a class="cta" href="/booth">Go live</a>
</body></html>`;

const boothGate = `
<html><body>
  <h1>Go live in one tap</h1>
  <p>Sign in with email, camera on, you're on air.</p>
  <a href="/login">Sign in to go live</a>
</body></html>`;

test("default target is the Vercel production alias", () => {
  assert.equal(smokeBaseUrl({}), DEFAULT_SMOKE_BASE_URL);
  assert.equal(smokeBaseUrl({ SMOKE_BASE_URL: "https://preview.example/" }), "https://preview.example");
});

test("home Coming soon CTA passes when LiveKit is not open", () => {
  const r = assertHomeHtml(comingSoonHome);
  assert.equal(r.comingSoon, true);
  assert.equal(r.goLiveCtas, 0);
  assert.equal(r.openJoin, false);
});

test("home Go live without open-join honesty fails", () => {
  assert.throws(() => assertHomeHtml(sellingDishonest), /open-join honesty/);
});

test("home Go live with open-join honesty passes", () => {
  const r = assertHomeHtml(sellingHonest);
  assert.equal(r.openJoin, true);
  assert.equal(r.goLiveCtas, 1);
});

test("fail-closed transport error is OK on home when Coming soon is missing", () => {
  const html = "<html><body>LiveKit is not configured on this server.</body></html>";
  const r = assertHomeHtml(html);
  assert.equal(r.failClosed, true);
});

test("mates-hear-you copy fails", () => {
  assert.throws(
    () => assertHomeHtml("<html><body><a>Coming soon</a><p>mates hear you</p></body></html>"),
    /mates-hear/,
  );
});

test("fake listeners copy fails", () => {
  assert.throws(
    () => assertHomeHtml("<html><body><a>Coming soon</a><p>fake listeners</p></body></html>"),
    /fake-listener/,
  );
});

test("/live requires 200", () => {
  assert.throws(() => assertLiveOk(404, "nope"), /expected 200/);
  assertLiveOk(200, "<html><body>On air</body></html>");
});

test("/booth requires a gate, not a completed auth session", () => {
  assertBoothGate(200, boothGate);
  assert.throws(() => assertBoothGate(200, "<html><body>studio mixer</body></html>"), /gate\/sign-in/);
});

test("skip on network and SSO, not on honesty failures", () => {
  assert.match(skipReason({ error: { code: "ENOTFOUND", message: "getaddrinfo" } }), /network blocked/);
  assert.match(skipReason({ status: 401, body: "" }), /no SSO dig/);
  assert.match(skipReason({ status: 200, body: "Vercel Authentication Required" }), /no console login/);
  assert.equal(skipReason({ status: 200, body: comingSoonHome }), null);
});

test("visibleText strips tags", () => {
  assert.match(visibleText("<p>Coming soon</p>"), /Coming soon/);
  assert.equal(visibleText("<script>evil</script><p>Coming soon</p>").includes("evil"), false);
});

test("runSmoke walks /, /live, /booth", async () => {
  const pages = {
    "https://filthfactory.vercel.app/": { status: 200, body: comingSoonHome },
    "https://filthfactory.vercel.app/live": { status: 200, body: "<html>On air</html>" },
    "https://filthfactory.vercel.app/booth": { status: 200, body: boothGate },
  };
  const fetchImpl = async (url) => ({
    status: pages[url].status,
    text: async () => pages[url].body,
    url,
  });
  const logs = [];
  const result = await runSmoke({
    baseUrl: DEFAULT_SMOKE_BASE_URL,
    fetchImpl,
    log: { log: (m) => logs.push(m) },
  });
  assert.equal(result.ok, true);
  assert.equal(result.skipped, false);
  assert.deepEqual(
    result.results.map((r) => r.path),
    ["/", "/live", "/booth"],
  );
});

test("runSmoke skips when the first fetch cannot resolve", async () => {
  const err = Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" });
  const fetchImpl = async () => {
    throw err;
  };
  const result = await runSmoke({
    baseUrl: DEFAULT_SMOKE_BASE_URL,
    fetchImpl,
    log: { log() {} },
  });
  assert.equal(result.skipped, true);
  assert.match(result.reason, /network blocked/);
});
