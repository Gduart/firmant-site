import { assertFirmantAdminRequest } from "@/lib/admin/firmant-admin-auth";
import { listReviewProjects } from "@/lib/reviews/repository";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  return Response.json({ projects: await listReviewProjects() });
}
