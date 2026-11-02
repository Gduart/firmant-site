const encoder = new TextEncoder();
export async function signCommercial(body: string, timestamp: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  return "sha256=" + [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
export async function verifyCommercial(body: string, timestamp: string, received: string, secret: string, now = Date.now()) {
  if (secret.length < 32 || !/^\d{10}$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300 || !/^sha256=[a-f0-9]{64}$/i.test(received)) return false;
  const expected = await signCommercial(body, timestamp, secret);
  let difference = 0; for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ received.toLowerCase().charCodeAt(index);
  return difference === 0;
}
export async function boundedText(request: Request, limit: number) {
  const reader = request.body?.getReader(); if (!reader) throw new Error("Corpo ausente.");
  const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new Error("Solicitação acima do limite."); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
