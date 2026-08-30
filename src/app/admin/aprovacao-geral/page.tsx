import type { Metadata } from "next";

import { WorkflowAdminClient } from "@/app/admin/workflow/WorkflowAdminClient";

export const metadata: Metadata = {
  title: "Aprovação Geral | Admin FIRMANT",
  robots: { index: false, follow: false },
};

export default function AdminApprovalPage() {
  return <WorkflowAdminClient mode="briefings" />;
}
