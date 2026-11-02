# Prévia local do Admin de Leads

Ambiente de desenvolvimento com banco PostgreSQL WASM (PGlite) e D1 isolados em `.local-preview/`. Não conecta ao banco, n8n, e-mail ou Asaas de produção. A chave OpenAI fica somente em `C:/Projetos_Python/firmant-site/.env.local`, ignorado pelo Git.

Endereços:

- Site: `http://127.0.0.1:3000/desenvolvimento`
- Leads: `http://127.0.0.1:3001/admin/leads`
- Acesso de demonstração: `.local-preview/ACESSO.txt` (arquivo privado, sem a chave OpenAI)

O painel identifica explicitamente os dados de demonstração. O lead fictício permite gerar e revisar orçamento com a API real, se a chave estiver configurada. O envio de e-mail e o pagamento continuam dependendo de suas respectivas credenciais de homologação; não foram ativados com credenciais de produção.

## Preparar novamente

Requer Node.js 24 e os dois checkouts locais existentes.

```powershell
cd C:/Projetos_Python/firmant-site
$env:NODE_USE_SYSTEM_CA='1'
npm install --prefix .local-preview/tools --save-exact @electric-sql/pglite@0.5.14 @electric-sql/pglite-socket@0.2.17
node scripts/local-leads/prepare.mjs
node integration/apply-commercial.cjs
node scripts/local-leads/site-database.mjs
```

`prepare.mjs` preserva a chave OpenAI e outros campos do arquivo do site. Recusa substituir uma conexão de banco diferente de `127.0.0.1:54329` já configurada no Diagnóstico. As migrações D1 são aplicadas com `--local` e configuração própria, sem vínculo remoto.

## Iniciar

Banco, em um terminal:

```powershell
cd C:/Projetos_Python/firmant-site
node scripts/local-leads/database.mjs
```

Site, em outro terminal:

```powershell
cd C:/Projetos_Python/firmant-site
$env:NODE_USE_SYSTEM_CA='1'
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Diagnóstico, em outro terminal:

```powershell
cd C:/Projetos_Python/firmant-landing-v2
$env:NODE_USE_SYSTEM_CA='1'
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Se houver servidor na porta correspondente, use a instância existente. Não iniciar várias cópias. Os processos preparados nesta sessão estão em segundo plano e seus identificadores/logs ficam na pasta privada `.local-preview/`.

## Verificar sem revelar segredos

```powershell
cd C:/Projetos_Python/firmant-site
$env:NODE_USE_SYSTEM_CA='1'
node scripts/local-leads/check-openai.mjs
node scripts/local-leads/check-services.mjs
```

O primeiro comando consulta o acesso ao modelo sem geração paga e imprime somente o status. O segundo verifica HMAC, D1, login e lead fictício. Não imprime a chave, os segredos ou cookies.

## Parar o banco de forma limpa

```powershell
node C:/Projetos_Python/firmant-site/scripts/local-leads/database.mjs --stop
```

Esse comando usa um controle privado em loopback para fechar o banco corretamente. Não encerrar à força o banco WASM durante a gravação. Não excluir `.local-preview/` se quiser preservar os dados de teste.

O PGlite é usado somente para revisão local; a aplicação publicada continua com PostgreSQL no servidor. A configuração de proxy local do site só é lida no modo de desenvolvimento.

## Autenticar Gmail sem enviar mensagem

No arquivo privado `.env.local` do site, usar `GMAIL_SMTP_USER=ag.firmant@gmail.com` e preencher `GMAIL_SMTP_APP_PASSWORD` com a senha de app Google. Nunca usar a senha comum da conta nem registrar a senha em documentação ou chat. O arquivo é ignorado pelo Git.

```powershell
cd C:/Projetos_Python/firmant-site
$env:NODE_ENV='development'
$env:NODE_USE_SYSTEM_CA='1'
node C:/Projetos_Python/firmant-landing-v2/node_modules/tsx/dist/cli.mjs scripts/local-leads/check-gmail.ts
```

A verificação autentica no SMTP Gmail e encerra a conexão sem destinatário, mensagem ou anexo. Exibe apenas o resultado. Após autenticação confirmada, recarregar o orçamento para habilitar o envio direto de PDF. O lead de demonstração usa endereço fictício e não é um destinatário válido para envio real.

Atualização operacional: a autenticação Gmail foi validada usando GMAIL_SMTP_PORT=587 no .env.local. Esse modo de desenvolvimento exige STARTTLS e certificado válido antes de autenticar; produção continua no transporte Cloudflare existente. O banco ativo pode ser selecionado por databaseDirectory no settings.json privado. Após recuperação, usa postgres-recovery; postgres-session original foi preservado. Usar o comando --stop para encerrar o banco corretamente.

## Sandbox Asaas

`node scripts/local-leads/check-asaas.mjs` valida a chave Sandbox por consulta de leitura, sem expor chave ou cadastro. Requer NODE_USE_SYSTEM_CA=1 neste computador. O script preserva o `$` literal no dotenv. URL base local: https://api-sandbox.asaas.com, sem /v3.

O recebimento de eventos usa `scripts/local-leads/asaas-relay.mjs` em 127.0.0.1:54330 e túnel Cloudflare temporário. Somente o webhook autenticado e retornos fixos de pagamento são acessíveis; não apontar o túnel diretamente para as portas 3000 ou 3001. Estado privado em `.local-preview/asaas-homologation.json`; PIDs em `.local-preview/asaas-relay.pid` e `asaas-tunnel.pid`; logs em `.local-preview/logs/asaas-*`. Antes de parar o túnel, desabilitar o webhook de homologação indicado no estado. A opção ASAAS_CALLBACK_BASE_URL serve ao retorno do checkout temporário e não substitui a URL do Admin.
