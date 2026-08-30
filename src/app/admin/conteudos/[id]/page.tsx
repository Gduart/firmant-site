import type { Metadata } from "next";
import { ReviewAdminClient } from "@/app/admin/conteudos/ReviewAdminClient";
export const metadata: Metadata = { title: "Projeto de conteúdo | Admin FIRMANT", robots: { index: false, follow: false } };
type PageProps = { params: Promise<{ id: string }> };
export default async function ContentProjectPage({ params }: PageProps) { const { id } = await params; return <ReviewAdminClient mode="project" id={id} />; }
