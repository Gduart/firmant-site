import type { Metadata } from "next";

import { BlogAdminClient } from "@/app/admin/blog/BlogAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Blog — FIRMANT",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogAdminPage() {
  return <BlogAdminClient />;
}
