import { workflowAll, workflowFirst, workflowRun } from "@/lib/workflow/db";
import { assertApprovable, viewQuote, type QuoteDocument, type QuoteLead, type QuoteRecord } from "./model";

export async function latestQuote(reference: string) {
  const row = await workflowFirst<QuoteRecord>("SELECT * FROM lead_quotes WHERE lead_reference=? ORDER BY revision DESC LIMIT 1", [reference]);
  return row ? viewQuote(row) : null;
}
export async function writeQuote(lead: QuoteLead, document: QuoteDocument, expectedRevision: number, actor: string, model: string | null) {
  const row = await workflowFirst<QuoteRecord>(`INSERT INTO lead_quotes (lead_reference,revision,document_json,lead_json,status,created_at,created_by,model)
    SELECT ?,?,?,?,?,?,?,? WHERE COALESCE((SELECT MAX(revision) FROM lead_quotes WHERE lead_reference=?),0)=? RETURNING *`,
    [lead.reference, expectedRevision + 1, JSON.stringify(document), JSON.stringify(lead), "DRAFT", new Date().toISOString(), actor, model, lead.reference, expectedRevision]);
  if (!row) throw new Error("Este orçamento foi alterado em outra tela. Recarregue antes de continuar.");
  return viewQuote(row);
}
export async function approveQuote(reference: string, revision: number, actor: string) {
  const quote = await requireQuote(reference, revision);
  if (quote.status === "APPROVED") return quote;
  assertApprovable(quote.document);
  const row = await workflowFirst<QuoteRecord>(`UPDATE lead_quotes SET status='APPROVED',approved_at=?,approved_by=?
    WHERE lead_reference=? AND revision=? AND revision=(SELECT MAX(revision) FROM lead_quotes WHERE lead_reference=?) RETURNING *`,
    [new Date().toISOString(), actor, reference, revision, reference]);
  if (!row) throw new Error("O orçamento foi alterado. Recarregue a página.");
  return viewQuote(row);
}
export async function requireQuote(reference: string, revision: number, approved = false) {
  const quote = await latestQuote(reference);
  if (!quote || quote.revision !== revision) throw new Error("A versão do orçamento mudou. Recarregue antes de continuar.");
  if (approved && quote.status !== "APPROVED") throw new Error("Revise e aprove esta versão antes de gerar PDF, enviar ou cobrar.");
  return quote;
}
export type QuotePayment = { id: string; lead_reference: string; revision: number; amount_cents: number; mode: string; installments: number; state: string; order_id: string | null; checkout_url: string | null; created_at: string; expires_at: string; order_status?: string | null };
export async function paymentHistory(reference: string) {
  return workflowAll<QuotePayment>(`SELECT p.*,o.status AS order_status FROM lead_quote_payments p LEFT JOIN orders o ON o.id=p.order_id WHERE p.lead_reference=? ORDER BY p.created_at DESC LIMIT 50`, [reference]);
}
export async function quoteEvents(reference: string) {
  return workflowAll<{ action: string; actor: string; revision: number; created_at: string; detail: string }>("SELECT action,actor,revision,created_at,detail FROM lead_quote_events WHERE lead_reference=? ORDER BY created_at DESC LIMIT 50", [reference]);
}
export async function event(reference: string, revision: number, action: string, actor: string, detail: string) {
  await workflowRun("INSERT INTO lead_quote_events(id,lead_reference,revision,action,actor,created_at,detail) VALUES(?,?,?,?,?,?,?)", [crypto.randomUUID(), reference, revision, action, actor, new Date().toISOString(), detail]);
}
