"use client";

import { motion, type Variants, useInView } from "framer-motion";
import { useRef } from "react";
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

// Accent colour
const GREEN = "#34D399";

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
              color: GREEN,
              fontFamily: "var(--font-body)",
            }}
          >
            04 — Desenvolvimento Web & Mobile
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
            A aplicação que o seu negócio precisa.{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #6EE7B7 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sob medida, entregue mais rápido, sem custo de agência tradicional.
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
            Desenvolvemos aplicações web e mobile em Python — do sistema interno ao aplicativo para o cliente final — com desenvolvimento assistido por IA que reduz prazos e custos pela metade.
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
                backgroundColor: GREEN,
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero minha avaliação técnica gratuita
            </Link>
            <Link
              href="/monte-seu-pacote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                border: `1px solid ${GREEN}55`,
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: GREEN,
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

// ─── 2. PRICE ─────────────────────────────────────────────────────────────────

type PriceCard = { title: string; price: string; time: string };

const sitesCards: PriceCard[] = [
  { title: "Landing Page básica", price: "R$ 997", time: "3–5 dias" },
  { title: "Landing Page alta conversão", price: "R$ 1.997", time: "5–7 dias" },
  { title: "Landing Page premium", price: "R$ 2.997+", time: "7–14 dias" },
  { title: "Site institucional (5 págs)", price: "R$ 2.497", time: "7–14 dias" },
  { title: "Site completo (8–15 págs)", price: "R$ 4.997", time: "14–21 dias" },
  { title: "E-commerce", price: "R$ 5.997+", time: "14–30 dias" },
];

const appsCards: PriceCard[] = [
  { title: "Web App MVP", price: "R$ 7.997+", time: "15–30 dias" },
  { title: "App Mobile iOS+Android", price: "R$ 19.997+", time: "45–90 dias" },
  { title: "Manutenção mensal", price: "R$ 297/mês", time: "Contínuo" },
  { title: "Consultoria técnica", price: "R$ 197/hora", time: "Sob demanda" },
];

function PriceCardItem({ card }: { card: PriceCard }) {
  return (
    <motion.div
      variants={fadeInUp}
      style={{
        borderRadius: 16,
        border: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-card)",
        padding: "28px 24px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: 12,
          lineHeight: 1.4,
        }}
      >
        {card.title}
      </p>
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
          fontWeight: 700,
          color: GREEN,
          marginBottom: 8,
          lineHeight: 1.1,
        }}
      >
        {card.price}
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        {card.time}
      </p>
    </motion.div>
  );
}

function PriceSection() {
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
              marginBottom: 56,
            }}
          >
            Investimento
          </motion.h2>
        </AnimatedSection>

        {/* Group 1 */}
        <AnimatedSection>
          <motion.h3
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              color: "var(--text-secondary)",
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Websites & Landing Pages
          </motion.h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 20,
              marginBottom: 56,
            }}
          >
            {sitesCards.map((card) => (
              <PriceCardItem key={card.title} card={card} />
            ))}
          </div>
        </AnimatedSection>

        {/* Group 2 */}
        <AnimatedSection>
          <motion.h3
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              color: "var(--text-secondary)",
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Aplicações & Apps
          </motion.h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 20,
            }}
          >
            {appsCards.map((card) => (
              <PriceCardItem key={card.title} card={card} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 3. O QUE DESENVOLVEMOS ───────────────────────────────────────────────────

const whatWeBuild = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Aplicações web",
    desc: "Sistemas que rodam no navegador — desde plataformas de gestão interna, dashboards, painéis de controle, até e-commerces, portais de clientes e ferramentas de produtividade.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: "Aplicações mobile",
    desc: "Aplicativos para celular — iOS e Android — que colocam o seu negócio no bolso do cliente. Apps de agendamento, delivery, catálogo de produtos.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
      </svg>
    ),
    title: "Automações e integrações",
    desc: "Sistemas que conectam o que já existe no seu negócio — integrando pagamentos, disparos de e-mail, geração de relatórios, processamento de pedidos.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: "APIs e backends inteligentes",
    desc: "Infraestrutura de dados com performance e segurança. Incluindo funcionalidades com IA — chatbots, análise de dados, recomendações personalizadas.",
  },
];

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
            O que desenvolvemos
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
            {whatWeBuild.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                style={{
                  borderRadius: 16,
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "32px 28px",
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
                    backgroundColor: `${GREEN}18`,
                    marginBottom: 20,
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                    color: "var(--text-primary)",
                    marginBottom: 16,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "var(--text-secondary)",
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 4. POR QUE PYTHON ────────────────────────────────────────────────────────

const pythonReasons = [
  {
    title: "Velocidade de desenvolvimento",
    desc: "Python permite escrever mais funcionalidade com menos código. Projetos que levariam meses em outras linguagens são entregues em semanas.",
  },
  {
    title: "Ecossistema de IA nativo",
    desc: "Python é a linguagem padrão da inteligência artificial. Qualquer funcionalidade com IA se integra naturalmente ao seu sistema.",
  },
  {
    title: "Manutenção simplificada",
    desc: "Código Python é legível e bem estruturado. Quando seu sistema precisar evoluir, a manutenção é mais rápida e mais barata.",
  },
  {
    title: "Frameworks maduros",
    desc: "Usamos Django e FastAPI — dois dos frameworks mais robustos do mercado — para garantir segurança, performance e escalabilidade.",
  },
];

function WhyPythonSection() {
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
              marginBottom: 56,
            }}
          >
            Por que Python
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
            {pythonReasons.map((r) => (
              <motion.div
                key={r.title}
                variants={fadeInUp}
                style={{
                  borderLeft: `2px solid ${GREEN}`,
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

// ─── 5. HOW IT WORKS ─────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Diagnóstico e escopo",
    desc: "Começamos entendendo o seu problema de verdade — não a solução que você imagina, mas a dor real do negócio. Nosso trabalho começa por fazer as perguntas certas.",
  },
  {
    num: "02",
    title: "Proposta técnica clara",
    desc: "Você recebe um documento objetivo: o que será construído, quais tecnologias, qual o prazo, quais as entregas parciais. Sem jargão técnico.",
  },
  {
    num: "03",
    title: "Desenvolvimento iterativo",
    desc: "Trabalhamos em ciclos curtos — você vê o progresso semana a semana, testa conforme fica pronto e dá feedback em tempo real.",
  },
  {
    num: "04",
    title: "Entrega e acompanhamento",
    desc: "O projeto não acaba na entrega. Garantimos que tudo funcione, treinamos sua equipe e ficamos disponíveis para suporte e evolução.",
  },
];

function HowItWorksSection() {
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
            Como funciona
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: 32,
                  borderTop: "1px solid var(--border-primary)",
                  borderBottom: i === steps.length - 1 ? "1px solid var(--border-primary)" : "none",
                  padding: "40px 0",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    color: `${GREEN}44`,
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                      color: "var(--text-primary)",
                      marginBottom: 14,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
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
            Conte pra gente o que seu negócio precisa.
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
                backgroundColor: GREEN,
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero minha avaliação técnica gratuita
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function DesenvolvimentoPage() {
  return (
    <>
      <HeroSection />
      <PriceSection />
      <WhatWeDoSection />
      <WhyPythonSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
