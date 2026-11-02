// Configura apenas arquivos privados locais. Nunca imprime ou copia a chave OpenAI.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';
const root = path.resolve(import.meta.dirname, '../..');
const diagnostic = 'C:/Projetos_Python/firmant-landing-v2';
const local = path.join(root, '.local-preview');
fs.mkdirSync(local, { recursive: true });
const settingsPath = path.join(local, 'settings.json');
const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {
  commercialSecret: randomBytes(32).toString('hex'), briefingSecret: randomBytes(32).toString('hex'),
  adminEmail: 'revisao@firmant.local', adminPassword: 'Firmant.Local.Revisao.2026!',
  sessionSecret: randomBytes(32).toString('hex'), piiSecret: randomBytes(32).toString('hex'),
};
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
function updateEnv(filename, values) {
  let content = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : '';
  for (const [name, value] of Object.entries(values)) {
    const line = `${name}=${String(value).replace(/\$/g, '\\$')}`;
    const pattern = new RegExp(`^${name}=.*$`, 'm');
    if (pattern.test(content)) content = content.replace(pattern, () => line);
    else content += (content.endsWith('\n') || !content ? '' : '\n') + line + '\n';
  }
  fs.writeFileSync(filename, content);
}
const diagnosticEnv = path.join(diagnostic, '.env.local');
if (fs.existsSync(diagnosticEnv)) {
  const existing = fs.readFileSync(diagnosticEnv, 'utf8').match(/^DATABASE_URL=(.*)$/m)?.[1];
  if (existing && !existing.includes('127.0.0.1:54329')) throw new Error('Já existe outra conexão de banco no Diagnóstico. Arquivo preservado.');
}
const salt = randomBytes(16).toString('hex');
const passwordHash = `scrypt$${salt}$${scryptSync(settings.adminPassword, salt, 64).toString('hex')}`;
updateEnv(diagnosticEnv, {
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54329/postgres', DATABASE_POOL_MAX: '1',
  NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3001', FIRMANT_LOCAL_PREVIEW: '1',
  ADMIN_EMAIL: settings.adminEmail, ADMIN_PASSWORD_HASH: passwordHash, ADMIN_SESSION_SECRET: settings.sessionSecret,
  PII_HASH_SECRET: settings.piiSecret, PRIVACY_POLICY_VERSION: '2026-11',
  FIRMANT_COMMERCIAL_URL: 'http://127.0.0.1:3000/api/integrations/lead-commercial', FIRMANT_COMMERCIAL_SECRET: settings.commercialSecret,
  FIRMANT_SITE_BRIEFING_SECRET: settings.briefingSecret,
  N8N_LEADS_WEBHOOK_URL: '', N8N_LEADS_WEBHOOK_SECRET: '', N8N_FIRMO_WEBHOOK_URL: '', TELEGRAM_HEALTH_VERIFIED: 'false',
});
const persist = path.join(local, 'cloudflare/v3').replaceAll('\\', '/');
const configPath = path.join(local, 'wrangler.jsonc').replaceAll('\\', '/');
updateEnv(path.join(root, '.env.local'), {
  NODE_USE_SYSTEM_CA: '1',
  FIRMANT_LOCAL_WRANGLER_CONFIG: configPath, FIRMANT_LOCAL_WRANGLER_PERSIST: persist,
  DIAGNOSTICO_COMMERCIAL_SECRET: settings.commercialSecret,
  DIAGNOSTICO_BRIEFING_URL: 'http://127.0.0.1:3001/api/integrations/service-briefings', DIAGNOSTICO_BRIEFING_SECRET: settings.briefingSecret,
});
fs.writeFileSync(configPath, JSON.stringify({
  name: 'firmant-local-preview', compatibility_date: '2026-04-11', compatibility_flags: ['nodejs_compat'],
  vars: { APP_BASE_URL: 'http://127.0.0.1:3000', ASAAS_API_BASE_URL: 'https://api-sandbox.asaas.com', FIRMANT_ADMIN_USER: 'FIRMANT_ADMIN', GMAIL_SMTP_USER: 'ag.firmant@gmail.com' },
  d1_databases: [{ binding: 'FIRMANT_DB', database_name: 'firmant-local-preview', database_id: 'f0000000-0000-4000-8000-000000000001', migrations_dir: '../migrations' }],
  kv_namespaces: [{ binding: 'BLOG_IMAGES', id: 'f0000000000000000000000000000001' }],
  r2_buckets: [{ binding: 'PRIVATE_ASSETS', bucket_name: 'firmant-local-preview' }],
}, null, 2));
fs.writeFileSync(path.join(local, 'ACESSO.txt'), `AMBIENTE EXCLUSIVAMENTE LOCAL - DADOS FICTICIOS\n\nAdmin: http://127.0.0.1:3001/admin/leads\nLogin: ${settings.adminEmail}\nSenha de demonstracao: ${settings.adminPassword}\n\nA chave OpenAI fica somente em .env.local e nao e exibida aqui.\n`);
console.log('Conexões locais configuradas. Chave OpenAI preservada; credenciais de demonstração em .local-preview/ACESSO.txt.');
