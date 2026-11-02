// Relay temporário: publica somente o webhook autenticado e retornos fixos.
import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true);
const expected = process.env.ASAAS_WEBHOOK_AUTH_TOKEN;
if (!expected || expected.length < 32) throw new Error("Configure o segredo local do webhook.");
if (process.env.ASAAS_API_BASE_URL !== "https://api-sandbox.asaas.com") throw new Error("Relay permitido somente em Sandbox.");
const server = http.createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  const path = request.url ?? "";
  if (request.method === "GET" && /^\/pagamento\/(status\/[a-f0-9-]{36}|cancelado|expirado)$/.test(path)) {
    response.writeHead(303, { Location: `http://127.0.0.1:3000${path}` }); response.end(); return;
  }
  if (request.method !== "POST" || path !== "/api/webhooks/asaas") {
    response.writeHead(404); response.end(); return;
  }
  const token = request.headers["asaas-access-token"];
  if (typeof token !== "string" || Buffer.byteLength(token) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    response.writeHead(401); response.end(); return;
  }
  const chunks = []; let size = 0;
  try {
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 128000) { response.writeHead(413); response.end(); return; }
      chunks.push(chunk);
    }
    const result = await fetch("http://127.0.0.1:3000/api/webhooks/asaas", {
      method: "POST", headers: { "Content-Type": "application/json", "asaas-access-token": token },
      body: Buffer.concat(chunks), signal: AbortSignal.timeout(45000),
    });
    const body = await result.text();
    response.writeHead(result.status, { "Content-Type": "application/json" }); response.end(body);
    console.log(JSON.stringify({ at: new Date().toISOString(), webhookHttp: result.status }));
  } catch {
    response.writeHead(502); response.end('{"error":"Local webhook unavailable"}');
  }
});
server.requestTimeout = 50000;
server.listen(54330, "127.0.0.1", () => console.log("Relay Sandbox ativo em loopback 54330; Admin indisponível pelo relay."));
