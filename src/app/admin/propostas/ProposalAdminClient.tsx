"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ProposalRow = {
  id: string;
  proposal_number: string;
  project_name: string;
  client_name: string;
  client_email: string;
  status: string;
  total_cents: number;
  current_version: number;
  updated_at: string;
  deposit_status?: string | null;
  deposit_paid_at?: string | null;
  link_active?: number | null;
  link_expires_at?: string | null;
};

type Item = { id?: string; name: string; description: string; quantity: number; unit: string; unit_price_cents: number };
type Milestone = { id?: string; milestone_type: "FULL" | "DEPOSIT" | "PROGRESS" | "BALANCE" | "ADDITIONAL"; label: string; percentage_basis_points: number | null; amount_cents: number; due_trigger: string; status?: string; payment_method?: string | null; order_id?: string | null; checkout_url?: string | null; paid_at?: string | null };
type ProposalDetails = {
  proposal: ProposalRow & {
    summary: string; scope: string; included: string[]; excluded: string[];
    revisions_included: number; revision_definition: string; estimated_deadline: string | null;
    license_terms: string; cancellation_terms: string; paymentMethods: string[]; validity_days: number;
  };
  project: { id: string; project_number: string; status: string } | null;
  items: Item[];
  milestones: Milestone[];
  accessLink: {
    id: string;
    proposal_version_id: string;
    version_number: number;
    active: boolean;
    expires_at: string;
    expired: boolean;
    first_viewed_at: string | null;
    last_viewed_at: string | null;
    view_count: number;
    created_at: string;
    revoked_at: string | null;
    public_url: string | null;
  } | null;
  versions: Array<{ id: string; version_number: number; content_hash: string; created_at: string }>;
};

const nav = [
  ["/admin/aprovacao-geral", "Aprovação Geral"], ["/admin/propostas", "Propostas"],
  ["/admin/conteudos", "Conteúdos"], ["/admin/clientes", "Clientes"],
  ["/admin/pedidos", "Pedidos"], ["/admin/contratos", "Contratos"],
  ["/admin/newsletter", "Newsletter"], ["/admin/blog", "Blog"],
];

