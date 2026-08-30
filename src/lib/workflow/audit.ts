import { workflowNow, workflowRun } from "@/lib/workflow/db";

export async function recordAuditEvent(input: {
  entityType: string;
  entityId: string;
  eventType: string;
  actorType: "ADMIN" | "CLIENT" | "SYSTEM" | "WEBHOOK";
  actorId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}) {
  await workflowRun(
    `
      INSERT INTO audit_events (
        id, entity_type, entity_id, event_type, actor_type, actor_id,
        ip_address, user_agent, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),
      input.entityType,
      input.entityId,
      input.eventType,
      input.actorType,
      input.actorId ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.metadata === undefined ? null : JSON.stringify(input.metadata),
      workflowNow(),
    ],
  );
}
