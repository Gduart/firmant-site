import { getPublicReview } from "@/lib/reviews/repository";
type RouteContext = { params: Promise<{ token: string }> };
export async function GET(_request: Request, context: RouteContext) { const { token } = await context.params; const review = await getPublicReview(token); if (!review) return Response.json({ error: "Revisão não encontrada." }, { status: 404 }); if (review.expired) return Response.json({ error: "Este link expirou." }, { status: 410 }); return Response.json(review, { headers: { "Cache-Control": "no-store" } }); }
