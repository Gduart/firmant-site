CREATE TABLE IF NOT EXISTS briefing_requests (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  access_token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEEDS_INFORMATION', 'CONVERTED', 'REJECTED', 'ARCHIVED')),
  client_type TEXT CHECK (client_type IN ('PF', 'PJ')),
  legal_name TEXT,
  trade_name TEXT,
  tax_id TEXT,
  responsible_name TEXT,
  responsible_role TEXT,
  email TEXT,
  billing_email TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  site TEXT,
  instagram TEXT,
  project_name TEXT,
  brand_name TEXT,
  request_type TEXT,
  content_types_json TEXT NOT NULL DEFAULT '[]',
  formats_json TEXT NOT NULL DEFAULT '[]',
  platforms_json TEXT NOT NULL DEFAULT '[]',
  quantity INTEGER,
  duration TEXT,
  scope_description TEXT,
  deadline_requested TEXT,
  budget_range TEXT,
  payment_preferences_json TEXT NOT NULL DEFAULT '[]',
  additional_notes TEXT,
  privacy_consent INTEGER NOT NULL DEFAULT 0,
  link_expires_at TEXT NOT NULL,
  submitted_at TEXT,
  last_saved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_briefing_requests_status
  ON briefing_requests (status);
CREATE INDEX IF NOT EXISTS idx_briefing_requests_created_at
  ON briefing_requests (created_at);
CREATE INDEX IF NOT EXISTS idx_briefing_requests_email
  ON briefing_requests (email);

CREATE TABLE IF NOT EXISTS briefing_attachments (
  id TEXT PRIMARY KEY,
  briefing_id TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'READY'
    CHECK (status IN ('UPLOADING', 'READY', 'REJECTED', 'DELETED', 'EXPIRED')),
  uploaded_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (briefing_id) REFERENCES briefing_requests (id)
);

CREATE INDEX IF NOT EXISTS idx_briefing_attachments_briefing
  ON briefing_attachments (briefing_id);
CREATE INDEX IF NOT EXISTS idx_briefing_attachments_expiry
  ON briefing_attachments (status, expires_at);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  proposal_number TEXT NOT NULL UNIQUE,
  briefing_id TEXT,
  customer_id TEXT,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELED', 'SUPERSEDED')),
  summary TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  included_json TEXT NOT NULL DEFAULT '[]',
  excluded_json TEXT NOT NULL DEFAULT '[]',
  revisions_included INTEGER NOT NULL DEFAULT 2,
  revision_definition TEXT NOT NULL DEFAULT '',
  estimated_deadline TEXT,
  license_terms TEXT NOT NULL DEFAULT '',
  cancellation_terms TEXT NOT NULL DEFAULT '',
  payment_methods_json TEXT NOT NULL DEFAULT '["PIX","CREDIT_CARD"]',
  currency TEXT NOT NULL DEFAULT 'BRL',
  total_cents INTEGER NOT NULL DEFAULT 0,
  validity_days INTEGER NOT NULL DEFAULT 10,
  valid_until TEXT,
  current_version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sent_at TEXT,
  accepted_at TEXT,
  FOREIGN KEY (briefing_id) REFERENCES briefing_requests (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals (status);
CREATE INDEX IF NOT EXISTS idx_proposals_briefing ON proposals (briefing_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals (created_at);

CREATE TABLE IF NOT EXISTS proposal_items (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'servico',
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals (id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal
  ON proposal_items (proposal_id, position);

CREATE TABLE IF NOT EXISTS proposal_versions (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  pdf_storage_key TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  UNIQUE (proposal_id, version_number),
  FOREIGN KEY (proposal_id) REFERENCES proposals (id)
);

CREATE TABLE IF NOT EXISTS proposal_access_links (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  proposal_version_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  first_viewed_at TEXT,
  last_viewed_at TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (proposal_id) REFERENCES proposals (id),
  FOREIGN KEY (proposal_version_id) REFERENCES proposal_versions (id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_links_proposal
  ON proposal_access_links (proposal_id, active);

CREATE TABLE IF NOT EXISTS proposal_acceptances (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  proposal_version_id TEXT NOT NULL UNIQUE,
  decision TEXT NOT NULL CHECK (decision IN ('ACCEPTED', 'REJECTED')),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  terms_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TEXT NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals (id),
  FOREIGN KEY (proposal_version_id) REFERENCES proposal_versions (id)
);

CREATE TABLE IF NOT EXISTS proposal_payment_milestones (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  milestone_type TEXT NOT NULL
    CHECK (milestone_type IN ('FULL', 'DEPOSIT', 'PROGRESS', 'BALANCE', 'ADDITIONAL')),
  label TEXT NOT NULL,
  percentage_basis_points INTEGER,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT,
  order_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CHECKOUT_CREATED', 'AWAITING_PAYMENT', 'PAID', 'OVERDUE', 'CANCELED', 'REFUNDED', 'FAILED')),
  due_trigger TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  UNIQUE (proposal_id, position),
  FOREIGN KEY (proposal_id) REFERENCES proposals (id),
  FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_milestones_status
  ON proposal_payment_milestones (proposal_id, status);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  project_number TEXT NOT NULL UNIQUE,
  proposal_id TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AWAITING_DEPOSIT'
    CHECK (status IN ('AWAITING_DEPOSIT', 'IN_PRODUCTION', 'WAITING_CLIENT', 'REVISION_REQUESTED', 'APPROVED', 'AWAITING_BALANCE', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELED')),
  revisions_included INTEGER NOT NULL DEFAULT 2,
  revisions_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (proposal_id) REFERENCES proposals (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('IMAGE', 'CAROUSEL', 'VIDEO')),
  status TEXT NOT NULL DEFAULT 'PREPARING'
    CHECK (status IN ('PREPARING', 'AWAITING_REVIEW', 'REVISION_REQUESTED', 'IN_ADJUSTMENT', 'RESENT', 'APPROVED', 'ARCHIVED')),
  current_version_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id)
);

CREATE INDEX IF NOT EXISTS idx_assets_project ON assets (project_id, status);

CREATE TABLE IF NOT EXISTS asset_versions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  preview_storage_key TEXT,
  master_storage_key TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  caption TEXT,
  duration_ms INTEGER,
  processing_status TEXT NOT NULL DEFAULT 'READY'
    CHECK (processing_status IN ('UPLOADING', 'PROCESSING', 'READY', 'FAILED')),
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  UNIQUE (asset_id, version_number),
  FOREIGN KEY (asset_id) REFERENCES assets (id)
);

CREATE TABLE IF NOT EXISTS asset_version_items (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  preview_storage_key TEXT NOT NULL,
  master_storage_key TEXT,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (asset_version_id, position),
  FOREIGN KEY (asset_version_id) REFERENCES asset_versions (id)
);

CREATE TABLE IF NOT EXISTS review_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  asset_version_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  max_views INTEGER,
  view_count INTEGER NOT NULL DEFAULT 0,
  first_viewed_at TEXT,
  last_viewed_at TEXT,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (asset_version_id) REFERENCES asset_versions (id)
);

CREATE TABLE IF NOT EXISTS review_rounds (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  asset_version_id TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'SUBMITTED', 'RESOLVED', 'APPROVED')),
  counts_toward_limit INTEGER NOT NULL DEFAULT 1,
  opened_at TEXT NOT NULL,
  submitted_at TEXT,
  resolved_at TEXT,
  UNIQUE (asset_version_id, round_number),
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (asset_id) REFERENCES assets (id),
  FOREIGN KEY (asset_version_id) REFERENCES asset_versions (id)
);

CREATE TABLE IF NOT EXISTS review_feedback (
  id TEXT PRIMARY KEY,
  review_round_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('GENERAL', 'TIMECODE', 'CAROUSEL_ITEM')),
  body TEXT NOT NULL,
  timestamp_ms INTEGER,
  carousel_position INTEGER,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (review_round_id) REFERENCES review_rounds (id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  asset_version_id TEXT NOT NULL UNIQUE,
  approver_name TEXT NOT NULL,
  approver_email TEXT NOT NULL,
  confirmation_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  approved_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (asset_id) REFERENCES assets (id),
  FOREIGN KEY (asset_version_id) REFERENCES asset_versions (id)
);

CREATE TABLE IF NOT EXISTS delivery_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  asset_version_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  storage_key TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  released_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (asset_version_id) REFERENCES asset_versions (id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON audit_events (entity_type, entity_id, created_at);

CREATE TABLE IF NOT EXISTS email_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  template_key TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  idempotency_key TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

