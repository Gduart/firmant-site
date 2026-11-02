import { getEnvValue } from "@/lib/cloudflare-runtime";
import { briefingLeadPayload, validateServiceBriefing } from "@/lib/service-briefing";

const attempts = new Map<string, { count: number; expires: number }>();

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set([requestUrl.origin]);
  const host = request.headers.get("host");
  if (host) allowedOrigins.add(`${requestUrl.protocol}//${host}`);
  // Requisições JSON sem Origin também são usadas pelos adaptadores locais.
  // Origens externas explícitas continuam bloqueadas; não há CORS público.
  if (origin && !allowedOrigins.has(origin)) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Formato inválido." }, { status: 415 });
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  const bucket = attempts.get(ip) ?? { count: 0, expires: now + 600_000 };
  if (bucket.count >= 5) return Response.json({ error: "Aguarde alguns minutos antes de uma nova tentativa." }, { status: 429, headers: { "Retry-After": "600" } });
  bucket.count++; attempts.set(ip, bucket);
  let payload;
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Dados ausentes." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 32_000) { await reader.cancel(); return Response.json({ error: "Briefing muito grande." }, { status: 413 }); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const text = new TextDecoder().decode(bytes);
    payload = briefingLeadPayload(validateServiceBriefing(JSON.parse(text)));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Revise os dados do briefing." }, { status: 400 });
  }
  const url = await getEnvValue("DIAGNOSTICO_BRIEFING_URL");
  const secret = await getEnvValue("DIAGNOSTICO_BRIEFING_SECRET");
  if (!url || !secret || secret.length < 32) return Response.json({ error: "O recebimento de briefings ainda está em configuração. Seus dados permanecem no formulário; tente novamente mais tarde." }, { status: 503 });
  try {
    const destination = new URL(url);
    if (destination.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(destination.hostname)) throw new Error("Destino inválido.");
    const body = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
    const hex = Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("");
    const response = await fetch(destination, {
      method: "POST", headers: { "Content-Type": "application/json", "X-Firmant-Timestamp": timestamp, "X-Firmant-Signature": `sha256=${hex}` },
      body, signal: AbortSignal.timeout(20_000), redirect: "error", cache: "no-store",
    });
    const result = await response.json() as { ok?: boolean; reference?: string; automation?: string };
    if (!response.ok || !result.ok || !result.reference || !["delivered", "queued"].includes(result.automation ?? "")) throw new Error("Recebimento não confirmado.");
    return Response.json({ ok: true, reference: result.reference, notification: result.automation }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível confirmar o recebimento agora. Seus dados foram mantidos no formulário. Tente enviar novamente; a mesma solicitação não será duplicada." }, { status: 503 });
  }
}
