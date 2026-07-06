// Prerender selected routes into dist/client so Capacitor (Android/iOS wrapper)
// can load static HTML. Some CI builds may not emit the server bundle at the
// same path, so this script first discovers Nitro's server entry and falls back
// to a SPA shell instead of failing the native build.
import { pathToFileURL } from "node:url";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const routes = ["/", "/about", "/contact", "/privacy", "/terms"];

const distDir = path.resolve("dist");
const clientDir = path.join(distDir, "client");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findServerEntry() {
  const candidates = [];
  const nitroConfigPath = path.join(distDir, "nitro.json");

  if (await exists(nitroConfigPath)) {
    try {
      const nitroConfig = JSON.parse(await readFile(nitroConfigPath, "utf8"));
      if (typeof nitroConfig.serverEntry === "string") {
        candidates.push(path.join(distDir, nitroConfig.serverEntry));
      }
    } catch (error) {
      console.warn("prerender: could not parse dist/nitro.json", error);
    }
  }

  candidates.push(
    path.join(distDir, "server", "index.mjs"),
    path.join(distDir, "server", "index.js"),
    path.join(distDir, "server.mjs"),
    path.resolve(".output/server/index.mjs"),
    path.resolve(".output/server/index.js"),
  );

  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }

  return undefined;
}

async function loadServerHandler() {
  const serverEntry = await findServerEntry();
  if (!serverEntry) return undefined;

  try {
    const mod = await import(pathToFileURL(serverEntry).href);
    const handler = mod.default || mod;
    if (typeof handler?.fetch !== "function") {
      throw new Error(`No fetch handler exported by ${serverEntry}`);
    }
    return handler;
  } catch (error) {
    console.warn(`prerender: could not load server bundle at ${serverEntry}`);
    console.warn(error);
    return undefined;
  }
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json") || filePath.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  if (filePath.endsWith(".woff")) return "font/woff";
  return "application/octet-stream";
}

async function assetFetch(request) {
  const url = new URL(request.url);
  const decodedPath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  const filePath = path.resolve(clientDir, decodedPath);

  if (!filePath.startsWith(clientDir + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    return new Response(await readFile(filePath), {
      headers: { "content-type": contentTypeFor(filePath) },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function htmlOutPath(route) {
  return route === "/" ? path.join(clientDir, "index.html") : path.join(clientDir, `${route}.html`);
}

async function writeHtml(route, html) {
  const outPath = htmlOutPath(route);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, html);
  console.log("prerender:", path.relative(process.cwd(), outPath));
}

async function findBuiltAsset(pattern) {
  const assetsDir = path.join(clientDir, "assets");
  const assets = await readdir(assetsDir);
  return assets.find((asset) => pattern.test(asset));
}

async function createSpaShell() {
  if (!(await exists(clientDir))) {
    throw new Error("dist/client does not exist. Run `bun run build` before prerendering.");
  }

  const entry = await findBuiltAsset(/^index-.*\.js$/);
  const stylesheet = await findBuiltAsset(/^styles-.*\.css$/);
  if (!entry) throw new Error("Could not find the built client entry in dist/client/assets.");

  const stylesheetTag = stylesheet
    ? `\n    <link rel="stylesheet" href="./assets/${stylesheet}" />`
    : "";

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Universal Unicode Converter</title>
    <meta name="description" content="Convert legacy text encodings to Unicode across 135+ languages." />
    <meta name="theme-color" content="#0F0A2E" />
    <link rel="icon" href="./favicon.ico" type="image/x-icon" />
    <link rel="manifest" href="./manifest.webmanifest" />${stylesheetTag}
    <script type="module" src="./assets/${entry}"></script>
  </head>
  <body>
    <noscript>JavaScript is required to use Universal Unicode Converter.</noscript>
  </body>
</html>`;
}

async function prerenderWithServer(handler) {
  // Stub Cloudflare bindings so the worker handler runs under plain Node.
  const env = { ASSETS: { fetch: assetFetch } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };

  for (const route of routes) {
    try {
      const res = await handler.fetch(new Request(`http://localhost${route}`), env, ctx);
      const html = await res.text();
      await writeHtml(route, html);
      console.log("prerender status:", route, res.status);
    } catch (error) {
      console.warn(`prerender: server render failed for ${route}; writing SPA shell instead`);
      console.warn(error);
      await writeHtml(route, await createSpaShell());
    }
  }
}

const handler = await loadServerHandler();
if (handler) {
  await prerenderWithServer(handler);
} else {
  console.warn("prerender: server bundle not found; writing SPA shell for Capacitor");
  const html = await createSpaShell();
  for (const route of routes) {
    await writeHtml(route, html);
  }
}