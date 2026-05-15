# Atualização do Projeto V2 — FIRMANT Site

> Data da memória: 2026-04-26  
> Projeto: `firmant-site`  
> Pasta local: `C:\Projetos_Python\firmant-site`  
> Domínio produção planejado: `https://firmant.com.br/`  
> Staging ativo: `https://firmant-site-staging.geraldo1fduarte.workers.dev`  
> Arquivo anterior de referência: `Atualização_Projeto_V1.md`  
> Objetivo deste arquivo: servir como memória completa para retomada futura. Ao reabrir o projeto, pedir ao assistente para ler este arquivo antes de qualquer alteração.

---

## 1. Resumo Executivo V2

O projeto FIRMANT evoluiu de um site institucional com wizard visual para uma aplicação comercial mais completa, com:

- Site institucional em Next.js 16 / React 19.
- Wizard `Monte Seu Pacote` integrado ao Asaas em ambiente sandbox/staging.
- Pagamentos por Pix, cartão de crédito, cartão parcelado e assinatura recorrente no cartão.
- Banco Cloudflare D1 para pedidos, pagamentos, assinaturas, webhooks e posts do Blog.
- Webhook Asaas para atualização de status.
- Blog público em `/blog`.
- Admin do Blog em `/admin/blog`, protegido por `BLOG_ADMIN_TOKEN`.
- Staging Cloudflare funcionando com deploy via OpenNext.

Os testes finais de pagamento foram considerados concluídos com sucesso pelo usuário. O foco atual passou para:

1. Refinar Blog/Admin.
2. Criar páginas institucionais obrigatórias.
3. Preparar checklist de produção.
4. Somente depois migrar para produção.

---

## 2. Estado Atual em Uma Frase

O projeto está funcional em staging, com pagamentos Asaas testados e Blog/Admin criado, mas ainda falta completar páginas institucionais, revisar produção, configurar Asaas real, aplicar migrations/secrets em produção e consolidar/commitar o grande volume de alterações locais.

---

## 3. Stack Técnica Atualizada

| Camada | Tecnologia | Estado |
|---|---|---|
| Framework | Next.js `16.2.1` | App Router em `src/app` |
| UI | React `19.2.4` | Componentes client-side e server-side |
| Linguagem | TypeScript | Validação recorrente com `npx tsc --noEmit --incremental false` |
| Animações | Framer Motion | Usado nas páginas principais |
| Scroll | Lenis | Smooth scroll global |
| CSS | Tailwind 4 + CSS global + inline styles | Muito layout ainda em `style={{ }}` |
| Deploy | OpenNext Cloudflare | Staging funcionando |
| Banco | Cloudflare D1 | Pagamentos + Blog |
| Pagamento | Asaas Sandbox | Staging testado |
| Admin Blog | Next route + API + D1 | Protegido por token |
| Infra | Wrangler | `wrangler.staging.jsonc` e `wrangler.jsonc` |

Scripts atuais em `package.json`:

