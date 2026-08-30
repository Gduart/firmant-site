import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { publishReviewLink } from "@/lib/reviews/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const { id } = await context.params;
    return Response.json(await publishReviewLink({ assetId: id, createdBy: getAdminActor(request) }));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao publicar revisão." }, { status: 400 });
  }
}
