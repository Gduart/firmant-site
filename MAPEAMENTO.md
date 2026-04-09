# FIRMANT SITE — Mapeamento Completo do Projeto

> **Gerado em:** 2026-04-07  
> **Stack:** Next.js 16.2.1 · React 19 · TypeScript · Framer Motion 12 · Tailwind CSS v4 · Lenis  
> **Dev:** `npm run dev` → http://localhost:3000  
> **Domínio:** firmant.com.br

---

## 1. Estrutura de Arquivos

```
firmant-site/
├── public/
│   ├── hero-video.mp4              ← 4.5 MB — vídeo hero, autoplay muted loop
│   ├── hero-poster.jpg             ← 129 KB — fallback/capa do vídeo
│   ├── Video_FILMANT_Site-Capa002.mp4   ← original (pode deletar)
│   └── Meu Vídeo-Miniatura.jpg         ← original (pode deletar)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout: fontes, metadata, providers
│   │   ├── globals.css             ← Design tokens CSS + classes utilitárias
│   │   ├── page.tsx                ← Home (726 linhas)
│   │   ├── monte-seu-pacote/
│   │   │   └── page.tsx            ← Wizard 5 passos (885+ linhas)
│   │   ├── gestao-redes-sociais/
│   │   │   └── page.tsx            ← Página de serviço (738 linhas)
│   │   ├── edicao-video-ugc/
│   │   │   └── page.tsx            ← Página de serviço (714 linhas)
│   │   └── desenvolvimento/
│   │       └── page.tsx            ← Página de serviço (718 linhas)
│   │
│   └── components/
│       ├── Navbar.tsx              ← Navbar fixa, mobile menu fullscreen
│       ├── Footer.tsx              ← Footer 3 colunas + WhatsApp flutuante
│       ├── LenisProvider.tsx       ← Smooth scroll global
│       └── CustomCursor.tsx        ← Cursor customizado dot + ring
│
├── CLAUDE.md → @AGENTS.md
├── AGENTS.md                       ← Aviso: Next.js 16 tem breaking changes
├── PROJETO.md                      ← Diário técnico de versões
├── MAPEAMENTO.md                   ← Este arquivo
└── package.json
```

---

## 2. Rotas Implementadas

| Rota | Arquivo | Status |
|------|---------|--------|
| `/` | `src/app/page.tsx` | ✅ Completo |
| `/monte-seu-pacote` | `src/app/monte-seu-pacote/page.tsx` | ✅ Completo |
| `/gestao-redes-sociais` | `src/app/gestao-redes-sociais/page.tsx` | ✅ Completo |
| `/edicao-video-ugc` | `src/app/edicao-video-ugc/page.tsx` | ✅ Completo |
| `/desenvolvimento` | `src/app/desenvolvimento/page.tsx` | ✅ Completo |
| `/contato` | — | ❌ Pendente |
| `/blog` | — | ❌ Pendente |
| `/politica-privacidade` | — | ❌ Pendente |

---

## 3. Stack e Dependências

### Dependências de produção (`dependencies`)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 16.2.1 | Framework — App Router |
| `react` / `react-dom` | 19.2.4 | UI library |
| `framer-motion` | ^12.38.0 | Animações (motion, useInView, AnimatePresence) |
| `lenis` | ^1.3.21 | Smooth scroll |
| `gsap` + `@gsap/react` | ^3.14.2 | GSAP (instalado, ainda não usado ativamente) |
| `lucide-react` | ^1.7.0 | Ícones SVG |
| `radix-ui` | ^1.4.3 | Primitivos acessíveis |
| `shadcn` | ^4.1.1 | Componentes (instalado, parcialmente usado) |
| `class-variance-authority` | ^0.7.1 | Utilitário de classes condicionais |
| `clsx` | ^2.1.1 | Merge de classNames |
| `tailwind-merge` | ^3.5.0 | Merge seguro de classes Tailwind |
| `tw-animate-css` | ^1.4.0 | Animações CSS via Tailwind |

### Dependências de desenvolvimento (`devDependencies`)

