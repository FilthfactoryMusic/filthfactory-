/**
 * Post-build: PGLite wasm/data for local preview, and a Nitro/Rolldown
 * circular-chunk patch when ssr.mjs / ssr2.mjs split.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const func = join(root, ".vercel/output/functions/__server.func");
const libs = join(func, "_libs");
const ssrDir = join(func, "_ssr");
const pgliteDist = join(root, "node_modules/@electric-sql/pglite/dist");

const EXPORT_ALL = `var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
`;

function copyPglite() {
  if (!existsSync(libs) || !existsSync(pgliteDist)) return;
  for (const name of readdirSync(pgliteDist)) {
    if (name.endsWith(".wasm") || name.endsWith(".data")) {
      copyFileSync(join(pgliteDist, name), join(libs, name));
    }
  }
}

function patchSsrCycle() {
  if (!existsSync(ssrDir)) return;
  const ssr2 = join(ssrDir, "ssr2.mjs");
  if (existsSync(ssr2)) {
    let src = readFileSync(ssr2, "utf8");
    const next = src
      .replace(/import \{ c as __exportAll\$1 \} from "\.\/ssr\.mjs";\n/, "")
      .replace(/__exportAll\$1/g, "__exportAll");
    if (next !== src && !next.includes("var __exportAll")) {
      src = `${EXPORT_ALL}${next}`;
      writeFileSync(ssr2, src);
      console.log("[fix-vercel] broke ssr2 -> ssr cycle");
    } else if (next !== src) {
      writeFileSync(ssr2, next);
      console.log("[fix-vercel] rewrote ssr2 exportAll");
    }
  }

  for (const name of readdirSync(ssrDir)) {
    if (!/^ssr[^2].*\.mjs$/.test(name) && name !== "ssr.mjs") continue;
    const path = join(ssrDir, name);
    const src = readFileSync(path, "utf8");
    if (!src.includes("ssr_exports as s")) continue;
    if (/\bssr_exports\s*=/.test(src)) continue;
    writeFileSync(path, src.replace("ssr_exports as s", "server_default as s"));
    console.log("[fix-vercel] patched", name, "ssr_exports");
  }
}

copyPglite();
patchSsrCycle();
