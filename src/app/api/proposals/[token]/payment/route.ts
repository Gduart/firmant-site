import type { CheckoutPaymentMethod } from "@/lib/payments/types";
import { createProposalMilestoneCheckout } from "@/lib/proposals/payment-service";
import { getPublicProposal } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";
type RouteContext = { params: Promise<{ token: string }> };
export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request); if (originError) return originError;
  try {
    const { token } = await context.params; const result = await getPublicProposal(token, false);
    const body = await request.json().catch(() => ({}));
    if (!result || result.expired || !result.snapshot || result.acceptance?.decision !== "ACCEPTED") throw new Error("A proposta ainda não possui aceite válido.");
    const milestoneId = result.payment?.milestone_id; const paymentMethod = result.payment?.payment_method as CheckoutPaymentMethod | null;
    if (!milestoneId || !paymentMethod || !["PIX", "CREDIT_CARD", "BOLETO"].includes(paymentMethod)) throw new Error("Etapa ou forma de pagamento não encontrada.");
    return Response.json(await createProposalMilestoneCheckout({ milestoneId, paymentMethod, snapshot: result.snapshot, installmentCount: paymentMethod === "CREDIT_CARD" ? Number(body?.installmentCount) : undefined, customerCpfCnpj: paymentMethod === "CREDIT_CARD" ? String(body?.payerDocument ?? "") : undefined, forceNew: body?.regenerate === true }));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Falha ao gerar pagamento." }, { status: 400 }); }
}
