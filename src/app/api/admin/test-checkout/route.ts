import { NextResponse } from "next/server";

import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { createProductionSmokeTestCheckout } from "@/lib/payments/payment-service";

export async function POST(request: Request) {
  const unauthorized = await assertFirmantAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const result = await createProductionSmokeTestCheckout();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao criar checkout de teste.",
      },
      { status: 500 },
    );
  }
}
