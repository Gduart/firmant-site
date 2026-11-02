// Aplicação local e restrita do pacote da integração. Não publica nem altera credenciais.
(async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const target = 'C:/Projetos_Python/firmant-landing-v2';
  const files = [
    'lib/integrations/service-briefing.ts',
    'app/api/integrations/service-briefings/route.ts',
    'tests/service-briefing.test.ts',
  ];
  for (const file of files) {
    const destination = path.resolve(target, file);
    if (!destination.startsWith(path.resolve(target) + path.sep)) throw new Error('Destino inválido.');
    const source = await fs.readFile(path.join(__dirname, 'diagnostico', file + '.txt'), 'utf8');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    try {
      const current = await fs.readFile(destination, 'utf8');
      if (current !== source) throw new Error(`Arquivo já existe com conteúdo diferente: ${file}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await fs.writeFile(destination, source);
  }
  const workflowPath = path.join(target, 'n8n/workflows/01-firmant-leads-gmail.json');
  const workflowText = await fs.readFile(workflowPath, 'utf8');
  const workflow = JSON.parse(workflowText);
  const validator = workflow.nodes.find(node => node.name === 'Validar e normalizar lead');
  const oldCode = validator.parameters.jsCode;
  const journeyPrefix = "lead.source?.startsWith('firmant-site/dev/') ? 'Briefing de desenvolvimento' : ";
  const newCode = oldCode.replace('details: clean(lead.details, 2000)', "details: clean(lead.details, lead.source?.startsWith('firmant-site/dev/') ? 16000 : 2000)")
    .split(journeyPrefix).join("")
    .replace(": 'Plano digital completo'", ": lead.source?.startsWith('firmant-site/dev/') ? 'Briefing de desenvolvimento' : 'Plano digital completo'");
  if (!newCode.includes("lead.source?.startsWith('firmant-site/dev/') ? 16000")) throw new Error('Validador do workflow mudou. Revisão necessária.');
  await fs.writeFile(workflowPath, workflowText.replace(JSON.stringify(oldCode), JSON.stringify(newCode)));
  const envPath = path.join(target, '.env.example');
  const env = await fs.readFile(envPath, 'utf8');
  if (!env.includes('FIRMANT_SITE_BRIEFING_SECRET=')) await fs.appendFile(envPath, '\n# Recebimento autenticado dos briefings do site institucional; mínimo 32 caracteres\nFIRMANT_SITE_BRIEFING_SECRET=\n');
  // Os caches de homologações antigas não são código-fonte nem tipos atuais do Next.
  const eslintPath = path.join(target, 'eslint.config.mjs');
  const eslint = await fs.readFile(eslintPath, 'utf8');
  if (!eslint.includes('".next-codex*/**"')) await fs.writeFile(eslintPath, eslint.replace('".next/**",', '".next/**",\n    ".next-codex*/**",\n    ".sites-runtime/**",'));
  const tsPath = path.join(target, 'tsconfig.json');
  const tsText = await fs.readFile(tsPath, 'utf8');
  const ts = JSON.parse(tsText);
  const exclusions = [...new Set([...ts.exclude, '.next-codex*/**', '.sites-runtime/**'])];
  if (exclusions.length !== ts.exclude.length) await fs.writeFile(tsPath, tsText.replace(/"exclude":\s*\[[^\]]*\]/, '"exclude": ' + JSON.stringify(exclusions)));
  console.log('Integração aplicada localmente no Diagnóstico. Nenhum deploy executado.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
