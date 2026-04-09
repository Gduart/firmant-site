# FIRMANT — Relatório Técnico do Projeto

> **Versão atual:** v1.0.0
> **Última atualização:** 2026-04-03
> **Stack principal:** Next.js 16 · React 19 · TypeScript · Framer Motion · Tailwind CSS v4
> **Domínio alvo:** firmant.com.br
> **Dev server:** `npm run dev` → http://localhost:3000

---

> ### Como usar este arquivo
> Este arquivo é o ponto de retomada do projeto. Ao iniciar uma nova sessão de trabalho,
> leia a seção da **versão mais recente** (topo) para entender o estado atual, o que foi feito
> e o que está pendente. Ao concluir um ciclo de features, adicione uma nova seção `## vX.X.X`
> **acima** da versão anterior, mantendo o histórico completo abaixo.

---

## v1.0.0 — 2026-04-03

### Resumo da versão
Versão inicial funcional do site institucional + ferramenta comercial. Cobre Home completa,
4 páginas de serviço, wizard de montagem de pacotes com precificação dinâmica, layout responsivo,
cursor customizado, smooth scroll e vídeo hero.

---

### Stack e Dependências

| Pacote | Versão | Função |
|--------|--------|--------|
| `next` | 16.2.1 | Framework React com App Router |
| `react` / `react-dom` | 19.2.4 | UI library |
| `framer-motion` | 12.38.0 | Animações (motion, useInView, AnimatePresence) |
| `lenis` | 1.3.21 | Smooth scroll |
| `gsap` + `@gsap/react` | 3.14.2 | Animações avançadas (instalado, não usado ativamente ainda) |
| `tailwindcss` | v4 | Utility CSS — **atenção:** v4 tem breaking changes, arbitrary classes podem não compilar |
| `@tailwindcss/postcss` | v4 | Integração PostCSS do Tailwind v4 |
| `tw-animate-css` | 1.4.0 | Animações CSS via Tailwind |
| `radix-ui` | 1.4.3 | Primitivos de UI acessíveis |
| `shadcn` | 4.1.1 | Componentes UI (instalado, parcialmente usado) |
| `lucide-react` | 1.7.0 | Ícones SVG |
| `class-variance-authority` + `clsx` + `tailwind-merge` | latest | Utilitários de classe |
| `typescript` | ^5 | Tipagem estática |

**Fontes Google (next/font):**
- `Syne` → variável CSS `--font-heading` (headings H1–H6)
- `Plus Jakarta Sans` → variável CSS `--font-body` (body, labels, UI)

---

### Estrutura de Arquivos

```
firmant-site/
├── public/
│   ├── hero-video.mp4          ← vídeo hero (4.5MB, autoplay muted loop)
│   ├── hero-poster.jpg         ← frame de capa do vídeo (129KB, fallback)
│   ├── Video_FILMANT_Site-Capa002.mp4   ← arquivo original (pode remover)
│   └── Meu Vídeo-Miniatura.jpg          ← arquivo original (pode remover)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                   ← Root layout: fonts, metadata, providers
│   │   ├── globals.css                  ← Design tokens, reset, classes utilitárias
│   │   ├── page.tsx                     ← Home (725 linhas)
│   │   ├── monte-seu-pacote/
│   │   │   └── page.tsx                 ← Wizard 5 passos (885 linhas)
│   │   ├── gestao-redes-sociais/
│   │   │   └── page.tsx                 ← Página de serviço (738 linhas)
│   │   ├── edicao-video-ugc/
│   │   │   └── page.tsx                 ← Página de serviço (714 linhas)
│   │   └── desenvolvimento/
│   │       └── page.tsx                 ← Página de serviço (718 linhas)
│   │
│   └── components/
│       ├── Navbar.tsx                   ← Navbar fixa com menu mobile
│       ├── Footer.tsx                   ← Footer + botão WhatsApp flutuante
│       ├── LenisProvider.tsx            ← Smooth scroll global
│       └── CustomCursor.tsx             ← Cursor customizado (dot + ring)
│
├── CLAUDE.md → @AGENTS.md              ← Instruções para o agente IA
├── AGENTS.md                            ← Aviso: Next.js 16 tem breaking changes
├── PROJETO.md                           ← Este arquivo
└── package.json
```

---

### Rotas Implementadas

