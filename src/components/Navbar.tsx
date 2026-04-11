"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// "Monte Seu Pacote" removido daqui — já é o botão CTA separado
const navLinks = [
  { href: "/gestao-redes-sociais", label: "Redes Sociais" },
  { href: "/edicao-video-ugc", label: "Vídeos & UGC" },
  { href: "/desenvolvimento", label: "Desenvolvimento" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: isScrolled ? "rgba(10,22,40,0.95)" : "rgba(10,22,40,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transition: "background-color 0.5s ease",
        }}
      >
        <nav
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 48px",
            gap: "32px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--text-primary)",
                fontSize: "1.55rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              FIRM<span style={{ color: "var(--accent-gold)" }}>ANT</span>
            </span>
          </Link>

          {/* Links desktop — escondidos em mobile via CSS */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-item"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA desktop */}
          <div className="nav-cta-desktop">
            <Link
              href="/monte-seu-pacote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "999px",
                border: "1.5px solid var(--accent-gold)",
                padding: "9px 22px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                backgroundColor: "var(--accent-gold)",
                color: "var(--navy-950)",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.3s ease",
              }}
            >
              Monte Seu Pacote
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            className="nav-hamburger"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              zIndex: 110,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ display: "block", height: "2px", width: "22px", backgroundColor: "var(--text-primary)", transition: "all 300ms ease", transform: isMobileOpen ? "rotate(45deg) translate(2.5px, 3.5px)" : "none" }} />
              <span style={{ display: "block", height: "2px", width: "22px", backgroundColor: "var(--text-primary)", transition: "opacity 300ms ease", opacity: isMobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", height: "2px", width: "22px", backgroundColor: "var(--text-primary)", transition: "all 300ms ease", transform: isMobileOpen ? "rotate(-45deg) translate(2.5px, -3.5px)" : "none" }} />
            </div>
          </button>
        </nav>
      </motion.header>

      {/* Menu mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
              {[...navLinks, { href: "/monte-seu-pacote", label: "Monte Seu Pacote" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      fontFamily: "var(--font-heading)",
                      color: link.href === "/monte-seu-pacote" ? "var(--accent-gold)" : "var(--text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
