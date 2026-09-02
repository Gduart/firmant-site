import { getEnvValue } from "@/lib/cloudflare-runtime";
import { getBriefingById } from "@/lib/briefings/repository";
import { recordAuditEvent } from "@/lib/workflow/audit";
import {
  addDaysIso,
  workflowAll,
  workflowFirst,
  workflowNow,
  workflowRun,
} from "@/lib/workflow/db";
import {
  createOpaqueToken,
  decryptOpaqueToken,
  encryptOpaqueToken,
  hashOpaqueToken,
} from "@/lib/workflow/tokens";
import type {
  PaymentMilestoneInput,
  ProposalEditorInput,
  ProposalItemInput,
  ProposalItemRecord,
  ProposalMilestoneRecord,
  ProposalRecord,
  ProposalSnapshot,
} from "@/lib/proposals/types";

type ProposalVersionRecord = {
  id: string;
  proposal_id: string;
  version_number: number;
  snapshot_json: string;
  content_hash: string;
  terms_version: string;
  created_at: string;
};

type ProposalLinkRecord = {
  id: string;
  proposal_id: string;
  proposal_version_id: string;
  token_hash: string;
  token_ciphertext: string | null;
  active: number;
  expires_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  created_at: string;
  revoked_at: string | null;
  version_number?: number;
};

type PublicProposalAsset = {
  id: string;
  title: string;
  assetType: "IMAGE" | "CAROUSEL" | "VIDEO";
  status: string;
  versionNumber: number;
  caption: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
};

const TERMS_VERSION = "TERMOS_PROPOSTA_V1";

export async function createProposalFromBriefing(input: {
  briefingId: string;
  createdBy: string;
}) {
  const briefing = await getBriefingById(input.briefingId);
  if (!briefing) throw new Error("Briefing não encontrado.");

  const existing = await workflowFirst<ProposalRecord>(
    "SELECT * FROM proposals WHERE briefing_id = ? ORDER BY created_at DESC LIMIT 1",
    [briefing.id],
  );
  if (existing) return getProposalDetails(existing.id);

  const id = crypto.randomUUID();
  const now = workflowNow();
  const clientName = briefing.trade_name
    ?? briefing.legal_name
    ?? briefing.responsible_name
    ?? "Cliente";
  const projectName = briefing.project_name ?? `Projeto ${briefing.reference_number}`;

  await workflowRun(
    `
      INSERT INTO proposals (
        id, proposal_number, briefing_id, customer_id, project_name,
        client_name, client_email, status, summary, scope, included_json,
        excluded_json, revisions_included, revision_definition,
        estimated_deadline, license_terms, cancellation_terms,
        payment_methods_json, currency, total_cents, validity_days,
        valid_until, current_version, created_at, updated_at, sent_at, accepted_at
      ) VALUES (?, ?, ?, NULL, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, 2, ?, ?, ?, ?, ?, 'BRL', 0, 10, NULL, 0, ?, ?, NULL, NULL)
    `,
    [
      id,
      buildReferenceNumber("FIR"),
      briefing.id,
      projectName,
      clientName,
      briefing.email ?? "",
      `Proposta comercial para ${projectName}, preparada a partir do briefing ${briefing.reference_number}.`,
      briefing.scope_description ?? "",
      JSON.stringify(defaultIncluded()),
      JSON.stringify(defaultExcluded()),
      defaultRevisionDefinition(),
      briefing.deadline_requested,
      defaultLicenseTerms(),
      defaultCancellationTerms(),
      JSON.stringify(normalizePaymentPreferences(briefing.payment_preferences_json)),
      now,
      now,
    ],
  );
  await insertProposalItems(id, [{
    name: projectName,
    description: briefing.scope_description ?? "Serviço personalizado FIRMANT",
    quantity: 1,
    unit: "projeto",
    unitPriceCents: 0,
  }], now);
  await insertMilestones(id, [
    { type: "DEPOSIT", label: "Entrada de 50% para iniciar o projeto", percentageBasisPoints: 5000, amountCents: 0, dueTrigger: "Após o aceite da proposta" },
    { type: "BALANCE", label: "Saldo final de 50%", percentageBasisPoints: 5000, amountCents: 0, dueTrigger: "Após a aprovação, antes da entrega final" },
  ], now);
  await recordAuditEvent({
    entityType: "PROPOSAL",
    entityId: id,
    eventType: "PROPOSAL_CREATED_FROM_BRIEFING",
    actorType: "ADMIN",
    actorId: input.createdBy,
    metadata: { briefingId: briefing.id },
  });
  return getProposalDetails(id);
}

