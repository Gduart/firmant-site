"use client";

import { motion, type Variants, useInView } from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeCurve },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger} style={style}>
      {children}
    </motion.div>
  );
}

const inner: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 48px",
};

const GREEN = "#34D399";

type CardContent = {
  title: string;
  desc: string;
};

type PriceCard = {
  title: string;
  price: string;
  time: string;
  details?: string;
};

const solutions: CardContent[] = [
  {
    title: "Sistemas internos e painéis operacionais",
    desc: "Aplicações para centralizar processos, cadastros, fluxos, tarefas, pedidos, aprovações e rotinas internas com mais controle e menos improviso.",
  },
  {
    title: "Portais do cliente e áreas logadas",
    desc: "Ambientes com acesso restrito para acompanhamento, solicitações, documentos, relatórios, contratos, chamados e relacionamento contínuo com o cliente.",
  },
  {
    title: "Apps mobile para operação e atendimento",
    desc: "Aplicativos para agendamento, catálogo, delivery, atendimento, equipe externa, visitas técnicas, força de vendas e experiências mobile sob medida.",
  },
  {
    title: "Plataformas com automações e integrações",
    desc: "Soluções que conectam pagamentos, WhatsApp, e-mail, CRM, ERP, planilhas, webhooks e fluxos automatizados para reduzir trabalho manual.",
  },
  {
    title: "Dashboards, relatórios e monitoramento",
    desc: "Painéis e sistemas de acompanhamento para visualizar indicadores, produtividade, operação, performance comercial e tomada de decisão.",
  },
  {
    title: "APIs, backends e funcionalidades com IA",
    desc: "Estruturas técnicas que sustentam aplicações mais robustas, integrações, autenticação, lógica de negócio, inteligência operacional e recursos avançados.",
  },
];

const businessValue: CardContent[] = [
  {
    title: "Processos mais organizados",
    desc: "A operação deixa de depender de controles espalhados, mensagens soltas e decisões improvisadas.",
  },
  {
    title: "Menos retrabalho manual",
    desc: "Automatizações, integrações e fluxos estruturados reduzem esforço repetitivo e liberam tempo para atividades mais importantes.",
  },
  {
    title: "Mais visibilidade e controle",
    desc: "Com dashboards, áreas logadas e painéis, o negócio ganha clareza sobre o que está acontecendo e o que precisa de atenção.",
  },
  {
    title: "Mais escala com menos fricção",
    desc: "Uma boa aplicação ajuda a empresa a crescer sem transformar o aumento de demanda em caos operacional.",
  },
];

const steps = [
  {
    num: "01",
    title: "Diagnóstico e escopo",
    desc: "Entendemos a dor real do negócio, os gargalos da operação e o que a aplicação precisa resolver na prática.",
  },
  {
    num: "02",
    title: "Proposta técnica clara",
    desc: "Você recebe uma visão objetiva do que será construído, como a aplicação será estruturada e quais entregas fazem sentido para a sua necessidade.",
  },
  {
    num: "03",
    title: "Desenvolvimento iterativo",
    desc: "Construímos em ciclos curtos, com acompanhamento, validação e ajustes ao longo do processo.",
  },
  {
    num: "04",
    title: "Entrega e evolução",
    desc: "A aplicação é entregue com acompanhamento inicial, suporte de implantação e base preparada para crescer com o negócio.",
  },
];

