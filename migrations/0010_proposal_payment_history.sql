CREATE TABLE IF NOT EXISTS proposal_payment_history (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  checkout_url TEXT,
  order_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  replaced_by_order_id TEXT NOT NULL,
  replaced_at TEXT NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals (id),
  FOREIGN KEY (milestone_id) REFERENCES proposal_payment_milestones (id),
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (replaced_by_order_id) REFERENCES orders (id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_payment_history_proposal
  ON proposal_payment_history (proposal_id, replaced_at DESC);
