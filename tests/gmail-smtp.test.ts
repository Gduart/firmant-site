import assert from "node:assert/strict";
import test from "node:test";
import { GmailSmtpError, sendGmailSmtp, verifyGmailRecipient, verifyGmailSmtp } from "../src/lib/commercial/gmail-smtp";

function smtp(authenticated = true, options: { recipientCode?: number; disconnectAfterData?: boolean; disconnectOnQuit?: boolean; greetingConsumed?: boolean } = {}) {
  const writes: string[] = [];
  let closed = false;
  const encoder = new TextEncoder();
  let incoming: ReadableStreamDefaultController<Uint8Array>;
  // Fragmenta os códigos, quebras CRLF e linhas de resposta para simular a rede.
  const reply = (text: string) => { for (const char of text) incoming.enqueue(encoder.encode(char)); };
  let login = 0;
  const socket = {
    greetingConsumed: options.greetingConsumed,
    readable: new ReadableStream<Uint8Array>({ start(controller) { incoming = controller; if (!options.greetingConsumed) reply("220 smtp.test ready\r\n"); } }),
    writable: new WritableStream<Uint8Array>({ write(bytes) {
      const line = new TextDecoder().decode(bytes); writes.push(line);
      if (line.startsWith("EHLO")) reply("250-smtp.test\r\n250 AUTH LOGIN\r\n");
      else if (line.startsWith("AUTH LOGIN")) { login = 1; reply("334 Username\r\n"); }
      else if (login === 1) { login = 2; reply("334 Password\r\n"); }
      else if (login === 2) { login = 0; reply(authenticated ? "235 Accepted\r\n" : "535 Authentication failed\r\n"); }
      else if (line.startsWith("RCPT TO")) reply(`${options.recipientCode ?? 250} Recipient result\r\n`);
      else if (line.startsWith("MAIL FROM") || line === "RSET\r\n") reply("250 OK\r\n");
      else if (line === "DATA\r\n") reply("354 Send message\r\n");
      else if (line === "QUIT\r\n") { if (options.disconnectOnQuit) incoming.error(new Error("Conexão encerrada")); else reply("221 Bye\r\n"); }
      else if (options.disconnectAfterData) incoming.error(new Error("Conexão perdida após DATA"));
      else reply("250 Message accepted\r\n");
    } }),
    opened: Promise.resolve(), close: async () => { closed = true; },
  };
  return { create: async () => socket, writes, closed: () => closed };
}
test("verificação Gmail autentica e encerra sem enviar e-mail", async () => {
  const s = smtp();
  await verifyGmailSmtp({ user: "teste@example.invalid", appPassword: "abcd efgh ijkl mnop" }, s.create);
  assert.equal(s.writes[3], "YWJjZGVmZ2hpamtsbW5vcA==\r\n");
  assert.ok(!s.writes.some(line => /MAIL FROM|RCPT TO|DATA/.test(line)));
  assert.equal(s.closed(), true);
});
const message = { user: "teste@example.invalid", appPassword: "abcdefghijklmnop", to: "cliente@example.invalid", subject: "Teste", text: "Teste", attachments: [] };
test("recusa do destinatário informa etapa e permite repetição segura", async () => {
  const s = smtp(true, { recipientCode: 550 });
  await assert.rejects(sendGmailSmtp(message,s.create), error => error instanceof GmailSmtpError && error.stage === "recipient" && error.smtpCode === 550 && !error.deliveryUncertain);
  assert.ok(!s.writes.includes("DATA\r\n")); assert.equal(s.closed(),true);
});
test("queda após corpo do e-mail mantém resultado incerto para evitar duplicidade", async () => {
  const s = smtp(true, { disconnectAfterData: true });
  await assert.rejects(sendGmailSmtp(message,s.create), error => error instanceof GmailSmtpError && error.stage === "message" && error.deliveryUncertain);
});
test("mensagem aceita continua confirmada se conexão cair durante QUIT", async () => {
  const s = smtp(true, { disconnectOnQuit: true });
  await assert.doesNotReject(sendGmailSmtp(message,s.create)); assert.equal(s.closed(),true);
});
test("verificação de destinatário desfaz envelope sem DATA", async () => {
  const s = smtp();
  await verifyGmailRecipient(message,s.create);
  assert.ok(s.writes.includes("RSET\r\n")); assert.ok(!s.writes.includes("DATA\r\n"));
});
test("sessão STARTTLS não espera uma segunda saudação SMTP", async () => {
  const s=smtp(true,{greetingConsumed:true});
  await verifyGmailSmtp(message,s.create); assert.equal(s.writes[0],"EHLO firmant.com.br\r\n");
});
test("falha de conexão preserva código técnico sem iniciar o envio", async () => {
  await assert.rejects(verifyGmailSmtp(message,async()=>{ throw Object.assign(new Error("Falha TLS"),{code:"UNABLE_TO_VERIFY_LEAF_SIGNATURE"}); }), error => error instanceof GmailSmtpError && error.stage === "connection" && error.networkCode === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" && !error.deliveryUncertain);
});
test("e-mail contém o PDF íntegro e texto em UTF-8", async () => {
  const s = smtp(); const pdf = new TextEncoder().encode("%PDF-1.4\nteste");
  await sendGmailSmtp({ user: "teste@example.invalid", appPassword: "abcdefghijklmnop", to: "cliente@example.invalid", subject: "Orçamento FIRMANT", text: "50% de entrada e 50% na entrega.", attachments: [{ filename: "orcamento.pdf", contentType: "application/pdf", data: pdf }] }, s.create);
  const mime = s.writes.find(line => line.startsWith("From:"))!;
  assert.ok(mime.includes('Content-Disposition: attachment; filename="orcamento.pdf"'));
  assert.ok(mime.includes(Buffer.from(pdf).toString("base64")));
  assert.ok(mime.includes(Buffer.from("50% de entrada e 50% na entrega.").toString("base64")));
  assert.equal(s.closed(), true);
});
test("credencial recusada interrompe antes de definir destinatário", async () => {
  const s = smtp(false);
  await assert.rejects(verifyGmailSmtp({ user: "teste@example.invalid", appPassword: "abcdefghijklmnop" }, s.create), /535/);
  assert.ok(!s.writes.some(line => line.startsWith("MAIL FROM")));
  assert.equal(s.closed(), true);
});
