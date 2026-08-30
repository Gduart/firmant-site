import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { createAssetVersion } from "@/lib/reviews/repository";
import type { AssetType, StoredPreviewInput } from "@/lib/reviews/types";
import { assertSameOrigin } from "@/lib/workflow/request-context";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 95 * 1024 * 1024;
type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const storedKeys: string[] = [];
  try {
    const { id: projectId } = await context.params;
    const form = await request.formData();
    const type = String(form.get("assetType") ?? "") as AssetType;
    if (!["IMAGE", "CAROUSEL", "VIDEO"].includes(type)) throw new Error("Tipo de conteúdo inválido.");
    const title = String(form.get("title") ?? "").trim();
    if (!title) throw new Error("Informe o título do conteúdo.");
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length) throw new Error("Selecione os arquivos de prévia.");
    if (type !== "CAROUSEL" && files.length !== 1) throw new Error("Envie um arquivo para imagem ou vídeo.");
    if (type === "CAROUSEL" && (files.length < 2 || files.length > 20)) throw new Error("Envie de 2 a 20 imagens no carrossel.");
    const uploadId = crypto.randomUUID();
    const store = await getPrivateAssetsStore();
    const stored: StoredPreviewInput[] = [];
    for (const [position, file] of files.entries()) {
      const max = type === "VIDEO" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (!file.size || file.size > max) throw new Error(type === "VIDEO" ? "O vídeo MP4 deve ter no máximo 95 MB." : "Cada imagem deve ter no máximo 10 MB.");
      const bytes = await file.arrayBuffer();
      const detected = type === "VIDEO" ? detectMp4(bytes) : detectImage(bytes);
      if (!detected) throw new Error(type === "VIDEO" ? "Envie um arquivo MP4 válido." : "Envie imagens JPG ou PNG válidas.");
      const key = `reviews/${projectId}/${uploadId}/${position}.${detected.extension}`;
      await store.put(key, bytes, { httpMetadata: { contentType: detected.mimeType, contentDisposition: "inline", cacheControl: "private, no-store" }, customMetadata: { projectId, uploadedAt: new Date().toISOString() } });
      storedKeys.push(key);
      stored.push({ storageKey: key, mimeType: detected.mimeType, sizeBytes: file.size, position });
    }
    const result = await createAssetVersion({
      projectId,
      assetId: String(form.get("assetId") ?? "") || undefined,
      title,
      assetType: type,
      caption: String(form.get("caption") ?? ""),
      durationMs: numberOrNull(form.get("durationMs")),
      files: stored,
      createdBy: getAdminActor(request),
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (storedKeys.length) {
      const store = await getPrivateAssetsStore().catch(() => null);
      if (store) await Promise.all(storedKeys.map((key) => store.delete(key).catch(() => undefined)));
    }
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao enviar conteúdo." }, { status: 400 });
  }
}

function detectImage(value: ArrayBuffer) { const b = new Uint8Array(value); if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return { mimeType: "image/png", extension: "png" }; if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mimeType: "image/jpeg", extension: "jpg" }; return null; }
function detectMp4(value: ArrayBuffer) { const b = new Uint8Array(value); return b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 ? { mimeType: "video/mp4", extension: "mp4" } : null; }
function numberOrNull(value: FormDataEntryValue | null) { const number = Number(value); return Number.isFinite(number) && number > 0 ? Math.round(number) : null; }
