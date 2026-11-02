import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '../..');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'd1', 'migrations', 'apply', 'FIRMANT_DB', '--local', '--config', path.join(root, '.local-preview/wrangler.jsonc'), '--persist-to', path.join(root, '.local-preview/cloudflare')], { cwd: root, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', NODE_USE_SYSTEM_CA: '1' }, stdio: 'inherit', windowsHide: true });
process.exitCode = result.status ?? 1;
