import { assertFirmantAdminRequest, getAdminActor } from "@/lib/admin/firmant-admin-auth";
import { getEnvValue } from "@/lib/cloudflare-runtime";
import { sendGmailSmtp } from "@/lib/commercial/gmail-smtp";
import { buildProposalPdf } from "@/lib/proposals/proposal-pdf";
import { getPublicProposal, publishProposal } from "@/lib/proposals/repository";
import { assertSameOrigin } from "@/lib/workflow/request-context";
import { workflowNow, workflowRun } from "@/lib/workflow/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await publishProposal({
      proposalId: id,
      createdBy: getAdminActor(request),
    });
    const publicUrl = result.publicUrl.startsWith("http")
      ? result.publicUrl
      : `${new URL(request.url).origin}${result.publicUrl}`;
    let emailSent = false;
    let emailError: string | null = null;
    if (body?.sendEmail) {
      try {
        const token = publicUrl.split("/proposta/")[1]?.split(/[?#]/)[0];
        const publicProposal = token ? await getPublicProposal(token, false) : null;
        if (!publicProposal || publicProposal.expired || !publicProposal.snapshot) {
          throw new Error("Não foi possível preparar a versão publicada para envio.");
        }
        const user = await getEnvValue("GMAIL_SMTP_USER");
        const appPassword = await getEnvValue("GMAIL_SMTP_APP_PASSWORD");
        if (!user || !appPassword) throw new Error("GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD não configurados.");
        const snapshot = publicProposal.snapshot;
        const now = workflowNow();
        const eventId = crypto.randomUUID();
        const idempotencyKey = `proposal:${id}:version:${snapshot.proposal.current_version}:email`;
        await workflowRun(
          `INSERT INTO email_events (id, entity_type, entity_id, template_key, recipient, subject, status, idempotency_key, attempts, last_error, sent_at, created_at, updated_at)
           VALUES (?, 'PROPOSAL', ?, 'PROPOSAL_PUBLISHED', ?, ?, 'PENDING', ?, 1, NULL, NULL, ?, ?)
           ON CONFLICT(idempotency_key) DO UPDATE SET attempts = attempts + 1, status = 'PENDING', last_error = NULL, updated_at = excluded.updated_at`,
          [eventId, id, snapshot.proposal.client_email, `Proposta FIRMANT — ${snapshot.proposal.project_name}`, idempotencyKey, now, now],
        );
        await sendGmailSmtp({
          user,
          appPassword,
          to: snapshot.proposal.client_email,
          subject: `Proposta FIRMANT — ${snapshot.proposal.project_name}`,
          text: [
            `Olá, ${snapshot.proposal.client_name}.`, "",
            `A proposta ${snapshot.proposal.proposal_number} para ${snapshot.proposal.project_name} está pronta.`,
            `Acesse o link exclusivo para consultar, aprovar e escolher a forma de pagamento:`, publicUrl, "",
            "O link é pessoal e temporário. Em anexo, segue uma cópia em PDF.", "",
            "Atenciosamente,", "FIRMANT", "ag.firmant@gmail.com", "+55 11 91491-2488",
          ].join("\n"),
          attachments: [{ filename: `${snapshot.proposal.proposal_number}.pdf`, contentType: "application/pdf", data: buildProposalPdf(snapshot) }],
        });
        await workflowRun("UPDATE email_events SET status = 'SENT', sent_at = ?, updated_at = ? WHERE idempotency_key = ?", [workflowNow(), workflowNow(), idempotencyKey]);
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Falha ao enviar o e-mail.";
        await workflowRun("UPDATE email_events SET status = 'FAILED', last_error = ?, updated_at = ? WHERE entity_type = 'PROPOSAL' AND entity_id = ? AND status = 'PENDING'", [emailError, workflowNow(), id]).catch(() => undefined);
      }
    }
    return Response.json({ ...result, publicUrl, emailSent, emailError });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao publicar proposta." },
      { status: 400 },
    );
  }
}
