import {
  allStatement,
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";

export type NewsletterSubscriberRecord = {
  id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  consent_text: string;
  subscribed_at: string;
  updated_at: string;
};

export async function subscribeNewsletter(input: {
  name: string;
  email: string;
  source: string;
  consentText: string;
}) {
  const timestamp = nowIso();
  const email = normalizeEmail(input.email);

  await runStatement(
    `
      INSERT INTO newsletter_subscribers (
        id, name, email, status, source, consent_text, subscribed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        status = 'active',
        source = excluded.source,
        consent_text = excluded.consent_text,
        updated_at = excluded.updated_at
    `,
    [
      crypto.randomUUID(),
      input.name.trim(),
      email,
      "active",
      input.source,
      input.consentText,
      timestamp,
      timestamp,
    ],
  );

  return getNewsletterSubscriberByEmail(email);
}

export async function listNewsletterSubscribers(params: {
  q?: string;
  status?: string;
}) {
  const clauses: string[] = [];
  const values: string[] = [];

  if (params.q) {
    clauses.push("(name LIKE ? OR email LIKE ?)");
    values.push(`%${params.q}%`, `%${params.q}%`);
  }

  if (params.status) {
    clauses.push("status = ?");
    values.push(params.status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return allStatement<NewsletterSubscriberRecord>(
    `
      SELECT * FROM newsletter_subscribers
      ${where}
      ORDER BY subscribed_at DESC
      LIMIT 500
    `,
    values,
  );
}

export async function getNewsletterSubscriberByEmail(email: string) {
  return firstStatement<NewsletterSubscriberRecord>(
    "SELECT * FROM newsletter_subscribers WHERE email = ?",
    [normalizeEmail(email)],
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
