export const quoteSections = {
  summary: "Resumo executivo", objective: "Objetivo do projeto", scope: "Escopo e entregáveis",
  exclusions: "O que não está incluído", assumptions: "Premissas e estimativas", dependencies: "Dependências do cliente",
  technology: "Tecnologias e integrações propostas", security: "Segurança da aplicação", privacy: "Privacidade e tratamento de dados",
  infrastructure: "Hospedagem, backups e custos recorrentes", acceptance: "Testes e critérios de aceite",
  support: "Garantia, suporte e manutenção", ownership: "Código, propriedade e licenças", changes: "Revisões e mudanças de escopo",
  paymentTerms: "Condições comerciais e de pagamento", missingInformation: "Informações a confirmar com o cliente",
} as const;
export type SectionKey = keyof typeof quoteSections;
export function emptyQuoteSections(): Record<SectionKey, string> { return Object.fromEntries(Object.keys(quoteSections).map(key => [key, ""])) as Record<SectionKey, string>; }
export type QuoteDocument = Record<SectionKey, string> & {
  title: string; startDate: string; endDate: string; productionDays: number; validityDays: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
  schedule: { phase: string; days: number; delivery: string }[];
  sources: { title: string; url: string }[];
};
export type QuoteLead = { reference: string; name: string; company: string; email: string; phone: string; service: string; details: string };
export type QuoteRecord = { lead_reference: string; revision: number; document_json: string; lead_json: string; status: "DRAFT" | "APPROVED"; created_at: string; created_by: string; approved_at: string | null; approved_by: string | null; model: string | null };
export type QuoteView = Omit<QuoteRecord, "document_json" | "lead_json"> & { document: QuoteDocument; lead: QuoteLead; totalCents: number };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dados inválidos.");
  return value as Record<string, unknown>;
}
export function text(value: unknown, name: string, limit = 5000, required = false): string {
  if (typeof value !== "string") throw new Error(`Campo inválido: ${name}.`);
  const result = value.trim();
  if (result.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) throw new Error(`Revise o campo ${name}.`);
  if (required && !result) throw new Error(`Preencha ${name}.`);
  return result;
}
export function number(value: unknown, name: string, min: number, max: number, integer = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) throw new Error(`Valor inválido: ${name}.`);
  return value;
}
export function validateLead(value: unknown): QuoteLead {
  const v = object(value);
  const reference = text(v.reference, "referência", 36, true);
  if (!/^[0-9a-f-]{36}$/i.test(reference)) throw new Error("Referência inválida.");
  const email = text(v.email, "e-mail", 160, true);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("E-mail inválido.");
  return { reference, email, name: text(v.name, "nome", 100, true), company: text(v.company, "empresa", 120, true), phone: text(v.phone ?? "", "telefone", 40), service: text(v.service ?? "", "serviço", 160), details: text(v.details ?? "", "briefing", 16000) };
}
function date(value: unknown, label: string) {
  const result = text(value, label, 10);
  if (result && (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result)) throw new Error(`Data inválida: ${label}.`);
  return result;
}
export function validateDocument(value: unknown): QuoteDocument {
  const v = object(value);
  const sections = Object.fromEntries(Object.entries(quoteSections).map(([key, label]) => [key, text(v[key], label)])) as Record<SectionKey, string>;
  if (!Array.isArray(v.items) || v.items.length < 1 || v.items.length > 40 || !Array.isArray(v.schedule) || v.schedule.length > 20 || !Array.isArray(v.sources) || v.sources.length > 20) throw new Error("Revise itens, cronograma e fontes.");
  const doc: QuoteDocument = { ...sections, title: text(v.title, "projeto", 180, true),
    startDate: date(v.startDate, "início previsto"), endDate: date(v.endDate, "fim previsto"),
    productionDays: number(v.productionDays, "dias de produção", 1, 2000, true), validityDays: number(v.validityDays, "validade", 1, 365, true),
    items: v.items.map(item => { const i = object(item); return { name: text(i.name, "item", 250, true), quantity: number(i.quantity, "quantidade", .01, 100000), unitPriceCents: number(i.unitPriceCents, "preço unitário", 0, 100_000_000, true) }; }),
    schedule: v.schedule.map(item => { const i = object(item); return { phase: text(i.phase, "etapa", 180, true), days: number(i.days, "dias da etapa", 1, 2000, true), delivery: text(i.delivery, "entrega da etapa", 1200, true) }; }),
    sources: v.sources.map(item => { const i = object(item); const url = new URL(text(i.url, "fonte", 1200, true)); if (url.protocol !== "https:" || url.username || url.password) throw new Error("Fonte inválida."); return { title: text(i.title, "título da fonte", 250, true), url: url.href }; }),
  };
  if (doc.startDate && doc.endDate && doc.endDate < doc.startDate) throw new Error("O fim previsto deve ser posterior ao início.");
  if (JSON.stringify(doc).length > 65000 || totalCents(doc) > 100_000_000) throw new Error("Orçamento acima do limite permitido.");
  return doc;
}
export function totalCents(doc: QuoteDocument) { return doc.items.reduce((sum, i) => sum + Math.round(i.quantity * i.unitPriceCents), 0); }
export const paymentPolicy = "50% de sinal de entrada para iniciar o projeto e os 50% restantes na entrega do projeto. Pagamento por Pix ou cartão de crédito, à vista ou parcelado conforme a condição aprovada. Custos de terceiros são tratados separadamente.";
export function paymentSplit(total: number) {
  const deposit = Math.round(total / 2);
  return { deposit, balance: total - deposit };
}
export function validateDeliveryRecipient(value: unknown): string {
  const email = text(value, "e-mail do destinatário", 160, true);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Informe um e-mail válido para receber o PDF.");
  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  if (/(^|\.)(invalid|test|example|localhost)$/.test(domain) || /(^|\.)example\.(com|net|org)$/.test(domain)) throw new Error("Este é um e-mail fictício de demonstração. Informe um destinatário real para enviar.");
  return email;
}
export function assertApprovable(doc: QuoteDocument) {
  if (totalCents(doc) <= 0) throw new Error("Defina um investimento maior que zero.");
  for (const [key, label] of Object.entries(quoteSections)) if (!doc[key as SectionKey]) throw new Error(`Revise ${label}; indique também quando não se aplica.`);
  if (!doc.schedule.length) throw new Error("Defina ao menos uma etapa de produção.");
  if (doc.schedule.reduce((sum, item) => sum + item.days, 0) !== doc.productionDays) throw new Error("A soma dos dias das etapas deve corresponder aos dias de produção.");
  if (Boolean(doc.startDate) !== Boolean(doc.endDate)) throw new Error("Informe início e fim previstos ou deixe ambos condicionados ao aceite.");
}
export function viewQuote(row: QuoteRecord): QuoteView { const { document_json, lead_json, ...rest } = row; const document = validateDocument(JSON.parse(document_json)); return { ...rest, document, lead: validateLead(JSON.parse(lead_json)), totalCents: totalCents(document) }; }
export function addBusinessDays(start: string, days: number) {
  const d = new Date(`${start}T12:00:00Z`); let remaining = days - 1;
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
  while (remaining > 0) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) remaining--; }
  return d.toISOString().slice(0, 10);
}
export function filledBriefing(details: string) {
  return details.split(/\n\s*\n/).filter(block => !/(?:\n|:\s*)(?:Não informado|A definir|Precisa de orientação)\s*$/i.test(block)).join("\n\n").trim();
}
