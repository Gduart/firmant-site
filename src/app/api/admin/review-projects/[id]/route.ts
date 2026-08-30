import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { getReviewProject } from "@/lib/reviews/repository";

type RouteContext = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const { id } = await context.params;
  const project = await getReviewProject(id);
  return project ? Response.json(project) : Response.json({ error: "Projeto não encontrado." }, { status: 404 });
}
