# Atualização do Projeto FIRMANT - V5

Documento de continuidade do projeto `firmant-site`.

Data de referência desta versão: 2026-05-23.

Este arquivo deve ser lido antes de qualquer nova alteração no projeto. Ele consolida o estado atual após a preparação e validação de produção, os problemas encontrados no ciclo, as correções aplicadas, novas funcionalidades, rotas relevantes e próximos pontos seguros.

---

## 1. Resumo Executivo V5

O ciclo V5 levou o projeto de staging funcional para produção operacional em `https://firmant.com.br`.

O site agora possui:

- produção ativa em Cloudflare Workers/OpenNext;
- checkout Asaas produção configurado;
- D1 produção com migrations aplicadas;
- webhook Asaas produção ativo e validado;
- Admin Comercial com sessão via cookie HttpOnly;
- Blog/admin protegido por token em `sessionStorage`;
- tracking GA4, Google Ads e Meta Pixel controlado por consentimento;
- favicon FIRMANT;
- Facebook adicionado aos canais oficiais;
- newsletter funcional em `/contato`;
- base de inscritos da newsletter salva em D1 e consultável pelo admin;
- pagamentos reais pequenos testados em produção.

Estado final deste ciclo:

```text
Produção: https://firmant.com.br
Staging: https://firmant-site-staging.geraldo1fduarte.workers.dev
Branch: main
Último commit: a960535 feat: adicionar newsletter e facebook
Último deploy produção validado: 32307013-5cad-4798-a0bf-7d7299979a79
Working tree final: limpo
```

---

## 2. Regra de Continuidade Importante

Pagamentos Asaas foram mexidos neste ciclo apenas para finalizar produção, corrigir testes reais e separar comportamentos por forma de pagamento.

A partir deste ponto, considerar o fluxo Asaas novamente sensível.

Antes de qualquer nova alteração em pagamento:

1. Ler este arquivo.
2. Conferir o histórico Git.
3. Evitar refatoração ampla.
4. Fazer mudança cirúrgica.
5. Testar em staging ou rota controlada antes de produção.

---

## 3. Ambientes Atuais

### 3.1 Produção

```text
URL pública: https://firmant.com.br
Worker: firmant-site
D1: firmant-payments
Binding: FIRMANT_DB
Asaas API base: https://api.asaas.com
```

Variáveis públicas/importantes de produção:

```text
APP_BASE_URL=https://firmant.com.br
ASAAS_API_BASE_URL=https://api.asaas.com
ASAAS_SUCCESS_URL=https://firmant.com.br/pagamento/sucesso
ASAAS_CANCEL_URL=https://firmant.com.br/pagamento/cancelado
ASAAS_EXPIRED_URL=https://firmant.com.br/pagamento/expirado
FIRMANT_ADMIN_USER=FIRMANT_ADMIN
GMAIL_SMTP_USER=ag.firmant@gmail.com
GA_MEASUREMENT_ID=G-Y390WCJ9SY
GOOGLE_ADS_ID=AW-7226193568
META_PIXEL_ID=1252030843677271
```

Secrets obrigatórios em produção:

```text
ASAAS_API_KEY
ASAAS_WEBHOOK_AUTH_TOKEN
FIRMANT_ADMIN_PASSWORD
BLOG_ADMIN_TOKEN
GMAIL_SMTP_APP_PASSWORD
```

Não registrar valores reais de secrets em arquivos versionados.

### 3.2 Staging

```text
URL: https://firmant-site-staging.geraldo1fduarte.workers.dev
Worker: firmant-site-staging
D1: firmant-payments-staging
Binding: FIRMANT_DB
Asaas API base staging: https://api-sandbox.asaas.com
```

Staging continua sendo ambiente oficial para validação visual antes de produção, quando possível.

---

## 4. Git e Versionamento do Ciclo

Commits principais deste ciclo:

```text
a960535 feat: adicionar newsletter e facebook
64506b2 feat: adicionar favicon firmant
192d15d fix: melhorar nome do boleto asaas
bd90f9a fix: criar boleto por link de pagamento asaas
1697c45 fix: separar checkouts por metodo no teste admin
9ff1638 feat: migrar checkout cartao e adicionar boleto
d5438fc fix: ajustar parcelamento minimo do asaas
cca6088 feat: adicionar teste de cartao avulso asaas
c9b4989 feat: sincronizar asaas pelo admin comercial
d3dd6f0 fix: adicionar sync manual de pagamentos asaas
fc49348 fix: simplificar abertura do checkout de teste
1ea7e72 fix: usar cep valido no checkout de teste
de67b86 fix: exigir dados completos para checkout asaas
279b0cb fix: ajustar checkout de teste para valor minimo asaas
bdea745 fix: preencher dados do cliente no checkout asaas
82d1ce7 fix: adicionar tela para checkout de teste
92e4709 feat: adicionar checkout admin de teste producao
aa3b1ce fix: ajustar base url do asaas producao
a6e1fd5 chore: configurar variaveis de producao
1cd5f81 fix: evitar inicializacao duplicada do meta pixel
e8f86d0 chore: configurar tracking no staging
```

GitHub:

```text
Repositório: https://github.com/Gduart/firmant-site
Branch: main
Último push confirmado: a960535
```

---

## 5. Atualizações Funcionais Realizadas

### 5.1 Botão Cookies x WhatsApp

Problema:

- O botão/flutuante de cookies ficava sobreposto ao botão do WhatsApp em mobile/desktop.

Correção:

- Ajuste visual publicado no ambiente correto.
- Separação entre o controle de cookies e o botão fixo do WhatsApp.
- Validação visual concluída pelo usuário.

Status:

```text
Concluído.
```

### 5.2 Admin Comercial

Estado atual:

- Admin Comercial usa sessão via cookie HttpOnly.
- Senha não fica persistida em `localStorage`.
- Logout encerra sessão.
- APIs administrativas aceitam cookie de sessão.
- Basic Auth foi preservado como fallback técnico.

Rotas principais:

```text
/admin/clientes
/admin/pedidos
/admin/contratos
/admin/newsletter
```

APIs relevantes:

```text
/api/admin/session
/api/admin/customers
/api/admin/orders
/api/admin/contracts
/api/admin/newsletter
```

### 5.3 Admin Blog

Estado atual:

- Admin Blog protegido por `BLOG_ADMIN_TOKEN`.
- Token no navegador usa `sessionStorage`, não `localStorage`.
- Ao fechar a aba/sessão, o token não permanece como antes.

Imagem de capa do Blog:

- Upload automático via Cloudflare Images foi analisado, mas não ficou como caminho escolhido neste ciclo porque o plano/ambiente Cloudflare exigia assinatura de Images.
- A solução atual é usar caminho/URL manual de imagem.
- Imagens locais públicas devem ficar em `public/blog/`.
- No campo do admin usar caminho como:

```text
/blog/nome-da-imagem.webp
```

Cuidados:

- O arquivo precisa existir dentro de `public/blog/`.
- Usar nomes simples, sem espaços, preferencialmente minúsculos e com hífen.
- Dimensão recomendada: `1600x900 px`.
- Formato recomendado: `WebP`.
- Tamanho recomendado: até `500 KB` quando possível.

### 5.4 Favicon FIRMANT

Problema:

- A aba do navegador mostrava ícone genérico.

Correção:

- Criado/adicionado favicon FIRMANT em SVG.
- Metadata atualizada para `shortcut icon`, `icon` e `apple-touch-icon`.

Arquivos:

