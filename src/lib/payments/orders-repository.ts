import type { OrderRecord, OrderStatus } from "@/lib/payments/types";
import {
  allStatement,
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";

type InsertOrderInput = Omit<OrderRecord, "createdAt" | "updatedAt">;

export async function insertOrder(order: InsertOrderInput) {
  const timestamp = nowIso();

  await runStatement(
    `
      INSERT INTO orders (
        id, createdAt, updatedAt, customerName, customerEmail, customerPhone,
        customerCompany, customerCpfCnpj, serviceSnapshot, billingModel,
        paymentMethodPreference, oneTimeAmount, recurringAmount, amount,
        currency, status, externalReference, asaasCustomerId, asaasPaymentId,
        asaasCheckoutId, asaasSubscriptionId, checkoutUrl, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      order.id,
      timestamp,
      timestamp,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.customerCompany,
      order.customerCpfCnpj,
      order.serviceSnapshot,
      order.billingModel,
      order.paymentMethodPreference,
      order.oneTimeAmount,
      order.recurringAmount,
      order.amount,
      order.currency,
      order.status,
      order.externalReference,
      order.asaasCustomerId,
      order.asaasPaymentId,
      order.asaasCheckoutId,
      order.asaasSubscriptionId,
      order.checkoutUrl,
      order.notes,
    ],
  );

  return getOrderById(order.id);
}

export async function getOrderById(id: string) {
  return firstStatement<OrderRecord>("SELECT * FROM orders WHERE id = ?", [id]);
}

export async function getOrderByExternalReference(externalReference: string) {
  return firstStatement<OrderRecord>(
    "SELECT * FROM orders WHERE externalReference = ?",
    [externalReference],
  );
}

export async function findOrderByAsaasReferences(params: {
  paymentId?: string | null;
  checkoutId?: string | null;
  subscriptionId?: string | null;
}) {
  const clauses: string[] = [];
  const values: string[] = [];

  if (params.paymentId) {
    clauses.push("asaasPaymentId = ?");
    values.push(params.paymentId);
  }

  if (params.checkoutId) {
    clauses.push("asaasCheckoutId = ?");
    values.push(params.checkoutId);
  }

  if (params.subscriptionId) {
    clauses.push("asaasSubscriptionId = ?");
    values.push(params.subscriptionId);
  }

  if (clauses.length === 0) {
    return null;
  }

  return firstStatement<OrderRecord>(
    `SELECT * FROM orders WHERE ${clauses.join(" OR ")} ORDER BY createdAt DESC LIMIT 1`,
    values,
  );
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      OrderRecord,
      | "status"
      | "asaasCustomerId"
      | "asaasPaymentId"
      | "asaasCheckoutId"
      | "asaasSubscriptionId"
      | "checkoutUrl"
      | "notes"
      | "customerCpfCnpj"
    >
  >,
) {
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return getOrderById(id);
  }

  const setClauses = entries.map(([key]) => `${key} = ?`);
  const values = entries.map(([, value]) => value);
  setClauses.push("updatedAt = ?");
  values.push(nowIso());
  values.push(id);

  await runStatement(
    `UPDATE orders SET ${setClauses.join(", ")} WHERE id = ?`,
    values,
  );

  return getOrderById(id);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateOrder(id, { status });
}

export async function listOrders() {
  return allStatement<OrderRecord>(
    "SELECT * FROM orders ORDER BY createdAt DESC LIMIT 50",
  );
}