| Pacote | Versão |
|--------|--------|
| `tailwindcss` | ^4 |
| `@tailwindcss/postcss` | ^4 |
| `typescript` | ^5 |
| `@types/react` + `@types/react-dom` | ^19 |
| `eslint` + `eslint-config-next` | ^9 / 16.2.1 |

### Fontes (next/font/google)

| Fonte | Variável CSS | Uso |
|-------|-------------|-----|
| `Syne` | `--font-heading` | H1–H6, logo, títulos |
| `Plus Jakarta Sans` | `--font-body` | Body, labels, UI, botões |

---

## 4. Design System (`src/app/globals.css`)

### Paleta de Cores

```css
/* Navy — fundos e superfícies */
--navy-950: #0A1628   /* bg primário */
--navy-900: #0F1D32   /* bg secundário */
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
--accent-gold:       #C9A84C   /* CTA, destaques principais */
--accent-gold-light: #E8D48B
--accent-cyan:       #22D3EE   /* categoria Vídeo */
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

/* Sombras */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3)
--shadow-md: 0 4px 12px rgba(0,0,0,0.4)
--shadow-lg: 0 8px 30px rgba(0,0,0,0.5)

/* Transições */
--transition-fast:   150ms cubic-bezier(0.4,0,0.2,1)
--transition-base:   300ms cubic-bezier(0.4,0,0.2,1)
--transition-slow:   500ms cubic-bezier(0.4,0,0.2,1)
--transition-smooth: 700ms cubic-bezier(0.16,1,0.3,1)
```

### Cores por Categoria de Serviço

| Categoria | Cor | Hex |
|-----------|-----|-----|
| Gestão de Redes Sociais | Gold | `#C9A84C` |
| Edição de Vídeo | Cyan | `#22D3EE` |
| Vídeo UGC com IA | Violet | `#A78BFA` |
| Desenvolvimento Web/Mobile | Green | `#34D399` |

### Tipografia (globals.css)

```css
h1 { font-size: clamp(3rem, 7vw, 5.5rem); }
h2 { font-size: clamp(2.2rem, 5vw, 4rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
/* Todos: font-family: var(--font-heading); line-height: 1.05; letter-spacing: -0.03em */
p  { color: var(--text-secondary); line-height: 1.8; font-size: 1.05rem; }
```

### Classes Utilitárias CSS

| Classe | Efeito |
|--------|--------|
| `.text-gradient` | Degradê gold (135deg) no texto |
| `.glass` | Glassmorphism: blur 24px + bg navy 70% |
| `.nav-links-desktop` | Flex centralizado; oculto em ≤1024px |
| `.nav-link-item` | Link da navbar desktop |
| `.nav-cta-desktop` | CTA da navbar; oculto em ≤1024px |
| `.nav-hamburger` | Botão hamburguer; visível apenas em ≤1024px |
| `.footer-grid` | Grid 3-col → 2-col (≤900px) → 1-col (≤600px) |
| `.footer-inner` | Padding responsivo do footer |
| `.wizard-grid` | Grid 2-col → 1-col em ≤960px |
| `.contact-grid` | Grid 2-col → 1-col em ≤600px |
| `.service-card-link:hover .service-title` | translateX(12px) + cor gold |
| `.service-card-link:hover .service-arrow` | Borda e bg gold |
| `.service-card-link:hover .service-arrow-icon` | rotate(45deg) |

### Regra crítica de layout

> **Tailwind v4 não compila arbitrary classes** (ex: `pt-[160px]`).  
> **Todo espaçamento crítico usa `style={{ }}` inline** — é a abordagem padrão em todo o projeto.

---

## 5. Root Layout (`src/app/layout.tsx`)

```tsx
// Providers aninhados (ordem de fora pra dentro):
<html lang="pt-BR">
  <body>
    <LenisProvider>       // smooth scroll
      <CustomCursor />    // cursor customizado
      <Navbar />          // navbar fixa
      <main>{children}</main>
      <Footer />          // footer + WhatsApp flutuante
    </LenisProvider>
  </body>
</html>
```

### Metadata SEO

