# Atualização do Projeto FIRMANT - V3

Documento de continuidade do projeto `firmant-site`.

Data de referência desta versão: Maio de 2026.

Este arquivo deve ser lido antes de qualquer nova alteração no projeto. Ele consolida o estado atual, decisões técnicas, falhas encontradas, correções aplicadas, regras críticas e próximos passos recomendados.

---

## 1. Contexto Geral do Projeto

O projeto `firmant-site` é o site institucional e comercial da FIRMANT, publicado em ambiente de testes oficial via Cloudflare Workers:

`https://firmant-site-staging.geraldo1fduarte.workers.dev`

O ambiente acima é o staging oficial para testes antes da produção. Não tratar `localhost` como ambiente oficial de validação para o cliente.

O site possui:

- páginas institucionais;
- página de contato;
- páginas legais;
- configurador de pacotes em `/monte-seu-pacote`;
- integração Asaas já funcional;
- banco Cloudflare D1;
- camada administrativa comercial;
- geração de contrato em PDF;
- envio de contrato por Gmail SMTP com senha de app;
- preparação manual para Autentique.

---

## 2. Regra Absoluta: Pagamentos Asaas Congelados

O fluxo de pagamento Asaas já está funcional e testado em staging.

Não alterar:

- `src/lib/payments/*`;
- `/api/payments/checkout`;
- `/api/payments/subscription`;
- `/api/payments/status/[id]`;
- `/api/webhooks/asaas`;
- lógica de Pix;
- lógica de cartão;
- lógica de cartão parcelado;
- lógica de assinatura;
- Payment Links;
- checkout session;
- webhook do Asaas;
- status de pagamento já validado.

Qualquer nova funcionalidade deve ser criada como camada adicional por cima do fluxo existente, sem reescrever ou refatorar a integração Asaas.

Após alterações administrativas recentes, foi verificado que não houve diff nos módulos congelados:

```powershell
git diff -- src/lib/payments src/app/api/payments src/app/api/webhooks/asaas
```

---

## 3. Ambiente Staging Atual

Worker:

`firmant-site-staging`

URL:

`https://firmant-site-staging.geraldo1fduarte.workers.dev`

D1 staging:

- binding: `FIRMANT_DB`
- database: `firmant-payments-staging`
- database id: `6a806da5-8569-407c-a32d-0df2234fbc78`

Variáveis públicas/importantes:

- `APP_BASE_URL`
- `ASAAS_API_BASE_URL=https://api-sandbox.asaas.com`
- `ASAAS_CANCEL_URL`
- `ASAAS_EXPIRED_URL`
- `ASAAS_SUCCESS_URL`
- `FIRMANT_ADMIN_USER=FIRMANT_ADMIN`
- `GMAIL_SMTP_USER=ag.firmant@gmail.com`

Secrets obrigatórios:

- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_AUTH_TOKEN`
- `BLOG_ADMIN_TOKEN`
- `FIRMANT_ADMIN_PASSWORD`
- `GMAIL_SMTP_APP_PASSWORD`

Não registrar valores reais de secrets em arquivos do repositório.

---

## 4. Páginas Públicas Criadas ou Consolidadas

### `/contato`

Página de contato premium e institucional.

Inclui:

- WhatsApp oficial;
- e-mail oficial;
- Instagram oficial;
- CNPJ;
- atendimento 100% online para todo o Brasil;
- foco em atendimento humano, consultivo e estratégico;
- ausência de formulário ativo;
- CTA principal para WhatsApp;
- CTA secundário para e-mail;
- schema Organization.

Dados oficiais:

- FIRMANT
- CNPJ: `63.867.205/0001-99`
- WhatsApp: `+55 11 91491-2488`
- e-mail: `ag.firmant@gmail.com`
- Instagram: `https://www.instagram.com/ag.firmant/`

### `/politica-privacidade`

Página completa de Política de Privacidade alinhada à LGPD.

Inclui:

- coleta de dados no site;
- configurador de pacotes;
- WhatsApp/e-mail;
- cookies;
- Google Analytics 4;
- Brevo para newsletter futura;
- Asaas;
- banco de dados;
- uso responsável de IA;
- envio de arquivos pelo cliente;
- direitos do titular;
- canais oficiais.

