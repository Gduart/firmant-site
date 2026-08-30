import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import {
  getBriefingAttachment,
  markBriefingAttachmentDeleted,
} from "@/lib/briefings/repository";
import { getPrivateAssetsStore } from "@/lib/cloudflare-runtime";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id, attachmentId } = await context.params;
  const attachment = await getBriefingAttachment(attachmentId, id);
  if (!attachment) {
    return Response.json({ error: "Anexo não encontrado." }, { status: 404 });
  }
  const store = await getPrivateAssetsStore();
  const object = await store.get(attachment.storage_key);
  if (!object) {
    return Response.json({ error: "Arquivo não encontrado no storage." }, { status: 404 });
  }
  return privateObjectResponse(object, attachment.mime_type, attachment.original_filename);
}

export async function DELETE(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const { id, attachmentId } = await context.params;
  const attachment = await getBriefingAttachment(attachmentId, id);
  if (!attachment) {
    return Response.json({ error: "Anexo não encontrado." }, { status: 404 });
  }
  const store = await getPrivateAssetsStore();
  await store.delete(attachment.storage_key);
  await markBriefingAttachmentDeleted(attachment.id, id);
  return Response.json({ ok: true });
}

function privateObjectResponse(
  object: Awaited<ReturnType<Awaited<ReturnType<typeof getPrivateAssetsStore>>["get"]>> & {},
  contentType: string,
  filename: string,
) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", contentType);
  headers.set("Content-Length", String(object.size));
  headers.set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(filename)}`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}
