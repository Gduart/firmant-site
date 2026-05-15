import type { BlogPostInput, BlogPostStatus } from "@/lib/blog/types";

const VALID_STATUSES = new Set<BlogPostStatus>(["draft", "published"]);

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function normalizeTagsInput(value: unknown) {
  const rawTags = Array.isArray(value)
    ? value.flatMap((tag) => typeof tag === "string" ? splitTags(tag) : [])
    : typeof value === "string"
      ? splitTags(value)
      : [];

  return Array.from(new Set(
    rawTags
      .map((tag) => tag.trim().replace(/^#+/, ""))
      .map((tag) => tag.replace(/\s+/g, " "))
      .filter((tag) => tag.length >= 2)
      .map((tag) => tag.slice(0, 48)),
  )).slice(0, 12);
}

export function validateBlogPostPayload(payload: unknown): BlogPostInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Dados do post inválidos.");
  }

  const data = payload as Record<string, unknown>;
  const status = normalizeStatus(data.status);
  const title = requiredString(data.title, "Título");
  const slug = normalizeSlug(
    optionalString(data.slug) || title,
  );

  if (!slug) {
    throw new Error("Slug inválido.");
  }

  return {
    id: optionalString(data.id) || undefined,
    slug,
    title,
    excerpt: requiredString(data.excerpt, "Resumo"),
    coverImage: requiredString(data.coverImage, "Imagem de capa"),
    coverAlt: requiredString(data.coverAlt, "Texto alternativo da imagem"),
    category: requiredString(data.category, "Categoria"),
    tags: normalizeTagsInput(data.tags),
    content: requiredString(data.content, "Conteúdo"),
    status,
    author: optionalString(data.author) || "Firmant",
    seoTitle: optionalString(data.seoTitle) || null,
    seoDescription: optionalString(data.seoDescription) || null,
    publishedAt: optionalString(data.publishedAt) || null,
  };
}

function requiredString(value: unknown, label: string) {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new Error(`${label} é obrigatório.`);
  }

  return normalized;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value: unknown): BlogPostStatus {
  return typeof value === "string" && VALID_STATUSES.has(value as BlogPostStatus)
    ? value as BlogPostStatus
    : "draft";
}

function splitTags(value: string) {
  return value
    .replace(/#/g, ",")
    .split(/[,;\n\r]+/);
}
