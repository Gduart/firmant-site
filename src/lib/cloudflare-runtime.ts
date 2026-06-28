import { getCloudflareContext } from "@opennextjs/cloudflare";

type RuntimeEnv = CloudflareEnv & Record<string, unknown>;
type D1StatementResult<T> = {
  results: T[];
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T>(): Promise<D1StatementResult<T>>;
};

export type FirmantD1Database = {
  prepare(query: string): D1PreparedStatement;
};

type KvPutOptions = {
  metadata?: Record<string, string>;
};

export type FirmantKvNamespace = {
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  put(
    key: string,
    value: ArrayBuffer,
    options?: KvPutOptions,
  ): Promise<void>;
};

export async function getRuntimeEnv(): Promise<RuntimeEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as RuntimeEnv;
  } catch {
    return {} as RuntimeEnv;
  }
}

export async function getEnvValue(name: string) {
  const runtimeEnv = await getRuntimeEnv();
  const runtimeValue = runtimeEnv[name];

  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return runtimeValue;
  }

  const processValue = process.env[name];

  if (processValue && processValue.length > 0) {
    return processValue;
  }

  return undefined;
}

export async function getRequiredEnvValue(name: string) {
  const value = await getEnvValue(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function getD1Database() {
  const runtimeEnv = await getRuntimeEnv();
  const database = runtimeEnv.FIRMANT_DB;

  if (!database) {
    throw new Error("Cloudflare D1 binding `FIRMANT_DB` is not configured.");
  }

  return database as FirmantD1Database;
}

export async function getBlogImagesStore() {
  const runtimeEnv = await getRuntimeEnv();
  const store = runtimeEnv.BLOG_IMAGES;

  if (!store) {
    throw new Error("Cloudflare KV binding `BLOG_IMAGES` is not configured.");
  }

  return store as FirmantKvNamespace;
}
