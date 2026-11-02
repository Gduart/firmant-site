// Autentica sem enviar mensagem; imprime somente o resultado, nunca credenciais.
import { loadEnvConfig } from "@next/env";
import { GmailSmtpError, verifyGmailSmtp } from "../../src/lib/commercial/gmail-smtp";
loadEnvConfig(process.cwd(), true);
async function main() {
  const user = process.env.GMAIL_SMTP_USER?.trim();
  const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !appPassword) {
    console.log("Gmail pendente: preencha GMAIL_SMTP_USER e GMAIL_SMTP_APP_PASSWORD em .env.local.");
    process.exitCode = 2;
    return;
  }
  if (user !== "ag.firmant@gmail.com" || appPassword.length !== 16) {
    console.log("Revise a conta ag.firmant@gmail.com e a senha de app de 16 caracteres. Não use a senha comum da conta.");
    process.exitCode = 2;
    return;
  }
  try {
    await verifyGmailSmtp({ user, appPassword });
    console.log("Gmail autenticado com sucesso. Nenhuma mensagem foi enviada.");
  } catch (error) {
    if (error instanceof GmailSmtpError) {
      console.log(error.message);
      process.exitCode = 1;
      return;
    }
    const status = error instanceof Error ? error.message.match(/SMTP respondeu (\d{3})/)?.[1] : undefined;
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^[A-Z0-9_]{2,80}$/.test(error.code) ? error.code : "";
    console.log(status ? `Gmail recusou a autenticação ou conexão (SMTP ${status}). Confira a senha de app e a conta.` : `Não foi possível validar a conexão TLS com o Gmail${code ? ` (${code})` : ""}. Confira rede, certificado e acesso SMTP.`);
    process.exitCode = 1;
  }
}
void main();
