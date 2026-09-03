import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import type { CheckoutPaymentMethod } from "@/lib/payments/types";
import { createProposalMilestoneCheckout } from "@/lib/proposals/payment-service";
import { getLatestProposalSnapshot, getProposalMilestone } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";
type RouteContext = { params: Promise<{ id: string; milestoneId: string }> };
export async function POST(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request); if (authError) return authError;
  const originError = assertSameOrigin(request); if (originError) return originError;
  try {
    const { id, milestoneId } = await context.params; const body = await request.json();
    const paymentMethod = String(body?.paymentMethod ?? "") as CheckoutPaymentMethod;
    if (!["PIX", "CREDIT_CARD", "BOLETO"].includes(paymentMethod)) throw new Error("Forma de pagamento inválida.");
    const [snapshot, milestone] = await Promise.all([getLatestProposalSnapshot(id), getProposalMilestone(milestoneId)]);
    if (!snapshot || !milestone || milestone.proposal_id !== id) throw new Error("Proposta ou etapa não encontrada.");
    const allowed = JSON.parse(snapshot.proposal.payment_methods_json) as string[];
    if (!allowed.includes(paymentMethod)) throw new Error("Forma de pagamento não permitida nesta proposta.");
    return Response.json(await createProposalMilestoneCheckout({
      milestoneId,
      paymentMethod,
      snapshot,
      forceNew: body?.regenerate === true,
    }));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Falha ao gerar cobrança." }, { status: 400 }); }
}
