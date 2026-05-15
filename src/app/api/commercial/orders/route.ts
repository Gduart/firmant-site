import { NextResponse } from "next/server";

import { registerCommercialOrder } from "@/lib/commercial/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientData = body?.clientData;
    const orderId = String(body?.orderId ?? "");

    if (!orderId || !clientData) {
      return NextResponse.json(
        { error: "Pedido e dados do cliente são obrigatórios." },
        { status: 400 },
      );
    }

    if (
      !clientData.name
      || !clientData.cpf
      || !clientData.email
      || !clientData.whatsapp
      || !clientData.instagram
    ) {
      return NextResponse.json(
        { error: "Preencha nome, CPF, e-mail, WhatsApp e Instagram." },
        { status: 400 },
      );
    }

    const cpf = String(clientData.cpf).replace(/\D/g, "");
    if (cpf.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido. Informe os 11 dígitos." },
        { status: 400 },
      );
    }

    const result = await registerCommercialOrder({
      orderId,
      fullName: String(clientData.name),
      cpf,
      email: String(clientData.email),
      phone: String(clientData.whatsapp),
      instagram: String(clientData.instagram),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao registrar dados comerciais.",
      },
      { status: 500 },
    );
  }
}

