import type { WebhookEventRecord } from "@/lib/payments/types";
import {
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";

export async function getWebhookEventByProviderEventId(providerEventId: string) {
  return firstStatement<WebhookEventRecord>(
    "SELECT * FROM webhook_events WHERE providerEventId = ?",
    [providerEventId],
  );
}

export async function insertWebhookEvent(event: Omit<WebhookEventRecord, "receivedAt" | "processedAt">) {
  const timestamp = nowIso();

  await runStatement(
    `
      INSERT INTO webhook_events (
        id, provider, providerEventId, eventType, receivedAt, processedAt,
        isDuplicate, payload, processingResult
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      event.id,
      event.provider,
      event.providerEventId,
      event.eventType,
      timestamp,
      null,
      event.isDuplicate,
      event.payload,
      event.processingResult,
    ],
  );

  return getWebhookEventByProviderEventId(event.providerEventId);
}

export async function markWebhookEventProcessed(
  providerEventId: string,
  processingResult: string,
) {
  await runStatement(
    `
      UPDATE webhook_events
      SET processedAt = ?, processingResult = ?
      WHERE providerEventId = ?
    `,
    [nowIso(), processingResult, providerEventId],
  );

  return getWebhookEventByProviderEventId(providerEventId);
}
