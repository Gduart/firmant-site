import { getEnvValue } from "@/lib/cloudflare-runtime";
import { recordAuditEvent } from "@/lib/workflow/audit";
import { addDaysIso, workflowAll, workflowFirst, workflowNow, workflowRun } from "@/lib/workflow/db";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/workflow/tokens";
import type { AssetType, ReviewFeedbackInput, StoredPreviewInput } from "@/lib/reviews/types";

type ProjectRecord = { id: string; project_number: string; proposal_id: string; name: string; status: string; revisions_included: number; revisions_used: number; created_at: string; updated_at: string; client_name?: string; client_email?: string; assets_count?: number };
type AssetRecord = { id: string; project_id: string; title: string; asset_type: AssetType; status: string; current_version_id: string | null; created_at: string; updated_at: string };
type VersionRecord = { id: string; asset_id: string; version_number: number; preview_storage_key: string | null; master_storage_key: string | null; mime_type: string | null; size_bytes: number | null; caption: string | null; duration_ms: number | null; processing_status: string; created_at: string; created_by: string };
type ItemRecord = { id: string; asset_version_id: string; position: number; preview_storage_key: string; master_storage_key: string | null; mime_type: string; size_bytes: number; created_at: string };
type ReviewLinkRecord = { id: string; project_id: string; asset_version_id: string; active: number; expires_at: string; max_views: number | null; view_count: number };
type RoundRecord = { id: string; project_id: string; asset_id: string; asset_version_id: string; round_number: number; status: string; counts_toward_limit: number; opened_at: string; submitted_at: string | null };

export async function listReviewProjects() {
  return workflowAll<ProjectRecord>(
    `SELECT pr.*, p.client_name, p.client_email,
      (SELECT COUNT(*) FROM assets a WHERE a.project_id = pr.id AND a.status != 'ARCHIVED') AS assets_count
     FROM projects pr JOIN proposals p ON p.id = pr.proposal_id
     ORDER BY pr.updated_at DESC LIMIT 200`,
  );
}

export async function getReviewProject(projectId: string) {
  const project = await workflowFirst<ProjectRecord & { proposal_number: string; client_name: string; client_email: string }>(
    `SELECT pr.*, p.proposal_number, p.client_name, p.client_email
     FROM projects pr JOIN proposals p ON p.id = pr.proposal_id WHERE pr.id = ?`,
    [projectId],
  );
  if (!project) return null;
  const assets = await workflowAll<AssetRecord & { version_number: number | null; caption: string | null; mime_type: string | null; review_expires_at: string | null; review_views: number | null }>(
    `SELECT a.*, av.version_number, av.caption, av.mime_type,
      (SELECT rl.expires_at FROM review_links rl WHERE rl.asset_version_id = av.id AND rl.active = 1 ORDER BY rl.created_at DESC LIMIT 1) AS review_expires_at,
      (SELECT rl.view_count FROM review_links rl WHERE rl.asset_version_id = av.id AND rl.active = 1 ORDER BY rl.created_at DESC LIMIT 1) AS review_views
     FROM assets a LEFT JOIN asset_versions av ON av.id = a.current_version_id
     WHERE a.project_id = ? ORDER BY a.updated_at DESC`,
    [projectId],
  );
  return { project, assets };
}

