# Atualização do Projeto FIRMANT - V4

Documento de continuidade do projeto `firmant-site`.

Data de referência desta versão: 2026-05-13.

Este arquivo consolida as atualizações feitas no ciclo V4, os problemas encontrados, as correções aplicadas, o que foi publicado no staging oficial e os cuidados para as próximas etapas antes de produção.

---

## 1. Contexto do Ciclo V4

O foco deste ciclo foi preparar pontos pendentes antes da futura migração para produção:

- revisar a situação do webhook Asaas;
- endurecer autenticação do Admin Comercial;
- preparar cookies, consentimento e tracking para tráfego pago;
- publicar as alterações no ambiente correto de staging;
- manter o fluxo de pagamentos Asaas congelado.

Ambiente oficial de validação:

```text
https://firmant-site-staging.geraldo1fduarte.workers.dev
```

Regra reforçada pelo usuário:

```text
Não tratar localhost como ambiente oficial de validação do cliente.
Toda alteração relevante deve ser publicada e conferida no staging workers.dev.
```

---

## 2. Regra Preservada: Asaas Congelado

O fluxo de pagamento Asaas continua congelado e não foi alterado neste ciclo.

Não houve alteração nos módulos:

```text
src/lib/payments/*
src/app/api/payments/*
src/app/api/webhooks/asaas/*
```

Comando de conferência usado:

```powershell
git diff -- src/lib/payments src/app/api/payments src/app/api/webhooks/asaas
```

Resultado:

```text
Sem diff.
```

Isso confirma que as mudanças de Admin, cookies e tracking foram feitas como camadas adjacentes, sem refatorar pagamento, checkout, webhook ou status Asaas.

---

## 3. Webhook Asaas - Revisão e Correção de Entendimento

### 3.1 Alerta Inicial

Havia uma anotação local antiga indicando possível existência de um webhook sandbox antigo apontando para:

```text
https://firmant.com.br/api/webhooks/asaas
```

Esse alerta foi tratado inicialmente como risco antes de produção.

### 3.2 Análise do Painel Asaas

O usuário enviou imagens do painel Asaas mostrando:

- seção `Meus Webhooks`;
- apenas 1 webhook cadastrado;
- nome: `FIRMANT Staging Asaas`;
- situação: `Ativado`;
- eventos penalizados: `0`.

Depois, o usuário confirmou que a URL configurada no webhook é:

```text
https://firmant-site-staging.geraldo1fduarte.workers.dev/api/webhooks/asaas
```

### 3.3 Conclusão

A configuração atual está correta para staging.

Não há webhook antigo visível apontando para `firmant.com.br`.

Portanto, a pendência do webhook antigo foi descartada para o estado atual.

### 3.4 Regra para Produção

Não alterar o webhook atual enquanto o ambiente oficial for staging.

Somente na virada para produção real será necessário criar/configurar webhook de produção apontando para:

```text
https://firmant.com.br/api/webhooks/asaas
```

Esse futuro webhook de produção deverá usar token/secret de produção, separado do staging:

```text
ASAAS_WEBHOOK_AUTH_TOKEN
```

---

## 4. Endurecimento do Admin Comercial

### 4.1 Problema Encontrado

O Admin Comercial funcionava, mas salvava usuário e senha no navegador via `localStorage`.

Arquivo afetado:

```text
src/app/admin/CommercialAdminClient.tsx
```

Risco:

- aceitável em staging inicial;
- inadequado para produção;
- senha persistente em `localStorage` fica exposta a scripts no navegador;
- sessão administrativa deveria ser protegida por cookie `HttpOnly`.

### 4.2 Solução Aplicada

Foi criada uma sessão administrativa assinada no servidor, usando cookie:

```text
firmant_admin_session
```

Características:

- `HttpOnly`;
- `SameSite=Strict`;
- `Secure` quando a requisição é HTTPS;
- expiração de 8 horas;
- assinatura HMAC SHA-256 com base no secret `FIRMANT_ADMIN_PASSWORD`;
- não salva senha no navegador.

Arquivos criados/alterados:

```text
src/lib/admin/firmant-admin-auth.ts
src/app/api/admin/session/route.ts
src/app/admin/CommercialAdminClient.tsx
```

Nova rota:

```text
POST /api/admin/session
DELETE /api/admin/session
```

Uso:

- `POST` cria sessão após validar usuário/senha;
- `DELETE` encerra sessão;
- APIs administrativas aceitam sessão via cookie;
- Basic Auth foi preservado como fallback técnico para testes via `curl`.

### 4.3 Comportamento Atual do Admin Comercial

O campo usuário pode ser lembrado, mas a senha não é persistida.

O código remove qualquer senha antiga salva previamente:

```text
firmant-admin-password
```

As chamadas administrativas agora usam:

```text
credentials: "same-origin"
```

em vez de enviar `Authorization: Basic ...` construído no browser a partir de senha persistida.

---

## 5. Ajuste no Admin Blog

### 5.1 Problema Encontrado

O Admin Blog não salvava senha, mas salvava o token administrativo em `localStorage`:

```text
firmant-blog-admin-token
```

Arquivo:

```text
src/app/admin/blog/BlogAdminClient.tsx
```

### 5.2 Solução Aplicada

O token passou a ser salvo em:

```text
sessionStorage
```

Também foi adicionada remoção automática do valor antigo em `localStorage`.

Resultado:

- o token não fica persistido indefinidamente;
- a sessão se mantém durante a aba/sessão do navegador;
- reduz risco para produção.

Observação:

O Admin Blog ainda usa `BLOG_ADMIN_TOKEN`. Uma evolução futura pode migrar o Blog Admin para a mesma sessão `HttpOnly` do Admin Comercial, se for desejável unificar autenticação.

---

## 6. Cookies, Consentimento e Tracking para Tráfego Pago

### 6.1 Motivo

O usuário informou que serão feitas campanhas de tráfego pago com:

- Google Ads;
- Facebook/Meta Ads;
- possivelmente GA4 para mensuração.

A Política de Privacidade já mencionava cookies, analytics e marketing, mas não havia implementação ativa de consentimento ou tags no app.

### 6.2 Solução Aplicada

Foi criado um gerenciador de consentimento:

```text
src/components/AnalyticsConsentManager.tsx
```

Ele foi integrado no layout global:

```text
src/app/layout.tsx
```

Foi criada API de configuração:

```text
src/app/api/tracking/config/route.ts
```

Foi criada camada de config:

```text
src/lib/tracking/config.ts
```

### 6.3 Categorias de Consentimento

O banner trabalha com:

- essenciais;
- analíticos;
- marketing.

Regras:

- cookies essenciais não são opcionais;
- GA4 só carrega se o usuário aceitar analíticos;
- Google Ads e Meta Pixel só carregam se o usuário aceitar marketing;
- scripts externos não são carregados antes do aceite.

### 6.4 Consent Mode

Foi implementado modo default restritivo:

```text
ad_storage: denied
ad_user_data: denied
ad_personalization: denied
analytics_storage: denied
```

Após consentimento, o estado é atualizado conforme a escolha do usuário.

### 6.5 Variáveis de Ambiente Adicionadas

Arquivos atualizados:

```text
.env.example
.dev.vars.example
wrangler.jsonc
wrangler.staging.jsonc
```

Variáveis:

```text
GA_MEASUREMENT_ID=
GOOGLE_ADS_ID=
META_PIXEL_ID=
```

No staging atual, essas variáveis ainda estão vazias.

Consequência:

- banner de consentimento aparece;
- API `/api/tracking/config` responde;
- tags não disparam até os IDs reais serem configurados.

Resposta atual em staging:

```json
{
  "gaMeasurementId": null,
  "googleAdsId": null,
  "metaPixelId": null
}
```

### 6.6 CSS

Os estilos do banner foram adicionados em:

```text
src/app/globals.css
```

Classes principais:

```text
cookie-consent-banner
cookie-consent-panel
cookie-consent-actions
cookie-preferences
cookie-settings-button
```

---

## 7. Next.js 16 - Ajuste do Dev Server

### 7.1 Problema Encontrado

Ao tentar rodar:

```powershell
npm run dev
```

o Next.js 16 iniciou com Turbopack por padrão e encerrou com erro porque o projeto possui configuração customizada de `webpack` em:

```text
next.config.ts
```

Erro observado:

```text
This build is using Turbopack, with a `webpack` config and no `turbopack` config.
```

### 7.2 Solução Aplicada

O script `dev` foi ajustado para usar webpack explicitamente, mantendo coerência com o script de build:

```json
"dev": "next dev --webpack"
```

Arquivo alterado:

```text
package.json
```

Resultado:

```text
npm run dev
```

passa a iniciar o Next local com webpack.

Importante:

Mesmo com esse ajuste, o ambiente oficial de validação continua sendo o staging `workers.dev`, não localhost.

---

## 8. Deploy Staging Realizado

As alterações foram publicadas no Worker oficial de staging:

```text
firmant-site-staging
```

URL:

```text
https://firmant-site-staging.geraldo1fduarte.workers.dev
```

Comando usado:

```powershell
npm run deploy:staging
```

Versão publicada:

```text
6cf714b1-a5df-4212-90a8-39fd62185673
```

Bindings confirmados no deploy:

```text
FIRMANT_DB -> firmant-payments-staging
WORKER_SELF_REFERENCE -> firmant-site-staging
APP_BASE_URL -> workers.dev staging
ASAAS_API_BASE_URL -> https://api-sandbox.asaas.com
FIRMANT_ADMIN_USER -> FIRMANT_ADMIN
GMAIL_SMTP_USER -> ag.firmant@gmail.com
GA_MEASUREMENT_ID -> ""
GOOGLE_ADS_ID -> ""
META_PIXEL_ID -> ""
```

Produção não foi publicada.

---

## 9. Problemas Encontrados no Deploy

### 9.1 EPERM em `.open-next`

Primeira tentativa de deploy staging falhou com:

```text
EPERM, Permission denied: .open-next
```

Causa:

- artefato local `.open-next` bloqueado por processo Windows/Node;
- problema de ambiente local, não de código.

Solução aplicada:

1. conferir que `.open-next` estava dentro do workspace;
2. encerrar processos Node;
3. remover `.open-next`;
4. repetir `npm run deploy:staging`.

Depois disso, o deploy passou.

### 9.2 EPERM em `.next/trace`

Durante build local, ocorreu:

```text
EPERM: operation not permitted, open '.next/trace'
```

Solução:

- repetir build com permissão elevada.

O build passou.

### 9.3 Spawn EPERM no dev server

Ao tentar subir servidor local no sandbox, ocorreu:

```text
spawn EPERM
```

Solução:

- rodar fora do sandbox quando necessário;
- ajustar `dev` para `next dev --webpack`.

---

## 10. Validações Realizadas

### TypeScript

```powershell
npx tsc --noEmit --incremental false
```

Resultado:

```text
Passou.
```

### Lint

```powershell
npm run lint
```

Resultado:

```text
Passou.
```

### Build

```powershell
npm run build
```

Resultado:

```text
Passou.
```

### Deploy Staging

```powershell
npm run deploy:staging
```

Resultado:

```text
Publicado no Worker firmant-site-staging.
```

### Checks HTTP no Staging

Página pública:

```text
GET /monte-seu-pacote -> 200 OK
```

Tracking config:

```text
GET /api/tracking/config -> 200 OK
```

Admin sem autenticação:

```text
GET /api/admin/orders -> 401 Unauthorized
```

Isso confirma que a API administrativa continua protegida.

---

## 11. Arquivos Criados no Ciclo V4

```text
src/app/api/admin/session/route.ts
src/app/api/tracking/config/route.ts
src/components/AnalyticsConsentManager.tsx
src/lib/tracking/config.ts
Atualização_Projeto_V4.md
```

---

## 12. Arquivos Alterados no Ciclo V4

Principais:

```text
src/lib/admin/firmant-admin-auth.ts
src/app/admin/CommercialAdminClient.tsx
src/app/admin/blog/BlogAdminClient.tsx
src/app/layout.tsx
src/app/globals.css
package.json
.env.example
.dev.vars.example
wrangler.jsonc
wrangler.staging.jsonc
.gitignore
```

Observação:

O `git status` ainda contém grande volume de arquivos novos/alterados acumulados das versões V2/V3/V4. Isso precisa ser consolidado em commits organizados antes da produção.

---

## 13. Estado Atual dos IDs de Ads/Analytics

Ainda pendente configurar:

```text
GA_MEASUREMENT_ID
GOOGLE_ADS_ID
META_PIXEL_ID
```

Enquanto estiverem vazios:

- banner de cookies funciona;
- consentimento é salvo;
- nenhuma tag externa de GA4, Google Ads ou Meta Pixel dispara.

Para ativar campanhas com mensuração real, configurar esses valores no ambiente staging primeiro e validar.

Depois, quando produção for autorizada, configurar valores equivalentes no ambiente de produção.

---

## 14. Produção - Estado Pós V4

Produção continua bloqueada.

Não executar:

```powershell
npm run deploy
```

O script de produção continua bloqueado por segurança:

```text
scripts/blocked-production-deploy.cjs
```

Antes de produção real ainda faltam:

1. consolidar Git;
2. configurar IDs reais de GA4/Ads/Meta;
3. decidir Asaas produção;
4. configurar secrets de produção;
5. aplicar migrations no D1 produção;
6. criar webhook Asaas produção apontando para `firmant.com.br`;
7. validar domínio final;
8. validar Admin Comercial no ambiente final;
9. revisar páginas legais;
10. rodar teste de pagamento real pequeno, se Asaas produção for ativado.

---

## 15. Próximos Passos Recomendados

Ordem recomendada após V4:

1. Configurar `GA_MEASUREMENT_ID`, `GOOGLE_ADS_ID` e `META_PIXEL_ID` no staging.
2. Validar no navegador que scripts só carregam após aceite.
3. Testar login do Admin Comercial no staging com cookie de sessão.
4. Validar Admin Blog após mudança para `sessionStorage`.
5. Consolidar Git em commits separados:
   - infra/staging;
   - pagamentos/blog/admin acumulados;
   - Admin Comercial/session;
   - cookies/tracking;
   - documentação V4.
6. Só depois abrir checklist de produção.

---

## 16. Instrução para Próximo Ciclo

Ao retomar o projeto:

1. Ler `Atualização_Projeto_V4.md` primeiro.
2. Considerar `workers.dev` staging como base oficial de teste.
3. Não alterar fluxo Asaas sem autorização explícita.
4. Não assumir problema no webhook: o webhook staging foi confirmado correto.
5. Se a tarefa for tracking/ads, configurar primeiro IDs no staging.
6. Se a tarefa for produção, seguir checklist específico e não publicar direto.

Resumo V4:

```text
Admin Comercial foi endurecido, cookies/tracking foram implementados, webhook Asaas staging foi confirmado correto, deploy foi publicado no staging oficial e produção segue bloqueada.
```
