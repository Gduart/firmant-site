import { getEnvValue } from "@/lib/cloudflare-runtime";
import type {
  BriefingAttachmentRecord,
  BriefingDraftInput,
  BriefingRecord,
} from "@/lib/briefings/types";
import { recordAuditEvent } from "@/lib/workflow/audit";
import {
  addDaysIso,
  workflowAll,
  workflowFirst,
  workflowNow,
  workflowRun,
} from "@/lib/workflow/db";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/workflow/tokens";

const MAX_BRIEFINGS = 300;

export async function createBriefingLink(input: {
  responsibleName?: string;
  email?: string;
  createdBy: string;
}) {
  const id = crypto.randomUUID();
  const token = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(token);
  const now = workflowNow();
  const configuredDays = Number(await getEnvValue("BRIEFING_LINK_TTL_DAYS"));
  const ttlDays = Number.isFinite(configuredDays) && configuredDays > 0
    ? Math.min(configuredDays, 90)
    : 14;
  const referenceNumber = buildReferenceNumber("BRF");

  await workflowRun(
    `
      INSERT INTO briefing_requests (
        id, reference_number, access_token_hash, status, responsible_name,
        email, link_expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?)
    `,
    [
      id,
      referenceNumber,
      tokenHash,
      clean(input.responsibleName),
      cleanEmail(input.email),
      addDaysIso(now, ttlDays),
      now,
      now,
    ],
  );
  await recordAuditEvent({
    entityType: "BRIEFING",
    entityId: id,
    eventType: "BRIEFING_LINK_CREATED",
    actorType: "ADMIN",
    actorId: input.createdBy,
  });

  return {
    briefing: await getBriefingById(id),
    token,
  };
}

