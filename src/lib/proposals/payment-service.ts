import { getEnvValue, getRequiredEnvValue } from "@/lib/cloudflare-runtime";
import { buildAsaasCheckoutUrl, cancelAsaasCheckout, createAsaasCheckout } from "@/lib/payments/asaas/checkouts";
import { createAsaasPaymentLink } from "@/lib/payments/asaas/payment-links";
import type { AsaasBillingType, AsaasCheckoutRequest } from "@/lib/payments/asaas/types";
import { getOrderById, insertOrder, updateOrder } from "@/lib/payments/orders-repository";
import type { CheckoutPaymentMethod } from "@/lib/payments/types";
import {
  canReuseProposalCheckout,
  isPaidOrder,
  isProposalCheckoutExpired,
} from "@/lib/proposals/payment-status";
import {
  attachOrderToMilestone,
  getProposalMilestone,
  replaceOrderOnMilestone,
} from "@/lib/proposals/repository";
import type { ProposalSnapshot } from "@/lib/proposals/types";

export async function createProposalMilestoneCheckout(input: {
  milestoneId: string;
  paymentMethod: CheckoutPaymentMethod;
  snapshot: ProposalSnapshot;
  forceNew?: boolean;
}) {
  const milestone = await getProposalMilestone(input.milestoneId);
  if (!milestone || milestone.proposal_id !== input.snapshot.proposal.id) {
    throw new Error("Etapa de pagamento não encontrada.");
  }
  if (milestone.amount_cents <= 0) {
    throw new Error("A etapa de pagamento precisa ter valor maior que zero.");
  }

  const existingOrder = milestone.order_id ? await getOrderById(milestone.order_id) : null;
  if (milestone.status === "PAID" || isPaidOrder(existingOrder?.status)) {
    throw new Error("Esta etapa já está paga e não pode gerar outra cobrança.");
  }
  const existingExpired = existingOrder ? isProposalCheckoutExpired({
    status: existingOrder.status,
    createdAt: existingOrder.createdAt,
    paymentMethod: input.paymentMethod,
    checkoutUrl: existingOrder.checkoutUrl,
  }) : false;
  if (existingOrder && !input.forceNew && canReuseProposalCheckout(existingOrder, input.paymentMethod)) {
      return {
        orderId: existingOrder.id,
        checkoutUrl: existingOrder.checkoutUrl,
        statusUrl: `/pagamento/status/${existingOrder.id}`,
        reused: true,
        replaced: false,
      };
  }

  let canceledExistingCheckout = false;
  if (existingOrder && input.forceNew && !existingExpired && input.paymentMethod !== "BOLETO") {
    if (!existingOrder.asaasCheckoutId) {
      throw new Error("A cobrança atual não possui identificador para cancelamento.");
    }
    await cancelAsaasCheckout(existingOrder.asaasCheckoutId);
    await updateOrder(existingOrder.id, { status: "CANCELED" });
    canceledExistingCheckout = true;
  }

  const proposal = input.snapshot.proposal;
  const briefing = input.snapshot.briefing ?? {};
  const orderId = crypto.randomUUID();
  const amount = milestone.amount_cents / 100;
  const externalReference = `firmant:proposal:${proposal.id}:milestone:${milestone.id}:${orderId}`;
  const order = await insertOrder({
    id: orderId,
    customerName: proposal.client_name,
    customerEmail: proposal.client_email,
    customerPhone: digits(textValue(briefing.whatsapp)),
    customerCompany: optionalText(briefing.trade_name) ?? optionalText(briefing.legal_name) ?? null,
    customerCpfCnpj: optionalDigits(briefing.tax_id) ?? null,
    serviceSnapshot: JSON.stringify([{
      categoryId: "proposal",
      categoryTitle: `Proposta ${proposal.proposal_number}`,
      serviceId: milestone.id,
      serviceLabel: milestone.label,
      qty: 1,
      unit: "etapa",
      total: amount,
      recurring: false,
    }]),
    billingModel: "ONE_TIME",
    paymentMethodPreference: input.paymentMethod,
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
      purpose: "proposal_milestone",
      proposalId: proposal.id,
      proposalNumber: proposal.proposal_number,
      milestoneId: milestone.id,
      milestoneLabel: milestone.label,
      address: optionalText(briefing.address),
      addressNumber: optionalText(briefing.address_number),
      complement: optionalText(briefing.address_complement),
      postalCode: optionalDigits(briefing.postal_code),
      province: optionalText(briefing.province),
      city: optionalText(briefing.city),
      state: optionalText(briefing.state),
    }),
  });
  if (!order) throw new Error("Falha ao criar o pedido da proposta.");

  const checkout = input.paymentMethod === "BOLETO"
    ? await createAsaasPaymentLink({
      name: `FIRMANT - ${milestone.label}`.slice(0, 100),
      description: buildDescription(input.snapshot, milestone.label),
      value: amount,
      billingType: "BOLETO",
      chargeType: "DETACHED",
      dueDateLimitDays: 3,
      externalReference,
      notificationEnabled: false,
    })
    : await createAsaasCheckout(await buildCheckoutPayload({
      snapshot: input.snapshot,
      milestoneLabel: milestone.label,
      orderId,
      externalReference,
      amount,
    }));
  const checkoutUrl = "url" in checkout
    ? checkout.url
    : await buildAsaasCheckoutUrl(checkout.id);

  await updateOrder(orderId, {
    status: "CHECKOUT_CREATED",
    asaasCheckoutId: checkout.id,
    checkoutUrl,
  });
  if (existingOrder) {
    await replaceOrderOnMilestone({
      milestoneId: milestone.id,
      oldOrderId: existingOrder.id,
      newOrderId: orderId,
      oldCheckoutUrl: existingOrder.checkoutUrl,
      oldOrderStatus: existingOrder.status,
      paymentMethod: input.paymentMethod,
      reason: existingExpired ? "EXPIRED" : "REGENERATED",
    });
    if (!isPaidOrder(existingOrder.status) && !["FAILED", "CANCELED", "REFUNDED"].includes(existingOrder.status)) {
      await updateOrder(existingOrder.id, { status: canceledExistingCheckout ? "CANCELED" : "FAILED" });
    }
  } else {
    await attachOrderToMilestone({
      milestoneId: milestone.id,
      orderId,
      paymentMethod: input.paymentMethod,
    });
  }

  return {
    orderId,
    checkoutUrl,
    statusUrl: `/pagamento/status/${orderId}`,
    reused: false,
    replaced: Boolean(existingOrder),
  };
}

