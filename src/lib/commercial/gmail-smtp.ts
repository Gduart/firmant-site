type GmailAttachment = {
  filename: string;
  contentType: string;
  data: Uint8Array;
};

type CloudflareSocket = {
  greetingConsumed?: boolean;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  opened: Promise<unknown>;
  close(): Promise<void>;
};

type CloudflareSocketsModule = {
  connect(
    address: { hostname: string; port: number },
    options?: { secureTransport?: "on" | "off" | "starttls" },
  ): CloudflareSocket;
};

type SendGmailSmtpInput = {
  user: string;
  appPassword: string;
  to: string;
  cc?: string[];
  subject: string;
  text: string;
  attachments: GmailAttachment[];
};

type SocketFactory = () => Promise<CloudflareSocket>;
type SmtpStage = "connection" | "greeting" | "ehlo" | "authentication" | "sender" | "recipient" | "data" | "message";
class SmtpReplyError extends Error {
  constructor(readonly code: number) { super(`SMTP respondeu ${code}.`); }
}
export class GmailSmtpError extends Error {
  constructor(readonly stage: SmtpStage, readonly smtpCode: number | null, readonly deliveryUncertain: boolean, readonly networkCode = "", readonly diagnostic = "") {
    const code = smtpCode ? ` (SMTP ${smtpCode})` : networkCode ? ` (${networkCode})` : "";
    const reason = stage === "recipient" ? `O Gmail recusou o e-mail do destinatário${code}. Confira o endereço.`
      : stage === "authentication" ? `O Gmail recusou a autenticação${code}. Confira a senha de app e a conta configurada.`
      : stage === "sender" ? `O Gmail recusou o remetente${code}. Confira a conta configurada.`
      : stage === "connection" ? `A conexão segura com o Gmail falhou antes do envio${code}.`
      : `O Gmail não concluiu o envio${code}.`;
    super(`${reason} ${deliveryUncertain ? "O resultado é incerto; confira o Gmail antes de repetir." : "Nenhum e-mail foi enviado."}`);
    this.name = "GmailSmtpError";
  }
}

export async function sendGmailSmtp(input: SendGmailSmtpInput, createSocket: SocketFactory = connectGmailSocket) {
  return gmailSession(input, false, createSocket);
}

// Confere a autenticação sem destinatário, mensagem ou anexo enviado.
export async function verifyGmailSmtp(input: Pick<SendGmailSmtpInput, "user" | "appPassword">, createSocket: SocketFactory = connectGmailSocket) {
  return gmailSession({ ...input, to: "", subject: "", text: "", attachments: [] }, true, createSocket);
}

// Diagnóstico do envelope: RSET encerra a tentativa antes de DATA, sem enviar mensagem.
export async function verifyGmailRecipient(input: Pick<SendGmailSmtpInput, "user" | "appPassword" | "to">, createSocket: SocketFactory = connectGmailSocket) {
  return gmailSession({ ...input, subject: "", text: "", attachments: [] }, false, createSocket, true);
}

async function connectGmailSocket() {
  if (process.env.NODE_ENV === "development" && process.env.GMAIL_SMTP_PORT === "587") return connectLocalStartTls();
  const { connect } = process.env.NODE_ENV === "development" ? await loadLocalSockets() : await loadCloudflareSockets();
  return connect({ hostname: "smtp.gmail.com", port: 465 }, { secureTransport: "on" });
}