```ts
title: "FIRMANT — Agência Digital com IA"
description: "Gestão de redes sociais, edição de vídeo, conteúdo UGC com IA e desenvolvimento web/mobile..."
keywords: ["agência digital", "inteligência artificial", "gestão redes sociais", ...]
openGraph: { url: "https://firmant.com.br", locale: "pt_BR", type: "website" }
```

---

## 6. Página Home (`src/app/page.tsx`)

Seções renderizadas em ordem:

| Componente | Conteúdo principal |
|------------|-------------------|
| `HeroSection` | Vídeo fullscreen + badge + H1 + 2 CTAs + scroll indicator |
| `ServicesSection` | 3 cards de serviço com hover animado (CSS globals) |
| `AboutSection` | Texto missão + 4 cards de métricas em grid 2×2 |
| `FAQSection` | Accordion manual com AnimatePresence (5 perguntas) |
| `CTASection` | H2 + parágrafo + 2 botões (Monte Seu Pacote / Fale Conosco) |

### Hero — detalhe técnico

```jsx
<video autoPlay muted loop playsInline poster="/hero-poster.jpg">
  <source src="/hero-video.mp4" type="video/mp4" />
  <source src="/hero-video.webm" type="video/webm" />  {/* fallback futuro */}
</video>
// Filtro: brightness(0.55) saturate(1.3) contrast(1.05)
// Overlay: gradiente vertical 4 stops + vinheta radial
```

### Variantes de animação (padrão do projeto)

```ts
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// AnimatedSection = useInView({ once: true, margin: "-80px" }) → stagger trigger
```

---

## 7. Componentes Globais

### `Navbar.tsx`

- `position: fixed`, `z-index: 100`
- Fundo: `rgba(10,22,40,0.85)` → `rgba(10,22,40,0.95)` após scroll > 50px
- `backdropFilter: blur(20px) saturate(180%)`
- Links desktop: `navLinks` (Redes Sociais, Vídeo & UGC, Desenvolvimento, Blog, Contato)
- CTA separado: "Monte Seu Pacote" (botão gold)
- Mobile (≤1024px): hamburguer → overlay fullscreen com AnimatePresence
- No menu mobile, "Monte Seu Pacote" aparece em gold como último item

### `Footer.tsx`

- Grid `.footer-grid`: 3 colunas (2fr 1fr 1fr) → 2 colunas (≤900px) → 1 coluna (≤600px)
- Coluna 1: Logo + tagline + ícones sociais (Instagram, Facebook, Email)
- Coluna 2: Links de serviços
- Coluna 3: Links empresa (Blog, Contato, Política de Privacidade)
- Copyright dinâmico: `new Date().getFullYear()`
- **WhatsApp flutuante**: `position: fixed`, bottom-right, `#25D366`, animação `pulse-glow`
  - Link: `https://wa.me/5511915058962?text=...`

### `LenisProvider.tsx`

```ts
new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 2 })
// rAF loop com requestAnimationFrame
```

### `CustomCursor.tsx`

- Dois elementos `motion.div` (dot + ring com lag)
- Não renderiza em dispositivos touch (`"ontouchstart" in window`)
- Hover em `a, button, [role='button'], input, textarea, select` → expande o dot
- MutationObserver para re-attachar listeners em elementos dinâmicos

---

## 8. Wizard Monte Seu Pacote (`src/app/monte-seu-pacote/page.tsx`)

### Arquitetura

```
WizardPage
├── Sidebar (sticky) — pacotes prontos + resumo do total
└── Área principal
    ├── Step 1 — StepCategories   (4 cards toggleáveis)
    ├── Step 2 — StepServices     (checkboxes + contador qty)
    ├── Step 3 — StepContact      (form: nome, email, whatsapp, empresa, obs)
    ├── Step 4 — StepSummary      (revisão + botões "editar")
    └── Step 5 — StepPayment      (4 métodos + confirmar)
```

### Tipos TypeScript

```ts
type ServiceItem = { id: string; label: string; price: number; unit: string; description: string; allowQty?: boolean }
type Category    = { id: string; number: string; title: string; tagline: string; color: string; services: ServiceItem[] }
type Selection   = { categoryId: string; serviceId: string; qty: number }
type ClientData  = { name: string; email: string; whatsapp: string; empresa: string; obs: string }
```

