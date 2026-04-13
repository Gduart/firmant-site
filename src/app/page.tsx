"use client";

import { motion, type Variants, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
    title: "Gestão de Redes Sociais",
    description: "Da copy à arte final — planejadas, criadas e entregues com IA. Você envia o tema, nós devolvemos a publicação pronta.",
    href: "/gestao-redes-sociais",
    number: "01",
  },
  {
    title: "Vídeo & UGC com IA",
    description: "Reels, Stories e Shorts editados profissionalmente + conteúdo UGC com avatares de IA que vendem por você.",
    href: "/edicao-video-ugc",
    number: "02",
  },
  {
    title: "Desenvolvimento Web/Mobile",
    description: "Aplicações sob medida em Python — do MVP ao sistema completo — com desenvolvimento assistido por IA.",
    href: "/desenvolvimento",
    number: "03",
  },
];

const socialMediaCapabilities = [
  {
    title: "Gestão centralizada da operação",
    description: "Organizamos diferentes marcas, canais e rotinas em um ambiente mais centralizado, reduzindo dispersão e trazendo mais controle para cada cliente.",
  },
  {
    title: "Agendamento em múltiplos formatos e redes",
    description: "Planejamos e distribuímos conteúdos em diferentes formatos e plataformas para manter constância, adaptação por canal e presença mais profissional.",
  },
  {
    title: "Melhores dias e horários para postar",
    description: "A publicação deixa de ser baseada apenas em hábito ou tentativa e passa a considerar janelas mais estratégicas para cada rede.",
  },
  {
    title: "Workflow de criação e aprovação",
    description: "Nós fazemos a postagem na sua rede e você somente aprova. O processo entre criação, revisão, ajustes e validação final fica mais claro, com menos ruído e mais organização operacional.",
  },
  {
    title: "Aprovação facilitada por link e WhatsApp",
    description: "O cliente pode aprovar conteúdos de forma prática, com menos atrito e mais agilidade no retorno, sem depender de processos complicados.",
  },
  {
    title: "Relatórios profissionais e dashboards personalizados",
    description: "Os dados passam a ser apresentados com mais clareza, organização e personalização, ajudando na leitura dos resultados e na tomada de decisão.",
  },
  {
    title: "Envio automático de relatórios",
    description: "Acompanhamentos podem ser estruturados em rotina, com entregas recorrentes que reforçam constância e profissionalismo.",
  },
  {
    title: "Portal do Cliente com acesso individual",
    description: "Cada cliente pode ter login e senha para acessar seu ambiente, visualizar dados e acompanhar informações de forma mais organizada e reservada.",
  },
  {
    title: "Dashboard online para acompanhamento contínuo",
    description: "Em vez de depender apenas de PDFs ou mensagens, o cliente pode acompanhar métricas em um painel online, de forma mais visual e contínua.",
  },
  {
    title: "Inteligência artificial para escala e agilidade",
    description: "Recursos de IA ajudam a acelerar a produção, gerar variações por rede e apoiar decisões com mais inteligência operacional.",
  },
  {
    title: "Análise de concorrentes para decisões melhores",
    description: "A comparação com concorrentes ajuda a ajustar formatos, frequência, horários e direção estratégica com menos achismo.",
  },
];