const appCards: PriceCard[] = [
  {
    title: "Aplicação web sob medida — MVP",
    price: "R$ 7.997+",
    time: "15–30 dias",
    details:
      "Aplicação ideal para validar uma ideia, estruturar uma operação inicial ou transformar um processo manual em um sistema funcional. O cliente pode esperar uma solução web enxuta, com foco no essencial do projeto, telas principais, regras básicas de negócio, fluxo central de uso, painel inicial e base pronta para evolução futura.",
  },
  {
    title: "Sistema web com área logada e operação interna",
    price: "R$ 12.997+",
    time: "20–45 dias",
    details:
      "Solução indicada para empresas que precisam organizar processos internos, centralizar informações e dar acesso restrito para equipe, clientes ou parceiros. O cliente pode esperar área logada, níveis de acesso, gestão de dados, rotinas operacionais, painéis de acompanhamento e estrutura mais robusta para uso recorrente no dia a dia.",
  },
  {
    title: "App mobile iOS + Android",
    price: "R$ 19.997+",
    time: "45–90 dias",
    details:
      "Aplicação pensada para negócios que precisam de experiência mobile mais direta, prática e acessível para usuários finais ou equipes em campo. O cliente pode esperar um app com interface adaptada para celular, navegação fluida, funcionalidades sob medida, integração com backend e estrutura preparada para publicação e crescimento da operação.",
  },
  {
    title: "Plataforma integrada com automações e backend",
    price: "Sob escopo",
    time: "Sob diagnóstico",
    details:
      "Projeto voltado para operações mais complexas, que exigem integrações, automações e regras de negócio mais avançadas. O cliente pode esperar uma solução mais completa, com backend estruturado, conexão entre sistemas, fluxos automáticos, processamento de dados, integrações via API e arquitetura pensada para maior escala e desempenho.",
  },
  { title: "Manutenção e evolução contínua", price: "A partir de R$ 297/mês", time: "Contínuo" },
  { title: "Consultoria técnica", price: "R$ 197/hora", time: "Sob demanda" },
];

function HeroSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 120, paddingBottom: 80 }}>
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
            04 — Aplicações Web & Mobile para Negócios
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              marginBottom: 32,
              maxWidth: 940,
            }}
          >
            A aplicação que o seu negócio precisa. {" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #6EE7B7 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Sob medida, com visão técnica e foco real na operação.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 720,
              fontSize: "1.1rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: 48,
            }}
          >
            Criamos aplicações web e mobile para empresas que precisam organizar processos, centralizar informações, automatizar rotinas e entregar uma experiência mais funcional para clientes, equipe e operação.
          </motion.p>

          <motion.div variants={fadeInUp} style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
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
              Monte seu pacote
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SolutionIcon({ index }: { index: number }) {
  const icons = [
    <path key="panel" d="M3 4h18v14H3zM7 8h4M7 12h10M7 16h7" />,
    <path key="lock" d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3" />,
    <path key="mobile" d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01" />,
    <path key="flow" d="M4 6h6v6H4zM14 12h6v6h-6zM10 9h4M12 9v6" />,
    <path key="chart" d="M4 19V5M8 17v-6M13 17V8M18 17v-9M3 19h18" />,
    <path key="api" d="M8 9 5 12l3 3M16 9l3 3-3 3M14 5l-4 14" />,
  ];

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[index]}
    </svg>
  );
}

function WhatWeDoSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 48 }}>
            Aplicações que resolvem problemas reais do negócio
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 32 }}>
            {solutions.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                style={{ borderRadius: 16, border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-card)", padding: "32px 28px" }}
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
                  <SolutionIcon index={index} />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.1rem, 2vw, 1.3rem)", color: "var(--text-primary)", marginBottom: 16 }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function BusinessValueSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 56 }}>
            O que uma aplicação bem construída entrega para o seu negócio
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 32 }}>
            {businessValue.map((item) => (
              <motion.div key={item.title} variants={fadeInUp} style={{ borderLeft: `2px solid ${GREEN}`, paddingLeft: 24 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "var(--text-primary)", marginBottom: 12 }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 56 }}>
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
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: `${GREEN}44`, lineHeight: 1 }}>
                  {step.num}
                </span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", color: "var(--text-primary)", marginBottom: 14 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function PriceCardItem({ card, onSelect }: { card: PriceCard; onSelect: (card: PriceCard) => void }) {
  const isInteractive = Boolean(card.details);

  return (
    <motion.button
      type="button"
      variants={fadeInUp}
      onClick={() => {
        if (isInteractive) onSelect(card);
      }}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        border: isInteractive ? `1px solid ${GREEN}33` : "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-card)",
        padding: "28px 24px",
        cursor: isInteractive ? "pointer" : "default",
        boxShadow: isInteractive ? "0 18px 60px rgba(0, 0, 0, 0.18)" : "none",
        transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
      }}
      whileHover={isInteractive ? { y: -4, borderColor: `${GREEN}88`, boxShadow: "0 26px 80px rgba(0, 0, 0, 0.28)" } : undefined}
    >
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.4 }}>
        {card.title}
      </p>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)", fontWeight: 700, color: GREEN, marginBottom: 8, lineHeight: 1.1 }}>
        {card.price}
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginBottom: isInteractive ? 18 : 0 }}>{card.time}</p>
      {isInteractive && (
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Ver detalhes
        </span>
      )}
    </motion.button>
  );
}

