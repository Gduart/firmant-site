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
import type { AsaasBillingType, AsaasCheckoutRequest } from "@/lib/payments/asaas/types";
import { buildOrderDescription } from "@/lib/payments/order-description";
import {
  getOrderById,
  insertOrder,
  updateOrder,
} from "@/lib/payments/orders-repository";
import { listPaymentsByOrderId } from "@/lib/payments/payments-repository";
import { getSubscriptionByOrderId } from "@/lib/payments/subscriptions-repository";
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

export async function createProductionSmokeTestCheckout() {
  const amount = 5;
  const orderId = crypto.randomUUID();
  const externalReference = `firmant:test:${orderId}`;
  const serviceSnapshot = JSON.stringify([
    {
      categoryId: "internal",
      categoryTitle: "Teste interno",
      serviceId: "production_smoke_test",
      serviceLabel: "Teste real de producao FIRMANT",
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
    billingModel: "ONE_TIME",
    paymentMethodPreference: "PIX",
    oneTimeAmount: amount,
    recurringAmount: 0,
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
      address: "Rua das Palmeiras",
      addressNumber: "100",
      postalCode: "89000000",
      province: "Centro",
    }),
  });

  if (!order) {
    throw new Error("Falha ao criar pedido interno de teste.");
  }

  const checkout = await createAsaasCheckout(
    await buildOneTimeCheckoutPayload(order, "PIX"),
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
    amount,
    statusUrl: `/pagamento/status/${order.id}`,
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

  const checkout =
    params.paymentMethod === "CREDIT_CARD"
      ? await createAsaasPaymentLink(await buildOneTimeCardLinkPayload(order))
      : await createAsaasCheckout(
          await buildOneTimeCheckoutPayload(order, params.paymentMethod),
        );
  const checkoutUrl =
    "url" in checkout ? checkout.url : await buildAsaasCheckoutUrl(checkout.id);

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

  const checkout = await createAsaasPaymentLink(
    await buildRecurringPaymentLinkPayload(order),
  );
  const checkoutUrl = checkout.url;

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
            maxInstallmentCount: 12,
          }
        : undefined,
  };
}

async function buildOneTimeCardLinkPayload(order: OrderRecord) {
  const orderDescription = buildOrderDescription(
    order,
    "Pagamento avulso FIRMANT",
  );

  return {
    name: "Pacote FIRMANT",
    description: orderDescription,
    value: order.oneTimeAmount,
    billingType: "CREDIT_CARD" as const,
    chargeType: "INSTALLMENT" as const,
    maxInstallmentCount: 12,
    externalReference: order.externalReference,
    notificationEnabled: false,
  };
}

async function buildRecurringPaymentLinkPayload(order: OrderRecord) {
  const orderDescription = buildOrderDescription(order, "Assinatura mensal FIRMANT");

  return {
    name: "Plano mensal FIRMANT",
    description: orderDescription,
    value: order.recurringAmount,
    billingType: "CREDIT_CARD" as const,
    chargeType: "RECURRENT" as const,
    subscriptionCycle: "MONTHLY" as const,
    externalReference: order.externalReference,
    notificationEnabled: false,
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
