"use client";

import { useMemo, useState } from "react";
import type { ProposalSnapshot } from "@/lib/proposals/types";

type PublicResult = {
  expired: boolean;
  snapshot: ProposalSnapshot | null;
  version?: { id: string; contentHash: string; termsVersion: string };
  acceptance?: { decision: string; accepted_at: string } | null;
  currentStatus?: string;
  payment?: { milestone_id: string; checkout_url: string | null; order_id: string | null; status: string | null; payment_method: string | null } | null;
};

export function ProposalPublicClient({ token, result }: { token: string; result: PublicResult }) {
  const snapshot = result.snapshot;
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState(snapshot?.proposal.client_email ?? "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [consent, setConsent] = useState(false);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(result.acceptance?.decision ?? "");
  const [checkoutUrl, setCheckoutUrl] = useState(result.payment?.checkout_url ?? "");
  const paymentMethods = useMemo(() => parseArray(snapshot?.proposal.payment_methods_json), [snapshot]);

  if (result.expired || !snapshot) {
    return <main className="proposal-public-page"><section className="proposal-public-shell proposal-expired"><span>FIRMANT</span><h1>Esta proposta expirou</h1><p>Solicite à FIRMANT uma nova versão para continuar.</p></section></main>;
  }
  const { proposal, items, milestones } = snapshot;

  async function submit(nextDecision: "ACCEPTED" | "REJECTED") {
    if (nextDecision === "ACCEPTED" && !consent) { setError("Confirme a leitura e o aceite da proposta."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/proposals/${token}/decision`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ decision: nextDecision, signerName, signerEmail, paymentMethod, reason, consent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível registrar sua decisão.");
      setDecision(data.decision);
      if (data.payment?.checkoutUrl) {
        setCheckoutUrl(data.payment.checkoutUrl);
        window.location.assign(data.payment.checkoutUrl);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível registrar sua decisão."); }
    finally { setLoading(false); }
  }

  async function retryPayment() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/proposals/${token}/payment`, { method: "POST", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível gerar o pagamento.");
      setCheckoutUrl(data.checkoutUrl);
      window.location.assign(data.checkoutUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível gerar o pagamento."); }
    finally { setLoading(false); }
  }

  return <main className="proposal-public-page"><div className="proposal-public-shell">
    <header className="proposal-public-hero"><div><span>FIRMANT · PROPOSTA COMERCIAL</span><h1>{proposal.project_name}</h1><p>Uma proposta preparada para <strong>{proposal.client_name}</strong>.</p></div><div className="proposal-public-meta"><span>{proposal.proposal_number}</span><strong>v{proposal.current_version}</strong><small>Válida até {date(proposal.valid_until)}</small><a href={`/api/proposals/${token}/pdf`} target="_blank" rel="noreferrer">Abrir PDF</a></div></header>
    <section className="proposal-public-intro"><p>{proposal.summary}</p></section>
    <div className="proposal-public-grid"><section><article className="proposal-public-card"><span className="proposal-section-number">01</span><h2>Escopo do projeto</h2><p className="proposal-preline">{proposal.scope}</p></article>
      <article className="proposal-public-card"><span className="proposal-section-number">02</span><h2>Entregáveis e investimento</h2><div className="proposal-public-items">{items.map((item) => <div key={item.id}><div><strong>{item.name}</strong><p>{item.description}</p><small>{formatQuantity(item.quantity)} {item.unit}</small></div><strong>{money(item.total_cents)}</strong></div>)}</div><div className="proposal-public-total"><span>Investimento total</span><strong>{money(proposal.total_cents)}</strong></div></article>
      <article className="proposal-public-card"><span className="proposal-section-number">03</span><h2>O que está incluído</h2><ul className="proposal-check-list">{parseArray(proposal.included_json).map((item) => <li key={item}>{item}</li>)}</ul><h3>Não incluído</h3><ul>{parseArray(proposal.excluded_json).map((item) => <li key={item}>{item}</li>)}</ul></article>
      <article className="proposal-public-card"><span className="proposal-section-number">04</span><h2>Prazo e revisões</h2><div className="proposal-public-facts"><div><span>Prazo estimado</span><strong>{proposal.estimated_deadline || "Conforme cronograma acordado"}</strong></div><div><span>Rodadas incluídas</span><strong>{proposal.revisions_included}</strong></div></div><p>{proposal.revision_definition}</p></article>
      <article className="proposal-public-card"><span className="proposal-section-number">05</span><h2>Condições</h2><h3>Licença e uso</h3><p>{proposal.license_terms}</p><h3>Cancelamento</h3><p>{proposal.cancellation_terms}</p><small>Versão dos termos: {snapshot.termsVersion} · Integridade: {result.version?.contentHash.slice(0, 18)}…</small></article>
    </section><aside><section className="proposal-public-card proposal-payment-card"><span className="proposal-section-number">PAGAMENTO</span><h2>Etapas</h2>{milestones.map((milestone) => <div className="proposal-payment-row" key={milestone.id}><div><strong>{milestone.label}</strong><small>{milestone.due_trigger}</small></div><strong>{money(milestone.amount_cents)}</strong></div>)}</section>
      <section className="proposal-public-card proposal-decision-card"><h2>Sua decisão</h2>{decision ? <DecisionResult decision={decision} checkoutUrl={checkoutUrl} retryPayment={retryPayment} loading={loading} error={error} /> : <><label><span>Nome completo</span><input value={signerName} onChange={(e) => setSignerName(e.target.value)} /></label><label><span>E-mail</span><input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} /></label><fieldset><legend>Forma de pagamento</legend>{paymentMethods.map((method) => <label className="proposal-payment-option" key={method}><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} /><span>{paymentLabel(method)}</span></label>)}</fieldset><label className="proposal-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Li e aceito integralmente esta proposta e seus termos. Estou ciente de que nome, e-mail, data, IP e versão serão registrados.</span></label>{error && <p className="workflow-alert workflow-alert-error">{error}</p>}<button className="proposal-accept-button" disabled={loading} onClick={() => void submit("ACCEPTED")}>{loading ? "Registrando..." : "Aceitar proposta e continuar"}</button><button className="proposal-reject-toggle" type="button" onClick={() => setShowReject((value) => !value)}>Não desejo aprovar</button>{showReject && <div className="proposal-reject-box"><textarea placeholder="Motivo (opcional)" value={reason} onChange={(e) => setReason(e.target.value)} /><button type="button" disabled={loading} onClick={() => void submit("REJECTED")}>Registrar recusa</button></div>}</>}</section>
    </aside></div><footer className="proposal-public-footer"><strong>FIRMANT</strong><span>Comunicação, criação e tecnologia com processo claro.</span></footer>
  </div></main>;
}

function DecisionResult({ decision, checkoutUrl, retryPayment, loading, error }: { decision: string; checkoutUrl: string; retryPayment: () => Promise<void>; loading: boolean; error: string }) {
  if (decision === "REJECTED") return <div className="proposal-decision-result"><strong>Recusa registrada.</strong><p>A FIRMANT recebeu sua decisão.</p></div>;
  return <div className="proposal-decision-result"><strong>Proposta aceita.</strong><p>Seu aceite foi registrado com a versão exata desta proposta.</p>{checkoutUrl ? <a href={checkoutUrl}>Continuar para o pagamento</a> : <button className="proposal-accept-button" disabled={loading} onClick={() => void retryPayment()}>{loading ? "Gerando..." : "Gerar link de pagamento"}</button>}{error && <p className="workflow-alert workflow-alert-error">{error}</p>}</div>;
}
function parseArray(value?: string) { try { const parsed = JSON.parse(value ?? "[]"); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function date(value: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(value)) : "—"; }
function formatQuantity(value: number) { return Number.isInteger(value) ? String(value) : value.toLocaleString("pt-BR"); }
function paymentLabel(value: string) { return value === "PIX" ? "Pix" : value === "CREDIT_CARD" ? "Cartão de crédito" : "Boleto"; }
