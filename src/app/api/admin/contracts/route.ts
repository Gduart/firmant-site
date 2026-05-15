import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { listContracts } from "@/lib/commercial/repository";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const contracts = await listContracts({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
  });

  return Response.json({ contracts });
}

