import assert from "node:assert/strict";
import test from "node:test";
import { addBusinessDays, assertApprovable, filledBriefing, paymentSplit, quoteSections, totalCents, validateDeliveryRecipient, validateDocument, validateLead, type QuoteDocument } from "../src/lib/lead-quotes/model";
import { boundedText, signCommercial, verifyCommercial } from "../src/lib/lead-quotes/signing";

export function sampleDocument(): QuoteDocument { return { ...Object.fromEntries(Object.keys(quoteSections).map(key => [key, "Condição proposta para revisão humana."])), title: "Sistema de atendimento", startDate: "2026-11-02", endDate: "2026-11-03", productionDays: 2, validityDays: 10, items: [{ name: "Implementação", quantity: 1.25, unitPriceCents: 12345 }], schedule: [{ phase: "Produção e testes", days: 2, delivery: "Versão para homologação" }], sources: [{ title: "Referência", url: "https://developers.openai.com/" }] } as QuoteDocument; }
test("preço usa centavos e arredondamento por item", () => { const doc = validateDocument(sampleDocument()); assert.equal(totalCents(doc), 15431); assert.doesNotThrow(() => assertApprovable(doc)); });
test("entrada e saldo fecham o total inclusive com centavos ímpares", () => { assert.deepEqual(paymentSplit(15431), { deposit: 7716, balance: 7715 }); });
test("envio rejeita destinatários fictícios e injeção antes de abrir SMTP", () => {
  assert.equal(validateDeliveryRecipient("  ag.firmant@gmail.com  "),"ag.firmant@gmail.com");
  for (const value of ["cliente@example.invalid","teste@example.com","teste@localhost","inválido","x@gmail.com\r\nBcc: y@gmail.com"]) assert.throws(()=>validateDeliveryRecipient(value));
});
test("aprovação exige escopo, valor e cronograma consistente", () => {
  for (const change of [{ items: [{ name: "Item", quantity: 1, unitPriceCents: 0 }] }, { security: "" }, { productionDays: 3 }, { startDate: "" }]) assert.throws(() => assertApprovable(validateDocument({ ...sampleDocument(), ...change })));
});
test("validação bloqueia datas inválidas, preço adulterado e fonte insegura", () => {
  for (const change of [{ startDate: "2026-02-30" }, { endDate: "2026-10-01" }, { items: [{ name: "Item", quantity: 1, unitPriceCents: -1 }] }, { sources: [{ title: "Maliciosa", url: "javascript:alert(1)" }] }]) assert.throws(() => validateDocument({ ...sampleDocument(), ...change }));
});
test("campos sem resposta são excluídos da análise", () => { const text = "Objetivo: Organizar agenda\n\nVolume\nNão informado\n\nPrazo desejado: A definir\n\nInvestimento previsto: Precisa de orientação\n\nRegras\nAtender de segunda a sexta"; assert.equal(filledBriefing(text), "Objetivo: Organizar agenda\n\nRegras\nAtender de segunda a sexta"); });
test("cronograma pula sábado e domingo sem inventar feriados", () => { assert.equal(addBusinessDays("2026-11-06", 2), "2026-11-09"); assert.equal(addBusinessDays("2026-11-07", 1), "2026-11-09"); });
test("dados de contato rejeitam injeção de cabeçalhos", () => { assert.throws(() => validateLead({ reference: "4ff6752b-e1aa-4afd-9b33-53f74fa05da9", name: "Teste", company: "Empresa", email: "teste@example.com\r\nBcc: a@example.com" })); });
test("assinatura comercial rejeita adulteração e replay expirado", async () => {
  const secret = "segredo-de-teste-com-pelo-menos-32-caracteres", timestamp = "1793500000", body = '{"action":"approve"}';
  const signature = await signCommercial(body, timestamp, secret);
  assert.equal(await verifyCommercial(body, timestamp, signature, secret, Number(timestamp) * 1000), true);
  assert.equal(await verifyCommercial(body.replace("approve", "payment"), timestamp, signature, secret, Number(timestamp) * 1000), false);
  assert.equal(await verifyCommercial(body, timestamp, signature, secret, Number(timestamp) * 1000 + 301000), false);
});
test("corpo acima do limite é interrompido antes do processamento", async () => { const request = new Request("http://localhost/test", { method: "POST", body: "a".repeat(500) }); await assert.rejects(boundedText(request, 100)); });
