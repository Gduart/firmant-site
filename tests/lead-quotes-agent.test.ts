import assert from "node:assert/strict";
import test from "node:test";
import { generateQuote } from "../src/lib/lead-quotes/agent";
import { checkoutPayload } from "../src/lib/lead-quotes/payment";
import { quoteSections, totalCents, type QuoteView } from "../src/lib/lead-quotes/model";
const lead = { reference: "4ff6752b-e1aa-4afd-9b33-53f74fa05da9", name: "Contato privado", company: "Empresa de teste", email: "privado@example.invalid", phone: "11999999999", service: "Automação + 1 agente de IA no Telegram", details: "Objetivo: Agendar visitas\n\nVolume\nNão informado" };
test("agente usa modelo solicitado, pesquisa sem contatos e retorna preço calculado", async (t) => {
  const beforeKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "key-only-for-local-mock";
  t.after(() => { if (beforeKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = beforeKey; });
  const requests: Record<string, unknown>[] = [];
  const generated = { ...Object.fromEntries(Object.keys(quoteSections).map(key => [key, "Recomendação a validar pelo administrador."])), title: "Atendimento conectado", items: [{ name: "Integração", hours: 12 }], schedule: [{ phase: "Desenvolvimento e testes", days: 1, delivery: "Fluxo homologado" }] };
  t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
    const body = JSON.parse(String(options.body)); requests.push(body);
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: requests.length === 1 ? "Referência oficial de integração." : JSON.stringify(generated), annotations: requests.length === 1 ? [{ type: "url_citation", title: "Telegram", url: "https://core.telegram.org/bots/api" }] : [] }] }] });
  });
  const result = await generateQuote(lead, { hourlyRateCents: 10000, dailyHours: 6, validityDays: 10, startDate: "2026-11-06", research: true });
  assert.equal(requests.length, 2);
  assert.ok(requests.every(body => body.model === "gpt-6-luna" && body.store === false));
  assert.equal(requests[0].tool_choice, "required");
  assert.ok(!JSON.stringify(requests).includes(lead.email));
  assert.ok(!JSON.stringify(requests).includes(lead.name));
  assert.ok(!String(requests[0].input).includes("Agendar visitas"));
  assert.ok(!String(requests[1].input).includes("Não informado"));
  assert.equal(totalCents(result), 120000); assert.equal(result.productionDays, 2); assert.equal(result.endDate, "2026-11-09");
  assert.equal(result.sources[0].url, "https://core.telegram.org/bots/api");
});
test("checkout oferece Pix e cartão à vista/parcelado sem mudar valor", () => {
  const quote = { document: { title: "Sistema sob medida" }, lead_reference: lead.reference, revision: 1 } as QuoteView;
  const both = checkoutPayload(quote, "order-id", 1234.56, "BOTH", 6);
  assert.deepEqual(both.billingTypes, ["PIX", "CREDIT_CARD"]);
  assert.deepEqual(both.chargeTypes, ["DETACHED", "INSTALLMENT"]);
  assert.equal(both.items[0].value, 1234.56); assert.equal(both.installment?.maxInstallmentCount, 6);
  assert.equal(both.customerData, undefined);
  assert.equal(checkoutPayload(quote, "order-id", 500, "PIX", 1, "https://homologacao.example.invalid").callback.successUrl, "https://homologacao.example.invalid/pagamento/status/order-id");
  assert.deepEqual(checkoutPayload(quote, "order-id", 500, "PIX", 1).chargeTypes, ["DETACHED"]);
  assert.throws(() => checkoutPayload(quote, "order-id", 500, "CARD", 13));
});
