type D1Result<T> = { results: T[] };
type Statement = { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; all<T>(): Promise<D1Result<T>>; run(): Promise<unknown> };
type D1Database = { prepare(sql: string): Statement };
type R2Object = { body: ReadableStream; size: number; range?: { offset: number; length: number }; writeHttpMetadata(headers: Headers): void };
type R2Bucket = { get(key: string, options?: { range?: Headers }): Promise<R2Object | null> };
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
    env.FIRMANT_DB.prepare(`SELECT pm.id AS milestone_id, o.checkoutUrl AS checkout_url, pm.order_id, pm.status, pm.payment_method
      FROM proposal_payment_milestones pm LEFT JOIN orders o ON o.id = pm.order_id
      WHERE pm.proposal_id = ? ORDER BY pm.position LIMIT 1`).bind(link.proposal_id).first(),
    env.FIRMANT_DB.prepare("SELECT id, project_number, status FROM projects WHERE proposal_id = ? LIMIT 1").bind(link.proposal_id).first(),
    env.FIRMANT_DB.prepare(`SELECT a.id, a.title, a.asset_type AS assetType, a.status, av.version_number AS versionNumber,
      av.caption, av.mime_type AS mimeType, av.size_bytes AS sizeBytes
      FROM projects pr JOIN assets a ON a.project_id = pr.id JOIN asset_versions av ON av.id = a.current_version_id
      WHERE pr.proposal_id = ? AND a.status = 'APPROVED' AND av.processing_status = 'READY'
      ORDER BY a.updated_at DESC`).bind(link.proposal_id).all(),
  ]);

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
    payment: payment ?? null,
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

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
