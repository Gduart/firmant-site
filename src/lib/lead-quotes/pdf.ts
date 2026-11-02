import { buildCommercialTextPdf } from "@/lib/proposals/proposal-pdf";
import { paymentPolicy, paymentSplit, quoteSections, type QuoteView } from "./model";
export const currency = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export function quoteReference(quote: QuoteView) { return `FIR-WEB-${quote.lead_reference.slice(0, 8).toUpperCase()}-V${quote.revision}`; }
export function buildQuotePdf(quote: QuoteView) {
  const d = quote.document;
  const split = paymentSplit(quote.totalCents);
  const dateBR = (value: string) => value.split("-").reverse().join("/");
  const issuedAt = quote.approved_at ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(quote.approved_at)) : "Rascunho";
  const title = d.title.replace(/^rascunho(?: de proposta)?\s*[-—–:]?\s*/i, "");
  return buildCommercialTextPdf(quoteReference(quote), [
    { heading: "ORÇAMENTO TÉCNICO E COMERCIAL", body: `${title}\n\nCliente: ${quote.lead.name}\nEmpresa: ${quote.lead.company}\nE-mail: ${quote.lead.email}\nServiço: ${quote.lead.service}`, highlight: true },
    ...Object.entries(quoteSections).map(([key, heading]) => ({ heading, body: key === "paymentTerms" ? paymentPolicy : d[key as keyof typeof quoteSections] })),
    { heading: "CRONOGRAMA ESTIMADO", body: `Produção: ${d.productionDays} dias úteis\nInício previsto: ${d.startDate ? dateBR(d.startDate) : "A combinar após aceite e disponibilização dos acessos"}\nFim previsto: ${d.endDate ? dateBR(d.endDate) : "Condicionado ao início confirmado"}\nEstimativa sem feriados; depende dos materiais e aprovações do cliente.\n` + d.schedule.map(s => `${s.phase} - ${s.days} dia(s): ${s.delivery}`).join("\n") },
    { heading: "INVESTIMENTO E PAGAMENTO", body: d.items.map(i => `${i.name}\n${i.quantity} unidade(s) x ${currency(i.unitPriceCents)} = ${currency(Math.round(i.quantity * i.unitPriceCents))}`).join("\n\n") + `\n\n${paymentPolicy}\nValidade: ${d.validityDays} dias a partir da emissão desta versão.\nParcelamento e links de cada etapa são confirmados separadamente pela FIRMANT.`, highlight: true },
  ], { issuedAt, validity: `${d.validityDays} dias da emissão`, total: currency(quote.totalCents), deposit: currency(split.deposit), balance: currency(split.balance) });
}
