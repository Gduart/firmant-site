// Instala somente arquivos locais conhecidos; não aplica migrações nem publica.
(async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const root = 'C:/Projetos_Python/firmant-landing-v2';
  const manifest = {
    'lib/quotes/model.ts': '../src/lib/lead-quotes/model.ts',
    'lib/quotes/signing.ts': '../src/lib/lead-quotes/signing.ts',
    'lib/quotes/commercial.ts': 'diagnostico/lib/quotes/commercial.ts.txt',
    'components/LeadCommercial.tsx': 'diagnostico/components/LeadCommercial.tsx.txt',
    'components/LeadCommercial.module.css': 'diagnostico/components/LeadCommercial.module.css.txt',
    'app/api/admin/leads/[reference]/commercial/route.ts': 'diagnostico/app/api/admin/leads/[reference]/commercial/route.ts.txt',
  };
  for (const [file, source] of Object.entries(manifest)) {
    const target = path.resolve(root, file);
    if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error('Destino fora do projeto.');
    const content = await fs.readFile(path.resolve(__dirname, source), 'utf8');
    // A pasta lib/quotes e o componente são propriedade deste pacote.
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
  const pagePath = path.join(root, 'app/admin/leads/[reference]/page.tsx');
  let page = await fs.readFile(pagePath, 'utf8');
  if (!page.includes('import { LeadCommercial }')) page = 'import { LeadCommercial } from "@/components/LeadCommercial";\n' + page;
  if (!page.includes('<LeadCommercial ')) {
    const anchor = '      <section className="admin-panel admin-history">';
    if (!page.includes(anchor)) throw new Error('A tela de lead mudou. Revisar ponto de montagem.');
    page = page.replace(anchor, '      <LeadCommercial reference={lead.reference} service={lead.service || ""} name={lead.name} phone={lead.phone || ""} email={lead.email} />\n\n' + anchor);
  }
  page = page.replace('<LeadCommercial reference=', '<LeadCommercial key={lead.reference} reference=');
  // Gmail explícito; mailto usa o aplicativo padrão do Windows (ex.: Outlook).
  page = page.replaceAll('href={`mailto:${lead.email}`}', 'href={`https://mail.google.com/mail/?authuser=ag.firmant%40gmail.com&view=cm&fs=1&to=${encodeURIComponent(lead.email)}`} target="_blank" rel="noreferrer"');
  page = page.replace('>Enviar e-mail</a>', '>Abrir Gmail</a>');
  page = page.replace('https://mail.google.com/mail/?view=cm', 'https://mail.google.com/mail/?authuser=ag.firmant%40gmail.com&view=cm');
  await fs.writeFile(pagePath, page);
  const layoutPath = path.join(root, 'app/admin/layout.tsx');
  let layout = await fs.readFile(layoutPath, 'utf8');
  if (!layout.includes('FIRMANT_LOCAL_PREVIEW')) {
    layout = layout.replace('      {children}', '      {process.env.NODE_ENV === "development" && process.env.FIRMANT_LOCAL_PREVIEW === "1" && <p style={{ padding: "16px 24px", margin: 0, background: "#c9a84c", color: "#071321", fontSize: 13 }}>PRÉVIA LOCAL · Dados de demonstração. Nenhum lead de produção está conectado.</p>}\n      {children}');
    await fs.writeFile(layoutPath, layout);
  }
  const envPath = path.join(root, '.env.example');
  const configPath = path.join(root, 'next.config.ts');
  let config = await fs.readFile(configPath, 'utf8');
  if (!config.includes('FIRMANT_VERIFY_DIST_DIR')) {
    config = config.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  distDir: process.env.FIRMANT_VERIFY_DIST_DIR || ".next",');
    await fs.writeFile(configPath, config);
  }
  const env = await fs.readFile(envPath, 'utf8');
  if (!env.includes('FIRMANT_COMMERCIAL_URL=')) await fs.appendFile(envPath, '\n# Operações comerciais autenticadas no site institucional\nFIRMANT_COMMERCIAL_URL=https://firmant.com.br/api/integrations/lead-commercial\nFIRMANT_COMMERCIAL_SECRET=\n');
  console.log('Central comercial instalada no checkout local do Diagnóstico. Sem deploy ou migração.');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
