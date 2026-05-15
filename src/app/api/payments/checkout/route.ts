import { NextResponse } from "next/server";

import { createOneTimeCheckout } from "@/lib/payments/payment-service";
import type { CheckoutPaymentMethod } from "@/lib/payments/types";

const validMethods = new Set<CheckoutPaymentMethod>([
  "PIX",
  "CREDIT_CARD",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentMethod = body?.paymentMethod as CheckoutPaymentMethod | undefined;

    if (!paymentMethod || !validMethods.has(paymentMethod)) {
      return NextResponse.json(
        { error: "Forma de pagamento inválida." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body?.selections) || body.selections.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos um item para pagamento." },
        { status: 400 },
      );
    }

    if (!body?.clientData?.name || !body?.clientData?.email || !body?.clientData?.whatsapp) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e WhatsApp." },
        { status: 400 },
      );
    }

    const result = await createOneTimeCheckout({
      selections: body.selections,
      clientData: body.clientData,
      paymentMethod,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao gerar checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
