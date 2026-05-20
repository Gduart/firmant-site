import {
  buildServiceSnapshot,
  getPackageBreakdown,
  type ClientData,
  type Selection,
} from "@/lib/package-catalog";
import { getEnvValue, getRequiredEnvValue } from "@/lib/cloudflare-runtime";
import {
  buildAsaasCheckoutUrl,
  createAsaasCheckout,
} from "@/lib/payments/asaas/checkouts";
import { createAsaasPaymentLink } from "@/lib/payments/asaas/payment-links";
import { listAsaasPayments } from "@/lib/payments/asaas/payments";
import type {
  AsaasBillingType,
  AsaasCheckoutRequest,
  AsaasPaymentPayload,
} from "@/lib/payments/asaas/types";
import { buildOrderDescription } from "@/lib/payments/order-description";
import {
  getOrderById,
  insertOrder,
  listProductionSmokeTestOrders,
  updateOrder,
} from "@/lib/payments/orders-repository";
import { listPaymentsByOrderId } from "@/lib/payments/payments-repository";
import { getSubscriptionByOrderId } from "@/lib/payments/subscriptions-repository";
import { processAsaasWebhook } from "@/lib/payments/webhook-service";
import type {
  CheckoutPaymentMethod,
  OrderRecord,
  PaymentMethodPreference,
  PaymentStatusResponse,
} from "@/lib/payments/types";

type CreateOrderBaseParams = {
  selections: Selection[];
  clientData: ClientData;
};

type CreateCheckoutParams = CreateOrderBaseParams & {
  paymentMethod: CheckoutPaymentMethod;
};

type ProductionSmokeTestPaymentMethod = CheckoutPaymentMethod | "SUBSCRIPTION";

export async function createProductionSmokeTestCheckout(
  paymentMethod: ProductionSmokeTestPaymentMethod = "PIX",
) {
  const amount = 5;
  const orderId = crypto.randomUUID();
  const externalReference = `firmant:test:${orderId}`;
  const methodLabel = getSmokeTestMethodLabel(paymentMethod);
  const serviceSnapshot = JSON.stringify([
    {
      categoryId: "internal",
      categoryTitle: "Teste interno",
      serviceId: "production_smoke_test",
      serviceLabel: `Teste real de producao FIRMANT - ${methodLabel}`,
      qty: 1,
      unit: "teste",
      total: amount,
      recurring: false,
    },
  ]);

  const order = await insertOrder({
    id: orderId,
    customerName: "Teste Producao FIRMANT",
    customerEmail: "ag.firmant@gmail.com",
    customerPhone: "47999998888",
    customerCompany: "FIRMANT",
    customerCpfCnpj: "12345678909",
    serviceSnapshot,
    billingModel: paymentMethod === "SUBSCRIPTION" ? "RECURRING" : "ONE_TIME",
    paymentMethodPreference: paymentMethod === "SUBSCRIPTION" ? "CREDIT_CARD" : paymentMethod,
    oneTimeAmount: paymentMethod === "SUBSCRIPTION" ? 0 : amount,
    recurringAmount: paymentMethod === "SUBSCRIPTION" ? amount : 0,
    amount,
    currency: "BRL",
    status: "DRAFT",
    externalReference,
    asaasCustomerId: null,
    asaasPaymentId: null,
    asaasCheckoutId: null,
    asaasSubscriptionId: null,
    checkoutUrl: null,
    notes: JSON.stringify({
      internal: true,
      purpose: "production_smoke_test",
      address: "Praca da Se",
      addressNumber: "1",
      postalCode: "01001000",
      province: "Se",
      paymentMethod,
    }),
  });

  if (!order) {
    throw new Error("Falha ao criar pedido interno de teste.");
  }

  const checkout = paymentMethod === "BOLETO"
    ? await createAsaasPaymentLink(await buildOneTimeBoletoLinkPayload(order))
    : paymentMethod === "SUBSCRIPTION"
      ? await createAsaasCheckout(
        await buildRecurringCheckoutPayload(order, {
          endDate: addDaysAsDateString(1),
        }),
      )
      : await createAsaasCheckout(
        await buildOneTimeCheckoutPayload(order, paymentMethod),
      );
  const checkoutUrl = "url" in checkout
    ? checkout.url
    : await buildAsaasCheckoutUrl(checkout.id);

  await updateOrder(order.id, {
    status: "CHECKOUT_CREATED",
    asaasCheckoutId: checkout.id,
    checkoutUrl,
  });

  return {
    orderId: order.id,
    checkoutId: checkout.id,
    checkoutUrl,
    amount,
    paymentMethod,
    statusUrl: `/pagamento/status/${order.id}`,
  };
}