Foi removido um bloco visual que parecia comentário interno de revisão jurídica. A política continua mencionando de forma adequada que revisão jurídica profissional é recomendada antes da publicação definitiva, mas sem apresentar isso como CTA público indevido.

### `/termos-de-uso`

Página completa de Termos de Uso.

Inclui:

- uso do site;
- aceite dos termos;
- configurador de pacotes;
- solicitação de proposta;
- pagamentos via Asaas;
- prazos e entregas;
- obrigações do cliente;
- envio de arquivos;
- uso de IA;
- propriedade intelectual;
- revisões;
- limitações de responsabilidade;
- plataformas de terceiros;
- relação com Política de Privacidade e Política de Reembolso.

### `/politica-de-reembolso`

Página completa de Política de Reembolso.

Inclui:

- cancelamentos;
- desistências;
- créditos;
- serviços digitais personalizados;
- pacotes mensais;
- serviços avulsos;
- consultorias;
- desenvolvimento web/mobile;
- vídeos;
- UGC com IA;
- gestão de redes sociais;
- GEO;
- automações;
- pagamentos via Asaas;
- análise individual de reembolso.

### Rodapé

Links legais/institucionais foram adicionados na parte inferior do site, sem destaque exagerado:

- Contato;
- Política de Privacidade;
- Termos de Uso;
- Política de Reembolso.

O usuário pediu explicitamente para não abrir novas abas no topo do site. Esses links devem permanecer no rodapé/parte inferior.

---

## 5. Configurador de Pacotes

Rota:

`/monte-seu-pacote`

O wizard já estava integrado ao Asaas antes da V3. A integração de pagamento foi preservada.

Campos obrigatórios adicionados ao fluxo de coleta:

- nome completo;
- CPF;
- e-mail;
- telefone/WhatsApp;
- nome do Instagram.

Campos comerciais associados ao pedido:

- serviços escolhidos;
- pacote escolhido;
- quantidade;
- valor total;
- forma de pagamento;
- parcelamento, quando houver;
- tipo de contratação;
- mensagem/observação;
- data da solicitação;
- status do pagamento.

Arquivo relacionado:

- `src/lib/package-catalog.ts`

Tipo `ClientData` inclui agora CPF e Instagram.

---

## 6. Step Público de Contrato no Wizard

Houve uma falha importante de entendimento: inicialmente o contrato ficou tratado como algo apenas interno do Admin. O usuário deixou claro que deveria haver um step de contrato no site antes da finalização.

Correção aplicada:

O wizard passou a ter etapa pública de contrato antes do pagamento.

Fluxo atual:

1. Serviços
2. Detalhes
3. Seus dados
4. Resumo
5. Contrato
6. Finalizar

Na etapa de contrato:

- o cliente visualiza um resumo contratual;
- existe botão para gerar/abrir versão imprimível do contrato;
- existe checkbox obrigatório de aceite;
- é informado que, dependendo do tipo de serviço contratado, o cliente poderá receber contrato digital para assinatura oficial;
- só depois do aceite o cliente segue para pagamento.

Importante:

Esse step não deve bloquear ou refazer a lógica Asaas. Ele apenas adiciona validação/ciência contratual antes da chamada de pagamento existente.

---

## 7. Admin Comercial

Foi criada uma camada administrativa separada para acompanhamento comercial e contratual.

Rotas:

- `/admin/clientes`
- `/admin/clientes/[id]`
- `/admin/pedidos`
- `/admin/pedidos/[id]`
- `/admin/contratos`

Arquivos principais:

- `src/app/admin/CommercialAdminClient.tsx`
- `src/lib/admin/firmant-admin-auth.ts`
- `src/lib/commercial/types.ts`
- `src/lib/commercial/repository.ts`
- `src/lib/commercial/contract-pdf.ts`
- `src/lib/commercial/gmail-smtp.ts`

APIs administrativas:

- `/api/admin/customers`
- `/api/admin/customers/[id]`
- `/api/admin/orders`
- `/api/admin/orders/[id]`
- `/api/admin/contracts`
- `/api/admin/contracts/[id]`
- `/api/admin/contracts/[id]/pdf`
- `/api/admin/contracts/[id]/send-email`
- `/api/commercial/orders`

Autenticação:

- Basic Auth;
- usuário único;
- variável `FIRMANT_ADMIN_USER`;
- secret `FIRMANT_ADMIN_PASSWORD`.

Usuário definido:

`FIRMANT_ADMIN`

Não registrar a senha em documentação.

---

## 8. Banco de Dados Comercial

Migrations adicionadas:

### `migrations/0003_commercial_admin.sql`

Cria:

- `customers`
- `customer_notes`
- `contracts`
- `order_events`

### `migrations/0004_contract_email_delivery.sql`

Adiciona:

- `email_error`
- `contract_version`

Essas migrations foram aplicadas no D1 remoto de staging.

Importante:

As tabelas comerciais não substituem o histórico técnico de webhooks do Asaas. O histórico comercial/admin é separado.

---

## 9. Status de Contrato

Campo:

`contract_status`

Status previstos:

- `nao_gerado`
- `pdf_pendente`
- `pdf_gerado`
- `pdf_enviado_email`
- `autentique_pendente`
- `autentique_enviado`
- `aguardando_assinatura`
- `assinado`
- `dispensado`
- `cancelado`
- `erro`

Bug encontrado:

Ao clicar em gerar PDF, contratos já enviados por e-mail voltavam de `pdf_enviado_email` para `pdf_gerado`.

Correção aplicada:

O repositório passou a preservar status finais ou avançados.

Status preservados:

- `pdf_enviado_email`
- `autentique_enviado`
- `aguardando_assinatura`
- `assinado`
- `dispensado`
- `cancelado`

Funções relacionadas:

- `buildContractPatch(...)`
- `shouldPreserveContractStatus(...)`

Arquivo:

- `src/lib/commercial/repository.ts`

---

## 10. Tipo de Contrato

Campo:

`contract_type`

Tipos:

- `pdf_email`
- `autentique`
- `analise_manual`
- `dispensado`

Regra conceitual:

- serviços simples: `pdf_email`;
- serviços maiores, recorrentes ou profissionais: `autentique`;
- desenvolvimento web/app: `analise_manual`.

Essa classificação não deve alterar pagamento.

---

## 11. Geração de PDF de Contrato

Arquivo principal:

- `src/lib/commercial/contract-pdf.ts`

O PDF contém:

- número do contrato;
- número do pedido;
- data;
- dados da FIRMANT;
- CNPJ;
- dados do cliente;
- CPF;
- e-mail;
- telefone/WhatsApp;
- Instagram;
- serviços solicitados;
- valor;
- forma de pagamento;
- parcelamento;
- status do pagamento;
- termos e políticas aplicáveis;
- cláusulas de serviço;
- cancelamento e reembolso;
- responsabilidade do cliente;
- uso de IA;
- limitações de resultado;
- canal de contato;
- área de assinatura.

### Falhas encontradas no PDF

1. PDF em branco no Chrome.

Causas identificadas:

- uso incorreto de posicionamento relativo de texto no content stream;
- texto deslocado para fora da página;
- `/Kids` do objeto Pages sem colchetes;
- caracteres não ASCII/NBSP podendo quebrar renderização;
- ausência de definição confiável de cor antes do texto.

Correções aplicadas:

- troca para posicionamento absoluto com `Tm`;
- correção de `/Kids [ ... ]`;
- sanitização ASCII-safe do conteúdo;
- definição explícita de cor;
- organização mais rígida do stream PDF.

2. Layout inicial simples demais.

Correção aplicada:

- layout premium;
- fundo claro;
- cabeçalho navy;
- divisor gold;
- wordmark textual FIRMANT;
- hierarquia visual melhor;
- rodapé com contatos e número de página.

3. Nome FIRMANT aparecendo visualmente como `FIRM ANT`.

Correção aplicada:

- ajuste manual do offset horizontal do bloco `ANT` no wordmark;
- preservado layout premium.

4. Página 2 com texto colado no cabeçalho.

