import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { getPublicProposalMedia } from "@/lib/proposals/repository";

export async function serveProposalMedia(request: Request, token: string, assetId: string) {
  const media = await getPublicProposalMedia(token, assetId);
  if (!media) return Response.json({ error: "Mídia não encontrada." }, { status: 404 });
  const store = await getPrivateAssetsStore();
  const rangeHeader = request.headers.get("range");
  const rangeHeaders = rangeHeader ? new Headers({ Range: rangeHeader }) : undefined;
  const object = await store.get(media.storageKey, rangeHeaders ? { range: rangeHeaders } : undefined);
  if (!object) return Response.json({ error: "Mídia não encontrada no storage." }, { status: 404 });
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
