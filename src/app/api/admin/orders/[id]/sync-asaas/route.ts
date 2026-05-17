import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { AsaasApiError } from "@/lib/payments/asaas/client";
import { syncAsaasPaymentsForOrderId } from "@/lib/payments/payment-service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const result = await syncAsaasPaymentsForOrderId(id);
    return Response.json(result);
  } catch (error) {
    const status = error instanceof AsaasApiError ? 502 : 400;

    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao sincronizar pagamento no Asaas.",
        details: error instanceof AsaasApiError ? error.details : undefined,
      },
      { status },
    );
  }
}
