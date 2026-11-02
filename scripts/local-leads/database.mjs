import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import net from 'node:net';
import http from 'node:http';
const root = path.resolve(import.meta.dirname, '../..');
const local = path.join(root, '.local-preview');
const diagnostic = 'C:/Projetos_Python/firmant-landing-v2';
let database;
let ownsLock = false;
const ownerPath = path.join(local, 'database-owner.json');
(async () => {
  const settings = JSON.parse(fs.readFileSync(path.join(local,'settings.json'),'utf8'));
  if (process.argv.includes('--stop')) {
    const response = await fetch('http://127.0.0.1:54328/stop',{method:'POST',headers:{'x-local-control':settings.sessionSecret},signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('Parada local não confirmada.');
    console.log('Parada limpa do banco local solicitada.'); return;
  }
  const listening = await new Promise(resolve => { const socket = net.connect({ host:'127.0.0.1',port:54329 }); socket.once('connect',()=>{socket.destroy();resolve(true);}); socket.once('error',()=>resolve(false)); });
  if (listening) { console.log('Banco local já está disponível em 127.0.0.1:54329.'); return; }
  if (fs.existsSync(ownerPath)) {
    const owner = JSON.parse(fs.readFileSync(ownerPath,'utf8'));
    let alive = false; try { process.kill(owner.pid,0); alive = true; } catch {}
    if (alive) throw new Error('Outro processo do banco local ainda está inicializando.');
    fs.unlinkSync(ownerPath);
  }
  fs.writeFileSync(ownerPath,JSON.stringify({pid:process.pid}),{flag:'wx'}); ownsLock = true;
  const databaseDirectory = settings.databaseDirectory ?? 'postgres-session';
  if (!/^postgres-[a-z0-9-]+$/.test(databaseDirectory)) throw new Error('Diretório do banco local inválido.');
  const dataPath = path.join(local,databaseDirectory).replaceAll('\\','/');
  const wasmPid = path.join(dataPath,'postmaster.pid');
  // -42 é o PID sentinela do Postgres WASM, não um processo do Windows.
  // Só remove o marcador se o dono anterior não está vivo e não há servidor local.
  if (fs.existsSync(wasmPid) && fs.readFileSync(wasmPid,'utf8').split(/\r?\n/)[0] === '-42') fs.unlinkSync(wasmPid);
  const pgliteModule = path.join(local, 'tools/node_modules/@electric-sql/pglite/dist/index.js');
  const socketModule = path.join(local, 'tools/node_modules/@electric-sql/pglite-socket/dist/index.js');
  const { PGlite } = await import(pathToFileURL(pgliteModule).href);
  const { PGLiteSocketServer } = await import(pathToFileURL(socketModule).href);
  const db = await PGlite.create(dataPath);
  database = db;
  await db.exec('CREATE TABLE IF NOT EXISTS firmant_preview_migrations(tag TEXT PRIMARY KEY)');
  const journal = JSON.parse(fs.readFileSync(path.join(diagnostic, 'drizzle/meta/_journal.json'), 'utf8'));
  for (const entry of journal.entries) {
    const exists = await db.query('SELECT tag FROM firmant_preview_migrations WHERE tag=$1', [entry.tag]);
    if (exists.rows.length) continue;
    const sql = fs.readFileSync(path.join(diagnostic, `drizzle/${entry.tag}.sql`), 'utf8');
    await db.transaction(async transaction => {
      for (const statement of sql.split('--> statement-breakpoint').filter(value => value.trim())) await transaction.exec(statement);
      await transaction.query('INSERT INTO firmant_preview_migrations(tag) VALUES($1)', [entry.tag]);
    });
  }
  const reference = 'a10c0001-1000-4000-8000-000000000001';
  await db.query(`INSERT INTO leads(id,reference,idempotency_key,journey,name,company,email,phone,service,details,source,privacy_policy_version,privacy_acknowledged_at,marketing_consent,status)
    VALUES($1::uuid,$1::text,$2,'complete','Cliente de demonstração','Empresa fictícia','cliente@example.invalid',NULL,$3,$4,'firmant-site/dev/agente-ia-telegram','2026-11',now(),false,'received') ON CONFLICT DO NOTHING`,
    [reference, 'local-preview-commercial-v1', 'Automação + 1 agente de IA no Telegram', 'BRIEFING — Automação + 1 agente de IA no Telegram\n\nSegmento: serviços locais\n\nObjetivo: organizar agendamentos e qualificar novos contatos.\n\nO agente deve responder dúvidas sobre serviços, coletar interesse e consultar horários livres no Google Agenda.\n\nA equipe usa planilha para acompanhar os contatos e recebe aproximadamente 100 contatos por mês.\n\nQuando o cliente pedir uma pessoa, encaminhar o resumo à equipe.\n\nPrazo desejado: A definir']);
  await db.query(`INSERT INTO lead_crm(lead_id,status,priority,owner) VALUES($1,'qualified','normal','Prévia local') ON CONFLICT DO NOTHING`, [reference]);
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 54329, inspect: false });
  await server.start();
  console.log('Banco local de demonstração iniciado em 127.0.0.1:54329. Nenhum banco de produção foi acessado.');
  let closing = false;
  const stop = async () => { if (closing) return; closing = true; await server.stop(); await db.close(); if (ownsLock && fs.existsSync(ownerPath)) fs.unlinkSync(ownerPath); process.exit(0); };
  const control = http.createServer((request,response) => {
    if (request.method !== 'POST' || request.url !== '/stop' || request.headers['x-local-control'] !== settings.sessionSecret) { response.writeHead(404); response.end(); return; }
    response.end('Parada solicitada.'); void stop();
  });
  control.listen(54328,'127.0.0.1');
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
})().catch(async error => { console.error(error.message); if (database) await database.close().catch(() => {}); if (ownsLock && fs.existsSync(ownerPath)) fs.unlinkSync(ownerPath); process.exitCode = 1; });