export async function listBriefings(params: { status?: string; q?: string }) {
  const clauses: string[] = [];
  const values: Array<string | number | null> = [];
  const currentTime = workflowNow();

  if (params.status) {
    clauses.push("b.status = ?");
    values.push(params.status);
  }

  if (params.q?.trim()) {
    const query = `%${params.q.trim()}%`;
    clauses.push(`(
      b.reference_number LIKE ? OR IFNULL(b.responsible_name, '') LIKE ?
      OR IFNULL(b.email, '') LIKE ? OR IFNULL(b.project_name, '') LIKE ?
      OR IFNULL(b.brand_name, '') LIKE ?
    )`);
    values.push(query, query, query, query, query);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return workflowAll<BriefingRecord & { attachments_count: number }>(
    `
      SELECT b.*,
        (SELECT COUNT(*) FROM briefing_attachments a
         WHERE a.briefing_id = b.id AND a.status = 'READY' AND a.expires_at > ?) AS attachments_count
      FROM briefing_requests b
      ${where}
      ORDER BY b.created_at DESC
      LIMIT ${MAX_BRIEFINGS}
    `,
    [currentTime, ...values],
  );
}

export async function getBriefingById(id: string) {
  return workflowFirst<BriefingRecord>(
    "SELECT * FROM briefing_requests WHERE id = ? LIMIT 1",
    [id],
  );
}

export async function getBriefingDetailsById(id: string) {
  const briefing = await getBriefingById(id);
  if (!briefing) return null;
  return {
    briefing,
    attachments: await listBriefingAttachments(id),
  };
}

export async function getBriefingByToken(token: string) {
  if (!token || token.length < 32) return null;
  const tokenHash = await hashOpaqueToken(token);
  return workflowFirst<BriefingRecord>(
    "SELECT * FROM briefing_requests WHERE access_token_hash = ? LIMIT 1",
    [tokenHash],
  );
}

export async function getPublicBriefing(token: string) {
  const briefing = await getBriefingByToken(token);
  if (!briefing) return null;
  return {
    briefing: toPublicBriefing(briefing),
    attachments: (await listBriefingAttachments(briefing.id)).map(
      toPublicAttachment,
    ),
  };
}

export async function saveBriefingDraft(
  briefing: BriefingRecord,
  input: BriefingDraftInput,
) {
  if (briefing.status !== "DRAFT" && briefing.status !== "NEEDS_INFORMATION") {
    throw new Error("Este briefing já foi enviado e não pode mais ser alterado.");
  }

  if (new Date(briefing.link_expires_at).getTime() < Date.now()) {
    throw new Error("Este link de briefing expirou.");
  }

  const now = workflowNow();
  await workflowRun(
    `
      UPDATE briefing_requests SET
        client_type = ?, legal_name = ?, trade_name = ?, tax_id = ?,
        responsible_name = ?, responsible_role = ?, email = ?, billing_email = ?,
        whatsapp = ?, address = ?, address_number = ?, address_complement = ?,
        province = ?, postal_code = ?, city = ?, state = ?, site = ?, instagram = ?,
        project_name = ?, brand_name = ?, request_type = ?, content_types_json = ?,
        formats_json = ?, platforms_json = ?, quantity = ?, duration = ?,
        scope_description = ?, deadline_requested = ?, budget_range = ?,
        payment_preferences_json = ?, additional_notes = ?, privacy_consent = ?,
        last_saved_at = ?, updated_at = ?
      WHERE id = ?
    `,
    [
      input.clientType ?? null,
      clean(input.legalName),
      clean(input.tradeName),
      digits(input.taxId),
      clean(input.responsibleName),
      clean(input.responsibleRole),
      cleanEmail(input.email),
      cleanEmail(input.billingEmail),
      digits(input.whatsapp),
      clean(input.address),
      clean(input.addressNumber),
      clean(input.addressComplement),
      clean(input.province),
      digits(input.postalCode),
      clean(input.city),
      clean(input.state)?.slice(0, 2).toUpperCase() ?? null,
      clean(input.site),
      clean(input.instagram)?.replace(/^@/, "") ?? null,
      clean(input.projectName),
      clean(input.brandName),
      clean(input.requestType),
      jsonStringArray(input.contentTypes),
      jsonStringArray(input.formats),
      jsonStringArray(input.platforms),
      typeof input.quantity === "number" ? Math.max(1, Math.round(input.quantity)) : null,
      clean(input.duration),
      clean(input.scopeDescription),
      clean(input.deadlineRequested),
      clean(input.budgetRange),
      jsonStringArray(input.paymentPreferences),
      clean(input.additionalNotes),
      input.privacyConsent ? 1 : 0,
      now,
      now,
      briefing.id,
    ],
  );

  return getBriefingById(briefing.id);
}

export async function submitBriefing(briefing: BriefingRecord) {
  const current = await getBriefingById(briefing.id);
  if (!current) throw new Error("Briefing não encontrado.");
  validateSubmission(current);
  const now = workflowNow();

  await workflowRun(
    `UPDATE briefing_requests
     SET status = 'SUBMITTED', submitted_at = ?, updated_at = ? WHERE id = ?`,
    [now, now, current.id],
  );
  await recordAuditEvent({
    entityType: "BRIEFING",
    entityId: current.id,
    eventType: "BRIEFING_SUBMITTED",
    actorType: "CLIENT",
    actorId: current.email,
  });
  return getBriefingById(current.id);
}

export async function listBriefingAttachments(briefingId: string) {
  return workflowAll<BriefingAttachmentRecord>(
    `SELECT * FROM briefing_attachments
     WHERE briefing_id = ? AND status = 'READY' AND expires_at > ?
     ORDER BY uploaded_at ASC`,
    [briefingId, workflowNow()],
  );
}

export async function addBriefingAttachment(input: {
  briefingId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}) {
  const count = await workflowFirst<{ total: number }>(
    `SELECT COUNT(*) AS total FROM briefing_attachments
     WHERE briefing_id = ? AND status = 'READY' AND expires_at > ?`,
    [input.briefingId, workflowNow()],
  );
  if ((count?.total ?? 0) >= 10) {
    throw new Error("O limite de 10 imagens por briefing foi atingido.");
  }

  const id = crypto.randomUUID();
  const now = workflowNow();
  await workflowRun(
    `
      INSERT INTO briefing_attachments (
        id, briefing_id, storage_key, original_filename, mime_type,
        size_bytes, sha256, status, uploaded_at, expires_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'READY', ?, ?, NULL)
    `,
    [
      id,
      input.briefingId,
      input.storageKey,
      input.originalFilename,
      input.mimeType,
      input.sizeBytes,
      input.sha256,
      now,
      addDaysIso(now, 7),
    ],
  );
  await recordAuditEvent({
    entityType: "BRIEFING",
    entityId: input.briefingId,
    eventType: "BRIEFING_ATTACHMENT_UPLOADED",
    actorType: "CLIENT",
    metadata: { attachmentId: id, sizeBytes: input.sizeBytes },
  });
  return workflowFirst<BriefingAttachmentRecord>(
    "SELECT * FROM briefing_attachments WHERE id = ?",
    [id],
  );
}

export async function getBriefingAttachment(id: string, briefingId: string) {
  return workflowFirst<BriefingAttachmentRecord>(
    `SELECT * FROM briefing_attachments
     WHERE id = ? AND briefing_id = ? AND status = 'READY' AND expires_at > ? LIMIT 1`,
    [id, briefingId, workflowNow()],
  );
}

export async function markBriefingAttachmentDeleted(id: string, briefingId: string) {
  const now = workflowNow();
  await workflowRun(
    `UPDATE briefing_attachments
     SET status = 'DELETED', deleted_at = ?
     WHERE id = ? AND briefing_id = ? AND status = 'READY'`,
    [now, id, briefingId],
  );
  await recordAuditEvent({
    entityType: "BRIEFING",
    entityId: briefingId,
    eventType: "BRIEFING_ATTACHMENT_DELETED",
    actorType: "CLIENT",
    metadata: { attachmentId: id },
  });
}

export function toPublicBriefing(briefing: BriefingRecord) {
  const safe = { ...briefing } as Partial<BriefingRecord>;
  delete safe.access_token_hash;
  return {
    ...safe,
    contentTypes: parseStringArray(briefing.content_types_json),
    formats: parseStringArray(briefing.formats_json),
    platforms: parseStringArray(briefing.platforms_json),
    paymentPreferences: parseStringArray(briefing.payment_preferences_json),
  };
}

function toPublicAttachment(attachment: BriefingAttachmentRecord) {
  const safe = { ...attachment } as Partial<BriefingAttachmentRecord>;
  delete safe.storage_key;
  delete safe.sha256;
  return safe;
}

function validateSubmission(briefing: BriefingRecord) {
  if (!briefing.responsible_name || !briefing.email || !briefing.whatsapp) {
    throw new Error("Preencha responsável, e-mail e WhatsApp.");
  }
  if (!briefing.tax_id || !briefing.address || !briefing.address_number
    || !briefing.province || !briefing.postal_code || !briefing.city || !briefing.state) {
    throw new Error("Preencha CPF/CNPJ e o endereço completo para a proposta e cobrança.");
  }
  if (!briefing.project_name || !briefing.scope_description) {
    throw new Error("Preencha o nome do projeto e descreva a necessidade.");
  }
  if (!briefing.privacy_consent) {
    throw new Error("É necessário aceitar o tratamento dos dados do briefing.");
  }
}

function clean(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 5000) : null;
}

function cleanEmail(value?: string) {
  const normalized = clean(value)?.toLowerCase() ?? null;
  return normalized?.slice(0, 254) ?? null;
}

function digits(value?: string) {
  return value?.replace(/\D/g, "") || null;
}

function jsonStringArray(values?: string[]) {
  return JSON.stringify(
    Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, 30),
  );
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function buildReferenceNumber(prefix: string) {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${prefix}-${year}-${suffix}`;
}