export async function syncProductionSmokeTestPayments() {
  const orders = await listProductionSmokeTestOrders();
  const results = [];

  for (const order of orders) {
    results.push(...await syncAsaasPaymentsForOrder(order));
  }

  return {
    checkedOrders: orders.length,
    results,
  };
}

export async function syncAsaasPaymentsForOrderId(orderId: string) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Pedido não encontrado.");
  }

  return {
    orderId: order.id,
    results: await syncAsaasPaymentsForOrder(order),
  };
}

export async function createOneTimeCheckout(params: CreateCheckoutParams) {
  const breakdown = getPackageBreakdown(params.selections);
  const checkoutItems = [
    ...breakdown.oneTimeItems,
    ...breakdown.recurringItems,
  ];

  if (checkoutItems.length === 0) {
    throw new Error("Selecione ao menos um item para gerar checkout.");
  }

  const amount =
    params.paymentMethod === "PIX"
      ? Math.round(breakdown.grandTotal * 0.95)
      : breakdown.grandTotal;
  const order = await createDraftOrder({
    billingModel: "ONE_TIME",
    paymentMethodPreference: mapCheckoutPaymentMethod(params.paymentMethod),
    amount,
    oneTimeAmount: amount,
    recurringAmount: 0,
    selections: checkoutItems.map((item) => item.selection),
    clientData: params.clientData,
  });

  const checkout = params.paymentMethod === "BOLETO"
    ? await createAsaasPaymentLink(await buildOneTimeBoletoLinkPayload(order))
    : await createAsaasCheckout(
        await buildOneTimeCheckoutPayload(order, params.paymentMethod),
      );
  const checkoutUrl = "url" in checkout
    ? checkout.url
    : await buildAsaasCheckoutUrl(checkout.id);

  await updateOrder(order.id, {
    status: "CHECKOUT_CREATED",
    asaasCheckoutId: checkout.id,
    checkoutUrl,
  });

  return {
    orderId: order.id,
    checkoutId: checkout.id,
    checkoutUrl,
    amount,
    statusUrl: `/pagamento/status/${order.id}`,
  };
}

export async function createRecurringCheckout(params: CreateOrderBaseParams) {
  const breakdown = getPackageBreakdown(params.selections);
  const subscriptionItems = [
    ...breakdown.oneTimeItems,
    ...breakdown.recurringItems,
  ];
  const subscriptionAmount = breakdown.grandTotal;

  if (subscriptionItems.length === 0) {
    throw new Error("Selecione ao menos um item para gerar assinatura.");
  }

  const order = await createDraftOrder({
    billingModel: "RECURRING",
    paymentMethodPreference: "CREDIT_CARD",
    amount: subscriptionAmount,
    oneTimeAmount: 0,
    recurringAmount: subscriptionAmount,
    selections: subscriptionItems.map((item) => item.selection),
    clientData: params.clientData,
  });

  const checkout = await createAsaasCheckout(
    await buildRecurringCheckoutPayload(order),
  );
  const checkoutUrl = await buildAsaasCheckoutUrl(checkout.id);

  await updateOrder(order.id, {
    status: "CHECKOUT_CREATED",
    asaasCheckoutId: checkout.id,
    checkoutUrl,
  });

  return {
    orderId: order.id,
    checkoutId: checkout.id,
    checkoutUrl,
    amount: subscriptionAmount,
    statusUrl: `/pagamento/status/${order.id}`,
  };
}

export async function getOrderStatus(orderId: string): Promise<PaymentStatusResponse> {
  const [order, payments, subscription] = await Promise.all([
    getOrderById(orderId),
    listPaymentsByOrderId(orderId),
    getSubscriptionByOrderId(orderId),
  ]);

  return {
    order,
    payments,
    subscription,
  };
}

async function createDraftOrder(params: {
  billingModel: "ONE_TIME" | "RECURRING";
  paymentMethodPreference: PaymentMethodPreference;
  amount: number;
  oneTimeAmount: number;
  recurringAmount: number;
  selections: Selection[];
  clientData: ClientData;
}) {
  const orderId = crypto.randomUUID();
  const externalReference = `firmant:${orderId}`;

  const insertedOrder = await insertOrder({
    id: orderId,
    customerName: params.clientData.name,
    customerEmail: params.clientData.email,
    customerPhone: normalizePhone(params.clientData.whatsapp),
    customerCompany: params.clientData.empresa || null,
    customerCpfCnpj: normalizeCpfCnpj(params.clientData.cpf),
    serviceSnapshot: JSON.stringify(buildServiceSnapshot(params.selections)),
    billingModel: params.billingModel,
    paymentMethodPreference: params.paymentMethodPreference,
    oneTimeAmount: params.oneTimeAmount,
    recurringAmount: params.recurringAmount,
    amount: params.amount,
    currency: "BRL",
    status: "DRAFT",
    externalReference,
    asaasCustomerId: null,
    asaasPaymentId: null,
    asaasCheckoutId: null,
    asaasSubscriptionId: null,
    checkoutUrl: null,
    notes: JSON.stringify({
      empresa: params.clientData.empresa,
      obs: params.clientData.obs,
      address: params.clientData.address,
      addressNumber: params.clientData.addressNumber,
      complement: params.clientData.complement,
      postalCode: params.clientData.postalCode,
      province: params.clientData.province,
    }),
  });

  if (!insertedOrder) {
    throw new Error("Falha ao criar pedido interno.");
  }

  return insertedOrder;
}

