import type { CheckoutPaymentMethod, OrderRecord } from "@/lib/payments/types";

export const ASAAS_CHECKOUT_TTL_MS = 180 * 60 * 1000;

const PAID_ORDER_STATUSES = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const TERMINAL_ORDER_STATUSES = new Set(["FAILED", "CANCELED", "REFUNDED"]);

export function isPaidOrder(status?: string | null) {
  return Boolean(status && PAID_ORDER_STATUSES.has(status));
}

export function isProposalCheckoutExpired(input: {
  status?: string | null;
  createdAt?: string | null;
  paymentMethod?: string | null;
  checkoutUrl?: string | null;
  asaasCheckoutId?: string | null;
  asaasPaymentId?: string | null;
}) {
  if (!input.checkoutUrl) return false;
  if (input.status && TERMINAL_ORDER_STATUSES.has(input.status)) return true;
  if (input.paymentMethod === "BOLETO") return false;
  if (input.asaasPaymentId && !input.asaasCheckoutId) return false;
  if (input.status !== "CHECKOUT_CREATED" || !input.createdAt) return false;
  return new Date(input.createdAt).getTime() + ASAAS_CHECKOUT_TTL_MS <= Date.now();
}

export function canReuseProposalCheckout(order: OrderRecord, paymentMethod: CheckoutPaymentMethod) {
  return Boolean(order.checkoutUrl) && !isProposalCheckoutExpired({
    status: order.status,
    createdAt: order.createdAt,
    paymentMethod,
    checkoutUrl: order.checkoutUrl,
    asaasCheckoutId: order.asaasCheckoutId,
    asaasPaymentId: order.asaasPaymentId,
  });
}
