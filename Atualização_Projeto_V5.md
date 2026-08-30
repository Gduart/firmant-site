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