async function buildOneTimeCheckoutPayload(
  order: OrderRecord,
  paymentMethod: CheckoutPaymentMethod,
): Promise<AsaasCheckoutRequest> {
  const [baseUrl, successBaseUrl, cancelBaseUrl, expiredBaseUrl] = await Promise.all([
    getRequiredEnvValue("APP_BASE_URL"),
    getEnvValue("ASAAS_SUCCESS_URL"),
    getEnvValue("ASAAS_CANCEL_URL"),
    getEnvValue("ASAAS_EXPIRED_URL"),
  ]);

  const callback = buildCallbackConfig({
    baseUrl,
    successBaseUrl,
    cancelBaseUrl,
    expiredBaseUrl,
    orderId: order.id,
  });
  const amount = order.oneTimeAmount;
  const description =
    paymentMethod === "PIX"
      ? "Pagamento avulso com desconto Pix"
      : "Pagamento avulso FIRMANT";
  const orderDescription = buildOrderDescription(order, description);

  return {
    billingTypes: [paymentMethod as AsaasBillingType],
    chargeTypes:
      paymentMethod === "CREDIT_CARD"
        ? ["DETACHED", "INSTALLMENT"]
        : ["DETACHED"],
    minutesToExpire: 180,
    externalReference: order.externalReference,
    description: orderDescription,
    callback,
    items: [
      {
        name: "Pacote FIRMANT",
        description: orderDescription,
        quantity: 1,
        value: amount,
      },
    ],
    customerData: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      cpfCnpj: order.customerCpfCnpj ?? undefined,
      ...getCheckoutCustomerAddress(order),
    },
    installment:
      paymentMethod === "CREDIT_CARD"
        ? {
            maxInstallmentCount: getMaxCardInstallments(amount),
          }
        : undefined,
  };
}

async function buildOneTimeBoletoLinkPayload(order: OrderRecord) {
  const orderDescription = buildOrderDescription(
    order,
    "Pagamento avulso por boleto FIRMANT",
  );

  return {
    name: "Pacote FIRMANT",
    description: orderDescription,
    value: order.oneTimeAmount,
    billingType: "BOLETO" as const,
    chargeType: "DETACHED" as const,
    dueDateLimitDays: 3,
    externalReference: order.externalReference,
    notificationEnabled: false,
  };
}

async function buildRecurringCheckoutPayload(
  order: OrderRecord,
  options: { endDate?: string } = {},
): Promise<AsaasCheckoutRequest> {
  const [baseUrl, successBaseUrl, cancelBaseUrl, expiredBaseUrl] = await Promise.all([
    getRequiredEnvValue("APP_BASE_URL"),
    getEnvValue("ASAAS_SUCCESS_URL"),
    getEnvValue("ASAAS_CANCEL_URL"),
    getEnvValue("ASAAS_EXPIRED_URL"),
  ]);
  const orderDescription = buildOrderDescription(order, "Assinatura mensal FIRMANT");
  const callback = buildCallbackConfig({
    baseUrl,
    successBaseUrl,
    cancelBaseUrl,
    expiredBaseUrl,
    orderId: order.id,
  });

  return {
    billingTypes: ["CREDIT_CARD"],
    chargeTypes: ["RECURRENT"],
    minutesToExpire: 180,
    externalReference: order.externalReference,
    description: orderDescription,
    callback,
    items: [
      {
        name: "Plano mensal FIRMANT",
        description: orderDescription,
        quantity: 1,
        value: order.recurringAmount,
      },
    ],
    customerData: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      cpfCnpj: order.customerCpfCnpj ?? undefined,
      ...getCheckoutCustomerAddress(order),
    },
    subscription: {
      cycle: "MONTHLY",
      nextDueDate: currentDateString(),
      endDate: options.endDate,
    },
  };
}