```text
public/favicon.svg
src/app/layout.tsx
```

Status:

```text
Publicado em produção.
Commit: 64506b2 feat: adicionar favicon firmant
```

### 5.5 Facebook nos Canais Oficiais

Novo canal oficial:

```text
Facebook: https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR
```

Aplicado em:

```text
src/app/contato/ContatoClient.tsx
src/app/contato/page.tsx
src/components/Footer.tsx
src/app/politica-privacidade/page.tsx
src/app/termos-de-uso/page.tsx
src/app/politica-de-reembolso/page.tsx
```

Inclui:

- card/link na página de contato;
- rodapé;
- mini bloco institucional;
- schema `sameAs`;
- canais oficiais nas páginas legais.

Status:

```text
Publicado em produção.
Commit: a960535 feat: adicionar newsletter e facebook
```

### 5.6 Newsletter FIRMANT

Antes:

- A seção de newsletter em `/contato` estava visualmente desativada, com texto de "em breve".

Agora:

- A newsletter está funcional.
- O visitante informa:
  - nome;
  - e-mail.
- Botão:

```text
QUERO RECEBER NOVIDADES
```

Endpoint público:

```text
POST /api/newsletter
```

Segurança e qualidade:

- valida nome e e-mail;
- usa honeypot `company` contra bots simples;
- normaliza e-mail para minúsculas;
- usa `ON CONFLICT(email)` para evitar duplicidade;
- registra texto de consentimento;
- registra origem;
- registra data de inscrição e atualização.

Tabela D1:

```text
newsletter_subscribers
```

Migration:

```text
migrations/0005_newsletter_subscribers.sql
```

Campos:

```text
id
name
email
status
source
consent_text
subscribed_at
updated_at
```

Admin para consulta:

```text
/admin/newsletter
```

API admin:

```text
GET /api/admin/newsletter
```

Validação feita:

- POST real em produção retornou sucesso.
- Registro de teste foi removido depois.
- API admin sem sessão retorna `401`, como esperado.
- Página admin `/admin/newsletter` responde `200`.

Ponto futuro recomendado:

- exportar CSV;
- botão de descadastrar/inativar;
- filtro por status;
- integração futura com plataforma de e-mail marketing se necessário.

---

## 6. Tracking, Cookies e Consentimento

IDs configurados:

```text
GA_MEASUREMENT_ID=G-Y390WCJ9SY
GOOGLE_ADS_ID=AW-7226193568
META_PIXEL_ID=1252030843677271
```

Validações realizadas:

- Sem aceitar cookies, scripts de tracking não devem carregar.
- Ao aceitar analíticos/marketing, GA/Ads/Meta carregam.
- GA4 e Google Ads apareceram no Network corretamente.
- Meta Pixel também carregou após eliminar interferência local.

Problema encontrado:

- O navegador mostrava erro `499` em `connect.facebook.net/en_US/fbevents.js`.
- O script vinha com MIME incorreto `image/png`.

Conclusão:

- Não era erro do código.
- A causa foi interferência de antivírus/extensão, especialmente Kaspersky.
- Ao desativar/interromper essa interferência, o Meta Pixel carregou.

Correção no código:

- Evitada inicialização duplicada do Meta Pixel.

Commit relevante:

```text
1cd5f81 fix: evitar inicializacao duplicada do meta pixel
```

---

## 7. Produção Asaas

### 7.1 Configuração

Produção passou a usar:

```text
ASAAS_API_BASE_URL=https://api.asaas.com
```

Foram configurados secrets de produção, incluindo:

```text
ASAAS_API_KEY
ASAAS_WEBHOOK_AUTH_TOKEN
```

Observação:

- Chaves de produção e sandbox são diferentes.
- `ASAAS_API_KEY` de homologação/sandbox normalmente começa com padrão de homologação.
- `whsec_...` é token/secret de webhook, não API key.

### 7.2 D1 Produção

D1 produção:

```text
database_name: firmant-payments
binding: FIRMANT_DB
```

Migration newsletter aplicada com:

```powershell
npx wrangler d1 migrations apply firmant-payments --remote --config wrangler.jsonc
```

Observação importante:

- O comando sem `--config wrangler.jsonc` gerou erro de autorização/conta.
- Com `--config wrangler.jsonc`, a migration aplicou corretamente.

### 7.3 Webhook Asaas Produção

Webhook criado no painel Asaas produção:

```text
URL: https://firmant.com.br/api/webhooks/asaas
Versão API: V3
Tipo de envio: Sequencial
Autenticação: ASAAS_WEBHOOK_AUTH_TOKEN configurado como secret no Worker
```

Problema encontrado:

- O webhook ficou com fila pausada/interrompida depois de falhas iniciais.
- O painel indicou que filas podem ser pausadas após tentativas com erro.

Correção:

- Ajuste do token e da URL.
- Webhook reativado no painel Asaas.
- Novo teste Pix confirmou atualização automática no admin.

Status:

```text
Webhook produção ativo e validado.
```

---

## 8. Testes de Pagamento em Produção

### 8.1 Rota de Teste Temporária

Foi criada rota/tela controlada para checkout real pequeno:

```text
/api/admin/test-checkout
```

Objetivo:

- validar Asaas produção sem mexer no catálogo comercial real;
- gerar cobranças pequenas de teste;
- validar Pix, cartão e boleto;
- validar webhook e sync manual.

Importante:

- Essa rota é temporária.
- Deve ser removida/limpa antes de considerar a produção totalmente fechada.

### 8.2 Erros Encontrados e Correções

#### Erro 405 ao abrir rota no navegador

Problema:

- A rota inicialmente não aceitava o método usado pelo navegador.

Correção:

- Criada tela HTML/controlada para teste.

#### Valor R$ 1,00 inválido

Erro:

```text
O valor da cobrança (R$ 1,00) menos o valor do desconto (R$ 0,00) não pode ser menor que R$ 5,00.
```

Correção:

- Valor mínimo de teste ajustado para `R$ 5,00`.

#### Dados obrigatórios do cliente

Erros:

```text
cpfCnpj deve ser informado
phoneNumber é inválido
address deve ser informado
addressNumber deve ser informado
postalCode deve ser informado
province deve ser informado
```

Correção:

- Payload de teste passou a enviar dados completos do cliente.

#### CEP inválido

Erro:

```text
O campo postalCode é inválido.
```

Correção:

- CEP ajustado para formato/valor aceito pelo Asaas.

#### Cartão parcelado indevido para R$ 5,00

Erro:

```text
O valor informado (R$ 5,00) só pode ser parcelado em até 1 vezes.
```

Correção:

- Para teste de cartão avulso de R$ 5,00, usar 1 parcela.

#### Botões reaproveitando checkout errado

Problema:

- Botões diferentes abriam checkout já gerado de outro método.

Correção:

- Teste separado por método de pagamento.
- Cada botão gera/abre checkout coerente com o método.

Commit:

```text
1697c45 fix: separar checkouts por metodo no teste admin
```

#### Boleto com `checkoutSession`

Problema:

- Boleto não funcionou corretamente usando `checkoutSession`.
- Erro:

```text
O campo billingTypes é inválido.
```

Correção:

- Boleto passou a usar Payment Link do Asaas.
- Cartão avulso usa Checkout Session.
- Pix usa Checkout Session.

Commits:

```text
bd90f9a fix: criar boleto por link de pagamento asaas
192d15d fix: melhorar nome do boleto asaas
```

### 8.3 Resultado dos Testes

Pix:

```text
Validado em produção.
Webhook automático atualizou pedido no Admin Comercial.
Status visto no admin: PAYMENT_RECEIVED.
```

Cartão avulso:

```text
Validado em produção.
Webhook automático atualizou pedido no Admin Comercial.
Status visto no admin: PAYMENT_CONFIRMED.
```

Boleto:

```text
Geração/link de boleto corrigidos.
Layout do Asaas mostra dados do recebedor e resumo simples.
Pagamento efetivo de boleto não ficou registrado neste ciclo como confirmado.
```

Assinatura mensal:

```text
Fluxo existente já vinha do staging.
Neste ciclo, não registrar como teste final confirmado em produção.
Se for validar novamente, lembrar que assinatura cria cobrança recorrente real no cartão e precisa ser cancelada no Asaas depois.
```

### 8.4 Sync Manual Asaas

Foi criada funcionalidade de sincronização manual no Admin Comercial.

Objetivo:

- fallback caso webhook falhe, esteja pausado ou demore;
- conferir pedidos pendentes diretamente no Asaas;
- processar evento conforme status retornado.

Exemplo de retorno validado:

```json
{
  "checkedOrders": 2,
  "results": [
    {
      "paymentStatus": "RECEIVED",
      "event": "PAYMENT_RECEIVED",
      "synced": true
    },
    {
      "paymentStatus": "PENDING",
      "event": "PAYMENT_CREATED",
      "synced": true
    }
  ]
}
```

Status:

```text
Fluxo automático via webhook e fallback manual existem.
```

---

## 9. Limitações do Layout Asaas

Foi observado que páginas do Asaas podem exibir:

- nome/documento do recebedor;
- e-mail;
- telefone;
- endereço;
- layout azul padrão;
- resumo simples do pedido.

Análise:

- Isso é comportamento da página hospedada pelo Asaas.
- O site FIRMANT não controla integralmente esse layout.
- Checkout Session é mais discreto que alguns Payment Links, mas boleto precisou ficar em Payment Link.

Para controlar layout totalmente, seria necessário construir checkout próprio com API direta, o que aumenta escopo, segurança, compliance e manutenção.

Decisão atual:

```text
Manter checkout hospedado pelo Asaas por segurança e velocidade, aceitando limitações visuais.
```

---

## 10. Rotas Atuais Relevantes

### Públicas

```text
/
/gestao-redes-sociais
/edicao-video-ugc
/desenvolvimento
/monte-seu-pacote
/blog
/blog/[slug]
/contato
/politica-privacidade
/termos-de-uso
/politica-de-reembolso
/pagamento/sucesso
/pagamento/cancelado
/pagamento/expirado
/pagamento/status/[id]
```

### Admin

```text
/admin/clientes
/admin/clientes/[id]
/admin/pedidos
/admin/pedidos/[id]
/admin/contratos
/admin/newsletter
/admin/blog
```

### APIs

```text
/api/commercial/orders
/api/payments/checkout
/api/payments/subscription
/api/payments/status/[id]
/api/webhooks/asaas
/api/tracking/config
/api/newsletter
/api/admin/session
/api/admin/customers
/api/admin/orders
/api/admin/orders/[id]
/api/admin/orders/[id]/sync-asaas
/api/admin/contracts
/api/admin/contracts/[id]
/api/admin/contracts/[id]/pdf
/api/admin/contracts/[id]/send-email
/api/admin/newsletter
/api/admin/blog/posts
/api/admin/blog/posts/[id]
/api/admin/test-checkout
/api/admin/test-checkout/sync
```

Observação:

```text
/api/admin/test-checkout e /api/admin/test-checkout/sync são temporárias.
```

---

## 11. Banco de Dados e Migrations

Migrations existentes:

```text
0001_payments.sql
0002_blog_posts.sql
0003_commercial_admin.sql
0004_contract_email_delivery.sql
0005_newsletter_subscribers.sql
```

Nova tabela V5:

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  subscribed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Índices:

```text
idx_newsletter_subscribers_email
idx_newsletter_subscribers_status
idx_newsletter_subscribers_subscribed_at
```

---

## 12. Comandos Operacionais Importantes

### Lint

```powershell
npm run lint
```

### Build Next.js

```powershell
npm run build
```

Observação:

- No Windows, pode ocorrer `EPERM` ao apagar/regravar arquivos em `.next`.
- Quando isso ocorreu, o build rodou corretamente fora do sandbox.

### Aplicar migration D1 produção

```powershell
npx wrangler d1 migrations apply firmant-payments --remote --config wrangler.jsonc
```

### Build OpenNext produção

```powershell
node scripts\patch-opennext-cloudflare-sockets.cjs
node node_modules\@opennextjs\cloudflare\dist\cli\index.js build
node scripts\patch-opennext-worker-sockets.cjs
```

### Deploy produção

```powershell
node node_modules\@opennextjs\cloudflare\dist\cli\index.js deploy
```

Observação:

- O projeto no Windows exige os patches de sockets antes/depois do build OpenNext.
- O próprio OpenNext alerta que Windows não é ambiente ideal; ainda assim o deploy funcionou.

---

## 13. Validações Finais Feitas no V5

Comandos/checagens realizados:

```text
npm run lint: OK
npm run build: OK
OpenNext build: OK
Deploy produção: OK
GET https://firmant.com.br/contato: 200 OK
GET https://firmant.com.br/admin/newsletter: 200 OK
GET https://firmant.com.br/api/admin/newsletter sem sessão: 401 OK
POST https://firmant.com.br/api/newsletter: 200 OK
D1 newsletter_subscribers existe: OK
Lead de teste newsletter removido: OK
git push main: OK
```

Deploy produção final validado:

```text
Current Version ID: 32307013-5cad-4798-a0bf-7d7299979a79
```

---

## 14. Pontos Pendentes Recomendados Para Próximo Ciclo

### 14.1 Limpeza de rotas e dados temporários

Prioridade alta antes de considerar produção totalmente limpa:

```text
Remover ou proteger melhor /api/admin/test-checkout
Remover ou arquivar pedidos reais de teste, se desejado
Confirmar no Asaas se cobranças/assinaturas de teste foram canceladas/baixadas
```

### 14.2 Newsletter

Próximas melhorias naturais:

```text
Exportar CSV no admin
Botão para inativar/descadastrar lead
Filtro por status
Registro de origem mais granular
Integração futura com ferramenta de e-mail marketing
```

### 14.3 Blog

Pontos futuros:

```text
Upload real de capa via R2 ou Cloudflare Images, se houver plano/capacidade
Calendário editorial
Melhorias de SEO por post
Preview mais robusta
Validação automática de imagem existente
```

### 14.4 Asaas

Pontos futuros:

```text
Decidir se boleto será oferecido oficialmente no catálogo
Se oferecer boleto, validar pagamento real de boleto até status final
Validar assinatura mensal real em produção apenas se for necessário, lembrando de cancelar depois
Monitorar logs de webhooks nos primeiros pagamentos reais
```

### 14.5 Admin Comercial

Pontos futuros:

```text
Paginação real
Filtros mais completos
Exportação de pedidos/clientes/newsletter
Tela detalhada de contrato mais robusta
Ações em lote
Estados mais claros para contrato
```

### 14.6 Contratos e Autentique

Estado atual:

- PDF funciona.
- Envio por e-mail existe.
- Autentique segue como fluxo manual/preparado.

Próximos passos:

```text
Decidir se mantém manual ou integra API Autentique
Melhorar logo real no PDF
Avaliar armazenamento persistente de PDFs em R2
```

