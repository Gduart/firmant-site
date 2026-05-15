import type { SubscriptionRecord } from "@/lib/payments/types";
import {
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";

type UpsertSubscriptionInput = Omit<SubscriptionRecord, "createdAt" | "updatedAt">;

export async function upsertSubscription(subscription: UpsertSubscriptionInput) {
  const existing = await getSubscriptionByProviderId(subscription.providerSubscriptionId);
  const timestamp = nowIso();

  if (!existing) {
    await runStatement(
      `
        INSERT INTO subscriptions (
          id, orderId, providerSubscriptionId, cycle, value, nextDueDate,
          status, billingType, rawPayload, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        subscription.id,
        subscription.orderId,
        subscription.providerSubscriptionId,
        subscription.cycle,
        subscription.value,
        subscription.nextDueDate,
        subscription.status,
        subscription.billingType,
        subscription.rawPayload,
        timestamp,
        timestamp,
      ],
    );
  } else {
    await runStatement(
      `
        UPDATE subscriptions
        SET cycle = ?, value = ?, nextDueDate = ?, status = ?, billingType = ?,
            rawPayload = ?, updatedAt = ?
        WHERE providerSubscriptionId = ?
      `,
      [
        subscription.cycle,
        subscription.value,
        subscription.nextDueDate,
        subscription.status,
        subscription.billingType,
        subscription.rawPayload,
        timestamp,
        subscription.providerSubscriptionId,
      ],
    );
  }

  return getSubscriptionByProviderId(subscription.providerSubscriptionId);
}

export async function getSubscriptionByProviderId(providerSubscriptionId: string) {
  return firstStatement<SubscriptionRecord>(
    "SELECT * FROM subscriptions WHERE providerSubscriptionId = ?",
    [providerSubscriptionId],
  );
}

export async function getSubscriptionByOrderId(orderId: string) {
  return firstStatement<SubscriptionRecord>(
    "SELECT * FROM subscriptions WHERE orderId = ? ORDER BY createdAt DESC LIMIT 1",
    [orderId],
  );
}
