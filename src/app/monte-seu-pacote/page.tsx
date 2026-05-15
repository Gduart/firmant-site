"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  categories,
  fmtCurrency,
  getItemTotal,
  getPackageBreakdown,
  getPackageTotal,
  getServiceById,
  getUnitPrice,
  readyPackages,
  type ClientData,
  type Selection,
} from "@/lib/package-catalog";

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
const fmt = fmtCurrency;

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
        <motion.div variants={fadeUp}>{field("cpf", "CPF", "000.000.000-00", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("email", "E-mail", "seu@email.com", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("whatsapp", "WhatsApp", "(11) 99999-9999", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("instagram", "Instagram", "@suaempresa", true)}</motion.div>
        <motion.div variants={fadeUp}>{field("empresa", "Empresa / negócio", "Nome da empresa ou projeto")}</motion.div>
        <motion.div variants={fadeUp} style={{ gridColumn: "1 / -1" }}>
          {field("obs", "Briefing / observações", "Conte sobre seu negócio e o que espera dos serviços...", false, true)}
        </motion.div>
      </div>
      <motion.div variants={fadeUp} className="wizard-privacy-note">
        <p>
          Ao continuar, você declara que leu e concorda com os{" "}
          <Link href="/termos-de-uso" target="_blank">
            Termos de Uso
          </Link>
          {", com a "}
          <Link href="/politica-privacidade" target="_blank">
            Política de Privacidade
          </Link>
          {" "}e com a{" "}
          <Link href="/politica-de-reembolso" target="_blank">
            Política de Reembolso da FIRMANT
          </Link>
          , estando ciente de que serviços digitais personalizados podem ter regras específicas de cancelamento e reembolso conforme o estágio de execução.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 4: Resumo ───────────────────────────────────────────────────────────
function StepSummary({
  selections,
  clientData,
  breakdown,
  onEdit,
}: {
  selections: Selection[];
  clientData: ClientData;
  breakdown: ReturnType<typeof getPackageBreakdown>;
  onEdit: (step: number) => void;
}) {
  const pixPackageTotal = Math.round(breakdown.grandTotal * 0.95);
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
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "0 0 2px" }}>{clientData.whatsapp}</p>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>CPF: {clientData.cpf} · Instagram: {clientData.instagram}</p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ padding: "24px 28px", borderRadius: "14px", border: "1.5px solid rgba(201,168,76,0.3)", backgroundColor: "rgba(201,168,76,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", margin: "0 0 4px" }}>Resumo financeiro</p>
          {breakdown.hasOneTime && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 2px" }}>
              Avulso: {fmt(breakdown.oneTimeTotal)}
            </p>
          )}
          {breakdown.hasRecurring && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
              Mensal: {fmt(breakdown.recurringTotal)}
            </p>
          )}
          <p style={{ fontSize: "11px", color: "#34D399", margin: "2px 0 0" }}>
            Pix no fechamento: {fmt(pixPackageTotal)}
          </p>
        </div>
        <span style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(breakdown.grandTotal)}</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 5: Validação do contrato ───────────────────────────────────────────
