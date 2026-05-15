import type { PaymentRecord } from "@/lib/payments/types";
import {
  allStatement,
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";

type UpsertPaymentInput = Omit<PaymentRecord, "createdAt" | "updatedAt">;

export async function upsertPayment(payment: UpsertPaymentInput) {
  const existing = await getPaymentByProviderPaymentId(payment.providerPaymentId);
  const timestamp = nowIso();

  if (!existing) {
    await runStatement(
      `
        INSERT INTO payments (
          id, orderId, provider, providerPaymentId, providerStatus, billingType,
          amount, dueDate, paidAt, invoiceUrl, bankSlipUrl, pixQrCode,
          pixPayload, rawPayload, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payment.id,
        payment.orderId,
        payment.provider,
        payment.providerPaymentId,
        payment.providerStatus,
        payment.billingType,
        payment.amount,
        payment.dueDate,
        payment.paidAt,
        payment.invoiceUrl,
        payment.bankSlipUrl,
        payment.pixQrCode,
        payment.pixPayload,
        payment.rawPayload,
        timestamp,
        timestamp,
      ],
    );
  } else {
    await runStatement(
      `
        UPDATE payments
        SET providerStatus = ?, billingType = ?, amount = ?, dueDate = ?, paidAt = ?,
            invoiceUrl = ?, bankSlipUrl = ?, pixQrCode = ?, pixPayload = ?,
            rawPayload = ?, updatedAt = ?
        WHERE providerPaymentId = ?
      `,
      [
        payment.providerStatus,
        payment.billingType,
        payment.amount,
        payment.dueDate,
        payment.paidAt,
        payment.invoiceUrl,
        payment.bankSlipUrl,
        payment.pixQrCode,
        payment.pixPayload,
        payment.rawPayload,
        timestamp,
        payment.providerPaymentId,
      ],
    );
  }

  return getPaymentByProviderPaymentId(payment.providerPaymentId);
}

export async function getPaymentByProviderPaymentId(providerPaymentId: string) {
  return firstStatement<PaymentRecord>(
    "SELECT * FROM payments WHERE providerPaymentId = ?",
    [providerPaymentId],
  );
}

export async function listPaymentsByOrderId(orderId: string) {
  return allStatement<PaymentRecord>(
    "SELECT * FROM payments WHERE orderId = ? ORDER BY createdAt DESC",
    [orderId],
  );
}
