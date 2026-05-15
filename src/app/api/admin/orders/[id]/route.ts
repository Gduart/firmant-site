import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { getOrderDetails } from "@/lib/commercial/repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const order = await getOrderDetails(id);

  if (!order) {
    return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  return Response.json(order);
}

