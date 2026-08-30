export type BriefingStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "NEEDS_INFORMATION"
  | "CONVERTED"
  | "REJECTED"
  | "ARCHIVED";

export type BriefingRecord = {
  id: string;
  reference_number: string;
  access_token_hash: string;
  status: BriefingStatus;
  client_type: "PF" | "PJ" | null;
  legal_name: string | null;
  trade_name: string | null;
  tax_id: string | null;
  responsible_name: string | null;
  responsible_role: string | null;
  email: string | null;
  billing_email: string | null;
  whatsapp: string | null;
  address: string | null;
  address_number: string | null;
  address_complement: string | null;
  province: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  site: string | null;
  instagram: string | null;
  project_name: string | null;
  brand_name: string | null;
  request_type: string | null;
  content_types_json: string;
  formats_json: string;
  platforms_json: string;
  quantity: number | null;
  duration: string | null;
  scope_description: string | null;
  deadline_requested: string | null;
  budget_range: string | null;
  payment_preferences_json: string;
  additional_notes: string | null;
  privacy_consent: number;
  link_expires_at: string;
  submitted_at: string | null;
  last_saved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BriefingAttachmentRecord = {
  id: string;
  briefing_id: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  status: "UPLOADING" | "READY" | "REJECTED" | "DELETED" | "EXPIRED";
  uploaded_at: string;
  expires_at: string;
  deleted_at: string | null;
};

export type BriefingDraftInput = {
  clientType?: "PF" | "PJ";
  legalName?: string;
  tradeName?: string;
  taxId?: string;
  responsibleName?: string;
  responsibleRole?: string;
  email?: string;
  billingEmail?: string;
  whatsapp?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  province?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  site?: string;
  instagram?: string;
  projectName?: string;
  brandName?: string;
  requestType?: string;
  contentTypes?: string[];
  formats?: string[];
  platforms?: string[];
  quantity?: number | null;
  duration?: string;
  scopeDescription?: string;
  deadlineRequested?: string;
  budgetRange?: string;
  paymentPreferences?: string[];
  additionalNotes?: string;
  privacyConsent?: boolean;
};
