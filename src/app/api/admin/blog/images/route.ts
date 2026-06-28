import { assertAdminRequest } from "@/lib/admin/admin-auth";
import { normalizeSlug } from "@/lib/blog/blog-validation";
import { getBlogImagesStore } from "@/lib/cloudflare-runtime";

const MAX_IMAGE_BYTES = 500 * 1024;

export async function POST(request: Request) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const requestedSlug = formData.get("slug");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Selecione uma imagem para enviar." },
        { status: 400 },
      );
    }

    if (file.type !== "image/webp") {
      return Response.json(
        { error: "A imagem precisa estar convertida para WebP." },
        { status: 415 },
      );
    }

    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "A imagem WebP deve ter no máximo 500 KB." },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    if (!isWebp(bytes)) {
      return Response.json(
        { error: "O arquivo enviado não é um WebP válido." },
        { status: 415 },
      );
    }

    const slug = normalizeSlug(
      typeof requestedSlug === "string" ? requestedSlug : "",
    ) || "capa-blog";
    const key = `${slug}-${crypto.randomUUID().slice(0, 8)}.webp`;
    const store = await getBlogImagesStore();

    await store.put(key, bytes, {
      metadata: {
        contentType: "image/webp",
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json(
      {
        url: `/blog-assets/${key}`,
        bytes: file.size,
        format: "webp",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Não foi possível salvar a imagem do Blog." },
      { status: 500 },
    );
  }
}

function isWebp(value: ArrayBuffer) {
  if (value.byteLength < 12) return false;

  const bytes = new Uint8Array(value, 0, 12);
  const signature = String.fromCharCode(...bytes);

  return signature.startsWith("RIFF") && signature.endsWith("WEBP");
}
