import { getRequiredEnvValue } from "@/lib/cloudflare-runtime";
import {
  mapAsaasEventToOrderStatus,
  mapAsaasPaymentStatusToOrderStatus,
} from "@/lib/payments/asaas/mapper";
import { updateAsaasPaymentDescription } from "@/lib/payments/asaas/payments";
import type { AsaasWebhookPayload } from "@/lib/payments/asaas/types";
import { buildOrderDescription } from "@/lib/payments/order-description";
import {
  findOrderByAsaasReferences,
  getOrderByExternalReference,
  updateOrder,
} from "@/lib/payments/orders-repository";
import { upsertPayment } from "@/lib/payments/payments-repository";
import { upsertSubscription } from "@/lib/payments/subscriptions-repository";
import {
  getWebhookEventByProviderEventId,
  insertWebhookEvent,
  markWebhookEventProcessed,
} from "@/lib/payments/webhook-events-repository";
import type { OrderStatus } from "@/lib/payments/types";

export async function validateAsaasWebhookToken(token?: string | null) {
  const expectedToken = await getRequiredEnvValue("ASAAS_WEBHOOK_AUTH_TOKEN");

  return token === expectedToken;
}

export async function processAsaasWebhook(payload: AsaasWebhookPayload) {
  const providerEventId = buildProviderEventId(payload);
  const existingEvent = await getWebhookEventByProviderEventId(providerEventId);

  if (existingEvent) {
    return { duplicate: true };
  }

  await insertWebhookEvent({
    id: crypto.randomUUID(),
    provider: "asaas",
    providerEventId,
    eventType: payload.event ?? "UNKNOWN",
    isDuplicate: 0,
    payload: JSON.stringify(payload),
    processingResult: "RECEIVED",
  });

  const order = await findMatchingOrder(payload);

  if (!order) {
    await markWebhookEventProcessed(providerEventId, "IGNORED_NO_ORDER");
    return { duplicate: false, processed: false };
  }

  await syncPaymentDescription(payload, order);

  const payment = payload.payment;

  const hasSubscription = Boolean(
    payment?.subscription ?? order.asaasSubscriptionId,
  );
  const incomingStatus = resolveIncomingOrderStatus(
    payload.event,
    payment?.status,
    payment?.billingType,
    hasSubscription,
  );
  const nextStatus = preserveConfirmedStatus(order.status, incomingStatus);

  await updateOrder(order.id, {
    status: nextStatus,
    asaasPaymentId: payment?.id ?? order.asaasPaymentId,
    asaasCheckoutId: payload.checkout?.id ?? order.asaasCheckoutId,
    asaasSubscriptionId:
      payment?.subscription ?? order.asaasSubscriptionId,
  });

  if (payment?.id) {
    await upsertPayment({
      id: crypto.randomUUID(),
      orderId: order.id,
      provider: "asaas",
      providerPaymentId: payment.id,
      providerStatus: payment.status ?? payload.event ?? null,
      billingType: payment.billingType ?? null,
      amount: payment.value ?? order.amount,
      dueDate: payment.dueDate ?? null,
      paidAt: payment.clientPaymentDate ?? payment.confirmedDate ?? null,
      invoiceUrl: payment.invoiceUrl ?? null,
      bankSlipUrl: payment.bankSlipUrl ?? null,
      pixQrCode: null,
      pixPayload: null,
      rawPayload: JSON.stringify(payment),
    });
  }

  if (payment?.subscription) {
    await upsertSubscription({
      id: crypto.randomUUID(),
      orderId: order.id,
      providerSubscriptionId: payment.subscription,
      cycle: "MONTHLY",
      value: order.recurringAmount,
      nextDueDate: payment.dueDate ?? null,
      status: nextStatus,
      billingType: payment.billingType ?? null,
      rawPayload: JSON.stringify(payload),
    });
  }

  await markWebhookEventProcessed(providerEventId, "PROCESSED");

  return {
    duplicate: false,
    processed: true,
    orderId: order.id,
  };
}

