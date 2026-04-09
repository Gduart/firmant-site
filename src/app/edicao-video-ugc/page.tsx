"use client";

import { motion, type Variants, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── AnimatedSection helper ───────────────────────────────────────────────────

function AnimatedSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Inner container ──────────────────────────────────────────────────────────

const inner: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 48px",
};

// Accent colours
const CYAN = "#22D3EE";
const PURPLE = "#A78BFA";

// ─── 1. HERO ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-secondary)",
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      <div style={inner}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.span
            variants={fadeInUp}
            style={{
              display: "inline-block",
              marginBottom: 24,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: CYAN,
              fontFamily: "var(--font-body)",
            }}
          >
            02 — Edição de Vídeo & Conteúdo UGC
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 32,
              maxWidth: 900,
            }}
          >
            Vídeos que vendem.{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${CYAN} 0%, #67E8F9 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sem depender de equipe de filmagem, estúdio ou alguém na frente da câmera.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 640,
              fontSize: "1.1rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 48,
            }}
          >
            Criamos e editamos vídeos curtos para Reels, Stories e Shorts — além de conteúdo UGC com avatares de IA — feitos sob medida para a sua marca vender mais em todas as plataformas.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}
          >
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: CYAN,
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero meu vídeo demonstrativo
            </Link>
            <Link
              href="/monte-seu-pacote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                border: `1px solid ${CYAN}66`,
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: CYAN,
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Monte Seu Pacote
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 2. PRICE TABS ────────────────────────────────────────────────────────────

type PriceRow = { label: string; unit: string; two: string; three: string; four: string; five: string };

const videoRows: PriceRow[] = [
  { label: "Story 8s",  unit: "R$97",  two: "R$89",  three: "R$82",  four: "R$77",  five: "R$69" },
  { label: "Reel 16s",  unit: "R$149", two: "R$139", three: "R$129", four: "R$119", five: "R$109" },
  { label: "Reel 30s",  unit: "R$219", two: "R$199", three: "R$189", four: "R$179", five: "R$159" },
  { label: "Reel 1min", unit: "R$349", two: "R$319", three: "R$299", four: "R$279", five: "R$249" },
];

const ugcRows: PriceRow[] = [
  { label: "UGC 8s",   unit: "R$129", two: "R$119", three: "R$109", four: "R$99",  five: "R$89" },
  { label: "UGC 16s",  unit: "R$197", two: "R$179", three: "R$169", four: "R$159", five: "R$139" },
  { label: "UGC 30s",  unit: "R$297", two: "R$269", three: "R$249", four: "R$229", five: "R$199" },
  { label: "UGC 1min", unit: "R$449", two: "R$399", three: "R$379", four: "R$349", five: "R$299" },
];

const colHeaders = ["Formato", "Unitário", "2 vídeos", "3 vídeos", "4 vídeos", "5+ vídeos"];