```json
{
  "build": "next build --webpack",
  "dev": "next dev",
  "lint": "eslint",
  "preview": "node node_modules/@opennextjs/cloudflare/dist/cli/index.js build && node node_modules/@opennextjs/cloudflare/dist/cli/index.js preview",
  "preview:staging": "node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --config wrangler.staging.jsonc && node node_modules/@opennextjs/cloudflare/dist/cli/index.js preview --config wrangler.staging.jsonc",
  "deploy": "node scripts/blocked-production-deploy.cjs",
  "deploy:staging": "node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --config wrangler.staging.jsonc && node node_modules/@opennextjs/cloudflare/dist/cli/index.js deploy --config wrangler.staging.jsonc",
  "upload": "node node_modules/@opennextjs/cloudflare/dist/cli/index.js build && node node_modules/@opennextjs/cloudflare/dist/cli/index.js upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

Observação crítica: `npm run deploy` está bloqueado por script de segurança para evitar produção acidental.

---

## 4. Rotas Atuais

### 4.1 Rotas Públicas

| Rota | Estado |
|---|---|
| `/` | Implementada |
| `/gestao-redes-sociais` | Implementada |
| `/edicao-video-ugc` | Implementada |
| `/desenvolvimento` | Implementada |
| `/monte-seu-pacote` | Implementada e integrada a pagamentos |
| `/blog` | Implementada |
| `/blog/[slug]` | Implementada |
| `/pagamento/sucesso` | Implementada |
| `/pagamento/cancelado` | Implementada |
| `/pagamento/expirado` | Implementada |
| `/pagamento/status/[id]` | Implementada |

### 4.2 Rotas Admin

| Rota | Estado |
|---|---|
| `/admin/blog` | Implementada, protegida por token via API |

### 4.3 APIs

| Rota | Estado |
|---|---|
| `/api/payments/checkout` | Cria checkout/pagamento avulso |
| `/api/payments/subscription` | Cria assinatura recorrente |
| `/api/payments/status/[id]` | Consulta status do pedido |
| `/api/webhooks/asaas` | Recebe webhooks Asaas |
| `/api/admin/blog/posts` | Lista/salva posts do Blog |
| `/api/admin/blog/posts/[id]` | Exclui post do Blog |

### 4.4 Rotas Ainda Pendentes

| Rota | Motivo |
|---|---|
| `/contato` | Linkada na Navbar/Footer e necessária institucionalmente |
| `/politica-privacidade` | Necessária para LGPD, confiança e plataformas |
| `/termos-de-uso` | Necessária para regras de uso/contratação |
| `/politica-de-reembolso` ou similar | Necessária por pagamentos, cancelamento e assinatura |
| `/sobre` | Recomendável, mas não obrigatória no primeiro lote |

---

## 5. Infra Cloudflare / Ambientes

### 5.1 Staging

Arquivo: `wrangler.staging.jsonc`

Worker:

```text
firmant-site-staging
```

URL:

```text
https://firmant-site-staging.geraldo1fduarte.workers.dev
```

D1:

```text
binding: FIRMANT_DB
database_name: firmant-payments-staging
database_id: 6a806da5-8569-407c-a32d-0df2234fbc78
```

Variáveis staging:

```text
APP_BASE_URL=https://firmant-site-staging.geraldo1fduarte.workers.dev
ASAAS_API_BASE_URL=https://api-sandbox.asaas.com
ASAAS_CANCEL_URL=https://firmant-site-staging.geraldo1fduarte.workers.dev/pagamento/cancelado
ASAAS_EXPIRED_URL=https://firmant-site-staging.geraldo1fduarte.workers.dev/pagamento/expirado
ASAAS_SUCCESS_URL=https://firmant-site-staging.geraldo1fduarte.workers.dev/pagamento/sucesso
```

Secrets necessários em staging:

```text
ASAAS_API_KEY
ASAAS_WEBHOOK_AUTH_TOKEN
BLOG_ADMIN_TOKEN
```

`BLOG_ADMIN_TOKEN` já foi criado em staging via:

```powershell
npx wrangler secret put BLOG_ADMIN_TOKEN --config wrangler.staging.jsonc
```

### 5.2 Produção

Arquivo: `wrangler.jsonc`

Worker:

```text
firmant-site
```

D1:

```text
binding: FIRMANT_DB
database_name: firmant-payments
database_id: f46d991a-d1b2-45b2-af6c-6b15ba50d1f9
```

Atenção crítica: `wrangler.jsonc` ainda tem:

```text
ASAAS_API_BASE_URL=https://api-sandbox.asaas.com
```

Isso deve ser corrigido antes de produção real. Produção não deve ser publicada sem:

- Asaas produção configurado.
- `ASAAS_API_KEY` produção.
- `ASAAS_WEBHOOK_AUTH_TOKEN` produção.
- `BLOG_ADMIN_TOKEN` produção.
- Migrations aplicadas no D1 produção.
- Domínio de callback validado no Asaas.
- Checklist final.

---

## 6. Banco de Dados D1

### 6.1 Migration de Pagamentos

Arquivo:

```text
migrations/0001_payments.sql
```

Tabelas:

- `orders`
- `payments`
- `subscriptions`
- `webhook_events`

Uso:

- Guardar pedidos internos.
- Guardar cobranças Asaas.
- Guardar assinaturas.
- Garantir idempotência dos webhooks.

### 6.2 Migration do Blog

Arquivo:

```text
migrations/0002_blog_posts.sql
```

Tabela:

```text
blog_posts
```

Campos principais:

- `id`
- `slug`
- `title`
- `excerpt`
- `coverImage`
- `coverAlt`
- `category`
- `tags`
- `content`
- `status`
- `author`
- `seoTitle`
- `seoDescription`
- `publishedAt`
- `createdAt`
- `updatedAt`

Migration aplicada com sucesso em staging:

```text
0002_blog_posts.sql ✅
```

Comando usado:

```powershell
npx wrangler d1 migrations apply firmant-payments-staging --remote --config wrangler.staging.jsonc
```

---

## 7. Pagamentos Asaas — Estado Final dos Testes

### 7.1 Situação Atual

Os testes finais de pagamento foram considerados concluídos com sucesso pelo usuário.

Foram testados:

- Cartão de crédito.
- Cartão parcelado.
- Pix.
- Assinatura recorrente no cartão.
- Descrição enviada ao Asaas.
- Status no painel.
- Webhook/atualização interna.

Conclusão operacional: pagamentos em staging encerrados e lógica congelada, salvo ajustes finos futuros.

### 7.2 Arquivos principais de pagamento

```text
src/lib/package-catalog.ts
src/lib/payments/payment-service.ts
src/lib/payments/webhook-service.ts
src/lib/payments/order-description.ts
src/lib/payments/types.ts
src/lib/payments/orders-repository.ts
src/lib/payments/payments-repository.ts
src/lib/payments/subscriptions-repository.ts
src/lib/payments/webhook-events-repository.ts
src/lib/payments/asaas/client.ts
src/lib/payments/asaas/checkouts.ts
src/lib/payments/asaas/payment-links.ts
src/lib/payments/asaas/payments.ts
src/lib/payments/asaas/mapper.ts
src/app/api/payments/checkout/route.ts
src/app/api/payments/subscription/route.ts
src/app/api/payments/status/[id]/route.ts
src/app/api/webhooks/asaas/route.ts
```

### 7.3 Decisões Técnicas Importantes

#### Pix

Pix continua usando Asaas Checkout Session.

#### Cartão avulso / parcelado

Cartão foi migrado para Payment Links do Asaas porque o Checkout Session não propagava corretamente a descrição para a listagem de cobranças no painel Asaas.

Arquivo:

```text
src/lib/payments/asaas/payment-links.ts
```

#### Assinatura recorrente

Assinatura recorrente no cartão também usa Payment Link:

```text
chargeType: "RECURRENT"
subscriptionCycle: "MONTHLY"
```

#### Callback do Payment Link

No sandbox, o Asaas recusou callback/redirect por falta de domínio configurado nos dados comerciais da conta. A solução prática foi remover callback do Payment Link e confiar no webhook/status interno.

Em produção, isso deve ser revisado com domínio real configurado no Asaas.

---

## 8. Erros de Pagamento Encontrados e Correções

### 8.1 Descrição não aparecia no Asaas

Problema:

- O painel Asaas mostrava `Descrição não informada` ou apenas `Parcela X de Y`.
- Checkout Session não propagava a descrição como esperado.

Correções:

- Criado `buildOrderDescription`.
- Tentadas descrições no payload do Checkout.
- Diagnosticado erro de limite em `items[].name` do Asaas.
- Migrado cartão e assinatura para Payment Links.
- Webhook passou a tentar sincronizar descrição de cobrança via endpoint de pagamento Asaas.

Estado:

- Corrigido para novos pagamentos.
- Cobranças antigas já criadas não devem ser usadas como prova da lógica atual.

### 8.2 Status ficava como aguardando pagamento após confirmação

Problema:

- Webhooks de cobranças futuras/pendentes podiam rebaixar o status de um pedido já confirmado.

Correção:

- `webhook-service.ts` preserva status confirmado quando chega evento pendente posterior.

Status preservados:

```text
PAYMENT_CONFIRMED
PAYMENT_RECEIVED
SUBSCRIPTION_ACTIVE
```

Não são rebaixados para:

```text
AWAITING_PAYMENT
AWAITING_PIX
AWAITING_BOLETO
```

### 8.3 Diferença entre pagamento confirmado e saldo recebido

Problema:

- Usuário interpretava `Aguardando pagamento`/`Recebidas R$ 0,00` no Asaas como falha.

Correção conceitual:

- Foi separado no status interno:
  - aprovação do pagamento;
  - recebimento/liquidação do saldo.

Arquivo:

```text
src/app/pagamento/status/[id]/page.tsx
```

### 8.4 Tela de sucesso do Asaas exibe CNPJ do recebedor

Análise:

- Isso é tela do Asaas, não do site.
- O CNPJ/dados comerciais são do recebedor.

Decisão futura:

- Criar/redirecionar para uma tela própria de sucesso com dados do cliente e resumo do pedido.
- Em produção, configurar domínio de callback no Asaas.

---

## 9. Wizard Monte Seu Pacote

Arquivo:

```text
src/app/monte-seu-pacote/page.tsx
```

Estado V2:

- Wizard não é mais apenas visual.
- Ele cria pedidos internos.
- Ele envia o usuário para Asaas conforme método:
  - Pix.
  - Cartão de crédito.
  - Cartão parcelado.
  - Assinatura recorrente no cartão.

Catálogo:

```text
src/lib/package-catalog.ts
```

Pontos críticos:

- Preços ainda precisam de revisão final pelo usuário.
- A categoria `Desenvolvimento Web/Mobile` no catálogo ainda contém itens antigos como landing page/site/e-commerce, apesar da página comercial ter sido reposicionada para aplicações web/mobile. Isso precisa ser alinhado futuramente.
- Serviços com `unit: "mês"` são tratados como recorrentes.
- Pix aplica desconto no total avulso.

---

## 10. Blog Público

### 10.1 Rotas

```text
/blog
/blog/[slug]
```

Arquivos:

```text
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/components/blog/BlogContent.tsx
src/lib/blog/blog-repository.ts
src/lib/blog/blog-validation.ts
src/lib/blog/types.ts
```

### 10.2 Layout Atual

O Blog público tem:

- Hero institucional do Blog.
- Categorias.
- 1 post principal em destaque.
- Seção `Últimos artigos`.
- Cards menores para posts seguintes.
- Página individual com:
  - capa;
  - categoria;
  - título;
  - resumo;
  - data;
  - autor;
  - conteúdo;
  - hashtags;
  - CTA final;
  - posts relacionados.

### 10.3 Problemas de Layout Encontrados e Corrigidos

#### Card comum virava banner gigante

Problema:

- Com poucos posts, o segundo post ficava grande demais.

Correção:

- Criada seção `Últimos artigos`.
- Ajustado grid para evitar esticar um card único em largura total.
- Reduzido tamanho do título no destaque.

#### Imagens repetidas

Observação:

- Dois posts usando a mesma imagem deixam o Blog visualmente pobre.
- Não é bug de código.
- Recomendação: cada post deve ter capa própria.

---

## 11. Admin do Blog

### 11.1 Rota

```text
/admin/blog
```

Arquivos:

```text
src/app/admin/blog/page.tsx
src/app/admin/blog/BlogAdminClient.tsx
src/app/api/admin/blog/posts/route.ts
src/app/api/admin/blog/posts/[id]/route.ts
src/lib/admin/admin-auth.ts
```

### 11.2 Segurança

Admin usa token:

```text
BLOG_ADMIN_TOKEN
```

A API aceita:

```text
Authorization: Bearer <token>
```

ou header:

```text
x-admin-token
```

O token fica salvo no `localStorage` do navegador do usuário para facilitar uso do admin.

### 11.3 Campos do Admin

- Título.
- Slug.
- Resumo.
- Categoria.
- Status.
- Imagem de capa.
- Descrição da imagem.
- Hashtags.
- Conteúdo.
- Autor.
- SEO Title.
- SEO Description.

### 11.4 Correções Feitas no Admin

#### Hashtags quebravam layout

Problema:

- Campo aceitava texto longo como se fosse hashtag.
- A prévia renderizava textos gigantes como chips.

Correção:

- `normalizeTagsInput` separa por:
  - `#`
  - vírgula
  - ponto e vírgula
  - quebra de linha