### 14.7 Testes automatizados

Ainda recomendado:

```text
E2E do wizard
E2E do pagamento até criação de pedido
E2E do admin session/login/logout
E2E newsletter
Teste do consentimento de cookies/tracking
```

---

## 15. Cuidados Para Retomada

Ao retomar o projeto:

1. Ler `Atualização_Projeto_V5.md`.
2. Rodar `git status --short`.
3. Confirmar se não há alterações locais pendentes.
4. Não alterar pagamentos sem plano específico.
5. Se mexer em produção, aplicar migrations antes de depender de tabelas novas.
6. Validar em staging quando possível.
7. Para produção, sempre registrar:
   - commit;
   - migration aplicada;
   - deploy version id;
   - URLs testadas;
   - resultado dos testes.

---

## 16. Estado Final do Ciclo V5

```text
Site produção: funcional
Pagamentos produção: Pix e cartão avulso validados
Webhook produção: funcional
Admin Comercial: funcional
Admin Blog: funcional
Newsletter: funcional e salva em D1
Facebook: adicionado aos canais oficiais
Favicon: adicionado
Tracking/cookies: configurado e validado
GitHub: atualizado
Working tree: limpo após commit/push
```

Último commit do ciclo:

```text
a960535 feat: adicionar newsletter e facebook
```

## 17. Atualização Comercial Home / CTAs / LP Vídeos UGC - 2026-06-14

Esta seção registra o ciclo de atualização comercial feito em 14/06/2026, incluindo ajustes aprovados, erro operacional encontrado, correção aplicada e procedimento correto para próximas edições.

### 17.1 Escopo executado

Foram aplicadas alterações cirúrgicas de copy, CTAs e organização visual/comercial, sem mexer em Asaas, pagamentos, banco de dados ou estrutura pesada do layout.

Arquivos alterados:

```text
src/app/page.tsx
src/components/Navbar.tsx
src/components/Footer.tsx
src/app/edicao-video-ugc/page.tsx
src/app/contato/ContatoClient.tsx
src/app/gestao-redes-sociais/page.tsx
src/app/desenvolvimento/page.tsx
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/layout.tsx
```

### 17.2 Home - Hero principal

Hero antigo substituído por uma promessa mais direta.

H1 aprovado:

```text
Sua marca mais profissional e posicionada no digital.
```

Observação visual:

- O trecho `posicionada no digital.` deve manter a classe `text-gradient`.
- Não deixar o H1 inteiro branco.
- Não alterar a identidade visual de marca, cores ou formatos estruturais sem aprovação.

Subheadline aprovada:

```text
Criamos vídeos, conteúdos, sites e soluções digitais com apoio de IA, estratégia e revisão humana — para sua marca aparecer melhor, vender com mais clareza e crescer no digital.
```

CTAs da Home:

```text
Primário: Montar meu pacote digital
Secundário: Falar com a FIRMANT no WhatsApp
```

### 17.3 Home - Serviços principais

Nova ordem aprovada:

```text
1. Vídeo & UGC com IA
2. Gestão de Redes Sociais
3. Desenvolvimento Web
```

Importante:

- Antes estava `Desenvolvimento Web/Mobile`.
- O card da Home deve exibir `Desenvolvimento Web`.
- A navegação superior também deve usar a nova ordem, com `Vídeos & UGC` antes de `Redes Sociais`.

Copies aprovadas dos cards:

```text
Vídeo & UGC com IA
Reels, Stories, Shorts e vídeos UGC com IA para sua marca aparecer com mais profissionalismo, velocidade e consistência.

Gestão de Redes Sociais
Planejamento, criação, aprovação e publicação de conteúdos com método, IA e revisão humana.

Desenvolvimento Web
Sites, landing pages e soluções digitais sob medida para transformar sua presença online em uma operação mais profissional.
```

### 17.4 Home - Sobre a FIRMANT

Métricas ajustadas:

```text
Nichos de atuação: 3
Tempo de resposta: 2 horas
```

### 17.5 CTAs padronizados

Padronização comercial aplicada nas páginas públicas relevantes:

```text
Monte Seu Pacote -> Montar meu pacote digital
Fale Conosco -> Falar com a FIRMANT no WhatsApp
Ver Serviços -> Ver soluções para minha empresa
Enviar -> Quero receber uma proposta
```

Observação:

- Formulários e áreas com contexto específico, como newsletter ou admin, não devem ser alterados automaticamente se o texto não for CTA comercial.
- Antes de trocar qualquer `Enviar`, verificar se é botão comercial ou botão técnico/administrativo.

### 17.6 WhatsApp com mensagem pronta

Mensagem geral aprovada para CTAs comerciais de WhatsApp:

```text
Olá, quero entender qual pacote da FIRMANT faz mais sentido para minha empresa.
```

URL codificada usada:

```text
https://wa.me/5511914912488?text=Ol%C3%A1%2C%20quero%20entender%20qual%20pacote%20da%20FIRMANT%20faz%20mais%20sentido%20para%20minha%20empresa.
```

### 17.7 LP Vídeos/UGC - `/edicao-video-ugc`

Hero atualizado para tráfego frio.

H1 aprovado:

```text
Vídeos curtos e UGC para sua marca vender melhor no digital.
```

Subheadline aprovada:

```text
A FIRMANT cria vídeos para Reels, Stories, Shorts, anúncios e ofertas com roteiro, edição, apoio de IA e revisão humana — sem sua empresa depender de uma produção pesada.
```

CTAs aprovados:

```text
Primário: Quero orçamento de vídeos pelo WhatsApp
Secundário: Ver pacotes de vídeo
```

Linha de confiança aprovada:

```text
Vídeos para redes sociais · UGC · Anúncios · Ofertas · Atendimento online para todo o Brasil
```

Implementação:

- O CTA secundário aponta para `#pacotes-video`.
- O `id="pacotes-video"` fica na seção de pacotes/preços, não no hero.

### 17.8 Metadados SEO atualizados

Após validação em produção, foi identificado que a frase antiga `Tecnologia invisível, resultados visíveis` ainda aparecia no HTML por causa dos metadados globais.

Correção aplicada em:

```text
src/app/layout.tsx
```

Novos metadados globais:

```text
description:
Vídeos, conteúdos, sites e soluções digitais com apoio de IA, estratégia e revisão humana para marcas que querem crescer no digital.

openGraph.description:
Vídeos, conteúdos, sites e soluções digitais com IA, estratégia e revisão humana para sua marca aparecer melhor no digital.
```

### 17.9 Erro operacional ocorrido neste ciclo

Erro:

```text
As alterações foram publicadas primeiro em staging, mas não tinham sido commitadas, enviadas para o GitHub e publicadas no worker de produção.
```

Impacto:

```text
O staging refletia os ajustes, mas o domínio oficial https://firmant.com.br continuava exibindo a versão antiga.
```

Causa:

```text
O fluxo parou em deploy:staging e validação de staging.
Faltou concluir o ciclo obrigatório:
1. git commit
2. git push origin main
3. build OpenNext produção
4. deploy OpenNext produção
5. validação no domínio oficial
```

Correção aplicada:

```text
Commit das alterações comerciais.
Push para origin/main.
Build/deploy no worker de produção firmant-site.
Validação final diretamente em https://firmant.com.br.
```

### 17.10 Dificuldades técnicas encontradas

No Windows, o OpenNext apresentou limitações já conhecidas:

```text
WARN OpenNext is not fully compatible with Windows.
```

Falhas encontradas:

```text
EPERM ao remover/acessar .open-next em execução anterior.
spawn EPERM ao iniciar subprocesso do esbuild dentro do build OpenNext.
```

Solução usada:

```text
Rodar comandos críticos de build/deploy com permissão elevada quando o sandbox/Windows bloquear subprocessos ou escrita em artefatos.
Não apagar .open-next sem confirmar o caminho absoluto dentro do workspace.
```

Também houve bloqueio ao preparar commit:

```text
fatal: Unable to create '.git/index.lock': Permission denied
```

Solução:

```text
Executar git add/git commit com permissão elevada quando houver bloqueio de escrita no índice Git.
```

### 17.11 Procedimento correto para próximas atualizações

Antes de editar:

```text
git status --short --branch
Ler Atualização_Projeto_V5.md
Confirmar se a alteração envolve apenas conteúdo/layout ou se toca pagamentos/admin/banco
```

Durante a edição:

```text
Fazer alterações cirúrgicas nos arquivos necessários
Não alterar Asaas/pagamentos se o pedido for apenas visual/textual
Manter identidade visual da FIRMANT: cores, gradientes e estrutura visual base
Validar textos exatos aprovados pelo cliente
```

Validação local mínima:

```text
npm run lint
npm run build
```

Quando houver staging:

```text
npm run deploy:staging
Validar URL staging:
https://firmant-site-staging.geraldo1fduarte.workers.dev
```

Produção obrigatória após aprovação:

```text
git status --short --branch
git add <arquivos alterados>
git commit -m "<mensagem clara>"
git push origin main
node scripts\patch-opennext-cloudflare-sockets.cjs
node node_modules\@opennextjs\cloudflare\dist\cli\index.js build
node scripts\patch-opennext-worker-sockets.cjs
node node_modules\@opennextjs\cloudflare\dist\cli\index.js deploy
```

Importante:

```text
npm run deploy:staging publica apenas staging.
npm run deploy é bloqueado de propósito por scripts/blocked-production-deploy.cjs.
Para produção, usar os comandos OpenNext diretos acima.
```

Validação final obrigatória em produção:

```text
https://firmant.com.br/
https://firmant.com.br/edicao-video-ugc
https://firmant.com.br/contato
```

Usar cache bust quando necessário:

```text
https://firmant.com.br/?deploy-check=<version-id-ou-hash>
```

Sempre registrar ao final:

```text
Commits criados
Push para origin/main
Version ID do Cloudflare
URLs testadas
Resultado dos testes
Git status final
```

### 17.12 Commits e deploys deste ciclo

Commits:

```text
3d44495 feat: atualizar copy comercial do site
02adf7f fix: atualizar metadados comerciais
```

Deploys:

```text
Staging validado:
24407621-cad0-4a4d-8104-accdfe7b9092

Produção intermediária:
6714fe93-ed52-4be7-8f90-489cb7f07acc

Produção final validada:
0105a9fb-bd90-4d25-9e78-60e9124ea5e1
```

Validações finais em produção:

```text
Home: 200
Novo H1: OK
Subheadline nova: OK
CTA Montar meu pacote digital: OK
CTA WhatsApp com mensagem pronta: OK
Ordem Vídeo & UGC antes de Redes Sociais: OK
Desenvolvimento Web: OK
Frase antiga Tecnologia invisível removida do HTML/SEO: OK

/edicao-video-ugc: 200
Novo H1: OK
CTA Quero orçamento de vídeos pelo WhatsApp: OK
CTA Ver pacotes de vídeo: OK
Linha de confiança: OK

Git final após deploy:
main sincronizada com origin/main
working tree limpo
```

---

## 18. Propostas e Portal de Aprovação - 2026-08-30

Novo fluxo comercial publicado:

```text
Briefing público por link exclusivo
Anexos privados JPG/PNG no R2, até 10 MB cada e expiração em sete dias
Admin/Aprovação Geral
Criação, versionamento, PDF, envio, aceite e recusa de propostas
Etapas de pagamento integradas ao fluxo Asaas existente
Portal privado de aprovação de imagem, carrossel e vídeo MP4
Comentários gerais, por slide e por timecode
Registro de aceite, revisão, aprovação e auditoria
```

Novas migrations:

```text
0006_commercial_workflow.sql
0007_briefing_billing_address.sql
```

Recursos Cloudflare:

```text
R2 staging: firmant-private-assets-staging
R2 produção: firmant-private-assets
Lifecycle: prefixo briefings/ expira após sete dias
Binding: PRIVATE_ASSETS
Secret: FIRMANT_ADMIN_SESSION_SECRET
```

Validações em staging:

```text
Briefing: rascunho, upload, leitura privada, exclusão e envio final: OK
Proposta: leitura pública e aceite: OK
Asaas Sandbox Pix: checkout criado em sandbox.asaas.com: OK
Idempotência do checkout: mesmo pedido reutilizado: OK
Projeto após aceite: AWAITING_DEPOSIT: OK
Portal de conteúdo: mídia privada com range HTTP: OK
Solicitação de revisão e feedback: OK
Aprovação formal por versão: OK
Dados temporários D1/R2 removidos: OK
```

Correções encontradas durante a homologação Asaas:

```text
items[].name limitado a 30 caracteres conforme validação do Asaas
Briefing passou a coletar número, complemento, bairro e CEP
Cadastro parcial não é enviado ao checkout para briefings antigos
```

Produção:

```text
Commit funcional: da3f238 feat: adicionar propostas e portal de aprovacao
Push: origin/main confirmado
Migrations 0006 e 0007: aplicadas
Migrations pendentes: nenhuma
Bucket e lifecycle de produção: confirmados
Deploy staging final: 4213adff-92e3-4294-86cd-72ed9bf944d6
Deploy produção: 04c49c21-934c-4d89-a99c-c2abe20206a1
```

Smoke tests HTTP de produção:

```text
/: 200
/admin/aprovacao-geral: 200, no-store e noindex
/admin/propostas: 200, no-store e noindex
/admin/conteudos: 200, no-store e noindex
/api/admin/briefings sem sessão: 401
Tokens públicos inválidos de briefing, proposta e review: 404
X-Frame-Options: DENY
```

Observação:

```text
Não foi criada cobrança real de teste em produção. O checkout foi validado no
Asaas Sandbox; a produção recebeu apenas smoke tests HTTP sem mutação de dados.
```

---

## 19. Hotfix de abertura do briefing - 2026-08-30

O botão `Abrir` da Aprovação Geral deixou de navegar para a rota SSR dinâmica
`/admin/solicitacoes/[id]`. Os detalhes agora são carregados pela API e exibidos
dentro da própria página estática `/admin/aprovacao-geral`, evitando uma nova
renderização do Next.js/OpenNext no Worker.

Validações:

```text
Lint: OK
Build Next.js 16.2.1: OK
TypeScript: OK
/admin/aprovacao-geral confirmada como página estática: OK
Página em produção, 10 requisições consecutivas: 10 x HTTP 200
Homepage, contato e Admin Clientes: HTTP 200
API administrativa sem sessão: HTTP 401 esperado
Deploy produção: cd55bdba-4612-4686-ae95-beaa39b5491f
```

---

## 20. Integração visual entre proposta e aprovação de conteúdo - 2026-08-30

A edição da proposta passou a exibir uma seção própria chamada `Mídias e
aprovação do cliente`. Em propostas ainda não aceitas, a seção explica os
quatro passos do fluxo e por que o projeto de conteúdo ainda não existe. Após
o aceite, a API da proposta retorna o projeto criado e a seção oferece acesso
direto ao upload de imagens, carrosséis e vídeos e à geração do link privado de
revisão do cliente.