| Rota | Arquivo | Status |
|------|---------|--------|
| `/` | `src/app/page.tsx` | ✅ Completo |
| `/monte-seu-pacote` | `src/app/monte-seu-pacote/page.tsx` | ✅ Completo |
| `/gestao-redes-sociais` | `src/app/gestao-redes-sociais/page.tsx` | ✅ Completo |
| `/edicao-video-ugc` | `src/app/edicao-video-ugc/page.tsx` | ✅ Completo |
| `/desenvolvimento` | `src/app/desenvolvimento/page.tsx` | ✅ Completo |
| `/blog` | — | ❌ Pendente |
| `/contato` | — | ❌ Pendente |
| `/politica-privacidade` | — | ❌ Pendente |

---

### Design System (`globals.css`)

#### Paleta de cores (variáveis CSS)
```css
/* Navy — fundo e superfícies */
--navy-950: #0A1628   ← bg primário
--navy-900: #0F1D32   ← bg secundário
--navy-800: #1A365D
--navy-700: #1E4076
--navy-600: #2A5298
--navy-500: #3B6DB5
--navy-400: #5A8FD4
--navy-300: #89B4E8
--navy-200: #B8D4F2
--navy-100: #E0EDFB
--navy-50:  #F0F6FD

/* Acentuação */
--accent-gold:       #C9A84C   ← CTA, destaques principais
--accent-gold-light: #E8D48B
--accent-cyan:       #22D3EE   ← Categoria Vídeo
--accent-cyan-light: #67E8F9

/* Texto */
--text-primary:   #F8FAFC
--text-secondary: #94A3B8
--text-tertiary:  #64748B
--text-muted:     #475569

/* Superfícies */
--bg-primary:    #0A1628
--bg-secondary:  #0F1D32
--bg-card:       #132240
--bg-card-hover: #1A2D52

/* Bordas */
--border-primary: rgba(255,255,255,0.08)
--border-hover:   rgba(255,255,255,0.15)
--border-accent:  rgba(201,168,76,0.3)
```

#### Cores por categoria de serviço
| Categoria | Cor | Hex |
|-----------|-----|-----|
| Gestão de Redes Sociais | Gold | `#C9A84C` |
| Edição de Vídeo | Cyan | `#22D3EE` |
| Vídeo UGC com IA | Violet | `#A78BFA` |
| Desenvolvimento Web/Mobile | Green | `#34D399` |

#### Classes utilitárias CSS (definidas em globals.css)
- `.text-gradient` — degradê gold no texto
- `.glass` — blur + transparência (glassmorphism)
- `.nav-links-desktop` / `.nav-link-item` / `.nav-cta-desktop` / `.nav-hamburger` — navbar responsiva
- `.footer-grid` / `.footer-inner` — footer responsivo
- `.wizard-grid` — layout 2 colunas do wizard (1 col em ≤960px)
- `.contact-grid` — grid 2 col do form de contato (1 col em ≤600px)
- `.service-card-link:hover .service-title` — hover nos cards de serviço (translateX + cor)
- `.service-card-link:hover .service-arrow` — hover arrow ouro
- `input:focus, textarea:focus` — borda ouro no foco

#### Regra importante de estilização
> **Tailwind v4 não compila arbitrary classes confiávelmente** (ex: `pt-[160px]`).
> **Toda medida crítica de layout usa `style={{ }}` inline** — é a abordagem adotada em todo o projeto.
> CSS utilitário só via classes estáticas em `globals.css`.

---

### Página Home (`/`)

**Seções (ordem de renderização):**

1. **HeroSection** — fullscreen, vídeo de fundo
   - `hero-video.mp4` autoPlay muted loop playsInline
   - `hero-poster.jpg` como fallback
   - Filtro: `brightness(0.55) saturate(1.3) contrast(1.05)`
   - Overlay: gradiente vertical + vinheta radial
   - Badge "Agência Digital com IA" + H1 + subtítulo + 2 CTAs (Monte Seu Pacote / Ver Serviços)

2. **ServicesSection** — 3 cards de serviço com hover animado
   - `paddingTop/Bottom: 160px`
   - Cards com classe `.service-card-link` — hover via CSS globals
   - Número, título, descrição, seta animada

3. **AboutSection** — métricas + missão
   - 4 cards de métricas (gap: 40px)
   - Bloco de texto com destaque gold

4. **FAQSection** — accordion manual com AnimatePresence
   - 5 perguntas, estado local por índice
   - Altura animada com `motion.div` + `overflow: hidden`

