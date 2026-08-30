import {
  addBriefingAttachment,
  getBriefingByToken,
  listBriefingAttachments,
} from "@/lib/briefings/repository";
import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { sha256Bytes } from "@/lib/workflow/tokens";
import { assertSameOrigin } from "@/lib/workflow/request-context";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { token } = await context.params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) {
    return Response.json({ error: "Link de briefing inválido." }, { status: 404 });
  }
  if (briefing.status !== "DRAFT" && briefing.status !== "NEEDS_INFORMATION") {
    return Response.json(
      { error: "Este briefing já foi enviado e não aceita novos anexos." },
      { status: 409 },
    );
  }
  if (new Date(briefing.link_expires_at).getTime() < Date.now()) {
    return Response.json({ error: "Este link expirou." }, { status: 410 });
  }

  try {
    const existing = await listBriefingAttachments(briefing.id);
    if (existing.length >= 10) {
      return Response.json(
        { error: "O limite de 10 imagens por briefing foi atingido." },
        { status: 413 },
      );
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Selecione uma imagem." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "Cada imagem deve ter no máximo 10 MB." },
        { status: 413 },
      );
    }
    const bytes = await file.arrayBuffer();
    const detected = detectImage(bytes);
    if (!detected) {
      return Response.json(
        { error: "Envie somente uma imagem JPG, JPEG ou PNG válida." },
        { status: 415 },
      );
    }

    const attachmentId = crypto.randomUUID();
    const storageKey = `briefings/${briefing.id}/${attachmentId}.${detected.extension}`;
    const store = await getPrivateAssetsStore();
    await store.put(storageKey, bytes, {
      httpMetadata: {
        contentType: detected.mimeType,
        contentDisposition: "inline",
        cacheControl: "private, no-store",
      },
      customMetadata: {
        briefingId: briefing.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      const attachment = await addBriefingAttachment({
        briefingId: briefing.id,
        storageKey,
        originalFilename: sanitizeFilename(file.name),
        mimeType: detected.mimeType,
        sizeBytes: file.size,
        sha256: await sha256Bytes(bytes),
      });
      return Response.json({ attachment });
    } catch (error) {
      await store.delete(storageKey).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar imagem." },
      { status: 500 },
    );
  }
}

function detectImage(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  if (
    bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  return null;
}

function sanitizeFilename(value: string) {
  return value.replace(/[\r\n"\\/]/g, "_").slice(0, 180) || "imagem";
}