async function gmailSession(input: SendGmailSmtpInput, verifyOnly: boolean, createSocket: SocketFactory, recipientOnly = false) {
  const appPassword = input.appPassword.replace(/\s+/g, "");
  let socket: CloudflareSocket;
  try { socket = await createSocket(); await socket.opened; }
  catch (error) {
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^[A-Z0-9_]{2,80}$/.test(error.code) ? error.code : "";
    throw new GmailSmtpError("connection", null, false, code, error instanceof Error ? error.message.replace(/[\r\n]/g, " ").slice(0, 240) : "");
  }

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  let stage: SmtpStage = "greeting";
  let messageWritten = false;
  let accepted = false;

  try {
    if (!socket.greetingConsumed) await expectSmtp(reader, [220]);
    stage = "ehlo";
    await command(writer, reader, "EHLO firmant.com.br", [250]);
    stage = "authentication";
    await command(writer, reader, "AUTH LOGIN", [334]);
    await command(writer, reader, base64Ascii(input.user), [334]);
    await command(writer, reader, base64Ascii(appPassword), [235]);
    if (verifyOnly) {
      await command(writer, reader, "QUIT", [221]);
      return;
    }
    stage = "sender";
    await command(writer, reader, `MAIL FROM:<${input.user}>`, [250]);

    stage = "recipient";
    for (const recipient of getEnvelopeRecipients(input)) {
      await command(writer, reader, `RCPT TO:<${recipient}>`, [250, 251]);
    }
    if (recipientOnly) {
      await command(writer, reader, "RSET", [250]);
      await command(writer, reader, "QUIT", [221]);
      return;
    }

    stage = "data";
    await command(writer, reader, "DATA", [354]);
    stage = "message";
    messageWritten = true;
    await writeLine(writer, `${buildMimeMessage(input)}\r\n.`);
    await expectSmtp(reader, [250]);
    accepted = true;
    // A confirmação 250 vale mesmo se a conexão cair durante QUIT.
    try { await command(writer, reader, "QUIT", [221]); } catch { /* Mensagem já aceita. */ }
  } catch (error) {
    const smtpCode = error instanceof SmtpReplyError ? error.code : null;
    throw new GmailSmtpError(stage, smtpCode, messageWritten && !accepted && smtpCode === null);
  } finally {
    reader.releaseLock();
    writer.releaseLock();
    await socket.close().catch(() => undefined);
  }
}

async function loadCloudflareSockets() {
  return import("cloudflare:sockets") as Promise<CloudflareSocketsModule>;
}

// Alternativa SMTP oficial para desenvolvimento local. AUTH ocorre somente
// após STARTTLS obrigatório, validação de certificado e novo EHLO.
async function connectLocalStartTls(): Promise<CloudflareSocket> {
  const net = await import("node:net");
  const tls = await import("node:tls");
  const streamModule = await import("node:stream");
  const { Duplex } = streamModule.default ?? streamModule;
  const raw = net.createConnection({ host: "smtp.gmail.com", port: 587 });
  raw.setTimeout(30_000, () => raw.destroy(new Error("Tempo de conexão SMTP excedido.")));
  let buffer = "";
  const read = () => new Promise<string>((resolve, reject) => {
    const cleanup = () => { raw.off("data", receive); raw.off("error", fail); raw.off("close", closed); };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const closed = () => fail(new Error("Conexão SMTP encerrada antes do STARTTLS."));
    const receive = (chunk?: Buffer) => {
      if (chunk) buffer += chunk.toString("utf8");
      if (buffer.length > 65536) return fail(new Error("Resposta SMTP acima do limite permitido."));
      const end = buffer.match(/(?:^|\n)\d{3} [^\n]*\n/);
      if (!end) return;
      const offset = end.index! + end[0].length;
      const response = buffer.slice(0, offset); buffer = buffer.slice(offset);
      cleanup(); resolve(response);
    };
    raw.on("data", receive); raw.once("error", fail); raw.once("close", closed); receive();
  });
  try {
    if (!(await read()).startsWith("220")) throw new Error("Servidor SMTP indisponível.");
    raw.write("EHLO firmant.com.br\r\n");
    const features = await read();
    if (!features.startsWith("250") || !/\bSTARTTLS\b/.test(features)) throw new Error("O servidor não ofereceu STARTTLS. Autenticação bloqueada.");
    raw.write("STARTTLS\r\n");
    if (!(await read()).startsWith("220")) throw new Error("Servidor recusou STARTTLS. Autenticação bloqueada.");
    const connection = tls.connect({ socket: raw, servername: "smtp.gmail.com", rejectUnauthorized: true });
    await new Promise<void>((resolve, reject) => { connection.once("secureConnect", resolve); connection.once("error", reject); });
    const streams = Duplex.toWeb(connection);
    return { greetingConsumed: true, readable: streams.readable as ReadableStream<Uint8Array>, writable: streams.writable as WritableStream<Uint8Array>, opened: Promise.resolve(), close: async () => { connection.destroy(); } };
  } catch (error) { raw.destroy(); throw error; }
}

