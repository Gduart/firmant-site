import assert from "node:assert/strict";
import test from "node:test";
import { developmentServices } from "../src/lib/development-services";
import { briefingLeadPayload, validateServiceBriefing } from "../src/lib/service-briefing";

function sample(slug = "automacao-de-processos") {
  const service = developmentServices.find(item => item.slug === slug)!;
  return {
    idempotencyKey: "4ff6752b-e1aa-4afd-9b33-53f74fa05da9", serviceSlug: slug,
    name: "Lead de teste", company: "Empresa exemplo", email: "LEAD@EXAMPLE.COM", phone: "(11) 99999-9999",
    sector: "Serviços", objective: "Organizar o atendimento e diminuir tarefas manuais.", deadline: "A definir", budget: "Orientação",
    answers: Object.fromEntries(service.fields.map(field => [field.key, "Resposta completa de teste. ".repeat(25)])),
    privacyAcknowledged: true, website: "",
  };
}
test("os quatro serviços preservam o briefing completo e sua identificação", () => {
  for (const service of developmentServices) {
    const value = validateServiceBriefing(sample(service.slug));
    const lead = briefingLeadPayload(value);
    assert.equal(lead.service, service.title);
    assert.equal(lead.email, "lead@example.com");
    assert.equal(lead.tracking.source, `firmant-site/dev/${service.slug}`);
    assert.equal(lead.marketingConsent, false);
    assert.ok(lead.details.length > 2000);
    for (const field of service.fields) { assert.ok(lead.details.includes(field.label)); assert.ok(lead.details.includes(value.answers[field.key])); }
  }
});
test("rejeita serviço alterado, contato inválido, ausência de consentimento e spam", () => {
  for (const change of [{ serviceSlug: "invalido" }, { email: "a\r\nb@example.com" }, { phone: "123" }, { privacyAcknowledged: false }, { website: "spam" }, { answers: { forged: "conteúdo" } }]) assert.throws(() => validateServiceBriefing({ ...sample(), ...change }));
});
test("rejeita excesso de caracteres em vez de perder parte do briefing", () => {
  assert.throws(() => validateServiceBriefing({ ...sample(), objective: "x".repeat(1801) }));
  assert.throws(() => validateServiceBriefing({ ...sample(), answers: { ...sample().answers, routines: "x".repeat(1201) } }));
});
test("campos específicos obrigatórios são validados no servidor", () => {
  const input = sample();
  input.answers.routines = "";
  assert.throws(() => validateServiceBriefing(input));
});
test("catálogo mantém serviços e todos os grupos de exemplos", () => {
  assert.deepEqual(developmentServices.map(service => service.tables.reduce((total, table) => total + table.rows.length, 0)), [8, 33, 22, 20]);
  for (const service of developmentServices) for (const table of service.tables) for (const row of table.rows) assert.equal(row.length, table.columns.length);
});