async function findMatchingOrder(payload: AsaasWebhookPayload) {
  const paymentExternalReference = payload.payment?.externalReference;
  const checkoutExternalReference = payload.checkout?.externalReference;

  if (paymentExternalReference) {
    const order = await getOrderByExternalReference(paymentExternalReference);
    if (order) {
      return order;
    }
  }

  if (checkoutExternalReference) {
    const order = await getOrderByExternalReference(checkoutExternalReference);
    if (order) {
      return order;
    }
  }

  return findOrderByAsaasReferences({
    paymentId: payload.payment?.id,
    checkoutId:
      payload.checkout?.id ??
      payload.payment?.checkoutSession ??
      payload.payment?.paymentLink,
    subscriptionId: payload.payment?.subscription,
  });
}

async function syncPaymentDescription(
  payload: AsaasWebhookPayload,
  order: Awaited<ReturnType<typeof findMatchingOrder>>,
) {
  if (!order || !payload.payment || !shouldSyncPaymentDescription(payload)) {
    return;
  }

  const fallback =
    order.billingModel === "RECURRING"
      ? "Assinatura mensal FIRMANT"
      : "Pagamento FIRMANT";
  const orderDescription = buildOrderDescription(order, fallback);

  try {
    await updateAsaasPaymentDescription(
      payload.payment,
      buildPaymentDescription(payload.payment.description, orderDescription),
    );
  } catch (error) {
    console.warn("Failed to sync Asaas payment description", {
      paymentId: payload.payment.id,
      error,
    });
  }
}

function shouldSyncPaymentDescription(payload: AsaasWebhookPayload) {
  if (!payload.payment) {
    return false;
  }

  if (
    ["PAYMENT_CREATED", "PAYMENT_UPDATED", "PAYMENT_CONFIRMED"].includes(
      payload.event ?? "",
    )
  ) {
    return true;
  }

  return !payload.payment.description || isInstallmentDescription(
    payload.payment.description,
  );
}

function buildPaymentDescription(
  currentDescription: string | undefined,
  orderDescription: string,
) {
  if (currentDescription && isInstallmentDescription(currentDescription)) {
    return `${currentDescription} - ${orderDescription}`.slice(0, 500);
  }

  return orderDescription;
}

function isInstallmentDescription(description: string) {
  return /^Parcela \d+ de \d+\.$/.test(description);
}

function buildProviderEventId(payload: AsaasWebhookPayload) {
  return (
    payload.id ??
    [
      payload.event ?? "UNKNOWN",
      payload.payment?.id ?? payload.checkout?.id ?? "NO_RESOURCE",
      payload.dateCreated ?? "NO_DATE",
    ].join(":")
  );
}

function resolveIncomingOrderStatus(
  eventType?: string | null,
  paymentStatus?: string | null,
  billingType?: string | null,
  hasSubscription = false,
) {
  if (paymentStatus) {
    return mapAsaasPaymentStatusToOrderStatus(
      paymentStatus,
      billingType,
      hasSubscription,
    );
  }

  return mapAsaasEventToOrderStatus(eventType, billingType, hasSubscription);
}

function preserveConfirmedStatus(
  currentStatus: OrderStatus,
  incomingStatus: OrderStatus,
) {
  const confirmedStatuses = new Set([
    "PAYMENT_CONFIRMED",
    "PAYMENT_RECEIVED",
    "SUBSCRIPTION_ACTIVE",
  ]);
  const awaitingStatuses = new Set([
    "AWAITING_PAYMENT",
    "AWAITING_PIX",
    "AWAITING_BOLETO",
  ]);

  if (
    confirmedStatuses.has(currentStatus) &&
    awaitingStatuses.has(incomingStatus)
  ) {
    return currentStatus;
  }

  return incomingStatus;
}
