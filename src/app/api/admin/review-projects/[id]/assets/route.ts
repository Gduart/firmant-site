import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { getEnvValue, getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { createAssetVersion, getReviewProject } from "@/lib/reviews/repository";
import type { AssetType, StoredPreviewInput } from "@/lib/reviews/types";
import { assertSameOrigin } from "@/lib/workflow/request-context";
import { workflowAll, workflowFirst, workflowNow, workflowRun } from "@/lib/workflow/db";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/workflow/tokens";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 95 * 1024 * 1024;
const UPLOAD_TTL_MS = 20 * 60 * 1000;
type RouteContext = { params: Promise<{ id: string }> };
type UploadDescriptor = { name: string; size: number; mimeType: string };
type CreatePayload = {
  action: "create";
  title?: string;
  caption?: string;
  assetType?: AssetType;
  assetId?: string;
  durationMs?: number | null;
  files?: UploadDescriptor[];
};
type FinalizePayload = { action: "finalize"; uploadToken?: string };
type SessionRecord = {
  id: string;
  project_id: string;
  asset_id: string | null;
  title: string;
  asset_type: AssetType;
  caption: string | null;
  duration_ms: number | null;
  expected_files_json: string;
  expires_at: string;
  created_by: string;
};
type UploadedFileRecord = {
  position: number;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
};

export async function POST(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  try {
    const { id: projectId } = await context.params;
    const payload = await request.json() as CreatePayload | FinalizePayload;
    if (payload.action === "create") return createUploadSession(request, projectId, payload);
    if (payload.action === "finalize") return finalizeUploadSession(projectId, payload);
    return Response.json({ error: "Operação de upload inválida." }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao enviar conteúdo." },
      { status: 400 },
    );
  }
}

async function createUploadSession(request: Request, projectId: string, payload: CreatePayload) {
  const project = await getReviewProject(projectId);
  if (!project) throw new Error("Projeto não encontrado.");

  const type = payload.assetType;
  if (!type || !["IMAGE", "CAROUSEL", "VIDEO"].includes(type)) throw new Error("Tipo de conteúdo inválido.");
  const title = payload.title?.trim() ?? "";
  if (!title) throw new Error("Informe o título do conteúdo.");
  const files = validateDescriptors(type, payload.files ?? []);
  const assetId = payload.assetId?.trim() || null;
  if (assetId) {
    const asset = project.assets.find((item) => item.id === assetId);
    if (!asset) throw new Error("Conteúdo não encontrado neste projeto.");
    if (asset.asset_type !== type) throw new Error("O tipo não pode mudar entre versões.");
  }

  const token = createOpaqueToken();
  const now = workflowNow();
  const expiresAt = new Date(Date.now() + UPLOAD_TTL_MS).toISOString();
  await workflowRun(
    `INSERT INTO review_upload_sessions (
      id, token_hash, project_id, asset_id, title, asset_type, caption, duration_ms,
      expected_files_json, status, created_by, created_at, expires_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, NULL)`,
    [
      crypto.randomUUID(), await hashOpaqueToken(token), projectId, assetId, title, type,
      payload.caption?.trim() || null, normalizeDuration(payload.durationMs), JSON.stringify(files),
      getAdminActor(request), now, expiresAt,
    ],
  );

  const uploadBaseUrl = (await getEnvValue("REVIEW_UPLOAD_BASE_URL")
    ?? await getEnvValue("APP_BASE_URL")
    ?? new URL(request.url).origin).replace(/\/$/, "");
  return Response.json({
    uploadToken: token,
    expiresAt,
    files: files.map((file, position) => ({
      position,
      uploadUrl: `${uploadBaseUrl}/api/admin/review-uploads/${encodeURIComponent(token)}/${position}`,
      size: file.size,
      mimeType: file.mimeType,
    })),
  }, { status: 201 });
}

async function finalizeUploadSession(projectId: string, payload: FinalizePayload) {
  const token = payload.uploadToken?.trim() ?? "";
  if (token.length < 32) throw new Error("Sessão de upload inválida.");
  const session = await workflowFirst<SessionRecord>(
    `SELECT * FROM review_upload_sessions
     WHERE token_hash = ? AND project_id = ? AND status = 'PENDING' LIMIT 1`,
    [await hashOpaqueToken(token), projectId],
  );
  if (!session) throw new Error("Sessão de upload não encontrada ou já utilizada.");
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await workflowRun("UPDATE review_upload_sessions SET status = 'EXPIRED' WHERE id = ?", [session.id]);
    throw new Error("A sessão de upload expirou. Tente enviar novamente.");
  }

  const expected = JSON.parse(session.expected_files_json) as UploadDescriptor[];
  const uploaded = await workflowAll<UploadedFileRecord>(
    `SELECT position, storage_key, mime_type, size_bytes
     FROM review_upload_files WHERE session_id = ? ORDER BY position`,
    [session.id],
  );
  if (uploaded.length !== expected.length) throw new Error("O envio dos arquivos ainda não terminou.");

  const store = await getPrivateAssetsStore();
  const files: StoredPreviewInput[] = [];
  for (const [position, file] of uploaded.entries()) {
    const expectedFile = expected[position];
    if (!expectedFile || file.position !== position || file.size_bytes !== expectedFile.size) {
      throw new Error("Um arquivo enviado não corresponde à sessão criada.");
    }
    const object = await store.head(file.storage_key);
    if (!object || object.size !== file.size_bytes) throw new Error("Um arquivo não foi confirmado no armazenamento.");
    files.push({ storageKey: file.storage_key, mimeType: file.mime_type, sizeBytes: file.size_bytes, position });
  }

  const result = await createAssetVersion({
    projectId,
    assetId: session.asset_id ?? undefined,
    title: session.title,
    assetType: session.asset_type,
    caption: session.caption ?? "",
    durationMs: session.duration_ms,
    files,
    createdBy: session.created_by,
  });
  await workflowRun(
    "UPDATE review_upload_sessions SET status = 'COMPLETED', completed_at = ? WHERE id = ? AND status = 'PENDING'",
    [workflowNow(), session.id],
  );
  return Response.json(result, { status: 201 });
}

function validateDescriptors(type: AssetType, files: UploadDescriptor[]) {
  if (!files.length) throw new Error("Selecione os arquivos de prévia.");
  if (type !== "CAROUSEL" && files.length !== 1) throw new Error("Envie um arquivo para imagem ou vídeo.");
  if (type === "CAROUSEL" && (files.length < 2 || files.length > 20)) throw new Error("Envie de 2 a 20 imagens no carrossel.");
  return files.map((file) => {
    const size = Number(file.size);
    const max = type === "VIDEO" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (!Number.isInteger(size) || size <= 0 || size > max) {
      throw new Error(type === "VIDEO" ? "O vídeo MP4 deve ter no máximo 95 MB." : "Cada imagem deve ter no máximo 10 MB.");
    }
    const mimeType = String(file.mimeType || "").toLowerCase();
    if (type === "VIDEO" ? mimeType !== "video/mp4" : !["image/jpeg", "image/png"].includes(mimeType)) {
      throw new Error(type === "VIDEO" ? "Envie um arquivo MP4 válido." : "Envie imagens JPG ou PNG válidas.");
    }
    return { name: sanitizeFilename(String(file.name || "arquivo")), size, mimeType };
  });
}

function sanitizeFilename(value: string) {
  return value.replace(/[\r\n"\\/]/g, "_").slice(0, 180) || "arquivo";
}

function normalizeDuration(value: number | null | undefined) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}
