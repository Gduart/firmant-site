import {
  assertFirmantAdminRequest,
  getAdminActor,
} from "@/lib/admin/firmant-admin-auth";
import { getEnvValue } from "@/lib/cloudflare-runtime";
import { buildContractPdf } from "@/lib/commercial/contract-pdf";
import { sendGmailSmtp } from "@/lib/commercial/gmail-smtp";
import {
  getContractDetails,
  markContractEmailError,
  markContractEmailSent,
  updateContractAction,
} from "@/lib/commercial/repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const actor = getAdminActor(request);
  const user = await getEnvValue("GMAIL_SMTP_USER");
  const appPassword = await getEnvValue("GMAIL_SMTP_APP_PASSWORD");

  if (!user || !appPassword) {
    return Response.json(
      { error: "GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD não configurados." },
      { status: 503 },
    );
  }

  const details = await getContractDetails(id);

  if (!details) {
    return Response.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const recipient = details.contract.email ?? details.order?.customerEmail;

  if (!recipient) {
    return Response.json(
      { error: "E-mail do cliente não encontrado." },
      { status: 400 },
    );
  }

  try {
    await updateContractAction({
      contractId: id,
      action: "gerar_pdf",
      createdBy: actor,
      note: "Contrato PDF gerado para envio por e-mail.",
    });

    const refreshedDetails = await getContractDetails(id);
    if (!refreshedDetails) {
      throw new Error("Contrato não encontrado após geração do PDF.");
    }

    const pdf = buildContractPdf({
      contract: refreshedDetails.contract,
      order: refreshedDetails.order,
    });
    const order = refreshedDetails.order;
    const subject = `Contrato FIRMANT — Pedido #${shortId(refreshedDetails.contract.order_id)}`;
    const text = buildEmailBody({
      name: refreshedDetails.contract.full_name ?? order?.customerName ?? "Cliente",
      orderId: refreshedDetails.contract.order_id,
      service: summarizeServices(order?.serviceSnapshot),
      value: formatCurrency(order?.amount ?? refreshedDetails.contract.amount ?? 0),
      paymentMethod: order?.paymentMethodPreference ?? "Não informado",
      paymentStatus: refreshedDetails.contract.order_status ?? order?.status ?? "Não informado",
    });

    await sendGmailSmtp({
      user,
      appPassword,
      to: recipient,
      cc: body?.copyToFirmant ? [user] : [],
      subject,
      text,
      attachments: [
        {
          filename: `${refreshedDetails.contract.contract_number}.pdf`,
          contentType: "application/pdf",
          data: pdf,
        },
      ],
    });

    const contract = await markContractEmailSent({
      contractId: id,
      emailSentTo: recipient,
      createdBy: actor,
    });

    return Response.json({ contract });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Falha ao enviar contrato por e-mail.";
    await markContractEmailError({
      contractId: id,
      emailSentTo: recipient,
      error: message,
      createdBy: actor,
    }).catch(() => undefined);

    return Response.json({ error: message }, { status: 500 });
  }
}

function buildEmailBody(params: {
  name: string;
  orderId: string;
  service: string;
  value: string;
  paymentMethod: string;
  paymentStatus: string;
}) {
  return [
    `Olá, ${params.name}.`,
    "",
    "Recebemos sua contratação junto à FIRMANT.",
    "",
    `Em anexo, enviamos o contrato/termo de contratação referente ao pedido #${shortId(params.orderId)}, com o resumo dos serviços solicitados, condições comerciais, políticas aplicáveis e informações gerais sobre a execução.`,
    "",
    "Dados principais:",
    `- Serviço: ${params.service}`,
    `- Valor: ${params.value}`,
    `- Forma de pagamento: ${params.paymentMethod}`,
    `- Status do pagamento: ${params.paymentStatus}`,
    "",
    "Em caso de dúvidas, responda este e-mail ou entre em contato pelo WhatsApp oficial da FIRMANT.",
    "",
    "Atenciosamente,",
    "FIRMANT",
    "ag.firmant@gmail.com",
    "+55 11 91491-2488",
  ].join("\n");
}

function summarizeServices(snapshot?: string | null) {
  if (!snapshot) {
    return "Serviço FIRMANT";
  }

  try {
    const services = JSON.parse(snapshot) as Array<{ serviceLabel?: string }>;
    if (!Array.isArray(services) || services.length === 0) {
      return "Serviço FIRMANT";
    }

    return services.map((service) => service.serviceLabel).filter(Boolean).join(", ");
  } catch {
    return "Serviço FIRMANT";
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function shortId(value: string) {
  return value.slice(0, 8);
}
