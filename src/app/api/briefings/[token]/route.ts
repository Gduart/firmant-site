import {
  getBriefingByToken,
  getPublicBriefing,
  saveBriefingDraft,
  submitBriefing,
} from "@/lib/briefings/repository";
import type { BriefingDraftInput } from "@/lib/briefings/types";
import { assertSameOrigin, getRequestContext } from "@/lib/workflow/request-context";
import { recordAuditEvent } from "@/lib/workflow/audit";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const result = await getPublicBriefing(token);
  if (!result) {
    return Response.json({ error: "Link de briefing inválido." }, { status: 404 });
  }
  if (
    result.briefing.link_expires_at
    && new Date(result.briefing.link_expires_at).getTime() < Date.now()
  ) {
    return Response.json({ error: "Este link de briefing expirou." }, { status: 410 });
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { token } = await context.params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) {
    return Response.json({ error: "Link de briefing inválido." }, { status: 404 });
  }

  try {
    const input = await request.json() as BriefingDraftInput;
    const updated = await saveBriefingDraft(briefing, input);
    const requestContext = getRequestContext(request);
    await recordAuditEvent({
      entityType: "BRIEFING",
      entityId: briefing.id,
      eventType: "BRIEFING_DRAFT_SAVED",
      actorType: "CLIENT",
      actorId: updated?.email,
      ...requestContext,
    });
    return Response.json({ briefing: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar briefing." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { token } = await context.params;
  const briefing = await getBriefingByToken(token);
  if (!briefing) {
    return Response.json({ error: "Link de briefing inválido." }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action !== "submit") {
      return Response.json({ error: "Ação inválida." }, { status: 400 });
    }
    const updated = await submitBriefing(briefing);
    return Response.json({ briefing: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao enviar briefing." },
      { status: 400 },
    );
  }
}
