/* eslint-disable @typescript-eslint/no-require-imports -- Isolated service with repository doubles. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const { webcrypto } = require("node:crypto");

function load(file, modules) {
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, { exports, crypto: webcrypto, console, require(name) {
    assert.ok(name in modules, `Unexpected dependency: ${name}`);
    return modules[name];
  } });
  return exports;
}

function setup() {
  let event = null;
  let failUpdate = false;
  let updates = 0;
  let token = "sandbox-test-token";
  const order = { id: "order-test", status: "CHECKOUT_CREATED", amount: 500, billingModel: "ONE_TIME" };
  const modules = {
    "@/lib/cloudflare-runtime": { getEnvValue: async () => token },
    "@/lib/payments/asaas/mapper": load("src/lib/payments/asaas/mapper.ts", {}),
    "@/lib/payments/asaas/payments": { updateAsaasPaymentDescription: async () => {} },
    "@/lib/payments/order-description": { buildOrderDescription: () => "Teste" },
    "@/lib/payments/orders-repository": {
      getOrderByExternalReference: async () => order,
      findOrderByAsaasReferences: async () => order,
      updateOrder: async (_id, patch) => {
        if (failUpdate) throw new Error("temporary database failure");
        updates++;
        Object.assign(order, patch);
      },
    },
    "@/lib/payments/payments-repository": { upsertPayment: async () => {} },
    "@/lib/payments/subscriptions-repository": { upsertSubscription: async () => {} },
    "@/lib/payments/webhook-events-repository": {
      getWebhookEventByProviderEventId: async () => event,
      insertWebhookEvent: async value => { event = { ...value, processedAt: null }; },
      markWebhookEventProcessed: async (_id, result) => { event.processedAt = "now"; event.processingResult = result; },
    },
    "@/lib/proposals/repository": { syncMilestoneFromOrder: async () => {} },
  };
  return {
    ...load("src/lib/payments/webhook-service.ts", modules), order,
    updates: () => updates, event: () => event,
    fail: value => { failUpdate = value; }, token: value => { token = value; },
  };
}
const paid = { id: "event-test", event: "CHECKOUT_PAID", checkout: { id: "checkout-test", externalReference: "firmant:lead-quote:order-test" } };

test("checkout paid confirms the order and repeated delivery is ignored", async () => {
  const s = setup();
  assert.equal((await s.processAsaasWebhook(paid)).processed, true);
  assert.equal(s.order.status, "PAYMENT_CONFIRMED");
  assert.equal((await s.processAsaasWebhook(paid)).duplicate, true);
  assert.equal(s.updates(), 1);
});

test("transient processing failure remains retryable", async () => {
  const s = setup(); s.fail(true);
  await assert.rejects(s.processAsaasWebhook(paid), /temporary database failure/);
  assert.equal(s.event().processingResult, "FAILED");
  s.fail(false);
  assert.equal((await s.processAsaasWebhook(paid)).processed, true);
  assert.equal(s.event().processingResult, "PROCESSED");
  assert.equal(s.order.status, "PAYMENT_CONFIRMED");
});

test("missing or wrong webhook secret is rejected", async () => {
  const s = setup();
  assert.equal(await s.validateAsaasWebhookToken("sandbox-test-token"), true);
  assert.equal(await s.validateAsaasWebhookToken("wrong"), false);
  assert.equal(await s.validateAsaasWebhookToken(null), false);
  s.token(undefined);
  assert.equal(await s.validateAsaasWebhookToken("sandbox-test-token"), false);
});
