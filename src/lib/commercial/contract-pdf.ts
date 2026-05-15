import {
  parseServiceSnapshot,
} from "@/lib/commercial/repository";
import type {
  CommercialOrderRecord,
  ContractRecord,
  ServiceSnapshotItem,
} from "@/lib/commercial/types";

type ContractPdfData = {
  contract: ContractRecord & {
    full_name?: string | null;
    cpf?: string | null;
    email?: string | null;
    phone?: string | null;
    instagram?: string | null;
    order_status?: string | null;
    amount?: number | null;
  };
  order: CommercialOrderRecord | null;
};

const pageWidth = 595;
const pageHeight = 842;
const marginX = 54;
const marginTop = 150;
const lineHeight = 15;
const maxChars = 96;

export function buildContractPdf(data: ContractPdfData) {
  const lines = buildContractLines(data);
  const pages = paginate(lines);
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObject = 3 + index * 2;
    const contentObject = pageObject + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObject} 0 R >>`);
    objects.push(buildContentStream(pageLines, index + 1, pages.length));
  });

  return encodePdf(serializePdf(objects));
}

function buildContractLines({ contract, order }: ContractPdfData) {
  const services = parseServiceSnapshot(order?.serviceSnapshot);
  const generatedAt = formatDate(contract.generated_at ?? contract.created_at);
  const paymentMethod = order?.paymentMethodPreference ?? "Nao informado";
  const amount = formatCurrency(order?.amount ?? contract.amount ?? 0);

  return [
    heading("CONTRATO / TERMO DE CONTRATACAO FIRMANT"),
    "",
    `Numero do contrato: ${contract.contract_number}`,
    `Numero do pedido: ${contract.order_id}`,
    `Data: ${generatedAt}`,
    "",
    heading("1. DADOS DA FIRMANT"),
    "Nome comercial: FIRMANT",
    "CNPJ: 63.867.205/0001-99",
    "Atendimento: 100% online para todo o Brasil",
    "E-mail: ag.firmant@gmail.com",
    "WhatsApp: +55 11 91491-2488",
    "",
    heading("2. DADOS DO CLIENTE"),
    `Nome completo: ${contract.full_name ?? order?.customerName ?? ""}`,
    `CPF: ${formatCpf(contract.cpf ?? order?.customerCpfCnpj ?? "")}`,
    `E-mail: ${contract.email ?? order?.customerEmail ?? ""}`,
    `Telefone/WhatsApp: ${formatPhone(contract.phone ?? order?.customerPhone ?? "")}`,
    `Instagram: ${formatInstagram(contract.instagram)}`,
    "",
    heading("3. SERVICOS SOLICITADOS"),
    ...formatServices(services),
    "",
    heading("4. CONDICOES COMERCIAIS"),
    `Valor: ${amount}`,
    `Forma de pagamento: ${paymentMethod}`,
    `Modelo de contratacao: ${order?.billingModel ?? "Nao informado"}`,
    `Status do pagamento: ${contract.order_status ?? order?.status ?? "Nao informado"}`,
    "Parcelamento: conforme opcao escolhida no checkout Asaas, quando aplicavel.",
    "",
    heading("5. POLITICAS APLICAVEIS"),
    "Aplicam-se a esta contratacao os Termos de Uso, a Politica de Privacidade e a Politica de Reembolso da FIRMANT, disponiveis no site firmant.com.br.",
    "",
    heading("6. CLAUSULAS DE SERVICO"),
    "A execucao dos servicos depende do escopo contratado, disponibilidade operacional, envio de informacoes pelo cliente, aprovacoes, materiais necessarios e condicoes comerciais confirmadas pela FIRMANT.",
    "Servicos digitais personalizados podem envolver estrategia, planejamento, criacao, tecnologia, inteligencia artificial, automacoes, desenvolvimento, edicao e producao intelectual sob demanda.",
    "",
    heading("7. CANCELAMENTO E REEMBOLSO"),
    "Cancelamentos, desistencias, creditos e reembolsos serao analisados conforme a Politica de Reembolso da FIRMANT, considerando o tipo de servico, o estagio de execucao, horas dedicadas, materiais produzidos, custos assumidos e boa-fe das partes.",
    "",
    heading("8. RESPONSABILIDADE DO CLIENTE"),
    "O cliente declara que as informacoes e materiais enviados sao verdadeiros, licitos e autorizados para uso. O cliente tambem se compromete a enviar dados, acessos, arquivos, aprovacoes e retornos necessarios para a execucao do servico.",
    "",
    heading("9. USO DE INTELIGENCIA ARTIFICIAL"),
    "A FIRMANT pode utilizar ferramentas de IA como apoio estrategico, criativo, tecnico e operacional. A IA nao substitui curadoria, analise e responsabilidade humana da FIRMANT.",
    "",
    heading("10. LIMITACOES DE RESULTADO"),
    "A FIRMANT nao garante resultados absolutos, como vendas, seguidores, viralizacao, posicao em buscadores, performance exata em anuncios ou retorno financeiro especifico. Resultados podem variar conforme mercado, oferta, concorrencia, algoritmo, verba, recorrencia e decisoes do cliente.",
    "",
    heading("11. CANAL DE CONTATO"),
    "Duvidas sobre esta contratacao podem ser enviadas para ag.firmant@gmail.com ou WhatsApp +55 11 91491-2488.",
  ].flatMap((line) => wrapLine(line));
}

function formatServices(services: ServiceSnapshotItem[]) {
  if (services.length === 0) {
    return ["Servicos nao identificados no snapshot do pedido."];
  }

  return services.map((service) => {
    const qty = service.qty ?? 1;
    const total = formatCurrency(service.total ?? 0);
    const recurrent = service.recurring ? "recorrente" : "avulso";
    return `- ${service.categoryTitle ?? "Categoria"} | ${service.serviceLabel ?? "Servico"} | Quantidade: ${qty} | Total: ${total} | ${recurrent}`;
  });
}

function paginate(lines: string[]) {
  const pages: string[][] = [];
  let current: string[] = [];
  const maxLines = 35;

  lines.forEach((line) => {
    if (current.length >= maxLines) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  });

  if (current.length > 0) {
    pages.push(current);
  }

  return pages;
}

function buildContentStream(lines: string[], page: number, totalPages: number) {
  const commands: string[] = [
    "0.965 0.973 0.984 rg",
    `0 0 ${pageWidth} ${pageHeight} re f`,
    "0.039 0.086 0.157 rg",
    `0 ${pageHeight - 116} ${pageWidth} 116 re f`,
    "0.788 0.659 0.298 rg",
    `0 ${pageHeight - 119} ${pageWidth} 3 re f`,
    "BT",
  ];
  let y = pageHeight - marginTop;

  commands.push("/F2 26 Tf");
  commands.push("1 1 1 rg");
  commands.push(`1 0 0 1 ${marginX} 790 Tm (FIRM) Tj`);
  commands.push("0.788 0.659 0.298 rg");
  commands.push(`1 0 0 1 ${marginX + 64} 790 Tm (ANT) Tj`);
  commands.push("/F1 8 Tf");
  commands.push("0.72 0.78 0.87 rg");
  commands.push(`1 0 0 1 ${marginX} 774 Tm (${escapePdfText("Agencia digital com IA, estrategia e solucoes online")}) Tj`);
  commands.push("/F2 13 Tf");
  commands.push("1 1 1 rg");
  commands.push(`1 0 0 1 ${marginX} 746 Tm (${escapePdfText(page === 1 ? "Contrato / Termo de Contratacao" : "Contrato / Termo de Contratacao - continuacao")}) Tj`);

  lines.forEach((line) => {
    const isHeading = line.startsWith("## ");
    const text = isHeading ? line.slice(3) : line;
    if (page === 1 && text === "CONTRATO / TERMO DE CONTRATACAO FIRMANT") {
      return;
    }
    commands.push(`/${isHeading ? "F2" : "F1"} ${isHeading ? 12 : 9} Tf`);
    commands.push(isHeading ? "0.039 0.086 0.157 rg" : "0.06 0.09 0.14 rg");
    commands.push(`1 0 0 1 ${marginX} ${y} Tm (${escapePdfText(text)}) Tj`);
    y -= isHeading ? lineHeight + 3 : lineHeight;
  });

  commands.push(`/F1 8 Tf`);
  commands.push("0.788 0.659 0.298 rg");
  commands.push(`1 0 0 1 ${marginX} 42 Tm (${escapePdfText("FIRMANT")}) Tj`);
  commands.push("0.36 0.42 0.52 rg");
  commands.push(`1 0 0 1 ${marginX + 58} 42 Tm (${escapePdfText(`Pagina ${page} de ${totalPages}`)}) Tj`);
  commands.push(`1 0 0 1 ${marginX} 28 Tm (${escapePdfText("ag.firmant@gmail.com | +55 11 91491-2488 | Atendimento 100% online para todo o Brasil")}) Tj`);
  commands.push("ET");

  const stream = commands.join("\n");
  return `<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`;
}

function serializePdf(objects: string[]) {
  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let body = "";

  objects.forEach((object, index) => {
    offsets.push(byteLength(header + body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(header + body);
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return header + body + xref;
}

function wrapLine(line: string) {
  if (!line || line.startsWith("## ")) {
    return [line];
  }

  const words = stripAccents(line).split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function heading(text: string) {
  return `## ${stripAccents(text)}`;
}

function stripAccents(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ");
}

function escapePdfText(value: string) {
  return stripAccents(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function encodePdf(value: string) {
  return new TextEncoder().encode(value);
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) {
    return value;
  }

  return `+55 ${digits.slice(-11, -9)} ${digits.slice(-9, -4)}-${digits.slice(-4)}`;
}

function formatInstagram(value?: string | null) {
  return value ? `@${value.replace(/^@/, "")}` : "Nao informado";
}
