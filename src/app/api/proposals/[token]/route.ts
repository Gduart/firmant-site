import { getPublicProposal } from "@/lib/proposals/repository";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const proposal = await getPublicProposal(token);
  if (!proposal) return Response.json({ error: "Proposta não encontrada." }, { status: 404 });
  if (proposal.expired) return Response.json({ error: "Esta proposta expirou." }, { status: 410 });
  return Response.json(proposal, { headers: { "Cache-Control": "no-store" } });
}
