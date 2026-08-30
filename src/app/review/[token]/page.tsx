import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewPublicClient } from "@/app/review/[token]/ReviewPublicClient";
import { getPublicReview } from "@/lib/reviews/repository";
export const metadata: Metadata = { title: "Aprovação de conteúdo | FIRMANT", robots: { index: false, follow: false } };
type PageProps = { params: Promise<{ token: string }> };
export default async function ReviewPage({ params }: PageProps) { const { token } = await params; const result = await getPublicReview(token); if (!result) notFound(); return <ReviewPublicClient token={token} result={result} />; }
