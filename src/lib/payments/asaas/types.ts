export type AsaasBillingType = "PIX" | "BOLETO" | "CREDIT_CARD";
export type AsaasChargeType = "DETACHED" | "INSTALLMENT" | "RECURRENT";

export type AsaasCheckoutItem = {
  name: string;
  description: string;
  quantity: number;
  value: number;
};

export type AsaasCheckoutRequest = {
  billingTypes: AsaasBillingType[];
  chargeTypes: AsaasChargeType[];
  minutesToExpire: number;
  externalReference: string;
  description: string;
  callback: {
    successUrl: string;
    cancelUrl: string;
    expiredUrl: string;
  };
  items: AsaasCheckoutItem[];
  customerData?: {
    name?: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    postalCode?: string;
    province?: string;
  };
  installment?: {
    maxInstallmentCount: number;
  };
  subscription?: {
    cycle: "MONTHLY";
    nextDueDate: string;
  };
};

export type AsaasCheckoutResponse = {
  id: string;
  status?: string;
};

export type AsaasPaymentPayload = {
  id?: string;
  status?: string;
  billingType?: string;
  checkoutSession?: string;
  description?: string;
  value?: number;
  dueDate?: string;
  confirmedDate?: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  paymentLink?: string | null;
  subscription?: string;
  installment?: string;
  installmentNumber?: number;
  externalReference?: string;
};

export type AsaasCheckoutPayload = {
  id?: string;
  status?: string;
  externalReference?: string;
};

export type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  dateCreated?: string;
  payment?: AsaasPaymentPayload;
  checkout?: AsaasCheckoutPayload;
};
