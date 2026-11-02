import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';
const root = path.resolve(import.meta.dirname, '../..');
const settings = JSON.parse(fs.readFileSync(path.join(root, '.local-preview/settings.json'), 'utf8'));
(async () => {
  const lead = { reference: 'a10c0001-1000-4000-8000-000000000001', name: 'Cliente de demonstração', company: 'Empresa fictícia', email: 'cliente@example.invalid', phone: '', service: 'Automação + 1 agente de IA no Telegram', details: '' };
  const body = JSON.stringify({ action: 'get', revision: 0, actor: settings.adminEmail, lead });
  const timestamp = String(Math.floor(Date.now()/1000));
  const signature = 'sha256=' + createHmac('sha256',settings.commercialSecret).update(`${timestamp}.${body}`).digest('hex');
  const result = await fetch('http://127.0.0.1:3000/api/integrations/lead-commercial', { method:'POST', headers:{'Content-Type':'application/json','X-Firmant-Timestamp':timestamp,'X-Firmant-Signature':signature}, body, signal:AbortSignal.timeout(60000) });
  console.log(`Conexão comercial local: HTTP ${result.status}.`);
  if (!result.ok) { const error = await result.json(); console.log(error.error); process.exitCode = 1; return; }
  const login = await fetch('http://127.0.0.1:3001/api/admin/login', { method:'POST', headers:{Origin:'http://127.0.0.1:3001','Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({email:settings.adminEmail,password:settings.adminPassword}), redirect:'manual', signal:AbortSignal.timeout(60000) });
  const cookie = login.headers.get('set-cookie')?.split(';')[0];
  if (!cookie || !login.headers.get('location')?.endsWith('/admin/leads')) throw new Error('Login local não foi confirmado.');
  const admin = await fetch('http://127.0.0.1:3001/admin/leads', {headers:{Cookie:cookie}, signal:AbortSignal.timeout(60000)});
  const html = await admin.text();
  console.log(`Admin de Leads local: HTTP ${admin.status}; lead fictício presente: ${html.includes('Cliente de demonstração')}.`);
  if (!admin.ok || !html.includes('Cliente de demonstração')) process.exitCode = 1;
})().catch(error => { console.log(error.message); process.exitCode = 1; });
