import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PagamentoExpiradoPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const statusHref = orderId ? `/pagamento/status/${orderId}` : "/monte-seu-pacote";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "140px 24px 80px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", marginBottom: "16px" }}>
          Checkout expirado
        </h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "28px" }}>
          O link de pagamento expirou. Gere um novo checkout ou consulte o pedido para retomar a cobrança.
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
