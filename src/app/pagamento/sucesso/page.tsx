import Link from "next/link";

import { getOrderStatus } from "@/lib/payments/payment-service";
import type { OrderStatus } from "@/lib/payments/types";

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PagamentoSucessoPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const status = orderId ? await getOrderStatus(orderId) : null;
  const copy = getSuccessCopy(status?.order?.status);

  return (
    <OutcomeLayout
      title={copy.title}
      description={copy.description}
      orderId={orderId ?? null}
    />
  );
}

function getSuccessCopy(status?: OrderStatus) {
  switch (status) {
    case "PAYMENT_RECEIVED":
      return {
        title: "Pagamento recebido com sucesso",
        description:
          "Recebemos a confirmação do pagamento pelo Asaas. Em breve nossa equipe entrará em contato para iniciar o atendimento.",
      };
    case "PAYMENT_CONFIRMED":
      return {
        title: "Pagamento confirmado com sucesso",
        description:
          "O pagamento foi confirmado pelo Asaas. A compensação financeira seguirá os prazos da forma de pagamento escolhida.",
      };
    case "AWAITING_PIX":
      return {
        title: "Aguardando pagamento Pix",
        description:
          "O pedido foi criado e aguardamos a confirmação do Pix pelo Asaas. Assim que o pagamento for recebido, o status será atualizado automaticamente.",
      };
    case "AWAITING_PAYMENT":
    case "CHECKOUT_CREATED":
      return {
        title: "Pagamento iniciado com sucesso",
        description:
          "Seu checkout foi criado corretamente. O status final será confirmado pela sincronização segura com o Asaas.",
      };
    default:
      return {
        title: "Pedido recebido com sucesso",
        description:
          "Recebemos o retorno do checkout. Acompanhe o status do pedido para ver a atualização mais recente do pagamento.",
      };
  }
}

function OutcomeLayout({
  title,
  description,
  orderId,
}: {
  title: string;
  description: string;
  orderId: string | null;
}) {
  const statusHref = orderId ? `/pagamento/status/${orderId}` : "/monte-seu-pacote";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "140px 24px 80px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "16px" }}>
          {title}
        </h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "28px" }}>
          {description}
        </p>
        <Link href={statusHref} style={linkStyle}>
          {orderId ? "Ver status do pedido" : "Voltar ao wizard"}
        </Link>
      </div>
    </div>
  );
}

const linkStyle = {
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