export async function createAssetVersion(input: {
  projectId: string;
  assetId?: string;
  title: string;
  assetType: AssetType;
  caption?: string;
  durationMs?: number | null;
  files: StoredPreviewInput[];
  createdBy: string;
}) {
  const project = await workflowFirst<ProjectRecord>("SELECT * FROM projects WHERE id = ?", [input.projectId]);
  if (!project) throw new Error("Projeto não encontrado.");
  validateFiles(input.assetType, input.files);
  const now = workflowNow();
  let asset: AssetRecord | null = null;
  if (input.assetId) {
    asset = await workflowFirst<AssetRecord>("SELECT * FROM assets WHERE id = ? AND project_id = ?", [input.assetId, input.projectId]);
    if (!asset) throw new Error("Conteúdo não encontrado.");
    if (asset.asset_type !== input.assetType) throw new Error("O tipo não pode mudar entre versões.");
  }
  const assetId = asset?.id ?? crypto.randomUUID();
  if (!asset) {
    await workflowRun(
      "INSERT INTO assets (id, project_id, title, asset_type, status, current_version_id, created_at, updated_at) VALUES (?, ?, ?, ?, 'PREPARING', NULL, ?, ?)",
      [assetId, input.projectId, input.title.trim(), input.assetType, now, now],
    );
  }
  const previous = await workflowFirst<{ latest: number }>(
    "SELECT COALESCE(MAX(version_number), 0) AS latest FROM asset_versions WHERE asset_id = ?",
    [assetId],
  );
  const versionNumber = (previous?.latest ?? 0) + 1;
  const versionId = crypto.randomUUID();
  const single = input.assetType === "CAROUSEL" ? null : input.files[0];
  await workflowRun(
    `INSERT INTO asset_versions (id, asset_id, version_number, preview_storage_key, master_storage_key,
      mime_type, size_bytes, caption, duration_ms, processing_status, created_at, created_by)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, 'READY', ?, ?)`,
    [versionId, assetId, versionNumber, single?.storageKey ?? null, single?.mimeType ?? null, single?.sizeBytes ?? null, input.caption?.trim() || null, input.durationMs ?? null, now, input.createdBy],
  );
  if (input.assetType === "CAROUSEL") {
    for (const file of input.files) {
      await workflowRun(
        `INSERT INTO asset_version_items (id, asset_version_id, position, preview_storage_key, master_storage_key, mime_type, size_bytes, created_at)
         VALUES (?, ?, ?, ?, NULL, ?, ?, ?)`,
        [crypto.randomUUID(), versionId, file.position, file.storageKey, file.mimeType, file.sizeBytes, now],
      );
    }
  }
  await workflowRun(
    `UPDATE assets SET title = ?, current_version_id = ?, status = ?, updated_at = ? WHERE id = ?`,
    [input.title.trim(), versionId, versionNumber > 1 ? "RESENT" : "PREPARING", now, assetId],
  );
  await workflowRun(
    "UPDATE review_links SET active = 0, revoked_at = ? WHERE asset_version_id IN (SELECT id FROM asset_versions WHERE asset_id = ?) AND active = 1",
    [now, assetId],
  );
  await workflowRun("UPDATE projects SET status = 'WAITING_CLIENT', updated_at = ? WHERE id = ?", [now, input.projectId]);
  await recordAuditEvent({ entityType: "ASSET", entityId: assetId, eventType: versionNumber > 1 ? "ASSET_VERSION_CREATED" : "ASSET_CREATED", actorType: "ADMIN", actorId: input.createdBy, metadata: { projectId: input.projectId, versionId, versionNumber, assetType: input.assetType } });
  return { assetId, versionId, versionNumber };
}

export async function publishReviewLink(input: { assetId: string; createdBy: string }) {
  const asset = await workflowFirst<AssetRecord>("SELECT * FROM assets WHERE id = ?", [input.assetId]);
  if (!asset?.current_version_id) throw new Error("Conteúdo sem versão pronta.");
  const version = await workflowFirst<VersionRecord>("SELECT * FROM asset_versions WHERE id = ? AND processing_status = 'READY'", [asset.current_version_id]);
  if (!version) throw new Error("A versão ainda não está pronta.");
  const now = workflowNow();
  await workflowRun(
    "UPDATE review_links SET active = 0, revoked_at = ? WHERE asset_version_id IN (SELECT id FROM asset_versions WHERE asset_id = ?) AND active = 1",
    [now, asset.id],
  );
  const token = createOpaqueToken();
  const ttlDays = Math.max(1, Number(await getEnvValue("REVIEW_LINK_TTL_DAYS") ?? 14));
  const expiresAt = addDaysIso(now, ttlDays);
  const linkId = crypto.randomUUID();
  await workflowRun(
    `INSERT INTO review_links (id, project_id, asset_version_id, token_hash, active, expires_at, max_views, view_count, first_viewed_at, last_viewed_at, created_at, revoked_at)
     VALUES (?, ?, ?, ?, 1, ?, NULL, 0, NULL, NULL, ?, NULL)`,
    [linkId, asset.project_id, version.id, await hashOpaqueToken(token), expiresAt, now],
  );
  const priorRounds = await workflowFirst<{ count: number }>("SELECT COUNT(*) AS count FROM review_rounds WHERE asset_id = ?", [asset.id]);
  await workflowRun(
    "UPDATE review_rounds SET status = 'RESOLVED', resolved_at = ? WHERE asset_id = ? AND status = 'OPEN'",
    [now, asset.id],
  );
  await workflowRun(
    `INSERT INTO review_rounds (id, project_id, asset_id, asset_version_id, round_number, status, counts_toward_limit, opened_at, submitted_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, 'OPEN', 1, ?, NULL, NULL)`,
    [crypto.randomUUID(), asset.project_id, asset.id, version.id, (priorRounds?.count ?? 0) + 1, now],
  );
  await workflowRun("UPDATE assets SET status = 'AWAITING_REVIEW', updated_at = ? WHERE id = ?", [now, asset.id]);
  await recordAuditEvent({ entityType: "ASSET", entityId: asset.id, eventType: "REVIEW_LINK_PUBLISHED", actorType: "ADMIN", actorId: input.createdBy, metadata: { versionId: version.id, expiresAt } });
  const baseUrl = await getEnvValue("APP_BASE_URL") ?? "";
  return { publicUrl: `${baseUrl.replace(/\/$/, "")}/review/${token}`, expiresAt };
}