function StepContractValidation({
  selections,
  clientData,
  breakdown,
  accepted,
  onAcceptedChange,
  onEdit,
}: {
  selections: Selection[];
  clientData: ClientData;
  breakdown: ReturnType<typeof getPackageBreakdown>;
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  onEdit: (step: number) => void;
}) {
  const contractType = inferPublicContractType(selections, breakdown);
  const requiresDigitalSignature = contractType !== "pdf_email";
  const grouped = categories
    .map((cat) => ({
      cat,
      items: selections
        .filter((selection) => selection.categoryId === cat.id)
        .map((selection) => ({
          selection,
          service: cat.services.find((service) => service.id === selection.serviceId),
        }))
        .filter((item) => item.service),
    }))
    .filter((group) => group.items.length > 0);

  const openContractPreview = () => {
    const preview = window.open("", "_blank");

    if (!preview) {
      return;
    }

    preview.document.write(buildPublicContractHtml({
      selections,
      clientData,
      breakdown,
      contractType,
      requiresDigitalSignature,
    }));
    preview.document.close();
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "32px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Confira o contrato/termo de contratação antes de seguir para o pagamento. Esta etapa registra que você revisou seus dados, os serviços selecionados e as condições principais da contratação.
      </motion.p>

      <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", padding: "22px 24px", borderRadius: "14px", border: "1.5px solid rgba(201,168,76,0.28)", backgroundColor: "rgba(201,168,76,0.05)", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--accent-gold)", margin: "0 0 8px" }}>
            Contrato para validação
          </p>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", fontFamily: "var(--font-heading)", margin: "0 0 8px" }}>
            Termo de contratação FIRMANT
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            {requiresDigitalSignature
              ? "Este tipo de contratação poderá receber contrato digital para assinatura oficial após a validação comercial da FIRMANT."
              : "Este tipo de contratação poderá receber contrato/termo em PDF por e-mail após a criação do pedido."}
          </p>
        </div>
        <button
          type="button"
          onClick={openContractPreview}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px 20px", borderRadius: "999px", border: "1px solid rgba(201,168,76,0.5)", backgroundColor: "transparent", color: "var(--accent-gold)", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Gerar contrato
        </button>
      </motion.div>

      <motion.div variants={fadeUp} style={{ padding: "24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "var(--bg-card)", marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", margin: "0 0 8px" }}>Dados do cliente</p>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 4px" }}>{clientData.name}{clientData.empresa && ` — ${clientData.empresa}`}</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "0 0 3px" }}>{clientData.email} · {clientData.whatsapp}</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>CPF: {clientData.cpf} · Instagram: {clientData.instagram}</p>
          </div>
          <button onClick={() => onEdit(3)} style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>editar</button>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", margin: "0 0 10px" }}>Serviços contratados</p>
          {grouped.map(({ cat, items }) => (
            <div key={cat.id} style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: cat.color, margin: "0 0 6px" }}>{cat.title}</p>
              {items.map(({ selection, service }) => service && (
                <div key={service.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.035)", marginBottom: "5px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{service.label}{selection.qty > 1 && ` x ${selection.qty}`}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{fmt(getItemTotal(service, selection.qty))}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "18px" }}>
          <ContractInfo label="Valor avulso" value={fmt(breakdown.oneTimeTotal)} />
          <ContractInfo label="Valor mensal" value={fmt(breakdown.recurringTotal)} />
          <ContractInfo label="Total estimado" value={fmt(breakdown.grandTotal)} highlight />
        </div>

        <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 8px" }}>
            O pagamento será escolhido no próximo passo. Os valores do configurador podem ser revisados pela FIRMANT quando houver necessidade de análise técnica, escopo personalizado, disponibilidade operacional ou condições específicas do projeto.
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
            Aplicam-se os{" "}
            <Link href="/termos-de-uso" target="_blank">Termos de Uso</Link>
            {", a "}
            <Link href="/politica-privacidade" target="_blank">Política de Privacidade</Link>
            {" e a "}
            <Link href="/politica-de-reembolso" target="_blank">Política de Reembolso</Link>
            {" da FIRMANT."}
          </p>
        </div>
      </motion.div>

      <motion.label variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "18px 20px", borderRadius: "14px", border: `1.5px solid ${accepted ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.08)"}`, backgroundColor: accepted ? "rgba(201,168,76,0.055)" : "rgba(255,255,255,0.025)", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          style={{ marginTop: "3px", width: "18px", height: "18px", accentColor: "var(--accent-gold)", flexShrink: 0 }}
        />
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
          Li, conferi e valido os dados acima, os serviços solicitados, as políticas aplicáveis e as condições gerais do contrato/termo de contratação da FIRMANT. Estou ciente de que, dependendo do tipo de serviço contratado, poderei receber contrato digital para assinatura oficial.
        </span>
      </motion.label>
    </motion.div>
  );
}

function ContractInfo({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }}>
      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: highlight ? "1.05rem" : "14px", fontWeight: 800, color: highlight ? "var(--accent-gold)" : "var(--text-primary)", margin: 0, fontFamily: "var(--font-heading)" }}>{value}</p>
    </div>
  );
}

