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

// ─── Checkmark icon ───────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-gold)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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
              color: "var(--accent-gold)",
              fontFamily: "var(--font-body)",
            }}
          >
            01 — Gestão de Redes Sociais
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 32,
              maxWidth: 860,
            }}
          >
            Gestão de redes sociais com{" "}
            <span className="text-gradient">estratégia, organização e acompanhamento profissional.</span>
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
            Planejamento, criação, aprovação e acompanhamento em um fluxo mais claro para sua marca comunicar com consistência, reduzir improvisos e manter mais controle sobre a presença digital.
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
                backgroundColor: "var(--accent-gold)",
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero minha análise gratuita
            </Link>
            <Link
              href="/monte-seu-pacote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 999,
                border: "1px solid rgba(201,168,76,0.4)",
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--accent-gold)",
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

const priceCards = [
  { posts: "4 posts/mês", price: "R$ 397/mês", unit: "R$ 99/post", popular: false },
  { posts: "8 posts/mês", price: "R$ 697/mês", unit: "R$ 87/post", popular: false },
  { posts: "12 posts/mês", price: "R$ 997/mês", unit: "R$ 83/post", popular: true },
  { posts: "16 posts/mês", price: "R$ 1.297/mês", unit: "R$ 81/post", popular: false },
  { posts: "20 posts/mês", price: "R$ 1.597/mês", unit: "R$ 79/post", popular: false },
  { posts: "24+ posts/mês", price: "R$ 1.897/mês", unit: "R$ 79/post", popular: false },
];

