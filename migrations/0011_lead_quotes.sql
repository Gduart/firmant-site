-- Orçamentos vinculados ao Diagnóstico; versões anteriores permanecem preservadas.
CREATE TABLE IF NOT EXISTS lead_quotes (
 lead_reference TEXT NOT NULL, revision INTEGER NOT NULL,
 document_json TEXT NOT NULL, lead_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','APPROVED')),
 created_at TEXT NOT NULL, created_by TEXT NOT NULL,
 approved_at TEXT, approved_by TEXT, model TEXT,
 PRIMARY KEY (lead_reference, revision)
);
CREATE TABLE IF NOT EXISTS lead_quote_payments (
 id TEXT PRIMARY KEY, lead_reference TEXT NOT NULL, revision INTEGER NOT NULL,
 amount_cents INTEGER NOT NULL, mode TEXT NOT NULL, installments INTEGER NOT NULL,
 request_key TEXT NOT NULL UNIQUE,
 state TEXT NOT NULL CHECK(state IN ('CREATING','READY','UNCERTAIN')),
 order_id TEXT, checkout_url TEXT, created_at TEXT NOT NULL, expires_at TEXT NOT NULL,
 FOREIGN KEY(lead_reference,revision) REFERENCES lead_quotes(lead_reference,revision)
);
CREATE TABLE IF NOT EXISTS lead_quote_events (
 id TEXT PRIMARY KEY, lead_reference TEXT NOT NULL, revision INTEGER NOT NULL,
 action TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL, detail TEXT NOT NULL
);
