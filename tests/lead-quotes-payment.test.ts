import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import { checkoutPayload, createQuotePayment, type QuotePaymentDependencies } from "../src/lib/lead-quotes/payment";
import { AsaasApiError } from "../src/lib/payments/asaas/client";
import type { OrderRecord } from "../src/lib/payments/types";
import type { QuoteView } from "../src/lib/lead-quotes/model";
type SqlValue = string | number | null;
interface Sqlite { exec(query: string): void; prepare(query: string): { get(...values: SqlValue[]): unknown; run(...values: SqlValue[]): unknown }; close(): void }
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as { DatabaseSync: new (name: string) => Sqlite };
const quote = { lead_reference: "4ff6752b-e1aa-4afd-9b33-53f74fa05da9", revision: 1, status: "APPROVED", totalCents: 100000, document: { title: "Projeto teste" }, lead: { name: "Teste", company: "Empresa", email: "teste@example.invalid", phone: "" } } as QuoteView;
function setup(fail = false) {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync("migrations/0011_lead_quotes.sql", "utf8"));
  db.exec("CREATE TABLE orders(id TEXT PRIMARY KEY,status TEXT); INSERT INTO lead_quotes(lead_reference,revision,document_json,lead_json,status,created_at,created_by) VALUES('4ff6752b-e1aa-4afd-9b33-53f74fa05da9',1,'{}','{}','APPROVED','2026-11-01','teste');");
  let calls = 0;
  const orders = new Map<string, OrderRecord>();
  const dependencies: QuotePaymentDependencies = {
    first: async <T>(query: string, values: SqlValue[] = []) => db.prepare(query).get(...values) as T | null,
    run: async (query, values = []) => db.prepare(query).run(...values),
    insert: async input => { const record = { ...input, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; orders.set(input.id, record); db.prepare("INSERT INTO orders(id,status) VALUES(?,?)").run(input.id, input.status); return record; },
    update: async (id, patch) => { const order = { ...orders.get(id)!, ...patch }; orders.set(id, order); db.prepare("UPDATE orders SET status=? WHERE id=?").run(order.status,id); return order; },
    create: async () => { calls++; if (fail) throw new Error("Timeout simulado"); return { id: "checkout-ficticio-" + calls }; },
    url: async id => "https://example.invalid/" + id,
    baseUrl: async () => "https://homologacao.example.invalid",
  };
  const input = { amountCents: 50000, stage: "DEPOSIT", mode: "BOTH", installments: 6, reason: "Entrada de 50%", requestKey: crypto.randomUUID() };
  return { db, dependencies, input, calls: () => calls };
}
test("migração e reserva evitam duplicar cobrança em requisições concorrentes", async t => {
  const s = setup(); t.after(() => s.db.close());
  const requests = await Promise.allSettled([createQuotePayment(quote,s.input,s.dependencies),createQuotePayment(quote,s.input,s.dependencies)]);
  assert.ok(requests.some(result => result.status === "fulfilled")); assert.equal(s.calls(),1);
  const again = await createQuotePayment(quote,s.input,s.dependencies); assert.equal(again.state,"READY"); assert.equal(s.calls(),1);
});
test("falha de confirmação bloqueia nova cobrança automática", async t => {
  const s = setup(true); t.after(() => s.db.close());
  await assert.rejects(createQuotePayment(quote,s.input,s.dependencies));
  await assert.rejects(createQuotePayment(quote,{...s.input,requestKey:crypto.randomUUID()},s.dependencies)); assert.equal(s.calls(),1);
  assert.equal((s.db.prepare("SELECT state FROM lead_quote_payments").get() as {state:string}).state,"UNCERTAIN");
});

test("trocar Pix por cartão não duplica uma entrada aberta", async t => {
  const s = setup(); t.after(() => s.db.close());
  await createQuotePayment(quote, { ...s.input, mode: "PIX" }, s.dependencies);
  await assert.rejects(createQuotePayment(quote, { ...s.input, mode: "CARD", requestKey: crypto.randomUUID() }, s.dependencies), /cobrança aberta/);
  assert.equal(s.calls(), 1);
});

