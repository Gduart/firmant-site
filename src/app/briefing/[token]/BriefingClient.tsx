"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type BriefingForm = {
  clientType: "PF" | "PJ";
  legalName: string;
  tradeName: string;
  taxId: string;
  responsibleName: string;
  responsibleRole: string;
  email: string;
  billingEmail: string;
  whatsapp: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  province: string;
  postalCode: string;
  city: string;
  state: string;
  site: string;
  instagram: string;
  projectName: string;
  brandName: string;
  requestType: string;
  contentTypes: string[];
  formats: string[];
  platforms: string[];
  quantity: number;
  duration: string;
  scopeDescription: string;
  deadlineRequested: string;
  budgetRange: string;
  paymentPreferences: string[];
  additionalNotes: string;
  privacyConsent: boolean;
};

type Attachment = {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  expires_at: string;
};

type PublicBriefing = {
  reference_number: string;
  status: string;
  client_type: "PF" | "PJ" | null;
  legal_name: string | null;
  trade_name: string | null;
  tax_id: string | null;
  responsible_name: string | null;
  responsible_role: string | null;
  email: string | null;
  billing_email: string | null;
  whatsapp: string | null;
  address: string | null;
  address_number: string | null;
  address_complement: string | null;
  province: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  site: string | null;
  instagram: string | null;
  project_name: string | null;
  brand_name: string | null;
  request_type: string | null;
  quantity: number | null;
  duration: string | null;
  scope_description: string | null;
  deadline_requested: string | null;
  budget_range: string | null;
  additional_notes: string | null;
  privacy_consent: number;
  contentTypes: string[];
  formats: string[];
  platforms: string[];
  paymentPreferences: string[];
};

const emptyForm: BriefingForm = {
  clientType: "PJ",
  legalName: "",
  tradeName: "",
  taxId: "",
  responsibleName: "",
  responsibleRole: "",
  email: "",
  billingEmail: "",
  whatsapp: "",
  address: "",
  addressNumber: "",
  addressComplement: "",
  province: "",
  postalCode: "",
  city: "",
  state: "",
  site: "",
  instagram: "",
  projectName: "",
  brandName: "",
  requestType: "",
  contentTypes: [],
  formats: [],
  platforms: [],
  quantity: 1,
  duration: "",
  scopeDescription: "",
  deadlineRequested: "",
  budgetRange: "",
  paymentPreferences: [],
  additionalNotes: "",
  privacyConsent: false,
};

const options = {
  contentTypes: ["Reel", "Story", "UGC", "Anúncio", "Carrossel", "Imagem", "Vídeo YouTube", "Institucional", "Outro"],
  formats: ["9:16", "16:9", "1:1", "4:5", "Ainda não sei"],
  platforms: ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "Site", "Mídia paga", "Outro"],
  paymentPreferences: ["PIX", "Cartão de crédito", "Boleto", "A definir"],
};