```text
Proposta -> publicação -> aceite do cliente -> projeto automático
Projeto -> upload da prévia -> gerar link de revisão -> aprovação do cliente
```

Validações:

```text
Lint: OK
Build Next.js e TypeScript: OK
Proposta FIR-2026-1D2F3A3C: DRAFT, sem projeto e sem mídia (estado esperado)
Deploy produção: e964a948-db26-4d6c-8329-6e143c7c60e5
```

---

## 21. Simplificação da página principal — revisão local em 2026-10-27

Status: implementação local, aguardando aprovação visual e autorização de publicação.

- Primeira tela com título e descrição curtos, CTA principal e secundário discreto; indicação de rolagem removida.
- Tipografia, margens, serviços e espaçamentos ajustados para celular.
- Onze cards substituídos por três benefícios e uma condição comercial única. Detalhes e cinco perguntas operacionais transferidos para a página de gestão de redes sociais.
- Home com cinco perguntas de contratação; apresentação da abordagem resumida em três etapas.
- WhatsApp flutuante da home aparece após a saída dos botões iniciais; acesso às preferências de cookies preservado.
- Vídeo de fundo, overlays, mídias, cursor personalizado e rolagem global preservados.

Verificação visual realizada em desktop de 1440 px e celulares de 390 e 320 px, incluindo FAQ, modal, link para os detalhes do serviço e exibição condicional do WhatsApp. Lint aprovado. Capturas de revisão salvas em `C:\Users\gduar\.codex\visualizations\2026\10\25\01a1710c-eef9-7721-b9ab-c5d106b999c6`.

Build final confirmado em 2026-10-27: compilação, TypeScript e geração das 39 páginas concluídos com código de saída 0. `git diff --check` aprovado.

Nenhum commit, push ou deploy realizado nesta etapa. Publicação depende da aprovação explícita do usuário.

### Continuidade — parte 2

Subfrase da home ampliada para incluir aplicações web. Menu móvel com indicação de estado expandido, identificação da navegação, foco inicial no primeiro link, ciclo de Tab incluindo o botão de fechamento, Escape, retorno de foco e destaque visual de foco. O bloqueio de rolagem restaura o valor anterior ao fechar.

Refatoração de JavaScript adiada. Após aprovação, os indicadores “3 nichos de atuação” e “2 horas” foram substituídos por “Soluções integradas — Vídeos, redes sociais, sites e aplicações web.” e “Sob medida — Escopo definido conforme os objetivos da sua marca.”. Mantidos os cards de IA e revisão humana, as cores, animações e disposição em quatro cards; tipografia dos dois novos textos adaptada a títulos e descrições. Efeitos premium preservados. A verificação pendente do menu foi concluída em 2026-10-28: foco inicial no primeiro link, Shift+Tab para o fechamento, Escape e retorno ao botão confirmados no navegador. Conferência visual específica dos novos cards da home ainda pendente.

## 22. Vitrine de Redes Sociais — 2026-10-28

Bloco “Investimento” substituído por vitrine demonstrativa da marca fictícia AURIA, com publicação, carrossel de três páginas, composição tipográfica e vídeo vertical fornecido pelo usuário. Identificação de demonstração com IA visível, sem alegação de cliente real. Imagens grandes lado a lado com o vídeo no desktop; formatos empilhados no celular. Valores acessíveis no montador; CTA de proposta abre WhatsApp com mensagem contextual. A lista “O que está incluído” foi preservada em “O que fazemos”.

Vídeo H.264/AAC de 1080 × 1920 px, 7,979 segundos e 9.179.943 bytes: reprodução por clique, capa estática, controles nativos e `preload="none"`. Reprodução completa confirmada sem erro. Carrossel testado nas três páginas, com retorno e ativação por teclado. Dimensões próximas de 640 × 800 px e 480 × 853 px no desktop de 1440 px. Layout conferido em 390 e 320 px. Corrigido overflow preexistente do título principal com fonte mínima e margens responsivas locais.

Lint global e build da integração aprovados, incluindo TypeScript e geração das 39 páginas. Correção responsiva subsequente conferida no navegador e submetida a lint dos componentes alterados. Nenhuma mudança nos componentes de cursor, Lenis, layout ou CSS global e nas mídias do fundo da home. Sem commit, push ou deploy; ajustes acumulados para commit único ao final.

### Substituição do vídeo AURIA — 2026-10-29

Usuário aprovou e forneceu `Woman_opening_curtain_in_livingroom_efe13953_1080p.mp4`. Arquivo copiado para `public/videos/redes-sociais/auria/auria-apresentacao-v2.mp4` (6.659.690 bytes, H.264/AAC, 1080 × 1920 px, 7,979 s), com hash conferido e decodificação completa sem erros. Player e links alternativos atualizados para a V2; capa extraída do novo vídeo em `public/images/redes-sociais/auria/video-capa-v2.webp`. O antigo `auria-apresentacao.mp4` foi excluído do projeto conforme solicitação explícita do usuário. Arquivo original em Downloads preservado.

## 23. Desenvolvimento Web e briefing por serviço — 2026-11-01

Implementação local autorizada após alinhamento: quatro cards grandes substituem o catálogo anterior. Serviços: Automação de processos; Automação + 1 agente de IA no Telegram; Sistemas e aplicações web sob medida; Landing Page de Conversão + Assistente IA no Telegram + Mini CRM. Cada card abre uma página própria com descrição, recursos, exemplos por nicho e briefing específico ao final. Mantidas todas as categorias enviadas; removida a tabela de nichos duplicada no material do agente Telegram. Textos absolutos de resultado foram ajustados para possibilidades de entrega definidas no escopo.

Removidos os dois CTAs do hero de Desenvolvimento. Valores fixos substituídos por “Como definimos seu projeto”, explicando objetivo, integrações, etapas e continuidade. Mudanças limitadas a esta área; montador global e efeitos premium preservados.

O briefing coleta contato, empresa, segmento, objetivo, cinco perguntas próprias do serviço, prazo e investimento opcionais e ciência da privacidade. Validação no navegador e servidor, honeypot, corpo limitado, proteção de origem e assinatura HMAC entre servidores. A tela não afirma recebimento sem confirmação do Diagnóstico; em falha preserva campos e direciona foco à mensagem.

Integração implementada também no checkout local `C:/Projetos_Python/firmant-landing-v2`: novo endpoint autenticado reutiliza a transação de lead/outbox, jornada `complete`, origem e serviço identificados e descrição completa no painel existente. Workflow de e-mail local preserva até 16.000 caracteres dos briefings e mantém o alerta para `ag.firmant@gmail.com`. Nenhuma migração ou alteração do banco foi necessária. Pacote reproduzível e instruções de ativação/reversão em `integration/README.md`; sem segredos no código.

Validações concluídas:

- Site: lint global, cinco testes de catálogo/validação e build com TypeScript aprovados; 44 páginas geradas, incluindo os quatro serviços.
- Diagnóstico: lint, typecheck, 64 testes e build aprovados. Após correção de reaplicação do instalador, quatro testes específicos de integração executados novamente e aprovados.
- Navegador: quatro páginas e perguntas específicas conferidas; desktop, 390 e 320 px sem overflow lateral, navegação por card e retorno, foco de teclado e erro de configuração com dados mantidos no formulário.
- API local: origem externa → 403; corpo excessivo → 413; dados incompletos → 400. Configuração ausente não retorna sucesso.