const approachParagraphs = [
  "Na FIRMANT, acreditamos que marcas não precisam apenas de mais conteúdo. Precisam de uma operação mais inteligente, mais organizada e mais estratégica por trás da comunicação.",
  "Nossa abordagem combina estratégia, criatividade, estrutura operacional e inteligência artificial aplicada para tornar o marketing mais claro, mais ágil e mais profissional. A IA atua nos bastidores para acelerar etapas, apoiar análises, ampliar possibilidades, adaptar conteúdos por formato e dar mais eficiência à execução. Mas a direção da marca, a leitura do contexto, o refinamento da comunicação e as decisões que realmente importam continuam sendo conduzidos com critério, visão humana e acompanhamento próximo.",
  "Isso significa que sua empresa não fica presa a processos improvisados, trocas soltas ou ações sem direção. Em vez disso, passa a contar com uma estrutura que organiza a produção, facilita aprovações, melhora a consistência da comunicação, amplia a capacidade de execução e traz mais visibilidade sobre o que está sendo feito.",
  "Na prática, usamos a tecnologia para reduzir fricção, ganhar velocidade e aumentar a capacidade operacional, sem abrir mão da identidade da marca, da clareza da mensagem e do foco comercial. O resultado é uma comunicação mais alinhada, uma operação mais previsível e uma presença digital mais preparada para transmitir valor, gerar confiança e sustentar crescimento.",
  "A FIRMANT entende que o marketing mais forte hoje não nasce apenas da criatividade, nem apenas da tecnologia. Ele nasce da combinação entre visão estratégica, processos bem definidos, adaptação inteligente e execução orientada por resultado.",
  "Por isso, nossa abordagem foi construída para entregar mais do que peças ou publicações isoladas. Entregamos uma operação mais madura, mais consistente e mais preparada para ajudar sua marca a comunicar melhor, vender com mais força e crescer com mais clareza.",
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
    answer: "Aceitamos Pix, cartão de crédito (com parcelamento), cartão de débito e boleto bancário — tudo via Mercado Pago com total segurança.",
  },
  {
    question: "Posso combinar serviços diferentes?",
    answer: "Sim! Na página Monte Seu Pacote, você pode combinar gestão de redes sociais, vídeos, UGC e desenvolvimento. Pacotes combinados têm desconto de até 33%.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "Publicações para redes sociais: 3-5 dias úteis. Vídeos editados: 5-7 dias úteis. UGC com IA: 3-5 dias úteis. Projetos de desenvolvimento: variável conforme escopo, com entregas parciais semanais.",
  },
  {
    question: "Portal do Cliente com login individual: como funciona?",
    answer: "O cliente pode receber um login e uma senha para acessar seu ambiente. Esse acesso é configurado pela operação da agência e vinculado ao dashboard que foi criado para ele.",
  },
  {
    question: "Quem libera esse acesso?",
    answer: "A própria agência organiza e configura o acesso do cliente dentro da estrutura da operação, definindo credenciais e permissões de visualização.",
  },
  {
    question: "Acompanhamento contínuo por dashboard online: como funciona?",
    answer: "O cliente acessa um painel online com suas métricas em ambiente web. Assim, ele não depende apenas de PDF ou mensagens soltas para acompanhar evolução e resultados.",
  },
  {
    question: "Aprovação por link ou WhatsApp: o cliente precisa entrar em uma plataforma complexa?",
    answer: "Não. O conteúdo pode ser enviado por link, inclusive via WhatsApp, o que simplifica muito o processo de aprovação e acelera o retorno.",
  },
  {
    question: "Os relatórios podem ser enviados automaticamente?",
    answer: "Sim. O acompanhamento pode ser estruturado em envios recorrentes, o que ajuda a manter constância e percepção de profissionalismo.",
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

      <div style={{ position: "relative", zIndex: 10, maxWidth: "960px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
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
              marginBottom: "40px",
              fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Tecnologia invisível.
            <br />
            <span className="text-gradient">Resultados visíveis.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            style={{
              margin: "0 auto 48px",
              maxWidth: "600px",
              fontSize: "1.15rem",
              lineHeight: 1.9,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Gestão de redes sociais, edição de vídeo, conteúdo UGC com IA e desenvolvimento web/mobile. Seu negócio cresce enquanto a tecnologia trabalha nos bastidores.
          </motion.p>

          <motion.div variants={fadeInUp} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "20px" }}>
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
              Monte Seu Pacote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/contato"
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
              Fale Conosco
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        style={{ position: "absolute", bottom: "48px", left: "50%", transform: "translateX(-50%)" }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}
        >
          <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            Scroll para explorar
          </span>
          <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, var(--text-muted), transparent)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Seção: SERVIÇOS ─────────────────────────────────────────────────────────
function ServicesSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: "160px", paddingBottom: "160px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}>

        <AnimatedSection style={{ marginBottom: "80px" }}>
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
            Nossos Serviços
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", maxWidth: "720px" }}
          >
            Tudo que seu negócio{" "}
            <span className="text-gradient">precisa para crescer</span>
          </motion.h2>
        </AnimatedSection>

        <div>
          {services.map((service) => (
            <AnimatedSection key={service.title}>
              <motion.div variants={fadeInUp}>
                <Link
                  href={service.href}
                  className="service-card-link"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    padding: "40px 0",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-body)",
                        paddingTop: "4px",
                        flexShrink: 0,
                      }}
                    >
                      {service.number}
                    </span>
                    <h3
                      className="service-title"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--text-primary)",
                        fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                        transition: "color 500ms ease-out, transform 500ms ease-out",
                      }}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "32px",
                      paddingLeft: "36px",
                    }}
                  >
                    <p
                      style={{
                        maxWidth: "480px",
                        fontSize: "14px",
                        lineHeight: 1.8,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {service.description}
                    </p>
                    <div
                      className="service-arrow"
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "52px",
                        height: "52px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        transition: "all 500ms ease-out",
                      }}
                    >
                      <svg
                        className="service-arrow-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--text-tertiary)", transition: "all 500ms ease-out" }}
                      >
                        <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatedSection>
          ))}
          {/* borda inferior do último item */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }} />
        </div>

        <AnimatedSection style={{ marginTop: "120px", marginBottom: "56px" }}>
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
            Gestão de Social Media
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", maxWidth: "920px", marginBottom: "28px" }}
          >
            Uma operação de social media mais{" "}
            <span className="text-gradient">estratégica, organizada e profissional.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: "900px",
              fontSize: "1rem",
              lineHeight: 1.9,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              marginBottom: "28px",
            }}
          >
            Na FIRMANT, sua gestão de redes sociais não depende de improviso, mensagens soltas ou acompanhamento superficial. Estruturamos a operação com planejamento, aprovação facilitada, relatórios profissionais, dashboards online, adaptação por formato e apoio de inteligência artificial para dar mais clareza, velocidade e consistência ao trabalho.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            style={{
              maxWidth: "940px",
              borderRadius: "20px",
              border: "1px solid rgba(201,168,76,0.28)",
              background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(255,255,255,0.025))",
              padding: "26px 28px",
              marginBottom: "28px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Em contratações acima de 8 posts mensais, sua marca também recebe uma análise detalhada da situação atual do Instagram, para identificar cenário, oportunidades de melhoria e pontos estratégicos de direcionamento. E todos os recursos destacados nos próximos cards também passam a fazer parte da operação.
            </p>
          </motion.div>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: "760px",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Mais do que publicar conteúdos, o objetivo é criar um fluxo organizado para sua marca comunicar melhor, aprovar com mais facilidade e acompanhar os resultados com mais transparência.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "22px",
            }}
          >
            {socialMediaCapabilities.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                style={{
                  position: "relative",
                  minHeight: "250px",
                  borderRadius: "18px",
                  border: "1px solid var(--border-primary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "30px 26px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 18% 0%, rgba(201,168,76,0.11), transparent 36%)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "34px",
                      height: "34px",
                      borderRadius: "999px",
                      border: "1px solid rgba(201,168,76,0.32)",
                      marginBottom: "26px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--accent-gold)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
                      lineHeight: 1.25,
                      color: "var(--text-primary)",
                      marginBottom: "16px",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.78,
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.description}
                  </p>
                  <p
                    style={{
                      marginTop: "22px",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--accent-gold)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Incluso em planos 8+ posts
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

// ─── Seção: SOBRE ─────────────────────────────────────────────────────────────
function ApproachModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        padding: "24px",
        backgroundColor: "rgba(2, 6, 23, 0.84)",
        backdropFilter: "blur(16px)",
      }}
    >
      <motion.div
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

        <div style={{ display: "grid", gap: "22px" }}>
          {approachParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              style={{
                fontSize: "1rem",
                lineHeight: 1.9,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

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
            Monte seu pacote
          </Link>
          <Link
            href="/contato"
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
            Fale conosco
          </Link>
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
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: "160px", paddingBottom: "160px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "80px",
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
              A Firmant é uma agência digital que usa inteligência artificial como infraestrutura — não como substituta da criatividade. Cada conteúdo, cada vídeo, cada linha de código passa por revisão humana antes de chegar até o seu cliente.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              style={{ fontSize: "1rem", lineHeight: 1.9, color: "var(--text-secondary)", fontFamily: "var(--font-body)", marginBottom: "40px" }}
            >
              O resultado? Mais volume, mais qualidade, mais velocidade — pelo preço que cabe no orçamento de quem realmente precisa crescer.
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

          {/* cards de métricas com gap de 40px */}
          <AnimatedSection>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "40px",
              }}
            >
              {[
                { number: "4", label: "Nichos de atuação" },
                { number: "IA", label: "Como infraestrutura" },
                { number: "100%", label: "Revisão humana" },
                { number: "24h", label: "Tempo de resposta" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid var(--border-primary)",
                    padding: "40px 24px",
                    textAlign: "center",
                    backgroundColor: "var(--bg-card)",
                    transition: "border-color 0.5s ease",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "12px",
                      fontSize: "clamp(2rem, 4vw, 2.8rem)",
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
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
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: "160px", paddingBottom: "160px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 48px" }}>
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
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: "160px", paddingBottom: "160px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
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
              Monte Seu Pacote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/contato"
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
              Fale Conosco
            </Link>
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