Correção aplicada:

- aumento do espaçamento superior da página 2;
- primeiro heading da página 2 passou a começar mais abaixo.

### Logo da FIRMANT

O arquivo `public/logo_Oficial-Firmant01.png` foi disponibilizado pelo usuário.

Estado atual:

- o PDF usa wordmark textual/vetorial FIRMANT;
- o PNG ainda não é embutido diretamente no PDF;
- isso foi uma decisão prática porque o PDF é gerado manualmente, sem biblioteca pesada de layout, e a incorporação robusta de PNG exigiria tratamento adicional de imagem/stream.

O layout atual foi aprovado pelo usuário após os ajustes.

---

## 12. Envio de Contrato por E-mail

O usuário definiu que não será usado provedor externo de e-mail transacional. O envio deve ser feito diretamente pelo Gmail com senha de app.

Remetente:

`ag.firmant@gmail.com`

Secret:

`GMAIL_SMTP_APP_PASSWORD`

Arquivo:

- `src/lib/commercial/gmail-smtp.ts`

Servidor:

- `smtp.gmail.com`
- porta `465`
- TLS direto

A senha de app pode ser digitada com espaços, mas o código normaliza removendo espaços.

### Falhas encontradas no envio Gmail

1. Uso inicial de `new Function(...import("cloudflare:sockets"))`.

Erro no Worker:

`Code generation from strings disallowed for this context`

Correção:

- substituído por importação dinâmica segura.

2. OpenNext empacotava `cloudflare:sockets` como require dinâmico.

Erro:

`Dynamic require of "cloudflare:sockets" is not supported`

Correções aplicadas:

- `scripts/patch-opennext-cloudflare-sockets.cjs`
- `scripts/patch-opennext-worker-sockets.cjs`

Esses scripts ajustam o build OpenNext para tratar `cloudflare:sockets` corretamente no Worker.

3. Build/deploy precisava executar os patches sempre.

Correção:

- scripts do `package.json` atualizados para rodar os patches antes/depois do build OpenNext.

### Cópia para FIRMANT

Foi adicionada opção no Admin:

`Enviar cópia dos contratos para ag.firmant@gmail.com`

Quando marcado, a API recebe:

```json
{
  "copyToFirmant": true
}
```

O Gmail SMTP envia cópia para a própria FIRMANT.

### Feedback visual no Admin

O usuário apontou que o e-mail era enviado, mas não havia mensagem de confirmação.

Correção aplicada:

- toast fixo no canto inferior direito;
- mensagem de sucesso no topo;
- botões mostram estado de carregamento:
  - `Enviando...`
  - `Gerando...`
  - `Marcando...`

Mensagens esperadas:

- contrato enviado para o cliente;
- contrato enviado para o cliente com cópia para a FIRMANT;
- erro de envio, quando aplicável.

---

## 13. Autentique

Estado atual:

A integração com Autentique é apenas preparação administrativa manual.

Não há integração automática com API da Autentique nesta fase.

Campos:

- `autentique_document_id`
- `autentique_url`
- `autentique_status`
- `autentique_sent_at`
- `autentique_signed_at`

No Admin existem dois campos destacados:

### Link Autentique

Deve receber a URL do documento criado manualmente na plataforma Autentique.

Uso:

- gerar/baixar PDF no Admin;
- acessar Autentique manualmente;
- criar documento com o PDF;
- configurar assinantes;
- enviar assinatura;
- copiar o link do documento;
- colar no campo `Link Autentique`.

### Document ID

Deve receber o identificador do documento dentro da Autentique.

Pode vir:

- da URL;
- do painel da Autentique;
- futuramente da API.

Se não estiver claro no painel, o campo pode ficar vazio temporariamente, mas o ideal é preencher quando disponível.

### Botões

`Registrar Autentique`

Salva link e Document ID no contrato.

Efeito esperado:

- `contract_type = autentique`;
- `contract_status = autentique_pendente`;
- `autentique_status = registrado_manual`.

`Autentique enviado`

Usar depois que o documento for enviado pela plataforma Autentique.

Efeito esperado:

