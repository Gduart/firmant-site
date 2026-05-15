import type { Metadata } from "next";

import { CommercialAdminClient } from "@/app/admin/CommercialAdminClient";

export const metadata: Metadata = {
  title: "Admin Pedidos | FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPedidosPage() {
  return <CommercialAdminClient mode="pedidos" />;
}

