"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fmtCurrency } from "@/lib/package-catalog";
import type { PaymentStatusResponse } from "@/lib/payments/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PaymentStatusPage({ params }: PageProps) {
  const [orderId, setOrderId] = useState<string>("");
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const resolvedParams = await params;

      if (cancelled) {
        return;
      }

      setOrderId(resolvedParams.id);

      try {
        const response = await fetch(`/api/payments/status/${resolvedParams.id}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Falha ao carregar status do pedido.");
        }

        if (!cancelled) {
          setStatus(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Falha ao carregar status do pedido.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        padding: "140px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "var(--bg-card)",
          padding: "32px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            marginBottom: "16px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent-gold)",
            fontFamily: "var(--font-body)",
          }}
        >
          Status do pedido
        </span>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            marginBottom: "12px",
          }}
        >
          Acompanhe seu pagamento
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            marginBottom: "28px",
          }}
        >
          Pedido: <strong style={{ color: "var(--text-primary)" }}>{orderId || "..."}</strong>
        </p>

        {loading && (
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Carregando informações do pedido...
          </p>
        )}

        {!loading && error && (
          <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p>
        )}

        {!loading && status?.order && (
          <div style={{ display: "grid", gap: "16px" }}>
            <StatusCard
              label="Aprovação do pagamento"
              value={getPaymentApprovalLabel(status)}
              detail={getPaymentApprovalDetail(status)}
            />
            <StatusCard
              label="Recebimento do saldo"
              value={getSettlementLabel(status)}
              detail={getSettlementDetail(status)}
            />
            <StatusCard
              label="Modelo"
              value={status.order.billingModel === "RECURRING" ? "Assinatura" : "Pagamento avulso"}
            />
            <StatusCard
              label="Valor"
              value={fmtCurrency(status.order.amount)}
            />
            <StatusCard
              label="Cliente"
              value={`${status.order.customerName} • ${status.order.customerEmail}`}
            />

            {status.order.checkoutUrl && canOpenCheckout(status.order.status) && (
              <Link
                href={status.order.checkoutUrl}
                style={primaryLinkStyle}
              >
                Abrir checkout novamente
              </Link>
            )}

            <Link href="/monte-seu-pacote" style={secondaryLinkStyle}>
              Voltar ao wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 18px",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, color: "var(--text-primary)" }}>{value}</p>
      {detail && (
        <p
          style={{
            margin: "6px 0 0",
            color: "var(--text-tertiary)",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          {detail}
        </p>
      )}
    </div>
  );
}

function getPaymentApprovalLabel(status: PaymentStatusResponse) {
  switch (status.order?.status) {
    case "PAYMENT_CONFIRMED":
      return "Pagamento confirmado";
    case "PAYMENT_RECEIVED":
    case "SUBSCRIPTION_ACTIVE":
      return "Pagamento recebido";
    case "AWAITING_PIX":
      return "Aguardando pagamento Pix";
    case "AWAITING_BOLETO":
      return "Aguardando boleto";
    case "AWAITING_PAYMENT":
    case "CHECKOUT_CREATED":
      return "Aguardando pagamento";
    case "OVERDUE":
      return "Pagamento vencido";
    case "CANCELED":
      return "Pagamento cancelado";
    case "REFUNDED":
      return "Pagamento estornado";
    case "FAILED":
      return "Pagamento não aprovado";
    default:
      return "Pedido criado";
  }
}

function getPaymentApprovalDetail(status: PaymentStatusResponse) {
  const latestPayment = getLatestPayment(status);

  if (status.order?.billingModel === "RECURRING") {
    return status.order.status === "PAYMENT_CONFIRMED" ||
      status.order.status === "SUBSCRIPTION_ACTIVE"
      ? "A assinatura está ativa após confirmação da cobrança inicial."
      : "A assinatura será ativada quando o Asaas confirmar a cobrança inicial.";
  }

  if (latestPayment?.providerStatus === "CONFIRMED") {
    return "Cartão aprovado pelo Asaas. O saldo segue o prazo de recebimento da forma de pagamento.";
  }

  if (isReceivedStatus(latestPayment?.providerStatus)) {
    return "Pagamento recebido pelo Asaas.";
  }

  return "O status será atualizado automaticamente pelos webhooks do Asaas.";
}

function getSettlementLabel(status: PaymentStatusResponse) {
  if (status.payments.length === 0) {
    return "Sem cobrança confirmada";
  }

  if (status.payments.every((payment) => isReceivedStatus(payment.providerStatus))) {
    return "Saldo recebido";
  }

  if (status.payments.some((payment) => payment.providerStatus === "CONFIRMED")) {
    return "Saldo a receber";
  }

  return "Aguardando confirmação";
}

function getSettlementDetail(status: PaymentStatusResponse) {
  const latestPayment = getLatestPayment(status);

  if (!latestPayment) {
    return "Ainda não há cobrança vinculada ao pedido.";
  }

  if (isReceivedStatus(latestPayment.providerStatus)) {
    return latestPayment.paidAt
      ? `Recebido em ${formatDate(latestPayment.paidAt)}.`
      : "Valor recebido pelo Asaas.";
  }

  if (latestPayment.providerStatus === "CONFIRMED") {
    return latestPayment.paidAt
      ? `Pagamento confirmado em ${formatDate(latestPayment.paidAt)}. O Asaas ainda não enviou status de saldo recebido.`
      : "Pagamento aprovado. O Asaas ainda não enviou status de saldo recebido.";
  }

  return latestPayment.dueDate
    ? `Cobrança em aberto com vencimento em ${formatDate(latestPayment.dueDate)}.`
    : "Cobrança em aberto.";
}

function getLatestPayment(status: PaymentStatusResponse) {
  return status.payments[0] ?? null;
}

function isReceivedStatus(providerStatus?: string | null) {
  return providerStatus === "RECEIVED" || providerStatus === "RECEIVED_IN_CASH";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date(`${value}T00:00:00-03:00`));
}

function canOpenCheckout(status: string) {
  return ![
    "PAYMENT_CONFIRMED",
    "PAYMENT_RECEIVED",
    "SUBSCRIPTION_ACTIVE",
    "REFUNDED",
    "CANCELED",
  ].includes(status);
}

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: "999px",
  backgroundColor: "var(--accent-gold)",
  color: "var(--navy-950)",
  textDecoration: "none",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  fontSize: "12px",
  fontFamily: "var(--font-body)",
};

const secondaryLinkStyle = {
  ...primaryLinkStyle,
  backgroundColor: "transparent",
  color: "var(--text-primary)",
  border: "1px solid rgba(255,255,255,0.12)",
};
