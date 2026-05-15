import { getEnvValue } from "@/lib/cloudflare-runtime";

const SESSION_COOKIE = "firmant_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  user: string;
  exp: number;
};

export async function assertFirmantAdminRequest(request: Request) {
  const sessionUser = await getFirmantAdminSessionUser(request);

  if (sessionUser) {
    return null;
  }

  const credentials = parseBasicCredentials(request.headers.get("authorization"));
  const headerUser = request.headers.get("x-admin-user")?.trim() ?? "";
  const headerPassword = request.headers.get("x-admin-password")?.trim() ?? "";
  const user = credentials?.user || headerUser;
  const password = credentials?.password || headerPassword;
  const result = await verifyFirmantAdminCredentials(user, password);

  if (result.ok) {
    return null;
  }

  return result.response;
}

export async function verifyFirmantAdminCredentials(user: string, password: string) {
  const expectedUser = await getEnvValue("FIRMANT_ADMIN_USER");
  const expectedPassword = await getEnvValue("FIRMANT_ADMIN_PASSWORD");

  if (!expectedUser || !expectedPassword) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "FIRMANT_ADMIN_USER/FIRMANT_ADMIN_PASSWORD não configurados." },
        { status: 503 },
      ),
    };
  }

  if (user !== expectedUser || password !== expectedPassword) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "Acesso administrativo não autorizado." },
        { status: 401 },
      ),
    };
  }

  return { ok: true as const, user: expectedUser };
}

export function getAdminActor(request: Request) {
  const credentials = parseBasicCredentials(request.headers.get("authorization"));
  return credentials?.user || request.headers.get("x-admin-user")?.trim() || "FIRMANT_ADMIN";
}

export async function createFirmantAdminSessionCookie(request: Request, user: string) {
  const payload: AdminSessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signSessionPayload(encodedPayload);
  const secure = new URL(request.url).protocol === "https:" ? "Secure" : "";

  return [
    `${SESSION_COOKIE}=${encodedPayload}.${signature}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    secure.trim(),
  ].filter(Boolean).join("; ");
}

export function clearFirmantAdminSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "Secure" : "";

  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
    secure.trim(),
  ].filter(Boolean).join("; ");
}

async function getFirmantAdminSessionUser(request: Request) {
  const rawCookie = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE);

  if (!rawCookie) {
    return null;
  }

  const [encodedPayload, signature] = rawCookie.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signSessionPayload(encodedPayload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;

    if (!payload.user || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    const expectedUser = await getEnvValue("FIRMANT_ADMIN_USER");

    return payload.user === expectedUser ? payload.user : null;
  } catch {
    return null;
  }
}

function parseBasicCredentials(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length).trim());
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function getCookieValue(header: string | null, name: string) {
  if (!header) {
    return null;
  }

  const prefix = `${name}=`;
  const item = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

async function signSessionPayload(encodedPayload: string) {
  const password = await getEnvValue("FIRMANT_ADMIN_PASSWORD");

  if (!password) {
    return "";
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncode(value: string) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}
