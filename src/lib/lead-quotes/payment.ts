import { createAsaasCheckout, buildAsaasCheckoutUrl } from "@/lib/payments/asaas/checkouts";
import { AsaasApiError } from "@/lib/payments/asaas/client";
import { getEnvValue, getRequiredEnvValue } from "@/lib/cloudflare-runtime";
import type { AsaasCheckoutRequest } from "@/lib/payments/asaas/types";
import { insertOrder, updateOrder } from "@/lib/payments/orders-repository";
import { workflowFirst, workflowRun } from "@/lib/workflow/db";
import { number, paymentSplit, text, type QuoteView } from "./model";
import { quoteReference } from "./pdf";
import { type QuotePayment } from "./repository";

export function checkoutPayload(quote: QuoteView, orderId: string, value: number, mode: string, installments: number, baseUrl = "https://firmant.com.br"): AsaasCheckoutRequest {
  if (!["PIX", "CARD", "BOTH"].includes(mode)) throw new Error("Selecione Pix, cartão ou ambas as opções.");
  number(installments, "parcelas", 1, 12, true);
  const card = mode !== "PIX";
  return { billingTypes: mode === "BOTH" ? ["PIX", "CREDIT_CARD"] : mode === "PIX" ? ["PIX"] : ["CREDIT_CARD"],
    chargeTypes: card && installments > 1 ? ["DETACHED", "INSTALLMENT"] : ["DETACHED"], minutesToExpire: 180,
    externalReference: `firmant:lead-quote:${orderId}`, description: quoteReference(quote),
    callback: { successUrl: new URL(`/pagamento/status/${orderId}`, baseUrl).href, cancelUrl: new URL("/pagamento/cancelado", baseUrl).href, expiredUrl: new URL("/pagamento/expirado", baseUrl).href },
    items: [{ name: quote.document.title.slice(0, 30), description: `${quoteReference(quote)} — ${quote.document.title}`.slice(0, 500), quantity: 1, value }],
    ...(card && installments > 1 ? { installment: { maxInstallmentCount: installments } } : {}),
    // O pagador informa documento e dados de cartão diretamente no ambiente Asaas.
  };
}
export type QuotePaymentDependencies = { first: typeof workflowFirst; run: typeof workflowRun; insert: typeof insertOrder; update: typeof updateOrder; create: typeof createAsaasCheckout; url: typeof buildAsaasCheckoutUrl; baseUrl: () => Promise<string> };
export async function createQuotePayment(quote: QuoteView, input: Record<string, unknown>, dependencies: QuotePaymentDependencies = { first: workflowFirst, run: workflowRun, insert: insertOrder, update: updateOrder, create: createAsaasCheckout, url: buildAsaasCheckoutUrl, baseUrl: async () => await getEnvValue("ASAAS_CALLBACK_BASE_URL") ?? getRequiredEnvValue("APP_BASE_URL") }) {
  const { first, run, insert, update, create, url } = dependencies;
  const amountCents = number(input.amountCents, "valor total da cobrança", 500, 100_000_000, true);
  const stage = text(input.stage, "etapa da cobrança", 10, true);
  if (!["DEPOSIT", "BALANCE"].includes(stage)) throw new Error("Escolha entrada ou saldo na entrega.");
  const split = paymentSplit(quote.totalCents);
  if (amountCents !== (stage === "DEPOSIT" ? split.deposit : split.balance)) throw new Error("O valor desta etapa deve corresponder a 50% do orçamento aprovado.");
  if (stage === "BALANCE" && input.deliveryConfirmed !== true) throw new Error("Confirme a entrega do projeto antes de cobrar o saldo.");
  const mode = text(input.mode, "forma de pagamento", 10, true);
  const installments = mode === "PIX" ? 1 : number(input.installments, "parcelas", 1, 12, true);
  const reason = text(input.reason ?? "", "descrição da cobrança", 500);
  const requestKey = text(input.requestKey, "identificador da cobrança", 36, true);
  if (!/^[a-f0-9-]{36}$/i.test(requestKey)) throw new Error("Identificador de cobrança inválido.");
  if (amountCents !== quote.totalCents && !reason) throw new Error("Descreva o motivo do valor diferente do orçamento, como entrada ou parcela do projeto.");
  const id = crypto.randomUUID(), now = new Date(), expires = new Date(now.getTime() + 180 * 60000).toISOString();
  const payload = checkoutPayload(quote, id, amountCents / 100, mode, installments, await dependencies.baseUrl());
  const received = await first<{ paid: number }>(`SELECT COALESCE(SUM(p.amount_cents),0) AS paid FROM lead_quote_payments p JOIN orders o ON o.id=p.order_id WHERE p.lead_reference=? AND o.status IN ('PAYMENT_RECEIVED','PAYMENT_CONFIRMED')`, [quote.lead_reference]);
  if (stage === "DEPOSIT" && Number(received?.paid ?? 0) >= split.deposit) throw new Error("O sinal de entrada já foi recebido. Selecione o saldo na entrega do projeto.");
  if (stage === "BALANCE" && Number(received?.paid ?? 0) < split.deposit) throw new Error("O recebimento do sinal de entrada precisa estar confirmado antes de cobrar o saldo.");
  if (Number(received?.paid ?? 0) + amountCents > quote.totalCents) throw new Error("O valor excede o saldo do orçamento, considerando pagamentos já recebidos. Revise o valor ou aprove uma nova versão do orçamento.");
  const pending = await first<QuotePayment>(`SELECT p.* FROM lead_quote_payments p LEFT JOIN orders o ON o.id=p.order_id
    WHERE p.lead_reference=? AND (o.status IS NULL OR o.status NOT IN ('PAYMENT_RECEIVED','PAYMENT_CONFIRMED','CANCELED','REFUNDED','FAILED'))
    AND (p.state<>'READY' OR p.expires_at>?) ORDER BY p.created_at DESC LIMIT 1`, [quote.lead_reference, now.toISOString()]);
  if (pending) {
    if (pending.revision === quote.revision && pending.amount_cents === amountCents && pending.mode === mode && pending.installments === installments && pending.state === "READY" && pending.checkout_url) return pending;
    throw new Error("Já existe uma cobrança aberta ou sem confirmação para este lead. Confira o Asaas e encerre a cobrança anterior antes de criar outro link, inclusive ao mudar a forma de pagamento.");
  }
  const previous = await first<QuotePayment>("SELECT * FROM lead_quote_payments WHERE lead_reference=? AND revision=? AND amount_cents=? AND mode=? AND installments=? ORDER BY created_at DESC LIMIT 1", [quote.lead_reference, quote.revision, amountCents, mode, installments]);
  if (previous) {
    const paid = await first<{ status: string }>("SELECT status FROM orders WHERE id=?", [previous.order_id]);
    if (["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"].includes(paid?.status ?? "")) {
      if (input.regenerate !== true || !reason) throw new Error("A cobrança anterior já foi paga. Para cobrar o saldo, informe o motivo e confirme que conferiu as cobranças anteriores.");
    } else {
      if (["CANCELED", "REFUNDED", "FAILED"].includes(paid?.status ?? "")) {
        if (input.regenerate !== true) throw new Error("A cobrança anterior foi encerrada. Confira o histórico e autorize um novo link antes de continuar.");
      } else if (previous.state === "READY" && previous.checkout_url && previous.expires_at > now.toISOString()) return previous;
      else if (previous.state !== "READY") throw new Error("A cobrança anterior ainda precisa ser conferida no Asaas antes de repetir.");
      if (input.regenerate !== true) throw new Error("O link anterior expirou. Confira seu status e marque a opção de gerar novo link antes de continuar.");
    }
  }
  const reserved = await first<QuotePayment>(`INSERT INTO lead_quote_payments (id,lead_reference,revision,amount_cents,mode,installments,state,order_id,created_at,expires_at,request_key)
    SELECT ?,?,?,?,?,?,'CREATING',?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM lead_quote_payments p LEFT JOIN orders o ON o.id=p.order_id WHERE p.lead_reference=? AND (o.status IS NULL OR o.status NOT IN ('PAYMENT_RECEIVED','PAYMENT_CONFIRMED','CANCELED','REFUNDED','FAILED')) AND (p.state<>'READY' OR p.expires_at>?)) ON CONFLICT DO NOTHING RETURNING *`,
    [id, quote.lead_reference, quote.revision, amountCents, mode, installments, id, now.toISOString(), expires, requestKey, quote.lead_reference, now.toISOString()]);
  if (!reserved) {
    const existing = await first<QuotePayment>("SELECT * FROM lead_quote_payments WHERE lead_reference=? AND revision=? AND amount_cents=? AND mode=? AND installments=? ORDER BY created_at DESC LIMIT 1", [quote.lead_reference, quote.revision, amountCents, mode, installments]);
    if (existing?.state === "READY" && existing.checkout_url && existing.expires_at > now.toISOString()) return existing;
    throw new Error("Esta cobrança já foi solicitada. Confira o histórico e o Asaas antes de criar outra; uma falha de confirmação não permite repetir automaticamente.");
  }
  let checkoutCreated = false;
  try {
    await insert({ id, customerName: quote.lead.name, customerEmail: quote.lead.email, customerPhone: quote.lead.phone, customerCompany: quote.lead.company, customerCpfCnpj: null,
      serviceSnapshot: JSON.stringify([{ serviceLabel: quote.document.title, qty: 1, total: amountCents / 100 }]), billingModel: "ONE_TIME", paymentMethodPreference: mode === "BOTH" ? "MIXED" : mode === "PIX" ? "PIX" : "CREDIT_CARD",
      oneTimeAmount: amountCents / 100, recurringAmount: 0, amount: amountCents / 100, currency: "BRL", status: "DRAFT", externalReference: payload.externalReference,
      asaasCustomerId: null, asaasPaymentId: null, asaasCheckoutId: null, asaasSubscriptionId: null, checkoutUrl: null,
      notes: JSON.stringify({ purpose: "lead_quote", leadReference: quote.lead_reference, revision: quote.revision, stage, reason, installments, fees: "Valor desta etapa de 50%; sem acréscimo automático." }) });
    const checkout = await create(payload);
    checkoutCreated = true;
    const checkoutUrl = await url(checkout.id);
    await update(id, { status: "CHECKOUT_CREATED", asaasCheckoutId: checkout.id, checkoutUrl });
    await run("UPDATE lead_quote_payments SET state='READY',checkout_url=? WHERE id=?", [checkoutUrl, id]);
    return { ...reserved, state: "READY", checkout_url: checkoutUrl };
  } catch (failure) {
    await run("UPDATE lead_quote_payments SET state='UNCERTAIN' WHERE id=?", [id]);
    if (!checkoutCreated && failure instanceof AsaasApiError && [400, 401, 403, 404, 422].includes(failure.status)) {
      await update(id, { status: "FAILED" });
      throw new Error(`O Asaas recusou a criação: ${failure.message} Nenhum link foi criado. Corrija a informação antes de autorizar uma nova tentativa.`);
    }
    throw new Error("Não foi possível confirmar a cobrança. Confira o Asaas e o pedido no histórico antes de repetir, para evitar duplicidade.");
  }
}