const included = [
  "Planejamento editorial com calendário organizado",
  "Copy e design alinhados ao posicionamento da marca",
  "Fluxo de aprovação simples por link, e-mail ou WhatsApp",
  "Acompanhamento com relatórios e visão mais clara dos resultados",
];

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
              marginBottom: 48,
            }}
          >
            Investimento
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 720,
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 48,
            }}
          >
            Mais clareza no processo. Mais facilidade na aprovação. Mais consistência na presença digital.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div
            variants={fadeInUp}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {priceCards.map((card) => (
              <div
                key={card.posts}
                style={{
                  position: "relative",
                  borderRadius: 16,
                  border: card.popular
                    ? "1px solid rgba(201,168,76,0.5)"
                    : "1px solid var(--border-primary)",
                  backgroundColor: card.popular ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                  padding: "28px 24px",
                }}
              >
                {card.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "var(--accent-gold)",
                      color: "var(--navy-950)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontFamily: "var(--font-body)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    MAIS POPULAR
                  </span>
                )}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {card.posts}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                    fontWeight: 700,
                    color: card.popular ? "var(--accent-gold)" : "var(--text-primary)",
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
                  {card.unit}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatedSection>

        <AnimatedSection>
          <motion.p
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 48,
              lineHeight: 1.7,
            }}
          >
            Contratos trimestrais: 5% de desconto adicional. Semestrais: 10%.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <motion.h3
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 24,
              fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
            }}
          >
            O que está incluído
          </motion.h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {included.map((item) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <CheckIcon />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 3. O QUE FAZEMOS ─────────────────────────────────────────────────────────

const features = [
  {
    title: "Conteúdo com direção, não no improviso",
    desc: "Organizamos temas, cronograma e lógica de publicação para que sua marca tenha consistência e não dependa de decisões de última hora.",
  },
  {
    title: "Aprovar conteúdo pode ser simples",
    desc: "Tornamos a revisão mais prática para reduzir atrasos, acelerar respostas e manter a operação fluindo com mais naturalidade.",
  },
  {
    title: "Resultados apresentados com mais clareza",
    desc: "Você enxerga melhor o que foi feito, o que evoluiu e o que merece atenção, sem relatórios confusos ou excesso de ruído.",
  },
  {
    title: "Mais visibilidade sobre a presença digital",
    desc: "Com acompanhamento estruturado, sua marca ganha mais transparência, mais organização e uma percepção muito mais profissional do trabalho entregue.",
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
              marginBottom: 32,
            }}
          >
            O que fazemos
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 720,
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 56,
            }}
          >
            Na Firmant, sua gestão de redes sociais deixa de ser desorganizada, corrida e dependente de decisões de última hora. Estruturamos o fluxo de conteúdo para que sua marca tenha publicações alinhadas ao posicionamento do negócio, aprovações mais simples, acompanhamento constante e comunicação visual coerente em cada etapa.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
              gap: 40,
            }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                style={{
                  borderRadius: 16,
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "32px 28px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                    color: "var(--text-primary)",
                    marginBottom: 16,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "var(--text-secondary)",
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── 4. GESTÃO PROFISSIONAL ──────────────────────────────────────────────────

const professionalAdvantages = [
  {
    title: "Gestão centralizada",
    desc: "Centralizamos a operação para facilitar acompanhamento, padronização e mais clareza sobre o que está sendo produzido para a sua marca.",
  },
  {
    title: "Agendamento em múltiplos formatos e redes",
    desc: "Sua comunicação pode ser organizada com antecedência e adaptada para diferentes formatos e canais, com mais consistência e menos correria.",
  },
  {
    title: "Calendário de planejamento",
    desc: "Com um calendário estruturado, sua marca ganha ritmo de produção, alinhamento mais fácil e uma presença digital mais profissional.",
  },
  {
    title: "Aprovação por e-mail ou link",
    desc: "A validação dos conteúdos acontece de forma simples, reduzindo atrito e acelerando o andamento das publicações.",
  },
  {
    title: "Aprovação via WhatsApp",
    desc: "A aprovação entra com mais facilidade na rotina do cliente, tornando o processo mais rápido e funcional no dia a dia.",
  },
  {
    title: "Relatórios personalizados",
    desc: "Os resultados são apresentados de forma mais clara e alinhada ao contexto da sua marca, facilitando interpretação e acompanhamento.",
  },
  {
    title: "Relatórios em PDF ou link",
    desc: "Compartilhamos as informações em formatos práticos, com apresentação mais organizada e leitura mais acessível.",
  },
  {
    title: "Dashboard online",
    desc: "Uma forma mais visual e dinâmica de acompanhar a evolução da presença digital da sua marca.",
  },
  {
    title: "Portal do Cliente",
    desc: "Cada cliente pode acompanhar suas informações em um ambiente organizado, reservado e mais profissional.",
  },
  {
    title: "Melhores dias e horários para postar",
    desc: "As decisões de publicação passam a considerar janelas mais favoráveis, ajudando a dar mais direção ao planejamento.",
  },
];

function ProfessionalManagementSection() {
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
              marginBottom: 32,
            }}
          >
            O que torna nossa gestão mais profissional
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 760,
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 56,
            }}
          >
            Mais do que publicar conteúdo, o objetivo é criar uma operação que funcione com clareza, previsibilidade e acompanhamento. Isso reduz ruído, acelera decisões e melhora a percepção de profissionalismo da sua marca.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 24,
            }}
          >
            {professionalAdvantages.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                style={{
                  borderRadius: 16,
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "28px 24px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1rem, 1.8vw, 1.18rem)",
                    color: "var(--text-primary)",
                    marginBottom: 12,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.75,
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

// ─── 5. HOW IT WORKS ─────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Diagnóstico e direcionamento",
    desc: "Entendemos o momento da sua marca, seus objetivos, seu posicionamento e as necessidades da sua comunicação para estruturar uma linha editorial mais coerente.",
  },
  {
    num: "02",
    title: "Planejamento e produção",
    desc: "Organizamos os temas, desenvolvemos os conteúdos, ajustamos linguagem e formato e deixamos cada publicação alinhada à proposta da sua marca.",
  },
  {
    num: "03",
    title: "Aprovação facilitada",
    desc: "Você analisa os conteúdos com mais praticidade, faz observações quando necessário e mantém o processo avançando com mais fluidez.",
  },
  {
    num: "04",
    title: "Publicação e acompanhamento",
    desc: "O conteúdo segue um planejamento organizado e a performance pode ser acompanhada com mais clareza por meio de relatórios e visualizações estruturadas.",
  },
];

function HowItWorksSection() {
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
                    color: "rgba(201,168,76,0.3)",
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

// ─── 6. WHY FIRMANT ───────────────────────────────────────────────────────────

const reasons = [
  {
    title: "Processo mais claro",
    desc: "A diferença não está apenas em produzir posts bonitos. Está em criar um fluxo que ajude sua marca a comunicar melhor, aprovar com mais facilidade e manter consistência.",
  },
  {
    title: "Mais controle para o cliente",
    desc: "Você acompanha o que está sendo produzido, revisa com mais praticidade e tem mais clareza sobre o andamento da operação.",
  },
  {
    title: "Consistência visual e editorial",
    desc: "Cada peça segue uma lógica de comunicação alinhada ao posicionamento da marca, evitando publicações soltas e desconectadas.",
  },
  {
    title: "Acompanhamento mais profissional",
    desc: "A presença digital deixa de depender de trocas manuais e passa a ter mais organização, visibilidade e leitura clara dos próximos passos.",
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
            Por que a Firmant entrega uma gestão mais profissional
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 760,
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 56,
            }}
          >
            Quando a gestão é bem estruturada, a presença digital deixa de ser uma obrigação confusa e passa a funcionar como parte real da estratégia do negócio.
          </motion.p>
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
                  borderLeft: "2px solid var(--accent-gold)",
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

// ─── 7. CTA ───────────────────────────────────────────────────────────────────

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
            Pare de tratar suas redes sociais no improviso.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 520,
              margin: "0 auto 40px",
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Tenha uma operação mais organizada, visualmente consistente e mais fácil de acompanhar. Fale com a Firmant e receba uma análise inicial da sua presença digital.
          </motion.p>
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
                backgroundColor: "var(--accent-gold)",
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero minha análise gratuita
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function GestaoRedesSociaisPage() {
  return (
    <>
      <HeroSection />
      <PriceSection />
      <WhatWeDoSection />
      <ProfessionalManagementSection />
      <HowItWorksSection />
      <WhyFirmantSection />
      <CTASection />
    </>
  );
}
