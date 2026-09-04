import { asaasRequest } from "@/lib/payments/asaas/client";
import type {
  AsaasPaymentListResponse,
  AsaasPaymentPayload,
} from "@/lib/payments/asaas/types";

export type AsaasDirectPaymentRequest = {
  customer: string;
  billingType: "CREDIT_CARD";
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
  installmentCount?: number;
  totalValue?: number;
};

export async function createAsaasDirectPayment(payload: AsaasDirectPaymentRequest) {
  return asaasRequest<AsaasPaymentPayload>("/v3/payments", {
    method: "POST",
    body: payload,
  });
}

export async function deleteAsaasPayment(paymentId: string) {
  return asaasRequest(`/v3/payments/${encodeURIComponent(paymentId)}`, {
    method: "DELETE",
  });
}

export async function listAsaasPayments(params: {
  externalReference?: string | null;
  checkoutSession?: string | null;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(Math.min(params.limit ?? 10, 100)));

  if (params.externalReference) {
    searchParams.set("externalReference", params.externalReference);
  }

  if (params.checkoutSession) {
    searchParams.set("checkoutSession", params.checkoutSession);
  }

  return asaasRequest<AsaasPaymentListResponse>(
    `/v3/payments?${searchParams.toString()}`,
  );
}

export async function updateAsaasPaymentDescription(
  payment: AsaasPaymentPayload,
  description: string,
) {
  if (
    !payment.id ||
    !payment.billingType ||
    payment.value == null ||
    !payment.dueDate ||
    payment.description === description
  ) {
    return;
  }

  await asaasRequest(`/v3/payments/${payment.id}`, {
    method: "PUT",
    body: {
      billingType: payment.billingType,
      value: payment.value,
      dueDate: payment.dueDate,
      description: description.slice(0, 500),
      externalReference: payment.externalReference,
    },
  });
}
