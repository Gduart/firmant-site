import type { Metadata } from "next";
import { Suspense } from "react";
import { ProposalPublicClient } from "@/app/proposta/[token]/ProposalPublicClient";

export const metadata: Metadata = {
  title: "Proposta comercial | FIRMANT",
  robots: { index: false, follow: false },
};

export default function PublicProposalPage() {
  return (
    <Suspense fallback={<ProposalLoading />}>
      <ProposalPublicClient />
    </Suspense>
  );
}

function ProposalLoading() {
  return <main className="proposal-public-page"><section className="proposal-public-shell proposal-expired"><span>FIRMANT</span><h1>Carregando proposta...</h1></section></main>;
}