- Remove `#`.
- Limita cada tag a 48 caracteres.
- Limita a 12 tags.
- CSS agora evita estouro visual.

#### Slug não ficava editável de forma prática

Problema:

- Slug era gerado pelo título e podia sobrescrever edição manual.

Correção:

- Título só gera slug se slug estiver vazio.
- Se usuário edita slug manualmente, ele não é mais sobrescrito.
- Botão `Gerar pelo título` foi adicionado.

#### Posts novos caíam como rascunho

Problema:

- `emptyForm.status` era `draft`.

Correção:

- Padrão de novo post alterado para:

```text
published
```

Ainda é possível mudar manualmente para rascunho.

#### Select de Categoria/Status ilegível

Problema:

- Dropdown aparecia com fundo branco e texto branco.

Correção:

- CSS com `color-scheme: dark`.
- Options com fundo escuro e texto claro.

---

## 12. Posts Existentes em Staging

No momento da V2, há pelo menos dois posts criados em staging:

1. `Por que imagens amadoras estão sabotando as vendas do seu negócio (e como reverter isso rapidamente)`
2. `Postar por postar não traz clientes: Como uma presença digital estratégica transforma seguidores em vendas reais`

Ambos foram publicados após correções de status.

Links públicos base:

```text
https://firmant-site-staging.geraldo1fduarte.workers.dev/blog
```

