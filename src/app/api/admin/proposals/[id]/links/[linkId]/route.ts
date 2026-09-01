import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { setProposalAccessLinkActive } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = { params: Promise<{ id: string; linkId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  try {
    const { id, linkId } = await context.params;
    const body = await request.json() as { active?: unknown };
    if (typeof body.active !== "boolean") {
      return Response.json({ error: "Informe se o link deve ficar ativo ou inativo." }, { status: 400 });
    }
    return Response.json(await setProposalAccessLinkActive({
      proposalId: id,
      linkId,
      active: body.active,
      actorId: getAdminActor(request),
    }));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao alterar o acesso do cliente." },
      { status: 400 },
    );
  }
}
