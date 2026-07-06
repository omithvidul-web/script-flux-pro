// Prerender selected routes from the built TanStack Start server into
// dist/client so Capacitor (Android/iOS wrapper) can load them as static
// HTML. Without this, `dist/client/index.html` doesn't exist and
// `npx cap sync` fails with "Could not find the web assets directory".
import { pathToFileURL } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const serverUrl = pathToFileURL(path.resolve("dist/server/index.mjs")).href;
const mod = await import(serverUrl);
const handler = mod.default || mod;

// Stub Cloudflare bindings so the worker handler runs under plain Node.
const env = { ASSETS: { fetch: () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

const routes = ["/", "/about", "/contact", "/privacy", "/terms"];
for (const r of routes) {
  const res = await handler.fetch(new Request("http://localhost" + r), env, ctx);
  const html = await res.text();
  const outPath = r === "/" ? "dist/client/index.html" : `dist/client${r}.html`;
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log("prerender:", outPath, res.status);
}
