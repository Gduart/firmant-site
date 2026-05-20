import { NextResponse } from "next/server";

import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { AsaasApiError } from "@/lib/payments/asaas/client";
import { createProductionSmokeTestCheckout } from "@/lib/payments/payment-service";

export async function GET(request: Request) {
  const unauthorized = await assertFirmantAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(buildTestCheckoutPage(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const unauthorized = await assertFirmantAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await safeReadJson(request);
    const paymentMethod = getTestPaymentMethod(body?.paymentMethod);
    const result = await createProductionSmokeTestCheckout(paymentMethod);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao criar checkout de teste.",
        details: error instanceof AsaasApiError ? error.details : undefined,
      },
      { status: 500 },
    );
  }
}

function getTestPaymentMethod(value?: string) {
  if (
    value === "CREDIT_CARD"
    || value === "BOLETO"
    || value === "SUBSCRIPTION"
  ) {
    return value;
  }

  return "PIX";
}

async function safeReadJson(request: Request) {
  try {
    return await request.json() as { paymentMethod?: string };
  } catch {
    return null;
  }
}

function buildTestCheckoutPage() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Checkout teste producao | FIRMANT</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #071120;
      color: #f8fafc;
      font: 16px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(560px, calc(100vw - 32px));
      border: 1px solid rgba(201, 168, 76, 0.32);
      border-radius: 12px;
      background: #111d33;
      padding: 28px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    p {
      color: #b7c0cf;
      margin: 0 0 18px;
    }
    button, a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 999px;
      background: #d6b557;
      color: #071120;
      cursor: pointer;
      font-weight: 800;
      padding: 12px 18px;
      text-decoration: none;
    }
    pre {
      overflow: auto;
      border-radius: 8px;
      background: #071120;
      color: #dbeafe;
      margin: 18px 0 0;
      padding: 14px;
      white-space: pre-wrap;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .secondary {
      background: transparent;
      border: 1px solid rgba(214, 181, 87, 0.6);
      color: #d6b557;
    }
  </style>
</head>
<body>
  <main>
    <h1>Checkout teste producao</h1>
    <p>Gera checkouts reais de R$ 5,00. Use somente para validacao final e remova esta rota depois do teste.</p>
    <p><strong>Atenção:</strong> assinatura mensal cria cobrança recorrente real no cartão. Cancele a assinatura no Asaas depois do teste.</p>
    <div class="actions">
      <button id="create-pix" type="button">Gerar Pix R$ 5,00</button>
      <button id="create-card" type="button">Gerar cartão avulso R$ 5,00</button>
      <button id="create-boleto" type="button">Gerar boleto R$ 5,00</button>
      <button id="create-subscription" type="button">Gerar assinatura cartão R$ 5,00/mês</button>
      <button id="sync" class="secondary" type="button">Sincronizar pagamentos Asaas</button>
      <a id="open" href="#" target="_blank" rel="noreferrer" hidden>Abrir checkout novamente</a>
    </div>
    <pre id="result">Aguardando...</pre>
  </main>
  <script>
    const pixButton = document.getElementById("create-pix");
    const cardButton = document.getElementById("create-card");
    const boletoButton = document.getElementById("create-boleto");
    const subscriptionButton = document.getElementById("create-subscription");
    const syncButton = document.getElementById("sync");
    const link = document.getElementById("open");
    const result = document.getElementById("result");
    let currentCheckoutUrl = "";

    async function createCheckout(paymentMethod, button) {
      if (currentCheckoutUrl) {
        window.open(currentCheckoutUrl, "_blank", "noopener,noreferrer");
        return;
      }

      button.disabled = true;
      pixButton.disabled = true;
      cardButton.disabled = true;
      boletoButton.disabled = true;
      subscriptionButton.disabled = true;
      result.textContent = "Criando checkout...";
      link.hidden = true;

      try {
        const response = await fetch("/api/admin/test-checkout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod })
        });
        const json = await response.json();
        result.textContent = JSON.stringify(json, null, 2);

        if (!response.ok) {
          return;
        }

        currentCheckoutUrl = json.checkoutUrl;
        link.href = json.checkoutUrl;
        link.hidden = false;
        button.textContent = "Checkout gerado - abrir novamente";
        window.open(json.checkoutUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        result.textContent = error instanceof Error ? error.message : "Falha ao criar checkout.";
      } finally {
        button.disabled = false;
        pixButton.disabled = false;
        cardButton.disabled = false;
        boletoButton.disabled = false;
        subscriptionButton.disabled = false;
      }
    }

    pixButton.addEventListener("click", () => createCheckout("PIX", pixButton));
    cardButton.addEventListener("click", () => createCheckout("CREDIT_CARD", cardButton));
    boletoButton.addEventListener("click", () => createCheckout("BOLETO", boletoButton));
    subscriptionButton.addEventListener("click", () => createCheckout("SUBSCRIPTION", subscriptionButton));

    syncButton.addEventListener("click", async () => {
      syncButton.disabled = true;
      result.textContent = "Sincronizando com Asaas...";

      try {
        const response = await fetch("/api/admin/test-checkout/sync", {
          method: "POST",
          credentials: "same-origin"
        });
        const json = await response.json();
        result.textContent = JSON.stringify(json, null, 2);
      } catch (error) {
        result.textContent = error instanceof Error ? error.message : "Falha ao sincronizar pagamentos.";
      } finally {
        syncButton.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}