Pendente para ativação: configurar o segredo compartilhado e a URL entre servidores, publicar receptor/site e aplicar a mudança no workflow ativo após autorização; então confirmar um briefing real no painel e o e-mail recebido. Não houve envio de lead/e-mail, acesso ao banco ou mudança no n8n de produção. Nenhum commit, push ou deploy; alterações anteriores preservadas para a consolidação final.

## 24. Orçamento com IA dentro do lead — 2026-11-01

Após autorização do usuário, implementada a central de orçamento no detalhe do lead do Diagnóstico. A seção permite gerar rascunho com `gpt-6-luna`, revisar todos os textos, quantidades, preços, cronograma, datas e condições, salvar novas versões e aprovar explicitamente antes de gerar/baixar PDF, enviar PDF anexo por e-mail ou criar link Asaas.

A IA recebe somente serviço e briefing preenchidos, descartando os campos sem resposta. Histórico interno e contatos não são enviados ao agente; a pesquisa web opcional usa apenas categoria genérica do serviço. Modelo confirmado na documentação oficial. A estimativa usa o valor-hora e a disponibilidade informados pelo administrador; não há tabela de preço inventada. Tecnologias, segurança, privacidade, hospedagem, suporte, propriedade, aceite, exclusões e lacunas são campos de revisão próprios.

Conexão autenticada entre Diagnóstico e site por HMAC, com sessão do Admin validada antes da consulta do lead no PostgreSQL. Identidade do cliente vem do banco, não do navegador. O site mantém as versões comerciais no D1 por meio da nova migração `0011_lead_quotes.sql`, ainda não aplicada a nenhum banco real. Aprovação de uma versão não se transfere para a seguinte.

Reutilizados checkout, pedidos, webhook Asaas, SMTP Gmail e primitivas de PDF existentes. PDF específico de orçamento técnico com A4, navy/dourado, acentos preservados e quebra de textos/URLs longos; condições fixas de audiovisual do PDF anterior não são copiadas. Pagamento com Pix, cartão à vista ou até 12 parcelas, valor manual sem acréscimo automático de taxas, identificação para valores parciais e consideração dos recebimentos já confirmados. Reservas persistidas evitam repetição da mesma cobrança; resultados incertos exigem conferência. Histórico dos links preservado. WhatsApp abre mensagem para envio manual.

Validação local: regras de preenchimento, cálculos, datas, aprovação, HMAC e tamanho de corpo; chamadas OpenAI simuladas; migração e reservas testadas em SQLite em memória, com concorrência, timeout, pagamento confirmado, expiração, entrada/saldo e limites do total. Interface testada com dados fictícios: geração simulada, edição de preço, salvamento, aprovação, download real do PDF e bloqueio após nova edição. Celular de 390 px sem overflow e navegação por teclado conferidos. PDF de teste renderizado e inspecionado nas três páginas. Harness temporário removido.

O Diagnóstico passou por lint, TypeScript, 64 testes e build incluindo o novo endpoint administrativo; ajustes posteriores do componente passaram por lint e TypeScript direcionados. O site passou por lint global e 20 testes; após ajuste de entrada/saldo, os seis testes financeiros foram executados e aprovados. Build final do site aprovado, incluindo TypeScript, o novo endpoint e a geração das 45 páginas. Conferência de whitespace aprovada.

Pacote local reproduzível em `integration/apply-commercial.cjs`; instruções de uso, configuração, homologação e reversão em `integration/COMMERCIAL.md`. Pendente: configurar segredos e chave OpenAI nos servidores, aplicar a migração D1 autorizada, publicar os dois aplicativos e homologar geração real, e-mail recebido, checkout sandbox e webhook. Sem chamadas pagas à OpenAI, envios reais de e-mail, cobranças reais, migrações de produção, commit, push ou deploy. Vídeo de fundo, cursor e demais alterações aprovadas preservados.

## 25. Chave OpenAI e Admin local utilizável — 2026-11-01

Usuário inseriu diretamente sua chave em `.env.local`, sem enviá-la no chat. Arquivo confirmado como ignorado pelo Git. A chave foi validada com HTTP 200 para `gpt-6-luna`; depois, uma geração real foi executada pelo botão do editor, com pesquisa técnica habilitada e briefing exclusivamente fictício. Rascunho V1 salvo no D1 local e recuperado após recarregar a tela. Nenhuma chave ou cookie foi registrado nos logs de verificação.

Admin real do Diagnóstico iniciado em `http://127.0.0.1:3001/admin/leads`, com autenticação e lead de demonstração persistido. Login conferido no navegador. Detalhe de teste: `/admin/leads/a10c0001-1000-4000-8000-000000000001`. Faixa no Admin identifica a prévia local e a ausência de leads de produção. Credenciais de demonstração ficam em `.local-preview/ACESSO.txt`, sem a chave OpenAI.

Ambiente isolado: PostgreSQL WASM/PGlite em loopback 54329 e D1 local em `.local-preview/cloudflare/v3`. As 11 migrações do site foram aplicadas apenas nesse D1 de teste. Segredos de conexão gerados localmente; site e Diagnóstico conectados por HMAC. O site continua na porta 3000. Processos iniciados em segundo plano para manter os links disponíveis. Banco local com comando de parada limpa, após correção de marcador remanescente de encerramento de teste.

Scripts de preparação, banco, validação e instruções em `scripts/local-leads/`. Dependências do banco instaladas somente na pasta privada da prévia, sem alterar dependências de produção. `.local-preview/` excluída do Git, lint e TypeScript. Proxy Cloudflare de desenvolvimento aceita configuração/persistência locais explícitas e desativa bindings remotos nesse modo. Cadeia de certificados do Windows usada, sem desativar TLS.

Validações: lint dos scripts e da configuração; acesso ao modelo; login; listagem; consulta comercial; geração real e persistência após recarregamento. E-mail e Asaas não ativados com credenciais reais. Ambiente publicado permanece inalterado. Sem commit, push ou deploy. Efeitos premium e alterações anteriores preservados.

## 26. Gmail, PDF profissional, pagamento 50/50 e formulário enxuto — 2026-11-01

Aplicadas localmente as mudanças que antes estavam somente analisadas. No detalhe do lead, os links mailto foram substituídos por composição no Gmail com a conta ag.firmant@gmail.com. O botão de envio automático identifica explicitamente a geração e o anexo do PDF e fica indisponível quando faltam credenciais. A ausência de chave Asaas é verificada antes de criar pedido/reserva; a interface mostra a pendência e o ambiente. Nenhum e-mail ou cobrança real foi enviado.

PDF comercial com cabeçalho navy/dourado compacto, referência, data brasileira, validade e destaque de 50% de sinal + 50% na entrega em todas as páginas. Quadros financeiros na abertura e no investimento mostram total, entrada e saldo em reais, Pix e cartão. Remove o prefixo de rascunho do título no documento e a lista de URLs técnicas. Fontes permanecem preservadas no orçamento e recolhidas para consulta interna no Admin, sem vários campos ocupando espaço.

Política 50/50 compartilhada entre geração, salvamento, tela e PDF. Cobrança por etapa calculada em centavos; saldo exige confirmação de entrega e entrada recebida. A soma permanece exata com centavos ímpares. SMTP no desenvolvimento local usa TLS Node com verificação de certificado; o transporte Cloudflare de produção permanece o existente.

