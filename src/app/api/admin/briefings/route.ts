import {
  assertFirmantAdminRequest,
  getAdminActor,
} from "@/lib/admin/firmant-admin-auth";
import {
  createBriefingLink,
  listBriefings,
} from "@/lib/briefings/repository";
import { getEnvValue } from "@/lib/cloudflare-runtime";
import { assertSameOrigin } from "@/lib/workflow/request-context";

export async function GET(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const briefings = await listBriefings({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return Response.json({ briefings });
}

export async function POST(request: Request) {
  const authError = await assertFirmantAdminRequest(request);
  if (authError) return authError;
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  try {
    const body = await request.json();
    const result = await createBriefingLink({
      responsibleName: String(body?.responsibleName ?? ""),
      email: String(body?.email ?? ""),
      createdBy: getAdminActor(request),
    });
    const baseUrl = await getEnvValue("APP_BASE_URL") ?? new URL(request.url).origin;
    return Response.json({
      briefing: result.briefing,
      publicUrl: `${baseUrl.replace(/\/$/, "")}/briefing/${result.token}`,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao criar briefing." },
      { status: 400 },
    );
  }
}