- `contract_status = autentique_enviado`;
- `autentique_status = enviado_manual`;
- `autentique_sent_at = now`.

`Assinado`

Usar depois que o cliente assinar.

Efeito esperado:

- `contract_status = assinado`;
- `autentique_status = assinado_manual`;
- `signed_at = now`;
- `autentique_signed_at = now`.

---

## 14. Rotina Recomendada de Teste

### TypeScript

```powershell
npx tsc --noEmit --incremental false
```

### Lint

```powershell
npm run lint
```

### Build

```powershell
npm run build
```

### Deploy staging

```powershell
npm run deploy:staging
```

Não usar `npm run deploy` para produção. O script de produção está bloqueado de propósito.

### Testar PDF por API

Exemplo genérico:

```powershell
$pair = 'FIRMANT_ADMIN:<SENHA_DO_SECRET_MANAGER>'
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))

curl.exe -s -D headers.txt `
  -H "Authorization: Basic $auth" `
  "https://firmant-site-staging.geraldo1fduarte.workers.dev/api/admin/contracts/<contract_id>/pdf" `
  -o contract.pdf
```

### Testar envio de e-mail

```powershell
curl.exe -i -s -X POST `
  -H "Authorization: Basic $auth" `
  -H "Content-Type: application/json" `
  "https://firmant-site-staging.geraldo1fduarte.workers.dev/api/admin/contracts/<contract_id>/send-email" `
  -d '{"copyToFirmant":true}'
