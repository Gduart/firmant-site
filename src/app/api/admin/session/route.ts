import {
  clearFirmantAdminSessionCookie,
  createFirmantAdminSessionCookie,
  verifyFirmantAdminCredentials,
} from "@/lib/admin/firmant-admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = String(body?.user ?? "").trim();
    const password = String(body?.password ?? "");
    const result = await verifyFirmantAdminCredentials(user, password);

    if (!result.ok) {
      return result.response;
    }

    return Response.json(
      { ok: true, user: result.user },
      {
        headers: {
          "Set-Cookie": await createFirmantAdminSessionCookie(request, result.user),
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Falha ao iniciar sessão administrativa." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearFirmantAdminSessionCookie(request),
      },
    },
  );
}
