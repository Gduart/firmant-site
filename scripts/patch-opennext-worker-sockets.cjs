/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const target = path.join(
  process.cwd(),
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);

if (!fs.existsSync(target)) {
  console.warn("[patch-worker-sockets] handler.mjs não encontrado; patch ignorado.");
  process.exit(0);
}

let source = fs.readFileSync(target, "utf8");

if (!source.includes('require("cloudflare:sockets")')) {
  process.exit(0);
}

if (!source.startsWith('import { connect as __firmantCloudflareSocketConnect } from "cloudflare:sockets";')) {
  source = `import { connect as __firmantCloudflareSocketConnect } from "cloudflare:sockets";\n${source}`;
}

source = source.replace(
  /(\d+):([A-Za-z_$][\w$]*)=>\{\2\.exports=require\("cloudflare:sockets"\)\}/g,
  '$1:$2=>{$2.exports={connect:__firmantCloudflareSocketConnect}}',
);

fs.writeFileSync(target, source);
console.log("[patch-worker-sockets] require de cloudflare:sockets convertido para import ESM.");
