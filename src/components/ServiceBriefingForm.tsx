"use client";

import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import type { BriefingField } from "@/lib/development-services";
import styles from "./Development.module.css";

export function ServiceBriefingForm({ slug, title, fields }: { slug: string; title: string; fields: BriefingField[] }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; notification: string } | null>(null);
  const keyRef = useRef<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    keyRef.current ??= crypto.randomUUID();
    setSending(true); setError("");
    try {
      const response = await fetch("/api/service-briefings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          idempotencyKey: keyRef.current, serviceSlug: slug,
          ...Object.fromEntries(["name", "company", "email", "phone", "sector", "objective", "deadline", "budget", "website"].map(key => [key, String(data.get(key) ?? "")])),
          answers: Object.fromEntries(fields.map(field => [field.key, String(data.get(field.key) ?? "")])),
          privacyAcknowledged: data.get("privacyAcknowledged") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível enviar. Tente novamente.");
      setReceipt({ reference: result.reference, notification: result.notification });
    } catch (failure) {
      setError(failure instanceof Error && failure.name === "TimeoutError"
        ? "O recebimento demorou mais que o esperado. Seus dados foram mantidos; tente novamente para confirmar o envio."
        : failure instanceof Error ? failure.message : "Falha de conexão. Tente novamente.");
    } finally {
      setSending(false);
      requestAnimationFrame(() => messageRef.current?.focus());
    }
  }

  return (
    <section id="briefing" className={styles.briefing} aria-labelledby="briefing-title">
      <header><span className={styles.eyebrow}>Seu projeto começa aqui</span><h2 id="briefing-title">Conte o que sua empresa precisa.</h2><p>Preencha o briefing deste serviço. Vamos analisar sua necessidade para preparar uma proposta com escopo, prazo e investimento.</p></header>
      <div className={styles.formPanel}>
        <div className={styles.formHeading}><span>Solicitação de projeto</span><span>Briefing</span></div>
        <div className={styles.selectedService}><span>Serviço selecionado</span><strong>{title}</strong></div>
        <div ref={messageRef} tabIndex={-1} className={receipt ? styles.receipt : undefined} role={receipt ? "status" : error ? "alert" : undefined}>
          {receipt && <><h3>Briefing recebido.</h3><p>Sua solicitação foi registrada no Diagnóstico Leads da FIRMANT.</p><p>Protocolo: <strong className={styles.reference}>{receipt.reference}</strong></p><p>{receipt.notification === "delivered" ? "A equipe foi notificada por e-mail." : "O alerta por e-mail está na fila de envio. Sua solicitação já está registrada."}</p><p>A equipe analisará o projeto e entrará em contato pelos dados informados.</p><Link href="/desenvolvimento">Conhecer os outros serviços →</Link></>}
          {error && <p className={styles.formError}>{error}</p>}
        </div>
        {!receipt && <form onSubmit={submit} onChange={() => { if (!sending) keyRef.current = null; }}>
          <fieldset disabled={sending} className={styles.formFields}>
            <legend>Contato e contexto</legend>
            <div className={styles.fieldGrid}>
              <label>Seu nome *<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Como podemos chamar você?" /></label>
              <label>Nome da empresa *<input name="company" autoComplete="organization" required minLength={2} maxLength={120} placeholder="Qual é o seu negócio?" /></label>
              <label>E-mail para retorno *<input name="email" type="email" autoComplete="email" required maxLength={160} placeholder="voce@empresa.com.br" /></label>
              <label>WhatsApp com DDD *<input name="phone" type="tel" autoComplete="tel" required minLength={10} maxLength={40} placeholder="(00) 00000-0000" /></label>
              <label className={styles.wideField}>Segmento da empresa *<input name="sector" required minLength={2} maxLength={120} placeholder="Ex.: clínica, imobiliária ou serviços locais" /></label>
              <label className={styles.wideField}>Qual problema quer resolver e qual resultado espera? *<textarea name="objective" required minLength={2} maxLength={1800} rows={4} placeholder="Conte o contexto e o que precisa mudar na sua operação." /></label>
            </div>
          </fieldset>
          <fieldset disabled={sending} className={styles.formFields}>
            <legend>Sobre este serviço</legend>
            <div className={styles.fieldGrid}>
              {fields.map(field => <label className={styles.wideField} key={field.key}>{field.label}{field.required ? " *" : ""}{field.hint && <small>{field.hint}</small>}<textarea name={field.key} required={field.required} minLength={field.required ? 2 : undefined} maxLength={1200} rows={3} /></label>)}
              <label>Prazo desejado <span className={styles.optional}>opcional</span><input name="deadline" maxLength={120} placeholder="Data prevista ou a definir" /></label>
              <label>Investimento previsto <span className={styles.optional}>opcional</span><input name="budget" maxLength={160} placeholder="Faixa estimada ou preciso de orientação" /></label>
            </div>
          </fieldset>
          <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className={styles.consent}><input name="privacyAcknowledged" type="checkbox" required disabled={sending} /><span>Li a <Link href="/politica-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link> e estou ciente do uso dos meus dados para analisar e responder a esta solicitação.</span></label>
          <button className={styles.submit} type="submit" disabled={sending}>{sending ? "Enviando briefing…" : "Enviar briefing para análise"}<span aria-hidden="true">↗</span></button>
          <p className={styles.formNote}>* Campos obrigatórios. O envio solicita uma proposta e não gera cobrança. Não inclua senhas, dados de pacientes ou documentos pessoais de terceiros.</p>
        </form>}
      </div>
    </section>
  );
}