---

## 13. Páginas Institucionais Obrigatórias — Próximo Foco

O próximo bloco acordado com o usuário é criar páginas institucionais obrigatórias.

Prioridade mínima:

1. `/contato`
2. `/politica-privacidade`
3. `/termos-de-uso`
4. `/politica-de-reembolso`

### 13.1 `/contato`

Deve conter:

- Nome comercial.
- WhatsApp.
- E-mail.
- Cidade/UF ou área de atendimento.
- Horário de atendimento.
- Canal para solicitações LGPD.
- CTA para `Monte Seu Pacote`.

### 13.2 `/politica-privacidade`

Deve cobrir:

- Dados coletados no site.
- Dados coletados no wizard.
- Dados enviados ao Asaas.
- Cookies/analytics, se houver.
- Finalidade do tratamento.
- Compartilhamento com fornecedores.
- Direitos do titular pela LGPD.
- Canal de contato.

### 13.3 `/termos-de-uso`

Deve cobrir:

- Uso do site.
- Uso do Blog.
- Funcionamento do wizard.
- Limitações de informação/preço.
- Propriedade intelectual.
- Links externos.
- Responsabilidades do usuário.
- Limites de responsabilidade da FIRMANT.

### 13.4 `/politica-de-reembolso`

Deve cobrir:

- Formas de pagamento.
- Pix.
- Cartão.
- Parcelamento.
- Assinatura recorrente.
- Cancelamento.
- Reembolso.
- Prazos de início de serviço.
- Inadimplência.
- Uso do Asaas.

---

## 14. Estado Atual do Git / Atenção Crítica

`git status --short` no momento da V2 mostra muitas alterações modificadas e não versionadas.

Exemplo do estado:

```text
 M eslint.config.mjs
 M package-lock.json
 M package.json
 M scripts/ensure-opennext-shim.cjs
 M src/app/globals.css
 M src/app/monte-seu-pacote/page.tsx
 M src/app/page.tsx
 M wrangler.jsonc
?? .dev.vars.example
?? .env.example
?? anotacao
?? migrations/
?? scripts/blocked-production-deploy.cjs
?? src/app/admin/
?? src/app/api/
?? src/app/blog/
?? src/app/pagamento/
?? src/components/blog/
?? src/lib/
?? wrangler-dev.err.log
?? wrangler-dev.out.log
?? wrangler-tail.err.log
?? wrangler-tail.out.log
?? wrangler.staging.jsonc
```

Atenção:

- Não fazer `git reset --hard`.
- Não apagar alterações sem revisar.
- Arquivos de log `wrangler-*.log` provavelmente não devem ser commitados.
- Arquivo `anotacao` já existia localmente e deve ser tratado com cuidado.
- O volume de alterações deve ser consolidado em commits organizados antes de produção.

