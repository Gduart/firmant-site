import { asaasRequest } from "@/lib/payments/asaas/client";

export type AsaasPaymentLinkRequest = {
  name: string;
  description: string;
  value: number;
  billingType: "PIX" | "CREDIT_CARD";
  chargeType: "DETACHED" | "INSTALLMENT" | "RECURRENT";
  dueDateLimitDays?: number;
  subscriptionCycle?: "MONTHLY";
  maxInstallmentCount?: number;
  externalReference: string;
  notificationEnabled: boolean;
};

export type AsaasPaymentLinkResponse = {
  id: string;
  url: string;
};

export async function createAsaasPaymentLink(
  payload: AsaasPaymentLinkRequest,
) {
  return asaasRequest<AsaasPaymentLinkResponse>("/v3/paymentLinks", {
    method: "POST",
    body: payload,
  });
}
