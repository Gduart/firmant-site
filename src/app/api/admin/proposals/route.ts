import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { createProposalFromBriefing, listProposals } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const url = new URL(request.url);
  const proposals = await listProposals({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return Response.json({ proposals });
}

export async function POST(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const body = await request.json();
    const proposal = await createProposalFromBriefing({
      briefingId: String(body?.briefingId ?? ""),
      createdBy: getAdminActor(request),
    });
    return Response.json(proposal, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao criar proposta." },
      { status: 400 },
    );
  }
}
