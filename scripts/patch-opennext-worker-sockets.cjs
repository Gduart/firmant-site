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

if (fs.existsSync(target)) {
  let source = fs.readFileSync(target, "utf8");
  if (source.includes('require("cloudflare:sockets")')) {
    if (!source.startsWith('import { connect as __firmantCloudflareSocketConnect } from "cloudflare:sockets";')) {
      source = `import { connect as __firmantCloudflareSocketConnect } from "cloudflare:sockets";\n${source}`;
    }
    source = source.replace(
      /(\d+):([A-Za-z_$][\w$]*)=>\{\2\.exports=require\("cloudflare:sockets"\)\}/g,
      '$1:$2=>{$2.exports={connect:__firmantCloudflareSocketConnect}}',
    );
    fs.writeFileSync(target, source);
    console.log("[patch-worker-sockets] require de cloudflare:sockets convertido para import ESM.");
  }
} else {
  console.warn("[patch-worker-sockets] handler.mjs não encontrado; patch de sockets ignorado.");
}

const prerenderRoot = path.join(process.cwd(), ".next", "server", "app");
const assetsRoot = path.join(process.cwd(), ".open-next", "assets");

function copyPrerenderedHtml(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const sourcePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      copyPrerenderedHtml(sourcePath);
    } else if (entry.name.endsWith(".html")) {
      const relativePath = path.relative(prerenderRoot, sourcePath);
      const destinationPath = path.join(assetsRoot, relativePath);
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

copyPrerenderedHtml(prerenderRoot);
console.log("[patch-worker-sockets] HTML pré-renderizado copiado para Static Assets.");
