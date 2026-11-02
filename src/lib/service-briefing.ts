import { getDevelopmentService } from "./development-services";

export type ServiceBriefingInput = {
  idempotencyKey: string; serviceSlug: string; name: string; company: string;
  email: string; phone: string; sector: string; objective: string; deadline: string;
  budget: string; answers: Record<string, string>; privacyAcknowledged: boolean; website: string;
};

const clean = (value: unknown, limit: number, label: string, required = false): string => {
  if (value !== undefined && typeof value !== "string") throw new Error(`Campo inválido: ${label}.`);
  const text = (typeof value === "string" ? value : "").trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  if (text.length > limit) throw new Error(`${label}: limite de ${limit} caracteres.`);
  if (required && text.length < 2) throw new Error(`Preencha ${label}.`);
  return text;
};

export function validateServiceBriefing(body: unknown): ServiceBriefingInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Dados inválidos.");
  const value = body as Record<string, unknown>;
  const serviceSlug = clean(value.serviceSlug, 80, "serviço", true);
  const service = getDevelopmentService(serviceSlug);
  if (!service) throw new Error("Serviço inválido.");
  const idempotencyKey = clean(value.idempotencyKey, 36, "identificador", true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) throw new Error("Identificador inválido. Atualize a página.");
  if (value.privacyAcknowledged !== true) throw new Error("Confirme a ciência da Política de Privacidade.");
  if (value.website !== undefined && value.website !== "") throw new Error("Solicitação inválida.");
  const email = clean(value.email, 160, "e-mail", true).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  const phone = clean(value.phone, 40, "WhatsApp", true);
  if (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 15) throw new Error("Informe um WhatsApp com DDD válido.");
  const rawAnswers = value.answers;
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) throw new Error("Preencha as informações do serviço.");
  if (Object.keys(rawAnswers).some(key => !service.fields.some(field => field.key === key))) throw new Error("Campo do serviço não reconhecido.");
  const answers: Record<string, string> = {};
  for (const field of service.fields) answers[field.key] = clean((rawAnswers as Record<string, unknown>)[field.key], 1200, field.label, field.required);
  return {
    idempotencyKey, serviceSlug, email, phone, answers, privacyAcknowledged: true, website: "",
    name: clean(value.name, 100, "seu nome", true), company: clean(value.company, 120, "nome da empresa", true),
    sector: clean(value.sector, 120, "segmento", true), objective: clean(value.objective, 1800, "objetivo do projeto", true),
    deadline: clean(value.deadline, 120, "prazo desejado"), budget: clean(value.budget, 160, "investimento previsto"),
  };
}

export function briefingLeadPayload(input: ServiceBriefingInput) {
  const service = getDevelopmentService(input.serviceSlug)!;
  const details = [
    `BRIEFING — ${service.title}`, `Segmento: ${input.sector}`, `Objetivo: ${input.objective}`,
    ...service.fields.map(field => `${field.label}\n${input.answers[field.key] || "Não informado"}`),
    `Prazo desejado: ${input.deadline || "A definir"}`, `Investimento previsto: ${input.budget || "Precisa de orientação"}`,
  ].join("\n\n");
  return {
    idempotencyKey: input.idempotencyKey, requestType: "complete" as const,
    name: input.name, company: input.company, email: input.email, phone: input.phone,
    service: service.title, details, privacyAcknowledged: true, privacyPolicyVersion: "2026-11",
    marketingConsent: false, website: "", tracking: { source: `firmant-site/dev/${input.serviceSlug}` },
  };
}
