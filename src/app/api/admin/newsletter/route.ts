import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { listNewsletterSubscribers } from "@/lib/newsletter/repository";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const subscribers = await listNewsletterSubscribers({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });

  return Response.json({ subscribers });
}
