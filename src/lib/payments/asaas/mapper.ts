import type { OrderStatus } from "@/lib/payments/types";

export function mapAsaasPaymentStatusToOrderStatus(
  paymentStatus?: string | null,
  billingType?: string | null,
  hasSubscription = false,
): OrderStatus {
  switch (paymentStatus) {
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
      return hasSubscription ? "SUBSCRIPTION_ACTIVE" : "PAYMENT_RECEIVED";
    case "CONFIRMED":
      return "PAYMENT_CONFIRMED";
    case "AWAITING_RISK_ANALYSIS":
      return "AWAITING_PAYMENT";
    case "OVERDUE":
      return "OVERDUE";
    case "REFUNDED":
      return "REFUNDED";
    case "DELETED":
      return "CANCELED";
    case "REFUSED":
      return "FAILED";
    case "PENDING":
      return mapAwaitingStatus(billingType);
    default:
      return "AWAITING_PAYMENT";
  }
}

export function mapAsaasEventToOrderStatus(
  eventType?: string | null,
  billingType?: string | null,
  hasSubscription = false,
): OrderStatus {
  switch (eventType) {
    case "CHECKOUT_CREATED":
      return "CHECKOUT_CREATED";
    case "CHECKOUT_EXPIRED":
      return "FAILED";
    case "CHECKOUT_CANCELED":
      return "CANCELED";
    case "PAYMENT_CREATED":
      return mapAwaitingStatus(billingType);
    case "PAYMENT_AWAITING_RISK_ANALYSIS":
      return "AWAITING_PAYMENT";
    case "PAYMENT_APPROVED_BY_RISK_ANALYSIS":
    case "PAYMENT_CONFIRMED":
      return "PAYMENT_CONFIRMED";
    case "PAYMENT_RECEIVED":
      return hasSubscription ? "SUBSCRIPTION_ACTIVE" : "PAYMENT_RECEIVED";
    case "PAYMENT_OVERDUE":
      return "OVERDUE";
    case "PAYMENT_DELETED":
      return "CANCELED";
    case "PAYMENT_REFUNDED":
      return "REFUNDED";
    case "PAYMENT_REPROVED_BY_RISK_ANALYSIS":
    case "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED":
      return "FAILED";
    default:
      return "AWAITING_PAYMENT";
  }
}

function mapAwaitingStatus(billingType?: string | null): OrderStatus {
  if (billingType === "PIX") {
    return "AWAITING_PIX";
  }

  if (billingType === "BOLETO") {
    return "AWAITING_BOLETO";
  }

  return "AWAITING_PAYMENT";
}
