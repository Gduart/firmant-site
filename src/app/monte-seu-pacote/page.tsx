"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type ServiceItem = {
  id: string;
  label: string;
  price: number; // preço unitário
  unit: string;
  description: string;
  allowQty?: boolean; // itens unitários permitem contador
};

type Category = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  color: string;
  services: ServiceItem[];
};

type Selection = {
  categoryId: string;
  serviceId: string;
  qty: number;
};

type ClientData = {
  name: string;
  email: string;
  whatsapp: string;
  empresa: string;
  obs: string;
};

// ─── Dados ────────────────────────────────────────────────────────────────────
// ⚠️ Preços Redes Sociais revisados para entrada mais acessível
const categories: Category[] = [
  {
    id: "social",
    number: "01",
    title: "Gestão de Redes Sociais",
    tagline: "Publicações completas — da copy à arte final, entregues com IA.",
    color: "#C9A84C",
    services: [
      { id: "s4",  label: "4 publicações/mês",  price: 397,  unit: "mês", description: "R$ 99/post — ideal para começar" },
      { id: "s8",  label: "8 publicações/mês",  price: 697,  unit: "mês", description: "R$ 87/post — mais presença, mais engajamento" },
      { id: "s12", label: "12 publicações/mês", price: 997,  unit: "mês", description: "R$ 83/post — frequência profissional" },
      { id: "s16", label: "16 publicações/mês", price: 1297, unit: "mês", description: "R$ 81/post — ~18% de desconto" },
      { id: "s20", label: "20 publicações/mês", price: 1597, unit: "mês", description: "R$ 79/post — ~20% de desconto" },
      { id: "s24", label: "24+ publicações/mês",price: 1897, unit: "mês", description: "R$ 79/post — máximo alcance" },
    ],
  },
  {
    id: "video",
    number: "02",
    title: "Edição de Vídeo",
    tagline: "Reels, Stories e Shorts editados profissionalmente com IA.",
    color: "#22D3EE",
    services: [
      { id: "v8s",  label: "Story 8s",    price: 97,  unit: "vídeo", description: "Stories curtos, cortes dinâmicos",  allowQty: true },
      { id: "v16s", label: "Reel 16s",    price: 149, unit: "vídeo", description: "Reels curtos para maior alcance",    allowQty: true },
      { id: "v30s", label: "Reel 30s",    price: 219, unit: "vídeo", description: "Reel padrão — formato mais engajado", allowQty: true },
      { id: "v1m",  label: "Reel 1 min",  price: 349, unit: "vídeo", description: "Reel longo, tutorial ou depoimento",  allowQty: true },
      { id: "vs10", label: "Stories Pack — 10 vídeos 8s", price: 690, unit: "pacote", description: "Pacote fechado — R$ 69 cada" },
      { id: "vg8",  label: "Growth Pack — 8 Reels 30s",  price: 1352,unit: "pacote", description: "Pacote Growth — R$ 169 cada" },
    ],
  },
  {
    id: "ugc",
    number: "03",
    title: "Vídeo UGC com IA",
    tagline: "Avatar de IA falando sobre seu produto — sem câmera, sem ator.",
    color: "#A78BFA",
    services: [
      { id: "u8s",  label: "UGC 8s",      price: 129, unit: "vídeo", description: "Bumper ad — impacto rápido",          allowQty: true },
      { id: "u16s", label: "UGC 16s",     price: 197, unit: "vídeo", description: "Story / pre-roll",                    allowQty: true },
      { id: "u30s", label: "UGC 30s",     price: 297, unit: "vídeo", description: "UGC padrão — maior conversão",        allowQty: true },
      { id: "u1m",  label: "UGC 1 min",   price: 449, unit: "vídeo", description: "Review ou tutorial completo",         allowQty: true },
      { id: "u_ads",label: "Direito anúncios +3 meses", price: 149, unit: "vídeo", description: "Add-on Meta/TikTok Ads — por vídeo", allowQty: true },
      { id: "u6pk", label: "Pack 6 UGC 30s", price: 1194, unit: "pacote", description: "~31% de desconto — R$ 199 cada" },
    ],
  },
  {
    id: "dev",
    number: "04",
    title: "Desenvolvimento Web/Mobile",
    tagline: "Aplicações sob medida em Python — do MVP ao sistema completo.",
    color: "#34D399",
    services: [
      { id: "d_lp1",  label: "Landing Page básica",         price: 997,   unit: "projeto", description: "1 página, responsivo, formulário — 3 a 5 dias" },
      { id: "d_lp2",  label: "Landing Page alta conversão", price: 1997,  unit: "projeto", description: "Copy, pixel Meta/Google — 5 a 7 dias" },
      { id: "d_lp3",  label: "Landing Page premium",        price: 2997,  unit: "projeto", description: "Funil, A/B, CRM — 7 a 14 dias" },
      { id: "d_site1",label: "Site institucional (5 págs)", price: 2497,  unit: "projeto", description: "Design, SEO, blog — 7 a 14 dias" },
      { id: "d_site2",label: "Site institucional completo", price: 4997,  unit: "projeto", description: "8 a 15 páginas, SEO avançado — 14 a 21 dias" },
      { id: "d_ecom", label: "E-commerce (até 50 produtos)",price: 5997,  unit: "projeto", description: "Checkout, Mercado Pago, estoque — 14 a 30 dias" },
      { id: "d_app",  label: "App Mobile (iOS + Android)",  price: 19997, unit: "projeto", description: "React Native, backend, deploy — 45 a 90 dias" },
      { id: "d_manut",label: "Manutenção mensal",           price: 297,   unit: "mês",    description: "Atualizações, backups, suporte contínuo" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeCurve } },
};

function rgbFromColor(c: string) {
  if (c === "#C9A84C") return "201,168,76";
  if (c === "#22D3EE") return "34,211,238";
  if (c === "#A78BFA") return "167,139,250";
  return "52,211,153";
}

// ─── Preços com desconto por volume ──────────────────────────────────────────
// Cada entrada: [qtdMínima, preçoPorUnidade]
const tieredPricing: Record<string, Array<[number, number]>> = {
  v8s:  [[1, 97],  [2, 87],  [4, 79],  [8, 69]],
  v16s: [[1, 149], [2, 139], [4, 129], [8, 119]],
  v30s: [[1, 219], [2, 199], [4, 179], [8, 169]],
  v1m:  [[1, 349], [2, 319], [4, 299]],
  u8s:  [[1, 129], [2, 119], [4, 99],  [5, 89]],
  u16s: [[1, 197], [2, 179], [4, 159], [8, 149]],
  u30s: [[1, 297], [2, 267], [4, 229], [6, 199]],
  u1m:  [[1, 449], [2, 399], [4, 349]],
  u_ads:[[1, 149], [3, 129]],
};

function getUnitPrice(svcId: string, qty: number): number {
  const tiers = tieredPricing[svcId];
  if (!tiers) return 0;
  let price = tiers[0][1];
  for (const [minQty, unitPrice] of tiers) {
    if (qty >= minQty) price = unitPrice;
  }
  return price;
}

function getItemTotal(svc: ServiceItem, qty: number): number {
  if (!svc.allowQty) return svc.price;
  return getUnitPrice(svc.id, qty) * qty;
}

// ─── Pacotes pré-configurados ─────────────────────────────────────────────────
const readyPackages = [
  {
    label: "ESSENCIAL",
    desc: "8 posts + 4 Reels 30s",
    cats: ["social", "video"],
    items: [
      { categoryId: "social", serviceId: "s8",   qty: 1 },
      { categoryId: "video",  serviceId: "v30s",  qty: 4 },
    ] as Selection[],
  },
  {
    label: "CRESCIMENTO",
    desc: "12 posts + 8 Reels + 3 UGC 30s",
    cats: ["social", "video", "ugc"],
    items: [
      { categoryId: "social", serviceId: "s12",  qty: 1 },
      { categoryId: "video",  serviceId: "v30s",  qty: 8 },
      { categoryId: "ugc",    serviceId: "u30s",  qty: 3 },
    ] as Selection[],
  },
  {
    label: "ACELERAÇÃO",
    desc: "16 posts + 8 Reels + 6 UGC 30s",
    cats: ["social", "video", "ugc"],
    items: [
      { categoryId: "social", serviceId: "s16",  qty: 1 },
      { categoryId: "video",  serviceId: "v30s",  qty: 8 },
      { categoryId: "ugc",    serviceId: "u30s",  qty: 6 },
    ] as Selection[],
  },
];

function getPackageTotal(pkg: typeof readyPackages[0]): number {
  return pkg.items.reduce((acc, item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    const svc = cat?.services.find((s) => s.id === item.serviceId);
    if (!svc) return acc;
    return acc + getItemTotal(svc, item.qty);
  }, 0);
}

// ─── Step 1: Escolha de categorias ───────────────────────────────────────────
function StepCategories({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Selecione os serviços que fazem sentido para o seu negócio agora. Pode escolher mais de um.
      </motion.p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {categories.map((cat) => {
          const active = selected.includes(cat.id);
          const rgb = rgbFromColor(cat.color);
          return (
            <motion.button key={cat.id} variants={fadeUp} onClick={() => onToggle(cat.id)}
              style={{
                textAlign: "left",
                background: active ? `rgba(${rgb},0.07)` : "var(--bg-card)",
                border: `1.5px solid ${active ? cat.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: "16px", padding: "28px 24px", cursor: "pointer",
                transition: "all 300ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", color: cat.color, fontFamily: "var(--font-body)" }}>
                  {cat.number}
                </span>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  border: `1.5px solid ${active ? cat.color : "rgba(255,255,255,0.2)"}`,
                  backgroundColor: active ? cat.color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 250ms ease",
                }}>
                  {active && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)", marginBottom: "8px", lineHeight: 1.2 }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)", lineHeight: 1.6, margin: 0 }}>
                {cat.tagline}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Step 2: Seleção + quantidade ────────────────────────────────────────────
function StepServices({
  activeCategoryIds, selections, onToggle, onQty,
}: {
  activeCategoryIds: string[];
  selections: Selection[];
  onToggle: (sel: Selection) => void;
  onQty: (catId: string, svcId: string, delta: number) => void;
}) {
  const activeCats = categories.filter((c) => activeCategoryIds.includes(c.id));

  const getSel = (catId: string, svcId: string) =>
    selections.find((s) => s.categoryId === catId && s.serviceId === svcId);

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Escolha os itens. Para vídeos unitários, ajuste a quantidade com <strong style={{ color: "var(--text-primary)" }}>+ / −</strong>
      </motion.p>

      {activeCats.map((cat) => {
        const rgb = rgbFromColor(cat.color);
        return (
          <motion.div key={cat.id} variants={fadeUp} style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: cat.color }}>{cat.number}</span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{cat.title}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {cat.services.map((svc) => {
                const sel = getSel(cat.id, svc.id);
                const active = !!sel;
                const qty = sel?.qty ?? 1;

                return (
                  <div key={svc.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "12px", padding: "14px 18px", borderRadius: "12px",
                      border: `1px solid ${active ? cat.color : "rgba(255,255,255,0.08)"}`,
                      backgroundColor: active ? `rgba(${rgb},0.06)` : "var(--bg-card)",
                      transition: "all 250ms ease",
                    }}
                  >
                    {/* Checkbox + label */}
                    <button
                      onClick={() => onToggle({ categoryId: cat.id, serviceId: svc.id, qty: 1 })}
                      style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                    >
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                        border: `1.5px solid ${active ? cat.color : "rgba(255,255,255,0.2)"}`,
                        backgroundColor: active ? cat.color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 200ms ease",
                      }}>
                        {active && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0A1628" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-body)" }}>
                          {svc.label}
                          {svc.allowQty && <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)", marginLeft: "8px" }}>unitário</span>}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "2px 0 0" }}>{svc.description}</p>
                      </div>
                    </button>

                    {/* Contador de quantidade (somente unitários selecionados) */}
                    {svc.allowQty && active ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0", flexShrink: 0 }}>
                        <button
                          onClick={() => onQty(cat.id, svc.id, -1)}
                          disabled={qty <= 1}
                          style={{
                            width: "30px", height: "30px", borderRadius: "8px 0 0 8px",
                            border: `1px solid ${cat.color}`, backgroundColor: "transparent",
                            color: qty <= 1 ? "var(--text-muted)" : cat.color,
                            fontSize: "16px", cursor: qty <= 1 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 200ms ease",
                          }}
                        >−</button>
                        <div style={{
                          width: "36px", height: "30px",
                          border: `1px solid ${cat.color}`, borderLeft: "none", borderRight: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: 700, color: "var(--text-primary)",
                          fontFamily: "var(--font-heading)",
                        }}>
                          {qty}
                        </div>
                        <button
                          onClick={() => onQty(cat.id, svc.id, +1)}
                          style={{
                            width: "30px", height: "30px", borderRadius: "0 8px 8px 0",
                            border: `1px solid ${cat.color}`, backgroundColor: "transparent",
                            color: cat.color, fontSize: "16px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 200ms ease",
                          }}
                        >+</button>
                        <div style={{ marginLeft: "12px", textAlign: "right", minWidth: "72px" }}>
                          <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: cat.color, fontFamily: "var(--font-heading)" }}>
                            {fmt(getItemTotal(svc, qty))}
                          </span>
                          {qty > 1 && getUnitPrice(svc.id, qty) < svc.price && (
                            <span style={{ display: "block", fontSize: "10px", color: "#34D399", lineHeight: 1.3 }}>
                              {fmt(getUnitPrice(svc.id, qty))}/un
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", fontWeight: 700, color: active ? cat.color : "var(--text-secondary)", fontFamily: "var(--font-heading)", flexShrink: 0 }}>
                        {fmt(svc.price)}<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>/{svc.unit}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Step 3: Dados do cliente ─────────────────────────────────────────────────
function StepContact({ data, onChange }: { data: ClientData; onChange: (d: ClientData) => void }) {
  const field = (id: keyof ClientData, label: string, placeholder: string, required = false, multiline = false) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
        {label}{required && <span style={{ color: "var(--accent-gold)" }}> *</span>}
      </label>
      {multiline ? (
        <textarea value={data[id]} onChange={(e) => onChange({ ...data, [id]: e.target.value })} placeholder={placeholder} rows={4}
          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", resize: "vertical", outline: "none" }} />
      ) : (
        <input type="text" value={data[id]} onChange={(e) => onChange({ ...data, [id]: e.target.value })} placeholder={placeholder}
          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none" }} />
      )}
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Quase lá! Preencha seus dados para prepararmos o resumo e iniciarmos o atendimento.
      </motion.p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <motion.div variants={fadeUp}>{field("name", "Nome completo", "Seu nome", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("empresa", "Empresa / negócio", "Nome da empresa ou projeto")}</motion.div>
        <motion.div variants={fadeUp}>{field("email", "E-mail", "seu@email.com", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("whatsapp", "WhatsApp", "(11) 99999-9999", true)}</motion.div>
        <motion.div variants={fadeUp} style={{ gridColumn: "1 / -1" }}>
          {field("obs", "Briefing / observações", "Conte sobre seu negócio e o que espera dos serviços...", false, true)}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Resumo ───────────────────────────────────────────────────────────
function StepSummary({ selections, clientData, total, onEdit }: { selections: Selection[]; clientData: ClientData; total: number; onEdit: (step: number) => void }) {
  const grouped = categories
    .map((cat) => ({
      cat,
      items: selections
        .filter((s) => s.categoryId === cat.id)
        .map((s) => ({ sel: s, svc: cat.services.find((sv) => sv.id === s.serviceId)! }))
        .filter((x) => x.svc),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Revise seu pedido. Clique em <strong style={{ color: "var(--text-primary)" }}>editar</strong> para ajustar qualquer etapa.
      </motion.p>

      {grouped.map(({ cat, items }) => (
        <motion.div key={cat.id} variants={fadeUp} style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: cat.color, fontFamily: "var(--font-body)" }}>{cat.title}</h4>
            <button onClick={() => onEdit(2)} style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>editar</button>
          </div>
          {items.map(({ sel, svc }) => (
            <div key={svc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderRadius: "10px", backgroundColor: "var(--bg-card)", marginBottom: "5px" }}>
              <span style={{ fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                {svc.label}{sel.qty > 1 && <span style={{ color: cat.color, marginLeft: "6px" }}>× {sel.qty}</span>}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)", fontFamily: "var(--font-heading)" }}>{fmt(getItemTotal(svc, sel.qty))}</span>
            </div>
          ))}
        </motion.div>
      ))}

      <motion.div variants={fadeUp} style={{ marginBottom: "24px", padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "var(--bg-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-secondary)" }}>Seus dados</span>
          <button onClick={() => onEdit(3)} style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>editar</button>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 4px", fontFamily: "var(--font-body)" }}>{clientData.name}{clientData.empresa && ` — ${clientData.empresa}`}</p>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "0 0 2px" }}>{clientData.email}</p>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>{clientData.whatsapp}</p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ padding: "24px 28px", borderRadius: "14px", border: "1.5px solid rgba(201,168,76,0.3)", backgroundColor: "rgba(201,168,76,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", margin: "0 0 4px" }}>Total do pedido</p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>Recorrente mensal + projetos pontuais</p>
        </div>
        <span style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(total)}</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 5: Finalização ──────────────────────────────────────────────────────
function StepFinalization({ total, clientData, selections, onConfirm }: {
  total: number;
  clientData: ClientData;
  selections: Selection[];
  onConfirm: (method: "pix" | "card" | "boleto" | "whatsapp") => void;
}) {
  const [selected, setSelected] = useState<"pix" | "card" | "boleto" | "whatsapp" | null>(null);

  const methods = [
    {
      id: "pix" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      ),
      label: "Quero pagar por Pix",
      badge: "preferencial",
      badgeColor: "#34D399",
      description: "Nossa equipe confirma o pedido e envia os dados para pagamento via Pix.",
      priceLabel: fmt(Math.round(total * 0.95)),
    },
    {
      id: "card" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      label: "Quero pagar por cartão",
      badge: "Até 12×",
      badgeColor: "#22D3EE",
      description: "Nossa equipe confirma o pedido e envia o link seguro de pagamento.",
      priceLabel: `${fmt(total)} ou 12× de ${fmt(Math.round(total / 12))}`,
    },
    {
      id: "boleto" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      ),
      label: "Quero pagar por boleto",
      badge: "3 dias úteis",
      badgeColor: "#C9A84C",
      description: "Nossa equipe confirma o pedido e envia o boleto para pagamento à vista.",
      priceLabel: fmt(total),
    },
    {
      id: "whatsapp" as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.956 9.956 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.049 11.89c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
        </svg>
      ),
      label: "Confirmar pelo WhatsApp",
      badge: "Atendimento",
      badgeColor: "#25D366",
      description: "Envie o resumo agora e finalize os próximos passos com nossa equipe.",
      priceLabel: fmt(total),
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Escolha a forma preferida para o atendimento. O pedido será enviado para a equipe da FIRMANT confirmar valores, prazos e próximos passos.
      </motion.p>

      {/* Total */}
      <motion.div variants={fadeUp} style={{ padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total do pedido</span>
        <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(total)}</span>
      </motion.div>

      {/* Preferência de atendimento */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        {methods.map((m) => {
          const active = selected === m.id;
          return (
            <motion.button
              key={m.id}
              variants={fadeUp}
              onClick={() => setSelected(m.id)}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "18px 20px", borderRadius: "14px", cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${active ? m.badgeColor : "rgba(255,255,255,0.08)"}`,
                backgroundColor: active ? `rgba(${m.badgeColor === "#34D399" ? "52,211,153" : m.badgeColor === "#22D3EE" ? "34,211,238" : m.badgeColor === "#C9A84C" ? "201,168,76" : "37,211,102"},0.07)` : "var(--bg-card)",
                transition: "all 250ms ease",
              }}
            >
              <div style={{ color: active ? m.badgeColor : "var(--text-tertiary)", transition: "color 250ms ease", flexShrink: 0 }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{m.label}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "999px", backgroundColor: `rgba(${m.badgeColor === "#34D399" ? "52,211,153" : m.badgeColor === "#22D3EE" ? "34,211,238" : m.badgeColor === "#C9A84C" ? "201,168,76" : "37,211,102"},0.15)`, color: m.badgeColor }}>
                    {m.badge}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>{m.description}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: active ? m.badgeColor : "var(--text-secondary)", fontFamily: "var(--font-heading)" }}>{m.priceLabel}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Aviso de finalização */}
      <motion.div variants={fadeUp} style={{ padding: "14px 18px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          Esta etapa ainda não processa pagamento automaticamente. Ao confirmar, o resumo completo será enviado pelo WhatsApp para validação final da equipe FIRMANT.
        </p>
      </motion.div>

      {/* Botão confirmar */}
      <motion.div variants={fadeUp} style={{ marginTop: "24px" }}>
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "16px 40px", borderRadius: "999px", width: "100%", justifyContent: "center",
            backgroundColor: selected ? "var(--accent-gold)" : "rgba(255,255,255,0.08)",
            color: selected ? "var(--navy-950)" : "var(--text-muted)",
            fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            fontFamily: "var(--font-body)", border: "none", cursor: selected ? "pointer" : "not-allowed",
            transition: "all 300ms ease",
          }}
        >
          {selected ? "Enviar resumo para atendimento" : "Selecione uma preferência de atendimento"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MonteSeuPacotePage() {
  const [step, setStep] = useState(1);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [clientData, setClientData] = useState<ClientData>({ name: "", email: "", whatsapp: "", empresa: "", obs: "" });
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSvc = (sel: Selection) =>
    setSelections((prev) => {
      const exists = prev.some((s) => s.categoryId === sel.categoryId && s.serviceId === sel.serviceId);
      return exists
        ? prev.filter((s) => !(s.categoryId === sel.categoryId && s.serviceId === sel.serviceId))
        : [...prev, sel];
    });

  const handleQty = (catId: string, svcId: string, delta: number) =>
    setSelections((prev) =>
      prev.map((s) =>
        s.categoryId === catId && s.serviceId === svcId
          ? { ...s, qty: Math.max(1, s.qty + delta) }
          : s
      )
    );

  const handleSelectPackage = (pkg: typeof readyPackages[0]) => {
    setSelectedCats(pkg.cats);
    setSelections(pkg.items);
    setStep(2);
    scrollTop();
  };

  const total = selections.reduce((acc, sel) => {
    const cat = categories.find((c) => c.id === sel.categoryId);
    const svc = cat?.services.find((s) => s.id === sel.serviceId);
    if (!svc) return acc;
    return acc + getItemTotal(svc, sel.qty);
  }, 0);

  const canNext = () => {
    if (step === 1) return selectedCats.length > 0;
    if (step === 2) return selections.length > 0;
    if (step === 3) return !!(clientData.name && clientData.email && clientData.whatsapp);
    return true;
  };

  const next = () => { if (canNext()) { setStep((s) => s + 1); scrollTop(); } };
  const back = () => { setStep((s) => s - 1); scrollTop(); };
  const goTo = (s: number) => { setStep(s); scrollTop(); };

  const handleConfirm = (method: "pix" | "card" | "boleto" | "whatsapp") => {
    const finalTotal = method === "pix" ? Math.round(total * 0.95) : total;
    const discount = method === "pix" ? "\n💰 Desconto Pix (5%) aplicado!" : "";
    const payLabel = { pix: "Pix", card: "Cartão de crédito", boleto: "Boleto bancário", whatsapp: "Atendimento direto" }[method];

    const msg = encodeURIComponent(
      `Olá! Finalizei meu pacote na FIRMANT:\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      selections.map((sel) => {
        const cat = categories.find((c) => c.id === sel.categoryId);
        const svc = cat?.services.find((s) => s.id === sel.serviceId);
        const lineTotal = svc ? getItemTotal(svc, sel.qty) : 0;
        return `• ${svc?.label}${sel.qty > 1 ? ` × ${sel.qty}` : ""} — ${fmt(lineTotal)}`;
      }).join("\n") +
      `\n━━━━━━━━━━━━━━━━━\n` +
      `💳 Preferência informada: ${payLabel}${discount}\n` +
      `💰 Total: ${fmt(finalTotal)}\n\n` +
      `👤 ${clientData.name}${clientData.empresa ? ` — ${clientData.empresa}` : ""}\n` +
      `📧 ${clientData.email}\n` +
      `📱 ${clientData.whatsapp}` +
      (clientData.obs ? `\n\n📝 ${clientData.obs}` : "")
    );
    window.open(`https://wa.me/5511915058962?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  const steps = ["Serviços", "Detalhes", "Seus dados", "Resumo", "Finalizar"];

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)", padding: "120px 48px 80px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: easeCurve }}
          style={{ maxWidth: "520px", textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "rgba(201,168,76,0.15)", border: "1.5px solid var(--accent-gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "16px" }}>Pedido enviado!</h2>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "40px" }}>
            O resumo completo foi enviado para o WhatsApp. Nossa equipe entrará em contato em até <strong style={{ color: "var(--text-primary)" }}>24h</strong> para validar o pedido, confirmar prazos e orientar os próximos passos.
          </p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", padding: "14px 32px", backgroundColor: "var(--accent-gold)", color: "var(--navy-950)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-body)", textDecoration: "none" }}>
            Voltar ao site
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={topRef} style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Hero */}
      <div style={{ paddingTop: "120px", paddingBottom: "72px", backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}>
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: "block", marginBottom: "14px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--accent-gold)", fontFamily: "var(--font-body)" }}>
            Configure seu plano
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "14px", fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
            Monte Seu <span className="text-gradient">Pacote</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: "540px", fontFamily: "var(--font-body)" }}>
            Escolha os serviços, defina as quantidades e envie seu resumo para atendimento.
          </motion.p>
        </div>
      </div>

      {/* Wizard */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 48px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "56px", alignItems: "start" }}>
          {/* Coluna principal */}
          <div>
            {/* Step bar */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "52px" }}>
              {steps.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <button onClick={() => done ? goTo(n) : undefined}
                        style={{
                          width: "34px", height: "34px", borderRadius: "50%",
                          border: `2px solid ${active ? "var(--accent-gold)" : done ? "var(--accent-gold)" : "rgba(255,255,255,0.12)"}`,
                          backgroundColor: active ? "var(--accent-gold)" : done ? "rgba(201,168,76,0.15)" : "transparent",
                          color: active ? "var(--navy-950)" : done ? "var(--accent-gold)" : "var(--text-muted)",
                          fontSize: "12px", fontWeight: 700, cursor: done ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 300ms ease", fontFamily: "var(--font-body)",
                        }}>
                        {done ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : n}
                      </button>
                      <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: active ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}>{label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: "2px", backgroundColor: step > n ? "var(--accent-gold)" : "rgba(255,255,255,0.08)", margin: "0 8px 18px", transition: "background-color 350ms ease" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: easeCurve }}>
                {step === 1 && <StepCategories selected={selectedCats} onToggle={toggleCat} />}
                {step === 2 && <StepServices activeCategoryIds={selectedCats} selections={selections} onToggle={toggleSvc} onQty={handleQty} />}
                {step === 3 && <StepContact data={clientData} onChange={setClientData} />}
                {step === 4 && <StepSummary selections={selections} clientData={clientData} total={total} onEdit={goTo} />}
                {step === 5 && <StepFinalization total={total} clientData={clientData} selections={selections} onConfirm={handleConfirm} />}
              </motion.div>
            </AnimatePresence>

            {/* Navegação */}
            {step < 5 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {step > 1 ? (
                  <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 22px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer", letterSpacing: "0.06em" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Voltar
                  </button>
                ) : <div />}
                <button onClick={next} disabled={!canNext()}
                  style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "13px 34px", borderRadius: "999px", backgroundColor: canNext() ? "var(--accent-gold)" : "rgba(255,255,255,0.08)", color: canNext() ? "var(--navy-950)" : "var(--text-muted)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-body)", border: "none", cursor: canNext() ? "pointer" : "not-allowed", transition: "all 250ms ease" }}>
                  {step === 4 ? "Finalizar pedido" : "Continuar"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </div>
            )}
            {step === 5 && (
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 22px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  Voltar ao resumo
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "var(--bg-card)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Seu pacote</span>
              </div>
              <div style={{ padding: "18px 24px", minHeight: "100px" }}>
                {selections.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>Nenhum item selecionado ainda.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selections.map((sel) => {
                      const cat = categories.find((c) => c.id === sel.categoryId);
                      const svc = cat?.services.find((s) => s.id === sel.serviceId);
                      if (!svc) return null;
                      return (
                        <div key={sel.serviceId} style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "9px 11px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.04)" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            {svc.label}{sel.qty > 1 && <span style={{ color: cat?.color, marginLeft: "4px" }}>×{sel.qty}</span>}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: cat?.color, flexShrink: 0 }}>{fmt(getItemTotal(svc, sel.qty))}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {selections.length > 0 && (
                <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Total</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(total)}</span>
                </div>
              )}
            </div>

            {/* Pacotes prontos */}
            <div style={{ marginTop: "20px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(201,168,76,0.18)", backgroundColor: "rgba(201,168,76,0.03)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--accent-gold)", marginBottom: "6px", fontFamily: "var(--font-body)" }}>Pacotes prontos</p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "14px", fontFamily: "var(--font-body)" }}>Clique para pré-configurar</p>
              {readyPackages.map((pkg) => (
                <button
                  key={pkg.label}
                  onClick={() => handleSelectPackage(pkg)}
                  style={{
                    display: "block", width: "100%", marginBottom: "8px",
                    padding: "11px 13px", borderRadius: "10px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 250ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(201,168,76,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-card)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "0.1em", fontFamily: "var(--font-body)" }}>{pkg.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{fmt(getPackageTotal(pkg))}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pkg.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