export async function getPublicReview(token: string, markViewed = true) {
  if (!token || token.length < 32) return null;
  const link = await workflowFirst<ReviewLinkRecord>("SELECT * FROM review_links WHERE token_hash = ? AND active = 1", [await hashOpaqueToken(token)]);
  if (!link) return null;
  if (new Date(link.expires_at).getTime() < Date.now()) return { expired: true as const, link };
  if (link.max_views != null && link.view_count >= link.max_views) return { expired: true as const, link };
  const version = await workflowFirst<VersionRecord>("SELECT * FROM asset_versions WHERE id = ?", [link.asset_version_id]);
  if (!version) return null;
  const asset = await workflowFirst<AssetRecord>("SELECT * FROM assets WHERE id = ?", [version.asset_id]);
  if (!asset) return null;
  const project = await workflowFirst<ProjectRecord & { client_name: string; client_email: string }>(
    `SELECT pr.*, p.client_name, p.client_email FROM projects pr JOIN proposals p ON p.id = pr.proposal_id WHERE pr.id = ?`,
    [link.project_id],
  );
  if (!project) return null;
  const [items, round, approval, feedback] = await Promise.all([
    workflowAll<ItemRecord>("SELECT * FROM asset_version_items WHERE asset_version_id = ? ORDER BY position", [version.id]),
    workflowFirst<RoundRecord>("SELECT * FROM review_rounds WHERE asset_version_id = ? ORDER BY round_number DESC LIMIT 1", [version.id]),
    workflowFirst<{ id: string; approver_name: string; approved_at: string }>("SELECT id, approver_name, approved_at FROM approvals WHERE asset_version_id = ?", [version.id]),
    workflowAll<{ id: string; feedback_type: string; body: string; timestamp_ms: number | null; carousel_position: number | null; author_name: string; created_at: string }>(
      `SELECT rf.id, rf.feedback_type, rf.body, rf.timestamp_ms, rf.carousel_position, rf.author_name, rf.created_at
       FROM review_feedback rf JOIN review_rounds rr ON rr.id = rf.review_round_id WHERE rr.asset_version_id = ? ORDER BY rf.created_at`,
      [version.id],
    ),
  ]);
  if (!round) return null;
  if (markViewed) {
    const now = workflowNow();
    await workflowRun("UPDATE review_links SET view_count = view_count + 1, first_viewed_at = COALESCE(first_viewed_at, ?), last_viewed_at = ? WHERE id = ?", [now, now, link.id]);
  }
  return { expired: false as const, link, project, asset, version: publicVersion(version), items: items.map(publicItem), round, approval: approval ?? null, feedback };
}

