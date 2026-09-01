import type { ProposalSnapshot } from "@/lib/proposals/types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 52;
const CONTENT_TOP = 704;
const CONTENT_BOTTOM = 64;

type LineKind = "title" | "section" | "label" | "body" | "bullet" | "note" | "space" | "break";
type PdfLine = { kind: LineKind; text: string };

export function buildProposalPdf(snapshot: ProposalSnapshot) {
  const pages = paginate(expandLines(buildDocument(snapshot)));
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];
  pages.forEach((page, i) => {
    const pageObject = 3 + i * 2;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${pageObject + 1} 0 R >>`);
    objects.push(contentStream(page, i + 1, pages.length, snapshot.proposal.proposal_number));
  });
  return new TextEncoder().encode(serialize(objects));
}

function buildDocument(snapshot: ProposalSnapshot): PdfLine[] {
  const p = snapshot.proposal;
  const brief = snapshot.briefing;
  const included = parseList(p.included_json);
  const excluded = parseList(p.excluded_json);
  const platforms = listField(brief, "platforms_json");
  const address = compact([field(brief, "address"), field(brief, "address_number"), field(brief, "address_complement"), field(brief, "province"), field(brief, "city"), field(brief, "state"), field(brief, "postal_code")]).join(" - ");
  return [
    line("title", "PROPOSTA COMERCIAL"),
    line("body", p.project_name), space(),
    line("label", `IDENTIFICACAO - ${p.proposal_number} | Versao ${p.current_version}`),
    line("body", `Cliente: ${p.client_name}`),
    ...optional("Razao social", field(brief, "legal_name")),
    ...optional("CNPJ/CPF", field(brief, "tax_id")),
    ...optional("Responsavel", compact([field(brief, "responsible_name"), field(brief, "responsible_role")]).join(" - ")),
    line("body", `E-mail: ${p.client_email}`),
    ...optional("E-mail financeiro", field(brief, "billing_email")),
    ...optional("WhatsApp", field(brief, "whatsapp")),
    ...optional("Endereco", address),
    line("body", `Emissao: ${formatDate(snapshot.generatedAt)} | Validade: ${formatDate(p.valid_until)}`), space(),
    line("section", "RESUMO EXECUTIVO"), line("body", p.summary), space(),
    line("section", "OBJETIVO E ESCOPO"), line("body", p.scope),
    ...optional("Solicitacao", field(brief, "request_type")),
    ...optional("Marca", field(brief, "brand_name")),
    ...optional("Tipos de conteudo", listField(brief, "content_types_json").join(", ")),
    ...optional("Formatos", listField(brief, "formats_json").join(", ")),
    ...optional("Plataformas", platforms.join(", ")),
    ...optional("Quantidade informada", field(brief, "quantity")),
    ...optional("Duracao informada", field(brief, "duration")), space(),
    line("section", "ENTREGAVEIS E INVESTIMENTO"),
    ...snapshot.items.flatMap((item, i) => [
      line("label", `${i + 1}. ${item.name}`),
      line("body", `${item.quantity} ${item.unit} x ${money(item.unit_price_cents)} = ${money(item.total_cents)}`),
      ...(item.description ? [line("note", item.description)] : []),
    ]),
    line("label", `INVESTIMENTO TOTAL: ${money(p.total_cents)}`), space(),
    line("section", "CONDICAO COMERCIAL 50/50"),
    line("body", "A entrada corresponde a 50% do investimento. A producao somente e liberada depois da confirmacao desse pagamento."),
    line("body", "Os 50% restantes vencem na etapa final. O arquivo master/final somente e liberado depois da confirmacao do saldo."),
    ...snapshot.milestones.map((m) => line("bullet", `${m.label}: ${percentage(m.percentage_basis_points)} - ${money(m.amount_cents)} - ${m.due_trigger ?? "conforme acordado"} - status: ${statusLabel(m.status)}`)),
    line("body", `Formas disponiveis: ${parseList(p.payment_methods_json).map(paymentLabel).join(", ") || "conforme acordado"}.`),

    line("break"), line("title", "O QUE ESTA INCLUIDO"),
    line("body", "Os itens abaixo integram o valor desta proposta, limitados ao escopo, quantidades, formatos e plataformas descritos neste documento."),
    ...included.map((item) => line("bullet", detailIncluded(item))), space(),
    line("section", "O QUE NAO ESTA INCLUIDO"),
    line("body", "Qualquer item fora do escopo precisa ser avaliado antes da execucao e pode gerar prazo e orcamento adicionais."),
    ...excluded.map((item) => line("bullet", detailExcluded(item))), space(),
    line("section", "PREMISSAS DO ESCOPO"),
    line("bullet", "O cliente fornece briefing, identidade visual, arquivos, acessos, produtos e informacoes necessarias dentro dos prazos combinados."),
    line("bullet", "A proposta considera uma unica consolidacao de comentarios por rodada e um responsavel do cliente pela aprovacao."),
    line("bullet", "Alteracoes de conceito, estrutura, quantidade, formato, plataforma ou entregavel serao tratadas como novo escopo."),

    line("break"), line("title", "REVISOES, APROVACOES E PRAZO"),
    line("section", "REVISOES INCLUIDAS"), line("label", `${p.revisions_included} rodada(s) de revisao`), line("body", p.revision_definition),
    line("bullet", "Revisao inclui ajustes pontuais de texto, timing, cortes, edicao, elementos visuais ou audio, desde que o conceito e o escopo aprovados sejam preservados."),
    line("bullet", "Os comentarios de cada rodada devem ser enviados de forma unica, clara e consolidada pelo responsavel do cliente."),
    line("bullet", "Nova ideia, roteiro, personagem, produto, local, fala, estrutura, refacao integral ou mudanca depois de uma aprovacao nao e revisao e pode exigir novo orcamento."),
    line("bullet", "Rodadas adicionais somente com aprovacao previa de valor e impacto no cronograma."), space(),
    line("section", "PONTOS DE APROVACAO"),
    line("body", "Quando aplicavel ao servico contratado, o fluxo utiliza os seguintes marcos para evitar retrabalho:"),
    line("bullet", "1. Direcao visual, personagem, look ou referencia criativa."),
    line("bullet", "2. Roteiro, narrativa, estrutura ou planejamento do material."),
    line("bullet", "3. Primeira versao audiovisual, visual ou funcional para comentarios consolidados."),
    line("bullet", "4. Versao final para aprovacao e liberacao apos a quitacao do saldo."),
    line("body", "Uma etapa aprovada e considerada encerrada. Mudancas posteriores podem alterar prazo e investimento."), space(),
    line("section", "PRAZO E DEPENDENCIAS"), line("label", `Prazo estimado: ${p.estimated_deadline ?? "conforme cronograma acordado"}`),
    ...optional("Prazo solicitado no briefing", field(brief, "deadline_requested")),
    line("body", "A contagem comeca somente depois do aceite, da confirmacao da entrada de 50% e do recebimento integral dos materiais necessarios."),
    line("body", "Atrasos em briefing, materiais, acessos, feedback ou aprovacao suspendem o cronograma e exigem reprogramacao da entrega."),

    line("break"), line("title", "USO, CANCELAMENTO E PROXIMOS PASSOS"),
    line("section", "LICENCA E DIREITOS DE USO"), line("body", p.license_terms),
    line("body", `O uso deve respeitar os entregaveis, formatos e canais previstos nesta proposta${platforms.length ? `: ${platforms.join(", ")}` : ""}.`),
    line("body", "A liberacao dos arquivos finais e dos direitos contratados ocorre depois da quitacao integral. Arquivos-fonte, editaveis e usos nao descritos dependem de previsao expressa."), space(),
    line("section", "CANCELAMENTO E REEMBOLSO"), line("body", p.cancellation_terms),
    line("bullet", "Antes do inicio: serao considerados os custos efetivamente incorridos e as regras legais aplicaveis ao caso."),
    line("bullet", "Depois do planejamento ou da producao: o valor devido sera proporcional as etapas executadas, horas reservadas e despesas comprovadas."),
    line("bullet", "Depois da primeira versao ou da aprovacao final: aplicam-se as etapas ja cumpridas e os compromissos assumidos nesta proposta."),
    line("body", "Nenhuma condicao deste documento afasta direitos obrigatorios previstos na legislacao aplicavel."), space(),
    line("section", "PROXIMO PASSO"),
    line("label", "1. ACEITAR A PROPOSTA"), line("body", "Confirme o aceite dentro da validade indicada neste documento."),
    line("label", "2. REALIZAR A ENTRADA DE 50%"), line("body", "Escolha a forma de pagamento e conclua a primeira cobranca. O simples aceite nao libera a producao."),
    line("label", "3. AGUARDAR A CONFIRMACAO"), line("body", "A FIRMANT inicia o trabalho somente quando o sistema registrar a entrada como paga."),
    line("label", "4. APROVAR E QUITAR O SALDO"), line("body", "Apos a aprovacao final, conclua o pagamento restante para receber o arquivo master/final."), space(),
    line("section", "REGISTRO DA PROPOSTA"),
    line("body", `Termos: ${snapshot.termsVersion} | Gerada em: ${formatDate(snapshot.generatedAt)}`),
    line("note", "Este documento registra as condicoes comerciais desta versao. Alteracoes posteriores exigem nova versao da proposta."),
  ];
}

function contentStream(lines: PdfLine[], page: number, total: number, reference: string) {
  const commands = ["0.965 0.965 0.94 rg", `0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT} re f`, "0.055 0.082 0.063 rg", `0 ${PAGE_HEIGHT - 112} ${PAGE_WIDTH} 112 re f`, "0.62 0.78 0.38 rg", `0 ${PAGE_HEIGHT - 115} ${PAGE_WIDTH} 3 re f`, "BT", "/F2 25 Tf", "1 1 1 rg", `1 0 0 1 ${MARGIN_X} 790 Tm (FIRMANT) Tj`, "/F1 8 Tf", "0.72 0.78 0.73 rg", `1 0 0 1 ${MARGIN_X} 773 Tm (Proposta comercial personalizada) Tj`];
  let y = CONTENT_TOP;
  for (const item of lines) {
    const style = lineStyle(item.kind); y -= style.before;
    if (item.kind !== "space") commands.push(`/${style.bold ? "F2" : "F1"} ${style.size} Tf`, style.color, `1 0 0 1 ${MARGIN_X + style.indent} ${y} Tm (${escapeText(item.text)}) Tj`);
    y -= style.after;
  }
  commands.push("/F1 8 Tf", "0.25 0.36 0.27 rg", `1 0 0 1 ${MARGIN_X} 35 Tm (${escapeText(`${reference} | Pagina ${page} de ${total} | ag.firmant@gmail.com`)}) Tj`, "ET");
  const stream = commands.join("\n"); return `<< /Length ${bytes(stream)} >>\nstream\n${stream}\nendstream`;
}

function expandLines(lines: PdfLine[]) { return lines.flatMap((item) => { if (item.kind === "break" || item.kind === "space") return [item]; const max = item.kind === "title" ? 52 : item.kind === "section" ? 70 : item.kind === "bullet" || item.kind === "note" ? 86 : 92; const prefix = item.kind === "bullet" ? "- " : ""; return wrap(item.text, max - prefix.length).map((text, i) => ({ kind: i > 0 && ["label", "section", "title"].includes(item.kind) ? "body" as const : item.kind, text: `${i === 0 ? prefix : item.kind === "bullet" ? "  " : ""}${text}` })); }); }
function paginate(lines: PdfLine[]) { const pages: PdfLine[][] = []; let page: PdfLine[] = []; let used = 0; const available = CONTENT_TOP - CONTENT_BOTTOM; for (const item of lines) { if (item.kind === "break") { if (page.length) pages.push(trimSpaces(page)); page = []; used = 0; continue; } const height = lineHeight(item.kind); const keep = ["title", "section", "label"].includes(item.kind); if (page.length && used + height + (keep ? 13 : 0) > available) { pages.push(trimSpaces(page)); page = []; used = 0; } if (item.kind === "space" && page.length === 0) continue; page.push(item); used += height; } if (page.length) pages.push(trimSpaces(page)); return pages.length ? pages : [[]]; }
function lineStyle(kind: LineKind) { if (kind === "title") return { size: 16, bold: true, color: "0.08 0.19 0.11 rg", indent: 0, before: 0, after: 24 }; if (kind === "section") return { size: 10.5, bold: true, color: "0.10 0.28 0.14 rg", indent: 0, before: 6, after: 16 }; if (kind === "label") return { size: 8.7, bold: true, color: "0.10 0.16 0.11 rg", indent: 0, before: 2, after: 13 }; if (kind === "bullet") return { size: 8.2, bold: false, color: "0.12 0.15 0.13 rg", indent: 8, before: 0, after: 12 }; if (kind === "note") return { size: 7.8, bold: false, color: "0.30 0.36 0.31 rg", indent: 8, before: 0, after: 11 }; if (kind === "space") return { size: 8, bold: false, color: "0 0 0 rg", indent: 0, before: 0, after: 8 }; return { size: 8.3, bold: false, color: "0.12 0.15 0.13 rg", indent: 0, before: 0, after: 12.5 }; }
function lineHeight(kind: LineKind) { const s = lineStyle(kind); return s.before + s.after; }
function line(kind: LineKind, text = ""): PdfLine { return { kind, text: ascii(text) }; }
function space() { return line("space"); }
function optional(label: string, value: string): PdfLine[] { return value ? [line("body", `${label}: ${value}`)] : []; }
function trimSpaces(lines: PdfLine[]) { while (lines.at(-1)?.kind === "space") lines.pop(); return lines; }
function compact(values: string[]) { return values.filter(Boolean); }
function field(record: Record<string, unknown> | null, key: string) { const value = record?.[key]; return typeof value === "string" || typeof value === "number" ? String(value).trim() : ""; }
function listField(record: Record<string, unknown> | null, key: string) { const value = record?.[key]; if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string"); return typeof value === "string" ? parseList(value) : []; }
function serialize(objects: string[]) { const header = "%PDF-1.4\n"; const offsets = [0]; let body = ""; objects.forEach((object, i) => { offsets.push(bytes(header + body)); body += `${i + 1} 0 obj\n${object}\nendobj\n`; }); const xref = bytes(header + body); return header + body + ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `), "trailer", `<< /Size ${objects.length + 1} /Root 1 0 R >>`, "startxref", String(xref), "%%EOF"].join("\n"); }
function wrap(value: string, max: number) { const words = ascii(value).split(/\s+/).filter(Boolean); const lines: string[] = []; let current = ""; for (const word of words) { const next = current ? `${current} ${word}` : word; if (next.length > max && current) { lines.push(current); current = word; } else current = next; } if (current) lines.push(current); return lines.length ? lines : [""]; }
function ascii(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, " "); }
function escapeText(value: string) { return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
function bytes(value: string) { return new TextEncoder().encode(value).length; }
function parseList(value: string) { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)) : "Nao definida"; }
function paymentLabel(value: string) { return value === "PIX" ? "Pix" : value === "CREDIT_CARD" ? "Cartao de credito" : value === "BOLETO" ? "Boleto" : value; }
function percentage(value: number | null) { return value === null ? "valor definido" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value / 100)}%`; }
function statusLabel(value: string) { const labels: Record<string, string> = { PENDING: "pendente", CHECKOUT_CREATED: "cobranca criada", PAID: "pago", CONFIRMED: "confirmado", OVERDUE: "vencido", CANCELLED: "cancelado", REFUNDED: "reembolsado" }; return labels[value] ?? value.toLowerCase().replaceAll("_", " "); }
function detailIncluded(value: string) { const text = value.trim(); const lower = text.toLowerCase(); if (lower.includes("briefing")) return `${text}: leitura, organizacao dos requisitos e validacao das informacoes necessarias antes da producao.`; if (lower.includes("planejamento") || lower.includes("direcao")) return `${text}: definicao da abordagem, sequencia de trabalho, referencias e criterios de entrega dentro do escopo aprovado.`; if (lower.includes("producao")) return `${text}: execucao somente dos entregaveis, quantidades e formatos discriminados nesta proposta.`; if (lower.includes("aprov")) return `${text}: disponibilizacao da versao prevista para conferencia e envio consolidado dos comentarios.`; if (lower.includes("revis")) return `${text}: ajustes limitados a quantidade e a definicao da secao de revisoes deste documento.`; return `${text}: executado dentro dos limites, quantidades e condicoes definidos nesta proposta.`; }
function detailExcluded(value: string) { return `${value.trim()}: nao compoe o investimento atual; se solicitado, depende de analise de viabilidade, prazo e orcamento adicional.`; }
