type D1Result<T> = { results: T[] };
type Statement = { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; all<T>(): Promise<D1Result<T>>; run(): Promise<unknown> };
type D1Database = { prepare(sql: string): Statement };
type R2Object = { body: ReadableStream; size: number; range?: { offset: number; length: number }; writeHttpMetadata(headers: Headers): void };
type R2Bucket = {
  put(key: string, value: ReadableStream, options?: { httpMetadata?: Record<string, string>; customMetadata?: Record<string, string> }): Promise<unknown>;
  get(key: string, options?: { range?: Headers | { offset: number; length: number } }): Promise<R2Object | null>;
  head(key: string): Promise<{ size: number } | null>;
  delete(key: string): Promise<void>;
};
type Env = { FIRMANT_DB: D1Database; PRIVATE_ASSETS: R2Bucket; APP_BASE_URL: string };
type Context = { waitUntil(promise: Promise<unknown>): void };

const proposalEdge = {
  async fetch(request: Request, env: Env, context: Context) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/proposta/")) {
      const token = url.pathname.slice("/proposta/".length).split("/")[0];
      if (!token) return new Response("Link inválido.", { status: 404 });
      return Response.redirect(`${env.APP_BASE_URL.replace(/\/$/, "")}/proposta.html?token=${encodeURIComponent(token)}`, 307);
    }

    const match = url.pathname.match(/^\/api\/proposals\/([^/]+)(?:\/media\/([^/]+))?$/);
    if (request.method === "GET" && match) {
      const token = decodeURIComponent(match[1]);
      return match[2]
        ? serveMedia(request, env, token, decodeURIComponent(match[2]))
        : serveProposal(env, context, token);
    }

    const uploadMatch = url.pathname.match(/^\/api\/admin\/review-uploads\/([^/]+)\/(\d+)$/);
    if (uploadMatch) {
      if (request.method === "OPTIONS") return uploadPreflight(request, env);
      if (request.method !== "PUT") return withUploadCors(request, env, json({ error: "Método não permitido." }, 405));
      return uploadReviewFile(request, env, decodeURIComponent(uploadMatch[1]), Number(uploadMatch[2]));
    }

    // Decisão, pagamento e PDF continuam no Worker principal.
    return fetch(request);
  },
};

export default proposalEdge;

async function serveProposal(env: Env, context: Context, token: string) {
  if (token.length < 32) return json({ error: "Proposta não encontrada." }, 404);
  const hash = await hashToken(token);
  const link = await env.FIRMANT_DB.prepare(
    "SELECT id, proposal_id, proposal_version_id, expires_at FROM proposal_access_links WHERE token_hash = ? AND active = 1 LIMIT 1",
  ).bind(hash).first<{ id: string; proposal_id: string; proposal_version_id: string; expires_at: string }>();
  if (!link) return json({ error: "Proposta não encontrada." }, 404);
  if (new Date(link.expires_at).getTime() < Date.now()) return json({ error: "Esta proposta expirou." }, 410);

  const version = await env.FIRMANT_DB.prepare(
    "SELECT id, snapshot_json, content_hash, terms_version FROM proposal_versions WHERE id = ? LIMIT 1",
  ).bind(link.proposal_version_id).first<{ id: string; snapshot_json: string; content_hash: string; terms_version: string }>();
  if (!version) return json({ error: "Proposta não encontrada." }, 404);

  const [acceptance, proposal, payment, project, mediaResult] = await Promise.all([
    env.FIRMANT_DB.prepare("SELECT decision, accepted_at FROM proposal_acceptances WHERE proposal_version_id = ? LIMIT 1").bind(version.id).first(),
    env.FIRMANT_DB.prepare("SELECT status FROM proposals WHERE id = ?").bind(link.proposal_id).first<{ status: string }>(),
    env.FIRMANT_DB.prepare(`SELECT pm.id AS milestone_id, o.checkoutUrl AS checkout_url, pm.order_id,
      pm.status, pm.payment_method, o.status AS order_status, o.createdAt AS order_created_at,
      o.asaasCheckoutId AS asaas_checkout_id, o.asaasPaymentId AS asaas_payment_id
      FROM proposal_payment_milestones pm LEFT JOIN orders o ON o.id = pm.order_id
      WHERE pm.proposal_id = ? ORDER BY pm.position LIMIT 1`).bind(link.proposal_id).first(),
    env.FIRMANT_DB.prepare("SELECT id, project_number, status FROM projects WHERE proposal_id = ? LIMIT 1").bind(link.proposal_id).first(),
    env.FIRMANT_DB.prepare(`SELECT a.id, a.title, a.asset_type AS assetType, a.status, av.version_number AS versionNumber,
      av.caption, av.mime_type AS mimeType, av.size_bytes AS sizeBytes
      FROM projects pr JOIN assets a ON a.project_id = pr.id JOIN asset_versions av ON av.id = a.current_version_id
      WHERE pr.proposal_id = ? AND a.status = 'APPROVED' AND av.processing_status = 'READY'
      ORDER BY a.updated_at DESC`).bind(link.proposal_id).all(),
  ]);

  const checkoutExpired = isEdgeCheckoutExpired(payment as EdgePayment | null);
  const publicPayment = payment ? { ...payment, checkout_expired: checkoutExpired, checkout_url: checkoutExpired ? null : (payment as { checkout_url?: string | null }).checkout_url } : null;
  const now = new Date().toISOString();
  context.waitUntil(Promise.all([
    env.FIRMANT_DB.prepare("UPDATE proposal_access_links SET view_count = view_count + 1, first_viewed_at = COALESCE(first_viewed_at, ?), last_viewed_at = ? WHERE id = ?").bind(now, now, link.id).run(),
    env.FIRMANT_DB.prepare("UPDATE proposals SET status = CASE WHEN status = 'SENT' THEN 'VIEWED' ELSE status END, updated_at = ? WHERE id = ?").bind(now, link.proposal_id).run(),
  ]));

  return json({
    expired: false,
    version: { id: version.id, contentHash: version.content_hash, termsVersion: version.terms_version },
    snapshot: JSON.parse(version.snapshot_json),
    acceptance: acceptance ?? null,
    currentStatus: proposal?.status ?? "SENT",
    payment: publicPayment,
    project: project ?? null,
    media: mediaResult.results,
  });
}

