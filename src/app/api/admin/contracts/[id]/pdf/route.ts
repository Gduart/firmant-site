import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { buildContractPdf } from "@/lib/commercial/contract-pdf";
import { getContractDetails } from "@/lib/commercial/repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const details = await getContractDetails(id);

  if (!details) {
    return Response.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const pdf = buildContractPdf({
    contract: details.contract,
    order: details.order,
  });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${details.contract.contract_number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

