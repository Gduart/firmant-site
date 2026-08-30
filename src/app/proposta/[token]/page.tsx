import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalPublicClient } from "@/app/proposta/[token]/ProposalPublicClient";
import { getPublicProposal } from "@/lib/proposals/repository";

export const metadata: Metadata = {
  title: "Proposta comercial | FIRMANT",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ token: string }> };

export default async function PublicProposalPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getPublicProposal(token);
  if (!result) notFound();
  return <ProposalPublicClient token={token} result={result} />;
}