export async function decideReview(input: { token: string; decision: "APPROVED" | "REVISION_REQUESTED"; authorName: string; authorEmail: string; confirmationText: string; feedback: ReviewFeedbackInput[]; ipAddress?: string | null; userAgent?: string | null }) {
  const review = await getPublicReview(input.token, false);
  if (!review || review.expired || !review.round || !review.asset || !review.version || !review.project) throw new Error("Revisão inválida ou expirada.");
  if (review.round.status !== "OPEN") throw new Error("Esta rodada já possui uma decisão registrada.");
  if (!input.authorName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.authorEmail.trim())) throw new Error("Informe nome e e-mail válidos.");
  const now = workflowNow();
  if (input.decision === "APPROVED") {
    await workflowRun(
      `INSERT INTO approvals (id, project_id, asset_id, asset_version_id, approver_name, approver_email, confirmation_text, ip_address, user_agent, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), review.project.id, review.asset.id, review.version.id, input.authorName.trim(), input.authorEmail.trim().toLowerCase(), input.confirmationText, input.ipAddress ?? null, input.userAgent ?? null, now],
    );
    await workflowRun("UPDATE review_rounds SET status = 'APPROVED', submitted_at = ?, resolved_at = ? WHERE id = ?", [now, now, review.round.id]);
    await workflowRun("UPDATE assets SET status = 'APPROVED', updated_at = ? WHERE id = ?", [now, review.asset.id]);
    const remaining = await workflowFirst<{ count: number }>(
      "SELECT COUNT(*) AS count FROM assets WHERE project_id = ? AND id != ? AND status NOT IN ('APPROVED', 'ARCHIVED')",
      [review.project.id, review.asset.id],
    );
    await workflowRun(
      "UPDATE projects SET status = ?, updated_at = ? WHERE id = ?",
      [(remaining?.count ?? 0) === 0 ? "APPROVED" : "WAITING_CLIENT", now, review.project.id],
    );
  } else {
    const feedback = input.feedback.filter((item) => item.body.trim());
    if (!feedback.length) throw new Error("Descreva ao menos um ajuste solicitado.");
    for (const item of feedback) {
      await workflowRun(
        `INSERT INTO review_feedback (id, review_round_id, feedback_type, body, timestamp_ms, carousel_position, author_name, author_email, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), review.round.id, item.type, item.body.trim(), item.timestampMs ?? null, item.carouselPosition ?? null, input.authorName.trim(), input.authorEmail.trim().toLowerCase(), input.ipAddress ?? null, input.userAgent ?? null, now],
      );
    }
    await workflowRun("UPDATE review_rounds SET status = 'SUBMITTED', submitted_at = ? WHERE id = ?", [now, review.round.id]);
    await workflowRun("UPDATE assets SET status = 'REVISION_REQUESTED', updated_at = ? WHERE id = ?", [now, review.asset.id]);
    await workflowRun("UPDATE projects SET status = 'REVISION_REQUESTED', revisions_used = revisions_used + 1, updated_at = ? WHERE id = ?", [now, review.project.id]);
  }
  await recordAuditEvent({ entityType: "ASSET", entityId: review.asset.id, eventType: input.decision === "APPROVED" ? "ASSET_APPROVED" : "REVISION_REQUESTED", actorType: "CLIENT", actorId: input.authorEmail.trim().toLowerCase(), ipAddress: input.ipAddress, userAgent: input.userAgent, metadata: { versionId: review.version.id, roundId: review.round.id, feedbackCount: input.feedback.length } });
  return { decision: input.decision };
}

export async function getReviewMedia(token: string, itemId?: string) {
  if (!token || token.length < 32) return null;
  const link = await workflowFirst<ReviewLinkRecord>("SELECT * FROM review_links WHERE token_hash = ? AND active = 1", [await hashOpaqueToken(token)]);
  if (!link || new Date(link.expires_at).getTime() < Date.now()) return null;
  const version = await workflowFirst<VersionRecord>("SELECT * FROM asset_versions WHERE id = ?", [link.asset_version_id]);
  if (!version) return null;
  if (itemId) {
    const item = await workflowFirst<ItemRecord>("SELECT * FROM asset_version_items WHERE id = ? AND asset_version_id = ?", [itemId, version.id]);
    return item ? { storageKey: item.preview_storage_key, mimeType: item.mime_type, sizeBytes: item.size_bytes } : null;
  }
  return version.preview_storage_key
    ? { storageKey: version.preview_storage_key, mimeType: version.mime_type ?? "application/octet-stream", sizeBytes: version.size_bytes ?? 0 }
    : null;
}

function publicVersion(version: VersionRecord) { return { id: version.id, versionNumber: version.version_number, mimeType: version.mime_type, sizeBytes: version.size_bytes, caption: version.caption, durationMs: version.duration_ms, createdAt: version.created_at }; }
function publicItem(item: ItemRecord) { return { id: item.id, position: item.position, mimeType: item.mime_type, sizeBytes: item.size_bytes }; }
function validateFiles(type: AssetType, files: StoredPreviewInput[]) { if (!files.length) throw new Error("Envie ao menos um arquivo."); if (type !== "CAROUSEL" && files.length !== 1) throw new Error("Imagem e vídeo aceitam um arquivo por versão."); if (type === "CAROUSEL" && (files.length < 2 || files.length > 20)) throw new Error("O carrossel deve ter entre 2 e 20 imagens."); }
