# Atualização do Projeto V1 — FIRMANT Site

> Data da memória: 2026-04-13  
> Projeto: `firmant-site`  
> Domínio público: `https://firmant.com.br/`  
> Repositório GitHub ativo: `Gduart/firmant-site`  
> Branch principal: `main`  
> Objetivo deste arquivo: servir como memória viva do estado atual do projeto para retomada futura, auditoria técnica e planejamento das próximas etapas.

---

## 1. Resumo Executivo

O projeto FIRMANT é um site institucional/comercial em Next.js para apresentar a agência, seus serviços e um configurador de pacotes.

A proposta atual da marca é vender uma operação digital mais profissional, com foco em:

- Gestão de redes sociais com processo organizado, aprovação facilitada, relatórios, dashboards e apoio de IA.
- Criação de vídeos para negócios e UGC, com cards verticais de vídeo em loop.
- Aplicações web e mobile para negócios, sistemas internos, áreas logadas, apps, automações e plataformas sob medida.
- Wizard para montagem de pacotes comerciais.
- Deploy ativo via Cloudflare Workers/Pages com domínio `firmant.com.br`.

O projeto já está no ar e o fluxo de deploy via GitHub/Cloudflare está funcionando.

---

## 2. Stack Técnica Atual

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | Next.js `16.2.1` | App Router, rotas em `src/app` |
| UI | React `19.2.4` | Componentes client-side nas páginas principais |
| Linguagem | TypeScript | Validação com `npx tsc --noEmit --incremental false` |
| Animações | Framer Motion `12.38.0` | `motion`, `useInView`, `AnimatePresence` |
| Scroll | Lenis `1.3.21` | Smooth scroll global |
| CSS | Tailwind CSS 4 + CSS global + inline styles | Layout crítico majoritariamente via `style={{ }}` |
| UI base | shadcn/radix parcial | Existe `components/ui/button.tsx` |
| Deploy | Cloudflare Workers com OpenNext | Configurado por `wrangler.jsonc` + `open-next.config.ts` |
| Git remoto | GitHub | `origin` aponta para `Gduart/firmant-site` |

Dependências relevantes em `package.json`:

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "framer-motion": "^12.38.0",
  "@opennextjs/cloudflare": "^1.19.0",
  "wrangler": "^4.81.1",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

---

## 3. Estrutura Principal do Projeto

```text
firmant-site/
├── AGENTS.md
├── CLAUDE.md
├── MAPEAMENTO.md
├── PROJETO.md
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── open-next.config.ts
├── wrangler.jsonc
├── tsconfig.json
├── components.json
├── eslint.config.mjs
├── postcss.config.mjs
├── lib/
│   └── utils.ts
├── components/
│   └── ui/
│       └── button.tsx
├── scripts/
│   └── ensure-opennext-shim.cjs
├── public/
│   ├── _headers
│   ├── hero-video.mp4
│   ├── hero-poster.jpg
│   ├── Video_FILMANT_Site-Capa002.mp4
│   ├── Meu Vídeo-Miniatura.jpg
│   └── videos/
│       └── ugc/
│           ├── ugc.mp4
│           ├── influencer.mp4
│           ├── ia.mp4
│           ├── transformers.mp4
│           ├── poster-ugc.svg
│           ├── poster-influencer.svg
│           ├── poster-ia.svg
│           └── poster-transformers.svg
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx
    │   ├── gestao-redes-sociais/
    │   │   └── page.tsx
    │   ├── edicao-video-ugc/
    │   │   └── page.tsx
    │   ├── desenvolvimento/
    │   │   └── page.tsx
    │   └── monte-seu-pacote/
    │       └── page.tsx
    └── components/
        ├── Navbar.tsx
        ├── Footer.tsx
        ├── LenisProvider.tsx
        └── CustomCursor.tsx
```

Observação: o arquivo `anotacao` existe localmente e está fora do Git. Ele não deve ser commitado sem solicitação explícita.

---

## 4. Rotas Implementadas