async function serveMedia(request: Request, env: Env, token: string, assetId: string) {
  if (token.length < 32 || !assetId) return json({ error: "Mídia não encontrada." }, 404);
  const media = await env.FIRMANT_DB.prepare(`SELECT av.preview_storage_key AS storageKey,
      COALESCE(av.mime_type, 'application/octet-stream') AS mimeType, COALESCE(av.size_bytes, 0) AS sizeBytes
    FROM proposal_access_links pal JOIN projects pr ON pr.proposal_id = pal.proposal_id
    JOIN assets a ON a.project_id = pr.id AND a.id = ? JOIN asset_versions av ON av.id = a.current_version_id
    WHERE pal.token_hash = ? AND pal.active = 1 AND pal.expires_at > ?
      AND a.status = 'APPROVED' AND av.processing_status = 'READY' AND av.preview_storage_key IS NOT NULL LIMIT 1`)
    .bind(assetId, await hashToken(token), new Date().toISOString())
    .first<{ storageKey: string; mimeType: string; sizeBytes: number }>();
  if (!media) return json({ error: "Mídia não encontrada." }, 404);
  const range = request.headers.get("range");
  const object = await env.PRIVATE_ASSETS.get(media.storageKey, range ? { range: new Headers({ Range: range }) } : undefined);
  if (!object) return json({ error: "Mídia não encontrada no storage." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", media.mimeType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  if (object.range) {
    const end = object.range.offset + object.range.length - 1;
    headers.set("Content-Range", `bytes ${object.range.offset}-${end}/${object.size}`);
    headers.set("Content-Length", String(object.range.length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}

type UploadSession = {
  id: string;
  project_id: string;
  asset_type: "IMAGE" | "CAROUSEL" | "VIDEO";
  expected_files_json: string;
  expires_at: string;
};
type UploadDescriptor = { name: string; size: number; mimeType: string };

async function uploadReviewFile(request: Request, env: Env, token: string, position: number) {
  if (!isAllowedUploadOrigin(request, env)) return json({ error: "Origem não autorizada." }, 403);
  if (token.length < 32 || !Number.isInteger(position) || position < 0) {
    return withUploadCors(request, env, json({ error: "Sessão de upload inválida." }, 404));
  }
  const session = await env.FIRMANT_DB.prepare(
    `SELECT id, project_id, asset_type, expected_files_json, expires_at
     FROM review_upload_sessions WHERE token_hash = ? AND status = 'PENDING' LIMIT 1`,
  ).bind(await hashToken(token)).first<UploadSession>();
  if (!session) return withUploadCors(request, env, json({ error: "Sessão de upload não encontrada." }, 404));
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await env.FIRMANT_DB.prepare("UPDATE review_upload_sessions SET status = 'EXPIRED' WHERE id = ?").bind(session.id).run();
    return withUploadCors(request, env, json({ error: "A sessão de upload expirou." }, 410));
  }

  const expectedFiles = JSON.parse(session.expected_files_json) as UploadDescriptor[];
  const expected = expectedFiles[position];
  const declaredSize = Number(request.headers.get("x-file-size"));
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
  if (!expected || !Number.isInteger(declaredSize) || declaredSize !== expected.size || contentType !== expected.mimeType) {
    return withUploadCors(request, env, json({ error: "O arquivo não corresponde à sessão de upload." }, 400));
  }
  if (!request.body) return withUploadCors(request, env, json({ error: "Arquivo vazio." }, 400));

  const storageKey = `reviews/${session.project_id}/uploads/${session.id}/${position}`;
  try {
    await env.PRIVATE_ASSETS.put(storageKey, request.body, {
      httpMetadata: { contentType, contentDisposition: "inline", cacheControl: "private, no-store" },
      customMetadata: { projectId: session.project_id, uploadSessionId: session.id, uploadedAt: new Date().toISOString() },
    });
    const stored = await env.PRIVATE_ASSETS.head(storageKey);
    if (!stored || stored.size !== expected.size) throw new Error("O tamanho armazenado não corresponde ao arquivo enviado.");
    const prefix = await env.PRIVATE_ASSETS.get(storageKey, { range: { offset: 0, length: Math.min(16, stored.size) } });
    const bytes = prefix ? new Uint8Array(await new Response(prefix.body).arrayBuffer()) : new Uint8Array();
    const detected = detectUploadType(bytes, session.asset_type);
    if (!detected || detected.mimeType !== expected.mimeType) throw new Error("O conteúdo do arquivo não corresponde ao formato informado.");

    await env.FIRMANT_DB.prepare(
      `INSERT INTO review_upload_files (session_id, position, storage_key, original_filename, mime_type, size_bytes, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id, position) DO UPDATE SET storage_key = excluded.storage_key,
         original_filename = excluded.original_filename, mime_type = excluded.mime_type,
         size_bytes = excluded.size_bytes, uploaded_at = excluded.uploaded_at`,
    ).bind(session.id, position, storageKey, expected.name, detected.mimeType, stored.size, new Date().toISOString()).run();
    return withUploadCors(request, env, json({ uploaded: true, position, size: stored.size }));
  } catch (error) {
    await env.PRIVATE_ASSETS.delete(storageKey).catch(() => undefined);
    return withUploadCors(
      request,
      env,
      json({ error: error instanceof Error ? error.message : "Falha ao armazenar arquivo." }, 400),
    );
  }
}

function detectUploadType(bytes: Uint8Array, assetType: UploadSession["asset_type"]) {
  if (assetType === "VIDEO") {
    return bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
      ? { mimeType: "video/mp4" }
      : null;
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return { mimeType: "image/png" };
  }
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    ? { mimeType: "image/jpeg" }
    : null;
}

function uploadPreflight(request: Request, env: Env) {
  if (!isAllowedUploadOrigin(request, env)) return json({ error: "Origem não autorizada." }, 403);
  return withUploadCors(request, env, new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-File-Size",
      "Access-Control-Max-Age": "600",
    },
  }));
}

function isAllowedUploadOrigin(request: Request, env: Env) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(env.APP_BASE_URL).origin);
}

function withUploadCors(request: Request, env: Env, response: Response) {
  if (isAllowedUploadOrigin(request, env)) {
    response.headers.set("Access-Control-Allow-Origin", new URL(env.APP_BASE_URL).origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

type EdgePayment = {
  checkout_url?: string | null;
  order_status?: string | null;
  order_created_at?: string | null;
  payment_method?: string | null;
  asaas_checkout_id?: string | null;
  asaas_payment_id?: string | null;
};

function isEdgeCheckoutExpired(payment: EdgePayment | null) {
  if (!payment?.checkout_url) return false;
  if (["FAILED", "CANCELED", "REFUNDED"].includes(payment.order_status ?? "")) return true;
  if (payment.payment_method === "BOLETO") return false;
  if (payment.asaas_payment_id && !payment.asaas_checkout_id) return false;
  if (payment.order_status !== "CHECKOUT_CREATED" || !payment.order_created_at) return false;
  return new Date(payment.order_created_at).getTime() + 180 * 60 * 1000 <= Date.now();
}
