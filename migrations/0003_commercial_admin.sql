CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_cpf ON customers (cpf);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_instagram ON customers (instagram);

CREATE TABLE IF NOT EXISTS customer_notes (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes (customer_id);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  contract_number TEXT NOT NULL UNIQUE,
  contract_type TEXT NOT NULL,
  contract_status TEXT NOT NULL,
  pdf_url TEXT,
  email_sent_to TEXT,
  email_sent_at TEXT,
  autentique_document_id TEXT,
  autentique_url TEXT,
  autentique_status TEXT,
  autentique_sent_at TEXT,
  autentique_signed_at TEXT,
  generated_at TEXT,
  signed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts (customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (contract_status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts (contract_type);

CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  customer_id TEXT,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events (order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_customer_id ON order_events (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_events_type ON order_events (event_type);

