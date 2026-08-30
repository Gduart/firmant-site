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
};

type Item = { id?: string; name: string; description: string; quantity: number; unit: string; unit_price_cents: number };
type Milestone = { id?: string; milestone_type: "FULL" | "DEPOSIT" | "PROGRESS" | "BALANCE" | "ADDITIONAL"; label: string; percentage_basis_points: number | null; amount_cents: number; due_trigger: string; status?: string; payment_method?: string | null; order_id?: string | null; checkout_url?: string | null };
type ProposalDetails = {
  proposal: ProposalRow & {
    summary: string; scope: string; included: string[]; excluded: string[];
    revisions_included: number; revision_definition: string; estimated_deadline: string | null;
    license_terms: string; cancellation_terms: string; paymentMethods: string[]; validity_days: number;
  };
  items: Item[];
  milestones: Milestone[];
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
  const [publicUrl, setPublicUrl] = useState("");
  const [milestoneUrls, setMilestoneUrls] = useState<Record<string, string>>({});
  const [createAttempted, setCreateAttempted] = useState(false);

  const load = useCallback(async (silentUnauthorized = false) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const endpoint = mode === "editor" ? `/api/admin/proposals/${id}` : `/api/admin/proposals${params.size ? `?${params}` : ""}`;
      const response = await fetch(endpoint, { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) {
        if (silentUnauthorized && response.status === 401) return;
        throw new Error(data.error ?? "Falha ao carregar propostas.");
      }
      if (mode === "editor") setDetails(data);
      else setRows(data.proposals ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao carregar propostas.");
    } finally { setLoading(false); }
  }, [id, mode, q, status]);

  useEffect(() => {
    setUser(window.localStorage.getItem("firmant-admin-user") ?? "");
    void load(true);
  }, [load]);

  useEffect(() => {
    if (!briefingId || mode !== "list" || createAttempted) return;
    setCreateAttempted(true);
    void (async () => {
      setLoading(true); setError("");
      try {
        const response = await fetch("/api/admin/proposals", {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "same-origin", body: JSON.stringify({ briefingId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Falha ao criar proposta.");
        window.location.assign(`/admin/propostas/${data.proposal.id}`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Falha ao criar proposta.");
        setLoading(false);
      }
    })();
  }, [briefingId, createAttempted, mode]);

  async function login() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ user, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao iniciar sessão.");
      window.localStorage.setItem("firmant-admin-user", user); setPassword(""); setMessage("Sessão iniciada."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao iniciar sessão."); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!details || !id) return false;
    setLoading(true); setError(""); setMessage("");
    try {
      const p = details.proposal;
      const response = await fetch(`/api/admin/proposals/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({
          projectName: p.project_name, clientName: p.client_name, clientEmail: p.client_email,
          summary: p.summary, scope: p.scope, included: p.included, excluded: p.excluded,
          revisionsIncluded: p.revisions_included, revisionDefinition: p.revision_definition,
          estimatedDeadline: p.estimated_deadline || undefined, licenseTerms: p.license_terms,
          cancellationTerms: p.cancellation_terms, paymentMethods: p.paymentMethods,
          validityDays: p.validity_days,
          items: details.items.map((item) => ({ name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, unitPriceCents: item.unit_price_cents })),
          milestones: details.milestones.map((item) => ({ type: item.milestone_type, label: item.label, percentageBasisPoints: item.percentage_basis_points, amountCents: item.amount_cents, dueTrigger: item.due_trigger })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao salvar proposta.");
      setDetails(data); setMessage("Proposta salva."); return true;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar proposta."); return false; }
    finally { setLoading(false); }
  }

  async function publish(sendEmail = false) {
    if (!id) return;
    if (!await save()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ sendEmail }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao publicar proposta.");
      setDetails(data.proposal); setPublicUrl(data.publicUrl); setMessage(data.emailSent ? "Versão publicada e enviada por e-mail." : data.emailError ? `Versão publicada, mas o e-mail falhou: ${data.emailError}` : "Versão publicada. Copie o link exclusivo para o cliente.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar proposta."); }
    finally { setLoading(false); }
  }

  async function startRevision() {
    if (!id || !window.confirm("Iniciar uma nova versão e invalidar o link atual?")) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${id}/revision`, { method: "POST", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao iniciar nova versão.");
      setDetails(data); setPublicUrl(""); setMessage("Nova versão em rascunho iniciada.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao iniciar nova versão."); }
    finally { setLoading(false); }
  }

  async function createMilestoneCheckout(milestone: Milestone) {
    if (!id || !milestone.id || !details) return;
    const paymentMethod = milestone.payment_method || details.proposal.paymentMethods[0];
    if (!paymentMethod) { setError("Defina uma forma de pagamento na proposta."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/proposals/${id}/milestones/${milestone.id}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ paymentMethod }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar cobrança.");
      setMilestoneUrls((current) => ({ ...current, [milestone.id as string]: data.checkoutUrl }));
      setMessage(data.reused ? "Link de pagamento existente recuperado." : "Nova cobrança Asaas criada.");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao gerar cobrança."); }
    finally { setLoading(false); }
  }

  function updateProposal(patch: Partial<ProposalDetails["proposal"]>) { setDetails((value) => value ? { ...value, proposal: { ...value.proposal, ...patch } } : value); }
  function updateItem(index: number, patch: Partial<Item>) { setDetails((value) => value ? { ...value, items: value.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : value); }
  function updateMilestone(index: number, patch: Partial<Milestone>) { setDetails((value) => value ? { ...value, milestones: value.milestones.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : value); }

  return <section className="commercial-admin-page"><div className="commercial-admin-shell">
    <header className="commercial-admin-header"><div><span>Admin FIRMANT</span><h1>{mode === "editor" ? "Proposta comercial" : "Propostas"}</h1><p>Orçamentos versionados, aceite registrado e cobrança integrada ao Asaas.</p></div><form className="commercial-admin-login" onSubmit={(event) => { event.preventDefault(); void login(); }}><label>Usuário<input value={user} onChange={(event) => setUser(event.target.value)} /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button disabled={loading}>{loading ? "Carregando..." : "Entrar"}</button></form></header>
    <nav className="commercial-admin-nav">{nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    {error && <div className="commercial-admin-alert commercial-admin-alert-error">{error}</div>}{message && <div className="commercial-admin-alert commercial-admin-alert-success">{message}</div>}
    {mode === "list" ? <><div className="commercial-admin-filters workflow-admin-filters"><input placeholder="Buscar proposta, projeto ou cliente" value={q} onChange={(event) => setQ(event.target.value)} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"].map((value) => <option key={value}>{value}</option>)}</select><button type="button" onClick={() => void load()}>Filtrar</button></div><ProposalTable rows={rows} /></> : details ? <ProposalEditor details={details} updateProposal={updateProposal} updateItem={updateItem} updateMilestone={updateMilestone} setDetails={setDetails} save={save} publish={publish} startRevision={startRevision} createMilestoneCheckout={createMilestoneCheckout} milestoneUrls={milestoneUrls} loading={loading} publicUrl={publicUrl} setMessage={setMessage} /> : <section className="commercial-admin-card"><p>Entre no Admin para consultar a proposta.</p></section>}
  </div></section>;
}

function ProposalTable({ rows }: { rows: ProposalRow[] }) {
  return <section className="commercial-admin-card"><h2>Propostas comerciais</h2><div className="commercial-admin-table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Projeto</th><th>Valor</th><th>Status</th><th>Versão</th><th>Ação</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.proposal_number}</td><td><strong>{row.client_name}</strong><br /><small>{row.client_email}</small></td><td>{row.project_name}</td><td>{money(row.total_cents)}</td><td><span className={`workflow-status workflow-status-${row.status.toLowerCase()}`}>{row.status}</span></td><td>v{row.current_version || "rascunho"}</td><td><div className="commercial-admin-actions"><Link href={`/admin/propostas/${row.id}`}>Abrir</Link></div></td></tr>)}{!rows.length && <tr><td colSpan={7}>Nenhuma proposta encontrada.</td></tr>}</tbody></table></div></section>;
}

function ProposalEditor(props: { details: ProposalDetails; updateProposal: (patch: Partial<ProposalDetails["proposal"]>) => void; updateItem: (index: number, patch: Partial<Item>) => void; updateMilestone: (index: number, patch: Partial<Milestone>) => void; setDetails: React.Dispatch<React.SetStateAction<ProposalDetails | null>>; save: () => Promise<boolean>; publish: (sendEmail?: boolean) => Promise<void>; startRevision: () => Promise<void>; createMilestoneCheckout: (milestone: Milestone) => Promise<void>; milestoneUrls: Record<string, string>; loading: boolean; publicUrl: string; setMessage: (value: string) => void }) {
  const { details, updateProposal, updateItem, updateMilestone, setDetails } = props;
  const p = details.proposal; const editable = p.status === "DRAFT";
  const addItem = () => setDetails((value) => value ? { ...value, items: [...value.items, { name: "", description: "", quantity: 1, unit: "serviço", unit_price_cents: 0 }] } : value);
  const addMilestone = () => setDetails((value) => value ? { ...value, milestones: [...value.milestones, { milestone_type: "ADDITIONAL", label: "Nova etapa", percentage_basis_points: null, amount_cents: 0, due_trigger: "" }] } : value);
  return <div className="proposal-editor-grid"><section className="commercial-admin-card proposal-editor-main"><div className="proposal-editor-title"><div><span>{p.proposal_number}</span><h2>{p.project_name}</h2></div><span className={`workflow-status workflow-status-${p.status.toLowerCase()}`}>{p.status}</span></div><fieldset disabled={!editable || props.loading}>
    <div className="workflow-field-grid"><label className="workflow-field"><span>Projeto</span><input value={p.project_name} onChange={(e) => updateProposal({ project_name: e.target.value })} /></label><label className="workflow-field"><span>Cliente</span><input value={p.client_name} onChange={(e) => updateProposal({ client_name: e.target.value })} /></label><label className="workflow-field"><span>E-mail</span><input type="email" value={p.client_email} onChange={(e) => updateProposal({ client_email: e.target.value })} /></label><label className="workflow-field"><span>Validade (dias)</span><input type="number" min="1" value={p.validity_days} onChange={(e) => updateProposal({ validity_days: Number(e.target.value) })} /></label><label className="workflow-field workflow-field-wide"><span>Resumo executivo</span><textarea value={p.summary} onChange={(e) => updateProposal({ summary: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Escopo</span><textarea rows={6} value={p.scope} onChange={(e) => updateProposal({ scope: e.target.value })} /></label></div>
    <h3>Itens e investimento</h3>{details.items.map((item, index) => <div className="proposal-line-item" key={item.id ?? index}><input placeholder="Item" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} /><input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} /><input aria-label="Quantidade" type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} /><input aria-label="Unidade" value={item.unit} onChange={(e) => updateItem(index, { unit: e.target.value })} /><input aria-label="Valor unitário" type="number" min="0" step="0.01" value={(item.unit_price_cents / 100).toFixed(2)} onChange={(e) => updateItem(index, { unit_price_cents: Math.round(Number(e.target.value) * 100) })} /><button type="button" onClick={() => setDetails((value) => value ? { ...value, items: value.items.filter((_, i) => i !== index) } : value)}>Remover</button></div>)}<button type="button" onClick={addItem}>Adicionar item</button>
    <div className="workflow-field-grid proposal-terms-grid"><label className="workflow-field"><span>Incluído (uma linha por item)</span><textarea rows={7} value={p.included.join("\n")} onChange={(e) => updateProposal({ included: e.target.value.split("\n") })} /></label><label className="workflow-field"><span>Não incluído</span><textarea rows={7} value={p.excluded.join("\n")} onChange={(e) => updateProposal({ excluded: e.target.value.split("\n") })} /></label><label className="workflow-field"><span>Revisões incluídas</span><input type="number" min="0" value={p.revisions_included} onChange={(e) => updateProposal({ revisions_included: Number(e.target.value) })} /></label><label className="workflow-field"><span>Prazo estimado</span><input value={p.estimated_deadline ?? ""} onChange={(e) => updateProposal({ estimated_deadline: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Definição de revisão</span><textarea value={p.revision_definition} onChange={(e) => updateProposal({ revision_definition: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Licença e uso</span><textarea value={p.license_terms} onChange={(e) => updateProposal({ license_terms: e.target.value })} /></label><label className="workflow-field workflow-field-wide"><span>Cancelamento</span><textarea value={p.cancellation_terms} onChange={(e) => updateProposal({ cancellation_terms: e.target.value })} /></label></div>
    <fieldset className="workflow-options"><legend>Formas de pagamento</legend><div>{[["PIX", "Pix"], ["CREDIT_CARD", "Cartão"], ["BOLETO", "Boleto"]].map(([value, label]) => <label key={value}><input type="checkbox" checked={p.paymentMethods.includes(value)} onChange={(e) => updateProposal({ paymentMethods: e.target.checked ? [...p.paymentMethods, value] : p.paymentMethods.filter((item) => item !== value) })} /><span>{label}</span></label>)}</div></fieldset>
    <h3>Etapas de pagamento</h3>{details.milestones.map((item, index) => <div className="proposal-milestone" key={item.id ?? index}><select value={item.milestone_type} onChange={(e) => updateMilestone(index, { milestone_type: e.target.value as Milestone["milestone_type"] })}>{["FULL", "DEPOSIT", "PROGRESS", "BALANCE", "ADDITIONAL"].map((value) => <option key={value}>{value}</option>)}</select><input value={item.label} onChange={(e) => updateMilestone(index, { label: e.target.value })} /><input aria-label="Valor da etapa" type="number" min="0" step="0.01" value={(item.amount_cents / 100).toFixed(2)} onChange={(e) => updateMilestone(index, { amount_cents: Math.round(Number(e.target.value) * 100) })} /><input placeholder="Quando vence" value={item.due_trigger} onChange={(e) => updateMilestone(index, { due_trigger: e.target.value })} /><button type="button" onClick={() => setDetails((value) => value ? { ...value, milestones: value.milestones.filter((_, i) => i !== index) } : value)}>Remover</button></div>)}<button type="button" onClick={addMilestone}>Adicionar etapa</button>
  </fieldset></section><aside className="commercial-admin-card proposal-editor-sidebar"><h2>Resumo</h2><strong className="proposal-total">{money(details.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price_cents), 0))}</strong><p>{details.items.length} item(ns) · {details.milestones.length} etapa(s)</p>{editable ? <div className="workflow-form-actions"><button type="button" onClick={() => void props.save()} disabled={props.loading}>Salvar rascunho</button><button className="workflow-primary-action" type="button" onClick={() => void props.publish()} disabled={props.loading}>Publicar versão</button><button type="button" onClick={() => void props.publish(true)} disabled={props.loading}>Publicar e enviar por e-mail</button></div> : <><p>Esta versão está protegida contra sobrescrita.</p><div className="commercial-admin-actions commercial-admin-actions-block"><a href={`/api/admin/proposals/${p.id}/pdf`} target="_blank" rel="noreferrer">Abrir PDF</a>{["SENT", "VIEWED", "REJECTED", "EXPIRED"].includes(p.status) && <button type="button" onClick={() => void props.startRevision()}>Iniciar nova versão</button>}</div></>}{props.publicUrl && <div className="workflow-generated-link proposal-public-link"><input readOnly value={props.publicUrl} /><button type="button" onClick={() => { void navigator.clipboard.writeText(props.publicUrl); props.setMessage("Link copiado."); }}>Copiar</button></div>}{p.status === "ACCEPTED" && <><h3>Cobranças por etapa</h3>{details.milestones.map((milestone) => { const url = milestone.checkout_url || (milestone.id ? props.milestoneUrls[milestone.id] : ""); return <div className="proposal-admin-milestone" key={milestone.id}><strong>{milestone.label}</strong><span>{money(milestone.amount_cents)} · {milestone.status ?? "PENDING"}</span>{url ? <a href={url} target="_blank" rel="noreferrer">Abrir cobrança</a> : <button type="button" disabled={props.loading} onClick={() => void props.createMilestoneCheckout(milestone)}>Gerar no Asaas</button>}</div>; })}</>}<h3>Versões</h3>{details.versions.map((version) => <p key={version.id}>v{version.version_number} · {new Date(version.created_at).toLocaleDateString("pt-BR")}<br /><small>{version.content_hash.slice(0, 16)}…</small></p>)}</aside></div>;
}

function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