function PricingTable({ rows, accent }: { rows: PriceRow[]; accent: string }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-body)",
        }}
      >
        <thead>
          <tr>
            {colHeaders.map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "14px 16px",
                  textAlign: i === 0 ? "left" : "center",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              style={{
                backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
              }}
            >
              <td
                style={{
                  padding: "16px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  borderBottom: "1px solid var(--border-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </td>
              {[row.unit, row.two, row.three, row.four, row.five].map((val, j) => (
                <td
                  key={j}
                  style={{
                    padding: "16px 16px",
                    textAlign: "center",
                    fontSize: 15,
                    fontWeight: j === 0 ? 700 : 500,
                    color: j === 0 ? accent : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceSection() {
  const [activeTab, setActiveTab] = useState<"video" | "ugc">("video");

  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary)",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={inner}>
        <AnimatedSection>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 40,
            }}
          >
            Investimento
          </motion.h2>
        </AnimatedSection>

        {/* Tabs */}
        <AnimatedSection>
          <motion.div
            variants={fadeInUp}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 32,
              borderBottom: "1px solid var(--border-primary)",
            }}
          >
            {(["video", "ugc"] as const).map((tab) => {
              const label = tab === "video" ? "Edição de Vídeo" : "UGC com IA";
              const accent = tab === "video" ? CYAN : PURPLE;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "12px 28px",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: "none",
                    border: "none",
                    borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
                    color: isActive ? accent : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    marginBottom: -1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </motion.div>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div
            key={activeTab}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            {activeTab === "video" ? (
              <PricingTable rows={videoRows} accent={CYAN} />
            ) : (
              <PricingTable rows={ugcRows} accent={PURPLE} />
            )}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 3. O QUE FAZEMOS ─────────────────────────────────────────────────────────

function WhatWeDoSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-secondary)",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={inner}>
        <AnimatedSection>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 48,
            }}
          >
            O que fazemos
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: 32,
            }}
          >
            <motion.div
              variants={fadeInUp}
              style={{
                borderRadius: 16,
                border: `1px solid ${CYAN}33`,
                backgroundColor: "var(--bg-card)",
                padding: "36px 32px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${CYAN}18`,
                  marginBottom: 20,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                  color: "var(--text-primary)",
                  marginBottom: 16,
                }}
              >
                Edição de vídeos curtos
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                }}
              >
                Pegamos o material bruto — filmagens do seu produto, bastidores, depoimentos, gravações de tela — e transformamos em vídeos curtos prontos para postar. Cortes dinâmicos, legendas sincronizadas, efeitos de tendência, música, transições, formato otimizado para cada plataforma.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              style={{
                borderRadius: 16,
                border: `1px solid ${PURPLE}33`,
                backgroundColor: "var(--bg-card)",
                padding: "36px 32px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${PURPLE}18`,
                  marginBottom: 20,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                  color: "var(--text-primary)",
                  marginBottom: 16,
                }}
              >
                UGC com IA
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                }}
              >
                UGC é o tipo de conteúdo que mais gera confiança no consumidor. Usamos avatares de IA que falam em português natural, com expressões realistas. Você recebe vídeos no estilo "pessoa real falando sobre seu produto" — produzidos com IA, em escala, com custo acessível.
              </p>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 4. URGENCY STATS ─────────────────────────────────────────────────────────

const stats = [
  { value: "2,5×", label: "mais engajamento que qualquer outro formato" },
  { value: "70%", label: "dos consumidores preferem conhecer produtos por vídeo" },
  { value: "+100%", label: "de conversão com UGC em páginas de produto" },
  { value: "5h/dia", label: "o brasileiro médio consome de vídeo" },
];

function StatsSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary)",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={inner}>
        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 24,
            }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.value}
                variants={fadeInUp}
                style={{
                  borderRadius: 16,
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    fontWeight: 700,
                    color: CYAN,
                    marginBottom: 12,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 5. WHY FIRMANT ───────────────────────────────────────────────────────────

const reasons = [
  {
    title: "Sem necessidade de aparecer na câmera",
    desc: "Avatares de IA eliminam a barreira do 'ninguém aqui quer gravar'. Conteúdo de alta qualidade sem depender de rostos ou influenciadores.",
  },
  {
    title: "Velocidade de produção",
    desc: "Onde uma produtora entrega 1-2 vídeos por semana, nós entregamos múltiplos em dias. IA acelera o processo sem comprometer a qualidade.",
  },
  {
    title: "Custo previsível",
    desc: "Sem surpresas. Sem orçamentos que mudam no meio do projeto. Pacotes claros com entregas definidas.",
  },
  {
    title: "Feito para vender, não para enfeitar",
    desc: "Cada vídeo é pensado com objetivo comercial — gerar tráfego, aumentar engajamento, converter em vendas ou impulsionar anúncios.",
  },
];

function WhyFirmantSection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-secondary)",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={inner}>
        <AnimatedSection>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 56,
            }}
          >
            Por que a Firmant
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
              gap: 32,
            }}
          >
            {reasons.map((r) => (
              <motion.div
                key={r.title}
                variants={fadeInUp}
                style={{
                  borderLeft: `2px solid ${CYAN}`,
                  paddingLeft: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                    color: "var(--text-primary)",
                    marginBottom: 12,
                  }}
                >
                  {r.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "var(--text-secondary)",
                  }}
                >
                  {r.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 6. CTA ───────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-primary)",
        paddingTop: 80,
        paddingBottom: 80,
        textAlign: "center",
      }}
    >
      <div style={{ ...inner, maxWidth: 800 }}>
        <AnimatedSection>
          <motion.h2
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 24,
            }}
          >
            Comece a produzir vídeos que realmente geram resultado.
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <Link
              href="/contato"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: CYAN,
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero meu vídeo demonstrativo
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EdicaoVideoUGCPage() {
  return (
    <>
      <HeroSection />
      <PriceSection />
      <WhatWeDoSection />
      <StatsSection />
      <WhyFirmantSection />
      <CTASection />
    </>
  );
}
