const fs = require("fs");
const path = require("path");

const binDir = path.join(process.cwd(), "node_modules", ".bin");
fs.mkdirSync(binDir, { recursive: true });

const shellShim = `#!/usr/bin/env sh
exec npx --yes @opennextjs/cloudflare@1.19.0 "$@"
`;

const cmdShim = `@ECHO off
npx --yes @opennextjs/cloudflare@1.19.0 %*
`;

const shellPath = path.join(binDir, "opennextjs-cloudflare");
const cmdPath = path.join(binDir, "opennextjs-cloudflare.cmd");

fs.writeFileSync(shellPath, shellShim, { mode: 0o755 });
fs.writeFileSync(cmdPath, cmdShim);
