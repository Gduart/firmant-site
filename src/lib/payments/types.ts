import type { ClientData, Selection } from "@/lib/package-catalog";

export type BillingModel = "ONE_TIME" | "RECURRING" | "MANUAL";

export type PaymentMethodPreference =
  | "PIX"
  | "CREDIT_CARD"
  | "BOLETO"
  | "MIXED";

export type OrderStatus =
  | "DRAFT"
  | "CHECKOUT_CREATED"
  | "AWAITING_PAYMENT"
  | "AWAITING_PIX"
  | "AWAITING_BOLETO"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "SUBSCRIPTION_ACTIVE"
  | "OVERDUE"
  | "CANCELED"
  | "REFUNDED"
  | "FAILED";

export type CheckoutPaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export type CheckoutFlowMode = "ONE_TIME" | "RECURRING";

export type CreateCheckoutInput = {
  selections: Selection[];
  clientData: ClientData;
  paymentMethod: CheckoutPaymentMethod;
};

export type CreateSubscriptionInput = {
  selections: Selection[];
  clientData: ClientData;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string | null;
  customerCpfCnpj: string | null;
  serviceSnapshot: string;
  billingModel: BillingModel;
  paymentMethodPreference: PaymentMethodPreference;
  oneTimeAmount: number;
  recurringAmount: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  externalReference: string;
  asaasCustomerId: string | null;
  asaasPaymentId: string | null;
  asaasCheckoutId: string | null;
  asaasSubscriptionId: string | null;
  checkoutUrl: string | null;
  notes: string | null;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  providerStatus: string | null;
  billingType: string | null;
  amount: number;
  dueDate: string | null;
  paidAt: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  pixQrCode: string | null;
  pixPayload: string | null;
  rawPayload: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionRecord = {
  id: string;
  orderId: string;
  providerSubscriptionId: string;
  cycle: string | null;
  value: number;
  nextDueDate: string | null;
  status: string | null;
  billingType: string | null;
  rawPayload: string;
  createdAt: string;
  updatedAt: string;
};

export type WebhookEventRecord = {
  id: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  receivedAt: string;
  processedAt: string | null;
  isDuplicate: number;
  payload: string;
  processingResult: string | null;
};

export type PaymentStatusResponse = {
  order: OrderRecord | null;
  payments: PaymentRecord[];
  subscription: SubscriptionRecord | null;
};
