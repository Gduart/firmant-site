import type { Metadata } from "next";
import { ReviewAdminClient } from "@/app/admin/conteudos/ReviewAdminClient";
export const metadata: Metadata = { title: "Conteúdos | Admin FIRMANT", robots: { index: false, follow: false } };
export default function ContentsPage() { return <ReviewAdminClient mode="list" />; }
