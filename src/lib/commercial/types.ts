export type ContractStatus =
  | "nao_gerado"
  | "pdf_pendente"
  | "pdf_gerado"
  | "pdf_enviado_email"
  | "autentique_pendente"
  | "autentique_enviado"
  | "aguardando_assinatura"
  | "assinado"
  | "dispensado"
  | "cancelado"
  | "erro";

export type ContractType =
  | "pdf_email"
  | "autentique"
  | "analise_manual"
  | "dispensado";

export type CustomerRecord = {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  instagram: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerNoteRecord = {
  id: string;
  customer_id: string;
  note: string;
  created_at: string;
  created_by: string;
};

export type ContractRecord = {
  id: string;
  order_id: string;
  customer_id: string;
  contract_number: string;
  contract_type: ContractType;
  contract_status: ContractStatus;
  pdf_url: string | null;
  email_sent_to: string | null;
  email_sent_at: string | null;
  email_error?: string | null;
  contract_version?: string;
  autentique_document_id: string | null;
  autentique_url: string | null;
  autentique_status: string | null;
  autentique_sent_at: string | null;
  autentique_signed_at: string | null;
  generated_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderEventRecord = {
  id: string;
  order_id: string | null;
  customer_id: string | null;
  event_type: string;
  description: string;
  payload_json: string | null;
  created_at: string;
  created_by: string;
};

export type CommercialOrderRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string | null;
  customerCpfCnpj: string | null;
  serviceSnapshot: string;
  billingModel: string;
  paymentMethodPreference: string;
  oneTimeAmount: number;
  recurringAmount: number;
  amount: number;
  currency: string;
  status: string;
  externalReference: string;
  asaasCustomerId: string | null;
  asaasPaymentId: string | null;
  asaasCheckoutId: string | null;
  asaasSubscriptionId: string | null;
  checkoutUrl: string | null;
  notes: string | null;
};

export type ServiceSnapshotItem = {
  categoryId?: string;
  categoryTitle?: string;
  serviceId?: string;
  serviceLabel?: string;
  qty?: number;
  unit?: string;
  total?: number;
  recurring?: boolean;
};

export type CommercialRegistrationInput = {
  orderId: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  instagram?: string;
};
