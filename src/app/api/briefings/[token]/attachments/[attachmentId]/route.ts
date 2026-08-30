import {
  getBriefingAttachment,
  getBriefingByToken,
  markBriefingAttachmentDeleted,
} from "@/lib/briefings/repository";
import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = {
  params: Promise<{ token: string; attachmentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token, attachmentId } = await context.params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) {
    return Response.json({ error: "Link inválido." }, { status: 404 });
  }
  const attachment = await getBriefingAttachment(attachmentId, briefing.id);
  if (!attachment) {
    return Response.json({ error: "Imagem não encontrada." }, { status: 404 });
  }
  const store = await getPrivateAssetsStore();
  const object = await store.get(attachment.storage_key);
  if (!object) {
    return Response.json({ error: "Imagem não encontrada no storage." }, { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", attachment.mime_type);
  headers.set("Content-Length", String(object.size));
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

export async function DELETE(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { token, attachmentId } = await context.params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) {
    return Response.json({ error: "Link inválido." }, { status: 404 });
  }
  if (briefing.status !== "DRAFT" && briefing.status !== "NEEDS_INFORMATION") {
    return Response.json({ error: "Briefing já enviado." }, { status: 409 });
  }
  const attachment = await getBriefingAttachment(attachmentId, briefing.id);
  if (!attachment) {
    return Response.json({ error: "Imagem não encontrada." }, { status: 404 });
  }
  const store = await getPrivateAssetsStore();
  await store.delete(attachment.storage_key);
  await markBriefingAttachmentDeleted(attachment.id, briefing.id);
  return Response.json({ ok: true });
}
