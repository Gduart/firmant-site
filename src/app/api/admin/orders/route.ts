import {
  assertFirmantAdminRequest,
  getAdminActor,
} from "@/lib/admin/firmant-admin-auth";
import {
  addOrderNote,
  listOrders,
} from "@/lib/commercial/repository";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const orders = await listOrders({
    q: url.searchParams.get("q") ?? undefined,
    paymentStatus: url.searchParams.get("paymentStatus") ?? undefined,
    contractStatus: url.searchParams.get("contractStatus") ?? undefined,
    contractType: url.searchParams.get("contractType") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    customerId: url.searchParams.get("customerId") ?? undefined,
  });

  return Response.json({ orders });
}

export async function POST(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await addOrderNote({
      orderId: String(body?.orderId ?? ""),
      note: String(body?.note ?? ""),
      createdBy: getAdminActor(request),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao salvar observação.",
      },
      { status: 400 },
    );
  }
}

