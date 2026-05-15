type GmailAttachment = {
  filename: string;
  contentType: string;
  data: Uint8Array;
};

type CloudflareSocket = {
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

export async function sendGmailSmtp(input: SendGmailSmtpInput) {
  const appPassword = input.appPassword.replace(/\s+/g, "");
  const { connect } = await loadCloudflareSockets();
  const socket = connect(
    { hostname: "smtp.gmail.com", port: 465 },
    { secureTransport: "on" },
  );
  await socket.opened;

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();

  try {
    await expectSmtp(reader, [220]);
    await command(writer, reader, "EHLO firmant.com.br", [250]);
    await command(writer, reader, "AUTH LOGIN", [334]);
    await command(writer, reader, base64Ascii(input.user), [334]);
    await command(writer, reader, base64Ascii(appPassword), [235]);
    await command(writer, reader, `MAIL FROM:<${input.user}>`, [250]);

    for (const recipient of getEnvelopeRecipients(input)) {
      await command(writer, reader, `RCPT TO:<${recipient}>`, [250, 251]);
    }

    await command(writer, reader, "DATA", [354]);
    await writeLine(writer, `${buildMimeMessage(input)}\r\n.`);
    await expectSmtp(reader, [250]);
    await command(writer, reader, "QUIT", [221]);
  } finally {
    reader.releaseLock();
    writer.releaseLock();
    await socket.close().catch(() => undefined);
  }
}

async function loadCloudflareSockets() {
  return import("cloudflare:sockets") as Promise<CloudflareSocketsModule>;
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
    throw new Error(`SMTP respondeu ${response}`);
  }

  return response;
}

async function readSmtpResponse(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let response = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      throw new Error("Conexão SMTP encerrada antes da resposta.");
    }

    response += new TextDecoder().decode(value);
    const lines = response.split(/\r?\n/).filter(Boolean);
    const lastLine = lines.at(-1);

    if (lastLine && /^\d{3}\s/.test(lastLine)) {
      return lines.join("\n");
    }
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
