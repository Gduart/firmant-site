import { getD1Database } from "@/lib/cloudflare-runtime";
import type {
  CommercialOrderRecord,
  CommercialRegistrationInput,
  ContractRecord,
  ContractStatus,
  ContractType,
  CustomerNoteRecord,
  CustomerRecord,
  OrderEventRecord,
  ServiceSnapshotItem,
} from "@/lib/commercial/types";

type QueryValue = string | number | null;

type CustomerListRow = CustomerRecord & {
  orders_count: number;
  last_order_at: string | null;
  latest_payment_status: string | null;
  latest_contract_status: string | null;
};

type AdminOrderRow = CommercialOrderRecord & {
  full_name: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  contract_id: string | null;
  contract_number: string | null;
  contract_type: ContractType | null;
  contract_status: ContractStatus | null;
  generated_at: string | null;
  email_sent_at: string | null;
  signed_at: string | null;
};

type ContractListRow = ContractRecord & {
  order_status: string | null;
  order_created_at: string | null;
  serviceSnapshot: string | null;
  amount: number | null;
  full_name: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
};

export async function registerCommercialOrder(input: CommercialRegistrationInput) {
  const order = await getCommercialOrderById(input.orderId);

  if (!order) {
    throw new Error("Pedido não encontrado para registro comercial.");
  }

  const customer = await upsertCustomer(input);
  await updateOrderCustomerCpf(order.id, customer.cpf);
  const contract = await ensureContractForOrder(order, customer);
  await addOrderEvent({
    orderId: order.id,
    customerId: customer.id,
    eventType: "pedido_criado",
    description: "Pedido vinculado ao cadastro comercial do cliente.",
    payload: {
      cpf: customer.cpf,
      instagram: customer.instagram,
      contractNumber: contract.contract_number,
      contractType: contract.contract_type,
      contractStatus: contract.contract_status,
    },
    createdBy: "system",
  });

  return { customer, contract };
}

export async function listCustomers(params: { q?: string }) {
  const query = params.q?.trim();
  const values: QueryValue[] = [];
  let where = "";

  if (query) {
    const like = `%${query}%`;
    where = `
      WHERE c.full_name LIKE ?
        OR c.cpf LIKE ?
        OR c.email LIKE ?
        OR c.phone LIKE ?
        OR IFNULL(c.instagram, '') LIKE ?
    `;
    values.push(like, like, like, like, like);
  }

  return all<CustomerListRow>(
    `
      SELECT
        c.*,
        COUNT(DISTINCT ct.order_id) AS orders_count,
        MAX(o.createdAt) AS last_order_at,
        (
          SELECT o2.status
          FROM contracts ct2
          JOIN orders o2 ON o2.id = ct2.order_id
          WHERE ct2.customer_id = c.id
          ORDER BY o2.createdAt DESC
          LIMIT 1
        ) AS latest_payment_status,
        (
          SELECT ct3.contract_status
          FROM contracts ct3
          JOIN orders o3 ON o3.id = ct3.order_id
          WHERE ct3.customer_id = c.id
          ORDER BY o3.createdAt DESC
          LIMIT 1
        ) AS latest_contract_status
      FROM customers c
      LEFT JOIN contracts ct ON ct.customer_id = c.id
      LEFT JOIN orders o ON o.id = ct.order_id
      ${where}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 200
    `,
    values,
  );
}

export async function getCustomerDetails(id: string) {
  const [customer, notes, events] = await Promise.all([
    first<CustomerRecord>("SELECT * FROM customers WHERE id = ?", [id]),
    listCustomerNotes(id),
    all<OrderEventRecord>(
      "SELECT * FROM order_events WHERE customer_id = ? ORDER BY created_at DESC LIMIT 200",
      [id],
    ),
  ]);

  if (!customer) {
    return null;
  }

  const orders = await listOrders({ customerId: id });

  return { customer, orders, notes, events };
}

