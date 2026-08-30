import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { getProposalDetails, updateProposal } from "@/lib/proposals/repository";
import type { ProposalEditorInput } from "@/lib/proposals/types";
import { assertSameOrigin } from "@/lib/workflow/request-context";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const { id } = await context.params;
  const proposal = await getProposalDetails(id);
  return proposal
    ? Response.json(proposal)
    : Response.json({ error: "Proposta não encontrada." }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const { id } = await context.params;
    const body = await request.json() as ProposalEditorInput;
    return Response.json(await updateProposal(id, body));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao atualizar proposta." },
      { status: 400 },
    );
  }
}
