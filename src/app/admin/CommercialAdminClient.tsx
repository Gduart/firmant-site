"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminMode = "clientes" | "cliente" | "pedidos" | "pedido" | "contratos";

type CommercialAdminClientProps = {
  mode: AdminMode;
  id?: string;
};

const navItems = [
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/contratos", label: "Contratos" },
];

const contractStatuses = [
  "nao_gerado",
  "pdf_pendente",
  "pdf_gerado",
  "pdf_enviado_email",
  "autentique_pendente",
  "autentique_enviado",
  "aguardando_assinatura",
  "assinado",
  "dispensado",
  "cancelado",
  "erro",
];

const contractTypes = ["pdf_email", "autentique", "analise_manual", "dispensado"];

const paymentStatuses = [
  "DRAFT",
  "CHECKOUT_CREATED",
  "AWAITING_PAYMENT",
  "AWAITING_PIX",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "SUBSCRIPTION_ACTIVE",
  "OVERDUE",
  "CANCELED",
  "REFUNDED",
  "FAILED",
];

type ServiceRow = {
  categoryTitle?: string;
  serviceId?: string;
  serviceLabel?: string;
  qty?: number;
  total?: number;
  recurring?: boolean;
};

type CustomerRow = {
  id: string;
  full_name: string;
  cpf: string | null;
  email: string;
  phone: string;
  instagram: string | null;
  created_at: string;
  orders_count?: number;
  latest_payment_status?: string | null;
  latest_contract_status?: string | null;
};

type OrderRow = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpfCnpj: string | null;
  serviceSnapshot: string;
  billingModel: string;
  paymentMethodPreference: string;
  amount: number;
  status: string;
  externalReference: string;
  asaasCheckoutId: string | null;
  asaasPaymentId: string | null;
  full_name?: string | null;
  cpf?: string | null;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  contract_id?: string | null;
  contract_type?: string | null;
  contract_status?: string | null;
};

type ContractRow = {
  id: string;
  order_id: string;
  contract_number: string;
  contract_type: string;
  contract_status: string;
  generated_at: string | null;
  email_sent_at: string | null;
  signed_at: string | null;
  autentique_url?: string | null;
  full_name?: string | null;
  cpf?: string | null;
  email?: string | null;
  serviceSnapshot?: string | null;
};

type NoteRow = {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
};

type EventRow = {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
};

type AdminData = {
  customers?: CustomerRow[];
  customer?: CustomerRow;
  orders?: OrderRow[];
  order?: OrderRow;
  contracts?: ContractRow[];
  contract?: ContractRow;
  notes?: NoteRow[];
  events?: EventRow[];
} | null;

type NoteProps = {
  note: string;
  setNote: (value: string) => void;
  saveNote: () => Promise<void>;
  notes: NoteRow[];
};

type ContractAction = (
  contractId: string,
  action: string,
  extra?: Record<string, unknown>,
) => Promise<void>;

