import path from 'node:path';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '../..'));
(async () => {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) { console.log('OPENAI_API_KEY ainda está vazia.'); process.exitCode = 1; return; }
  const response = await fetch('https://api.openai.com/v1/models/gpt-6-luna', {
    headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000),
  });
  console.log(`Verificação de acesso ao modelo gpt-6-luna: HTTP ${response.status}.`);
  if (response.ok) console.log('Chave reconhecida e modelo disponível. Nenhuma geração paga executada nesta verificação.');
  else process.exitCode = 1;
})().catch(() => { console.log('Não foi possível concluir a conexão segura com a OpenAI.'); process.exitCode = 1; });
