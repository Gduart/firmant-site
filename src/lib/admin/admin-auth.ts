import { getEnvValue } from "@/lib/cloudflare-runtime";

export async function assertAdminRequest(request: Request) {
  const expectedToken = await getEnvValue("BLOG_ADMIN_TOKEN");

  if (!expectedToken) {
    return Response.json(
      { error: "BLOG_ADMIN_TOKEN não configurado no ambiente." },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  const headerToken = request.headers.get("x-admin-token")?.trim() ?? "";
  const token = bearerToken || headerToken;

  if (!token || token !== expectedToken) {
    return Response.json(
      { error: "Acesso administrativo não autorizado." },
      { status: 401 },
    );
  }

  return null;
}
