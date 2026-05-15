import type { Metadata } from "next";

import { CommercialAdminClient } from "@/app/admin/CommercialAdminClient";

export const metadata: Metadata = {
  title: "Admin Clientes | FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminClientesPage() {
  return <CommercialAdminClient mode="clientes" />;
}

