#!/usr/bin/env node
/**
 * HTTP smoke for the LiveKit booth — no login, no SSO, no secrets.
 *
 *   npm run smoke:live
 *   SMOKE_BASE_URL=https://<preview>.vercel.app npm run smoke:live
 *
 * Default target is Production alias https://filthfactory.vercel.app
 * (www.filthfactory.co.uk is the public site; override for a Vercel Preview).
 *
 * Network / SSO blocked → exit 0 with skip (CI-safe without secrets).
 * Honesty failure (Go live sold without open-join copy) → exit 1.
 */
import { isMainModule } from "./with-app-env.mjs";

export const DEFAULT_SMOKE_BASE_URL = "https://filthfactory.vercel.app";

export const LIVEKIT_MISSING_MSG = "LiveKit is not configured on this server.";
export const COMING_SOON = "Coming soon";
export const OPEN_JOIN_HINT = "Anyone who joins";

const FORBIDDEN_MATES = [/mates-hear-you/i, /mates hear you/i, /your mates can hear/i];
const FORBIDDEN_FAKE = [/fake listeners/i];

const SKIP_NETWORK = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ECONNRESET|ENETUNREACH|UND_ERR|fetch failed|network/i;
const SKIP_SSO = /authentication required|vercel.*login|sso protection|deployment protection/i;

export function smokeBaseUrl(env = process.env) {
  const raw = String(env.SMOKE_BASE_URL || "").trim();
  return (raw || DEFAULT_SMOKE_BASE_URL).replace(/\/+$/, "");
}

export function visibleText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function ctaCount(html, label) {
  const re = new RegExp(`<(?:a|button)\\b[^>]*>\\s*${label}\\s*</(?:a|button)>`, "gi");
  return (String(html || "").match(re) || []).length;
}

export function skipReason({ error, status, body } = {}) {
  if (error) {
    const blob = `${error.code || ""} ${error.cause?.code || ""} ${error.message || ""}`;
    if (SKIP_NETWORK.test(blob)) {
      return `network blocked (${error.code || error.cause?.code || error.message})`;
    }
  }
  if (status === 401 || status === 403 || status === 407) {
    return `preview HTTP blocked (${status}); skip — no SSO dig`;
  }
  const text = `${body || ""}`;
  if (SKIP_SSO.test(text)) return "preview SSO/protection page; skip — no console login";
  return null;
}

export function assertNoForbiddenCopy(html, page) {
  const text = visibleText(html);
  for (const re of FORBIDDEN_MATES) {
    if (re.test(text) || re.test(html)) {
      throw new Error(`${page}: forbidden mates-hear copy (${re})`);
    }
  }
  for (const re of FORBIDDEN_FAKE) {
    if (re.test(text)) {
      throw new Error(`${page}: forbidden fake-listener copy`);
    }
  }
}

/**
 * Home: Coming soon CTA when LiveKit is not open.
 * Selling "Go live" is allowed only with open-join honesty.
 * Transport error string in HTML is fail-closed OK.
 */
export function assertHomeHtml(html) {
  assertNoForbiddenCopy(html, "GET /");
  const text = visibleText(html);
  const comingSoonCtas = ctaCount(html, COMING_SOON);
  const goLiveCtas = ctaCount(html, "Go live");
  const openJoin = new RegExp(OPEN_JOIN_HINT, "i").test(text);
  const comingSoon = new RegExp(COMING_SOON, "i").test(text);
  const failClosed = text.includes(LIVEKIT_MISSING_MSG);

  if (goLiveCtas > 0 && !openJoin) {
    throw new Error('GET /: "Go live" CTA sells without open-join honesty');
  }
  if (!openJoin) {
    if (!comingSoon && comingSoonCtas === 0 && !failClosed) {
      throw new Error("GET /: LiveKit not open — expected Coming soon CTA (or fail-closed transport error)");
    }
  }
  return {
    comingSoon: comingSoon || comingSoonCtas > 0,
    goLiveCtas,
    openJoin,
    failClosed,
  };
}

export function assertLiveOk(status, html) {
  if (status !== 200) throw new Error(`GET /live: expected 200, got ${status}`);
  if (!String(html || "").trim()) throw new Error("GET /live: empty body");
  assertNoForbiddenCopy(html, "GET /live");
}

export function assertBoothGate(status, html) {
  if (status !== 200) throw new Error(`GET /booth: expected 200, got ${status}`);
  const text = visibleText(html);
  assertNoForbiddenCopy(html, "GET /booth");
  const gated =
    /sign in/i.test(text) ||
    /opening the booth/i.test(text) ||
    /membership required/i.test(text);
  if (!gated) {
    throw new Error("GET /booth: expected gate/sign-in (did not complete auth)");
  }
  const goLiveCtas = ctaCount(html, "Go live");
  const openJoin = new RegExp(OPEN_JOIN_HINT, "i").test(text);
  if (goLiveCtas > 0 && !openJoin && !/sign in to go live/i.test(text) && !/go live in one tap/i.test(text)) {
    throw new Error('GET /booth: "Go live" sells without open-join honesty');
  }
}

export async function fetchPage(base, path, fetchImpl = fetch, timeoutMs = 20000) {
  const url = `${base}${path}`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    const body = await res.text();
    return { status: res.status, body, url: res.url || url };
  } finally {
    clearTimeout(t);
  }
}

export async function runSmoke({
  baseUrl = smokeBaseUrl(),
  fetchImpl = fetch,
  log = console,
} = {}) {
  const pages = [
    { path: "/", check: (s, b) => {
      if (s !== 200) throw new Error(`GET /: expected 200, got ${s}`);
      assertHomeHtml(b);
    }},
    { path: "/live", check: assertLiveOk },
    { path: "/booth", check: assertBoothGate },
  ];

  const results = [];
  for (const page of pages) {
    let status;
    let body;
    try {
      const got = await fetchPage(baseUrl, page.path, fetchImpl);
      status = got.status;
      body = got.body;
    } catch (error) {
      const skip = skipReason({ error });
      if (skip) {
        log.log(`[smoke:live] skip ${page.path}: ${skip}`);
        return { ok: true, skipped: true, reason: skip, baseUrl };
      }
      throw error;
    }
    const skip = skipReason({ status, body });
    if (skip) {
      log.log(`[smoke:live] skip ${page.path}: ${skip}`);
      return { ok: true, skipped: true, reason: skip, baseUrl };
    }
    page.check(status, body);
    results.push({ path: page.path, status });
    log.log(`[smoke:live] ${page.path} ${status} ok`);
  }
  return { ok: true, skipped: false, baseUrl, results };
}

async function main() {
  const baseUrl = smokeBaseUrl();
  console.log(`[smoke:live] target ${baseUrl}`);
  console.log("[smoke:live] no secrets; skip on network/SSO; fail on dishonest Go live");
  try {
    const result = await runSmoke({ baseUrl });
    if (result.skipped) {
      console.log(`[smoke:live] skipped: ${result.reason}`);
      process.exit(0);
    }
    console.log("[smoke:live] pass");
    process.exit(0);
  } catch (err) {
    console.error(`[smoke:live] FAIL: ${err.message || err}`);
    process.exit(1);
  }
}

if (isMainModule(import.meta.url)) {
  await main();
}
