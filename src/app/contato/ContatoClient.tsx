"use client";

import { motion, type Variants, useInView } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { type CSSProperties, type FormEvent, type ReactNode, useRef, useState } from "react";

const WHATSAPP_GENERAL =
  "https://wa.me/5511914912488?text=Ol%C3%A1%2C%20quero%20entender%20qual%20pacote%20da%20FIRMANT%20faz%20mais%20sentido%20para%20minha%20empresa.";
const FACEBOOK_URL = "https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR";

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeCurve },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const inner: CSSProperties = {
  width: "min(100% - 48px, 1180px)",
  margin: "0 auto",
};

const sectionBase: CSSProperties = {
  paddingTop: 96,
  paddingBottom: 96,
};

function InstagramGlyph({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function FacebookGlyph({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M14.2 8.2h2.4V4.4c-.42-.06-1.86-.18-3.54-.18-3.5 0-5.9 2.14-5.9 6.08v3.42H3.4V18h3.76v6h4.62v-6h3.62l.58-4.28h-4.2v-3c0-1.24.34-2.52 2.42-2.52Z" />
    </svg>
  );
}

function AnimatedSection({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

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

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: 999,
        padding: "16px 34px",
        fontSize: 12,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        backgroundColor: "var(--accent-gold)",
        color: "var(--navy-950)",
        fontFamily: "var(--font-body)",
        textDecoration: "none",
      }}
    >
      {children}
      <ArrowIcon />
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        border: "1px solid rgba(201,168,76,0.38)",
        padding: "16px 34px",
        fontSize: 12,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "var(--accent-gold)",
        fontFamily: "var(--font-body)",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

const serviceCards = [
  {
    title: "Gestão de redes sociais com IA",
    description:
      "Planejamento, criação e organização de conteúdos para marcas que precisam manter uma presença digital mais profissional, estratégica e consistente.",
  },
  {
    title: "Criação de Reels, Shorts e vídeos curtos",
    description:
      "Produção e edição de vídeos pensados para retenção, clareza de mensagem e adaptação ao comportamento atual das redes sociais.",
  },
  {
    title: "UGC com IA e avatares",
    description:
      "Conteúdos em formato humanizado, com apoio de inteligência artificial, voltados para apresentação de produtos, serviços, campanhas e comunicação de marca.",
  },
  {
    title: "Desenvolvimento de sites, landing pages, sistemas e aplicações",
    description:
      "Criação de soluções digitais para empresas que precisam vender, apresentar serviços, captar leads ou estruturar processos online.",
  },
  {
    title: "GEO - Otimização para buscadores com IA",
    description:
      "Estratégias para preparar marcas, conteúdos e páginas para o novo comportamento de busca em ferramentas baseadas em inteligência artificial.",
  },
  {
    title: "Consultoria em IA, automação e governança",
    description:
      "Orientação estratégica para empresas que desejam aplicar inteligência artificial com mais segurança, organização e responsabilidade.",
  },
];

const officialChannels = [
  {
    label: "WhatsApp",
    value: "+55 11 91491-2488",
    href: WHATSAPP_GENERAL,
    icon: MessageCircle,
  },
  {
    label: "E-mail",
    value: "ag.firmant@gmail.com",
    href: "mailto:ag.firmant@gmail.com",
    icon: Mail,
  },
  {
    label: "Instagram",
    value: "@ag.firmant",
    href: "https://www.instagram.com/ag.firmant/",
    icon: InstagramGlyph,
  },
  {
    label: "Facebook",
    value: "FIRMANT no Facebook",
    href: FACEBOOK_URL,
    icon: FacebookGlyph,
  },
  {
    label: "Atendimento",
    value: "Online para todo o Brasil",
    icon: MapPin,
  },
  {
    label: "Horário",
    value: "Segunda a sexta, com retorno em até 1 dia útil",
    icon: Clock3,
  },
  {
    label: "CNPJ",
    value: "63.867.205/0001-99",
    icon: ShieldCheck,
  },
];

const onlineHighlights = [
  "Atendimento digital e organizado",
  "Retorno em até 1 dia útil",
  "Comunicação por WhatsApp, e-mail, Instagram e Facebook",
  "Possibilidade de criação de pacote personalizado pelo site",
  "Orientação antes da contratação, quando necessário",
];

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--bg-secondary)",
        paddingTop: 150,
        paddingBottom: 104,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 16%, rgba(201,168,76,0.13), transparent 30%), radial-gradient(circle at 80% 12%, rgba(34,211,238,0.08), transparent 28%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ ...inner, position: "relative", zIndex: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.span
            variants={fadeInUp}
            style={{
              display: "inline-block",
              marginBottom: 24,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.26em",
              color: "var(--accent-gold)",
              fontFamily: "var(--font-body)",
            }}
          >
            Atendimento consultivo
          </motion.span>
          <motion.h1
            variants={fadeInUp}
            style={{
              maxWidth: 880,
              marginBottom: 30,
              color: "var(--text-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Fale com a <span className="text-gradient">FIRMANT</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            style={{
              maxWidth: 780,
              marginBottom: 26,
              fontSize: "1.08rem",
              lineHeight: 1.9,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Atendimento online, consultivo e estratégico para empresas, marcas e profissionais que querem transformar presença digital em uma operação mais inteligente, organizada e preparada para crescer.
          </motion.p>
          <motion.div variants={fadeInUp} style={{ display: "grid", gap: 18, maxWidth: 850, marginBottom: 42 }}>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--text-secondary)" }}>
              Na FIRMANT, o contato não começa com uma proposta genérica. Começa com entendimento. Antes de indicar qualquer serviço, analisamos o cenário, a necessidade e o objetivo do cliente para direcionar a melhor combinação entre estratégia, conteúdo, tecnologia e inteligência artificial aplicada.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--text-secondary)" }}>
              Você pode criar seu próprio pacote diretamente pelo site ou falar conosco para tirar dúvidas, entender possibilidades e receber uma orientação mais clara sobre qual solução faz mais sentido para o seu momento.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <PrimaryButton href={WHATSAPP_GENERAL}>Falar com a FIRMANT no WhatsApp</PrimaryButton>
            <SecondaryButton href="mailto:ag.firmant@gmail.com">Enviar e-mail</SecondaryButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-primary)" }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.span variants={fadeInUp} className="contact-kicker">
            Como podemos ajudar?
          </motion.span>
          <motion.h2 variants={fadeInUp} style={{ maxWidth: 760, color: "var(--text-primary)", marginBottom: 22 }}>
            Como podemos ajudar sua marca?
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: 820, marginBottom: 52, fontSize: 15 }}>
            A FIRMANT atua com soluções digitais pensadas para marcas que precisam de mais clareza, consistência e eficiência na presença online. Nosso trabalho combina estratégia, criatividade, automação e inteligência artificial para apoiar desde a criação de conteúdo até o desenvolvimento de soluções digitais mais completas.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="contact-card-grid">
            {serviceCards.map((card, index) => (
              <motion.article key={card.title} variants={fadeInUp} className="contact-card">
                <span className="contact-card-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </motion.article>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function PackageSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-secondary)" }}>
      <div style={inner}>
        <AnimatedSection className="contact-split">
          <motion.div variants={fadeInUp}>
            <span className="contact-kicker">Escolha orientada</span>
            <h2 style={{ color: "var(--text-primary)", marginBottom: 24 }}>
              Monte seu pacote ou fale conosco antes de decidir
            </h2>
            <div style={{ display: "grid", gap: 18 }}>
              <p style={{ fontSize: 15 }}>
                Sabemos que cada negócio tem uma realidade diferente. Por isso, a FIRMANT permite que o cliente monte seu próprio pacote de serviços no site, escolhendo as soluções que fazem mais sentido para sua necessidade atual.
              </p>
              <p style={{ fontSize: 15 }}>
                Mesmo assim, caso você ainda esteja em dúvida, recomendamos falar conosco antes de finalizar sua escolha. Assim, conseguimos entender melhor seu objetivo e orientar sobre o caminho mais adequado.
              </p>
            </div>
          </motion.div>

          <motion.aside variants={fadeInUp} className="contact-highlight-panel">
            <PackageCheck size={34} color="var(--accent-gold)" />
            <h3>A ideia não é empurrar um pacote pronto.</h3>
            <p>É ajudar você a escolher uma solução coerente com seu momento, sua estrutura e seus objetivos.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
              <Link href="/monte-seu-pacote" className="contact-link-button">
                Montar meu pacote digital
              </Link>
              <a href={WHATSAPP_GENERAL} target="_blank" rel="noopener noreferrer" className="contact-outline-button">
                Falar com a FIRMANT no WhatsApp
              </a>
            </div>
          </motion.aside>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ChannelsSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-primary)" }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.span variants={fadeInUp} className="contact-kicker">
            Canais oficiais
          </motion.span>
          <motion.h2 variants={fadeInUp} style={{ color: "var(--text-primary)", marginBottom: 18 }}>
            Canais oficiais da FIRMANT
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: 760, marginBottom: 46, fontSize: 15 }}>
            Para garantir um atendimento seguro, utilize apenas os canais oficiais abaixo. A FIRMANT realiza atendimento 100% online para clientes de todo o Brasil.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="contact-channel-grid">
            {officialChannels.map((channel) => {
              const Icon = channel.icon;
              const content = (
                <>
                  <Icon size={22} color="var(--accent-gold)" />
                  <div>
                    <span>{channel.label}</span>
                    <strong>{channel.value}</strong>
                  </div>
                </>
              );

              return channel.href ? (
                <motion.a
                  key={channel.label}
                  variants={fadeInUp}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="contact-channel-card"
                >
                  {content}
                </motion.a>
              ) : (
                <motion.div key={channel.label} variants={fadeInUp} className="contact-channel-card">
                  {content}
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function OnlineSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-secondary)" }}>
      <div style={inner}>
        <AnimatedSection className="contact-split">
          <motion.div variants={fadeInUp}>
            <span className="contact-kicker">Brasil inteiro</span>
            <h2 style={{ color: "var(--text-primary)", marginBottom: 24 }}>
              Atendimento online para todo o Brasil
            </h2>
            <div style={{ display: "grid", gap: 18 }}>
              <p style={{ fontSize: 15 }}>
                A FIRMANT opera com atendimento 100% online, permitindo mais agilidade, flexibilidade e organização em todas as etapas do relacionamento com o cliente.
              </p>
              <p style={{ fontSize: 15 }}>
                As conversas, alinhamentos e orientações podem ser realizados por canais digitais, priorizando clareza, registro das informações e praticidade. Isso permite atender empresas, marcas e profissionais de diferentes regiões do Brasil sem depender de deslocamentos ou reuniões presenciais.
              </p>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="contact-check-list">
            {onlineHighlights.map((item) => (
              <div key={item}>
                <CheckCircle2 size={19} color="var(--accent-gold)" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function DoubtSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-primary)" }}>
      <div style={{ ...inner, maxWidth: 980 }}>
        <AnimatedSection style={{ textAlign: "center" }}>
          <motion.span variants={fadeInUp} className="contact-kicker">
            Orientação inicial
          </motion.span>
          <motion.h2 variants={fadeInUp} style={{ color: "var(--text-primary)", marginBottom: 22 }}>
            Ainda está em dúvida sobre qual serviço escolher?
          </motion.h2>
          <motion.div variants={fadeInUp} style={{ display: "grid", gap: 18, maxWidth: 820, margin: "0 auto 38px" }}>
            <p style={{ fontSize: 15 }}>
              Nem sempre o cliente sabe exatamente se precisa de gestão de redes sociais, vídeos, UGC, site, automação ou consultoria. E isso é normal.
            </p>
            <p style={{ fontSize: 15 }}>
              Por isso, a FIRMANT valoriza uma abordagem consultiva. Antes de iniciar qualquer projeto, buscamos entender o cenário da marca, o estágio atual da presença digital, os objetivos comerciais e os principais desafios.
            </p>
            <p style={{ fontSize: 15 }}>
              A partir disso, indicamos o caminho mais coerente para evitar contratações desalinhadas, desperdício de investimento ou expectativas mal definidas.
            </p>
          </motion.div>
          <motion.p variants={fadeInUp} style={{ maxWidth: 720, margin: "0 auto 32px", fontSize: 14, color: "var(--text-tertiary)" }}>
            Fale conosco e explique brevemente o que você precisa. A partir disso, orientamos o melhor próximo passo.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <PrimaryButton href={WHATSAPP_GENERAL}>Falar com a FIRMANT no WhatsApp</PrimaryButton>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function FutureNewsletterSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      const payload = await response.json() as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao cadastrar.");
      }

      setStatus("success");
      setMessage(payload.message ?? "Cadastro realizado com sucesso.");
      setName("");
      setEmail("");
      setCompany("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Falha ao cadastrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 56, paddingBottom: 56 }}>
      <div style={inner}>
        <AnimatedSection>
          <motion.div variants={fadeInUp} className="contact-newsletter-panel">
            <div>
              <span className="contact-kicker">Newsletter</span>
              <h2>Receba insights sobre IA, conteúdo e presença digital</h2>
              <p>
                Cadastre-se para receber novidades, conteúdos e atualizações da FIRMANT por e-mail. Seus dados ficam registrados com consentimento e podem ser consultados no painel administrativo.
              </p>
            </div>
            <form className="contact-newsletter-form" onSubmit={handleSubmit}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome"
                aria-label="Nome"
                minLength={2}
                maxLength={120}
                required
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="E-mail"
                aria-label="E-mail"
                type="email"
                required
              />
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: "none" }}
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Quero receber novidades"}
              </button>
              <p className="contact-newsletter-consent">
                Ao cadastrar, você autoriza comunicações da FIRMANT por e-mail. Você pode solicitar remoção a qualquer momento. Consulte a{" "}
                <Link href="/politica-privacidade">Política de Privacidade</Link>.
              </p>
              {message && (
                <p className={status === "success" ? "contact-newsletter-success" : "contact-newsletter-error"} role="status">
                  {message}
                </p>
              )}
            </form>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section style={{ ...sectionBase, backgroundColor: "var(--bg-primary)" }}>
      <div style={inner}>
        <AnimatedSection className="contact-trust-panel">
          <motion.div variants={fadeInUp} className="contact-trust-icon">
            <Bot size={34} color="var(--accent-gold)" />
            <Sparkles size={22} color="var(--accent-cyan)" />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <span className="contact-kicker">Confiança</span>
            <h2>Tecnologia nos bastidores. Atendimento humano na relação com você.</h2>
            <div style={{ display: "grid", gap: 18 }}>
              <p>
                A FIRMANT utiliza inteligência artificial como infraestrutura de eficiência, produção e organização. No entanto, a relação com o cliente permanece humana, transparente e consultiva.
              </p>
              <p>
                Isso significa que a tecnologia apoia o processo, mas as decisões, orientações e entregas são conduzidas com análise, responsabilidade e clareza.
              </p>
              <p>
                Nosso compromisso é construir soluções digitais com base sólida, comunicação objetiva e foco em resultados concretos, sem promessas vazias.
              </p>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 104, paddingBottom: 104 }}>
      <div style={{ ...inner, maxWidth: 900, textAlign: "center" }}>
        <AnimatedSection>
          <motion.h2 variants={fadeInUp} style={{ color: "var(--text-primary)", marginBottom: 24 }}>
            Vamos conversar sobre o próximo passo da sua marca?
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: 760, margin: "0 auto 38px", fontSize: 15 }}>
            Se você já sabe quais serviços deseja, monte seu pacote diretamente pelo site. Se ainda tem dúvidas, fale com a FIRMANT e receba uma orientação inicial para entender qual solução faz mais sentido para o seu objetivo.
          </motion.p>
          <motion.div variants={fadeInUp} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            <PrimaryButton href={WHATSAPP_GENERAL}>Falar com a FIRMANT no WhatsApp</PrimaryButton>
            <SecondaryButton href="mailto:ag.firmant@gmail.com">Enviar e-mail</SecondaryButton>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function MiniInfoSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-primary)", paddingTop: 40, paddingBottom: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={inner} className="contact-mini-info">
        <p>FIRMANT - Agência digital com IA, estratégia e soluções online para marcas em crescimento.</p>
        <p>Atendimento 100% online para todo o Brasil.</p>
        <p>WhatsApp: +55 11 91491-2488</p>
        <p>E-mail: ag.firmant@gmail.com</p>
        <p>Instagram: @ag.firmant</p>
        <p>Facebook: FIRMANT</p>
        <p>CNPJ: 63.867.205/0001-99</p>
      </div>
    </section>
  );
}

export function ContatoClient() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PackageSection />
      <ChannelsSection />
      <OnlineSection />
      <DoubtSection />
      <FutureNewsletterSection />
      <TrustSection />
      <FinalCTASection />
      <MiniInfoSection />
    </>
  );
}