export async function addCustomerNote(params: {
  customerId: string;
  note: string;
  createdBy: string;
}) {
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  const note = params.note.trim();

  if (!note) {
    throw new Error("Informe uma observação.");
  }

  await run(
    `
      INSERT INTO customer_notes (id, customer_id, note, created_at, created_by)
      VALUES (?, ?, ?, ?, ?)
    `,
    [id, params.customerId, note, timestamp, params.createdBy],
  );
  await addOrderEvent({
    orderId: null,
    customerId: params.customerId,
    eventType: "observacao_adicionada",
    description: note,
    payload: null,
    createdBy: params.createdBy,
  });

  return first<CustomerNoteRecord>("SELECT * FROM customer_notes WHERE id = ?", [id]);
}

export async function listOrders(params: {
  q?: string;
  paymentStatus?: string;
  contractStatus?: string;
  contractType?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
}) {
  const clauses: string[] = [];
  const values: QueryValue[] = [];
  const q = params.q?.trim();

  if (q) {
    const like = `%${q}%`;
    clauses.push(`
      (
        o.id LIKE ?
        OR o.customerName LIKE ?
        OR o.customerEmail LIKE ?
        OR o.customerPhone LIKE ?
        OR IFNULL(o.customerCpfCnpj, '') LIKE ?
        OR IFNULL(c.full_name, '') LIKE ?
        OR IFNULL(c.cpf, '') LIKE ?
        OR IFNULL(c.email, '') LIKE ?
        OR IFNULL(c.phone, '') LIKE ?
        OR IFNULL(c.instagram, '') LIKE ?
        OR o.serviceSnapshot LIKE ?
      )
    `);
    values.push(like, like, like, like, like, like, like, like, like, like, like);
  }

  if (params.paymentStatus) {
    clauses.push("o.status = ?");
    values.push(params.paymentStatus);
  }

  if (params.contractStatus) {
    clauses.push("ct.contract_status = ?");
    values.push(params.contractStatus);
  }

  if (params.contractType) {
    clauses.push("ct.contract_type = ?");
    values.push(params.contractType);
  }

  if (params.dateFrom) {
    clauses.push("o.createdAt >= ?");
    values.push(params.dateFrom);
  }

  if (params.dateTo) {
    clauses.push("o.createdAt <= ?");
    values.push(params.dateTo);
  }

  if (params.customerId) {
    clauses.push("ct.customer_id = ?");
    values.push(params.customerId);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  return all<AdminOrderRow>(
    `
      SELECT
        o.*,
        c.full_name,
        c.cpf,
        c.email,
        c.phone,
        c.instagram,
        ct.id AS contract_id,
        ct.contract_number,
        ct.contract_type,
        ct.contract_status,
        ct.generated_at,
        ct.email_sent_at,
        ct.signed_at
      FROM orders o
      LEFT JOIN contracts ct ON ct.order_id = o.id
      LEFT JOIN customers c ON c.id = ct.customer_id
      ${where}
      ORDER BY o.createdAt DESC
      LIMIT 300
    `,
    values,
  );
}

export async function getOrderDetails(id: string) {
  const [order, events] = await Promise.all([
    first<AdminOrderRow>(
      `
        SELECT
          o.*,
          c.full_name,
          c.cpf,
          c.email,
          c.phone,
          c.instagram,
          ct.id AS contract_id,
          ct.contract_number,
          ct.contract_type,
          ct.contract_status,
          ct.generated_at,
          ct.email_sent_at,
          ct.signed_at
        FROM orders o
        LEFT JOIN contracts ct ON ct.order_id = o.id
        LEFT JOIN customers c ON c.id = ct.customer_id
        WHERE o.id = ?
        LIMIT 1
      `,
      [id],
    ),
    all<OrderEventRecord>(
      "SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at DESC LIMIT 200",
      [id],
    ),
  ]);

  if (!order) {
    return null;
  }

  const contract = order.contract_id
    ? await first<ContractRecord>("SELECT * FROM contracts WHERE id = ?", [order.contract_id])
    : null;
  const notes = contract?.customer_id
    ? await listCustomerNotes(contract.customer_id)
    : [];

  return { order, contract, events, notes };
}

export async function getContractDetails(id: string) {
  const contract = await first<ContractListRow>(
    `
      SELECT
        ct.*,
        o.status AS order_status,
        o.createdAt AS order_created_at,
        o.serviceSnapshot,
        o.amount,
        c.full_name,
        c.cpf,
        c.email,
        c.phone,
        c.instagram
      FROM contracts ct
      JOIN orders o ON o.id = ct.order_id
      JOIN customers c ON c.id = ct.customer_id
      WHERE ct.id = ?
      LIMIT 1
    `,
    [id],
  );

  if (!contract) {
    return null;
  }

  const order = await first<CommercialOrderRecord>(
    "SELECT * FROM orders WHERE id = ?",
    [contract.order_id],
  );

  return { contract, order };
}

export async function listContracts(params: {
  q?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const clauses: string[] = [];
  const values: QueryValue[] = [];
  const q = params.q?.trim();

  if (q) {
    const like = `%${q}%`;
    clauses.push(`
      (
        ct.contract_number LIKE ?
        OR ct.order_id LIKE ?
        OR c.full_name LIKE ?
        OR c.cpf LIKE ?
        OR c.email LIKE ?
        OR IFNULL(c.instagram, '') LIKE ?
        OR IFNULL(o.serviceSnapshot, '') LIKE ?
      )
    `);
    values.push(like, like, like, like, like, like, like);
  }

  if (params.status) {
    clauses.push("ct.contract_status = ?");
    values.push(params.status);
  }

  if (params.type) {
    clauses.push("ct.contract_type = ?");
    values.push(params.type);
  }

  if (params.dateFrom) {
    clauses.push("ct.created_at >= ?");
    values.push(params.dateFrom);
  }

  if (params.dateTo) {
    clauses.push("ct.created_at <= ?");
    values.push(params.dateTo);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  return all<ContractListRow>(
    `
      SELECT
        ct.*,
        o.status AS order_status,
        o.createdAt AS order_created_at,
        o.serviceSnapshot,
        o.amount,
        c.full_name,
        c.cpf,
        c.email,
        c.phone,
        c.instagram
      FROM contracts ct
      JOIN orders o ON o.id = ct.order_id
      JOIN customers c ON c.id = ct.customer_id
      ${where}
      ORDER BY ct.created_at DESC
      LIMIT 300
    `,
    values,
  );
}

export async function updateContractAction(params: {
  contractId: string;
  action:
    | "gerar_pdf"
    | "marcar_pdf_enviado"
    | "registrar_autentique"
    | "marcar_autentique_enviado"
    | "marcar_assinado"
    | "dispensar"
    | "cancelar";
  createdBy: string;
  emailSentTo?: string;
  autentiqueUrl?: string;
  autentiqueDocumentId?: string;
  note?: string;
}) {
  const contract = await first<ContractRecord>(
    "SELECT * FROM contracts WHERE id = ?",
    [params.contractId],
  );

  if (!contract) {
    throw new Error("Contrato não encontrado.");
  }

  const timestamp = nowIso();
  const patch = buildContractPatch(params, timestamp, contract);
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);

  if (entries.length > 0) {
    const setClauses = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([, value]) => value as QueryValue);
    setClauses.push("updated_at = ?");
    values.push(timestamp, params.contractId);
    await run(`UPDATE contracts SET ${setClauses.join(", ")} WHERE id = ?`, values);
  }

  const updated = await first<ContractRecord>("SELECT * FROM contracts WHERE id = ?", [
    params.contractId,
  ]);

  await addOrderEvent({
    orderId: contract.order_id,
    customerId: contract.customer_id,
    eventType: mapContractActionToEvent(params.action),
    description: params.note?.trim() || getContractActionDescription(params.action),
    payload: {
      action: params.action,
      contractStatus: updated?.contract_status,
      autentiqueUrl: params.autentiqueUrl,
      autentiqueDocumentId: params.autentiqueDocumentId,
    },
    createdBy: params.createdBy,
  });

  return updated;
}

export async function markContractEmailSent(params: {
  contractId: string;
  emailSentTo: string;
  createdBy: string;
}) {
  const timestamp = nowIso();
  const contract = await first<ContractRecord>(
    "SELECT * FROM contracts WHERE id = ?",
    [params.contractId],
  );

  if (!contract) {
    throw new Error("Contrato não encontrado.");
  }

  await run(
    `
      UPDATE contracts
      SET contract_status = ?, email_sent_to = ?, email_sent_at = ?,
          email_error = ?, updated_at = ?
      WHERE id = ?
    `,
    [
      "pdf_enviado_email",
      params.emailSentTo,
      timestamp,
      null,
      timestamp,
      params.contractId,
    ],
  );
  await addOrderEvent({
    orderId: contract.order_id,
    customerId: contract.customer_id,
    eventType: "contrato_pdf_enviado_email",
    description: `Contrato PDF enviado por e-mail para ${params.emailSentTo}.`,
    payload: { emailSentTo: params.emailSentTo },
    createdBy: params.createdBy,
  });

  return first<ContractRecord>("SELECT * FROM contracts WHERE id = ?", [
    params.contractId,
  ]);
}

export async function markContractEmailError(params: {
  contractId: string;
  emailSentTo: string;
  error: string;
  createdBy: string;
}) {
  const timestamp = nowIso();
  const contract = await first<ContractRecord>(
    "SELECT * FROM contracts WHERE id = ?",
    [params.contractId],
  );

  if (!contract) {
    throw new Error("Contrato não encontrado.");
  }

  await run(
    "UPDATE contracts SET contract_status = ?, email_sent_to = ?, email_error = ?, updated_at = ? WHERE id = ?",
    ["erro", params.emailSentTo, params.error, timestamp, params.contractId],
  );
  await addOrderEvent({
    orderId: contract.order_id,
    customerId: contract.customer_id,
    eventType: "contrato_pdf_erro_email",
    description: `Erro ao enviar contrato PDF para ${params.emailSentTo}: ${params.error}`,
    payload: { emailSentTo: params.emailSentTo, error: params.error },
    createdBy: params.createdBy,
  });
}

export async function addOrderNote(params: {
  orderId: string;
  note: string;
  createdBy: string;
}) {
  const order = await getOrderDetails(params.orderId);

  if (!order) {
    throw new Error("Pedido não encontrado.");
  }

  await addOrderEvent({
    orderId: params.orderId,
    customerId: order.contract?.customer_id ?? null,
    eventType: "observacao_adicionada",
    description: params.note.trim(),
    payload: null,
    createdBy: params.createdBy,
  });
}

export function parseServiceSnapshot(snapshot: string | null | undefined) {
  if (!snapshot) {
    return [] as ServiceSnapshotItem[];
  }

  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed as ServiceSnapshotItem[] : [];
  } catch {
    return [] as ServiceSnapshotItem[];
  }
}

