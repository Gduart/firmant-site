import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { getCustomerDetails } from "@/lib/commercial/repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const customer = await getCustomerDetails(id);

  if (!customer) {
    return Response.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  return Response.json(customer);
}