// Next dev roda em Node; em produção mantém o transporte Cloudflare existente.
async function loadLocalSockets(): Promise<CloudflareSocketsModule> {
  const tls = await import("node:tls");
  const streamModule = await import("node:stream");
  const { Duplex } = streamModule.default ?? streamModule;
  return { connect(address) {
    const connection = tls.connect({ host: address.hostname, port: address.port, servername: address.hostname, rejectUnauthorized: true });
    connection.setTimeout(30_000, () => connection.destroy(new Error("Tempo de conexão SMTP excedido.")));
    const opened = new Promise<void>((resolve, reject) => { connection.once("secureConnect", resolve); connection.once("error", reject); });
    const streams = Duplex.toWeb(connection);
    return { readable: streams.readable as ReadableStream<Uint8Array>, writable: streams.writable as WritableStream<Uint8Array>, opened, close: async () => { connection.destroy(); } };
  } };
}

function buildMimeMessage(input: SendGmailSmtpInput) {
  const boundary = `firmant-${crypto.randomUUID()}`;
  const encodedSubject = encodeMimeHeader(input.subject);
  const cc = normalizeRecipients(input.cc);

  return [
    `From: FIRMANT <${input.user}>`,
    `To: ${input.to}`,
    ...(cc.length > 0 ? [`Cc: ${cc.join(", ")}`] : []),
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(base64Utf8(input.text)),
    ...input.attachments.flatMap((attachment) => [
      "",
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "",
      wrapBase64(bytesToBase64(attachment.data)),
    ]),
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

function getEnvelopeRecipients(input: SendGmailSmtpInput) {
  return Array.from(new Set([input.to, ...normalizeRecipients(input.cc)]));
}

function normalizeRecipients(recipients?: string[]) {
  return (recipients ?? [])
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

async function command(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  reader: ReadableStreamDefaultReader<Uint8Array>,
  line: string,
  expected: number[],
) {
  await writeLine(writer, line);
  return expectSmtp(reader, expected);
}

async function writeLine(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  line: string,
) {
  await writer.write(new TextEncoder().encode(`${line}\r\n`));
}

async function expectSmtp(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  expected: number[],
) {
  const response = await readSmtpResponse(reader);
  const code = Number(response.slice(0, 3));

  if (!expected.includes(code)) {
    throw new SmtpReplyError(code);
  }

  return response;
}

const smtpBuffers = new WeakMap<ReadableStreamDefaultReader<Uint8Array>, string>();
async function readSmtpResponse(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let buffer = smtpBuffers.get(reader) ?? "";
  const lines: string[] = [];
  let received = buffer.length;

  while (true) {
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      lines.push(line);
      if (/^\d{3}\s/.test(line)) {
        smtpBuffers.set(reader, buffer);
        return lines.join("\n");
      }
    }
    const { value, done } = await reader.read();
    if (done) {
      throw new Error("Conexão SMTP encerrada antes da resposta.");
    }

    buffer += new TextDecoder().decode(value);
    received += value.length;
    if (received > 65536) throw new Error("Resposta SMTP acima do limite permitido.");
  }
}

function encodeMimeHeader(value: string) {
  return `=?UTF-8?B?${base64Utf8(value)}?=`;
}

function base64Utf8(value: string) {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64Ascii(value: string) {
  return btoa(value);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }

  return btoa(binary);
}

function wrapBase64(value: string) {
  return value.match(/.{1,76}/g)?.join("\r\n") ?? value;
}