async function upsertCustomer(input: CommercialRegistrationInput) {
  const timestamp = nowIso();
  const cpf = normalizeCpf(input.cpf);
  const phone = normalizePhone(input.phone);
  const instagram = normalizeInstagram(input.instagram);
  const current = await first<CustomerRecord>("SELECT * FROM customers WHERE cpf = ?", [cpf]);

  if (current) {
    await run(
      `
        UPDATE customers
        SET full_name = ?, email = ?, phone = ?, instagram = ?, updated_at = ?
        WHERE id = ?
      `,
      [
        input.fullName.trim(),
        input.email.trim().toLowerCase(),
        phone,
        instagram,
        timestamp,
        current.id,
      ],
    );

    return first<CustomerRecord>("SELECT * FROM customers WHERE id = ?", [current.id])
      .then((customer) => {
        if (!customer) throw new Error("Falha ao atualizar cliente.");
        return customer;
      });
  }

  const id = crypto.randomUUID();
  await run(
    `
      INSERT INTO customers (
        id, full_name, cpf, email, phone, instagram, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      input.fullName.trim(),
      cpf,
      input.email.trim().toLowerCase(),
      phone,
      instagram,
      timestamp,
      timestamp,
    ],
  );

  await addOrderEvent({
    orderId: null,
    customerId: id,
    eventType: "cliente_criado",
    description: "Cliente registrado no Admin Comercial.",
    payload: { cpf, email: input.email.trim().toLowerCase(), phone, instagram },
    createdBy: "system",
  });

  return first<CustomerRecord>("SELECT * FROM customers WHERE id = ?", [id])
    .then((customer) => {
      if (!customer) throw new Error("Falha ao criar cliente.");
      return customer;
    });
}

async function ensureContractForOrder(
  order: CommercialOrderRecord,
  customer: CustomerRecord,
) {
  const existing = await first<ContractRecord>(
    "SELECT * FROM contracts WHERE order_id = ?",
    [order.id],
  );

  if (existing) {
    return existing;
  }

  const timestamp = nowIso();
  const contractType = inferContractType(order);
  const contractStatus = getInitialContractStatus(contractType);
  const contractNumber = buildContractNumber(order.createdAt);
  const id = crypto.randomUUID();

  await run(
    `
      INSERT INTO contracts (
        id, order_id, customer_id, contract_number, contract_type,
        contract_status, pdf_url, email_sent_to, email_sent_at,
        autentique_document_id, autentique_url, autentique_status,
        autentique_sent_at, autentique_signed_at, generated_at, signed_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      order.id,
      customer.id,
      contractNumber,
      contractType,
      contractStatus,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      timestamp,
      timestamp,
    ],
  );

  const contract = await first<ContractRecord>("SELECT * FROM contracts WHERE id = ?", [id]);

  if (!contract) {
    throw new Error("Falha ao criar contrato.");
  }

  return contract;
}

