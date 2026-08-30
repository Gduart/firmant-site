"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminMode = "briefings" | "briefing";

type BriefingRow = {
  id: string;
  reference_number: string;
  status: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  project_name: string | null;
  brand_name: string | null;
  scope_description: string | null;
  submitted_at: string | null;
  created_at: string;
  attachments_count?: number;
  [key: string]: unknown;
};

type Attachment = {
  id: string;
  original_filename: string;
  size_bytes: number;
  expires_at: string;
};

const statusOptions = ["DRAFT", "SUBMITTED", "IN_REVIEW", "NEEDS_INFORMATION", "CONVERTED", "REJECTED", "ARCHIVED"];

export function WorkflowAdminClient({ mode, id }: { mode: AdminMode; id?: string }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [briefing, setBriefing] = useState<BriefingRow | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const endpoint = useMemo(() => {
    if (mode === "briefing") return `/api/admin/briefings/${id}`;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    return `/api/admin/briefings${params.size ? `?${params}` : ""}`;
  }, [id, mode, q, status]);

  const loadData = useCallback(async (silentUnauthorized = false) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok) {
        if (silentUnauthorized && response.status === 401) return;
        throw new Error(data.error ?? "Falha ao carregar dados.");
      }
      if (mode === "briefing") {
        setBriefing(data.briefing ?? null);
        setAttachments(data.attachments ?? []);
      } else {
        setBriefings(data.briefings ?? []);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, mode]);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("firmant-admin-user");
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    if (!sessionChecked) {
      setSessionChecked(true);
      void loadData(true);
    }
  }, [loadData, sessionChecked]);

  async function login() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ user, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao iniciar sessão.");
      window.localStorage.setItem("firmant-admin-user", user);
      setPassword("");
      setMessage("Sessão administrativa iniciada.");
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao iniciar sessão.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createLink() {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ responsibleName: leadName, email: leadEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao criar link.");
      setGeneratedUrl(data.publicUrl);
      setLeadName("");
      setLeadEmail("");
      setMessage("Link exclusivo criado.");
      await loadData();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao criar link.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyGeneratedUrl() {
    await navigator.clipboard.writeText(generatedUrl);
    setMessage("Link copiado para a área de transferência.");
  }

  async function deleteAttachment(attachmentId: string) {
    if (!id || !window.confirm("Excluir este anexo antes do prazo automático?")) return;
    const response = await fetch(`/api/admin/briefings/${id}/attachments/${attachmentId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Falha ao excluir anexo.");
      return;
    }
    setAttachments((current) => current.filter((item) => item.id !== attachmentId));
    setMessage("Anexo excluído.");
  }

  return (
    <section className="commercial-admin-page">
      <div className="commercial-admin-shell">
        <header className="commercial-admin-header">
          <div>
            <span>Admin FIRMANT</span>
            <h1>{mode === "briefing" ? "Detalhes da solicitação" : "Aprovação Geral"}</h1>
            <p>Briefings recebidos, propostas, produção e aprovações dentro do fluxo comercial da FIRMANT.</p>
          </div>
          <form className="commercial-admin-login" onSubmit={(event) => { event.preventDefault(); void login(); }}>
            <label>Usuário<input value={user} onChange={(event) => setUser(event.target.value)} /></label>
            <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="submit" disabled={isLoading}>{isLoading ? "Carregando..." : "Entrar"}</button>
          </form>
        </header>

        <nav className="commercial-admin-nav">
          <Link href="/admin/aprovacao-geral">Aprovação Geral</Link>
          <Link href="/admin/propostas">Propostas</Link>
          <Link href="/admin/conteudos">Conteúdos</Link>
          <Link href="/admin/clientes">Clientes</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/contratos">Contratos</Link>
          <Link href="/admin/newsletter">Newsletter</Link>
          <Link href="/admin/blog">Blog</Link>
        </nav>

        {error && <div className="commercial-admin-alert commercial-admin-alert-error">{error}</div>}
        {message && <div className="commercial-admin-alert commercial-admin-alert-success">{message}</div>}

        {mode === "briefings" ? (
          <>
            <section className="commercial-admin-card workflow-admin-create">
              <div><h2>Novo link de briefing</h2><p>Crie um link exclusivo para enviar ao contato.</p></div>
              <input placeholder="Nome do contato (opcional)" value={leadName} onChange={(event) => setLeadName(event.target.value)} />
              <input type="email" placeholder="E-mail (opcional)" value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} />
              <button type="button" disabled={isLoading} onClick={() => void createLink()}>Gerar link único</button>
              {generatedUrl && <div className="workflow-generated-link"><input readOnly value={generatedUrl} /><button type="button" onClick={() => void copyGeneratedUrl()}>Copiar</button></div>}
            </section>

            <div className="commercial-admin-filters workflow-admin-filters">
              <input placeholder="Buscar solicitação, cliente, marca ou projeto" value={q} onChange={(event) => setQ(event.target.value)} />
              <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select>
              <button type="button" onClick={() => void loadData()}>Filtrar</button>
            </div>
            <BriefingTable rows={briefings} />
          </>
        ) : (
          <BriefingDetails briefing={briefing} attachments={attachments} deleteAttachment={deleteAttachment} />
        )}
      </div>
    </section>
  );
}

function BriefingTable({ rows }: { rows: BriefingRow[] }) {
  return (
    <section className="commercial-admin-card">
      <h2>Solicitações</h2>
      <div className="commercial-admin-table-wrap"><table><thead><tr><th>Referência</th><th>Cliente</th><th>Projeto</th><th>Status</th><th>Anexos</th><th>Recebido</th><th>Ação</th></tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}><td>{row.reference_number}</td><td><strong>{row.responsible_name || "Não preenchido"}</strong><br />{row.email}</td><td>{row.project_name || "Aguardando preenchimento"}<br /><small>{row.brand_name}</small></td><td><StatusBadge status={row.status} /></td><td>{row.attachments_count ?? 0}</td><td>{formatDate(row.submitted_at ?? row.created_at)}</td><td><div className="commercial-admin-actions"><Link href={`/admin/solicitacoes/${row.id}`}>Abrir</Link></div></td></tr>)}
        {rows.length === 0 && <tr><td colSpan={7}>Nenhuma solicitação encontrada.</td></tr>}
      </tbody></table></div>
    </section>
  );
}

function BriefingDetails({ briefing, attachments, deleteAttachment }: { briefing: BriefingRow | null; attachments: Attachment[]; deleteAttachment: (id: string) => Promise<void> }) {
  if (!briefing) return <section className="commercial-admin-card"><p>Entre no Admin para consultar esta solicitação.</p></section>;
  const entries = [
    ["Referência", briefing.reference_number], ["Status", briefing.status], ["Responsável", briefing.responsible_name], ["E-mail", briefing.email], ["WhatsApp", briefing.whatsapp],
    ["Razão social / nome", briefing.legal_name], ["Nome fantasia", briefing.trade_name], ["CPF/CNPJ", briefing.tax_id], ["Projeto", briefing.project_name], ["Marca", briefing.brand_name],
    ["Tipo", briefing.request_type], ["Quantidade", briefing.quantity], ["Duração", briefing.duration], ["Prazo desejado", briefing.deadline_requested], ["Orçamento informado", briefing.budget_range],
    ["Tipos de conteúdo", joinJson(briefing.content_types_json)], ["Formatos", joinJson(briefing.formats_json)], ["Plataformas", joinJson(briefing.platforms_json)], ["Pagamento", joinJson(briefing.payment_preferences_json)],
  ];
  return <div className="commercial-admin-detail-grid"><section className="commercial-admin-card"><h2>Dados do briefing</h2><dl className="commercial-admin-definition">{entries.map(([label, value]) => <div key={String(label)}><dt>{String(label)}</dt><dd>{value ? String(value) : "Não informado"}</dd></div>)}</dl></section><section className="commercial-admin-card"><h2>Necessidade</h2><p>{String(briefing.scope_description ?? "Não informada")}</p><h2 className="workflow-subheading">Observações</h2><p>{String(briefing.additional_notes ?? "Sem observações adicionais.")}</p><div className="commercial-admin-actions commercial-admin-actions-block"><Link href={`/admin/propostas?briefingId=${briefing.id}`}>Criar proposta</Link></div></section><section className="commercial-admin-card commercial-admin-wide"><h2>Anexos temporários</h2><div className="workflow-admin-attachments">{attachments.map((attachment) => <article key={attachment.id}><a href={`/api/admin/briefings/${briefing.id}/attachments/${attachment.id}`} target="_blank" rel="noreferrer">{attachment.original_filename}</a><span>{formatBytes(attachment.size_bytes)} · expira {formatDate(attachment.expires_at)}</span><button type="button" onClick={() => void deleteAttachment(attachment.id)}>Excluir agora</button></article>)}{attachments.length === 0 && <p>Nenhum anexo disponível.</p>}</div></section></div>;
}

function StatusBadge({ status }: { status: string }) { return <span className={`workflow-status workflow-status-${status.toLowerCase()}`}>{status}</span>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function formatBytes(value: number) { return value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }
function joinJson(value: unknown) { try { const parsed = JSON.parse(String(value ?? "[]")); return Array.isArray(parsed) ? parsed.join(", ") : ""; } catch { return ""; } }
