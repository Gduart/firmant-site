import { NextResponse } from "next/server";

import {
  processAsaasWebhook,
  validateAsaasWebhookToken,
} from "@/lib/payments/webhook-service";

export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token");
  const isValidToken = await validateAsaasWebhookToken(token);

  if (!isValidToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const result = await processAsaasWebhook(payload);

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      processed: result.processed ?? true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar webhook.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