### Categorias e Serviços (dados completos)

#### Categoria 1 — Gestão de Redes Sociais (`color: #C9A84C`)

| ID | Label | Preço | Unit |
|----|-------|-------|------|
| `s4` | 4 publicações/mês | R$ 397 | mês |
| `s8` | 8 publicações/mês | R$ 697 | mês |
| `s12` | 12 publicações/mês | R$ 997 | mês |
| `s16` | 16 publicações/mês | R$ 1.297 | mês |
| `s20` | 20 publicações/mês | R$ 1.597 | mês |
| `s24` | 24+ publicações/mês | R$ 1.897 | mês |

#### Categoria 2 — Edição de Vídeo (`color: #22D3EE`, itens com `allowQty`)

| ID | Label | Preço | Unit |
|----|-------|-------|------|
| `v8s` | Story 8s | R$ 97 | vídeo |
| `v16s` | Reel 16s | R$ 149 | vídeo |
| `v30s` | Reel 30s | R$ 219 | vídeo |
| `v1m` | Reel 1 min | R$ 349 | vídeo |
| `vs10` | Stories Pack — 10 vídeos 8s | R$ 690 | pacote |
| `vg8` | Growth Pack — 8 Reels 30s | R$ 1.352 | pacote |

#### Categoria 3 — Vídeo UGC com IA (`color: #A78BFA`, itens com `allowQty`)

| ID | Label | Preço | Unit |
|----|-------|-------|------|
| `u8s` | UGC 8s | R$ 129 | vídeo |
| `u16s` | UGC 16s | R$ 197 | vídeo |
| `u30s` | UGC 30s | R$ 297 | vídeo |
| `u1m` | UGC 1 min | R$ 449 | vídeo |
| `u_ads` | Direito anúncios +3 meses | R$ 149 | vídeo |
| `u6pk` | Pack 6 UGC 30s | R$ 1.194 | pacote |

#### Categoria 4 — Desenvolvimento Web/Mobile (`color: #34D399`)

| ID | Label | Preço | Unit |
|----|-------|-------|------|
| `d_lp1` | Landing Page básica | R$ 997 | projeto |
| `d_lp2` | Landing Page alta conversão | R$ 1.997 | projeto |
| `d_lp3` | Landing Page premium | R$ 2.997 | projeto |
| `d_site1` | Site institucional 5 págs | R$ 2.497 | projeto |
| `d_site2` | Site institucional completo | R$ 4.997 | projeto |
| `d_ecom` | E-commerce até 50 produtos | R$ 5.997 | projeto |
| `d_app` | App Mobile iOS + Android | R$ 19.997 | projeto |
| `d_manut` | Manutenção mensal | R$ 297 | mês |

### Pacotes Prontos (sidebar)

| Pacote | Itens | Total Aprox. |
|--------|-------|-------------|
| ESSENCIAL | 8 posts + 4 Reels 30s | ~R$ 1.573/mês |
| CRESCIMENTO | 12 posts + 8 Reels + 3 UGC 30s | ~R$ 3.144/mês |
| ACELERAÇÃO | 16 posts + 8 Reels + 6 UGC 30s | ~R$ 3.845/mês |

Click → `setSelectedCats(pkg.cats)` + `setSelections(pkg.items)` + `setStep(2)`

### Métodos de Pagamento (Step 5)

| Método | Desconto/Cond | Comportamento |
|--------|--------------|--------------|
| Pix | −5% | Calcula automaticamente |
| Cartão | 12× | `total/12` por parcela |
| Boleto | — | À vista |
| WhatsApp | — | Combinado direto |

> **Todos** redirecionam para WhatsApp (`5511915058962`) com mensagem formatada.  
> Integração real com Mercado Pago está **pendente**.

---

## 9. Páginas de Serviço

Todas as páginas de serviço seguem a mesma estrutura:

```tsx
"use client"
// AnimatedSection = useInView({ once: true, margin: "-60px" })
// fadeInUp + stagger (variantes)
// paddingTop: 120 no hero, 80 nas demais seções
// maxWidth: 1280, margin: "0 auto", padding: "0 48px"
// Inline styles exclusivo — sem Tailwind para layout
// CTA final → /contato
```

