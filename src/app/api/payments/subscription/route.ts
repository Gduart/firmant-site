import { NextResponse } from "next/server";

import { createRecurringCheckout } from "@/lib/payments/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body?.selections) || body.selections.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos um item para assinatura." },
        { status: 400 },
      );
    }

    if (!body?.clientData?.name || !body?.clientData?.email || !body?.clientData?.whatsapp) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e WhatsApp." },
        { status: 400 },
      );
    }

    const result = await createRecurringCheckout({
      selections: body.selections,
      clientData: body.clientData,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao gerar assinatura.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
