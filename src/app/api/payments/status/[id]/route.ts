import { NextResponse } from "next/server";

import { getOrderStatus } from "@/lib/payments/payment-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await getOrderStatus(id);

    if (!result.order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao consultar pedido.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
