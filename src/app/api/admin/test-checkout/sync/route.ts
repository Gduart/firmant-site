import { NextResponse } from "next/server";

import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { AsaasApiError } from "@/lib/payments/asaas/client";
import { syncProductionSmokeTestPayments } from "@/lib/payments/payment-service";

export async function POST(request: Request) {
  const unauthorized = await assertFirmantAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const result = await syncProductionSmokeTestPayments();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao sincronizar pagamentos de teste.",
        details: error instanceof AsaasApiError ? error.details : undefined,
      },
      { status: 500 },
    );
  }
}