| Rota | Arquivo | Estado atual |
|---|---|---|
| `/` | `src/app/page.tsx` | Implementada e fortalecida |
| `/gestao-redes-sociais` | `src/app/gestao-redes-sociais/page.tsx` | Implementada e reposicionada |
| `/edicao-video-ugc` | `src/app/edicao-video-ugc/page.tsx` | Implementada com vídeos verticais em loop |
| `/desenvolvimento` | `src/app/desenvolvimento/page.tsx` | Implementada e reposicionada para aplicações web/mobile |
| `/monte-seu-pacote` | `src/app/monte-seu-pacote/page.tsx` | Wizard implementado visualmente |
| `/contato` | Não existe ainda | Pendente, mas vários CTAs apontam para ela |
| `/blog` | Não existe ainda | Pendente, mas navbar aponta para ela |
| `/politica-privacidade` | Não existe ainda | Pendente, footer aponta para ela |

---

## 5. Estado Atual da Home

Arquivo: `src/app/page.tsx`

Seções principais:

1. Hero fullscreen com vídeo de fundo.
2. Seção `Nossos Serviços` com 3 serviços principais.
3. Nova subseção de operação de social media com 11 cards de valor.
4. Seção `Sobre a FIRMANT`.
5. Modal `Conheça nossa abordagem`.
6. FAQ expandido.
7. CTA final.

### 5.1 Hero

- Usa `public/hero-video.mp4`.
- Usa `public/hero-poster.jpg` como fallback.
- Configuração do vídeo:

```tsx
<video autoPlay muted loop playsInline poster="/hero-poster.jpg">
```

### 5.2 Nossos Serviços

Serviços exibidos:

- Gestão de Redes Sociais.
- Vídeo & UGC com IA.
- Desenvolvimento Web/Mobile.

Os cards são links para as páginas internas.

### 5.3 Nova subseção de social media

Título:

```text
Uma operação de social media mais estratégica, organizada e profissional.
```

Foram adicionados 11 cards informativos:

1. Gestão centralizada da operação.
2. Agendamento em múltiplos formatos e redes.
3. Melhores dias e horários para postar.
4. Workflow de criação e aprovação.
5. Aprovação facilitada por link e WhatsApp.
6. Relatórios profissionais e dashboards personalizados.
7. Envio automático de relatórios.
8. Portal do Cliente com acesso individual.
9. Dashboard online para acompanhamento contínuo.
10. Inteligência artificial para escala e agilidade.
11. Análise de concorrentes para decisões melhores.

Todos exibem o selo:

```text
Incluso em planos 8+ posts
```

### 5.4 Modal Conheça Nossa Abordagem

O botão `Conheça nossa abordagem` abre um modal na própria home.

Características:

- Fundo escuro com blur.
- Borda dourada.
- Headline branca + dourada.
- Conteúdo institucional completo sobre a abordagem da FIRMANT.
- Fecha no `X`, no clique fora e na tecla `ESC`.
- Bloqueia o scroll do body enquanto aberto.

Decisão técnica: foi escolhido modal em vez de nova página porque o conteúdo explica a própria seção `Sobre a FIRMANT` e mantém o visitante no fluxo da home.

### 5.5 FAQ expandido

Além dos FAQs originais, foram adicionadas perguntas sobre:

- Portal do Cliente com login individual.
- Quem libera o acesso.
- Dashboard online.
- Aprovação por link/WhatsApp.
- Envio automático de relatórios.

---

## 6. Página Gestão de Redes Sociais

Arquivo: `src/app/gestao-redes-sociais/page.tsx`

Objetivo atual: vender gestão estruturada de redes sociais, não apenas criação de posts.

Posicionamento:

```text
Gestão de redes sociais com estratégia, organização e acompanhamento profissional.
```

Pontos importantes:

- Reforça planejamento, produção, aprovação, publicação e acompanhamento.
- Apresenta vantagens como dashboard, portal do cliente, relatórios, workflow e melhores horários.
- Depoimentos/social proof foram desconsiderados conforme decisão anterior.
- Mantém layout visual já aprovado.

---

## 7. Página Vídeos para Negócios & UGC

Arquivo: `src/app/edicao-video-ugc/page.tsx`

Objetivo atual: reposicionar a oferta como criação de vídeos para negócios e UGC, não apenas edição de vídeo.

Nome adotado:

```text
Vídeos para Negócios & UGC
```