export function ProposalAdminClient({ mode, id, briefingId }: { mode: "list" | "editor"; id?: string; briefingId?: string }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<ProposalRow[]>([]);
  const [details, setDetails] = useState<ProposalDetails | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [milestoneUrls, setMilestoneUrls] = useState<Record<string, string>>({});
  const [createAttempted, setCreateAttempted] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [requestedBriefingId, setRequestedBriefingId] = useState(briefingId ?? "");
  const activeProposalId = mode === "editor" ? id : selectedProposalId ?? undefined;

  const load = useCallback(async (
    silentUnauthorized = false,
    filters: { q?: string; status?: string } = {},
    proposalId?: string,
  ) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      const targetId = proposalId ?? (mode === "editor" ? id : undefined);
      const endpoint = targetId ? `/api/admin/proposals/${targetId}` : `/api/admin/proposals${params.size ? `?${params}` : ""}`;
      const response = await fetch(endpoint, { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) {
        if (silentUnauthorized && response.status === 401) return;
        throw new Error(data.error ?? "Falha ao carregar propostas.");
      }
      if (targetId) setDetails(data);
      else setRows(data.proposals ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao carregar propostas.");
    } finally { setLoading(false); }
  }, [id, mode]);

  useEffect(() => {
    setUser(window.localStorage.getItem("firmant-admin-user") ?? "");
    const query = new URLSearchParams(window.location.search);
    if (mode === "list" && !briefingId) {
      setRequestedBriefingId(query.get("briefingId") ?? "");
    }
    const proposalId = mode === "list" ? query.get("proposalId") : null;
    if (proposalId) {
      setSelectedProposalId(proposalId);
      void load(true, {}, proposalId);
    } else {
      void load(true);
    }
  }, [briefingId, load, mode]);

  useEffect(() => {
    if (!requestedBriefingId || mode !== "list" || createAttempted) return;
    setCreateAttempted(true);
    void (async () => {
      setLoading(true); setError("");
      try {
        const response = await fetch("/api/admin/proposals", {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "same-origin", body: JSON.stringify({ briefingId: requestedBriefingId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Falha ao criar proposta.");
        setDetails(data);
        setSelectedProposalId(data.proposal.id);
        window.history.replaceState(null, "", "/admin/propostas");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Falha ao criar proposta.");
        setLoading(false);
      }
    })();
  }, [createAttempted, mode, requestedBriefingId]);

  async function login() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ user, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao iniciar sessão.");
      window.localStorage.setItem("firmant-admin-user", user); setPassword(""); setMessage("Sessão iniciada."); await load(false, { q, status }, activeProposalId);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao iniciar sessão."); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!details || !activeProposalId) return false;
    setLoading(true); setError(""); setMessage("");
    try {
      const p = details.proposal;
      const response = await fetch(`/api/admin/proposals/${activeProposalId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({
          projectName: p.project_name, clientName: p.client_name, clientEmail: p.client_email,
          summary: p.summary, scope: p.scope, included: p.included, excluded: p.excluded,
          revisionsIncluded: p.revisions_included, revisionDefinition: p.revision_definition,
          estimatedDeadline: p.estimated_deadline || undefined, licenseTerms: p.license_terms,
          cancellationTerms: p.cancellation_terms, paymentMethods: p.paymentMethods,
          validityDays: p.validity_days,
          items: details.items.map((item) => ({ name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, unitPriceCents: item.unit_price_cents })),
          milestones: fixedPaymentMilestones(details.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price_cents), 0)),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao salvar proposta.");
      setDetails(data); setMessage("Proposta salva."); return true;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar proposta."); return false; }
    finally { setLoading(false); }
  }

  async function publish(sendEmail = false) {
    if (!activeProposalId) return;
    if (!await save()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${activeProposalId}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ sendEmail }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao publicar proposta.");
      setDetails(data.proposal); setMessage(data.emailSent ? "Versão publicada e enviada por e-mail." : data.emailError ? `Versão publicada, mas o e-mail falhou: ${data.emailError}` : "Versão publicada. O link está disponível no painel de acesso do cliente.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar proposta."); }
    finally { setLoading(false); }
  }

  async function startRevision() {
    if (!activeProposalId || !window.confirm("Iniciar uma nova versão e invalidar o link atual?")) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${activeProposalId}/revision`, { method: "POST", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao iniciar nova versão.");
      setDetails(data); setMessage("Nova versão em rascunho iniciada.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao iniciar nova versão."); }
    finally { setLoading(false); }
  }

  async function createMilestoneCheckout(milestone: Milestone) {
    if (!activeProposalId || !milestone.id || !details) return;
    const paymentMethod = milestone.payment_method || details.proposal.paymentMethods[0];
    if (!paymentMethod) { setError("Defina uma forma de pagamento na proposta."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${activeProposalId}/milestones/${milestone.id}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ paymentMethod }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar cobrança.");
      setMilestoneUrls((current) => ({ ...current, [milestone.id as string]: data.checkoutUrl }));
      setMessage(data.reused ? "Link de pagamento existente recuperado." : "Nova cobrança Asaas criada.");
      await load(false, { q, status });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao gerar cobrança."); }
    finally { setLoading(false); }
  }

  async function setAccessLinkActive(active: boolean) {
    if (!activeProposalId || !details?.accessLink) return;
    const action = active ? "reativar" : "invalidar";
    const warning = active
      ? "Reativar este link permitirá que o cliente volte a acessar esta proposta. Continuar?"
      : "Invalidar este link bloqueará imediatamente o acesso do cliente. O aceite e os pagamentos já registrados não serão apagados. Continuar?";
    if (!window.confirm(warning)) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/proposals/${activeProposalId}/links/${details.accessLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Falha ao ${action} o link.`);
      setDetails(data);
      setMessage(active ? "Link do cliente reativado." : "Link do cliente invalidado imediatamente.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Falha ao ${action} o link.`);
    } finally { setLoading(false); }
  }

  async function rotateAccessLink() {
    if (!activeProposalId || !details?.accessLink) return;
    if (!window.confirm("Gerar um novo link invalidará imediatamente o link anterior. O cliente precisará receber o novo endereço. Continuar?")) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/proposals/${activeProposalId}/links`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar um novo link seguro.");
      setDetails(data.proposal);
      setMessage("Novo link seguro gerado. O link anterior foi invalidado.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao gerar um novo link seguro.");
    } finally { setLoading(false); }
  }

  function updateProposal(patch: Partial<ProposalDetails["proposal"]>) { setDetails((value) => value ? { ...value, proposal: { ...value.proposal, ...patch } } : value); }
  function updateItem(index: number, patch: Partial<Item>) { setDetails((value) => value ? { ...value, items: value.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : value); }
  async function openProposal(proposalId: string) {
    await load(false, {}, proposalId);
    setSelectedProposalId(proposalId);
    window.history.replaceState(null, "", `/admin/propostas?proposalId=${encodeURIComponent(proposalId)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeProposal() {
    setSelectedProposalId(null);
    setDetails(null);
    setMilestoneUrls({});
    window.history.replaceState(null, "", "/admin/propostas");
  }
  return <section className="commercial-admin-page"><div className="commercial-admin-shell">
    <header className="commercial-admin-header"><div><span>Admin FIRMANT</span><h1>{mode === "editor" ? "Proposta comercial" : "Propostas"}</h1><p>Orçamentos versionados, aceite registrado e cobrança integrada ao Asaas.</p></div><form className="commercial-admin-login" onSubmit={(event) => { event.preventDefault(); void login(); }}><label>Usuário<input value={user} onChange={(event) => setUser(event.target.value)} /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button disabled={loading}>{loading ? "Carregando..." : "Entrar"}</button></form></header>
    <nav className="commercial-admin-nav">{nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    {error && <div className="commercial-admin-alert commercial-admin-alert-error">{error}</div>}{message && <div className="commercial-admin-alert commercial-admin-alert-success">{message}</div>}
    {mode === "list" && selectedProposalId && details ? <><div className="commercial-admin-actions commercial-admin-actions-block"><button type="button" onClick={closeProposal}>Voltar para propostas</button></div><ProposalEditor details={details} updateProposal={updateProposal} updateItem={updateItem} setDetails={setDetails} save={save} publish={publish} startRevision={startRevision} createMilestoneCheckout={createMilestoneCheckout} setAccessLinkActive={setAccessLinkActive} rotateAccessLink={rotateAccessLink} milestoneUrls={milestoneUrls} loading={loading} setMessage={setMessage} /></> : mode === "list" ? <><div className="commercial-admin-filters workflow-admin-filters"><input placeholder="Buscar proposta, projeto ou cliente" value={q} onChange={(event) => setQ(event.target.value)} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"].map((value) => <option key={value}>{proposalStatusLabel(value)}</option>)}</select><button type="button" onClick={() => void load(false, { q, status })}>Filtrar</button></div><ProposalTable rows={rows} onOpen={openProposal} loading={loading} /></> : details ? <ProposalEditor details={details} updateProposal={updateProposal} updateItem={updateItem} setDetails={setDetails} save={save} publish={publish} startRevision={startRevision} createMilestoneCheckout={createMilestoneCheckout} setAccessLinkActive={setAccessLinkActive} rotateAccessLink={rotateAccessLink} milestoneUrls={milestoneUrls} loading={loading} setMessage={setMessage} /> : <section className="commercial-admin-card"><p>Entre no Admin para consultar a proposta.</p></section>}
  </div></section>;
}

function ProposalTable({ rows, onOpen, loading }: { rows: ProposalRow[]; onOpen: (id: string) => Promise<void>; loading: boolean }) {
  return <section className="commercial-admin-card"><h2>Propostas comerciais</h2><div className="commercial-admin-table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Projeto</th><th>Valor</th><th>Proposta</th><th>Link do cliente</th><th>Entrada de 50%</th><th>Versão</th><th>Ação</th></tr></thead><tbody>{rows.map((row) => { const payment = paymentStatusInfo(row.deposit_status); const access = accessLinkStatus(row.link_active, row.link_expires_at); return <tr key={row.id}><td>{row.proposal_number}</td><td><strong>{row.client_name}</strong><br /><small>{row.client_email}</small></td><td>{row.project_name}</td><td>{money(row.total_cents)}</td><td><span className={`workflow-status workflow-status-${row.status.toLowerCase()}`}>{proposalStatusLabel(row.status)}</span></td><td><span className={`payment-status payment-status-${access.tone}`}>{access.label}</span></td><td><span className={`payment-status payment-status-${payment.tone}`}>{row.status === "ACCEPTED" ? payment.label : "Ainda não exigida"}</span></td><td>v{row.current_version || "rascunho"}</td><td><div className="commercial-admin-actions"><button type="button" disabled={loading} onClick={() => void onOpen(row.id)}>Abrir</button></div></td></tr>; })}{!rows.length && <tr><td colSpan={9}>Nenhuma proposta encontrada.</td></tr>}</tbody></table></div></section>;
}

function ProposalEditor(props: { details: ProposalDetails; updateProposal: (patch: Partial<ProposalDetails["proposal"]>) => void; updateItem: (index: number, patch: Partial<Item>) => void; setDetails: React.Dispatch<React.SetStateAction<ProposalDetails | null>>; save: () => Promise<boolean>; publish: (sendEmail?: boolean) => Promise<void>; startRevision: () => Promise<void>; createMilestoneCheckout: (milestone: Milestone) => Promise<void>; setAccessLinkActive: (active: boolean) => Promise<void>; rotateAccessLink: () => Promise<void>; milestoneUrls: Record<string, string>; loading: boolean; setMessage: (value: string) => void }) {
  const { details, updateProposal, updateItem, setDetails } = props;
  const p = details.proposal; const editable = p.status === "DRAFT";
  const totalCents = details.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price_cents), 0);
  const deposit = details.milestones.find((item) => item.milestone_type === "DEPOSIT") ?? details.milestones[0];
  const payment = paymentStatusInfo(deposit?.status);
  const addItem = () => setDetails((value) => value ? { ...value, items: [...value.items, { name: "", description: "", quantity: 1, unit: "serviço", unit_price_cents: 0 }] } : value);
  return <div className="proposal-editor-grid"><section className="commercial-admin-card proposal-editor-main"><div className="proposal-editor-title"><div><span>{p.proposal_number}</span><h2>{p.project_name}</h2></div><span className={`workflow-status workflow-status-${p.status.toLowerCase()}`}>{proposalStatusLabel(p.status)}</span></div><fieldset disabled={!editable || props.loading}>
    <div className="workflow-field-grid"><label className="workflow-field"><span>Projeto</span><input value={p.project_name} onChange={(e) => updateProposal({ project_name: e.target.value })} /></label><label className="workflow-field"><span>Cliente</span><input value={p.client_name} onChange={(e) => updateProposal({ client_name: e.target.value })} /></label><label className="workflow-field"><span>E-mail</span><input type="email" value={p.client_email} onChange={(e) => updateProposal({ client_email: e.target.value })} /></label><label className="workflow-field"><span>Validade (dias)</span><input type="number" min="1" value={p.validity_days} onChange={(e) => updateProposal({ validity_days: Number(e.target.value) })} /></label><label className="workflow-field workflow-field-wide"><span>Resumo executivo</span><textarea value={p.summary} onChange={(e) => updateProposal({ summary: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Escopo</span><textarea rows={6} value={p.scope} onChange={(e) => updateProposal({ scope: e.target.value })} /></label></div>
    <h3>Itens e investimento</h3>{details.items.map((item, index) => <div className="proposal-line-item" key={item.id ?? index}><input placeholder="Item" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} /><input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} /><input aria-label="Quantidade" type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} /><input aria-label="Unidade" value={item.unit} onChange={(e) => updateItem(index, { unit: e.target.value })} /><input aria-label="Valor unitário" type="number" min="0" step="0.01" value={(item.unit_price_cents / 100).toFixed(2)} onChange={(e) => updateItem(index, { unit_price_cents: Math.round(Number(e.target.value) * 100) })} /><button type="button" onClick={() => setDetails((value) => value ? { ...value, items: value.items.filter((_, i) => i !== index) } : value)}>Remover</button></div>)}<button type="button" onClick={addItem}>Adicionar item</button>
    <div className="workflow-field-grid proposal-terms-grid"><label className="workflow-field"><span>Incluído (uma linha por item)</span><textarea rows={7} value={p.included.join("\n")} onChange={(e) => updateProposal({ included: e.target.value.split("\n") })} /></label><label className="workflow-field"><span>Não incluído</span><textarea rows={7} value={p.excluded.join("\n")} onChange={(e) => updateProposal({ excluded: e.target.value.split("\n") })} /></label><label className="workflow-field"><span>Revisões incluídas</span><input type="number" min="0" value={p.revisions_included} onChange={(e) => updateProposal({ revisions_included: Number(e.target.value) })} /></label><label className="workflow-field"><span>Prazo estimado</span><input value={p.estimated_deadline ?? ""} onChange={(e) => updateProposal({ estimated_deadline: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Definição de revisão</span><textarea value={p.revision_definition} onChange={(e) => updateProposal({ revision_definition: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Licença e uso</span><textarea value={p.license_terms} onChange={(e) => updateProposal({ license_terms: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Cancelamento</span><textarea value={p.cancellation_terms} onChange={(e) => updateProposal({ cancellation_terms: e.target.value })} /></label></div>
    <fieldset className="workflow-options"><legend>Formas de pagamento</legend><div>{[["PIX", "Pix"], ["CREDIT_CARD", "Cartão"], ["BOLETO", "Boleto"]].map(([value, label]) => <label key={value}><input type="checkbox" checked={p.paymentMethods.includes(value)} onChange={(e) => updateProposal({ paymentMethods: e.target.checked ? [...p.paymentMethods, value] : p.paymentMethods.filter((item) => item !== value) })} /><span>{label}</span></label>)}</div></fieldset>
    <section className="proposal-payment-plan"><div><span>Regra fixa de pagamento</span><h3>50% para começar + 50% antes da entrega final</h3><p>Os valores são calculados automaticamente sobre o total da proposta e não podem ser alterados.</p></div><div className="proposal-payment-plan-steps"><article><span>1 · ENTRADA FIXA</span><strong>{money(Math.floor(totalCents / 2))}</strong><p>50% após o aceite. Somente a compensação desta entrada libera o início do trabalho.</p></article><article><span>2 · SALDO FINAL</span><strong>{money(totalCents - Math.floor(totalCents / 2))}</strong><p>50% após a aprovação e antes da entrega dos arquivos finais.</p></article></div></section>
  </fieldset></section><aside className="commercial-admin-card proposal-editor-sidebar"><h2>Resumo</h2><strong className="proposal-total">{money(totalCents)}</strong><p>{details.items.length} item(ns) · pagamento fixo em 2 etapas</p><section className="proposal-payment-summary"><span>STATUS DA PROPOSTA</span><strong>{proposalStatusLabel(p.status)}</strong><span>STATUS DA ENTRADA (50%)</span><strong className={`payment-status payment-status-${payment.tone}`}>{p.status === "ACCEPTED" ? payment.label : "Aguardando aceite"}</strong><p>{deposit?.paid_at ? `Pagamento registrado em ${new Date(deposit.paid_at).toLocaleDateString("pt-BR")}.` : p.status === "ACCEPTED" ? "Produção bloqueada até a confirmação do pagamento da entrada." : "A entrada será cobrada após o aceite do cliente."}</p></section><ProposalAccessLinkControl link={details.accessLink} loading={props.loading} onChange={props.setAccessLinkActive} onRotate={props.rotateAccessLink} setMessage={props.setMessage} />{editable ? <div className="workflow-form-actions"><button type="button" onClick={() => void props.save()} disabled={props.loading}>Salvar rascunho</button><button className="workflow-primary-action" type="button" onClick={() => void props.publish()} disabled={props.loading}>Publicar versão</button><button type="button" onClick={() => void props.publish(true)} disabled={props.loading}>Publicar e enviar por e-mail</button></div> : <><p>Esta versão está protegida contra sobrescrita.</p><div className="commercial-admin-actions commercial-admin-actions-block"><a href={`/api/admin/proposals/${p.id}/pdf`} target="_blank" rel="noreferrer">Abrir PDF</a>{["SENT", "VIEWED", "REJECTED", "EXPIRED"].includes(p.status) && <button type="button" onClick={() => void props.startRevision()}>Iniciar nova versão</button>}</div></>}{p.status === "ACCEPTED" && <><h3>Cobranças por etapa</h3>{details.milestones.map((milestone, index) => { const url = milestone.checkout_url || (milestone.id ? props.milestoneUrls[milestone.id] : ""); const state = paymentStatusInfo(milestone.status); return <div className="proposal-admin-milestone" key={milestone.id}><span>{index === 0 ? "1ª etapa · 50%" : "2ª etapa · 50%"}</span><strong>{milestone.label}</strong><b>{money(milestone.amount_cents)}</b><span className={`payment-status payment-status-${state.tone}`}>{state.label}</span>{url ? <a href={url} target="_blank" rel="noreferrer">Abrir cobrança</a> : <button type="button" disabled={props.loading} onClick={() => void props.createMilestoneCheckout(milestone)}>Gerar cobrança no Asaas</button>}</div>; })}</>}<h3>Versões</h3>{details.versions.map((version) => <p key={version.id}>v{version.version_number} · {new Date(version.created_at).toLocaleDateString("pt-BR")}<br /><small>{version.content_hash.slice(0, 16)}…</small></p>)}</aside><ContentApprovalCard proposalStatus={p.status} project={details.project} depositStatus={deposit?.status} /></div>;
}

function ProposalAccessLinkControl({ link, loading, onChange, onRotate, setMessage }: { link: ProposalDetails["accessLink"]; loading: boolean; onChange: (active: boolean) => Promise<void>; onRotate: () => Promise<void>; setMessage: (value: string) => void }) {
  const status = accessLinkStatus(link ? Number(link.active) : null, link?.expires_at ?? null);
  return <section className="proposal-payment-summary proposal-access-link-control">
    <span>LINK INDIVIDUAL DO CLIENTE</span>
    <strong className={`payment-status payment-status-${status.tone}`}>{status.label}</strong>
    {!link ? <p>O link será criado quando a primeira versão for publicada.</p> : <>
      <p>Versão v{link.version_number} · válido até {new Date(link.expires_at).toLocaleDateString("pt-BR")}.</p>
      <p>{link.view_count ? `${link.view_count} acesso(s). Último acesso em ${link.last_viewed_at ? new Date(link.last_viewed_at).toLocaleString("pt-BR") : "não registrado"}.` : "O cliente ainda não acessou este link."}</p>
      {link.public_url ? <div className="workflow-generated-link proposal-public-link">
        <input aria-label="Link da proposta enviado ao cliente" readOnly value={link.public_url} />
        <button type="button" disabled={loading || !link.active || link.expired} onClick={() => { void navigator.clipboard.writeText(link.public_url as string); setMessage("Link do cliente copiado."); }}>Copiar</button>
        <a href={link.public_url} target="_blank" rel="noreferrer">Abrir</a>
      </div> : <div className="proposal-production-blocked">
        <strong>Link anterior não recuperável</strong>
        <p>Este link foi criado antes do armazenamento criptografado. Gere um novo endereço para poder visualizar, copiar e reenviar.</p>
        <button type="button" disabled={loading || link.expired} onClick={() => void onRotate()}>Gerar novo link seguro</button>
      </div>}
      <div className="commercial-admin-actions commercial-admin-actions-block">
        {link.active && !link.expired
          ? <button type="button" disabled={loading} onClick={() => void onChange(false)}>Invalidar link</button>
          : <button type="button" disabled={loading || link.expired} onClick={() => void onChange(true)}>{link.expired ? "Link expirado" : "Reativar link"}</button>}
        {link.public_url && <button type="button" disabled={loading || link.expired} onClick={() => void onRotate()}>Substituir link</button>}
      </div>
      <small>Invalidar bloqueia o acesso imediatamente sem apagar aceite, auditoria ou pagamento.</small>
    </>}
  </section>;
}

function ContentApprovalCard({ proposalStatus, project, depositStatus }: { proposalStatus: string; project: ProposalDetails["project"]; depositStatus?: string }) {
  const productionReleased = depositStatus === "PAID";
  return <section className="commercial-admin-card proposal-content-workflow">
    <div className="proposal-content-workflow-header">
      <div><span>Produção</span><h2>Mídias e aprovação do cliente</h2></div>
      <span className={`payment-status payment-status-${productionReleased ? "paid" : "pending"}`}>{productionReleased ? "PRODUÇÃO LIBERADA" : proposalStatus === "ACCEPTED" ? "AGUARDANDO ENTRADA DE 50%" : "AGUARDANDO ACEITE"}</span>
    </div>
    {project ? <>
      {productionReleased ? <><p>A entrada de 50% foi confirmada. O projeto <strong>{project.project_number}</strong> está liberado para produção e envio de mídias.</p><div className="commercial-admin-actions commercial-admin-actions-block"><Link className="workflow-primary-action" href={`/admin/conteudos/${project.id}`}>Enviar mídias e gerar link do cliente</Link><Link href="/admin/conteudos">Ver todos os projetos</Link></div></> : <div className="proposal-production-blocked"><strong>Não iniciar o trabalho ainda</strong><p>O cliente aceitou a proposta, mas a entrada fixa de 50% ainda não foi confirmada. O acesso operacional será liberado automaticamente após a compensação do pagamento.</p></div>}
    </> : <>
      <p>Os arquivos de produção não são anexados ao orçamento. Eles ficam no Portal de Conteúdo, protegidos e ligados ao aceite desta proposta.</p>
      <ol className="proposal-content-steps">
        <li className={proposalStatus !== "DRAFT" ? "is-complete" : ""}><strong>1. Publicar a proposta</strong><span>Gera o link comercial para o cliente.</span></li>
        <li className={proposalStatus === "ACCEPTED" ? "is-complete" : ""}><strong>2. Cliente aceitar</strong><span>O aceite cria o projeto automaticamente.</span></li>
        <li><strong>3. Enviar as mídias</strong><span>Imagem, carrossel ou vídeo MP4.</span></li>
        <li><strong>4. Gerar o link de revisão</strong><span>Este é o link privado enviado ao cliente.</span></li>
      </ol>
      <p className="proposal-content-note">Esta proposta está em <strong>{proposalStatus}</strong>. O upload será liberado aqui assim que o aceite for registrado.</p>
    </>}
  </section>;
}

function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }

function fixedPaymentMilestones(totalCents: number) {
  const depositCents = Math.floor(totalCents / 2);
  return [
    { type: "DEPOSIT", label: "Entrada de 50% para iniciar o projeto", percentageBasisPoints: 5000, amountCents: depositCents, dueTrigger: "Após o aceite da proposta" },
    { type: "BALANCE", label: "Saldo final de 50%", percentageBasisPoints: 5000, amountCents: totalCents - depositCents, dueTrigger: "Após a aprovação, antes da entrega final" },
  ];
}

function proposalStatusLabel(status: string) {
  return ({ DRAFT: "Rascunho", SENT: "Enviada", VIEWED: "Visualizada", ACCEPTED: "Proposta aceita", REJECTED: "Recusada", EXPIRED: "Expirada" } as Record<string, string>)[status] ?? status;
}

function paymentStatusInfo(status?: string | null) {
  if (status === "PAID") return { label: "Pagamento recebido", tone: "paid" };
  if (status === "OVERDUE") return { label: "Pagamento vencido", tone: "danger" };
  if (status === "CANCELED" || status === "REFUNDED" || status === "FAILED") return { label: "Pagamento não concluído", tone: "danger" };
  if (status === "CHECKOUT_CREATED" || status === "AWAITING_PAYMENT") return { label: "Aguardando pagamento", tone: "pending" };
  return { label: "Cobrança ainda não gerada", tone: "neutral" };
}

function accessLinkStatus(active?: number | null, expiresAt?: string | null) {
  if (!expiresAt) return { label: "Não publicado", tone: "neutral" };
  if (new Date(expiresAt).getTime() < Date.now()) return { label: "Expirado", tone: "danger" };
  if (active === 1) return { label: "Ativo", tone: "paid" };
  return { label: "Inativo", tone: "danger" };
}
