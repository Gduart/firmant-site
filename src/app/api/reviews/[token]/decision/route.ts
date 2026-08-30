import { decideReview } from "@/lib/reviews/repository";
import type { ReviewFeedbackInput } from "@/lib/reviews/types";
import { assertSameOrigin, getRequestContext } from "@/lib/workflow/request-context";
type RouteContext = { params: Promise<{ token: string }> };
export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request); if (originError) return originError;
  try { const { token } = await context.params; const body = await request.json(); const decision = body?.decision === "APPROVED" ? "APPROVED" : "REVISION_REQUESTED"; if (decision === "APPROVED" && body?.consent !== true) throw new Error("Confirme a aprovação desta versão."); const feedback = Array.isArray(body?.feedback) ? body.feedback as ReviewFeedbackInput[] : []; return Response.json(await decideReview({ token, decision, authorName: String(body?.authorName ?? ""), authorEmail: String(body?.authorEmail ?? ""), confirmationText: decision === "APPROVED" ? "Aprovo esta versão do conteúdo para finalização e uso conforme o projeto." : "Solicito os ajustes registrados nesta rodada.", feedback, ...getRequestContext(request) })); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Falha ao registrar decisão." }, { status: 400 }); }
}
