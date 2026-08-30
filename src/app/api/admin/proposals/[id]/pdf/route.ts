import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { buildProposalPdf } from "@/lib/proposals/proposal-pdf";
import { getLatestProposalSnapshot } from "@/lib/proposals/repository";
type RouteContext = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: RouteContext) { const authError = await assertFirmantAdminRequest(request); if (authError) return authError; const { id } = await context.params; const snapshot = await getLatestProposalSnapshot(id); if (!snapshot) return Response.json({ error: "Publique uma versão antes de gerar o PDF." }, { status: 404 }); const pdf = buildProposalPdf(snapshot); return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${snapshot.proposal.proposal_number}.pdf"`, "Cache-Control": "private, no-store" } }); }
