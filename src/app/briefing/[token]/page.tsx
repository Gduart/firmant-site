import type { Metadata } from "next";

import { BriefingClient } from "@/app/briefing/[token]/BriefingClient";

type PageProps = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Briefing de Projeto | FIRMANT",
  description: "Formulário seguro para detalhamento de uma solicitação comercial.",
  robots: { index: false, follow: false },
};

export default async function BriefingPage({ params }: PageProps) {
  const { token } = await params;
  return <BriefingClient token={token} />;
}
