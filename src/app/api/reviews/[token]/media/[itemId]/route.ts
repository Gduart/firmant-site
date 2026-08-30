import { serveReviewMedia } from "@/lib/reviews/media-response";
type RouteContext = { params: Promise<{ token: string; itemId: string }> };
export async function GET(request: Request, context: RouteContext) { const { token, itemId } = await context.params; return serveReviewMedia(request, token, itemId); }