5. **CTASection** — chamada final
   - H2 + parágrafo + 2 botões (primário/secundário)

---

### Componentes Globais

#### `Navbar.tsx`
- Posição: `fixed top-0`, `z-index: 100`
- Fundo: `rgba(10,22,40,0.85)` sempre visível (blur 20px)
- Links desktop: Redes Sociais, Vídeo & UGC, Desenvolvimento, Blog, Contato
- CTA separado: "Monte Seu Pacote" (botão ouro)
- Mobile (≤1024px): hamburguer → menu fullscreen overlay com AnimatePresence
- "Monte Seu Pacote" aparece em gold na última posição do menu mobile

#### `Footer.tsx`
- Grid 3 colunas → 2 (≤900px) → 1 (≤600px) via `.footer-grid`
- Colunas: Logo + descrição + redes sociais | Serviços | Empresa
- Redes sociais: Instagram, Facebook, Email (ícones SVG circulares)
- Copyright dinâmico: `new Date().getFullYear()`
- **Botão WhatsApp flutuante** (posição fixed, bottom-right, animação pulse-glow)
  - Link: `https://wa.me/5511915058962?text=...`

#### `LenisProvider.tsx`
- Smooth scroll global com `lenis` v1.3.21
- Wrapper client-side em todo o layout

#### `CustomCursor.tsx`
- Cursor customizado: dot pequeno + ring com lag
- `cursor: none` em html, body, a, button via globals.css

---

### Wizard Monte Seu Pacote (`/monte-seu-pacote`)

**Arquitetura:** 5 steps lineares com sidebar sticky

#### Steps
| Step | Componente | Função |
|------|-----------|--------|
| 1 | `StepCategories` | 4 cards toggleáveis por categoria |
| 2 | `StepServices` | Checkboxes + contador qty para unitários |
| 3 | `StepContact` | Form: nome, email, whatsapp, empresa, obs |
| 4 | `StepSummary` | Revisão completa com botões "editar" por seção |
| 5 | `StepPayment` | 4 métodos + botão confirmar |

#### Precificação com Desconto por Volume
Itens com `allowQty: true` usam tabela `tieredPricing`:
```
Exemplo UGC 8s:  1un→R$129 | 2un→R$119 | 4un→R$99 | 5+un→R$89
Exemplo Reel 30s: 1un→R$219 | 2un→R$199 | 4un→R$179 | 8+un→R$169
```
Quando qty > 1 e desconto ativo: exibe preço unitário em verde (`R$XX/un`).

#### Pacotes Prontos (sidebar)
3 cards clicáveis que pré-configuram o wizard:
| Pacote | Conteúdo | Total aprox. |
|--------|----------|--------------|
| ESSENCIAL | 8 posts + 4 Reels 30s | ~R$1.413/mês |
| CRESCIMENTO | 12 posts + 8 Reels + 3 UGC 30s | ~R$3.150/mês |
| ACELERAÇÃO | 16 posts + 8 Reels + 6 UGC 30s | ~R$3.843/mês |

Click → `setSelectedCats(pkg.cats)` + `setSelections(pkg.items)` + `setStep(2)`

#### Métodos de Pagamento
| Método | Desconto | Obs |
|--------|----------|-----|
| Pix | −5% | Cálculo automático |
| Cartão | 12× | `total/12` por parcela |
| Boleto | — | À vista |
| WhatsApp | — | Combinado direto |

**Todos redirecionam para WhatsApp** com mensagem formatada (integração Mercado Pago pendente).
Número: `5511915058962`

#### Tabela de Preços — Redes Sociais
| Plano | Preço | Por post |
|-------|-------|----------|
| 4 posts/mês | R$397 | R$99 |
| 8 posts/mês | R$697 | R$87 |
| 12 posts/mês | R$997 | R$83 |
| 16 posts/mês | R$1.297 | R$81 |
| 20 posts/mês | R$1.597 | R$79 |
| 24+ posts/mês | R$1.897 | R$79 |

---

### Páginas de Serviço

Todas seguem a mesma estrutura base:
- `"use client"` + imports Framer Motion + `AnimatedSection` com `useInView`
- `paddingTop: 120` no hero, `80` nas demais seções
- `maxWidth: 1280`, `margin: "0 auto"`, `padding: "0 48px"` em todos os containers
- Inline styles exclusivo (sem Tailwind para layout)
- CTA final → `/contato`