---

## 15. Arquivos Criados/Alterados Relevantes Desde a V1

### Pagamentos

```text
migrations/0001_payments.sql
src/lib/cloudflare-runtime.ts
src/lib/package-catalog.ts
src/lib/payments/*
src/app/api/payments/*
src/app/api/webhooks/asaas/route.ts
src/app/pagamento/*
```

### Blog/Admin

```text
migrations/0002_blog_posts.sql
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/admin/blog/page.tsx
src/app/admin/blog/BlogAdminClient.tsx
src/app/api/admin/blog/posts/route.ts
src/app/api/admin/blog/posts/[id]/route.ts
src/components/blog/BlogContent.tsx
src/lib/blog/*
src/lib/admin/admin-auth.ts
```

### Infra

```text
wrangler.staging.jsonc
wrangler.jsonc
scripts/blocked-production-deploy.cjs
.env.example
.dev.vars.example
```

---

## 16. Deploys Staging Recentes

Versões importantes publicadas em staging:

```text
80fe2f97-1893-4101-bf22-8aae5ac929c8
```

Primeiro deploy após Blog/Admin + migration/token.

```text
7fb23b41-2587-41ed-b8c9-705d84be3bbf
```

Correção do campo de hashtags.

```text
455720c8-4310-4d4d-b154-89990911f934
```

Correção do slug editável.

```text
204f79c9-8830-4590-a9bb-2d6f848f6567
```

Correção para novos posts nascerem publicados.

```text
47fb5967-658c-4534-89f1-d848d25916ee
```

Ajuste visual da listagem do Blog.

```text
fd8ffb54-59fa-4b71-bfb4-83568a34794a
```

Ajuste visual dos selects Categoria/Status no Admin.

---

## 17. Validações Técnicas Recentes

Comandos usados repetidamente e passando:

```powershell
npx tsc --noEmit --incremental false
npm run lint
npm run build
npm run deploy:staging
```

Observações:

- Em Windows, OpenNext mostra warnings de compatibilidade. Até aqui, não impediram deploy.
- Em alguns momentos, `.next` travou por permissão/arquivo em uso. Foi necessário limpar artefatos gerados.
- O warning `DEP0190` apareceu no deploy. Não bloqueou publicação.

---

## 18. Acertos Importantes

- Separação de staging e produção com `wrangler.staging.jsonc`.
- Bloqueio de deploy produção acidental.
- Pagamentos movidos para Asaas e D1.
- Webhook com idempotência.
- Preservação de status confirmado contra eventos pendentes posteriores.
- Blog usando D1 em vez de arquivo local, compatível com Cloudflare produção.
- Admin protegido por token.
- Blog público e admin já testados em staging.
- Ajustes visuais incrementais publicados e validados.

---

## 19. Erros / Problemas Enfrentados

### Comunicação e processo

- Houve confusão sobre comandos Cloudflare, terminal, migration e secret.
- Foi necessário esclarecer que código local e ativação Cloudflare são responsabilidades diferentes.
- Para retomar, explicar sempre:
  - o que foi alterado no código;
  - o que foi publicado;
  - o que o usuário precisa fazer, se houver.

### Pagamentos

- Descrição do Asaas não aparecia.
- Status era interpretado como pendente.
- Checkout Session não serviu bem para cartão/assinatura.
- Callback do Payment Link falhou no sandbox por domínio não configurado.

### Blog/Admin

- Hashtags quebravam layout.
- Slug não ficava editável de forma satisfatória.
- Posts novos nasciam como rascunho.
- Selects tinham menu ilegível.
- Card comum do Blog ficava grande demais.

Todos esses pontos tiveram correções aplicadas em staging.

---

## 20. Riscos Atuais

