import { asaasRequest } from "@/lib/payments/asaas/client";
import type { AsaasPaymentPayload } from "@/lib/payments/asaas/types";

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
