(() => {
  const app = document.querySelector("#app");
  const token = new URLSearchParams(location.search).get("token")?.trim() || "";
  let result = null;
  let busy = false;
  let cardQuote = null;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const money = (cents) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(cents || 0) / 100);
  const date = (value) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(value)) : "—";
  const array = (value) => { try { const data = JSON.parse(value || "[]"); return Array.isArray(data) ? data : []; } catch { return []; } };
  const paymentName = (value) => value === "PIX" ? "Pix" : value === "CREDIT_CARD" ? "Cartão de crédito" : "Boleto";
  const mediaName = (value) => value === "VIDEO" ? "Vídeo" : value === "IMAGE" ? "Imagem" : "Carrossel";

  function state(title, message = "") {
    app.innerHTML = `<section class="shell state"><b>FIRMANT</b><h1>${esc(title)}</h1>${message ? `<p>${esc(message)}</p>` : ""}</section>`;
  }

  async function load() {
    if (token.length < 32) return state("Link indisponível", "O endereço da proposta é inválido.");
    try {
      const response = await fetch(`/api/proposals/${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a proposta.");
      result = data;
      render();
    } catch (error) { state("Link indisponível", error.message); }
  }

  function render() {
    const snapshot = result?.snapshot;
    if (!snapshot) return state("Esta proposta expirou", "Solicite à FIRMANT uma nova versão para continuar.");
    const { proposal, items, milestones } = snapshot;
    const accepted = result.acceptance?.decision === "ACCEPTED";
    const media = result.media || [];
    app.innerHTML = `<div class="shell">
      <header class="hero"><div><span class="eyebrow">FIRMANT · PROPOSTA COMERCIAL</span><h1>${esc(proposal.project_name)}</h1><p>Uma proposta preparada para <b>${esc(proposal.client_name)}</b>.</p></div><div class="meta"><span>${esc(proposal.proposal_number)}</span><strong>v${esc(proposal.current_version)}</strong><small>Válida até ${esc(date(proposal.valid_until))}</small><a href="/api/proposals/${encodeURIComponent(token)}/pdf" target="_blank">Abrir PDF</a></div></header>
      <section class="intro">${esc(proposal.summary)}</section>
      <div class="layout"><section class="content">
        <article class="card"><span class="number">01</span><h2>Escopo do projeto</h2><p class="pre">${esc(proposal.scope)}</p></article>
        <article class="card"><span class="number">02</span><h2>Entregáveis e investimento</h2><div class="items">${items.map((item) => `<div><div><b>${esc(item.name)}</b><p>${esc(item.description)}</p><small>${esc(item.quantity)} ${esc(item.unit)}</small></div><b>${money(item.total_cents)}</b></div>`).join("")}</div><div class="total"><span>Investimento total</span><strong>${money(proposal.total_cents)}</strong></div></article>
        <article class="card"><span class="number">03</span><h2>O que está incluído</h2><ul class="checks">${array(proposal.included_json).map((item) => `<li>${esc(item)}</li>`).join("")}</ul><h3>Não incluído</h3><ul>${array(proposal.excluded_json).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
        <article class="card"><span class="number">04</span><h2>Prazo e revisões</h2><div class="facts"><div><span>Prazo estimado</span><b>${esc(proposal.estimated_deadline || "Conforme cronograma acordado")}</b></div><div><span>Rodadas incluídas</span><b>${esc(proposal.revisions_included)}</b></div></div><p>${esc(proposal.revision_definition)}</p></article>
        <article class="card"><span class="number">05</span><h2>Condições</h2><h3>Licença e uso</h3><p>${esc(proposal.license_terms)}</p><h3>Cancelamento</h3><p>${esc(proposal.cancellation_terms)}</p></article>
        ${media.length ? mediaSection(media) : workflowSection(accepted)}
      </section><aside class="side">
        <section class="card"><span class="number">PAGAMENTO</span><h2>Etapas</h2>${milestones.map((item) => `<div class="payment-row"><div><b>${esc(item.label)}</b><small>${esc(item.due_trigger)}</small></div><b>${money(item.amount_cents)}</b></div>`).join("")}</section>
        <section id="decision" class="card">${decisionSection(proposal)}</section>
      </aside></div><footer class="footer"><b>FIRMANT</b><span>Comunicação, criação e tecnologia com processo claro.</span></footer>
    </div>`;
    bindActions();
  }

  function mediaSection(media) {
    return `<article class="card"><span class="number">06 · MÍDIAS</span><h2>Mídias aprovadas do projeto</h2><p>Conteúdos vinculados ao projeto ${esc(result.project?.project_number || "")}.</p><div class="media">${media.map((asset) => { const src = `/api/proposals/${encodeURIComponent(token)}/media/${encodeURIComponent(asset.id)}`; return `<article><div class="media-head"><div><b>${esc(asset.title)}</b><small>${mediaName(asset.assetType)} · versão ${esc(asset.versionNumber)}</small></div><span class="approved">Aprovado</span></div>${asset.assetType === "VIDEO" ? `<video src="${src}" controls controlsList="nodownload" preload="metadata"></video>` : asset.assetType === "IMAGE" ? `<img src="${src}" alt="${esc(asset.title)}">` : ""}${asset.caption ? `<p>${esc(asset.caption)}</p>` : ""}</article>`; }).join("")}</div></article>`;
  }

  function workflowSection(accepted) {
    return `<article class="card"><span class="number">06</span><h2>Como funciona a aprovação das mídias</h2><ol class="steps"><li><b>Aceite da proposta</b><span>${accepted ? "Concluído." : "Formaliza o escopo e o investimento."}</span></li><li><b>Entrada fixa de 50%</b><span>A produção é liberada após a confirmação.</span></li><li><b>Produção das mídias</b><span>Imagens, carrosséis ou vídeos conforme o escopo.</span></li><li><b>Revisão em portal privado</b><span>Comentários e aprovação de cada versão.</span></li><li><b>Entrega final</b><span>As mídias aprovadas passam a aparecer nesta proposta.</span></li></ol></article>`;
  }

  function decisionSection(proposal) {
    const decision = result.acceptance?.decision;
    if (decision === "REJECTED") return `<h2>Sua decisão</h2><div class="result"><b>Recusa registrada.</b><p>A FIRMANT recebeu sua decisão.</p></div>`;
    if (decision === "ACCEPTED") {
      if (result.payment?.payment_method === "CREDIT_CARD") return `<h2>Sua decisão</h2><div class="result"><b>Proposta aceita.</b><p>Escolha o parcelamento. O valor abaixo já inclui as taxas.</p><div id="card-plan" class="card-plan"><label class="field">CPF ou CNPJ do pagador<input id="payer-document" inputmode="numeric" autocomplete="off"></label><label class="field">Parcelamento<select id="installment-count">${Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}x</option>`).join("")}</select></label><div id="card-quote" class="quote">Calculando taxas atuais do Asaas…</div></div><button id="retry-payment" class="primary">Gerar cobrança com este parcelamento</button></div>`;
      return `<h2>Sua decisão</h2><div class="result"><b>Proposta aceita.</b><p>${result.payment?.checkout_expired ? "A cobrança anterior expirou. Gere uma nova cobrança para continuar." : "O aceite desta versão foi registrado."}</p>${result.payment?.checkout_url ? `<a class="primary" href="${esc(result.payment.checkout_url)}">Continuar para o pagamento</a>` : `<button id="retry-payment" class="primary">${result.payment?.checkout_expired ? "Gerar nova cobrança" : "Gerar link de pagamento"}</button>`}</div>`;
    }
    const methods = array(proposal.payment_methods_json);
    return `<h2>Sua decisão</h2><label class="field">Nome completo<input id="signer-name"></label><label class="field">E-mail<input id="signer-email" type="email" value="${esc(proposal.client_email)}"></label><fieldset class="methods"><legend>Forma de pagamento</legend>${methods.map((method) => `<label><input type="radio" name="payment" value="${esc(method)}">${paymentName(method)}</label>`).join("")}</fieldset>${methods.includes("CREDIT_CARD") ? `<div id="card-plan" class="card-plan" hidden><label class="field">CPF ou CNPJ do pagador<input id="payer-document" inputmode="numeric" autocomplete="off"></label><label class="field">Parcelamento<select id="installment-count">${Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}x</option>`).join("")}</select></label><div id="card-quote" class="quote">Selecione a quantidade de parcelas.</div></div>` : ""}<label class="consent"><input id="consent" type="checkbox"><span>Li e aceito integralmente esta proposta e seus termos.</span></label><p id="form-error" class="alert" hidden></p><button id="accept" class="primary">Aceitar proposta e continuar</button><button id="reject-toggle" class="secondary">Não desejo aprovar</button><div id="reject-box" hidden><label class="field">Motivo (opcional)<textarea id="reason"></textarea></label><button id="reject" class="primary">Registrar recusa</button></div>`;
  }

  function bindActions() {
    document.querySelector("#reject-toggle")?.addEventListener("click", () => { const box = document.querySelector("#reject-box"); box.hidden = !box.hidden; });
    document.querySelector("#accept")?.addEventListener("click", () => submit("ACCEPTED"));
    document.querySelector("#reject")?.addEventListener("click", () => submit("REJECTED"));
    document.querySelector("#retry-payment")?.addEventListener("click", retryPayment);
    document.querySelectorAll('input[name="payment"]').forEach((input) => input.addEventListener("change", () => {
      const cardPlan = document.querySelector("#card-plan");
      if (cardPlan) cardPlan.hidden = input.value !== "CREDIT_CARD";
      if (input.value === "CREDIT_CARD") void loadCardQuote();
    }));
    document.querySelector("#installment-count")?.addEventListener("change", loadCardQuote);
    if (result.acceptance?.decision === "ACCEPTED" && result.payment?.payment_method === "CREDIT_CARD") void loadCardQuote();
  }

  async function loadCardQuote() {
    const box = document.querySelector("#card-quote");
    const count = Number(document.querySelector("#installment-count")?.value || 1);
    if (!box) return;
    box.textContent = "Calculando taxas atuais do Asaas…";
    cardQuote = null;
    try {
      const response = await fetch(`/api/proposals/${encodeURIComponent(token)}/payment/quote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ installmentCount: count }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao calcular parcelamento.");
      cardQuote = data;
      box.innerHTML = `<b>${esc(data.installmentCount)}x de ${money(Math.round(data.installmentValue * 100))}</b><span>Total no cartão: ${money(Math.round(data.totalValue * 100))}</span><small>Inclui taxa do cartão calculada pelo Asaas e antecipação automática de ${esc(String(data.monthlyAnticipationRate).replace(".", ","))}% a.m.</small>`;
    } catch (error) { box.textContent = error.message; }
  }

  async function submit(decision) {
    if (busy) return;
    const errorBox = document.querySelector("#form-error");
    const consent = document.querySelector("#consent")?.checked || false;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "";
    if (decision === "ACCEPTED" && !consent) { errorBox.hidden = false; errorBox.textContent = "Confirme a leitura e o aceite da proposta."; return; }
    if (decision === "ACCEPTED" && paymentMethod === "CREDIT_CARD" && !cardQuote) { errorBox.hidden = false; errorBox.textContent = "Aguarde o cálculo do parcelamento antes de continuar."; return; }
    if (decision === "ACCEPTED" && paymentMethod === "CREDIT_CARD" && String(document.querySelector("#payer-document")?.value || "").replace(/\D/g, "").length < 11) { errorBox.hidden = false; errorBox.textContent = "Informe um CPF ou CNPJ válido para gerar a cobrança."; return; }
    busy = true;
    try {
      const response = await fetch(`/api/proposals/${encodeURIComponent(token)}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, signerName: document.querySelector("#signer-name")?.value || "", signerEmail: document.querySelector("#signer-email")?.value || "", paymentMethod, installmentCount: Number(document.querySelector("#installment-count")?.value || 1), payerDocument: document.querySelector("#payer-document")?.value || "", reason: document.querySelector("#reason")?.value || "", consent }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Não foi possível registrar sua decisão.");
      if (data.payment?.checkoutUrl) return location.assign(data.payment.checkoutUrl);
      await load();
    } catch (error) { errorBox.hidden = false; errorBox.textContent = error.message; } finally { busy = false; }
  }

  async function retryPayment() {
    if (busy) return; busy = true;
    try { const installmentCount = Number(document.querySelector("#installment-count")?.value || 1); const payerDocument = document.querySelector("#payer-document")?.value || ""; if (result.payment?.payment_method === "CREDIT_CARD" && String(payerDocument).replace(/\D/g, "").length < 11) throw new Error("Informe um CPF ou CNPJ válido."); const response = await fetch(`/api/proposals/${encodeURIComponent(token)}/payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ installmentCount, payerDocument, regenerate: result.payment?.payment_method === "CREDIT_CARD" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Falha ao gerar pagamento."); location.assign(data.checkoutUrl); } catch (error) { alert(error.message); } finally { busy = false; }
  }

  load();
})();