function PriceDetailModal({ card, onClose }: { card: PriceCard; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 24,
        backgroundColor: "rgba(2, 6, 23, 0.82)",
        backdropFilter: "blur(14px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: easeCurve }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        style={{
          width: "min(100%, 760px)",
          borderRadius: 28,
          border: `1px solid ${GREEN}33`,
          background:
            "radial-gradient(circle at 16% 0%, rgba(52, 211, 153, 0.16), transparent 34%), linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98))",
          boxShadow: "0 36px 110px rgba(0, 0, 0, 0.52)",
          padding: "clamp(28px, 4vw, 44px)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 38,
            height: 38,
            borderRadius: 999,
            border: "1px solid var(--border-primary)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <span style={{ display: "inline-block", marginBottom: 18, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN }}>
          Modelo de entrega
        </span>
        <h3 style={{ maxWidth: 620, marginBottom: 22, fontFamily: "var(--font-heading)", fontSize: "clamp(1.7rem, 4vw, 2.6rem)", lineHeight: 1.08, color: "var(--text-primary)" }}>
          {card.title}
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <span style={{ borderRadius: 999, border: `1px solid ${GREEN}44`, padding: "10px 16px", fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: GREEN }}>
            {card.price}
          </span>
          <span style={{ borderRadius: 999, border: "1px solid var(--border-primary)", padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
            Prazo: {card.time}
          </span>
        </div>

        <p style={{ marginBottom: 34, fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
          {card.details}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <Link
            href="/contato"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              backgroundColor: GREEN,
              color: "var(--navy-950)",
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            Quero avaliação técnica
          </Link>
          <Link
            href="/monte-seu-pacote"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: `1px solid ${GREEN}55`,
              padding: "14px 28px",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: GREEN,
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            Monte seu pacote
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PriceSection() {
  const [selectedCard, setSelectedCard] = useState<PriceCard | null>(null);

  useEffect(() => {
    if (!selectedCard) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCard(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCard]);

  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 18 }}>
            Modelos de entrega para aplicações sob medida
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: 820, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: 48 }}>
            Os valores variam conforme escopo, complexidade, integrações, regras de negócio, número de usuários, áreas logadas, automações e necessidades mobile.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
            {appCards.map((card) => (
              <PriceCardItem key={card.title} card={card} onSelect={setSelectedCard} />
            ))}
          </div>
          <motion.p variants={fadeInUp} style={{ marginTop: 24, maxWidth: 880, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)" }}>
            Projetos de maior complexidade podem combinar aplicação web, mobile, integrações, automações, APIs e camadas inteligentes em uma única solução.
          </motion.p>
        </AnimatedSection>
      </div>
      {selectedCard && <PriceDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 88, paddingBottom: 88, textAlign: "center" }}>
      <div style={{ ...inner, maxWidth: 900 }}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 22 }}>
            Se o seu negócio já sente o limite das soluções improvisadas, talvez seja hora de estruturar uma aplicação própria.
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.85, color: "var(--text-secondary)", marginBottom: 36 }}>
            A FIRMANT desenvolve aplicações pensadas para resolver operação, atendimento, fluxo, controle e crescimento com mais clareza e menos atrito.
          </motion.p>
          <motion.div variants={fadeInUp} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 }}>
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
                textDecoration: "none",
              }}
            >
              Monte seu pacote
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default function DesenvolvimentoPage() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <BusinessValueSection />
      <HowItWorksSection />
      <PriceSection />
      <CTASection />
    </>
  );
}
