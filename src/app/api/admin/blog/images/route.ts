import { assertAdminRequest } from "@/lib/admin/admin-auth";
import { getEnvValue } from "@/lib/cloudflare-runtime";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type CloudflareImagesResponse = {
  success: boolean;
  result?: {
    id?: string;
    variants?: string[];
  };
  errors?: Array<{ message?: string }>;
};

export async function POST(request: Request) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  const accountId = await getEnvValue("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = await getEnvValue("CLOUDFLARE_IMAGES_API_TOKEN");
  const preferredVariant = await getEnvValue("CLOUDFLARE_IMAGES_VARIANT") || "public";

  if (!accountId || !apiToken) {
    return Response.json(
      { error: "Cloudflare Images não está configurado para upload." },
      { status: 503 },
    );
  }

  const input = await request.formData();
  const file = input.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "Envie uma imagem válida no campo file." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Response.json(
      { error: "Formato inválido. Use WebP, JPG, PNG ou AVIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return Response.json(
      { error: "Imagem muito pesada. Envie um arquivo de até 5 MB." },
      { status: 400 },
    );
  }

  const uploadBody = new FormData();
  uploadBody.append("file", file, file.name);
  uploadBody.append("metadata", JSON.stringify({ source: "firmant-blog-admin" }));
  uploadBody.append("requireSignedURLs", "false");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: uploadBody,
    },
  );

  const data = await response.json() as CloudflareImagesResponse;

  if (!response.ok || !data.success || !data.result?.id) {
    const message = data.errors?.[0]?.message ?? "Falha ao enviar imagem para Cloudflare Images.";
    return Response.json({ error: message }, { status: 502 });
  }

  const variants = data.result.variants ?? [];
  const url = variants.find((variant) => variant.endsWith(`/${preferredVariant}`))
    ?? variants[0];

  if (!url) {
    return Response.json(
      { error: "Upload concluído, mas a URL pública da imagem não foi retornada." },
      { status: 502 },
    );
  }

  return Response.json({
    id: data.result.id,
    url,
    variants,
  });
}
