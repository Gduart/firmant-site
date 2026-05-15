ALTER TABLE contracts ADD COLUMN email_error TEXT;
ALTER TABLE contracts ADD COLUMN contract_version TEXT NOT NULL DEFAULT 'v1';

