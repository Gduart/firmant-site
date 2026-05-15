import type { Metadata } from "next";

import { CommercialAdminClient } from "@/app/admin/CommercialAdminClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Admin Cliente | FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminClientePage({ params }: PageProps) {
  const { id } = await params;
  return <CommercialAdminClient mode="cliente" id={id} />;
}

