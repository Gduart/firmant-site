CREATE TABLE IF NOT EXISTS review_upload_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL,
  asset_id TEXT,
  title TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('IMAGE', 'CAROUSEL', 'VIDEO')),
  caption TEXT,
  duration_ms INTEGER,
  expected_files_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELED')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (asset_id) REFERENCES assets (id)
);

CREATE INDEX IF NOT EXISTS idx_review_upload_sessions_project
  ON review_upload_sessions (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_upload_sessions_expiry
  ON review_upload_sessions (status, expires_at);

CREATE TABLE IF NOT EXISTS review_upload_files (
  session_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  PRIMARY KEY (session_id, position),
  FOREIGN KEY (session_id) REFERENCES review_upload_sessions (id)
);