Prévia aplicada no checkout local do Diagnóstico, porta 3001, no lead fictício a10c0001-1000-4000-8000-000000000001. Download realizado pelo botão real e seis páginas A4 do PDF renderizadas e conferidas. Fontes recolhidas e ausência de campos de URL verificadas no navegador. Suite do site: 23 testes; Diagnóstico: 64 testes. Lint e TypeScript aprovados; builds isolados para preservar os servidores de desenvolvimento. Credenciais de Gmail e Asaas permanecem pendentes. Sem commit, push ou deploy; alterações anteriores e arquivo de relatório do usuário preservados.

## 27. Preparação da autenticação Gmail — 2026-11-01

Verificada a ausência da senha de app nas configurações locais, sem revelar valores privados. Preparados GMAIL_SMTP_USER=ag.firmant@gmail.com e o campo vazio GMAIL_SMTP_APP_PASSWORD no .env.local ignorado pelo Git; chave OpenAI e demais configurações preservadas. Solicitado ao usuário salvar a senha de app diretamente no arquivo privado, nunca no chat.

SMTP recebeu verificação de autenticação sem envio de mensagem e tratamento de respostas fragmentadas/multilinha, evitando interpretar um código antes do fim da linha. Script scripts/local-leads/check-gmail.ts autentica e encerra sem destinatário e sem imprimir credenciais. Testes validam autenticação isolada, senha recusada e integridade do PDF anexo em mensagem MIME. Suite completa: 26 testes aprovados. Ativação real e teste de autenticação ainda dependem da senha de app da conta Google; nenhum e-mail foi enviado nesta etapa.

## 28. Gmail autenticado e prévia recuperada — 2026-11-01

Após o usuário salvar a senha de app diretamente no arquivo privado, a tentativa local de TLS na porta 465 foi rejeitada antes da autenticação. O certificado apresentado era emitido por Norton Web/Mail Shield Untrusted Root, sem cadeia confiável. Não foi desabilitada a validação de certificados nem alterado o antivírus. A conexão oficial STARTTLS na porta 587 passou pela validação de certificado; implementado esse transporte somente quando NODE_ENV=development e GMAIL_SMTP_PORT=587. A autenticação real na conta ag.firmant@gmail.com foi confirmada sem enviar mensagens. Senha não exibida nem copiada para documentação. Produção mantém o transporte Cloudflare existente na porta 465.

Servidores locais encontrados parados e reiniciados em segundo plano. O diretório original postgres-session recusava a criação do arquivo de bloqueio; criada cópia integral postgres-recovery, recuperada e encerrada corretamente antes da abertura do servidor. Original preservado. O settings.json privado seleciona databaseDirectory=postgres-recovery; helper valida o nome e normaliza o caminho Windows. Banco local disponível em 54329, site em 3000 e Admin em 3001.

Verificação no navegador: detalhe do lead fictício recuperado, orçamento aprovado V4 preservado, download do PDF disponível e botão Gerar PDF e enviar por e-mail habilitado. Nenhuma mensagem enviada; o endereço do lead de demonstração continua fictício. Três testes SMTP aprovados; lint dos arquivos alterados aprovado. Sem commit, push, deploy ou mudanças no banco de produção.

## 29. Correção efetiva do envio pelo painel — 2026-11-01

Reproduzido o erro no próprio endpoint autenticado do Admin. O teste isolado de autenticação funcionava, porém o servidor Next.js falhava antes do envio com Cannot read properties of undefined (reading toWeb). Causa identificada: importação dinâmica de node:stream no empacotamento do Next retornava Duplex pelo módulo default. Corrigida a resolução para streamModule.default ?? streamModule nos dois transportes locais. Verificação dentro do servidor passou; em seguida o usuário autorizou explicitamente um único e-mail de teste para ag.firmant@gmail.com, usando apenas o orçamento fictício V4.

Envio real efetuado pela rota administrativa, com geração e anexo do PDF: HTTP 200, Enviado para ag.firmant@gmail.com. Histórico persistido confirma o envio às 20:44 de 01/11/2026 (America/Sao_Paulo). Tentativa anterior falhou antes da mensagem e foi classificada como não enviada; não houve repetição após o sucesso. Não foi confirmada a caixa de entrada pelo conector de leitura, indisponível nesta sessão; a confirmação obtida foi a aceitação SMTP e o registro do servidor.

Também corrigida a experiência de teste: destinatário do envio é editável, endereços fictícios como cliente@example.invalid são bloqueados antes do SMTP, e o botão é habilitado após um destino válido. Os dados originais do lead e o orçamento aprovado são preservados. E-mail do destinatário passa por validação no servidor; falhas por autenticação, remetente, destinatário e confirmação são diferenciadas. Só falhas comprovadamente anteriores à aceitação liberam nova tentativa; resultado incerto preserva proteção contra duplicidade. Queda durante QUIT depois do 250 não desfaz a confirmação.

Testes do site: 33 aprovados, incluindo anexo íntegro, respostas fragmentadas, recusa de destinatário, interrupção após DATA, sessão STARTTLS, queda no QUIT e endereço fictício. Diagnóstico: 64 testes e lint aprovados. Builds e TypeScript dos dois aplicativos aprovados em pastas isoladas. Prévia atualizada e validação do formulário no navegador. Sem commit, push ou deploy.

## 30. Sandbox Asaas conectado e checkout de entrada criado — 2026-11-01

Usuário recuperou o acesso ao Sandbox e salvou a chave na configuração privada. Consulta autenticada de leitura retornou HTTP 200. Prefixo da chave preservado no dotenv; nenhum segredo exposto. Prévia local conferida com site, conexão comercial, login e lead fictício acessíveis. Nenhuma alteração de produção, commit ou push.

Configurado webhook exclusivo de homologação por relay temporário restrito a POST autenticado e retornos fixos. Admin retorna 404 pelo túnel, requisição sem token retorna 401. Executável Cloudflare oficial com assinatura válida na pasta privada; conexão QUIC com validação TLS. Configuração e IDs privados em .local-preview/asaas-homologation.json. ASAAS_CALLBACK_BASE_URL opcional permite retorno sem alterar APP_BASE_URL.

Teste real identificou limite de 30 caracteres no nome do item Asaas; corrigido, preservando título completo na descrição e orçamento original. Recusa explícita do provedor agora informa a causa e encerra o pedido local como FAILED. Resultado incerto mantém proteção contra duplicidade. Histórico preservado, incluindo reconciliação auditada da tentativa legada sem credencial e sem ID ou link remoto. Interface atualizada no Diagnóstico; pedidos encerrados não podem ser compartilhados.

Checkout Sandbox da V4 criado com entrada de R$ 4.800,00 (50% de R$ 9.600,00), Pix e cartão à vista ou até seis parcelas. Página conferida no navegador; Admin mostra link e não mostra mais aviso de chave ausente. CHECKOUT_CREATED enviado pelo Asaas foi recebido com HTTP 200 e persistido como PROCESSED. Checkout mantido aberto para o teste do usuário. Pagamento não foi concluído: CHECKOUT_PAID e geração do saldo após entrega continuam pendentes. Não tratar o fluxo inteiro como homologado.

Validação: 37 testes do site, 64 do Diagnóstico e 12 do cliente/webhook Asaas aprovados. Builds isolados dos dois projetos aprovados, incluindo TypeScript. Documentação operacional em integration/COMMERCIAL.md e scripts/local-leads/README.md. Manter relay e túnel ativos para receber a simulação; antes de desligar o túnel, desabilitar somente o webhook de homologação indicado no estado privado.