export async function listProposals(params: { q?: string; status?: string }) {
  const clauses: string[] = [];
  const values: Array<string | number | null> = [];
  if (params.status) {
    clauses.push("p.status = ?");
    values.push(params.status);
  }
  if (params.q?.trim()) {
    const q = `%${params.q.trim()}%`;
    clauses.push("(p.proposal_number LIKE ? OR p.project_name LIKE ? OR p.client_name LIKE ? OR p.client_email LIKE ?)");
    values.push(q, q, q, q);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return workflowAll<ProposalRecord & {
    deposit_status: string | null;
    deposit_paid_at: string | null;
    link_active: number | null;
    link_expires_at: string | null;
  }>(
    `SELECT p.*,
      (SELECT pm.status FROM proposal_payment_milestones pm
       WHERE pm.proposal_id = p.id ORDER BY pm.position LIMIT 1) AS deposit_status,
      (SELECT pm.paid_at FROM proposal_payment_milestones pm
       WHERE pm.proposal_id = p.id ORDER BY pm.position LIMIT 1) AS deposit_paid_at
      ,(SELECT pal.active FROM proposal_access_links pal
        WHERE pal.proposal_id = p.id ORDER BY pal.created_at DESC LIMIT 1) AS link_active
      ,(SELECT pal.expires_at FROM proposal_access_links pal
        WHERE pal.proposal_id = p.id ORDER BY pal.created_at DESC LIMIT 1) AS link_expires_at
     FROM proposals p ${where} ORDER BY p.created_at DESC LIMIT 300`,
    values,
  );
}

export async function getProposalDetails(id: string) {
  const proposal = await workflowFirst<ProposalRecord>(
    "SELECT * FROM proposals WHERE id = ? LIMIT 1",
    [id],
  );
  if (!proposal) return null;
  const [items, milestones, versions, project, accessLink] = await Promise.all([
    listProposalItems(id),
    listProposalMilestones(id),
    workflowAll<ProposalVersionRecord>(
      "SELECT * FROM proposal_versions WHERE proposal_id = ? ORDER BY version_number DESC",
      [id],
    ),
    workflowFirst<{ id: string; project_number: string; status: string }>(
      "SELECT id, project_number, status FROM projects WHERE proposal_id = ? LIMIT 1",
      [id],
    ),
    workflowFirst<ProposalLinkRecord>(
      `SELECT pal.*, pv.version_number
       FROM proposal_access_links pal
       JOIN proposal_versions pv ON pv.id = pal.proposal_version_id
       WHERE pal.proposal_id = ? ORDER BY pal.created_at DESC LIMIT 1`,
      [id],
    ),
  ]);
  const publicToken = accessLink?.token_ciphertext
    ? await decryptOpaqueToken(accessLink.token_ciphertext)
    : null;
  const baseUrl = publicToken ? await getEnvValue("APP_BASE_URL") : null;
  return {
    proposal: toEditableProposal(proposal),
    project: project ?? null,
    items,
    milestones,
    accessLink: accessLink ? {
      id: accessLink.id,
      proposal_version_id: accessLink.proposal_version_id,
      version_number: accessLink.version_number ?? proposal.current_version,
      active: accessLink.active === 1,
      expires_at: accessLink.expires_at,
      expired: new Date(accessLink.expires_at).getTime() < Date.now(),
      first_viewed_at: accessLink.first_viewed_at,
      last_viewed_at: accessLink.last_viewed_at,
      view_count: accessLink.view_count,
      created_at: accessLink.created_at,
      revoked_at: accessLink.revoked_at,
      public_url: publicToken && baseUrl
        ? `${baseUrl.replace(/\/$/, "")}/proposta/${publicToken}`
        : null,
    } : null,
    versions: versions.map((version) => ({
      id: version.id,
      proposal_id: version.proposal_id,
      version_number: version.version_number,
      content_hash: version.content_hash,
      terms_version: version.terms_version,
      created_at: version.created_at,
    })),
  };
}

export async function setProposalAccessLinkActive(input: {
  proposalId: string;
  linkId: string;
  active: boolean;
  actorId: string;
}) {
  const link = await workflowFirst<ProposalLinkRecord>(
    `SELECT pal.*, pv.version_number
     FROM proposal_access_links pal
     JOIN proposal_versions pv ON pv.id = pal.proposal_version_id
     WHERE pal.id = ? AND pal.proposal_id = ?
     ORDER BY pal.created_at DESC LIMIT 1`,
    [input.linkId, input.proposalId],
  );
  if (!link) throw new Error("Link da proposta não encontrado.");

  const latest = await workflowFirst<{ id: string }>(
    "SELECT id FROM proposal_access_links WHERE proposal_id = ? ORDER BY created_at DESC LIMIT 1",
    [input.proposalId],
  );
  if (latest?.id !== link.id) throw new Error("Um link substituído não pode ser reativado.");
  if (input.active && new Date(link.expires_at).getTime() < Date.now()) {
    throw new Error("Este link expirou e não pode ser reativado. Publique uma nova versão.");
  }

  const now = workflowNow();
  if (input.active) {
    await workflowRun(
      "UPDATE proposal_access_links SET active = 0, revoked_at = COALESCE(revoked_at, ?) WHERE proposal_id = ? AND id <> ? AND active = 1",
      [now, input.proposalId, link.id],
    );
    await workflowRun(
      "UPDATE proposal_access_links SET active = 1, revoked_at = NULL WHERE id = ?",
      [link.id],
    );
  } else {
    await workflowRun(
      "UPDATE proposal_access_links SET active = 0, revoked_at = ? WHERE id = ?",
      [now, link.id],
    );
  }

  await recordAuditEvent({
    entityType: "PROPOSAL",
    entityId: input.proposalId,
    eventType: input.active ? "PROPOSAL_LINK_REACTIVATED" : "PROPOSAL_LINK_REVOKED",
    actorType: "ADMIN",
    actorId: input.actorId,
    metadata: { linkId: link.id, versionNumber: link.version_number },
  });
  return getProposalDetails(input.proposalId);
}

export async function rotateProposalAccessLink(input: {
  proposalId: string;
  actorId: string;
}) {
  const link = await workflowFirst<ProposalLinkRecord>(
    `SELECT pal.*, pv.version_number
     FROM proposal_access_links pal
     JOIN proposal_versions pv ON pv.id = pal.proposal_version_id
     WHERE pal.proposal_id = ? ORDER BY pal.created_at DESC LIMIT 1`,
    [input.proposalId],
  );
  if (!link) throw new Error("Publique a proposta antes de gerar o link do cliente.");
  if (new Date(link.expires_at).getTime() < Date.now()) {
    throw new Error("A proposta expirou. Publique uma nova versão para gerar outro link.");
  }

  const token = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(token);
  const tokenCiphertext = await encryptOpaqueToken(token);
  const now = workflowNow();
  const newLinkId = crypto.randomUUID();
  await workflowRun(
    "UPDATE proposal_access_links SET active = 0, revoked_at = ? WHERE proposal_id = ? AND active = 1",
    [now, input.proposalId],
  );
  await workflowRun(
    `INSERT INTO proposal_access_links (
      id, proposal_id, proposal_version_id, token_hash, token_ciphertext, active,
      expires_at, first_viewed_at, last_viewed_at, view_count, created_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, 1, ?, NULL, NULL, 0, ?, NULL)`,
    [newLinkId, input.proposalId, link.proposal_version_id, tokenHash, tokenCiphertext, link.expires_at, now],
  );
  await recordAuditEvent({
    entityType: "PROPOSAL",
    entityId: input.proposalId,
    eventType: "PROPOSAL_LINK_ROTATED",
    actorType: "ADMIN",
    actorId: input.actorId,
    metadata: { previousLinkId: link.id, newLinkId, versionNumber: link.version_number },
  });
  const proposal = await getProposalDetails(input.proposalId);
  return { proposal, publicUrl: proposal?.accessLink?.public_url ?? null };
}

export async function getLatestProposalSnapshot(id: string) {
  const version = await workflowFirst<ProposalVersionRecord>(
    "SELECT * FROM proposal_versions WHERE proposal_id = ? ORDER BY version_number DESC LIMIT 1",
    [id],
  );
  return version ? JSON.parse(version.snapshot_json) as ProposalSnapshot : null;
}

export async function updateProposal(id: string, input: ProposalEditorInput) {
  const proposal = await workflowFirst<ProposalRecord>("SELECT * FROM proposals WHERE id = ?", [id]);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (proposal.status !== "DRAFT") {
    throw new Error("Uma proposta enviada não pode ser sobrescrita. Crie uma nova versão em rascunho.");
  }
  validateEditorInput(input);
  const now = workflowNow();
  const normalizedItems = normalizeItems(input.items);
  const totalCents = normalizedItems.reduce((sum, item) => sum + item.totalCents, 0);
  const milestones = normalizeMilestones(totalCents);

  await workflowRun(
    `UPDATE proposals SET
      project_name = ?, client_name = ?, client_email = ?, summary = ?, scope = ?,
      included_json = ?, excluded_json = ?, revisions_included = ?,
      revision_definition = ?, estimated_deadline = ?, license_terms = ?,
      cancellation_terms = ?, payment_methods_json = ?, total_cents = ?,
      validity_days = ?, updated_at = ? WHERE id = ?`,
    [
      input.projectName.trim(), input.clientName.trim(), input.clientEmail.trim().toLowerCase(),
      input.summary.trim(), input.scope.trim(), cleanStringArray(input.included),
      cleanStringArray(input.excluded), Math.max(0, Math.round(input.revisionsIncluded)),
      input.revisionDefinition.trim(), clean(input.estimatedDeadline), input.licenseTerms.trim(),
      input.cancellationTerms.trim(), JSON.stringify(input.paymentMethods), totalCents,
      Math.min(90, Math.max(1, Math.round(input.validityDays))), now, id,
    ],
  );
  await workflowRun("DELETE FROM proposal_items WHERE proposal_id = ?", [id]);
  await workflowRun("DELETE FROM proposal_payment_milestones WHERE proposal_id = ? AND order_id IS NULL", [id]);
  await insertProposalItems(id, normalizedItems, now);
  await insertMilestones(id, milestones, now);
  return getProposalDetails(id);
}

export async function publishProposal(input: { proposalId: string; createdBy: string }) {
  const details = await getProposalSnapshotSource(input.proposalId);
  if (!details) throw new Error("Proposta não encontrada.");
  if (details.proposal.status !== "DRAFT") throw new Error("Somente uma versão em rascunho pode ser publicada.");
  if (details.proposal.total_cents <= 0) throw new Error("Informe o investimento da proposta.");
  if (details.items.length === 0) throw new Error("Adicione ao menos um item à proposta.");
  if (details.milestones.reduce((sum, item) => sum + item.amount_cents, 0) !== details.proposal.total_cents) {
    throw new Error("A soma das etapas de pagamento deve ser igual ao valor da proposta.");
  }

  const now = workflowNow();
  const versionNumber = details.proposal.current_version + 1;
  const validUntil = addDaysIso(now, details.proposal.validity_days);
  const versionId = crypto.randomUUID();
  const snapshot: ProposalSnapshot = {
    ...details,
    proposal: { ...details.proposal, current_version: versionNumber, valid_until: validUntil, status: "SENT" },
    termsVersion: TERMS_VERSION,
    generatedAt: now,
  };
  const snapshotJson = JSON.stringify(snapshot);
  const contentHash = await hashOpaqueToken(snapshotJson);
  const token = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(token);
  const tokenCiphertext = await encryptOpaqueToken(token);

  await workflowRun(
    `INSERT INTO proposal_versions (
      id, proposal_id, version_number, snapshot_json, content_hash,
      terms_version, pdf_storage_key, created_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [versionId, input.proposalId, versionNumber, snapshotJson, contentHash, TERMS_VERSION, now, input.createdBy],
  );
  await workflowRun(
    "UPDATE proposal_access_links SET active = 0, revoked_at = ? WHERE proposal_id = ? AND active = 1",
    [now, input.proposalId],
  );
  await workflowRun(
    `INSERT INTO proposal_access_links (
      id, proposal_id, proposal_version_id, token_hash, token_ciphertext, active, expires_at,
      first_viewed_at, last_viewed_at, view_count, created_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, 1, ?, NULL, NULL, 0, ?, NULL)`,
    [crypto.randomUUID(), input.proposalId, versionId, tokenHash, tokenCiphertext, validUntil, now],
  );
  await workflowRun(
    `UPDATE proposals SET status = 'SENT', current_version = ?, valid_until = ?,
      sent_at = ?, updated_at = ? WHERE id = ?`,
    [versionNumber, validUntil, now, now, input.proposalId],
  );
  if (details.proposal.briefing_id) {
    await workflowRun(
      "UPDATE briefing_requests SET status = 'CONVERTED', updated_at = ? WHERE id = ?",
      [now, details.proposal.briefing_id],
    );
  }
  await recordAuditEvent({
    entityType: "PROPOSAL",
    entityId: input.proposalId,
    eventType: "PROPOSAL_PUBLISHED",
    actorType: "ADMIN",
    actorId: input.createdBy,
    metadata: { versionNumber, contentHash },
  });
  const baseUrl = await getEnvValue("APP_BASE_URL") ?? "";
  return {
    proposal: await getProposalDetails(input.proposalId),
    publicUrl: `${baseUrl.replace(/\/$/, "")}/proposta/${token}`,
  };
}

export async function startProposalRevision(input: { proposalId: string; createdBy: string }) {
  const proposal = await workflowFirst<ProposalRecord>("SELECT * FROM proposals WHERE id = ?", [input.proposalId]);
  if (!proposal) throw new Error("Proposta não encontrada.");
  if (!["SENT", "VIEWED", "REJECTED", "EXPIRED"].includes(proposal.status)) {
    throw new Error("Esta proposta não pode iniciar uma nova versão no status atual.");
  }
  const acceptance = await workflowFirst<{ id: string }>("SELECT id FROM proposal_acceptances WHERE proposal_id = ? AND decision = 'ACCEPTED' LIMIT 1", [proposal.id]);
  if (acceptance) throw new Error("Uma proposta aceita não pode ser alterada.");
  const now = workflowNow();
  await workflowRun("UPDATE proposals SET status = 'DRAFT', valid_until = NULL, updated_at = ? WHERE id = ?", [now, proposal.id]);
  await workflowRun("UPDATE proposal_access_links SET active = 0, revoked_at = ? WHERE proposal_id = ? AND active = 1", [now, proposal.id]);
  await recordAuditEvent({ entityType: "PROPOSAL", entityId: proposal.id, eventType: "PROPOSAL_REVISION_STARTED", actorType: "ADMIN", actorId: input.createdBy, metadata: { nextVersion: proposal.current_version + 1 } });
  return getProposalDetails(proposal.id);
}

export async function getPublicProposal(token: string, markViewed = true) {
  if (!token || token.length < 32) return null;
  const tokenHash = await hashOpaqueToken(token);
  const link = await workflowFirst<ProposalLinkRecord>(
    "SELECT * FROM proposal_access_links WHERE token_hash = ? AND active = 1 LIMIT 1",
    [tokenHash],
  );
  if (!link) return null;
  if (new Date(link.expires_at).getTime() < Date.now()) {
    const now = workflowNow();
    await workflowRun(
      "UPDATE proposals SET status = 'EXPIRED', updated_at = ? WHERE id = ? AND status IN ('SENT', 'VIEWED')",
      [now, link.proposal_id],
    );
    return { expired: true as const, link, snapshot: null };
  }
  const version = await workflowFirst<ProposalVersionRecord>(
    "SELECT * FROM proposal_versions WHERE id = ? LIMIT 1",
    [link.proposal_version_id],
  );
  if (!version) return null;
  const [acceptance, currentProposal, payment, project, media] = await Promise.all([
    workflowFirst<{ decision: string; accepted_at: string }>(
      "SELECT decision, accepted_at FROM proposal_acceptances WHERE proposal_version_id = ? LIMIT 1",
      [version.id],
    ),
    workflowFirst<{ status: string }>("SELECT status FROM proposals WHERE id = ?", [link.proposal_id]),
    workflowFirst<{ milestone_id: string; checkout_url: string | null; order_id: string | null; status: string | null; payment_method: string | null }>(
      `SELECT pm.id AS milestone_id, o.checkoutUrl AS checkout_url, pm.order_id, pm.status, pm.payment_method
       FROM proposal_payment_milestones pm
       LEFT JOIN orders o ON o.id = pm.order_id
       WHERE pm.proposal_id = ? ORDER BY pm.position LIMIT 1`,
      [link.proposal_id],
    ),
    workflowFirst<{ id: string; project_number: string; status: string }>(
      "SELECT id, project_number, status FROM projects WHERE proposal_id = ? LIMIT 1",
      [link.proposal_id],
    ),
    workflowAll<{ id: string; title: string; asset_type: PublicProposalAsset["assetType"]; status: string; version_number: number; caption: string | null; mime_type: string | null; size_bytes: number | null }>(
      `SELECT a.id, a.title, a.asset_type, a.status, av.version_number, av.caption, av.mime_type, av.size_bytes
       FROM projects pr
       JOIN assets a ON a.project_id = pr.id
       JOIN asset_versions av ON av.id = a.current_version_id
       WHERE pr.proposal_id = ? AND a.status = 'APPROVED' AND av.processing_status = 'READY'
       ORDER BY a.updated_at DESC`,
      [link.proposal_id],
    ),
  ]);
  if (markViewed) {
    const now = workflowNow();
    await workflowRun(
      `UPDATE proposal_access_links SET view_count = view_count + 1,
       first_viewed_at = COALESCE(first_viewed_at, ?), last_viewed_at = ? WHERE id = ?`,
      [now, now, link.id],
    );
    await workflowRun(
      "UPDATE proposals SET status = CASE WHEN status = 'SENT' THEN 'VIEWED' ELSE status END, updated_at = ? WHERE id = ?",
      [now, link.proposal_id],
    );
  }
  return {
    expired: false as const,
    link,
    version: { id: version.id, contentHash: version.content_hash, termsVersion: version.terms_version },
    snapshot: JSON.parse(version.snapshot_json) as ProposalSnapshot,
    acceptance: acceptance ?? null,
    currentStatus: currentProposal?.status ?? "SENT",
    payment: payment ?? null,
    project: project ?? null,
    media: media.map((asset) => ({ id: asset.id, title: asset.title, assetType: asset.asset_type, status: asset.status, versionNumber: asset.version_number, caption: asset.caption, mimeType: asset.mime_type, sizeBytes: asset.size_bytes } satisfies PublicProposalAsset)),
  };
}

export async function getPublicProposalMedia(token: string, assetId: string) {
  if (!token || token.length < 32 || !assetId) return null;
  const tokenHash = await hashOpaqueToken(token);
  const media = await workflowFirst<{ storage_key: string; mime_type: string; size_bytes: number }>(
    `SELECT av.preview_storage_key AS storage_key, COALESCE(av.mime_type, 'application/octet-stream') AS mime_type,
       COALESCE(av.size_bytes, 0) AS size_bytes
     FROM proposal_access_links pal
     JOIN projects pr ON pr.proposal_id = pal.proposal_id
     JOIN assets a ON a.project_id = pr.id AND a.id = ?
     JOIN asset_versions av ON av.id = a.current_version_id
     WHERE pal.token_hash = ? AND pal.active = 1 AND pal.expires_at > ?
       AND a.status = 'APPROVED' AND av.processing_status = 'READY' AND av.preview_storage_key IS NOT NULL
     LIMIT 1`,
    [assetId, tokenHash, workflowNow()],
  );
  return media ? { storageKey: media.storage_key, mimeType: media.mime_type, sizeBytes: media.size_bytes } : null;
}

export async function acceptPublicProposal(input: {
  token: string;
  signerName: string;
  signerEmail: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "BOLETO";
  consentText: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const result = await getPublicProposal(input.token, false);
  if (!result || result.expired || !result.snapshot) throw new Error("Proposta inválida ou expirada.");
  const proposal = result.snapshot.proposal;
  const allowed = parseStringArray(proposal.payment_methods_json);
  if (!allowed.includes(input.paymentMethod)) throw new Error("Forma de pagamento não permitida nesta proposta.");
  if (!input.signerName.trim() || !isValidEmail(input.signerEmail)) {
    throw new Error("Informe nome e e-mail válidos para registrar o aceite.");
  }

  const existing = await workflowFirst<{ id: string; decision: string }>(
    "SELECT id, decision FROM proposal_acceptances WHERE proposal_version_id = ? LIMIT 1",
    [result.link.proposal_version_id],
  );
  if (existing?.decision === "ACCEPTED") {
    const now = workflowNow();
    return {
      proposal,
      project: await ensureProject(proposal, now),
      firstMilestone: (await listProposalMilestones(proposal.id))[0] ?? null,
    };
  }
  if (existing) throw new Error("Esta versão da proposta já possui uma decisão registrada.");
  const now = workflowNow();
  await workflowRun(
    `INSERT INTO proposal_acceptances (
      id, proposal_id, proposal_version_id, decision, signer_name,
      signer_email, consent_text, terms_hash, ip_address, user_agent, accepted_at
    ) VALUES (?, ?, ?, 'ACCEPTED', ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(), proposal.id, result.link.proposal_version_id,
      input.signerName.trim(), input.signerEmail.trim().toLowerCase(),
      input.consentText, result.version.contentHash, input.ipAddress ?? null,
      input.userAgent ?? null, now,
    ],
  );
  await workflowRun(
    "UPDATE proposals SET status = 'ACCEPTED', accepted_at = ?, updated_at = ? WHERE id = ?",
    [now, now, proposal.id],
  );
  await workflowRun(
    "UPDATE proposal_payment_milestones SET payment_method = ?, updated_at = ? WHERE proposal_id = ? AND position = 0",
    [input.paymentMethod, now, proposal.id],
  );
  const project = await ensureProject(proposal, now);
  await recordAuditEvent({
    entityType: "PROPOSAL",
    entityId: proposal.id,
    eventType: "PROPOSAL_ACCEPTED",
    actorType: "CLIENT",
    actorId: input.signerEmail.trim().toLowerCase(),
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: { versionId: result.link.proposal_version_id, paymentMethod: input.paymentMethod },
  });
  return {
    proposal,
    project,
    firstMilestone: (await listProposalMilestones(proposal.id))[0] ?? null,
  };
}

export async function rejectPublicProposal(input: {
  token: string;
  signerName: string;
  signerEmail: string;
  reason?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const result = await getPublicProposal(input.token, false);
  if (!result || result.expired || !result.snapshot) throw new Error("Proposta inválida ou expirada.");
  if (!input.signerName.trim() || !isValidEmail(input.signerEmail)) {
    throw new Error("Informe nome e e-mail válidos para registrar a recusa.");
  }
  const now = workflowNow();
  await workflowRun(
    `INSERT INTO proposal_acceptances (
      id, proposal_id, proposal_version_id, decision, signer_name,
      signer_email, consent_text, terms_hash, ip_address, user_agent, accepted_at
    ) VALUES (?, ?, ?, 'REJECTED', ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(), result.snapshot.proposal.id, result.link.proposal_version_id,
      input.signerName.trim(), input.signerEmail.trim().toLowerCase(),
      input.reason?.trim() || "Proposta recusada pelo cliente.", result.version.contentHash,
      input.ipAddress ?? null, input.userAgent ?? null, now,
    ],
  );
  await workflowRun(
    "UPDATE proposals SET status = 'REJECTED', updated_at = ? WHERE id = ?",
    [now, result.snapshot.proposal.id],
  );
}

export async function getProposalMilestone(id: string) {
  return workflowFirst<ProposalMilestoneRecord>(
    "SELECT * FROM proposal_payment_milestones WHERE id = ? LIMIT 1",
    [id],
  );
}

export async function attachOrderToMilestone(input: {
  milestoneId: string;
  orderId: string;
  paymentMethod: string;
}) {
  await workflowRun(
    `UPDATE proposal_payment_milestones SET order_id = ?, payment_method = ?,
     status = 'CHECKOUT_CREATED', updated_at = ? WHERE id = ? AND order_id IS NULL`,
    [input.orderId, input.paymentMethod, workflowNow(), input.milestoneId],
  );
  return getProposalMilestone(input.milestoneId);
}

export async function syncMilestoneFromOrder(orderId: string, orderStatus: string, paidAt?: string | null) {
  const status = mapOrderStatus(orderStatus);
  const now = workflowNow();
  const milestone = await workflowFirst<ProposalMilestoneRecord>(
    "SELECT * FROM proposal_payment_milestones WHERE order_id = ? LIMIT 1",
    [orderId],
  );
  if (!milestone) return null;
  await workflowRun(
    `UPDATE proposal_payment_milestones SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?`,
    [status, status === "PAID" ? (paidAt ?? now) : milestone.paid_at, now, milestone.id],
  );
  if (status === "PAID") {
    const project = await workflowFirst<{ id: string; status: string }>(
      "SELECT id, status FROM projects WHERE proposal_id = ? LIMIT 1",
      [milestone.proposal_id],
    );
    if (project) {
      const nextProjectStatus = milestone.milestone_type === "BALANCE"
        ? (project.status === "APPROVED" || project.status === "AWAITING_BALANCE" ? "READY_FOR_DELIVERY" : project.status)
        : (project.status === "AWAITING_DEPOSIT" ? "IN_PRODUCTION" : project.status);
      await workflowRun("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?", [nextProjectStatus, now, project.id]);
    }
  }
  return getProposalMilestone(milestone.id);
}

async function getProposalSnapshotSource(proposalId: string): Promise<Omit<ProposalSnapshot, "termsVersion" | "generatedAt"> | null> {
  const proposal = await workflowFirst<ProposalRecord>("SELECT * FROM proposals WHERE id = ?", [proposalId]);
  if (!proposal) return null;
  const [items, milestones, briefing] = await Promise.all([
    listProposalItems(proposalId),
    listProposalMilestones(proposalId),
    proposal.briefing_id ? getBriefingById(proposal.briefing_id) : Promise.resolve(null),
  ]);
  return { proposal, items, milestones, briefing: briefing as unknown as Record<string, unknown> | null };
}

async function listProposalItems(proposalId: string) {
  return workflowAll<ProposalItemRecord>(
    "SELECT * FROM proposal_items WHERE proposal_id = ? ORDER BY position",
    [proposalId],
  );
}

export async function listProposalMilestones(proposalId: string) {
  return workflowAll<ProposalMilestoneRecord>(
    `SELECT pm.*, o.checkoutUrl AS checkout_url
     FROM proposal_payment_milestones pm
     LEFT JOIN orders o ON o.id = pm.order_id
     WHERE pm.proposal_id = ? ORDER BY pm.position`,
    [proposalId],
  );
}

async function insertProposalItems(
  proposalId: string,
  items: Array<ProposalItemInput & { totalCents?: number }>,
  now: string,
) {
  for (const [position, item] of items.entries()) {
    const totalCents = item.totalCents !== undefined
      ? item.totalCents
      : Math.round(item.quantity * item.unitPriceCents);
    await workflowRun(
      `INSERT INTO proposal_items (
        id, proposal_id, position, name, description, quantity, unit,
        unit_price_cents, total_cents, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(), proposalId, position, item.name.trim(),
        item.description?.trim() ?? "", item.quantity, item.unit?.trim() || "serviço",
        item.unitPriceCents, totalCents, now, now,
      ],
    );
  }
}

async function insertMilestones(proposalId: string, milestones: PaymentMilestoneInput[], now: string) {
  for (const [position, item] of milestones.entries()) {
    await workflowRun(
      `INSERT INTO proposal_payment_milestones (
        id, proposal_id, position, milestone_type, label,
        percentage_basis_points, amount_cents, payment_method, order_id,
        status, due_trigger, created_at, updated_at, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, 'PENDING', ?, ?, ?, NULL)`,
      [
        crypto.randomUUID(), proposalId, position, item.type, item.label.trim(),
        item.percentageBasisPoints ?? null, item.amountCents,
        clean(item.dueTrigger), now, now,
      ],
    );
  }
}

async function ensureProject(proposal: ProposalRecord, now: string) {
  const existing = await workflowFirst<{ id: string; project_number: string; status: string }>(
    "SELECT id, project_number, status FROM projects WHERE proposal_id = ? LIMIT 1",
    [proposal.id],
  );
  if (existing) return existing;
  const id = crypto.randomUUID();
  await workflowRun(
    `INSERT INTO projects (
      id, project_number, proposal_id, customer_id, name, status,
      revisions_included, revisions_used, created_at, updated_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, 'AWAITING_DEPOSIT', ?, 0, ?, ?, NULL)`,
    [id, buildReferenceNumber("PRJ"), proposal.id, proposal.customer_id, proposal.project_name, proposal.revisions_included, now, now],
  );
  return workflowFirst<{ id: string; project_number: string; status: string }>(
    "SELECT id, project_number, status FROM projects WHERE id = ?",
    [id],
  );
}

function toEditableProposal(proposal: ProposalRecord) {
  return {
    ...proposal,
    included: parseStringArray(proposal.included_json),
    excluded: parseStringArray(proposal.excluded_json),
    paymentMethods: parseStringArray(proposal.payment_methods_json),
  };
}

function normalizeItems(items: ProposalItemInput[]) {
  return items.map((item) => {
    const quantity = Math.max(0.01, Number(item.quantity) || 1);
    const unitPriceCents = Math.max(0, Math.round(Number(item.unitPriceCents) || 0));
    return { ...item, quantity, unitPriceCents, totalCents: Math.round(quantity * unitPriceCents) };
  });
}

function normalizeMilestones(totalCents: number): PaymentMilestoneInput[] {
  const depositCents = Math.floor(totalCents / 2);
  return [
    {
      type: "DEPOSIT",
      label: "Entrada de 50% para iniciar o projeto",
      percentageBasisPoints: 5000,
      amountCents: depositCents,
      dueTrigger: "Após o aceite da proposta",
    },
    {
      type: "BALANCE",
      label: "Saldo final de 50%",
      percentageBasisPoints: 5000,
      amountCents: totalCents - depositCents,
      dueTrigger: "Após a aprovação, antes da entrega final",
    },
  ];
}

function validateEditorInput(input: ProposalEditorInput) {
  if (!input.projectName?.trim() || !input.clientName?.trim() || !isValidEmail(input.clientEmail)) {
    throw new Error("Informe projeto, cliente e e-mail válidos.");
  }
  if (!input.summary?.trim() || !input.scope?.trim()) throw new Error("Preencha resumo e escopo.");
  if (!input.items?.length) throw new Error("Adicione ao menos um item.");
  if (!input.paymentMethods?.length) throw new Error("Selecione uma forma de pagamento.");
}

function cleanStringArray(values: string[]) {
  return JSON.stringify(values.map((value) => value.trim()).filter(Boolean).slice(0, 100));
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function clean(value?: string) { return value?.trim() || null; }
function isValidEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() ?? ""); }
function buildReferenceNumber(prefix: string) { return `${prefix}-${new Date().getUTCFullYear()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`; }
function defaultIncluded() { return ["Análise do briefing", "Planejamento e direção do projeto", "Produção dos entregáveis descritos no escopo", "Versão para aprovação", "Revisões previstas nesta proposta", "Arquivo final após aprovação e quitação"] }
function defaultExcluded() { return ["Alterações de conceito após aprovação de uma etapa", "Novo roteiro, personagem, produto ou locação", "Entregáveis não descritos no escopo", "Rodadas adicionais de revisão sem autorização da FIRMANT"] }
function defaultRevisionDefinition() { return "Uma rodada corresponde a um conjunto consolidado de alterações enviado pelo cliente em uma única solicitação. Mudanças de conceito, briefing ou refação integral poderão gerar orçamento adicional."; }
function defaultLicenseTerms() { return "Os direitos de uso serão concedidos conforme o escopo e as plataformas descritas nesta proposta. Uso em mídia paga, sublicenciamento ou ampliação de prazo dependerão de previsão expressa."; }
function defaultCancellationTerms() { return "Cancelamentos serão analisados conforme o estágio do projeto e o trabalho efetivamente executado. Valores, custos e etapas ainda não executadas serão tratados conforme as condições desta proposta e a legislação aplicável."; }
function normalizePaymentPreferences(value: string) {
  const preferences = parseStringArray(value);
  const normalized = preferences.flatMap((item) => {
    const upper = item.toUpperCase();
    if (upper.includes("PIX")) return ["PIX"];
    if (upper.includes("CART")) return ["CREDIT_CARD"];
    if (upper.includes("BOLETO")) return ["BOLETO"];
    return [];
  });
  return normalized.length ? Array.from(new Set(normalized)) : ["PIX", "CREDIT_CARD"];
}

function mapOrderStatus(status: string) {
  if (["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "SUBSCRIPTION_ACTIVE"].includes(status)) return "PAID";
  if (["AWAITING_PAYMENT", "AWAITING_PIX", "AWAITING_BOLETO", "CHECKOUT_CREATED", "DRAFT"].includes(status)) return "AWAITING_PAYMENT";
  if (status === "OVERDUE") return "OVERDUE";
  if (status === "CANCELED") return "CANCELED";
  if (status === "REFUNDED") return "REFUNDED";
  return "FAILED";
}