async function buildCheckoutPayload(input: {
  snapshot: ProposalSnapshot;
  milestoneLabel: string;
  orderId: string;
  externalReference: string;
  amount: number;
}): Promise<AsaasCheckoutRequest> {
  const [baseUrl, successUrl, cancelUrl, expiredUrl] = await Promise.all([
    getRequiredEnvValue("APP_BASE_URL"),
    getEnvValue("ASAAS_SUCCESS_URL"),
    getEnvValue("ASAAS_CANCEL_URL"),
    getEnvValue("ASAAS_EXPIRED_URL"),
  ]);
  const proposal = input.snapshot.proposal;
  const briefing = input.snapshot.briefing ?? {};
  const description = buildDescription(input.snapshot, input.milestoneLabel);
  const allowedMethods = JSON.parse(proposal.payment_methods_json) as string[];
  const billingTypes = allowedMethods.filter(
    (method): method is AsaasBillingType => method === "PIX" || method === "CREDIT_CARD",
  );

  return {
    billingTypes: billingTypes.length ? billingTypes : ["PIX"],
    chargeTypes: ["DETACHED"],
    minutesToExpire: 180,
    externalReference: input.externalReference,
    description,
    callback: {
      successUrl: withOrderId(successUrl ?? `${baseUrl}/pagamento/sucesso`, input.orderId),
      cancelUrl: withOrderId(cancelUrl ?? `${baseUrl}/pagamento/cancelado`, input.orderId),
      expiredUrl: withOrderId(expiredUrl ?? `${baseUrl}/pagamento/expirado`, input.orderId),
    },
    items: [{
      name: `${proposal.proposal_number} - ${input.milestoneLabel}`.slice(0, 30),
      description,
      quantity: 1,
      value: input.amount,
    }],
    customerData: buildCheckoutCustomerData(proposal, briefing),
  };
}

function buildDescription(snapshot: ProposalSnapshot, milestoneLabel: string) {
  return `Proposta ${snapshot.proposal.proposal_number} - ${snapshot.proposal.project_name} - ${milestoneLabel}`
    .slice(0, 500);
}

function withOrderId(value: string, orderId: string) {
  const url = new URL(value);
  url.searchParams.set("orderId", orderId);
  return url.toString();
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalText(value: unknown) {
  const result = textValue(value).trim();
  return result || undefined;
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function optionalDigits(value: unknown) {
  const result = digits(textValue(value));
  return result || undefined;
}

function buildCheckoutCustomerData(
  proposal: ProposalSnapshot["proposal"],
  briefing: Record<string, unknown>,
) {
  const phone = optionalDigits(briefing.whatsapp);
  const cpfCnpj = optionalDigits(briefing.tax_id);
  const address = optionalText(briefing.address);
  const addressNumber = optionalText(briefing.address_number);
  const postalCode = optionalDigits(briefing.postal_code);
  const province = optionalText(briefing.province);

  if (!phone || !cpfCnpj || !address || !addressNumber || !postalCode || !province) {
    return undefined;
  }

  return {
    name: proposal.client_name,
    email: proposal.client_email,
    phone,
    cpfCnpj,
    address,
    addressNumber,
    complement: optionalText(briefing.address_complement),
    postalCode,
    province,
  };
}
