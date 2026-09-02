import { serveProposalMedia } from "@/lib/proposals/media-response";

type RouteContext = { params: Promise<{ token: string; assetId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token, assetId } = await context.params;
  return serveProposalMedia(request, token, assetId);
}