test("requisições concorrentes com formas diferentes reservam somente uma entrada", async t => {
  const s = setup(); t.after(() => s.db.close());
  const results = await Promise.allSettled([
    createQuotePayment(quote, { ...s.input, mode: "PIX" }, s.dependencies),
    createQuotePayment(quote, { ...s.input, mode: "CARD", requestKey: crypto.randomUUID() }, s.dependencies),
  ]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(s.calls(), 1);
});
test("pagamento confirmado não gera outra cobrança", async t => {
  const s = setup(); t.after(() => s.db.close());
  await createQuotePayment(quote,s.input,s.dependencies); s.db.exec("UPDATE orders SET status='PAYMENT_RECEIVED'");
  await assert.rejects(createQuotePayment(quote,s.input,s.dependencies),/saldo|paga|sinal/); assert.equal(s.calls(),1);
});
test("link expirado exige nova autorização e conserva histórico", async t => {
  const s = setup(); t.after(() => s.db.close());
  await createQuotePayment(quote,s.input,s.dependencies); s.db.exec("UPDATE lead_quote_payments SET expires_at='2020-01-01'");
  await assert.rejects(createQuotePayment(quote,s.input,s.dependencies),/expirou/);
  await createQuotePayment(quote,{...s.input,regenerate:true,requestKey:crypto.randomUUID()},s.dependencies);
  assert.equal(s.calls(),2); assert.equal((s.db.prepare("SELECT count(*) AS n FROM lead_quote_payments").get() as {n:number}).n,2);
});
test("valor de cada cobrança respeita 50% antes de acessar Asaas", async t => { const s=setup(); t.after(()=>s.db.close()); await assert.rejects(createQuotePayment(quote,{...s.input,amountCents:100000},s.dependencies),/50%/); assert.equal(s.calls(),0); });
test("entrada e saldo iguais exigem conferência e respeitam total recebido", async t => {
  const s=setup(); t.after(()=>s.db.close()); const project = quote;
  await createQuotePayment(project,{...s.input,reason:"Entrada"},s.dependencies); s.db.exec("UPDATE orders SET status='PAYMENT_RECEIVED'");
  await assert.rejects(createQuotePayment(project,{...s.input,stage:"BALANCE",deliveryConfirmed:true,reason:"Saldo",requestKey:crypto.randomUUID()},s.dependencies),/confirme/);
  await createQuotePayment(project,{...s.input,stage:"BALANCE",deliveryConfirmed:true,reason:"Saldo",regenerate:true,requestKey:crypto.randomUUID()},s.dependencies); assert.equal(s.calls(),2);
  s.db.exec("UPDATE orders SET status='PAYMENT_RECEIVED'");
  await assert.rejects(createQuotePayment(project,{...s.input,mode:"PIX",regenerate:true,requestKey:crypto.randomUUID()},s.dependencies),/saldo/); assert.equal(s.calls(),2);
});
test("saldo exige entrada recebida e confirmação da entrega", async t => {
  const s=setup(); t.after(()=>s.db.close());
  await assert.rejects(createQuotePayment(quote,{...s.input,stage:"BALANCE"},s.dependencies),/entrega/);
  await assert.rejects(createQuotePayment(quote,{...s.input,stage:"BALANCE",deliveryConfirmed:true},s.dependencies),/sinal/);
  assert.equal(s.calls(),0);
});

test("recusa explícita do Asaas informa a causa e encerra o pedido local", async t => {
  const s = setup(); t.after(() => s.db.close());
  s.dependencies.create = async () => { throw new AsaasApiError("Configuração Pix pendente.", 400, {}); };
  await assert.rejects(createQuotePayment(quote, s.input, s.dependencies), /Configuração Pix pendente/);
  assert.equal((s.db.prepare("SELECT status FROM orders").get() as { status: string }).status, "FAILED");
});

test("nome do item respeita limite Asaas e preserva título completo na descrição", () => {
  const title = "Automação e atendimento com agente de inteligência artificial no Telegram";
  const payload = checkoutPayload({ ...quote, document: { ...quote.document, title } }, "order-test", 500, "BOTH", 6);
  assert.ok(payload.items[0].name.length <= 30);
  assert.ok(payload.items[0].description.includes(title));
});
