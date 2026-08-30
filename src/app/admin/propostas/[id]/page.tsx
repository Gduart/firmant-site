import type { Metadata } from "next";
import { ProposalAdminClient } from "@/app/admin/propostas/ProposalAdminClient";

export const metadata: Metadata = {
  title: "Editar proposta | Admin FIRMANT",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ProposalPage({ params }: PageProps) {
  const { id } = await params;
  return <ProposalAdminClient mode="editor" id={id} />;
}
