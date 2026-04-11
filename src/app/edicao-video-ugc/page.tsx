"use client";

import { motion, type Variants, useInView } from "framer-motion";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
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

const CYAN = "#22D3EE";
const PURPLE = "#A78BFA";

const videoShowcase = [
  {
    title: "UGC",
    label: "Creator style",
    src: "/videos/ugc/ugc.mp4",
    poster: "/hero-poster.jpg",
  },
  {
    title: "Influencer",
    label: "Apresentação de oferta",
    src: "/videos/ugc/influencer.mp4",
    poster: "/hero-poster.jpg",
  },
  {
    title: "Tecnologia IA",
    label: "Demonstração visual",
    src: "/videos/ugc/ia.mp4",
    poster: "/hero-poster.jpg",
  },
  {
    title: "Transformers em Ação",
    label: "Impacto e retenção",
    src: "/videos/ugc/transformers.mp4",
    poster: "/hero-poster.jpg",
  },
];

const modalities = [
  {
    title: "Vídeos curtos para redes sociais",
    text: "Criamos vídeos para Reels, Stories, Shorts e outros formatos verticais com linguagem atual, estrutura clara e foco em retenção, apresentação e resultado.",
    accent: CYAN,
  },
  {
    title: "UGC para marcas",
    text: "Criamos vídeos no estilo creator, com linguagem mais próxima do consumidor, ideais para apresentar produtos, gerar identificação e reforçar autenticidade na comunicação.",
    accent: PURPLE,
  },
  {
    title: "Vídeos para campanhas, ofertas e anúncios",
    text: "Conteúdos pensados para destacar produto, proposta, benefício e argumento comercial em campanhas, lançamentos, tráfego pago e páginas de venda.",
    accent: "var(--accent-gold)",
  },
];

const benefits = [
  "Mais velocidade para colocar vídeos no ar",
  "Menos dependência de uma produção tradicional pesada",
  "Conteúdo com linguagem mais atual de plataforma",
  "Mais consistência visual e comercial",
  "Mais flexibilidade para campanhas, redes e anúncios",
  "Vídeos criados para atenção, explicação e conversão",
];

const deliverables = [
  "Vídeos curtos prontos para Reels, Stories, Shorts e campanhas",
  "Conteúdo visual estruturado para produtos, serviços e ofertas",
  "Vídeos com linguagem mais atual e ritmo de plataforma",
  "Opções de vídeos em estilo UGC",
  "Materiais pensados para redes, páginas, anúncios e apresentações comerciais",
  "Entregas organizadas para marcas que precisam comunicar melhor em vídeo",
];

const processSteps = [
  "Você envia briefing, objetivo, produto, oferta ou referências",
  "A Firmant define o melhor formato e direção do vídeo",
  "Criamos o conteúdo em vídeo com base na proposta da marca",
  "Você revisa e aprova",
  "Recebe o material pronto para publicar, anunciar ou apresentar",
];

const reasons = [
  {
    title: "Vídeos pensados para negócios",
    desc: "Cada peça nasce com objetivo de comunicação, presença e aplicação comercial, e não apenas como material visual isolado.",
  },
  {
    title: "Mais velocidade para produzir",
    desc: "Sua marca ganha agilidade para transformar ideias, ofertas e produtos em conteúdo em vídeo de forma mais leve e organizada.",
  },
  {
    title: "Feito para plataforma e para resultado",
    desc: "Os vídeos são pensados para o contexto real de uso, seja em redes sociais, anúncios, campanhas ou apresentação de produto.",
  },
  {
    title: "Mais consistência, menos fricção",
    desc: "Ideal para marcas que precisam produzir com frequência sem transformar vídeo em uma operação pesada e travada.",
  },
];

function HeroSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 120, paddingBottom: 88 }}>
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
            02 — Vídeos para Negócios & UGC
          </motion.span>

          <div className="ugc-hero-layout">
            <div>
              <motion.h1
                variants={fadeInUp}
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--text-primary)",
                  marginBottom: 28,
                  maxWidth: 760,
                }}
              >
                Vídeos que chamam atenção, explicam valor e ajudam sua marca a vender.
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                style={{
                  maxWidth: 680,
                  fontSize: "1.1rem",
                  lineHeight: 1.85,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  marginBottom: 44,
                }}
              >
                Criamos vídeos para negócios em formatos curtos, UGC e conteúdos visuais de alto impacto para redes sociais, campanhas, anúncios e ofertas.
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
                    backgroundColor: CYAN,
                    color: "var(--navy-950)",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    textDecoration: "none",
                  }}
                >
                  Quero produzir vídeos para minha marca
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
                  Monte seu pacote
                </Link>
              </motion.div>
            </div>

            <motion.div className="ugc-video-grid" variants={stagger}>
              {videoShowcase.map((video) => (
                <motion.div
                  key={video.title}
                  variants={fadeInUp}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    aspectRatio: "9 / 16",
                    minHeight: 340,
                    backgroundColor: "#06101f",
                    border: "1px solid rgba(34,211,238,0.2)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                  }}
                >
                  <video
                    src={video.src}
                    poster={video.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(3,10,20,0.05) 35%, rgba(3,10,20,0.86) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: CYAN,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {video.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                      {video.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type PriceRow = { label: string; unit: string; two: string; three: string; four: string; five: string };

const videoRows: PriceRow[] = [
  { label: "Story 8s", unit: "R$97", two: "R$89", three: "R$82", four: "R$77", five: "R$69" },
  { label: "Reel 16s", unit: "R$149", two: "R$139", three: "R$129", four: "R$119", five: "R$109" },
  { label: "Reel 30s", unit: "R$219", two: "R$199", three: "R$189", four: "R$179", five: "R$159" },
  { label: "Reel 1min", unit: "R$349", two: "R$319", three: "R$299", four: "R$279", five: "R$249" },
];

const ugcRows: PriceRow[] = [
  { label: "UGC 8s", unit: "R$129", two: "R$119", three: "R$109", four: "R$99", five: "R$89" },
  { label: "UGC 16s", unit: "R$197", two: "R$179", three: "R$169", four: "R$159", five: "R$139" },
  { label: "UGC 30s", unit: "R$297", two: "R$269", three: "R$249", four: "R$229", five: "R$199" },
  { label: "UGC 1min", unit: "R$449", two: "R$399", three: "R$379", four: "R$349", five: "R$299" },
];

const colHeaders = ["Formato", "Unitário", "2 vídeos", "3 vídeos", "4 vídeos", "5+ vídeos"];

function PricingTable({ rows, accent }: { rows: PriceRow[]; accent: string }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)" }}>
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
            <tr key={row.label} style={{ backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
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

function PositioningSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ ...inner, maxWidth: 1060 }}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 24 }}>
            Sua marca precisa de vídeo. O problema é depender de uma operação pesada para isso.
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
            Criar vídeos com consistência costuma exigir tempo, alinhamento, produção, aprovação e frequência. A Firmant simplifica esse processo com criação de vídeos para negócios, formatos curtos e UGC, ajudando sua marca a comunicar melhor, aparecer com mais força e transformar ideias em conteúdo com aplicação real.
          </motion.p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ModalitiesSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 48 }}>
            Formatos de vídeo para diferentes necessidades da sua marca
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28 }}>
            {modalities.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                style={{ borderRadius: 18, border: `1px solid ${item.accent}33`, backgroundColor: "var(--bg-card)", padding: "34px 30px" }}
              >
                <div style={{ width: 42, height: 3, borderRadius: 999, backgroundColor: item.accent, marginBottom: 22 }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.1rem, 2vw, 1.3rem)", color: "var(--text-primary)", marginBottom: 16 }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 42 }}>
            O que sua marca ganha com esse serviço
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18 }}>
            {benefits.map((item) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px 22px", borderRadius: 14, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
              >
                <span style={{ color: CYAN, fontSize: 18, lineHeight: 1 }}>+</span>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)" }}>{item}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function WhatWeDeliverSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 42 }}>
            O que entregamos
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 18 }}>
            {deliverables.map((item, index) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                style={{ padding: "24px 26px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)" }}
              >
                <span style={{ display: "block", marginBottom: 14, fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: index % 2 === 0 ? CYAN : PURPLE }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)" }}>{item}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 48 }}>
            Como funciona na prática
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gap: 18 }}>
            {processSteps.map((step, index) => (
              <motion.div
                key={step}
                variants={fadeInUp}
                style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 22, alignItems: "center", padding: "22px 24px", borderRadius: 16, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", fontWeight: 800, color: CYAN }}>{String(index + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)" }}>{step}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function WhyFirmantSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 56 }}>
            Por que a Firmant
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 32 }}>
            {reasons.map((r) => (
              <motion.div key={r.title} variants={fadeInUp} style={{ borderLeft: `2px solid ${CYAN}`, paddingLeft: 24 }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "var(--text-primary)", marginBottom: 12 }}>{r.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)" }}>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function PriceSection() {
  const [activeTab, setActiveTab] = useState<"video" | "ugc">("video");

  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.span
            variants={fadeInUp}
            style={{ display: "inline-block", marginBottom: 18, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: CYAN, fontFamily: "var(--font-body)" }}
          >
            Vídeos para Negócios & UGC
          </motion.span>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 18 }}>
            Modelos de entrega para diferentes formatos de vídeo
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: 720, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: 40 }}>
            Escolha o formato ideal conforme o objetivo da sua marca, a profundidade da mensagem e o volume de peças necessárias.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div variants={fadeInUp} style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid var(--border-primary)" }}>
            {(["video", "ugc"] as const).map((tab) => {
              const label = tab === "video" ? "Vídeos para Negócios" : "UGC para Marcas";
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
          <motion.div key={activeTab} variants={fadeInUp} initial="hidden" animate="visible">
            {activeTab === "video" ? <PricingTable rows={videoRows} accent={CYAN} /> : <PricingTable rows={ugcRows} accent={PURPLE} />}
          </motion.div>
          <motion.p variants={fadeInUp} style={{ marginTop: 22, fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)" }}>
            Os formatos podem ser combinados conforme a rotina de conteúdo, necessidade da campanha ou objetivo comercial da sua marca.
          </motion.p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 88, paddingBottom: 88, textAlign: "center" }}>
      <div style={{ ...inner, maxWidth: 860 }}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: 22 }}>
            Comece a criar vídeos com mais impacto, clareza e consistência.
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.85, color: "var(--text-secondary)", marginBottom: 36 }}>
            Se a sua marca precisa aparecer melhor, comunicar valor com mais força e transformar ideias em conteúdo em vídeo com aplicação real, a Firmant pode estruturar isso com mais praticidade.
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
                backgroundColor: CYAN,
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                textDecoration: "none",
              }}
            >
              Quero produzir vídeos para minha marca
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

export default function EdicaoVideoUGCPage() {
  return (
    <>
      <HeroSection />
      <PositioningSection />
      <ModalitiesSection />
      <BenefitsSection />
      <WhatWeDeliverSection />
      <ProcessSection />
      <WhyFirmantSection />
      <PriceSection />
      <CTASection />
    </>
  );
}
