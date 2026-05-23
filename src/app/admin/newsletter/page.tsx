import type { Metadata } from "next";

import { CommercialAdminClient } from "@/app/admin/CommercialAdminClient";

export const metadata: Metadata = {
  title: "Admin Newsletter | FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewsletterPage() {
  return <CommercialAdminClient mode="newsletter" />;
}
