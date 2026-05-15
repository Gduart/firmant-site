import {
  assertFirmantAdminRequest,
  getAdminActor,
} from "@/lib/admin/firmant-admin-auth";
import {
  getContractDetails,
  updateContractAction,
} from "@/lib/commercial/repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const contract = await getContractDetails(id);

  if (!contract) {
    return Response.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  return Response.json(contract);
}

export async function POST(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const contract = await updateContractAction({
      contractId: id,
      action: body?.action,
      emailSentTo: body?.emailSentTo,
      autentiqueUrl: body?.autentiqueUrl,
      autentiqueDocumentId: body?.autentiqueDocumentId,
      note: body?.note,
      createdBy: getAdminActor(request),
    });

    return Response.json({ contract });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao atualizar contrato.",
      },
      { status: 400 },
    );
  }
}

