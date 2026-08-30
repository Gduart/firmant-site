import type { Metadata } from "next";

import { WorkflowAdminClient } from "@/app/admin/workflow/WorkflowAdminClient";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Solicitação | Admin FIRMANT",
  robots: { index: false, follow: false },
};

export default async function AdminBriefingDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <WorkflowAdminClient mode="briefing" id={id} />;
}
