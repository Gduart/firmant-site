export function getRequestContext(request: Request) {
  return {
    ipAddress:
      request.headers.get("cf-connecting-ip")
      ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? null,
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  if (origin !== new URL(request.url).origin) {
    return Response.json(
      { error: "Origem da solicitação não autorizada." },
      { status: 403 },
    );
  }

  return null;
}
