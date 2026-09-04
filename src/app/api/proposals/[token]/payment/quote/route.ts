import { quoteProposalCardPayment } from "@/lib/proposals/card-installments";
import { getPublicProposal } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const { token } = await context.params;
    const body = await request.json();
    const result = await getPublicProposal(token, false);
    if (!result || result.expired || !result.snapshot) {
      throw new Error("Proposta inválida ou expirada.");
    }
    const milestone = result.snapshot.milestones[0];
    if (!milestone) throw new Error("Etapa de pagamento não encontrada.");
    const quote = await quoteProposalCardPayment(
      milestone.amount_cents / 100,
      Number(body?.installmentCount),
    );
    return Response.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao calcular parcelamento." },
      { status: 400 },
    );
  }
}
