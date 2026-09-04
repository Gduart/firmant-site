import { createProposalMilestoneCheckout } from "@/lib/proposals/payment-service";
import {
  acceptPublicProposal,
  getPublicProposal,
  rejectPublicProposal,
} from "@/lib/proposals/repository";
import type { CheckoutPaymentMethod } from "@/lib/payments/types";
import { assertSameOrigin, getRequestContext } from "@/lib/workflow/request-context";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const { token } = await context.params;
    const body = await request.json();
    const contextData = getRequestContext(request);
    if (body?.decision === "REJECTED") {
      await rejectPublicProposal({
        token,
        signerName: String(body?.signerName ?? ""),
        signerEmail: String(body?.signerEmail ?? ""),
        reason: String(body?.reason ?? ""),
        ...contextData,
      });
      return Response.json({ decision: "REJECTED" });
    }

    const paymentMethod = String(body?.paymentMethod ?? "") as CheckoutPaymentMethod;
    if (!["PIX", "CREDIT_CARD", "BOLETO"].includes(paymentMethod)) {
      throw new Error("Selecione uma forma de pagamento válida.");
    }
    if (body?.consent !== true) {
      throw new Error("Confirme a leitura e o aceite da proposta.");
    }
    const accepted = await acceptPublicProposal({
      token,
      signerName: String(body?.signerName ?? ""),
      signerEmail: String(body?.signerEmail ?? ""),
      paymentMethod,
      consentText: "Declaro que li e aceito integralmente esta proposta comercial e seus termos.",
      ...contextData,
    });
    const publicProposal = await getPublicProposal(token, false);
    if (!accepted.firstMilestone || !publicProposal || publicProposal.expired || !publicProposal.snapshot) {
      throw new Error("Aceite registrado, mas não foi possível localizar a primeira etapa de pagamento.");
    }
    const payment = await createProposalMilestoneCheckout({
      milestoneId: accepted.firstMilestone.id,
      paymentMethod,
      snapshot: publicProposal.snapshot,
      installmentCount: paymentMethod === "CREDIT_CARD" ? Number(body?.installmentCount) : undefined,
      customerCpfCnpj: paymentMethod === "CREDIT_CARD" ? String(body?.payerDocument ?? "") : undefined,
    });
    return Response.json({ decision: "ACCEPTED", project: accepted.project, payment });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao registrar a decisão." },
      { status: 400 },
    );
  }
}
