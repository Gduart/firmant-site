"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

function InstagramGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.2 8.2h2.4V4.4c-.42-.06-1.86-.18-3.54-.18-3.5 0-5.9 2.14-5.9 6.08v3.42H3.4V18h3.76v6h4.62v-6h3.62l.58-4.28h-4.2v-3c0-1.24.34-2.52 2.42-2.52Z" />
    </svg>
  );
}

const FACEBOOK_URL = "https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR";

const footerLinks = {
  servicos: [
    { href: "/gestao-redes-sociais", label: "Gestão de Redes Sociais" },
    { href: "/edicao-video-ugc", label: "Vídeos para Negócios & UGC" },
    { href: "/desenvolvimento", label: "Desenvolvimento Web/Mobile" },
    { href: "/monte-seu-pacote", label: "Monte Seu Pacote" },
  ],
  empresa: [
    { href: "/blog", label: "Blog" },
    { href: "/contato", label: "Contato" },
    { href: "/politica-privacidade", label: "Política de Privacidade" },
    { href: "/termos-de-uso", label: "Termos de Uso" },
    { href: "/politica-de-reembolso", label: "Política de Reembolso" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="footer-inner"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 64px 64px",
        }}
      >
        {/* Grid principal — responsivo via CSS class */}
        <div className="footer-grid">
          {/* Coluna logo + descrição */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                }}
              >
                FIRM<span style={{ color: "var(--accent-gold)" }}>ANT</span>
              </span>
            </Link>
            <p
              style={{
                marginTop: "20px",
                maxWidth: "360px",
                fontSize: "14px",
                lineHeight: 1.8,
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-body)",
              }}
            >
              FIRMANT — Agência digital com IA, estratégia e soluções online para marcas em crescimento. Atendimento 100% online para todo o Brasil.
            </p>
            <div style={{ marginTop: "20px", display: "grid", gap: "6px" }}>
              {[
                "WhatsApp: +55 11 91491-2488",
                "E-mail: ag.firmant@gmail.com",
                "Instagram: @ag.firmant",
                "Facebook: FIRMANT",
                "CNPJ: 63.867.205/0001-99",
              ].map((item) => (
                <p
                  key={item}
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
            {/* Ícones sociais */}
            <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
              {[
                {
                  href: "https://www.instagram.com/ag.firmant/",
                  label: "Instagram da FIRMANT",
                  icon: InstagramGlyph,
                },
                {
                  href: FACEBOOK_URL,
                  label: "Facebook da FIRMANT",
                  icon: FacebookGlyph,
                },
                {
                  href: "mailto:ag.firmant@gmail.com",
                  label: "E-mail da FIRMANT",
                  icon: Mail,
                },
              ].map((social) => {
                const Icon = social.icon;

                return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-tertiary)",
                    textDecoration: "none",
                    transition: "all 300ms ease",
                  }}
                >
                  <Icon size={16} strokeWidth={1.7} />
                </a>
                );
              })}
            </div>
          </div>

          {/* Coluna Serviços */}
          <div>
            <h4
              style={{
                marginBottom: "24px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--text-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Serviços
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              {footerLinks.servicos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      fontFamily: "var(--font-body)",
                      transition: "color 300ms ease",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Empresa */}
          <div>
            <h4
              style={{
                marginBottom: "24px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--text-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Empresa
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      fontFamily: "var(--font-body)",
                      transition: "color 300ms ease",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Linha divisória + copyright */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "40px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            &copy; {new Date().getFullYear()} FIRMANT. Todos os direitos reservados.
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Feito com IA e código — como tudo que fazemos.
          </p>
        </div>
      </div>

      {/* WhatsApp flutuante */}
      <a
        href="https://wa.me/5511914912488?text=Ol%C3%A1%2C%20FIRMANT.%20Vim%20pelo%20site%20e%20gostaria%20de%20entender%20melhor%20os%20servi%C3%A7os."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          backgroundColor: "#25D366",
          boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
          textDecoration: "none",
          transition: "transform 300ms ease",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
        aria-label="WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </footer>
  );
}
