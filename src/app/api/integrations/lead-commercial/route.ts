import { getEnvValue } from "@/lib/cloudflare-runtime";
import { GmailSmtpError, sendGmailSmtp, verifyGmailSmtp } from "@/lib/commercial/gmail-smtp";
import { generateQuote } from "@/lib/lead-quotes/agent";
import { number, paymentPolicy, paymentSplit, text, validateDeliveryRecipient, validateDocument, validateLead } from "@/lib/lead-quotes/model";
import { buildQuotePdf, currency, quoteReference } from "@/lib/lead-quotes/pdf";
import { createQuotePayment } from "@/lib/lead-quotes/payment";
import { validateAsaasEnvironment } from "@/lib/payments/asaas/client";
import { approveQuote, event, latestQuote, paymentHistory, quoteEvents, requireQuote, writeQuote } from "@/lib/lead-quotes/repository";
import { boundedText, verifyCommercial } from "@/lib/lead-quotes/signing";
import { workflowFirst, workflowRun } from "@/lib/workflow/db";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
export async function POST(request: Request) {
  const secret = await getEnvValue("DIAGNOSTICO_COMMERCIAL_SECRET");
  if (!secret || secret.length < 32) return Response.json({ error: "Configure a conexão comercial entre o Diagnóstico e o site." }, { status: 503, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Formato inválido." }, { status: 415, headers });
  let raw: string;
  try { raw = await boundedText(request, 180_000); } catch { return Response.json({ error: "Solicitação inválida ou muito grande." }, { status: 413, headers }); }
  if (!await verifyCommercial(raw, request.headers.get("x-firmant-timestamp") ?? "", request.headers.get("x-firmant-signature") ?? "", secret)) return Response.json({ error: "Não autorizado." }, { status: 401, headers });
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    const lead = validateLead(body.lead);
    const actor = text(body.actor, "administrador", 160, true);
    const action = text(body.action, "ação", 30, true);
    if (!["get", "check-email", "generate", "save", "approve", "pdf", "send-pdf", "payment", "send-payment"].includes(action)) throw new Error("Ação inválida.");
    const revision = action === "get" ? 0 : number(body.revision, "versão", 0, 10000, true);
    const input = body.input && typeof body.input === "object" && !Array.isArray(body.input) ? body.input as Record<string, unknown> : {};
    if (action === "get") {
      const [smtpUser, smtpPassword, asaasKey, asaasBase] = await Promise.all([getEnvValue("GMAIL_SMTP_USER"), getEnvValue("GMAIL_SMTP_APP_PASSWORD"), getEnvValue("ASAAS_API_KEY"), getEnvValue("ASAAS_API_BASE_URL")]);
      return Response.json({ quote: await latestQuote(lead.reference), payments: await paymentHistory(lead.reference), events: await quoteEvents(lead.reference), readiness: { email: Boolean(smtpUser && smtpPassword), payment: Boolean(asaasKey && asaasBase), paymentEnvironment: asaasBase?.includes("sandbox") ? "sandbox" : "produção" } }, { headers });
    }
    if (action === "save" || action === "generate") {
      const current = await latestQuote(lead.reference);
      if ((current?.revision ?? 0) !== revision) throw new Error("A versão mudou. Recarregue antes de continuar.");
      const document = action === "generate" ? await generateQuote(lead, input) : { ...validateDocument(input.document), paymentTerms: paymentPolicy };
      const quote = await writeQuote(lead, document, revision, actor, action === "generate" ? "gpt-6-luna" : current?.model ?? null);
      await event(lead.reference, quote.revision, action, actor, action === "generate" ? "Rascunho da IA; revisão humana obrigatória." : "Nova versão salva; aprovação anterior não se aplica.");
      return Response.json({ quote }, { headers });
    }
    if (action === "check-email") {
      const [user, appPassword] = await Promise.all([getEnvValue("GMAIL_SMTP_USER"), getEnvValue("GMAIL_SMTP_APP_PASSWORD")]);
      if (!user || !appPassword) throw new Error("Configure a autenticação Gmail neste ambiente.");
      try { await verifyGmailSmtp({ user, appPassword }); }
      catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Falha de autenticação Gmail.", ...(process.env.NODE_ENV === "development" ? { diagnostic: error instanceof GmailSmtpError ? error.diagnostic : "", transport: process.env.GMAIL_SMTP_PORT === "587" ? "STARTTLS 587" : "TLS 465", systemCa: process.env.NODE_USE_SYSTEM_CA === "1" } : {}) }, { status: 400, headers }); }
      return Response.json({ message: "Gmail autenticado; nenhuma mensagem enviada." }, { headers });
    }
    if (action === "approve") {
      const quote = await approveQuote(lead.reference, revision, actor);
      await event(lead.reference, revision, action, actor, "Versão revisada e aprovada pelo administrador.");
      return Response.json({ quote }, { headers });
    }
    const quote = await requireQuote(lead.reference, revision, true);
    if (action === "pdf") return new Response(buildQuotePdf(quote) as BodyInit, { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${quoteReference(quote)}.pdf"` } });
    if (action === "payment") {
      const [asaasKey, asaasBase] = await Promise.all([getEnvValue("ASAAS_API_KEY"), getEnvValue("ASAAS_API_BASE_URL")]);
      if (!asaasKey || !asaasBase) throw new Error("Pagamento indisponível: configure as credenciais do Asaas neste ambiente antes de gerar o link. Nenhuma cobrança foi criada.");
      validateAsaasEnvironment(asaasBase, asaasKey);
      const payment = await createQuotePayment(quote, { ...input, requestKey: body.requestId });
      await event(lead.reference, revision, action, actor, `Cobrança ${payment.id}; ${currency(payment.amount_cents)}; valor total confirmado pelo administrador.`);
      return Response.json({ payment, payments: await paymentHistory(lead.reference) }, { headers });
    }
    const [user, appPassword] = await Promise.all([getEnvValue("GMAIL_SMTP_USER"), getEnvValue("GMAIL_SMTP_APP_PASSWORD")]);
    if (!user || !appPassword) throw new Error("Envio automático pendente: configure a conta Gmail e a senha de app neste ambiente. Você pode baixar o PDF e anexá-lo no Gmail.");
    let recipient: string;
    try { recipient = validateDeliveryRecipient(input.recipient ?? quote.lead.email); }
    catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Destinatário inválido.", safeToRetry: true }, { status: 400, headers }); }
    const requestId = text(body.requestId, "identificador de envio", 36, true);
    if (!/^[a-f0-9-]{36}$/i.test(requestId)) throw new Error("Identificador inválido.");
    let checkoutUrl = "";
    if (action === "send-payment") {
      const payments = await paymentHistory(lead.reference);
      const payment = payments.find(p => p.id === input.paymentId && p.revision === revision);
      if (!payment?.checkout_url || payment.state !== "READY" || payment.expires_at <= new Date().toISOString() || ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "CANCELED", "REFUNDED", "FAILED"].includes(payment.order_status ?? "")) throw new Error("Selecione um link válido e pendente desta versão.");
      checkoutUrl = payment.checkout_url;
    }
    // Reserva persistida impede duplicar o mesmo envio após timeout/reenvio HTTP.
    const reserved = await workflowFirst<{ id: string }>("INSERT INTO lead_quote_events(id,lead_reference,revision,action,actor,created_at,detail) VALUES(?,?,?,?,?,?,?) ON CONFLICT DO NOTHING RETURNING id", [requestId, lead.reference, revision, action, actor, new Date().toISOString(), "Envio solicitado; aguardando confirmação SMTP."]);
    if (!reserved) {
      const previous = await workflowFirst<{ detail: string }>("SELECT detail FROM lead_quote_events WHERE id=? AND lead_reference=? AND revision=? AND action=?", [requestId, lead.reference, revision, action]);
      if (previous?.detail.startsWith("Enviado para ")) return Response.json({ message: previous.detail }, { headers });
      throw new Error("Este envio já foi solicitado. Confira o e-mail e o histórico antes de repetir.");
    }
    try {
      const split = paymentSplit(quote.totalCents);
      // Monta o anexo antes de abrir SMTP: falha de PDF não indica envio incerto.
      let pdf: Uint8Array | undefined;
      try { if (!checkoutUrl) pdf = buildQuotePdf(quote); }
      catch { throw new Error("Não foi possível gerar o PDF; nenhum e-mail foi enviado."); }
      await sendGmailSmtp({ user, appPassword, to: recipient, subject: `${checkoutUrl ? "Pagamento" : "Orçamento"} FIRMANT — ${quoteReference(quote)}`,
        text: [`Olá, ${quote.lead.name}.`, "", checkoutUrl ? `Conforme combinado, segue seu link de pagamento:\n${checkoutUrl}\n\nO pagamento é concluído no ambiente seguro do Asaas. O link possui validade limitada.` : `Segue em anexo o orçamento revisado para ${quote.document.title}.\nInvestimento total: ${currency(quote.totalCents)}.\nSinal de entrada de 50%: ${currency(split.deposit)}.\n50% na entrega do projeto: ${currency(split.balance)}.\n${paymentPolicy}\nValidade: ${quote.document.validityDays} dias contados da emissão desta versão.`, "", "Se tiver dúvidas, responda a este e-mail.", "Equipe FIRMANT", "ag.firmant@gmail.com"].join("\n"),
        attachments: pdf ? [{ filename: `${quoteReference(quote)}.pdf`, contentType: "application/pdf", data: pdf }] : [] });
      const message = `Enviado para ${recipient}.`;
      await workflowRun("UPDATE lead_quote_events SET detail=? WHERE id=?", [message, requestId]);
      return Response.json({ message }, { headers });
    } catch (failure) {
      const smtp = failure instanceof GmailSmtpError ? failure : null;
      const pdfFailure = failure instanceof Error && failure.message.startsWith("Não foi possível gerar o PDF;");
      const message = smtp?.message ?? (pdfFailure ? failure.message : "Não foi possível confirmar o envio por e-mail. Confira o Gmail antes de repetir.");
      const safeToRetry = pdfFailure || Boolean(smtp && !smtp.deliveryUncertain);
      const detail = `${safeToRetry ? "Não enviado" : "Resultado incerto"}: ${message}${smtp ? ` Etapa: ${smtp.stage}; código: ${smtp.smtpCode ?? "sem resposta SMTP"}.` : ""}`;
      await workflowRun("UPDATE lead_quote_events SET detail=? WHERE id=?", [detail, requestId]);
      return Response.json({ error: message, safeToRetry }, { status: 400, headers });
    }
  } catch (failure) {
    return Response.json({ error: failure instanceof Error ? failure.message : "Não foi possível concluir a operação." }, { status: 400, headers });
  }
}
