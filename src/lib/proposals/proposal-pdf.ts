import type { ProposalSnapshot } from "@/lib/proposals/types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 52;
const MAX_CHARS = 92;

export function buildProposalPdf(snapshot: ProposalSnapshot) {
  const lines = buildLines(snapshot).flatMap(wrapLine);
  const pages = paginate(lines, 38);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];
  pages.forEach((pageLines, index) => {
    const pageObject = 3 + index * 2;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${pageObject + 1} 0 R >>`);
    objects.push(contentStream(pageLines, index + 1, pages.length, snapshot.proposal.proposal_number));
  });
  return new TextEncoder().encode(serialize(objects));
}

function buildLines(snapshot: ProposalSnapshot) {
  const p = snapshot.proposal;
  return [
    heading("PROPOSTA COMERCIAL"),
    p.project_name,
    "",
    `Proposta: ${p.proposal_number} | Versao: ${p.current_version}`,
    `Cliente: ${p.client_name} | E-mail: ${p.client_email}`,
    `Valida ate: ${formatDate(p.valid_until)}`,
    "",
    heading("RESUMO EXECUTIVO"), p.summary, "",
    heading("ESCOPO"), p.scope, "",
    heading("ENTREGAVEIS E INVESTIMENTO"),
    ...snapshot.items.map((item) => `- ${item.name} | ${item.quantity} ${item.unit} | ${money(item.total_cents)} | ${item.description}`),
    `INVESTIMENTO TOTAL: ${money(p.total_cents)}`,
    "",
    heading("INCLUIDO"), ...parseList(p.included_json).map((item) => `- ${item}`),
    "", heading("NAO INCLUIDO"), ...parseList(p.excluded_json).map((item) => `- ${item}`),
    "", heading("PRAZO E REVISOES"),
    `Prazo estimado: ${p.estimated_deadline ?? "Conforme cronograma acordado"}`,
    `Rodadas de revisao incluidas: ${p.revisions_included}`,
    p.revision_definition,
    "", heading("ETAPAS DE PAGAMENTO"),
    ...snapshot.milestones.map((item) => `- ${item.label}: ${money(item.amount_cents)} | ${item.due_trigger ?? "Conforme acordado"}`),
    `Formas aceitas: ${parseList(p.payment_methods_json).map(paymentLabel).join(", ")}`,
    "", heading("LICENCA E USO"), p.license_terms,
    "", heading("CANCELAMENTO"), p.cancellation_terms,
    "", heading("REGISTRO DA VERSAO"),
    `Termos: ${snapshot.termsVersion}`,
    `Gerada em: ${formatDate(snapshot.generatedAt)}`,
  ];
}

function contentStream(lines: string[], page: number, total: number, reference: string) {
  const commands = ["0.965 0.965 0.94 rg", `0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT} re f`, "0.055 0.082 0.063 rg", `0 ${PAGE_HEIGHT - 112} ${PAGE_WIDTH} 112 re f`, "0.62 0.78 0.38 rg", `0 ${PAGE_HEIGHT - 115} ${PAGE_WIDTH} 3 re f`, "BT", "/F2 25 Tf", "1 1 1 rg", `1 0 0 1 ${MARGIN_X} 790 Tm (FIRMANT) Tj`, "/F1 8 Tf", "0.72 0.78 0.73 rg", `1 0 0 1 ${MARGIN_X} 773 Tm (Proposta comercial personalizada) Tj`];
  let y = 705;
  for (const line of lines) {
    const isHeading = line.startsWith("## ");
    const text = isHeading ? line.slice(3) : line;
    commands.push(`/${isHeading ? "F2" : "F1"} ${isHeading ? 11 : 8.7} Tf`, isHeading ? "0.12 0.24 0.14 rg" : "0.12 0.15 0.13 rg", `1 0 0 1 ${MARGIN_X} ${y} Tm (${escapeText(text)}) Tj`);
    y -= isHeading ? 18 : 14;
  }
  commands.push("/F1 8 Tf", "0.25 0.36 0.27 rg", `1 0 0 1 ${MARGIN_X} 35 Tm (${escapeText(`${reference} | Pagina ${page} de ${total} | ag.firmant@gmail.com`)}) Tj`, "ET");
  const stream = commands.join("\n");
  return `<< /Length ${bytes(stream)} >>\nstream\n${stream}\nendstream`;
}

function serialize(objects: string[]) { const header = "%PDF-1.4\n"; const offsets = [0]; let body = ""; objects.forEach((object, index) => { offsets.push(bytes(header + body)); body += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const xrefOffset = bytes(header + body); return header + body + ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `), "trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", String(xrefOffset), "%%EOF"].join("\n"); }
function paginate(lines: string[], max: number) { const pages: string[][] = []; for (let index = 0; index < lines.length; index += max) pages.push(lines.slice(index, index + max)); return pages.length ? pages : [[]]; }
function wrapLine(value: string) { if (!value || value.startsWith("## ")) return [value]; const words = ascii(value).split(" "); const lines: string[] = []; let current = ""; for (const word of words) { const next = current ? `${current} ${word}` : word; if (next.length > MAX_CHARS && current) { lines.push(current); current = word; } else current = next; } if (current) lines.push(current); return lines; }
function heading(value: string) { return `## ${ascii(value)}`; }
function ascii(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, " "); }
function escapeText(value: string) { return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
function bytes(value: string) { return new TextEncoder().encode(value).length; }
function parseList(value: string) { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value)) : "Nao definida"; }
function paymentLabel(value: string) { return value === "PIX" ? "Pix" : value === "CREDIT_CARD" ? "Cartao de credito" : value === "BOLETO" ? "Boleto" : value; }
