/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const target = path.join(
  process.cwd(),
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "build",
  "bundle-server.js",
);

if (!fs.existsSync(target)) {
  console.warn("[patch-opennext] bundle-server.js não encontrado; patch ignorado.");
  process.exit(0);
}

const source = fs.readFileSync(target, "utf8");

if (source.includes('"cloudflare:sockets"')) {
  process.exit(0);
}

const marker = 'external: [\n            "./middleware/handler.mjs",';

if (!source.includes(marker)) {
  console.warn("[patch-opennext] ponto de patch não encontrado; cloudflare:sockets pode falhar no bundle.");
  process.exit(0);
}

const patched = source.replace(
  marker,
  'external: [\n            "cloudflare:sockets",\n            "./middleware/handler.mjs",',
);

fs.writeFileSync(target, patched);
console.log("[patch-opennext] cloudflare:sockets marcado como external no OpenNext.");
