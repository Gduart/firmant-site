import {
  assertFirmantAdminRequest,
  getAdminActor,
} from "@/lib/admin/firmant-admin-auth";
import {
  addCustomerNote,
  listCustomers,
} from "@/lib/commercial/repository";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const customers = await listCustomers({
    q: url.searchParams.get("q") ?? undefined,
  });

  return Response.json({ customers });
}

export async function POST(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const note = await addCustomerNote({
      customerId: String(body?.customerId ?? ""),
      note: String(body?.note ?? ""),
      createdBy: getAdminActor(request),
    });

    return Response.json({ note });
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

