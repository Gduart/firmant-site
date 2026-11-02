// Verifica credenciais Sandbox sem imprimir chave ou dados cadastrais.
import fs from "node:fs";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

const file = ".env.local";
let content = fs.readFileSync(file, "utf8");
const match = content.match(/^ASAAS_API_KEY=(.*)$/m);
let key = match?.[1]?.trim() ?? "";
if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) key = key.slice(1, -1);
key = key.replace(/\\\$/g, "$");
if (!key.startsWith("$aact_hmlg_")) {
  console.log("Chave Sandbox ausente ou incompatível. Nenhuma requisição enviada.");
  process.exit(2);
}
// Next expande $VAR em .env; preserva o prefixo literal da chave.
const normalized = `ASAAS_API_KEY=${key.replaceAll("$", "\\$")}`;
content = content.replace(/^ASAAS_API_KEY=.*$/m, () => normalized);
fs.writeFileSync(file, content);
loadEnvConfig(process.cwd(), true);
if (process.env.ASAAS_API_KEY !== key || process.env.ASAAS_API_BASE_URL !== "https://api-sandbox.asaas.com") {
  console.log("Configuração local inconsistente. Nenhuma requisição enviada.");
  process.exit(2);
}
try {
  const response = await fetch("https://api-sandbox.asaas.com/v3/myAccount/commercialInfo/", {
    headers: { access_token: key, "User-Agent": "FirmantSite/1.0" },
    signal: AbortSignal.timeout(20000),
  });
  console.log(JSON.stringify({ environment: "sandbox", http: response.status, authenticated: response.ok, resourcesCreated: false }));
  await response.body?.cancel();
  if (!response.ok) process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({ environment: "sandbox", authenticated: false, networkCode: error?.cause?.code ?? error?.name ?? "NETWORK_ERROR", resourcesCreated: false }));
  process.exitCode = 1;
}
