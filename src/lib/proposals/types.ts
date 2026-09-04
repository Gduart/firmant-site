export type ProposalItemInput = {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPriceCents: number;
};

export type PaymentMilestoneInput = {
  id?: string;
  type: "FULL" | "DEPOSIT" | "PROGRESS" | "BALANCE" | "ADDITIONAL";
  label: string;
  percentageBasisPoints?: number | null;
  amountCents: number;
  dueTrigger?: string;
};

export type ProposalEditorInput = {
  projectName: string;
  clientName: string;
  clientEmail: string;
  summary: string;
  scope: string;
  included: string[];
  excluded: string[];
  revisionsIncluded: number;
  revisionDefinition: string;
  estimatedDeadline?: string;
  licenseTerms: string;
  cancellationTerms: string;
  paymentMethods: Array<"PIX" | "CREDIT_CARD" | "BOLETO">;
  validityDays: number;
  items: ProposalItemInput[];
  milestones: PaymentMilestoneInput[];
};

export type ProposalRecord = {
  id: string;
  proposal_number: string;
  briefing_id: string | null;
  customer_id: string | null;
  project_name: string;
  client_name: string;
  client_email: string;
  status: string;
  summary: string;
  scope: string;
  included_json: string;
  excluded_json: string;
  revisions_included: number;
  revision_definition: string;
  estimated_deadline: string | null;
  license_terms: string;
  cancellation_terms: string;
  payment_methods_json: string;
  currency: string;
  total_cents: number;
  validity_days: number;
  valid_until: string | null;
  current_version: number;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  accepted_at: string | null;
};

export type ProposalItemRecord = {
  id: string;
  proposal_id: string;
  position: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price_cents: number;
  total_cents: number;
};

export type ProposalMilestoneRecord = {
  id: string;
  proposal_id: string;
  position: number;
  milestone_type: PaymentMilestoneInput["type"];
  label: string;
  percentage_basis_points: number | null;
  amount_cents: number;
  payment_method: string | null;
  order_id: string | null;
  status: string;
  due_trigger: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  checkout_url?: string | null;
  order_status?: string | null;
  order_created_at?: string | null;
  asaas_checkout_id?: string | null;
  asaas_payment_id?: string | null;
  checkout_expired?: boolean;
};

export type ProposalSnapshot = {
  proposal: ProposalRecord;
  items: ProposalItemRecord[];
  milestones: ProposalMilestoneRecord[];
  briefing: Record<string, unknown> | null;
  termsVersion: string;
  generatedAt: string;
};