function buildCallbackConfig(params: {
  baseUrl: string;
  successBaseUrl?: string;
  cancelBaseUrl?: string;
  expiredBaseUrl?: string;
  orderId: string;
}) {
  return {
    successUrl: withOrderId(
      params.successBaseUrl ?? `${params.baseUrl}/pagamento/sucesso`,
      params.orderId,
    ),
    cancelUrl: withOrderId(
      params.cancelBaseUrl ?? `${params.baseUrl}/pagamento/cancelado`,
      params.orderId,
    ),
    expiredUrl: withOrderId(
      params.expiredBaseUrl ?? `${params.baseUrl}/pagamento/expirado`,
      params.orderId,
    ),
  };
}

function withOrderId(url: string, orderId: string) {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("orderId", orderId);
  return parsedUrl.toString();
}

function mapCheckoutPaymentMethod(
  paymentMethod: CheckoutPaymentMethod,
): PaymentMethodPreference {
  switch (paymentMethod) {
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "BOLETO";
    default:
      return "CREDIT_CARD";
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeCpfCnpj(value: string) {
  return value.replace(/\D/g, "");
}

function getCheckoutCustomerAddress(order: OrderRecord) {
  const notes = parseOrderNotes(order.notes);

  return {
    address: optionalText(notes.address),
    addressNumber: optionalText(notes.addressNumber),
    complement: optionalText(notes.complement),
    postalCode: optionalText(notes.postalCode)?.replace(/\D/g, ""),
    province: optionalText(notes.province),
  };
}

function parseOrderNotes(notes: string | null) {
  if (!notes) {
    return {} as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(notes);
    return parsed && typeof parsed === "object"
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getMaxCardInstallments(amount: number) {
  const minInstallmentAmount = 5;
  return Math.min(12, Math.max(1, Math.floor(amount / minInstallmentAmount)));
}

function getSmokeTestMethodLabel(paymentMethod: ProductionSmokeTestPaymentMethod) {
  switch (paymentMethod) {
    case "PIX":
      return "Pix";
    case "CREDIT_CARD":
      return "Cartao avulso";
    case "BOLETO":
      return "Boleto";
    case "SUBSCRIPTION":
      return "Assinatura mensal cartao";
  }
}

function currentDateString() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysAsDateString(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function findAsaasPaymentsForOrder(order: OrderRecord) {
  const byCheckout = order.asaasCheckoutId
    ? await listAsaasPayments({
        checkoutSession: order.asaasCheckoutId,
        limit: 10,
      })
    : null;
  const checkoutMatches = byCheckout?.data ?? [];

  if (checkoutMatches.length > 0) {
    return checkoutMatches;
  }

  const byExternalReference = await listAsaasPayments({
    externalReference: order.externalReference,
    limit: 10,
  });

  return byExternalReference.data ?? [];
}

async function syncAsaasPaymentsForOrder(order: OrderRecord) {
  const payments = await findAsaasPaymentsForOrder(order);

  if (payments.length === 0) {
    return [
      {
        orderId: order.id,
        checkoutId: order.asaasCheckoutId,
        externalReference: order.externalReference,
        synced: false,
        reason: "Nenhuma cobranca encontrada no Asaas para este checkout.",
      },
    ];
  }

  const results = [];

  for (const payment of payments) {
    const payloadPayment = {
      ...payment,
      externalReference: payment.externalReference ?? order.externalReference,
      checkoutSession: payment.checkoutSession ?? order.asaasCheckoutId ?? undefined,
    };
    const event = buildManualSyncEvent(payloadPayment);
    const syncResult = await processAsaasWebhook({
      id: `manual-sync:${payment.id ?? order.id}:${payment.status ?? "UNKNOWN"}`,
      event,
      dateCreated: new Date().toISOString(),
      payment: payloadPayment,
      checkout: order.asaasCheckoutId
        ? {
            id: order.asaasCheckoutId,
            externalReference: order.externalReference,
          }
        : undefined,
    });

    results.push({
      orderId: order.id,
      checkoutId: order.asaasCheckoutId,
      paymentId: payment.id,
      paymentStatus: payment.status,
      event,
      synced: syncResult.processed === true || syncResult.duplicate === true,
      result: syncResult,
    });
  }

  return results;
}

function buildManualSyncEvent(payment: AsaasPaymentPayload) {
  switch (payment.status) {
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
      return "PAYMENT_RECEIVED";
    case "CONFIRMED":
      return "PAYMENT_CONFIRMED";
    case "OVERDUE":
      return "PAYMENT_OVERDUE";
    case "REFUNDED":
      return "PAYMENT_REFUNDED";
    case "DELETED":
      return "PAYMENT_DELETED";
    case "REFUSED":
      return "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED";
    default:
      return "PAYMENT_CREATED";
  }
}