function inferPublicContractType(
  selections: Selection[],
  breakdown: ReturnType<typeof getPackageBreakdown>,
) {
  const hasDevelopment = selections.some((selection) => selection.categoryId === "dev");
  const hasRecurring = breakdown.hasRecurring;

  if (hasDevelopment) {
    return "analise_manual";
  }

  if (hasRecurring || breakdown.grandTotal >= 1000 || selections.length > 1) {
    return "autentique";
  }

  return "pdf_email";
}

function buildPublicContractHtml({
  selections,
  clientData,
  breakdown,
  contractType,
  requiresDigitalSignature,
}: {
  selections: Selection[];
  clientData: ClientData;
  breakdown: ReturnType<typeof getPackageBreakdown>;
  contractType: string;
  requiresDigitalSignature: boolean;
}) {
  const services = selections
    .map((selection) => {
      const category = categories.find((item) => item.id === selection.categoryId);
      const service = getServiceById(selection.categoryId, selection.serviceId);

      if (!category || !service) {
        return "";
      }

      return `<li><strong>${escapeHtml(category.title)}:</strong> ${escapeHtml(service.label)}${selection.qty > 1 ? ` x ${selection.qty}` : ""} - ${escapeHtml(fmt(getItemTotal(service, selection.qty)))}</li>`;
    })
    .join("");

  const signatureNotice = requiresDigitalSignature
    ? "Dependendo da validacao comercial e do tipo de escopo, este contrato podera ser enviado digitalmente para assinatura oficial."
    : "Este contrato/termo podera ser enviado em PDF por e-mail apos a criacao do pedido.";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Contrato para conferencia | FIRMANT</title>
  <style>
    body { margin: 0; padding: 48px; background: #f6f7fb; color: #152033; font-family: Arial, sans-serif; line-height: 1.58; }
    main { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #dde2ec; padding: 44px; }
    h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: .02em; }
    h2 { margin: 28px 0 8px; font-size: 16px; text-transform: uppercase; letter-spacing: .08em; }
    p { margin: 0 0 10px; }
    ul { margin: 8px 0 0 20px; padding: 0; }
    .meta { color: #667085; font-size: 13px; margin-bottom: 26px; }
    .notice { margin-top: 28px; padding: 16px 18px; border: 1px solid #d6b557; background: #fff9e8; }
    .actions { margin-top: 28px; }
    button { border: 0; border-radius: 999px; background: #c9a84c; color: #101828; padding: 12px 20px; font-weight: 700; cursor: pointer; }
    @media print { body { background: #fff; padding: 0; } main { border: 0; } .actions { display: none; } }
  </style>
</head>
<body>
  <main>
    <h1>Contrato / Termo de Contratacao FIRMANT</h1>
    <p class="meta">Versao para conferencia gerada no site. O numero final do contrato sera atribuido apos a criacao do pedido.</p>

    <h2>1. Dados da FIRMANT</h2>
    <p>Nome comercial: FIRMANT<br />CNPJ: 63.867.205/0001-99<br />Atendimento: 100% online para todo o Brasil<br />E-mail: ag.firmant@gmail.com<br />WhatsApp: +55 11 91491-2488</p>

    <h2>2. Dados do cliente</h2>
    <p>Nome completo: ${escapeHtml(clientData.name)}<br />CPF: ${escapeHtml(clientData.cpf)}<br />E-mail: ${escapeHtml(clientData.email)}<br />WhatsApp: ${escapeHtml(clientData.whatsapp)}<br />Instagram: ${escapeHtml(clientData.instagram)}${clientData.empresa ? `<br />Empresa/projeto: ${escapeHtml(clientData.empresa)}` : ""}</p>

    <h2>3. Servicos solicitados</h2>
    <ul>${services}</ul>

    <h2>4. Condicoes comerciais</h2>
    <p>Valor avulso: ${escapeHtml(fmt(breakdown.oneTimeTotal))}<br />Valor mensal: ${escapeHtml(fmt(breakdown.recurringTotal))}<br />Total estimado: ${escapeHtml(fmt(breakdown.grandTotal))}<br />Forma de pagamento: a escolher no proximo passo do checkout.<br />Tipo de contrato previsto: ${escapeHtml(contractType)}.</p>

    <h2>5. Politicas aplicaveis</h2>
    <p>Aplicam-se os Termos de Uso, a Politica de Privacidade e a Politica de Reembolso da FIRMANT, disponiveis em firmant.com.br.</p>

    <h2>6. Clausulas principais</h2>
    <p>A execucao dos servicos depende do escopo contratado, envio de informacoes pelo cliente, aprovacoes, materiais necessarios, disponibilidade operacional e condicoes comerciais confirmadas pela FIRMANT.</p>
    <p>Servicos digitais personalizados podem envolver estrategia, planejamento, criacao, tecnologia, inteligencia artificial, automacoes, desenvolvimento, edicao e producao intelectual sob demanda.</p>
    <p>A FIRMANT pode utilizar ferramentas de IA como apoio estrategico, criativo, tecnico e operacional, mantendo curadoria e responsabilidade humana sobre orientacoes e entregas.</p>
    <p>A FIRMANT nao garante resultados absolutos, como vendas, seguidores, viralizacao, performance exata, posicao garantida em buscadores ou retorno financeiro especifico.</p>

    <div class="notice">${escapeHtml(signatureNotice)}</div>
    <div class="actions"><button onclick="window.print()">Imprimir / salvar em PDF</button></div>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Step 6: Finalização ──────────────────────────────────────────────────────
type FinalizationAction =
  | "PIX"
  | "CREDIT_CARD"
  | "SUBSCRIPTION"
  | "WHATSAPP";

type FinalizationMethod = {
  id: FinalizationAction;
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
  priceLabel: string;
  disabled?: boolean;
};

function StepFinalization({
  breakdown,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  breakdown: ReturnType<typeof getPackageBreakdown>;
  onConfirm: (action: FinalizationAction) => void;
  isSubmitting: boolean;
  submitError: string;
}) {
  const [selected, setSelected] = useState<FinalizationAction | null>(null);
  const packageAmount = breakdown.grandTotal;
  const pixPackageAmount = Math.round(packageAmount * 0.95);
  const hasSelectedItems = packageAmount > 0;

  const methods: FinalizationMethod[] = [
    {
      id: "PIX",
      label: "Pagar este pacote via Pix",
      badge: "5% off",
      badgeColor: "#34D399",
      description: "Pagamento único do pacote selecionado, com desconto Pix. Não cria mensalidade.",
      priceLabel: hasSelectedItems ? fmt(pixPackageAmount) : "Selecione um item",
      disabled: !hasSelectedItems,
    },
    {
      id: "CREDIT_CARD",
      label: "Pagar este pacote no cartão",
      badge: "Até 12×",
      badgeColor: "#22D3EE",
      description: "Pagamento único do pacote selecionado, com parcelamento no checkout do Asaas. Não cria mensalidade.",
      priceLabel: hasSelectedItems
        ? `${fmt(packageAmount)} ou 12× de ${fmt(Math.round(packageAmount / 12))}`
        : "Selecione um item",
      disabled: !hasSelectedItems,
    },
    {
      id: "SUBSCRIPTION",
      label: "Assinar mensal no cartão",
      badge: "Cartão recorrente",
      badgeColor: "#A78BFA",
      description: "Transforma o pacote selecionado em assinatura mensal recorrente no cartão.",
      priceLabel: hasSelectedItems ? `${fmt(packageAmount)}/mês` : "Selecione um item",
      disabled: !hasSelectedItems,
    },
    {
      id: "WHATSAPP",
      label: "Falar no WhatsApp",
      badge: "Opcional",
      badgeColor: "#25D366",
      description: "Atendimento humano para negociação assistida, dúvidas comerciais ou fechamento manual.",
      priceLabel: "Atendimento",
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      <motion.p variants={fadeUp} style={{ marginBottom: "40px", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Escolha a condição de pagamento. Pix e cartão são pagamentos avulsos. Assinatura transforma o pacote selecionado em cobrança mensal recorrente no cartão.
      </motion.p>

      <motion.div variants={fadeUp} style={{ padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: breakdown.hasRecurring && breakdown.hasOneTime ? "10px" : 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Resumo do fechamento</span>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(breakdown.grandTotal)}</span>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 4px" }}>
          Pix: {fmt(pixPackageAmount)}
          <span style={{ marginLeft: "8px" }}>Cartão: {fmt(packageAmount)}</span>
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
          Assinatura: {fmt(packageAmount)}/mês
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {methods.map((method) => {
          const active = !method.disabled && selected === method.id;
          return (
            <motion.button
              key={method.id}
              variants={fadeUp}
              disabled={method.disabled || isSubmitting}
              onClick={() => {
                if (!method.disabled) {
                  setSelected(method.id);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "18px 20px",
                borderRadius: "14px",
                cursor: method.disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                border: `1.5px solid ${active ? method.badgeColor : "rgba(255,255,255,0.08)"}`,
                backgroundColor: active ? "rgba(255,255,255,0.06)" : "var(--bg-card)",
                opacity: method.disabled ? 0.55 : 1,
                transition: "all 250ms ease",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{method.label}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.08)", color: method.badgeColor }}>
                    {method.badge}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>{method.description}</p>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: active ? method.badgeColor : "var(--text-secondary)", fontFamily: "var(--font-heading)", flexShrink: 0 }}>
                {method.priceLabel}
              </span>
            </motion.button>
          );
        })}
      </div>

      {submitError && (
        <motion.div variants={fadeUp} style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.08)", marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", color: "#fca5a5", margin: 0, lineHeight: 1.6 }}>
            {submitError}
          </p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} style={{ padding: "14px 18px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          Antes de concluir o pagamento, recomendamos a leitura dos Termos de Uso, da Política de Privacidade e da Política de Reembolso da FIRMANT. Serviços digitais personalizados podem não ser elegíveis a reembolso integral após o início da execução. Dependendo do tipo de serviço contratado, você receberá por e-mail o contrato ou termo digital da FIRMANT para formalização e, quando aplicável, assinatura oficial.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ marginTop: "24px" }}>
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected || isSubmitting}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "16px 40px", borderRadius: "999px", width: "100%", justifyContent: "center",
            backgroundColor: selected && !isSubmitting ? "var(--accent-gold)" : "rgba(255,255,255,0.08)",
            color: selected && !isSubmitting ? "var(--navy-950)" : "var(--text-muted)",
            fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            fontFamily: "var(--font-body)", border: "none", cursor: selected && !isSubmitting ? "pointer" : "not-allowed",
            transition: "all 300ms ease",
          }}
        >
          {isSubmitting ? "Abrindo checkout..." : selected ? "Continuar para o fechamento" : "Selecione uma opção"}
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
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    cpf: "",
    email: "",
    whatsapp: "",
    instagram: "",
    empresa: "",
    obs: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
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

  const breakdown = getPackageBreakdown(selections);
  const total = breakdown.grandTotal;

  const canNext = () => {
    if (step === 1) return selectedCats.length > 0;
    if (step === 2) return selections.length > 0;
    if (step === 3) {
      return !!(
        clientData.name
        && clientData.cpf.replace(/\D/g, "").length === 11
        && clientData.email
        && clientData.whatsapp
        && clientData.instagram
      );
    }
    if (step === 5) return contractAccepted;
    return true;
  };

  const next = () => { if (canNext()) { setStep((s) => s + 1); scrollTop(); } };
  const back = () => { setStep((s) => s - 1); scrollTop(); };
  const goTo = (s: number) => {
    if (s < 5) {
      setContractAccepted(false);
    }

    setStep(s);
    scrollTop();
  };

  const handleWhatsappFlow = () => {
    const msg = encodeURIComponent(
      `Olá! Finalizei meu pacote na FIRMANT:\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      selections.map((sel) => {
        const svc = getServiceById(sel.categoryId, sel.serviceId);
        const lineTotal = svc ? getItemTotal(svc, sel.qty) : 0;
        return `• ${svc?.label}${sel.qty > 1 ? ` × ${sel.qty}` : ""} — ${fmt(lineTotal)}`;
      }).join("\n") +
      `\n━━━━━━━━━━━━━━━━━\n` +
      `💰 Avulso: ${fmt(breakdown.oneTimeTotal)}\n` +
      `🔁 Mensal: ${fmt(breakdown.recurringTotal)}\n` +
      `💰 Total estimado: ${fmt(total)}\n\n` +
      `👤 ${clientData.name}${clientData.empresa ? ` — ${clientData.empresa}` : ""}\n` +
      `🪪 CPF: ${clientData.cpf}\n` +
      `📧 ${clientData.email}\n` +
      `📱 ${clientData.whatsapp}\n` +
      `📸 Instagram: ${clientData.instagram}` +
      (clientData.obs ? `\n\n📝 ${clientData.obs}` : "")
    );
    window.open(`https://wa.me/5511914912488?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  const handleConfirm = async (action: FinalizationAction) => {
    setSubmitError("");

    if (action === "WHATSAPP") {
      handleWhatsappFlow();
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        action === "SUBSCRIPTION"
          ? "/api/payments/subscription"
          : "/api/payments/checkout";

      const payload =
        action === "SUBSCRIPTION"
          ? { selections, clientData }
          : { selections, clientData, paymentMethod: action };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao iniciar o checkout.");
      }

      if (!data.checkoutUrl) {
        throw new Error("O checkout não retornou uma URL válida.");
      }

      await registerCommercialData(data.orderId);
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Falha ao iniciar o fluxo de pagamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerCommercialData = async (orderId: string | undefined) => {
    if (!orderId) {
      return;
    }

    try {
      await fetch("/api/commercial/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, clientData }),
      });
    } catch (error) {
      console.error("Falha ao registrar dados comerciais.", error);
    }
  };

  const steps = ["Serviços", "Detalhes", "Seus dados", "Resumo", "Contrato", "Finalizar"];

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
            Escolha os serviços, defina as quantidades e feche seu pacote com checkout seguro ou atendimento consultivo.
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
                {step === 4 && <StepSummary selections={selections} clientData={clientData} breakdown={breakdown} onEdit={goTo} />}
                {step === 5 && <StepContractValidation selections={selections} clientData={clientData} breakdown={breakdown} accepted={contractAccepted} onAcceptedChange={setContractAccepted} onEdit={goTo} />}
                {step === 6 && <StepFinalization breakdown={breakdown} onConfirm={handleConfirm} isSubmitting={isSubmitting} submitError={submitError} />}
              </motion.div>
            </AnimatePresence>

            {/* Navegação */}
            {step < 6 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {step > 1 ? (
                  <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 22px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer", letterSpacing: "0.06em" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Voltar
                  </button>
                ) : <div />}
                <button onClick={next} disabled={!canNext()}
                  style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "13px 34px", borderRadius: "999px", backgroundColor: canNext() ? "var(--accent-gold)" : "rgba(255,255,255,0.08)", color: canNext() ? "var(--navy-950)" : "var(--text-muted)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-body)", border: "none", cursor: canNext() ? "pointer" : "not-allowed", transition: "all 250ms ease" }}>
                  {step === 4 ? "Validar contrato" : step === 5 ? "Ir para pagamento" : "Continuar"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </div>
            )}
            {step === 6 && (
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 22px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  Voltar ao contrato
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
                      const svc = getServiceById(sel.categoryId, sel.serviceId);
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
                <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {breakdown.hasOneTime && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: breakdown.hasRecurring ? "8px" : 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Avulso</span>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(breakdown.oneTimeTotal)}</span>
                    </div>
                  )}
                  {breakdown.hasRecurring && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Mensal</span>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#A78BFA", fontFamily: "var(--font-heading)" }}>{fmt(breakdown.recurringTotal)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Total estimado</span>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-gold)", fontFamily: "var(--font-heading)" }}>{fmt(total)}</span>
                  </div>
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
