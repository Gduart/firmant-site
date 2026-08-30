import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { getBriefingDetailsById } from "@/lib/briefings/repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const result = await getBriefingDetailsById(id);
  if (!result) {
    return Response.json({ error: "Briefing não encontrado." }, { status: 404 });
  }
  return Response.json(result);
}
