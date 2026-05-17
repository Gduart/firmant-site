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

    if (!isValidClientData(body?.clientData)) {
      return NextResponse.json(
        { error: "Preencha nome, CPF, e-mail, WhatsApp, CEP, endereço, número e bairro." },
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

function isValidClientData(clientData: Record<string, unknown> | undefined) {
  if (!clientData) {
    return false;
  }

  return Boolean(
    clientData.name
    && String(clientData.cpf ?? "").replace(/\D/g, "").length === 11
    && clientData.email
    && [10, 11].includes(String(clientData.whatsapp ?? "").replace(/\D/g, "").length)
    && String(clientData.postalCode ?? "").replace(/\D/g, "").length === 8
    && clientData.address
    && clientData.addressNumber
    && clientData.province
  );
}
