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
            Sua marca precisa existir nas redes.{" "}
            <span className="text-gradient">Com estratégia, não com improviso.</span>
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
            Publicações completas — da copy à arte final — planejadas, criadas e entregues com inteligência artificial. Você envia o tema, nós transformamos em conteúdo que conecta.
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
  "Copy dedicada por publicação",
  "Design profissional com identidade visual",
  "Adaptação por plataforma",
  "1 revisão incluída por publicação",
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
    title: "Copy dedicada",
    desc: "Texto escrito especificamente para o seu público, no tom da sua marca, otimizado para cada plataforma. Não é template. Não é texto genérico. É comunicação pensada para gerar conexão e engajamento real.",
  },
  {
    title: "Criação visual completa",
    desc: "Imagens, artes para carrossel, capas e peças gráficas criadas sob medida. Cada publicação segue a identidade visual do seu negócio, mantendo consistência profissional em todo o feed.",
  },
  {
    title: "Adaptação por plataforma",
    desc: "O que funciona no Instagram não funciona igual no LinkedIn ou no TikTok. Adaptamos formato, linguagem e abordagem para cada rede onde sua marca precisa estar.",
  },
  {
    title: "Calendário e planejamento",
    desc: "Nada é publicado no improviso. Cada conteúdo faz parte de uma estratégia pensada para construir presença, engajamento e relevância ao longo do tempo.",
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
            Cuidamos de tudo o que envolve a publicação nas redes sociais do seu negócio. Você nos envia o tema — uma promoção, um lançamento, um bastidor, um posicionamento — e nós devolvemos a publicação pronta. Completa. Pronta para postar.
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

// ─── 4. HOW IT WORKS ─────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Entendemos a sua marca",
    desc: "Antes de criar qualquer conteúdo, mergulhamos no seu negócio — público-alvo, posicionamento, tom de voz, concorrentes, objetivos. Esse diagnóstico garante que cada publicação pareça sua, não de uma agência qualquer.",
  },
  {
    num: "02",
    title: "Você envia os temas",
    desc: "Pode ser uma lista de assuntos do mês, uma promoção pontual, um bastidor do dia. Nós recebemos a ideia e transformamos em publicação completa — texto, arte, hashtags, horário sugerido.",
  },
  {
    num: "03",
    title: "Você aprova e publica",
    desc: "Recebe o conteúdo pronto para revisar. Ajustes? Fazemos. Aprovado? Vai pro ar. Simples assim.",
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

// ─── 5. WHY FIRMANT ───────────────────────────────────────────────────────────

const reasons = [
  {
    title: "Mais volume sem perder qualidade",
    desc: "Enquanto um social media tradicional luta para entregar 12 posts no mês, nós entregamos mais — e cada um deles é pensado, não improvisado.",
  },
  {
    title: "Consistência visual garantida",
    desc: "Cada peça segue o padrão da sua marca. Seu feed conta uma história visual coerente, não uma colagem de estilos diferentes.",
  },
  {
    title: "Conteúdo que respeita o algoritmo",
    desc: "Carrosséis, imagens únicas, textos otimizados — cada formato é usado de forma estratégica para maximizar alcance e engajamento.",
  },
  {
    title: "Você foca no seu negócio",
    desc: "Criar conteúdo para redes sociais não deveria ser mais uma tarefa na sua lista. Deveria ser algo que funciona enquanto você cuida do que realmente importa.",
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
            Pare de improvisar nas redes sociais.
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
            Fale com a Firmant e receba uma análise gratuita do perfil do seu negócio.
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
      <HowItWorksSection />
      <WhyFirmantSection />
      <CTASection />
    </>
  );
}