```

---

## 15. Problemas de Ambiente Conhecidos

### Build Windows / sandbox

Pode ocorrer:

`EPERM: operation not permitted, unlink '.next/app-path-routes-manifest.json'`

Solução prática:

- repetir o comando com permissão elevada;
- evitar assumir que o erro é do código sem validar.

### Deploy staging

Pode ocorrer:

`spawn EPERM`

Normalmente associado ao sandbox/Windows/esbuild.

Solução prática:

- repetir `npm run deploy:staging` com permissão elevada.

### OpenNext

O OpenNext avisa que Windows não é totalmente compatível.

Mesmo assim, o deploy staging foi realizado com sucesso após ajustes e permissões adequadas.

---

## 16. Scripts Importantes do `package.json`

Estado atual esperado:

```json
{
  "build": "next build --webpack",
  "dev": "next dev",
  "start": "next start",
  "lint": "eslint",
  "preview": "node scripts/patch-opennext-cloudflare-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js build && node scripts/patch-opennext-worker-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js preview",
  "preview:staging": "node scripts/patch-opennext-cloudflare-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --config wrangler.staging.jsonc && node scripts/patch-opennext-worker-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js preview --config wrangler.staging.jsonc",
  "deploy": "node scripts/blocked-production-deploy.cjs",
  "deploy:staging": "node scripts/patch-opennext-cloudflare-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --config wrangler.staging.jsonc && node scripts/patch-opennext-worker-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js deploy --config wrangler.staging.jsonc",
  "upload": "node scripts/patch-opennext-cloudflare-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js build && node scripts/patch-opennext-worker-sockets.cjs && node node_modules/@opennextjs/cloudflare/dist/cli/index.js upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

---

## 17. Pedidos Antigos vs Novos

Pedidos novos criados pelo wizard depois da camada comercial:

- criam/atualizam customer;
- criam contrato;
- registram evento comercial;
- aparecem no Admin Comercial.

Pedidos antigos criados antes dessa camada podem não ter:

- customer vinculado;
- contrato criado;
- eventos comerciais.

Se for necessário trazer pedidos antigos para o Admin de contratos, criar uma rotina de backfill separada.

Não fazer backfill mexendo no Asaas.

---

## 18. Produção

Produção ainda não deve ser publicada sem autorização explícita.

Antes da produção:

- revisar `wrangler.jsonc`;
- confirmar se Asaas deve sair de sandbox;
- configurar secrets de produção separadamente;
- aplicar migrations no D1 de produção;
- validar callbacks de sucesso/cancelamento/expiração;
- validar domínio final `https://firmant.com.br`;
- revisar páginas legais;
- revisar política de cookies;
- validar envio Gmail no ambiente final;
- validar que produção não usa URLs de staging.

Importante:

O `wrangler.jsonc` de produção pode ainda conter configurações de sandbox. Não trocar para Asaas produção sem ordem expressa.

---

## 19. Histórico de Falhas e Correções Críticas

### Falha: confusão entre local e staging

O usuário reforçou que staging oficial é:

`https://firmant-site-staging.geraldo1fduarte.workers.dev`

Correção de conduta:

- sempre validar e orientar pelo staging oficial;
- localhost pode ser usado tecnicamente, mas não deve ser apresentado como ambiente oficial de teste.

### Falha: contrato só no Admin

O usuário esperava contrato no site antes da finalização.

Correção:

- step público de contrato criado no wizard;
- checkbox obrigatório de aceite;
- aviso sobre contrato digital para assinatura oficial conforme serviço.

### Falha: PDF branco

Correções:

- content stream reestruturado;
- `/Kids` corrigido;
- posicionamento absoluto;
- sanitização;
- cores explícitas.

### Falha: botões do Admin sem feedback

Correção:

- estado de carregamento nos botões;
- toast de sucesso/erro;
- mensagem superior.

### Falha: envio Gmail bloqueado por build/OpenNext

Correção:

- uso correto de `cloudflare:sockets`;
- patch do bundle OpenNext;
- patch pós-build do Worker;
- scripts atualizados.

### Falha: gerar PDF rebaixava status do contrato

Correção:

- preservação de status avançado/final no repositório.

### Falha: wordmark `FIRMANT` com espaçamento errado

Correção:

- ajuste fino no offset do texto `ANT`.

### Falha: página 2 do PDF colada no cabeçalho

Correção:

- aumento do espaçamento superior da continuação.

---

## 20. Arquivos Mais Importantes para Continuidade

Admin/auth:

- `src/lib/admin/firmant-admin-auth.ts`
- `src/app/admin/CommercialAdminClient.tsx`

Comercial:

- `src/lib/commercial/types.ts`
- `src/lib/commercial/repository.ts`
- `src/lib/commercial/contract-pdf.ts`
- `src/lib/commercial/gmail-smtp.ts`

APIs admin/comercial:

- `src/app/api/admin/customers`
- `src/app/api/admin/orders`
- `src/app/api/admin/contracts`
- `src/app/api/commercial/orders`

Wizard:

- arquivos relacionados a `/monte-seu-pacote`;
- `src/lib/package-catalog.ts`.

Migrations:

- `migrations/0003_commercial_admin.sql`
- `migrations/0004_contract_email_delivery.sql`

Scripts:

- `scripts/patch-opennext-cloudflare-sockets.cjs`
- `scripts/patch-opennext-worker-sockets.cjs`
- `scripts/blocked-production-deploy.cjs`

---

## 21. Próximos Passos Recomendados

1. Criar rotina de backfill para contratos de pedidos antigos, se necessário.
2. Melhorar filtros avançados no Admin, caso o volume de pedidos cresça.
3. Criar página ou modal de visualização completa do contrato antes do envio.
4. Adicionar download persistente de PDF, caso o projeto passe a usar armazenamento R2.
5. Implementar integração real com Autentique apenas em etapa futura.
6. Implementar banner de cookies e preferências, se o GA4/pixels forem ativados publicamente.
7. Revisar juridicamente páginas legais antes da produção definitiva.
8. Revisar produção com checklist específico antes de migrar Asaas sandbox para Asaas produção.

---

## 22. Instrução para o Próximo Ciclo

Ao retomar o projeto:

1. Ler este arquivo primeiro.
2. Confirmar o objetivo do novo ciclo.
3. Verificar se a tarefa toca no fluxo Asaas.
4. Se tocar, parar e revisar a regra de congelamento.
5. Se for admin/comercial/contratos, trabalhar nas camadas novas.
6. Rodar validações.
7. Publicar apenas em staging, salvo autorização expressa para produção.

O ponto central da V3 é:

O pagamento já está pronto e não deve ser refeito. A camada atual adiciona organização comercial, clientes, contratos, PDF, envio de e-mail e preparação para Autentique sem interferir no Asaas.
