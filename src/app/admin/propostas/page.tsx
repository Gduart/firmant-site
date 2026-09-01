import type { Metadata } from "next";
import { ProposalAdminClient } from "@/app/admin/propostas/ProposalAdminClient";

export const metadata: Metadata = {
  title: "Propostas | Admin FIRMANT",
  robots: { index: false, follow: false },
};

export default function ProposalsPage() {
  return <ProposalAdminClient mode="list" />;
}
