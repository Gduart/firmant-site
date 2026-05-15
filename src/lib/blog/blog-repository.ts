import {
  allStatement,
  firstStatement,
  nowIso,
  runStatement,
} from "@/lib/payments/repository-helpers";
import type { BlogPost, BlogPostInput, BlogPostRow } from "@/lib/blog/types";

const PUBLIC_COLUMNS = `
  id,
  slug,
  title,
  excerpt,
  coverImage,
  coverAlt,
  category,
  tags,
  content,
  status,
  author,
  seoTitle,
  seoDescription,
  publishedAt,
  createdAt,
  updatedAt
`;

export async function listPublishedBlogPosts() {
  const rows = await allStatement<BlogPostRow>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM blog_posts
     WHERE status = 'published'
     ORDER BY COALESCE(publishedAt, createdAt) DESC`,
  );

  return rows.map(mapBlogPostRow);
}

export async function listAllBlogPosts() {
  const rows = await allStatement<BlogPostRow>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM blog_posts
     ORDER BY updatedAt DESC`,
  );

  return rows.map(mapBlogPostRow);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const row = await firstStatement<BlogPostRow>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM blog_posts
     WHERE slug = ? AND status = 'published'
     LIMIT 1`,
    [slug],
  );

  return row ? mapBlogPostRow(row) : null;
}

export async function getBlogPostById(id: string) {
  const row = await firstStatement<BlogPostRow>(
    `SELECT ${PUBLIC_COLUMNS}
     FROM blog_posts
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return row ? mapBlogPostRow(row) : null;
}

export async function upsertBlogPost(input: BlogPostInput) {
  const now = nowIso();
  const id = input.id || crypto.randomUUID();
  const existing = input.id ? await getBlogPostById(input.id) : null;
  const createdAt = existing?.createdAt ?? now;
  const publishedAt = input.status === "published"
    ? input.publishedAt || existing?.publishedAt || now
    : input.publishedAt || null;

  await runStatement(
    `INSERT INTO blog_posts (
      id,
      slug,
      title,
      excerpt,
      coverImage,
      coverAlt,
      category,
      tags,
      content,
      status,
      author,
      seoTitle,
      seoDescription,
      publishedAt,
      createdAt,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      excerpt = excluded.excerpt,
      coverImage = excluded.coverImage,
      coverAlt = excluded.coverAlt,
      category = excluded.category,
      tags = excluded.tags,
      content = excluded.content,
      status = excluded.status,
      author = excluded.author,
      seoTitle = excluded.seoTitle,
      seoDescription = excluded.seoDescription,
      publishedAt = excluded.publishedAt,
      updatedAt = excluded.updatedAt`,
    [
      id,
      input.slug,
      input.title,
      input.excerpt,
      input.coverImage,
      input.coverAlt,
      input.category,
      JSON.stringify(input.tags),
      input.content,
      input.status,
      input.author,
      input.seoTitle || null,
      input.seoDescription || null,
      publishedAt,
      createdAt,
      now,
    ],
  );

  const saved = await getBlogPostById(id);
  if (!saved) {
    throw new Error("Falha ao salvar post do blog.");
  }

  return saved;
}

export async function deleteBlogPost(id: string) {
  await runStatement("DELETE FROM blog_posts WHERE id = ?", [id]);
}

function mapBlogPostRow(row: BlogPostRow): BlogPost {
  return {
    ...row,
    tags: parseTags(row.tags),
  };
}

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}
