import type { Metadata } from "next";

import { CommercialAdminClient } from "@/app/admin/CommercialAdminClient";

export const metadata: Metadata = {
  title: "Admin Contratos | FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminContratosPage() {
  return <CommercialAdminClient mode="contratos" />;
}

