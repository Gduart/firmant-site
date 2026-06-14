import type { Metadata } from "next";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

import { listPublishedBlogPosts } from "@/lib/blog/blog-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog FIRMANT — IA, Marketing e Desenvolvimento",
  description:
    "Conteúdos da FIRMANT sobre marketing digital, inteligência artificial, redes sociais, vídeos, automação e desenvolvimento web/mobile.",
};

export default async function BlogPage() {
  const posts = await safeListPublishedPosts();
  const featuredPost = posts[0] ?? null;
  const otherPosts = featuredPost ? posts.slice(1) : posts;
  const categories = Array.from(new Set(posts.map((post) => post.category)));

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <section style={{ backgroundColor: "var(--bg-secondary)", paddingTop: 140, paddingBottom: 72 }}>
        <div className="blog-shell">
          <span className="blog-kicker">Blog Firmant</span>
          <h1 className="blog-hero-title">
            Estratégia, tecnologia e IA aplicadas ao crescimento digital.
          </h1>
          <p className="blog-hero-copy">
            Guias práticos, análises e ideias para empresas que querem usar conteúdo,
            automação e desenvolvimento com mais clareza operacional.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="blog-shell">
          {categories.length > 0 && (
            <div className="blog-category-row" aria-label="Categorias do blog">
              {categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          )}

          {featuredPost ? (
            <>
              <Link href={`/blog/${featuredPost.slug}`} className="blog-featured-card">
                <div className="blog-featured-media">
                  <img src={featuredPost.coverImage} alt={featuredPost.coverAlt} />
                </div>
                <div className="blog-featured-body">
                  <span>{featuredPost.category}</span>
                  <h2>{featuredPost.title}</h2>
                  <p>{featuredPost.excerpt}</p>
                  <small>{formatDate(featuredPost.publishedAt ?? featuredPost.createdAt)}</small>
                </div>
              </Link>

              {otherPosts.length > 0 && (
                <section className="blog-latest-section">
                  <h2>Últimos artigos</h2>
                  <div className="blog-grid">
                    {otherPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                        <img src={post.coverImage} alt={post.coverAlt} />
                        <div>
                          <span>{post.category}</span>
                          <h2>{post.title}</h2>
                          <p>{post.excerpt}</p>
                          <small>{formatDate(post.publishedAt ?? post.createdAt)}</small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="blog-empty-state">
              <span>Conteúdo em preparação</span>
              <h2>O Blog da Firmant já está estruturado.</h2>
              <p>
                Os primeiros artigos serão publicados pelo painel administrativo.
              </p>
              <Link href="/monte-seu-pacote">Montar meu pacote digital</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
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
