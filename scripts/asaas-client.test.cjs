/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness for the transpiled client. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/lib/payments/asaas/client.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function clientFor(response) {
  const exports = {};
  let calls = 0;
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      assert.equal(name, "@/lib/cloudflare-runtime");
      return { getRequiredEnvValue: async () => "test-only" };
    },
    fetch: async () => { calls++; return response; },
    console: { error() {} },
  });
  return { ...exports, calls: () => calls };
}

for (const [label, body] of [
  ["HTML", "<!DOCTYPE html><html>Bad gateway</html>"],
  ["plain text", "Service unavailable"],
  ["empty body", ""],
  ["malformed JSON", '{"errors":'],
]) {
  test(`non-JSON ${label} preserves the controlled API error`, async () => {
    const client = clientFor(new Response(body, { status: 502 }));
    await assert.rejects(client.asaasRequest("/payments", { method: "POST", body: {} }), error => {
      assert.ok(error instanceof client.AsaasApiError);
      assert.equal(error.status, 502);
      assert.equal(error.message, "O Asaas recusou a solicitação (502).");
      assert.equal(error.details, body);
      return true;
    });
    assert.equal(client.calls(), 1, "a failed payment request must not be retried automatically");
  });
}

test("Asaas JSON descriptions remain available", async () => {
  const client = clientFor(Response.json({ errors: [{ description: "Documento inválido." }] }, { status: 400 }));
  await assert.rejects(client.asaasRequest("/payments"), error => {
    assert.ok(error instanceof client.AsaasApiError);
    assert.equal(error.status, 400);
    assert.equal(error.message, "Documento inválido.");
    return true;
  });
});

test("JSON without descriptions uses the controlled fallback", async () => {
  const client = clientFor(Response.json({ error: "unavailable" }, { status: 503 }));
  await assert.rejects(client.asaasRequest("/payments"), { message: "O Asaas recusou a solicitação (503)." });
});

test("successful JSON response is unchanged", async () => {
  const client = clientFor(Response.json({ id: "test-payment" }));
  assert.deepEqual(await client.asaasRequest("/payments"), { id: "test-payment" });
});

test("204 does not attempt to parse an empty response", async () => {
  const client = clientFor(new Response(null, { status: 204 }));
  assert.equal(await client.asaasRequest("/payments/test", { method: "DELETE" }), undefined);
});
