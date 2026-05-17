import { NextResponse } from "next/server";

import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
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
    const result = await createProductionSmokeTestCheckout();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao criar checkout de teste.",
      },
      { status: 500 },
    );
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
  </style>
</head>
<body>
  <main>
    <h1>Checkout teste producao</h1>
    <p>Gera um checkout Pix real de R$ 1,00. Use somente para validacao final e remova esta rota depois do teste.</p>
    <div class="actions">
      <button id="create" type="button">Gerar checkout R$ 1,00</button>
      <a id="open" href="#" target="_blank" rel="noreferrer" hidden>Abrir checkout</a>
    </div>
    <pre id="result">Aguardando...</pre>
  </main>
  <script>
    const button = document.getElementById("create");
    const link = document.getElementById("open");
    const result = document.getElementById("result");

    button.addEventListener("click", async () => {
      button.disabled = true;
      result.textContent = "Criando checkout...";
      link.hidden = true;

      try {
        const response = await fetch("/api/admin/test-checkout", {
          method: "POST",
          credentials: "same-origin"
        });
        const json = await response.json();
        result.textContent = JSON.stringify(json, null, 2);

        if (!response.ok) {
          return;
        }

        link.href = json.checkoutUrl;
        link.hidden = false;
      } catch (error) {
        result.textContent = error instanceof Error ? error.message : "Falha ao criar checkout.";
      } finally {
        button.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}
