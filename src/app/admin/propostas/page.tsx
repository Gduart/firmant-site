import type { Metadata } from "next";
import { ProposalAdminClient } from "@/app/admin/propostas/ProposalAdminClient";

export const metadata: Metadata = {
  title: "Propostas | Admin FIRMANT",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ briefingId?: string }> };

export default async function ProposalsPage({ searchParams }: PageProps) {
  const { briefingId } = await searchParams;
  return <ProposalAdminClient mode="list" briefingId={briefingId} />;
}
