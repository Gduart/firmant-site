import { asaasRequest } from "@/lib/payments/asaas/client";
import { getEnvValue, getRequiredEnvValue } from "@/lib/cloudflare-runtime";
import type {
  AsaasCheckoutRequest,
  AsaasCheckoutResponse,
} from "@/lib/payments/asaas/types";

export async function createAsaasCheckout(payload: AsaasCheckoutRequest) {
  return asaasRequest<AsaasCheckoutResponse>("/v3/checkouts", {
    method: "POST",
    body: payload,
  });
}

export async function buildAsaasCheckoutUrl(checkoutId: string) {
  const explicitBaseUrl = await getEnvValue("ASAAS_CHECKOUT_BASE_URL");
  const apiBaseUrl = await getRequiredEnvValue("ASAAS_API_BASE_URL");
  const checkoutBaseUrl =
    explicitBaseUrl ??
    (apiBaseUrl.includes("api-sandbox.asaas.com")
      ? "https://sandbox.asaas.com/checkoutSession/show"
      : "https://asaas.com/checkoutSession/show");

  const checkoutUrl = new URL(checkoutBaseUrl);
  checkoutUrl.searchParams.set("id", checkoutId);

  return checkoutUrl.toString();
}