#### `/gestao-redes-sociais`
- Hero com badge gold + H1 + subtítulo
- Grid de preços 6 cards (badge "MAIS POPULAR" no plano 12 posts)
- Checklist de incluídos em cada plano
- "O que fazemos" — 4 feature cards
- "Como funciona" — 3 steps numerados
- "Por que a Firmant" — 4 itens com borda

#### `/edicao-video-ugc`
- Hero com acento cyan (#22D3EE)
- Tabela de preços com **tabs** (useState): "Edição de Vídeo" | "UGC com IA"
  - Matriz 4×5 de preços por duração
  - Tab UGC usa acento violet (#A78BFA)
- "O que fazemos" — dual column
- 4 cards de estatísticas de urgência
- "Por que a Firmant" — 4 itens
- CTA

#### `/desenvolvimento`
- Hero com acento green (#34D399)
- Dois grupos de preços: Websites & Landing Pages | Aplicações & Apps
- "O que desenvolvemos" — 4 cards com ícones SVG
- "Por que Python" — 4 itens com borda
- "Como funciona" — 4 steps numerados com contador em green
- CTA

---

### Convenções de Animação

```tsx
// Variante padrão (fadeInUp com spring suave)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// Container com stagger
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Scroll trigger
function AnimatedSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
    {children}
  </motion.div>;
}
```

---

### SEO / Metadata (`layout.tsx`)
```
title: "FIRMANT — Agência Digital com IA"
description: "Gestão de redes sociais, edição de vídeo, conteúdo UGC com IA e desenvolvimento web/mobile."
OpenGraph: title, description, url (firmant.com.br), locale pt_BR, type website
lang: pt-BR
```

---

### Assets (`/public`)
| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `hero-video.mp4` | 4.5MB | Vídeo hero — autoplay, muted, loop |
| `hero-poster.jpg` | 129KB | Imagem de capa do vídeo (fallback) |

---

### Bugs Resolvidos nesta versão

| Bug | Causa | Solução |
|-----|-------|---------|
| Espaçamento quebrado | `pt-[160px]` Tailwind v4 não compilava | Migrado para `style={{ paddingTop: "160px" }}` em todo o projeto |
| Navbar transparente — badge vazando | Hero badge aparecia atrás da nav | Nav sempre com fundo `rgba(10,22,40,0.85)` |
| "Monte Seu Pacote" duplicado na navbar | Estava em navLinks E como CTA | Removido de navLinks, mantido só no CTA |
| Footer colado nas bordas | `px-8` Tailwind não compilava | Inline padding + `.footer-inner` com media queries |
| Logo cortado à esquerda | Nav sem padding definido | `padding: "18px 48px"` inline |
| Vídeo hero invisível | `brightness(0.2)` muito escuro | Ajustado para `brightness(0.55) saturate(1.3)` + overlay duplo |
| Sem desconto por volume no wizard | `svc.price * qty` simples | `tieredPricing[]` + `getItemTotal()` com tiers |

---

### Pendências (próximas versões)

#### Alta prioridade
- [ ] `/contato` — página com formulário (nome, email, mensagem) + integração e-mail ou WhatsApp
- [ ] `/blog` — listagem de posts (pode iniciar com MDX ou dados estáticos)
- [ ] Integração Mercado Pago — wizard atualmente redireciona tudo para WhatsApp

#### Média prioridade
- [ ] `/politica-privacidade` — texto legal
- [ ] SEO por página — `generateMetadata()` nas rotas de serviço
- [ ] OG Image — imagem social para cada página
- [ ] Versão WebM do hero — `hero-video.webm` para melhor compressão em browsers

#### Infraestrutura
- [ ] Deploy — Cloudflare Pages (domínio: firmant.com.br)
- [ ] Variáveis de ambiente — chaves Mercado Pago em `.env.local`
- [ ] Analytics — Vercel Analytics ou Plausible

---

### Comandos úteis

```bash
# Desenvolvimento
npm run dev          # http://localhost:3000

# Build de produção
npm run build
npm run start

# Lint
npm run lint

# Limpar arquivos originais do hero (após validar)
rm public/"Video_FILMANT_Site-Capa002.mp4" public/"Meu Vídeo-Miniatura.jpg"
```

---

*Próxima entrada neste arquivo: adicionar `## v1.1.0` acima desta seção ao concluir `/contato`, `/blog` ou integração Mercado Pago.*
