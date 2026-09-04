"use client";
/* eslint-disable @next/next/no-img-element -- mídia privada autenticada pelo token da proposta */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ProposalSnapshot } from "@/lib/proposals/types";

type PublicResult = {
  expired: boolean;
  snapshot: ProposalSnapshot | null;
  version?: { id: string; contentHash: string; termsVersion: string };
  acceptance?: { decision: string; accepted_at: string } | null;
  currentStatus?: string;
  payment?: { milestone_id: string; checkout_url: string | null; order_id: string | null; status: string | null; payment_method: string | null } | null;
  project?: { id: string; project_number: string; status: string } | null;
  media?: Array<{ id: string; title: string; assetType: "IMAGE" | "CAROUSEL" | "VIDEO"; status: string; versionNumber: number; caption: string | null; mimeType: string | null; sizeBytes: number | null }>;
};

type CardQuote = {
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  baseValue: number;
  monthlyAnticipationRate: number;
};

export function ProposalPublicClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [result, setResult] = useState<PublicResult | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [consent, setConsent] = useState(false);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [installmentCount, setInstallmentCount] = useState(1);
  const [payerDocument, setPayerDocument] = useState("");
  const [cardQuote, setCardQuote] = useState<CardQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const snapshot = result?.snapshot ?? null;
  const paymentMethods = useMemo(() => parseArray(snapshot?.proposal.payment_methods_json), [snapshot]);

  useEffect(() => {
    if (!token) { setInitialLoading(false); return; }
    const controller = new AbortController();
    setInitialLoading(true);
    fetch(`/api/proposals/${encodeURIComponent(token)}`, { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Proposta não encontrada.");
        return data as PublicResult;
      })
      .then((data) => {
        setResult(data);
        setSignerEmail(data.snapshot?.proposal.client_email ?? "");
        setDecision(data.acceptance?.decision ?? "");
        setCheckoutUrl(data.payment?.checkout_url ?? "");
        setPaymentMethod(data.payment?.payment_method ?? "");
        setError("");
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Não foi possível carregar a proposta.");
      })
      .finally(() => setInitialLoading(false));
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!token || paymentMethod !== "CREDIT_CARD") { setCardQuote(null); setQuoteError(""); return; }
    const controller = new AbortController();
    setQuoteLoading(true); setQuoteError("");
    fetch(`/api/proposals/${encodeURIComponent(token)}/payment/quote`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
      body: JSON.stringify({ installmentCount }), signal: controller.signal,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível calcular as parcelas.");
      setCardQuote(data as CardQuote);
    }).catch((cause) => {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setCardQuote(null); setQuoteError(cause instanceof Error ? cause.message : "Não foi possível calcular as parcelas.");
    }).finally(() => setQuoteLoading(false));
    return () => controller.abort();
  }, [token, paymentMethod, installmentCount]);

  if (initialLoading) {
    return <main className="proposal-public-page"><section className="proposal-public-shell proposal-expired"><span>FIRMANT</span><h1>Carregando proposta...</h1></section></main>;
  }

  if (!result) {
    return <main className="proposal-public-page"><section className="proposal-public-shell proposal-expired"><span>FIRMANT</span><h1>Link indisponível</h1><p>{error || "O endereço da proposta é inválido."}</p></section></main>;
  }

  if (result.expired || !snapshot) {
    return <main className="proposal-public-page"><section className="proposal-public-shell proposal-expired"><span>FIRMANT</span><h1>Esta proposta expirou</h1><p>Solicite à FIRMANT uma nova versão para continuar.</p></section></main>;
  }
  const { proposal, items, milestones } = snapshot;

  async function submit(nextDecision: "ACCEPTED" | "REJECTED") {
    if (nextDecision === "ACCEPTED" && !consent) { setError("Confirme a leitura e o aceite da proposta."); return; }
    if (nextDecision === "ACCEPTED" && paymentMethod === "CREDIT_CARD" && !validateCardPayment()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/proposals/${token}/decision`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ decision: nextDecision, signerName, signerEmail, paymentMethod, installmentCount, payerDocument, reason, consent }),
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
    if (paymentMethod === "CREDIT_CARD" && !validateCardPayment()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/proposals/${token}/payment`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ paymentMethod, installmentCount, payerDocument, regenerate: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível gerar o pagamento.");
      setCheckoutUrl(data.checkoutUrl);
      window.location.assign(data.checkoutUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível gerar o pagamento."); }
    finally { setLoading(false); }
  }

  function validateCardPayment() {
    const digits = payerDocument.replace(/\D/g, "");
    if (digits.length !== 11 && digits.length !== 14) { setError("Informe um CPF ou CNPJ válido do pagador."); return false; }
    if (!cardQuote || quoteLoading || quoteError) { setError(quoteError || "Aguarde o cálculo das parcelas."); return false; }
    return true;
  }

  const cardFields = paymentMethod === "CREDIT_CARD" ? <CardPaymentFields installmentCount={installmentCount} setInstallmentCount={setInstallmentCount} payerDocument={payerDocument} setPayerDocument={setPayerDocument} quote={cardQuote} loading={quoteLoading} error={quoteError} /> : null;
  const paymentChoices = <PaymentMethodChoices methods={paymentMethods} value={paymentMethod} onChange={(method) => { setPaymentMethod(method); if (method !== result.payment?.payment_method) setCheckoutUrl(""); setError(""); }} />;

  return <main className="proposal-public-page"><div className="proposal-public-shell">
    <header className="proposal-public-hero"><div><span>FIRMANT · PROPOSTA COMERCIAL</span><h1>{proposal.project_name}</h1><p>Uma proposta preparada para <strong>{proposal.client_name}</strong>.</p></div><div className="proposal-public-meta"><span>{proposal.proposal_number}</span><strong>v{proposal.current_version}</strong><small>Válida até {date(proposal.valid_until)}</small><a href={`/api/proposals/${token}/pdf`} target="_blank" rel="noreferrer">Abrir PDF</a></div></header>
    <section className="proposal-public-intro"><p>{proposal.summary}</p></section>
    <div className="proposal-public-grid"><section><article className="proposal-public-card"><span className="proposal-section-number">01</span><h2>Escopo do projeto</h2><p className="proposal-preline">{proposal.scope}</p></article>
      <article className="proposal-public-card"><span className="proposal-section-number">02</span><h2>Entregáveis e investimento</h2><div className="proposal-public-items">{items.map((item) => <div key={item.id}><div><strong>{item.name}</strong><p>{item.description}</p><small>{formatQuantity(item.quantity)} {item.unit}</small></div><strong>{money(item.total_cents)}</strong></div>)}</div><div className="proposal-public-total"><span>Investimento total</span><strong>{money(proposal.total_cents)}</strong></div></article>
      <article className="proposal-public-card"><span className="proposal-section-number">03</span><h2>O que está incluído</h2><ul className="proposal-check-list">{parseArray(proposal.included_json).map((item) => <li key={item}>{item}</li>)}</ul><h3>Não incluído</h3><ul>{parseArray(proposal.excluded_json).map((item) => <li key={item}>{item}</li>)}</ul></article>
      <article className="proposal-public-card"><span className="proposal-section-number">04</span><h2>Prazo e revisões</h2><div className="proposal-public-facts"><div><span>Prazo estimado</span><strong>{proposal.estimated_deadline || "Conforme cronograma acordado"}</strong></div><div><span>Rodadas incluídas</span><strong>{proposal.revisions_included}</strong></div></div><p>{proposal.revision_definition}</p></article>
      <article className="proposal-public-card"><span className="proposal-section-number">05</span><h2>Condições</h2><h3>Licença e uso</h3><p>{proposal.license_terms}</p><h3>Cancelamento</h3><p>{proposal.cancellation_terms}</p><small>Versão dos termos: {snapshot.termsVersion} · Integridade: {result.version?.contentHash.slice(0, 18)}…</small></article>
      <ProposalMediaSection token={token} result={result} />
    </section><aside><section className="proposal-public-card proposal-payment-card"><span className="proposal-section-number">PAGAMENTO</span><h2>Etapas</h2>{milestones.map((milestone) => <div className="proposal-payment-row" key={milestone.id}><div><strong>{milestone.label}</strong><small>{milestone.due_trigger}</small></div><strong>{money(milestone.amount_cents)}</strong></div>)}</section>
      <section className="proposal-public-card proposal-decision-card"><h2>Sua decisão</h2>{decision ? <DecisionResult decision={decision} checkoutUrl={checkoutUrl} retryPayment={retryPayment} loading={loading} error={error} cardFields={cardFields} paymentChoices={paymentChoices} /> : <><label><span>Nome completo</span><input value={signerName} onChange={(e) => setSignerName(e.target.value)} /></label><label><span>E-mail</span><input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} /></label>{paymentChoices}{cardFields}<label className="proposal-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Li e aceito integralmente esta proposta e seus termos. Estou ciente de que nome, e-mail, data, IP e versão serão registrados.</span></label>{error && <p className="workflow-alert workflow-alert-error">{error}</p>}<button className="proposal-accept-button" disabled={loading || quoteLoading} onClick={() => void submit("ACCEPTED")}>{loading ? "Registrando..." : "Aceitar proposta e continuar"}</button><button className="proposal-reject-toggle" type="button" onClick={() => setShowReject((value) => !value)}>Não desejo aprovar</button>{showReject && <div className="proposal-reject-box"><textarea placeholder="Motivo (opcional)" value={reason} onChange={(e) => setReason(e.target.value)} /><button type="button" disabled={loading} onClick={() => void submit("REJECTED")}>Registrar recusa</button></div>}</>}</section>
    </aside></div><footer className="proposal-public-footer"><strong>FIRMANT</strong><span>Comunicação, criação e tecnologia com processo claro.</span></footer>
  </div></main>;
}

function ProposalMediaSection({ token, result }: { token: string; result: PublicResult }) {
  const media = result.media ?? [];
  if (media.length) return <article className="proposal-public-card"><span className="proposal-section-number">06 · MÍDIAS</span><h2>Mídias aprovadas do projeto</h2><p>Conteúdos vinculados ao projeto {result.project?.project_number}.</p><div className="proposal-approved-media">{media.map((asset) => <section key={asset.id}><div className="proposal-approved-media-heading"><div><strong>{asset.title}</strong><small>{asset.assetType === "VIDEO" ? "Vídeo" : asset.assetType === "IMAGE" ? "Imagem" : "Carrossel"} · versão {asset.versionNumber}</small></div><span>Aprovado</span></div>{asset.assetType === "VIDEO" && <video src={`/api/proposals/${encodeURIComponent(token)}/media/${asset.id}`} controls controlsList="nodownload" preload="metadata" />}{asset.assetType === "IMAGE" && <img src={`/api/proposals/${encodeURIComponent(token)}/media/${asset.id}`} alt={asset.title} />}{asset.caption && <p>{asset.caption}</p>}</section>)}</div></article>;
  return <article className="proposal-public-card"><span className="proposal-section-number">06</span><h2>Como funciona a aprovação das mídias</h2><ol className="proposal-media-steps"><li><strong>Aceite da proposta</strong><span>O escopo e o investimento são formalizados neste link.</span></li><li><strong>Entrada fixa de 50%</strong><span>A produção só é liberada após a confirmação do pagamento.</span></li><li><strong>Produção das mídias</strong><span>A FIRMANT prepara imagens, carrosséis ou vídeos conforme o escopo aprovado.</span></li><li><strong>Revisão em portal privado</strong><span>Você receberá outro link seguro para comentar e aprovar cada versão.</span></li><li><strong>Entrega final</strong><span>Depois da aprovação, as mídias passam a aparecer também nesta proposta.</span></li></ol></article>;
}

function DecisionResult({ decision, checkoutUrl, retryPayment, loading, error, cardFields, paymentChoices }: { decision: string; checkoutUrl: string; retryPayment: () => Promise<void>; loading: boolean; error: string; cardFields: React.ReactNode; paymentChoices: React.ReactNode }) {
  if (decision === "REJECTED") return <div className="proposal-decision-result"><strong>Recusa registrada.</strong><p>A FIRMANT recebeu sua decisão.</p></div>;
  return <div className="proposal-decision-result"><strong>Proposta aceita.</strong><p>Escolha como deseja pagar a entrada:</p>{paymentChoices}{cardFields}{checkoutUrl ? <a href={checkoutUrl}>Continuar para o pagamento</a> : <button className="proposal-accept-button" disabled={loading} onClick={() => void retryPayment()}>{loading ? "Gerando..." : "Gerar cobrança segura"}</button>}{error && <p className="workflow-alert workflow-alert-error">{error}</p>}</div>;
}

function PaymentMethodChoices({ methods, value, onChange }: { methods: string[]; value: string; onChange: (method: string) => void }) {
  return <fieldset><legend>Forma de pagamento</legend>{methods.map((method) => <label className="proposal-payment-option" key={method}><input type="radio" name="payment" value={method} checked={value === method} onChange={() => onChange(method)} /><span>{paymentLabel(method)}</span></label>)}</fieldset>;
}

function CardPaymentFields({ installmentCount, setInstallmentCount, payerDocument, setPayerDocument, quote, loading, error }: { installmentCount: number; setInstallmentCount: (value: number) => void; payerDocument: string; setPayerDocument: (value: string) => void; quote: CardQuote | null; loading: boolean; error: string }) {
  return <div className="proposal-card-payment-fields"><label><span>CPF ou CNPJ do pagador</span><input inputMode="numeric" autoComplete="off" placeholder="Somente números" value={payerDocument} onChange={(event) => setPayerDocument(event.target.value)} /></label><label><span>Parcelamento</span><select value={installmentCount} onChange={(event) => setInstallmentCount(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}x</option>)}</select></label><div className="proposal-card-quote">{loading ? <span>Calculando valores...</span> : quote ? <><strong>{quote.installmentCount}x de {moneyValue(quote.installmentValue)}</strong><span>Total no cartão: {moneyValue(quote.totalValue)}</span><small>Taxas do cartão e antecipação automática já incluídas.</small></> : <span>{error || "Selecione o parcelamento."}</span>}</div></div>;
}
function parseArray(value?: string) { try { const parsed = JSON.parse(value ?? "[]"); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function moneyValue(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function date(value: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(value)) : "—"; }
function formatQuantity(value: number) { return Number.isInteger(value) ? String(value) : value.toLocaleString("pt-BR"); }
function paymentLabel(value: string) { return value === "PIX" ? "Pix" : value === "CREDIT_CARD" ? "Cartão de crédito" : "Boleto"; }