1. Produção ainda não está pronta.
2. `wrangler.jsonc` produção ainda aponta `ASAAS_API_BASE_URL` para sandbox.
3. D1 produção pode não ter migrations aplicadas.
4. Secrets produção podem não estar configurados.
5. Domínio/callback Asaas produção precisa ser validado.
6. Muitos arquivos estão modificados/não versionados.
7. Catálogo de preços precisa revisão final.
8. Catálogo `dev` ainda parece desalinhado com a página de Desenvolvimento.
9. Páginas institucionais obrigatórias ainda não existem.
10. Admin de Blog usa token simples, suficiente para staging/primeira versão, mas pode evoluir para login mais robusto.
11. Upload de imagem do Blog ainda não existe; o Admin usa URL/caminho de imagem.

---

## 21. Próximos Passos Recomendados

### Passo 1 — Criar páginas institucionais

Ordem:

1. `/contato`
2. `/politica-privacidade`
3. `/termos-de-uso`
4. `/politica-de-reembolso`

Manter mesmo padrão visual:

- fundo navy;
- tipografia Syne/Plus Jakarta;
- cards discretos;
- CTA para `Monte Seu Pacote`;
- Footer/Navbar já existentes.

### Passo 2 — Revisar Blog/Admin após mais testes

Verificar:

- criação de novo post;
- edição de slug;
- troca de status;
- imagem de capa;
- visual público com 3+ posts;
- responsividade mobile.

### Passo 3 — Revisar catálogo/preços

Arquivo:

```text
src/lib/package-catalog.ts
```

Pontos:

- preços finais;
- nomenclatura de desenvolvimento;
- recorrência;
- pacotes prontos;
- descontos Pix;
- parcelamento.

### Passo 4 — Consolidar Git

Antes de produção:

- revisar `git status`;
- remover logs que não devem entrar;
- confirmar migrations;
- commitar em blocos claros:
  - infra/staging;
  - pagamentos;
  - blog/admin;
  - páginas institucionais;
  - ajustes visuais.

### Passo 5 — Checklist produção

Antes de produção:

- trocar `ASAAS_API_BASE_URL` para produção;
- configurar secrets produção;
- aplicar migrations no D1 produção;
- configurar webhook Asaas produção;
- validar domínio/callback;
- testar pagamento real pequeno;
- validar `/blog`, `/admin/blog`, `/pagamento/status`;
- revisar LGPD/termos.

---

## 22. Comandos Úteis Atualizados

### Desenvolvimento

```powershell
npm run dev
```

### Validação

```powershell
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

### Deploy staging

```powershell
npm run deploy:staging
```

### Migration staging

```powershell
npx wrangler d1 migrations apply firmant-payments-staging --remote --config wrangler.staging.jsonc
```

### Secret staging

```powershell
npx wrangler secret put BLOG_ADMIN_TOKEN --config wrangler.staging.jsonc
```

### Consultar Blog no D1 staging

```powershell
npx wrangler d1 execute firmant-payments-staging --remote --config wrangler.staging.jsonc --command "SELECT id, slug, title, status, publishedAt, updatedAt FROM blog_posts ORDER BY updatedAt DESC LIMIT 10"
```

### Git

```powershell
git status --short
git log --oneline --decorate -10
```

---

## 23. Como Retomar em Nova Sessão

Ao abrir nova sessão, pedir:

```text
Leia o arquivo Atualização_Projeto_V2.md e continue a partir dele.
```

Depois seguir:

1. Conferir `git status --short`.
2. Não reverter alterações existentes.
3. Priorizar páginas institucionais.
4. Validar com TypeScript/lint/build.
5. Publicar somente em staging.
6. Produção apenas após checklist específico.

---

## 24. Decisão Atual do Projeto

Pagamentos estão encerrados em staging por enquanto.

Blog/Admin está funcional, mas ainda pode receber refinamentos visuais.

O próximo desenvolvimento planejado é:

```text
Criar páginas institucionais obrigatórias:
/contato
/politica-privacidade
/termos-de-uso
/politica-de-reembolso
```

Produção ainda não deve ser ativada.