### 7.1 Hero com 4 vídeos verticais

Foram configurados 4 vídeos verticais:

```text
public/videos/ugc/ugc.mp4
public/videos/ugc/influencer.mp4
public/videos/ugc/ia.mp4
public/videos/ugc/transformers.mp4
```

Configuração técnica:

```tsx
<video
  src={video.src}
  poster={video.poster}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
/>
```

Ajustes técnicos realizados:

- Cards com `aspect-ratio: 9 / 16`.
- Grid com 4 vídeos lado a lado no desktop.
- Responsividade: 2 por linha em telas menores e 1 por linha no mobile estreito.
- Posters verticais SVG temporários criados para fallback.

### 7.2 Validação dos vídeos

Os vídeos carregados foram analisados tecnicamente:

```text
ugc.mp4             720x1280 | 9:16 | H.264 | 8s
influencer.mp4      720x1280 | 9:16 | H.264 | 10s
ia.mp4              720x1280 | 9:16 | H.264 | 8s
transformers.mp4    720x1280 | 9:16 | H.264 | 8s
```

Observação: não estão em 1080x1920, mas estão corretos visualmente porque mantêm proporção 9:16.

Risco futuro: os 4 vídeos somam aproximadamente 28 MB. Para performance, pode ser necessário otimizar/comprimir ou trocar para WebM no futuro.

---

## 8. Página Desenvolvimento

Arquivo: `src/app/desenvolvimento/page.tsx`

Objetivo atual: reposicionar a página para aplicações web/mobile para negócios, removendo foco em sites e landing pages.

Nome adotado:

```text
Aplicações Web & Mobile para Negócios
```

Removido da página:

- Websites & Landing Pages.
- Landing page básica.
- Landing page alta conversão.
- Landing page premium.
- Site institucional.
- Site completo.
- E-commerce.
- Bloco `Por que Python`.
- Hero centrado em Python.

Novo foco:

- Sistemas internos.
- Portais e áreas logadas.
- Apps mobile.
- Plataformas com automações e integrações.
- Dashboards e relatórios.
- APIs, backends e IA.

### 8.1 Cards de investimento com modal

Os 4 primeiros cards de investimento agora são clicáveis:

1. Aplicação web sob medida — MVP.
2. Sistema web com área logada e operação interna.
3. App mobile iOS + Android.
4. Plataforma integrada com automações e backend.

Ao clicar, abre modal com:

- Título.
- Valor.
- Prazo.
- Explicação detalhada.
- CTA para avaliação técnica.
- CTA para montar pacote.

Fecha no `X`, clique fora ou `ESC`.

Os cards `Manutenção e evolução contínua` e `Consultoria técnica` permanecem sem modal, pois não receberam descrição detalhada.

---

## 9. Wizard Monte Seu Pacote

Arquivo: `src/app/monte-seu-pacote/page.tsx`

Estado atual: wizard visual e funcional para seleção de serviços, resumo e finalização via WhatsApp.

Importante:

- Não há React Hook Form.
- Não há Zod.
- Não há rota `/api/send-order`.
- Não há envio por e-mail/Resend.
- Não há Mercado Pago integrado.
- Finalização ainda usa WhatsApp.

Esse comportamento já foi identificado como pendência da Fase 3/4.

---

## 10. Componentes Globais

### Navbar

Arquivo: `src/components/Navbar.tsx`

- Navbar fixa.
- Links principais: Redes Sociais, Vídeos & UGC, Desenvolvimento, Blog, Contato.
- CTA: Monte seu pacote.
- Menu mobile fullscreen.

Atenção: `/blog` e `/contato` ainda não existem.

### Footer

Arquivo: `src/components/Footer.tsx`

- Links institucionais e serviços.
- WhatsApp flutuante.
- Link para política de privacidade ainda aponta para rota pendente.

### LenisProvider

Arquivo: `src/components/LenisProvider.tsx`

- Smooth scroll global.

### CustomCursor

Arquivo: `src/components/CustomCursor.tsx`

- Cursor customizado desktop.
- Desabilitado automaticamente em touch devices.

---

## 11. Cloudflare / Deploy

Arquivos relevantes:

```text
wrangler.jsonc
open-next.config.ts
next.config.ts
public/_headers
```

Configuração atual `wrangler.jsonc`:

```json
{
  "main": ".open-next/worker.js",
  "name": "firmant-site",
  "compatibility_date": "2026-04-11",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  }
}
```

Scripts de deploy em `package.json`:

```json
{
  "build": "next build",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload"
}
```

Histórico de problemas resolvidos:

- Cloudflare inicialmente tentou build/deploy com comandos incorretos.
- Houve erro `npx opennextjs-cloudflare build` por pacote/bin não resolvido.
- Foi adicionado alias no `package.json`:

```json
"opennextjs-cloudflare": "npm:@opennextjs/cloudflare@^1.19.0"
```

- A build passou a funcionar após ajustes de configuração.
- O domínio `firmant.com.br` foi conectado no Cloudflare.
- Erro DNS 1000 foi resolvido removendo/apontando corretamente registros DNS para o Worker/Pages.

---

## 12. Git / Histórico Recente

Últimos commits relevantes:

```text
1bdb0e8 feat: adicionar modal de abordagem na home
a365bf6 feat: fortalecer home com operacao social media
cac1116 feat: adicionar modal nos cards de desenvolvimento
50bff01 copy: reposicionar pagina de desenvolvimento
70e0008 assets: adicionar videos ugc do hero
835a6b2 style: ajustar cards verticais de videos ugc
b885bd8 style: ajustar hero de videos e ugc
880478f copy: reposicionar pagina de videos e ugc
c61505f chore: forcar deploy com configuracao corrigida
9c867b4 fix: remover postinstall do opennext
6739f1f fix: criar shim local para build opennext
cf8bafd fix: adicionar alias do opennext para build cloudflare
```

Estado no momento desta memória:

```text
main sincronizada com origin/main
arquivo local não versionado: anotacao
```

---

## 13. Problemas Solucionados

| Problema | Causa | Solução |
|---|---|---|
| Build Cloudflare falhando por `@/lib/utils` | shadcn esperava alias/utilitário ausente | Criado `lib/utils.ts` |
| Erro de tipo Framer Motion em `ease` | Array inferido como `number[]` | Tipado como tupla `[number, number, number, number]` |
| `AnimatedSection` não aceitava `style` | Tipo restrito no componente | Adicionado `style?: CSSProperties` |
| DNS Cloudflare Error 1000 | Registros A/AAAA apontando para IP proibido/conflitante | Corrigido DNS e domínio customizado |
| OpenNext build sem executável | Alias/bin não resolvido | Adicionado alias `opennextjs-cloudflare` |
| Hero Vídeos & UGC amador/achatado | Cards não estavam controlando proporção vertical corretamente e fallback era horizontal | Criado painel próprio, grid, `aspect-ratio: 9 / 16`, posters verticais |
| Vídeos UGC não apareciam no deploy | Arquivos existiam só localmente | Versionados e enviados ao GitHub |
| Página Desenvolvimento vendia sites | Posicionamento antigo conflitava com estratégia | Removidos sites/landing/e-commerce e reposicionada para apps/sistemas |
| Botão Conheça abordagem ia para contato | Conteúdo precisava ser explicativo/contextual | Criado modal institucional na home |

---

## 14. Validações Técnicas Usadas

Comando recorrente de validação TypeScript:

```bash
npx tsc --noEmit --incremental false
```

Esse comando foi usado antes dos commits principais recentes e passou sem erro.

Observação: em algumas situações, `npm run build` local no Windows pode falhar por lock/permissão em `.next`, o que não necessariamente indica erro no código. O Cloudflare é a validação final de build/deploy.

---

## 15. Pendências de Produto

Alta prioridade:

- Criar rota `/contato`.
- Criar rota `/blog` ou remover temporariamente link da navbar.
- Criar rota `/politica-privacidade`.
- Corrigir finalização do wizard para não depender apenas de WhatsApp se a meta for pagamento/email.
- Implementar `/api/send-order` se for mantido o plano original de envio por e-mail.
- Definir se Mercado Pago entra agora ou em fase posterior.

Média prioridade:

- SEO por página com metadata específica.
- Sitemap e robots.
- Política LGPD/cookies.
- Google Analytics ou alternativa.
- Otimização dos vídeos UGC, possível WebM e poster real de cada vídeo.
- Revisar textos do footer para alinhar com novo posicionamento: `vídeos para negócios`, não `edição de vídeo`.

Baixa prioridade:

- Remover arquivos originais não usados em `public` se confirmado:
  - `Video_FILMANT_Site-Capa002.mp4`
  - `Meu Vídeo-Miniatura.jpg`
- Avaliar se `scripts/ensure-opennext-shim.cjs` ainda é necessário ou é resíduo histórico.
- Atualizar `README.md`, `MAPEAMENTO.md` e `PROJETO.md` ou manter este arquivo como referência principal de V1.

---

## 16. Pendências em Relação ao Planejamento Inicial

### Fase 1 — Setup e fundação

Status: majoritariamente concluída.

Concluído:

- Projeto Next.js criado.
- Tailwind/Framer/shadcn instalados.
- GitHub correto conectado.
- Cloudflare funcionando.
- Domínio `firmant.com.br` ativo.
- Primeiro deploy funcional.

Pendente/atenção:

- Documentação de deploy ainda pode ser refinada.

### Fase 2 — Layout e hero com vídeo

Status: em grande parte concluída.

Concluído:

- Navbar fixa.
- Footer.
- Hero com vídeo.
- Páginas de serviços.
- FAQ.
- Seção sobre.

Desconsiderado por decisão:

- Depoimentos/social proof.

### Fase 3 — Configurador de serviços

Status: visualmente implementado, integrações pendentes.

Concluído:

- Wizard multi-step.
- Seleção de categorias e serviços.
- Dados do cliente.
- Resumo visual.
- Cálculo dinâmico.

Pendente:

- React Hook Form.
- Zod.
- `/api/send-order`.
- Resend/e-mail.

### Fase 4 — Pagamento + newsletter

Status: pendente.

Pendente:

- Mercado Pago.
- Webhook.
- Sandbox.
- Brevo/newsletter.

Parcialmente concluído:

- Botão WhatsApp flutuante.

### Fase 5 — SEO, GEO e LGPD

Status: pendente.

Pendente:

- Schema JSON-LD.
- Meta tags dinâmicas.
- Sitemap.
- Robots.
- Política de Privacidade.
- Cookies.
- Analytics.

### Fase 6 — Testes e lançamento

Status: lançamento técnico básico feito, testes finais ainda pendentes.

Concluído:

- Site está no ar.
- Deploy via Cloudflare funcionando.

Pendente:

- Core Web Vitals.
- Responsividade completa pós-novas seções.
- Teste end-to-end do wizard com integração real.
- Links quebrados: principalmente `/contato`, `/blog`, `/politica-privacidade`.

---

## 17. Recomendações Técnicas para Próxima Sessão

Ordem mais segura:

1. Criar página `/contato`, porque vários CTAs já apontam para ela.
2. Criar `/politica-privacidade`, porque é obrigatório para confiança/LGPD.
3. Decidir o futuro do wizard: WhatsApp, e-mail/Resend, Mercado Pago ou combinação.
4. Revisar navbar/footer para evitar links 404 até `/blog` existir.
5. Rodar auditoria visual mobile depois das novas seções da home.
6. Rodar PageSpeed/Cloudflare depois que todos os vídeos e modais estiverem publicados.

---

## 18. Comandos Úteis

Desenvolvimento:

```bash
npm run dev
```

Validação TypeScript:

```bash
npx tsc --noEmit --incremental false
```

Build Next padrão:

```bash
npm run build
```

Deploy/preview Cloudflare local:

```bash
npm run preview
npm run deploy
```

Git:

```bash
git status --short --branch
git log --oneline --decorate -10
git push origin main
```

---

## 19. Regra de Continuidade

Este arquivo é a memória viva da versão V1.

Quando houver nova solicitação de salvar uma versão, criar um novo arquivo na raiz seguindo o padrão:

```text
Atualização_Projeto_V2.md
Atualização_Projeto_V3.md
Atualização_Projeto_V4.md
```

Não sobrescrever este arquivo sem autorização explícita.
