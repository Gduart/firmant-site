import { asaasRequest } from "@/lib/payments/asaas/client";

type AsaasCustomer = { id: string };
type AsaasCustomerList = { data?: AsaasCustomer[] };

export async function findOrCreateAsaasCustomer(input: {
  name: string;
  email: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  externalReference: string;
}) {
  const search = new URLSearchParams({ limit: "1" });
  if (input.cpfCnpj) search.set("cpfCnpj", input.cpfCnpj);
  else search.set("externalReference", input.externalReference);
  const existing = await asaasRequest<AsaasCustomerList>(`/v3/customers?${search}`);
  if (existing.data?.[0]?.id) return existing.data[0];

  return asaasRequest<AsaasCustomer>("/v3/customers", {
    method: "POST",
    body: {
      name: input.name,
      email: input.email,
      mobilePhone: input.mobilePhone,
      cpfCnpj: input.cpfCnpj,
      externalReference: input.externalReference,
      notificationDisabled: true,
    },
  });
}
