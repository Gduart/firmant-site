import { getRequiredEnvValue } from "@/lib/cloudflare-runtime";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export class AsaasApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "AsaasApiError";
    this.status = status;
    this.details = details;
  }
}

export async function asaasRequest<T>(path: string, options: RequestOptions = {}) {
  const [baseUrl, apiKey] = await Promise.all([
    getRequiredEnvValue("ASAAS_API_BASE_URL"),
    getRequiredEnvValue("ASAAS_API_KEY"),
  ]);

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "FirmantSite/1.0 (+https://firmant.com.br)",
      access_token: apiKey,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    // Read once: json() consumes the body even when parsing fails (e.g. HTML 502).
    const responseText = await response.text();
    let details: unknown = responseText;

    try {
      details = JSON.parse(responseText);
    } catch {
      // Preserve non-JSON details for the log and use the controlled HTTP fallback.
    }

    console.error("Asaas API error", {
      path,
      status: response.status,
      details,
    });

    const apiMessage = getAsaasErrorMessage(details);

    throw new AsaasApiError(
      apiMessage || `O Asaas recusou a solicitação (${response.status}).`,
      response.status,
      details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getAsaasErrorMessage(details: unknown) {
  if (!details || typeof details !== "object") return "";
  const errors = (details as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return "";
  return errors
    .map((item) => item && typeof item === "object" ? String((item as { description?: unknown }).description ?? "") : "")
    .filter(Boolean)
    .join(" ");
}