async function getCommercialOrderById(id: string) {
  return first<CommercialOrderRecord>("SELECT * FROM orders WHERE id = ?", [id]);
}

async function updateOrderCustomerCpf(orderId: string, cpf: string) {
  await run("UPDATE orders SET customerCpfCnpj = ?, updatedAt = ? WHERE id = ?", [
    cpf,
    nowIso(),
    orderId,
  ]);
}

async function listCustomerNotes(customerId: string) {
  return all<CustomerNoteRecord>(
    "SELECT * FROM customer_notes WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100",
    [customerId],
  );
}

async function addOrderEvent(params: {
  orderId: string | null;
  customerId: string | null;
  eventType: string;
  description: string;
  payload: unknown;
  createdBy: string;
}) {
  await run(
    `
      INSERT INTO order_events (
        id, order_id, customer_id, event_type, description,
        payload_json, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),
      params.orderId,
      params.customerId,
      params.eventType,
      params.description,
      params.payload ? JSON.stringify(params.payload) : null,
      nowIso(),
      params.createdBy,
    ],
  );
}

function buildContractPatch(
  params: Parameters<typeof updateContractAction>[0],
  timestamp: string,
  currentContract: ContractRecord,
) {
  switch (params.action) {
    case "gerar_pdf":
      return {
        contract_status: shouldPreserveContractStatus(currentContract.contract_status)
          ? currentContract.contract_status
          : "pdf_gerado",
        generated_at: timestamp,
        pdf_url: `/api/admin/contracts/${params.contractId}/pdf`,
      };
    case "marcar_pdf_enviado":
      return {
        contract_status: "pdf_enviado_email",
        email_sent_to: params.emailSentTo?.trim() || null,
        email_sent_at: timestamp,
        email_error: null,
      };
    case "registrar_autentique":
      return {
        contract_type: "autentique",
        contract_status: "autentique_pendente",
        autentique_url: params.autentiqueUrl?.trim() || null,
        autentique_document_id: params.autentiqueDocumentId?.trim() || null,
        autentique_status: "registrado_manual",
      };
    case "marcar_autentique_enviado":
      return {
        contract_type: "autentique",
        contract_status: "autentique_enviado",
        autentique_sent_at: timestamp,
        autentique_status: "enviado_manual",
      };
    case "marcar_assinado":
      return {
        contract_status: "assinado",
        signed_at: timestamp,
        autentique_signed_at: timestamp,
        autentique_status: "assinado_manual",
      };
    case "dispensar":
      return {
        contract_type: "dispensado",
        contract_status: "dispensado",
      };
    case "cancelar":
      return {
        contract_status: "cancelado",
      };
  }
}

function shouldPreserveContractStatus(status: ContractStatus) {
  return [
    "pdf_enviado_email",
    "autentique_enviado",
    "aguardando_assinatura",
    "assinado",
    "dispensado",
    "cancelado",
  ].includes(status);
}

function inferContractType(order: CommercialOrderRecord): ContractType {
  const services = parseServiceSnapshot(order.serviceSnapshot);
  const hasDev = services.some((service) => service.categoryId === "dev");
  const hasRecurring = order.billingModel === "RECURRING"
    || services.some((service) => service.recurring);

  if (hasDev) {
    return "analise_manual";
  }

  if (hasRecurring || order.amount >= 1000 || services.length > 1) {
    return "autentique";
  }

  return "pdf_email";
}

function getInitialContractStatus(contractType: ContractType): ContractStatus {
  if (contractType === "pdf_email") {
    return "pdf_pendente";
  }

  if (contractType === "autentique") {
    return "autentique_pendente";
  }

  if (contractType === "dispensado") {
    return "dispensado";
  }

  return "nao_gerado";
}

function buildContractNumber(orderCreatedAt: string) {
  const date = new Date(orderCreatedAt);
  const year = Number.isNaN(date.getTime())
    ? new Date().getFullYear()
    : date.getFullYear();
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `FIRMANT-${year}-${suffix}`;
}

function mapContractActionToEvent(action: Parameters<typeof updateContractAction>[0]["action"]) {
  const map = {
    gerar_pdf: "contrato_pdf_gerado",
    marcar_pdf_enviado: "contrato_pdf_enviado_email",
    registrar_autentique: "contrato_autentique_registrado",
    marcar_autentique_enviado: "contrato_autentique_enviado",
    marcar_assinado: "contrato_assinado",
    dispensar: "contrato_dispensado",
    cancelar: "contrato_cancelado",
  };

  return map[action];
}

function getContractActionDescription(
  action: Parameters<typeof updateContractAction>[0]["action"],
) {
  const map = {
    gerar_pdf: "Contrato PDF gerado administrativamente.",
    marcar_pdf_enviado: "Contrato marcado como enviado por e-mail.",
    registrar_autentique: "Link Autentique registrado manualmente.",
    marcar_autentique_enviado: "Contrato Autentique marcado como enviado.",
    marcar_assinado: "Contrato marcado como assinado.",
    dispensar: "Contrato dispensado manualmente.",
    cancelar: "Contrato cancelado manualmente.",
  };

  return map[action];
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeInstagram(value?: string) {
  const normalized = value?.trim().replace(/^@/, "");
  return normalized || null;
}

async function run(query: string, values: QueryValue[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).run();
}

async function first<T>(query: string, values: QueryValue[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).first<T>();
}

async function all<T>(query: string, values: QueryValue[] = []) {
  const database = await getD1Database();
  const result = await database.prepare(query).bind(...values).all<T>();
  return result.results;
}

function nowIso() {
  return new Date().toISOString();
}
