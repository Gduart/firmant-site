import { getTrackingConfig } from "@/lib/tracking/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getTrackingConfig(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