export function BriefingClient({ token }: { token: string }) {
  const [form, setForm] = useState<BriefingForm>(emptyForm);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const locked = !["DRAFT", "NEEDS_INFORMATION"].includes(status);
  const endpoint = useMemo(() => `/api/briefings/${token}`, [token]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível abrir o briefing.");
      const briefing = data.briefing as PublicBriefing;
      setReference(briefing.reference_number);
      setStatus(briefing.status);
      setAttachments(data.attachments ?? []);
      setForm(mapBriefingToForm(briefing));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao abrir briefing.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof BriefingForm>(key: K, value: BriefingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggle(key: "contentTypes" | "formats" | "platforms" | "paymentPreferences", value: string) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  async function saveDraft(showSuccess = true) {
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao salvar.");
      if (showSuccess) setMessage("Rascunho salvo com segurança.");
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao salvar.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function submitBriefing() {
    if (!window.confirm("Confirma o envio deste briefing para análise da FIRMANT?")) return;
    const saved = await saveDraft(false);
    if (!saved) return;
    setIsSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao enviar briefing.");
      setStatus("SUBMITTED");
      setMessage("Briefing enviado. A FIRMANT já pode analisá-lo.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao enviar briefing.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setIsUploading(true);
    setError("");
    setMessage("");
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch(`${endpoint}/attachments`, { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(`${file.name}: ${data.error ?? "Falha no upload."}`);
      }
      setMessage("Imagem(ns) anexada(s). Os arquivos expiram automaticamente em sete dias.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha no upload.");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteAttachment(id: string) {
    if (!window.confirm("Excluir esta imagem agora?")) return;
    const response = await fetch(`${endpoint}/attachments/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Falha ao excluir imagem.");
      return;
    }
    setAttachments((current) => current.filter((item) => item.id !== id));
    setMessage("Imagem excluída.");
  }

  if (isLoading) {
    return <section className="workflow-public-page"><div className="workflow-public-shell"><p>Carregando briefing seguro...</p></div></section>;
  }

  return (
    <section className="workflow-public-page">
      <div className="workflow-public-shell">
        <header className="workflow-public-header">
          <span>Solicitação exclusiva · {reference}</span>
          <h1>Conte-nos o que sua marca precisa.</h1>
          <p>Este briefing reúne as informações necessárias para a FIRMANT analisar o projeto e preparar uma proposta comercial precisa.</p>
        </header>

        {error && <div className="workflow-alert workflow-alert-error">{error}</div>}
        {message && <div className="workflow-alert workflow-alert-success">{message}</div>}

        {locked ? (
          <div className="workflow-success-panel">
            <strong>Briefing enviado ✓</strong>
            <p>As informações foram registradas. A FIRMANT entrará em contato após a análise.</p>
          </div>
        ) : (
          <form className="workflow-form" onSubmit={(event) => { event.preventDefault(); void saveDraft(); }}>
            <FormSection title="1. Cliente e contato" description="Dados usados na proposta, comunicação e eventual cobrança.">
              <div className="workflow-field-grid">
                <SelectField label="Tipo de cliente" value={form.clientType} onChange={(value) => update("clientType", value as "PF" | "PJ")} options={[{ value: "PJ", label: "Pessoa jurídica" }, { value: "PF", label: "Pessoa física" }]} />
                <TextField label={form.clientType === "PJ" ? "Razão social" : "Nome completo"} value={form.legalName} onChange={(value) => update("legalName", value)} />
                <TextField label="Nome fantasia / marca" value={form.tradeName} onChange={(value) => update("tradeName", value)} />
                <TextField required label={form.clientType === "PJ" ? "CNPJ" : "CPF"} value={form.taxId} onChange={(value) => update("taxId", value)} />
                <TextField required label="Responsável" value={form.responsibleName} onChange={(value) => update("responsibleName", value)} />
                <TextField label="Cargo" value={form.responsibleRole} onChange={(value) => update("responsibleRole", value)} />
                <TextField required type="email" label="E-mail" value={form.email} onChange={(value) => update("email", value)} />
                <TextField type="email" label="E-mail de faturamento" value={form.billingEmail} onChange={(value) => update("billingEmail", value)} />
                <TextField required label="WhatsApp" value={form.whatsapp} onChange={(value) => update("whatsapp", value)} />
                <TextField label="Instagram" value={form.instagram} onChange={(value) => update("instagram", value)} />
                <TextField label="Site" value={form.site} onChange={(value) => update("site", value)} />
                <TextField required label="CEP" value={form.postalCode} onChange={(value) => update("postalCode", value)} />
                <TextField required label="Endereço" value={form.address} onChange={(value) => update("address", value)} />
                <TextField required label="Número" value={form.addressNumber} onChange={(value) => update("addressNumber", value)} />
                <TextField label="Complemento" value={form.addressComplement} onChange={(value) => update("addressComplement", value)} />
                <TextField required label="Bairro" value={form.province} onChange={(value) => update("province", value)} />
                <TextField required label="Cidade" value={form.city} onChange={(value) => update("city", value)} />
                <TextField required label="UF" maxLength={2} value={form.state} onChange={(value) => update("state", value.toUpperCase())} />
              </div>
            </FormSection>

            <FormSection title="2. Projeto" description="Explique a necessidade com o máximo de contexto possível.">
              <div className="workflow-field-grid">
                <TextField required label="Nome do projeto" value={form.projectName} onChange={(value) => update("projectName", value)} />
                <TextField label="Marca envolvida" value={form.brandName} onChange={(value) => update("brandName", value)} />
                <TextField label="Tipo principal da solicitação" value={form.requestType} onChange={(value) => update("requestType", value)} />
                <TextField type="number" min={1} label="Quantidade estimada de peças" value={String(form.quantity)} onChange={(value) => update("quantity", Math.max(1, Number(value) || 1))} />
                <TextField label="Duração prevista" placeholder="Ex.: 30 segundos" value={form.duration} onChange={(value) => update("duration", value)} />
                <TextField type="date" label="Prazo desejado" value={form.deadlineRequested} onChange={(value) => update("deadlineRequested", value)} />
              </div>
              <TextAreaField required label="Descrição da necessidade e objetivo" value={form.scopeDescription} onChange={(value) => update("scopeDescription", value)} />
              <OptionGroup title="Tipos de conteúdo" values={options.contentTypes} selected={form.contentTypes} onToggle={(value) => toggle("contentTypes", value)} />
              <OptionGroup title="Formatos" values={options.formats} selected={form.formats} onToggle={(value) => toggle("formats", value)} />
              <OptionGroup title="Plataformas" values={options.platforms} selected={form.platforms} onToggle={(value) => toggle("platforms", value)} />
            </FormSection>

            <FormSection title="3. Investimento e condições" description="Essas respostas orientam a proposta; não representam cobrança ou aceite.">
              <TextField label="Faixa de orçamento disponível" placeholder="Ex.: até R$ 1.500 / ainda não definido" value={form.budgetRange} onChange={(value) => update("budgetRange", value)} />
              <OptionGroup title="Preferências de pagamento" values={options.paymentPreferences} selected={form.paymentPreferences} onToggle={(value) => toggle("paymentPreferences", value)} />
              <TextAreaField label="Observações adicionais" value={form.additionalNotes} onChange={(value) => update("additionalNotes", value)} />
            </FormSection>

            <FormSection title="4. Referências visuais" description="Até 10 imagens JPG ou PNG, com no máximo 10 MB cada. Exclusão automática em sete dias.">
              <label className="workflow-upload">
                <input type="file" accept="image/jpeg,image/png" multiple disabled={isUploading || attachments.length >= 10} onChange={(event) => { void uploadImages(event.target.files); event.currentTarget.value = ""; }} />
                <strong>{isUploading ? "Enviando imagens..." : "Selecionar imagens"}</strong>
                <small>{attachments.length}/10 arquivos enviados</small>
              </label>
              <div className="workflow-attachment-grid">
                {attachments.map((attachment) => (
                  <article key={attachment.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${endpoint}/attachments/${attachment.id}`} alt={attachment.original_filename} />
                    <div><strong>{attachment.original_filename}</strong><span>{formatBytes(attachment.size_bytes)}</span></div>
                    <button type="button" onClick={() => void deleteAttachment(attachment.id)}>Excluir</button>
                  </article>
                ))}
              </div>
            </FormSection>

            <label className="workflow-consent">
              <input type="checkbox" checked={form.privacyConsent} onChange={(event) => update("privacyConsent", event.target.checked)} />
              <span>Autorizo o tratamento destes dados e arquivos pela FIRMANT exclusivamente para análise, elaboração da proposta e comunicação sobre este projeto.</span>
            </label>

            <div className="workflow-form-actions">
              <button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar rascunho"}</button>
              <button className="workflow-primary-action" type="button" disabled={isSaving} onClick={() => void submitBriefing()}>Enviar briefing para análise</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="workflow-form-section"><header><h2>{title}</h2><p>{description}</p></header>{children}</section>;
}

function TextField({ label, value, onChange, type = "text", required, placeholder, maxLength, min }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; maxLength?: number; min?: number }) {
  return <label className="workflow-field"><span>{label}{required ? " *" : ""}</span><input type={type} value={value} required={required} placeholder={placeholder} maxLength={maxLength} min={min} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextAreaField({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="workflow-field workflow-field-wide"><span>{label}{required ? " *" : ""}</span><textarea value={value} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options: selectOptions }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return <label className="workflow-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{selectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function OptionGroup({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <fieldset className="workflow-options"><legend>{title}</legend><div>{values.map((value) => <label key={value}><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} /><span>{value}</span></label>)}</div></fieldset>;
}

function mapBriefingToForm(briefing: PublicBriefing): BriefingForm {
  return {
    clientType: briefing.client_type ?? "PJ",
    legalName: briefing.legal_name ?? "",
    tradeName: briefing.trade_name ?? "",
    taxId: briefing.tax_id ?? "",
    responsibleName: briefing.responsible_name ?? "",
    responsibleRole: briefing.responsible_role ?? "",
    email: briefing.email ?? "",
    billingEmail: briefing.billing_email ?? "",
    whatsapp: briefing.whatsapp ?? "",
    address: briefing.address ?? "",
    addressNumber: briefing.address_number ?? "",
    addressComplement: briefing.address_complement ?? "",
    province: briefing.province ?? "",
    postalCode: briefing.postal_code ?? "",
    city: briefing.city ?? "",
    state: briefing.state ?? "",
    site: briefing.site ?? "",
    instagram: briefing.instagram ?? "",
    projectName: briefing.project_name ?? "",
    brandName: briefing.brand_name ?? "",
    requestType: briefing.request_type ?? "",
    contentTypes: briefing.contentTypes,
    formats: briefing.formats,
    platforms: briefing.platforms,
    quantity: briefing.quantity ?? 1,
    duration: briefing.duration ?? "",
    scopeDescription: briefing.scope_description ?? "",
    deadlineRequested: briefing.deadline_requested ?? "",
    budgetRange: briefing.budget_range ?? "",
    paymentPreferences: briefing.paymentPreferences,
    additionalNotes: briefing.additional_notes ?? "",
    privacyConsent: Boolean(briefing.privacy_consent),
  };
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
