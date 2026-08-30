import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { getReviewMedia } from "@/lib/reviews/repository";

export async function serveReviewMedia(request: Request, token: string, itemId?: string) {
  const media = await getReviewMedia(token, itemId);
  if (!media) return Response.json({ error: "Arquivo não encontrado." }, { status: 404 });
  const store = await getPrivateAssetsStore();
  const rangeHeader = request.headers.get("range");
  const rangeHeaders = rangeHeader ? new Headers({ Range: rangeHeader }) : undefined;
  const object = await store.get(media.storageKey, rangeHeaders ? { range: rangeHeaders } : undefined);
  if (!object) return Response.json({ error: "Arquivo não encontrado no storage." }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", media.mimeType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  if (object.range) {
    const end = object.range.offset + object.range.length - 1;
    headers.set("Content-Range", `bytes ${object.range.offset}-${end}/${object.size}`);
    headers.set("Content-Length", String(object.range.length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}
