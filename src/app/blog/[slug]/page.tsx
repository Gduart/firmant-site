import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/* eslint-disable @next/next/no-img-element */

import { BlogContent } from "@/components/blog/BlogContent";
import {
  getPublishedBlogPostBySlug,
  listPublishedBlogPosts,
} from "@/lib/blog/blog-repository";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await safeGetPost(slug);

  if (!post) {
    return {
      title: "Artigo não encontrado — FIRMANT",
    };
  }

  return {
    title: post.seoTitle || `${post.title} — Blog FIRMANT`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.publishedAt ?? post.createdAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await safeGetPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = (await safeListPublishedPosts())
    .filter((item) => item.id !== post.id)
    .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <article style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 140, paddingBottom: 72 }}>
        <div className="blog-shell">
          <Link href="/blog" className="blog-back-link">Voltar ao Blog</Link>
          <span className="blog-kicker">{post.category}</span>
          <h1 className="blog-post-title">{post.title}</h1>
          <p className="blog-hero-copy">{post.excerpt}</p>
          <div className="blog-post-meta">
            <span>{post.author}</span>
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          </div>
        </div>
      </section>

      <div className="blog-post-cover">
        <img src={post.coverImage} alt={post.coverAlt} />
      </div>

      <section style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="blog-article-shell">
          <BlogContent content={post.content} />

          {post.tags.length > 0 && (
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className="blog-post-cta">
            <span>Próximo passo</span>
            <h2>Transforme estratégia em execução.</h2>
            <p>
              Monte um pacote com redes sociais, vídeos, UGC, desenvolvimento e IA
              de acordo com a necessidade do seu negócio.
            </p>
            <Link href="/monte-seu-pacote">Montar meu pacote digital</Link>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="blog-shell" style={{ marginTop: 72 }}>
            <h2 className="blog-related-title">Leia também</h2>
            <div className="blog-grid">
              {relatedPosts.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="blog-card">
                  <img src={item.coverImage} alt={item.coverAlt} />
                  <div>
                    <span>{item.category}</span>
                    <h2>{item.title}</h2>
                    <p>{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}

async function safeGetPost(slug: string) {
  try {
    return await getPublishedBlogPostBySlug(slug);
  } catch {
    return null;
  }
}

async function safeListPublishedPosts() {
  try {
    return await listPublishedBlogPosts();
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