export function CommercialAdminClient({ mode, id }: CommercialAdminClientProps) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminData>(null);
  const [q, setQ] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [contractStatus, setContractStatus] = useState("");
  const [contractType, setContractType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeActionId, setActiveActionId] = useState("");
  const [note, setNote] = useState("");
  const [autentiqueUrl, setAutentiqueUrl] = useState("");
  const [autentiqueDocumentId, setAutentiqueDocumentId] = useState("");
  const [copyContractToFirmant, setCopyContractToFirmant] = useState(false);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (contractStatus) params.set(mode === "contratos" ? "status" : "contractStatus", contractStatus);
    if (contractType) params.set(mode === "contratos" ? "type" : "contractType", contractType);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();

    if (mode === "clientes") return `/api/admin/customers${query ? `?${query}` : ""}`;
    if (mode === "cliente") return `/api/admin/customers/${id}`;
    if (mode === "pedidos") return `/api/admin/orders${query ? `?${query}` : ""}`;
    if (mode === "pedido") return `/api/admin/orders/${id}`;
    return `/api/admin/contracts${query ? `?${query}` : ""}`;
  }, [contractStatus, contractType, dateFrom, dateTo, id, mode, paymentStatus, q]);

  const loadData = useCallback(async (options: { silentUnauthorized?: boolean } = {}) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = await response.json();

      if (!response.ok) {
        if (options.silentUnauthorized && response.status === 401) {
          return;
        }

        throw new Error(json.error ?? "Falha ao carregar dados.");
      }

      setData(json);
      setMessage("Dados carregados.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("firmant-admin-user");
    window.localStorage.removeItem("firmant-admin-password");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (!sessionChecked) {
      setSessionChecked(true);
      void loadData({ silentUnauthorized: true });
    }
  }, [loadData, sessionChecked]);

  async function loginAdmin() {
    if (!user || !password) {
      setError("Informe usuário e senha do Admin Comercial.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ user, password }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Falha ao iniciar sessão administrativa.");
      }

      window.localStorage.setItem("firmant-admin-user", user);
      window.localStorage.removeItem("firmant-admin-password");
      setPassword("");
      setMessage("Sessão administrativa iniciada.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar sessão administrativa.");
    } finally {
      setIsLoading(false);
    }
  }

  async function logoutAdmin() {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
    setData(null);
    setPassword("");
    setMessage("Sessão encerrada.");
  }

  async function postJson(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error ?? "Falha ao executar ação.");
    }

    return json;
  }

  async function saveNote() {
    try {
      setError("");
      setToast("");
      if (mode === "cliente") {
        await postJson("/api/admin/customers", { customerId: id, note });
      }
      if (mode === "pedido") {
        await postJson("/api/admin/orders", { orderId: id, note });
      }
      setNote("");
      setMessage("Observação salva.");
      setToast("Observação salva.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar observação.");
    }
  }

  async function contractAction(contractId: string, action: string, extra: Record<string, unknown> = {}) {
    try {
      setError("");
      setToast("");
      setActiveActionId(`${contractId}:${action}`);
      await postJson(`/api/admin/contracts/${contractId}`, { action, ...extra });
      setMessage("Contrato atualizado.");
      setToast("Contrato atualizado.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar contrato.");
    } finally {
      setActiveActionId("");
    }
  }

  async function sendContractEmail(contractId: string) {
    try {
      setError("");
      setToast("");
      setActiveActionId(`${contractId}:send-email`);
      await postJson(`/api/admin/contracts/${contractId}/send-email`, {
        copyToFirmant: copyContractToFirmant,
      });
      const successMessage = copyContractToFirmant
        ? "Contrato enviado para o cliente com cópia para a FIRMANT."
        : "Contrato enviado por e-mail para o cliente.";
      setMessage(successMessage);
      setToast(successMessage);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar contrato por e-mail.");
    } finally {
      setActiveActionId("");
    }
  }

  async function generateAndOpenPdf(contractId: string) {
    try {
      setError("");
      setToast("");
      setActiveActionId(`${contractId}:gerar_pdf`);
      await postJson(`/api/admin/contracts/${contractId}`, { action: "gerar_pdf" });
      await openPdf(contractId);
      setMessage("PDF do contrato gerado e aberto.");
      setToast("PDF do contrato gerado e aberto.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar PDF do contrato.");
    } finally {
      setActiveActionId("");
    }
  }

  async function syncAsaasPayment(orderId: string) {
    try {
      setError("");
      setToast("");
      setActiveActionId(`${orderId}:sync-asaas`);
      const result = await postJson(`/api/admin/orders/${orderId}/sync-asaas`, {});
      const synced = Array.isArray(result.results)
        ? result.results.filter((item: { synced?: boolean }) => item.synced).length
        : 0;
      const successMessage = synced > 0
        ? `Sincronização Asaas concluída (${synced} cobrança(s)).`
        : "Sincronização Asaas concluída sem cobrança encontrada.";
      setMessage(successMessage);
      setToast(successMessage);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao sincronizar pagamento Asaas.");
    } finally {
      setActiveActionId("");
    }
  }

  return (
    <section className="commercial-admin-page">
      <div className="commercial-admin-shell">
        <header className="commercial-admin-header">
          <div>
            <span>Admin Comercial FIRMANT</span>
            <h1>{getTitle(mode)}</h1>
            <p>Clientes, pedidos, contratos e histórico comercial sem alterar o fluxo de pagamento Asaas.</p>
          </div>
          <form className="commercial-admin-login" onSubmit={(event) => { event.preventDefault(); void loginAdmin(); }}>
            <label>
              Usuário
              <input value={user} onChange={(event) => setUser(event.target.value)} placeholder="FIRMANT_ADMIN" />
            </label>
            <label>
              Senha
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha do admin" />
            </label>
            <label className="commercial-admin-checkbox">
              <input
                type="checkbox"
                checked={copyContractToFirmant}
                onChange={(event) => setCopyContractToFirmant(event.target.checked)}
              />
              Enviar cópia dos contratos para ag.firmant@gmail.com
            </label>
            <button type="submit" disabled={isLoading}>{isLoading ? "Carregando..." : "Entrar"}</button>
            <button type="button" onClick={() => void logoutAdmin()}>
              Sair
            </button>
          </form>
        </header>

        <nav className="commercial-admin-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>

        {(mode === "clientes" || mode === "pedidos" || mode === "contratos") && (
          <div className="commercial-admin-filters">
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar por nome, CPF, e-mail, telefone, Instagram, pedido ou serviço" />
            {mode === "pedidos" && (
              <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                <option value="">Status pagamento</option>
                {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            )}
            {(mode === "pedidos" || mode === "contratos") && (
              <>
                <select value={contractStatus} onChange={(event) => setContractStatus(event.target.value)}>
                  <option value="">Status contrato</option>
                  {contractStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select value={contractType} onChange={(event) => setContractType(event.target.value)}>
                  <option value="">Tipo contrato</option>
                  {contractTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
              </>
            )}
            <button type="button" onClick={() => void loadData()} disabled={isLoading}>Filtrar</button>
          </div>
        )}

        {error && <div className="commercial-admin-alert commercial-admin-alert-error">{error}</div>}
        {message && <div className="commercial-admin-alert commercial-admin-alert-success">{message}</div>}
        {toast && (
          <div className="commercial-admin-toast" role="status">
            <span>{toast}</span>
            <button type="button" onClick={() => setToast("")}>Fechar</button>
          </div>
        )}

        {mode === "clientes" && <CustomersTable rows={data?.customers ?? []} />}
        {mode === "cliente" && <CustomerDetails data={data} note={note} setNote={setNote} saveNote={saveNote} />}
        {mode === "pedidos" && <OrdersTable rows={data?.orders ?? []} />}
        {mode === "pedido" && (
          <OrderDetails
            data={data}
            note={note}
            setNote={setNote}
            saveNote={saveNote}
            contractAction={contractAction}
            sendContractEmail={sendContractEmail}
            generateAndOpenPdf={generateAndOpenPdf}
            syncAsaasPayment={syncAsaasPayment}
            activeActionId={activeActionId}
          />
        )}
        {mode === "contratos" && (
          <ContractsTable
            rows={data?.contracts ?? []}
            contractAction={contractAction}
            sendContractEmail={sendContractEmail}
            generateAndOpenPdf={generateAndOpenPdf}
            activeActionId={activeActionId}
            autentiqueUrl={autentiqueUrl}
            setAutentiqueUrl={setAutentiqueUrl}
            autentiqueDocumentId={autentiqueDocumentId}
            setAutentiqueDocumentId={setAutentiqueDocumentId}
          />
        )}
      </div>
    </section>
  );
}

function CustomersTable({ rows }: { rows: CustomerRow[] }) {
  return (
    <div className="commercial-admin-card">
      <div className="commercial-admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>WhatsApp</th>
              <th>Instagram</th>
              <th>Pedidos</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.full_name}</td>
                <td>{formatCpf(row.cpf)}</td>
                <td>{row.email}</td>
                <td>{formatPhone(row.phone)}</td>
                <td>{formatInstagram(row.instagram)}</td>
                <td>{row.orders_count}</td>
                <td>{row.latest_payment_status ?? "Sem pedido"} / {row.latest_contract_status ?? "sem contrato"}</td>
                <td>{formatDate(row.created_at)}</td>
                <td className="commercial-admin-actions">
                  <Link href={`/admin/clientes/${row.id}`}>Ver</Link>
                  <button type="button" onClick={() => void navigator.clipboard.writeText(row.email)}>Copiar e-mail</button>
                  <a href={`https://wa.me/55${row.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerDetails({
  data,
  note,
  setNote,
  saveNote,
}: {
  data: AdminData;
  note: string;
  setNote: (value: string) => void;
  saveNote: () => Promise<void>;
}) {
  const customer = data?.customer;
  if (!customer) return <EmptyState text="Carregue um cliente para visualizar os detalhes." />;

  return (
    <div className="commercial-admin-detail-grid">
      <InfoCard title="Dados do Cliente" items={[
        ["Nome", customer.full_name],
        ["CPF", formatCpf(customer.cpf)],
        ["E-mail", customer.email],
        ["WhatsApp", formatPhone(customer.phone)],
        ["Instagram", formatInstagram(customer.instagram)],
        ["Cadastro", formatDate(customer.created_at)],
      ]} />
      <NotesCard note={note} setNote={setNote} saveNote={saveNote} notes={data?.notes ?? []} />
      <OrdersTable rows={data?.orders ?? []} compact />
      <EventsCard events={data?.events ?? []} />
    </div>
  );
}

function OrdersTable({ rows, compact = false }: { rows: OrderRow[]; compact?: boolean }) {
  return (
    <div className="commercial-admin-card commercial-admin-wide">
      <h2>{compact ? "Histórico de pedidos" : "Pedidos"}</h2>
      <div className="commercial-admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>CPF</th>
              <th>Contato</th>
              <th>Serviço/Pacote</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Contrato</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>#{shortId(row.id)}</td>
                <td>{row.full_name ?? row.customerName}</td>
                <td>{formatCpf(row.cpf ?? row.customerCpfCnpj)}</td>
                <td>{row.email ?? row.customerEmail}<br />{formatPhone(row.phone ?? row.customerPhone)}</td>
                <td>{summarizeServices(row.serviceSnapshot)}</td>
                <td>{formatCurrency(row.amount)}</td>
                <td>{row.paymentMethodPreference}<br />{row.status}</td>
                <td>{row.contract_status ?? "sem contrato"}<br />{row.contract_type ?? ""}</td>
                <td>{formatDate(row.createdAt)}</td>
                <td className="commercial-admin-actions">
                  <Link href={`/admin/pedidos/${row.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDetails({
  data,
  note,
  setNote,
  saveNote,
  contractAction,
  sendContractEmail,
  generateAndOpenPdf,
  syncAsaasPayment,
  activeActionId,
}: {
  data: AdminData;
  note: string;
  setNote: (value: string) => void;
  saveNote: () => Promise<void>;
  contractAction: ContractAction;
  sendContractEmail: (contractId: string) => Promise<void>;
  generateAndOpenPdf: (contractId: string) => Promise<void>;
  syncAsaasPayment: (orderId: string) => Promise<void>;
  activeActionId: string;
}) {
  const order = data?.order;
  const contract = data?.contract;
  if (!order) return <EmptyState text="Carregue um pedido para visualizar os detalhes." />;

  return (
    <div className="commercial-admin-detail-grid">
      <InfoCard title="Dados do Pedido" items={[
        ["Pedido", order.id],
        ["Data", formatDate(order.createdAt)],
        ["Status pagamento", order.status],
        ["Status contrato", order.contract_status ?? "sem contrato"],
        ["Status geral", `${order.billingModel} / ${order.paymentMethodPreference}`],
      ]} />
      <InfoCard title="Dados do Cliente" items={[
        ["Nome", order.full_name ?? order.customerName],
        ["CPF", formatCpf(order.cpf ?? order.customerCpfCnpj)],
        ["E-mail", order.email ?? order.customerEmail],
        ["WhatsApp", formatPhone(order.phone ?? order.customerPhone)],
        ["Instagram", formatInstagram(order.instagram)],
      ]} />
      <ServicesCard snapshot={order.serviceSnapshot} />
      <InfoCard title="Pagamento" items={[
        ["Forma", order.paymentMethodPreference],
        ["Parcelamento", order.paymentMethodPreference === "CREDIT_CARD" ? "Até 12x no Asaas, conforme checkout" : "Não aplicável"],
        ["Valor", formatCurrency(order.amount)],
        ["Status", order.status],
        ["Referência interna", order.externalReference],
        ["Asaas checkout", order.asaasCheckoutId ?? "Não informado"],
        ["Asaas payment", order.asaasPaymentId ?? "Não informado"],
      ]} />
      <PaymentSyncCard
        order={order}
        syncAsaasPayment={syncAsaasPayment}
        activeActionId={activeActionId}
      />
      {contract && (
        <ContractActionsCard
          contract={contract}
          order={order}
          contractAction={contractAction}
          sendContractEmail={sendContractEmail}
          generateAndOpenPdf={generateAndOpenPdf}
          activeActionId={activeActionId}
        />
      )}
      <NotesCard note={note} setNote={setNote} saveNote={saveNote} notes={data?.notes ?? []} />
      <EventsCard events={data?.events ?? []} />
    </div>
  );
}

function PaymentSyncCard({
  order,
  syncAsaasPayment,
  activeActionId,
}: {
  order: OrderRow;
  syncAsaasPayment: (orderId: string) => Promise<void>;
  activeActionId: string;
}) {
  const isSyncing = activeActionId === `${order.id}:sync-asaas`;

  return (
    <div className="commercial-admin-card">
      <h2>Sincronização Asaas</h2>
      <dl className="commercial-admin-definition">
        <div><dt>Checkout</dt><dd>{order.asaasCheckoutId ?? "Não informado"}</dd></div>
        <div><dt>Payment</dt><dd>{order.asaasPaymentId ?? "Não informado"}</dd></div>
      </dl>
      <div className="commercial-admin-actions commercial-admin-actions-block">
        <button
          type="button"
          onClick={() => syncAsaasPayment(order.id)}
          disabled={isSyncing || !order.asaasCheckoutId}
        >
          {isSyncing ? "Sincronizando..." : "Sincronizar pagamento"}
        </button>
      </div>
    </div>
  );
}

function ContractsTable(props: {
  rows: ContractRow[];
  contractAction: ContractAction;
  sendContractEmail: (contractId: string) => Promise<void>;
  generateAndOpenPdf: (contractId: string) => Promise<void>;
  activeActionId: string;
  autentiqueUrl: string;
  setAutentiqueUrl: (value: string) => void;
  autentiqueDocumentId: string;
  setAutentiqueDocumentId: (value: string) => void;
}) {
  const {
    rows,
    contractAction,
    sendContractEmail,
    generateAndOpenPdf,
    activeActionId,
    autentiqueUrl,
    setAutentiqueUrl,
    autentiqueDocumentId,
    setAutentiqueDocumentId,
  } = props;

  return (
    <div className="commercial-admin-card">
      <div className="commercial-admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>CPF</th>
              <th>Serviço</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Datas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.contract_number}</td>
                <td>#{shortId(row.order_id)}</td>
                <td>{row.full_name}<br />{row.email}</td>
                <td>{formatCpf(row.cpf)}</td>
                <td>{summarizeServices(row.serviceSnapshot)}</td>
                <td>{row.contract_type}</td>
                <td>{row.contract_status}</td>
                <td>
                  Geração: {row.generated_at ? formatDate(row.generated_at) : "pendente"}<br />
                  Envio: {row.email_sent_at ? formatDate(row.email_sent_at) : "pendente"}<br />
                  Assinatura: {row.signed_at ? formatDate(row.signed_at) : "pendente"}
                </td>
                <td className="commercial-admin-actions">
                  <Link href={`/admin/pedidos/${row.order_id}`}>Pedido</Link>
                  <button type="button" onClick={() => generateAndOpenPdf(row.id)} disabled={activeActionId === `${row.id}:gerar_pdf`}>
                    {activeActionId === `${row.id}:gerar_pdf` ? "Gerando..." : "Gerar/abrir PDF"}
                  </button>
                  <button type="button" onClick={() => void openPdf(row.id)}>Abrir PDF</button>
                  <button type="button" onClick={() => sendContractEmail(row.id)} disabled={activeActionId === `${row.id}:send-email`}>
                    {activeActionId === `${row.id}:send-email` ? "Enviando..." : "Enviar e-mail"}
                  </button>
                  <button type="button" onClick={() => contractAction(row.id, "marcar_pdf_enviado", { emailSentTo: row.email })} disabled={activeActionId === `${row.id}:marcar_pdf_enviado`}>
                    {activeActionId === `${row.id}:marcar_pdf_enviado` ? "Marcando..." : "Marcar e-mail"}
                  </button>
                  <input value={autentiqueUrl} onChange={(event) => setAutentiqueUrl(event.target.value)} placeholder="Link Autentique" />
                  <input value={autentiqueDocumentId} onChange={(event) => setAutentiqueDocumentId(event.target.value)} placeholder="Document ID" />
                  <button type="button" onClick={() => contractAction(row.id, "registrar_autentique", { autentiqueUrl, autentiqueDocumentId })}>Registrar Autentique</button>
                  <button type="button" onClick={() => contractAction(row.id, "marcar_autentique_enviado")}>Autentique enviado</button>
                  <button type="button" onClick={() => contractAction(row.id, "marcar_assinado")}>Assinado</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractActionsCard({
  contract,
  order,
  contractAction,
  sendContractEmail,
  generateAndOpenPdf,
  activeActionId,
}: {
  contract: ContractRow;
  order: OrderRow;
  contractAction: ContractAction;
  sendContractEmail: (contractId: string) => Promise<void>;
  generateAndOpenPdf: (contractId: string) => Promise<void>;
  activeActionId: string;
}) {
  return (
    <div className="commercial-admin-card">
      <h2>Contrato</h2>
      <dl className="commercial-admin-definition">
        <div><dt>Número</dt><dd>{contract.contract_number}</dd></div>
        <div><dt>Tipo</dt><dd>{contract.contract_type}</dd></div>
        <div><dt>Status</dt><dd>{contract.contract_status}</dd></div>
        <div><dt>Geração</dt><dd>{contract.generated_at ? formatDate(contract.generated_at) : "Pendente"}</dd></div>
        <div><dt>Envio</dt><dd>{contract.email_sent_at ? formatDate(contract.email_sent_at) : "Pendente"}</dd></div>
        <div><dt>Autentique</dt><dd>{contract.autentique_url ?? "Não registrado"}</dd></div>
      </dl>
      <div className="commercial-admin-actions commercial-admin-actions-block">
        <button type="button" onClick={() => generateAndOpenPdf(contract.id)} disabled={activeActionId === `${contract.id}:gerar_pdf`}>
          {activeActionId === `${contract.id}:gerar_pdf` ? "Gerando..." : "Gerar/abrir PDF"}
        </button>
        <button type="button" onClick={() => void openPdf(contract.id)}>Abrir PDF</button>
        <button type="button" onClick={() => sendContractEmail(contract.id)} disabled={activeActionId === `${contract.id}:send-email`}>
          {activeActionId === `${contract.id}:send-email` ? "Enviando..." : "Enviar PDF por e-mail"}
        </button>
        <button type="button" onClick={() => contractAction(contract.id, "marcar_pdf_enviado", { emailSentTo: order.email ?? order.customerEmail })} disabled={activeActionId === `${contract.id}:marcar_pdf_enviado`}>
          {activeActionId === `${contract.id}:marcar_pdf_enviado` ? "Marcando..." : "Marcar PDF enviado"}
        </button>
        <button type="button" onClick={() => contractAction(contract.id, "marcar_assinado")}>Marcar assinado</button>
        <button type="button" onClick={() => contractAction(contract.id, "dispensar")}>Dispensar</button>
        <button type="button" onClick={() => contractAction(contract.id, "cancelar")}>Cancelar</button>
      </div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <div className="commercial-admin-card">
      <h2>{title}</h2>
      <dl className="commercial-admin-definition">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || "Não informado"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ServicesCard({ snapshot }: { snapshot: string }) {
  const services = parseServices(snapshot);
  return (
    <div className="commercial-admin-card commercial-admin-wide">
      <h2>Serviços solicitados</h2>
      <div className="commercial-admin-service-list">
        {services.map((service, index) => (
          <article key={`${service.serviceId}-${index}`}>
            <span>{service.categoryTitle}</span>
            <h3>{service.serviceLabel}</h3>
            <p>Quantidade: {service.qty} | Valor: {formatCurrency(service.total ?? 0)} | {service.recurring ? "Recorrente" : "Avulso"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function NotesCard({ note, setNote, saveNote, notes }: NoteProps) {
  return (
    <div className="commercial-admin-card">
      <h2>Observações internas</h2>
      <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Registre uma nota administrativa." />
      <button type="button" onClick={() => void saveNote()}>Salvar observação</button>
      <div className="commercial-admin-events">
        {notes.map((item) => (
          <article key={item.id}>
            <strong>{formatDate(item.created_at)} · {item.created_by}</strong>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function EventsCard({ events }: { events: EventRow[] }) {
  return (
    <div className="commercial-admin-card commercial-admin-wide">
      <h2>Histórico de eventos</h2>
      <div className="commercial-admin-events">
        {events.map((event) => (
          <article key={event.id}>
            <strong>{formatDate(event.created_at)} · {event.event_type}</strong>
            <p>{event.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="commercial-admin-card"><p>{text}</p></div>;
}

function getTitle(mode: AdminMode) {
  const titles = {
    clientes: "Clientes",
    cliente: "Detalhes do cliente",
    pedidos: "Pedidos",
    pedido: "Detalhes do pedido",
    contratos: "Contratos",
  };
  return titles[mode];
}

function parseServices(snapshot?: string | null) {
  if (!snapshot) {
    return [] as ServiceRow[];
  }

  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed as ServiceRow[] : [];
  } catch {
    return [];
  }
}

function summarizeServices(snapshot?: string | null) {
  const services = parseServices(snapshot);
  if (services.length === 0) return "Sem serviços";
  return services.map((service) => service.serviceLabel).join(", ");
}

async function openPdf(contractId: string) {
  const url = `/api/admin/contracts/${contractId}/pdf`;
  const win = window.open("", "_blank");
  if (!win) return;

  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const message = contentType.includes("application/json")
      ? ((await response.json()) as { error?: string }).error
      : await response.text();
    win.document.write(`<pre style="font:14px/1.5 sans-serif;white-space:pre-wrap;color:#991b1b;padding:24px;">${escapeText(message || "Falha ao abrir PDF.")}</pre>`);
    win.document.close();
    throw new Error(message || "Falha ao abrir PDF.");
  }

  const blob = await response.blob();
  if (!blob.type.includes("pdf") && blob.size < 500) {
    win.document.write('<pre style="font:14px/1.5 sans-serif;white-space:pre-wrap;color:#991b1b;padding:24px;">Resposta inválida ao abrir PDF.</pre>');
    win.document.close();
    throw new Error("Resposta inválida ao abrir PDF.");
  }

  win.location.href = URL.createObjectURL(blob);
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatCurrency(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCpf(value?: string | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 11) return value || "Não informado";
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value?: string | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length < 10) return value || "Não informado";
  const local = digits.length > 11 ? digits.slice(-11) : digits;
  return `+55 ${local.slice(0, 2)} ${local.slice(2, 7)}-${local.slice(7)}`;
}

function formatInstagram(value?: string | null) {
  return value ? `@${String(value).replace(/^@/, "")}` : "Não informado";
}

function shortId(value: string) {
  return value.slice(0, 8);
}
