"use client";

import { motion, type Variants, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./home.module.css";

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: easeCurve },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedSection({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const services = [
  {
    title: "Vídeo & UGC com IA",
    description: "Reels, Stories, Shorts e vídeos UGC com IA para sua marca aparecer com mais profissionalismo, velocidade e consistência.",
    href: "/edicao-video-ugc",
    number: "01",
  },
  {
    title: "Gestão de Redes Sociais",
    description: "Planejamento, criação, aprovação e publicação de conteúdos com método, IA e revisão humana.",
    href: "/gestao-redes-sociais",
    number: "02",
  },
  {
    title: "Desenvolvimento Web",
    description: "Sites, landing pages e soluções digitais sob medida para transformar sua presença online em uma operação mais profissional.",
    href: "/desenvolvimento",
    number: "03",
  },
];

const WHATSAPP_GENERAL =
  "https://wa.me/5511914912488?text=Ol%C3%A1%2C%20quero%20entender%20qual%20pacote%20da%20FIRMANT%20faz%20mais%20sentido%20para%20minha%20empresa.";

const approachSteps = [
  { title: "Entender", description: "Alinhamos objetivos, público e escopo em um briefing claro." },
  { title: "Criar", description: "Produzimos com apoio de IA, direção criativa e revisão humana." },
  { title: "Aprovar e entregar", description: "Você avalia o trabalho, alinhamos os ajustes e finalizamos a entrega." },
];

const faqs = [
  {
    question: "Como funciona a inteligência artificial nos serviços da Firmant?",
    answer: "A IA opera nos bastidores como infraestrutura de eficiência. Ela gera rascunhos, automatiza edições e acelera processos — mas cada entrega passa por revisão humana antes de chegar até você. O resultado é mais volume, mais qualidade e mais velocidade.",
  },
  {
    question: "Preciso ter conhecimento técnico para contratar?",
    answer: "Não. O processo é simples: você nos conta o que precisa, nós entregamos pronto. Sem jargão técnico, sem reuniões intermináveis. Briefing claro, execução rápida, entrega profissional.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer: "Aceitamos Pix, cartão de crédito com parcelamento e boleto bancário — tudo por meio de checkout seguro com total proteção dos dados.",
  },
  {
    question: "Posso combinar serviços diferentes?",
    answer: "Sim! Na página Monte Seu Pacote, você pode combinar gestão de redes sociais, vídeos, UGC e desenvolvimento. Pacotes combinados têm desconto de até 33%.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "Publicações para redes sociais: 3-5 dias úteis. Vídeos editados: 5-7 dias úteis. UGC com IA: 3-5 dias úteis. Projetos de desenvolvimento: variável conforme escopo, com entregas parciais semanais.",
  },
];

// ─── Seção: HERO ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* vídeo de fundo */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) saturate(1.3) contrast(1.05)" }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
        </video>
        {/* Overlay em camadas: topo leve p/ navbar, meio suave, baixo sólido p/ texto */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,22,40,0.45) 0%, rgba(10,22,40,0.25) 30%, rgba(10,22,40,0.55) 65%, rgba(10,22,40,0.95) 100%)" }} />
        {/* Vinheta lateral — integra o vídeo nas bordas */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.6) 100%)" }} />
      </div>

      <div className={styles.heroContent} style={{ position: "relative", zIndex: 10, maxWidth: "1120px", margin: "0 auto", textAlign: "center" }}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeInUp}>
            <span
              style={{
                display: "inline-block",
                marginBottom: "40px",
                borderRadius: "999px",
                border: "1px solid rgba(201,168,76,0.3)",
                padding: "10px 24px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "var(--accent-gold)",
                fontFamily: "var(--font-body)",
              }}
            >
              Agência Digital com IA
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: "36px",
              fontSize: "clamp(2.3rem, 7vw, 6.2rem)",
              lineHeight: 1.04,
              letterSpacing: 0,
            }}
          >
            Sua marca em{" "}
            <span className="text-gradient">outro nível.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            style={{
              margin: "0 auto 48px",
              maxWidth: "760px",
              fontSize: "1.15rem",
              lineHeight: 1.9,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Vídeos, redes sociais, sites e aplicações web com estratégia, IA e revisão humana.
          </motion.p>

          <motion.div id="home-hero-actions" className={styles.heroActions} variants={fadeInUp}>
            <Link
              href="/monte-seu-pacote"
              className="group"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "999px",
                padding: "16px 40px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: "var(--accent-gold)",
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Montar meu pacote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              className={styles.heroSecondary}
              href={WHATSAPP_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "16px 40px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Conversar no WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}

// ─── Seção: SERVIÇOS ─────────────────────────────────────────────────────────
function ServicesSection() {
  const benefits = [
    { title: "Planejamento com direção", description: "Conteúdos organizados e adaptados aos formatos e canais da sua marca." },
    { title: "Aprovação simples", description: "Receba as prévias por link, envie seus ajustes e aprove antes da publicação." },
    { title: "Resultados mais claros", description: "Acompanhe a operação com relatórios e dashboards personalizados." },
  ];
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <AnimatedSection className={styles.sectionHeading}>
          <motion.span variants={fadeInUp} className={styles.eyebrow}>Nossos serviços</motion.span>
          <motion.h2 variants={fadeInUp}>Tudo que seu negócio <span className="text-gradient">precisa para crescer</span></motion.h2>
        </AnimatedSection>
        <div className={styles.services}>
          {services.map((service) => (
            <AnimatedSection key={service.title}>
              <motion.div variants={fadeInUp}>
                <Link href={service.href} className={`${styles.service} service-card-link`}>
                  <span className={styles.serviceNumber}>{service.number}</span>
                  <h3 className="service-title">{service.title}</h3>
                  <span className={`${styles.serviceArrow} service-arrow`} aria-hidden="true">↗</span>
                  <p>{service.description}</p>
                </Link>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection className={styles.socialSummary}>
          <motion.span variants={fadeInUp} className={styles.eyebrow}>Gestão de redes sociais</motion.span>
          <motion.h2 variants={fadeInUp}>Da estratégia à <span className="text-gradient">publicação.</span></motion.h2>
          <div className={styles.benefits}>
            {benefits.map((benefit, index) => (
              <motion.article variants={fadeInUp} key={benefit.title}>
                <span className={styles.eyebrow}>0{index + 1}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.article>
            ))}
          </div>
          <motion.p variants={fadeInUp} className={styles.planNote}>Recursos disponíveis em planos acima de 8 posts mensais, com análise detalhada do Instagram.</motion.p>
          <motion.div variants={fadeInUp}><Link className={styles.textLink} href="/gestao-redes-sociais#gestao-profissional">Conhecer a gestão de redes sociais <span aria-hidden="true">↗</span></Link></motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Seção: SOBRE ─────────────────────────────────────────────────────────────
function ApproachModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const controls = dialog?.querySelectorAll<HTMLElement>('button, a[href]');
    controls?.[0]?.focus();
    function containFocus(event: KeyboardEvent) {
      if (event.key !== "Tab" || !controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    dialog?.addEventListener("keydown", containFocus);
    return () => {
      dialog?.removeEventListener("keydown", containFocus);
      previousFocus?.focus();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "grid",
        placeItems: "center",
        padding: "24px",
        backgroundColor: "rgba(2, 6, 23, 0.84)",
        backdropFilter: "blur(16px)",
      }}
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.35, ease: easeCurve }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Conheça nossa abordagem"
        style={{
          position: "relative",
          width: "min(100%, 920px)",
          maxHeight: "min(86vh, 900px)",
          overflowY: "auto",
          borderRadius: "30px",
          border: "1px solid rgba(201,168,76,0.28)",
          background:
            "radial-gradient(circle at 16% 0%, rgba(201,168,76,0.16), transparent 34%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))",
          boxShadow: "0 40px 120px rgba(0,0,0,0.58)",
          padding: "clamp(30px, 5vw, 56px)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "grid",
            placeItems: "center",
            width: "40px",
            height: "40px",
            borderRadius: "999px",
            border: "1px solid var(--border-primary)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "22px",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <span
          style={{
            display: "block",
            marginBottom: "18px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.26em",
            color: "var(--accent-gold)",
            fontFamily: "var(--font-body)",
          }}
        >
          Sobre a FIRMANT
        </span>

        <h2
          style={{
            maxWidth: "720px",
            marginBottom: "34px",
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
          }}
        >
          IA nos bastidores.{" "}
          <span className="text-gradient">Você no controle.</span>
        </h2>

        <p className={styles.approachIntro}>Combinamos estratégia, criatividade e tecnologia para transformar sua necessidade em uma entrega alinhada à sua marca.</p>
        <ol className={styles.steps}>
          {approachSteps.map((step) => (
            <li key={step.title}><h3>{step.title}</h3><p>{step.description}</p></li>
          ))}
        </ol>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "40px" }}>
          <Link
            href="/monte-seu-pacote"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "999px",
              padding: "14px 30px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              backgroundColor: "var(--accent-gold)",
              color: "var(--navy-950)",
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            Montar meu pacote digital
          </Link>
          <a
            href={WHATSAPP_GENERAL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "999px",
              border: "1px solid rgba(201,168,76,0.44)",
              padding: "14px 30px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-gold)",
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            Falar com a FIRMANT no WhatsApp
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AboutSection() {
  const [isApproachOpen, setIsApproachOpen] = useState(false);

  useEffect(() => {
    if (!isApproachOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsApproachOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isApproachOpen]);

  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: "clamp(64px, 8vw, 120px)", paddingBottom: "clamp(64px, 8vw, 120px)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "clamp(32px, 6vw, 80px)",
            alignItems: "center",
          }}
        >
          <AnimatedSection>
            <motion.span
              variants={fadeInUp}
              style={{
                display: "block",
                marginBottom: "20px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "var(--accent-gold)",
                fontFamily: "var(--font-body)",
              }}
            >
              Sobre a Firmant
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "32px" }}
            >
              IA nos bastidores.
              <br />
              <span className="text-gradient">Você no controle.</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              style={{ fontSize: "1rem", lineHeight: 1.9, color: "var(--text-secondary)", fontFamily: "var(--font-body)", marginBottom: "24px" }}
            >
              Tecnologia para acelerar. Direção humana para cuidar da sua marca. Cada entrega combina estratégia, criatividade e revisão antes de chegar até você.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <button
                type="button"
                onClick={() => setIsApproachOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "999px",
                  border: "1px solid var(--accent-gold)",
                  padding: "14px 32px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--accent-gold)",
                  fontFamily: "var(--font-body)",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                Conheça nossa abordagem
              </button>
            </motion.div>
          </AnimatedSection>

          {/* Diferenciais da FIRMANT */}
          <AnimatedSection>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "clamp(16px, 3vw, 40px)",
              }}
            >
              {[
                { number: "Soluções integradas", label: "Vídeos, redes sociais, sites e aplicações web.", descriptive: true },
                { number: "IA", label: "Como infraestrutura" },
                { number: "100%", label: "Revisão humana" },
                { number: "Sob medida", label: "Escopo definido conforme os objetivos da sua marca.", descriptive: true },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid var(--border-primary)",
                    padding: "clamp(24px, 4vw, 40px) 16px",
                    textAlign: "center",
                    backgroundColor: "var(--bg-card)",
                    transition: "border-color 0.5s ease",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "12px",
                      fontSize: stat.descriptive ? "clamp(1rem, 1.8vw, 1.5rem)" : "clamp(2rem, 4vw, 2.8rem)",
                      lineHeight: stat.descriptive ? 1.3 : undefined,
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p
                    style={{
                      fontSize: stat.descriptive ? "14px" : "11px",
                      fontWeight: 500,
                      textTransform: stat.descriptive ? "none" : "uppercase",
                      letterSpacing: stat.descriptive ? "normal" : "0.2em",
                      lineHeight: stat.descriptive ? 1.6 : undefined,
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
      <AnimatePresence>
        {isApproachOpen && <ApproachModal onClose={() => setIsApproachOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

// ─── Seção: FAQ ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: "clamp(64px, 8vw, 120px)", paddingBottom: "clamp(64px, 8vw, 120px)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <AnimatedSection>
          <motion.span
            variants={fadeInUp}
            style={{
              display: "block",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "var(--accent-gold)",
              fontFamily: "var(--font-body)",
            }}
          >
            Perguntas Frequentes
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: "64px",
            }}
          >
            Tire suas <span className="text-gradient">dúvidas</span>
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              style={{
                borderTop: "1px solid var(--border-primary)",
                borderBottom: i === faqs.length - 1 ? "1px solid var(--border-primary)" : "none",
              }}
            >
              <button
                aria-expanded={openIndex === i}
                aria-controls={`home-faq-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "28px 0",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    paddingRight: "32px",
                    fontSize: "16px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    color: openIndex === i ? "var(--accent-gold)" : "var(--text-primary)",
                    transition: "color 300ms ease",
                  }}
                >
                  {faq.question}
                </span>
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "999px",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <motion.span
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: "18px",
                      lineHeight: 1,
                      color: "var(--accent-gold)",
                      display: "block",
                    }}
                  >
                    +
                  </motion.span>
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    id={`home-faq-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: easeCurve }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      style={{
                        paddingBottom: "28px",
                        fontSize: "15px",
                        lineHeight: 1.8,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Seção: CTA ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: "clamp(64px, 8vw, 120px)", paddingBottom: "clamp(64px, 8vw, 120px)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", textAlign: "center" }}>
        <AnimatedSection>
          <motion.h2
            variants={fadeInUp}
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "32px" }}
          >
            Pronto para transformar
            <br />
            <span className="text-gradient">seu negócio?</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: "480px",
              margin: "0 auto 48px",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Monte seu pacote personalizado e comece a ver resultados. Sem compromisso, sem burocracia.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "20px" }}
          >
            <Link
              href="/monte-seu-pacote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "999px",
                padding: "16px 40px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: "var(--accent-gold)",
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Montar meu pacote digital
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              href={WHATSAPP_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "16px 40px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Falar com a FIRMANT no WhatsApp
            </a>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