### `/gestao-redes-sociais` — acento Gold (`#C9A84C`)

- Hero: badge + H1 + subtítulo
- Grid de preços: 6 cards (badge "MAIS POPULAR" no plano 12 posts)
- Checklist de incluídos por plano
- "O que fazemos": 4 feature cards
- "Como funciona": 3 steps numerados
- "Por que a Firmant": 4 itens com borda

### `/edicao-video-ugc` — acento Cyan (`#22D3EE`)

- Hero com badge cyan
- Tabela de preços com **tabs** (useState): "Edição de Vídeo" | "UGC com IA"
  - Edição: matriz de preços por formato × duração
  - UGC: acento violet (`#A78BFA`)
- "O que fazemos": dual column
- 4 cards de estatísticas (urgência social)
- "Por que a Firmant": 4 itens
- CTA

### `/desenvolvimento` — acento Green (`#34D399`)

- Hero com badge green
- Dois grupos de preços: Websites & Landing Pages | Aplicações & Apps
- "O que desenvolvemos": 4 cards com ícones SVG
- "Por que Python": 4 itens com borda
- "Como funciona": 4 steps numerados com contador green
- CTA

---

## 10. Contatos e Dados de Negócio

| Dado | Valor |
|------|-------|
| WhatsApp | `5511915058962` |
| E-mail | `contato@firmant.com.br` |
| Instagram | `instagram.com/firmant` |
| Facebook | `facebook.com/firmant` |
| Domínio alvo | `firmant.com.br` |

---

## 11. Pendências (próximas versões)

### Alta prioridade

- [ ] `/contato` — formulário (nome, email, mensagem) + integração e-mail ou WhatsApp
- [ ] `/blog` — listagem de posts (MDX ou dados estáticos)
- [ ] Integração Mercado Pago — wizard redireciona tudo para WhatsApp atualmente

### Média prioridade

- [ ] `/politica-privacidade` — texto legal
- [ ] `generateMetadata()` por página — SEO individual nas rotas de serviço
- [ ] OG Image — imagem social para cada página
- [ ] `hero-video.webm` — versão WebM para melhor compressão
- [ ] Remover arquivos originais do público: `Video_FILMANT_Site-Capa002.mp4` e `Meu Vídeo-Miniatura.jpg`

### Infraestrutura

- [ ] Deploy — Cloudflare Pages (domínio: firmant.com.br)
- [ ] `.env.local` — chaves Mercado Pago
- [ ] Analytics — Vercel Analytics ou Plausible

---

## 12. Bugs Conhecidos / Soluções Adotadas

| Problema | Causa | Solução adotada |
|----------|-------|----------------|
| Arbitrary classes Tailwind não compilam | Tailwind v4 breaking change | **Todo layout usa `style={{}}` inline** |
| Navbar transparente / badge vazava | Hero badge aparecia atrás da nav | Nav com fundo `rgba(10,22,40,0.85)` sempre |
| "Monte Seu Pacote" duplicado na navbar | Estava em navLinks E como CTA | Removido de navLinks, mantido só no CTA |
| Footer colado nas bordas | `px-8` não compilava | Inline padding + `.footer-inner` com media queries |
| Logo cortado à esquerda | Nav sem padding | `padding: "18px 48px"` inline |
| Vídeo hero invisível | `brightness(0.2)` muito escuro | Ajustado para `brightness(0.55) saturate(1.3)` + overlay duplo |

---

## 13. Comandos

```bash
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run start    # servidor de produção
npm run lint     # ESLint
```

---

## 14. Notas para Agentes de IA

- **Next.js 16** tem breaking changes — consultar `node_modules/next/dist/docs/` antes de escrever código
- **Tailwind v4** não compila arbitrary classes confiávelmente — usar `style={{}}` inline para medidas críticas
- **GSAP** está instalado mas não usado ativamente — Framer Motion é o padrão atual do projeto
- **Shadcn** está instalado mas usado parcialmente — preferir inline styles + globals.css
- Todos os componentes de página são `"use client"` — não há Server Components nas páginas
- O cursor customizado é desabilitado automaticamente em touch devices
