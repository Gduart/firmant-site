"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  normalizeSlug,
  normalizeTagsInput,
} from "@/lib/blog/blog-validation";
import type { BlogPost, BlogPostStatus } from "@/lib/blog/types";

type BlogPostForm = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string;
  content: string;
  status: BlogPostStatus;
  author: string;
  seoTitle: string;
  seoDescription: string;
};

const emptyForm: BlogPostForm = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "/hero-poster.jpg",
  coverAlt: "",
  category: "Marketing Digital",
  tags: "",
  content: "",
  status: "published",
  author: "Firmant",
  seoTitle: "",
  seoDescription: "",
};

const categories = [
  "Marketing Digital",
  "Redes Sociais",
  "Vídeos e UGC",
  "Inteligência Artificial",
  "Desenvolvimento Web",
  "Automação",
  "Cases e Guias",
];

export function BlogAdminClient() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const previewTags = useMemo(
    () => normalizeTagsInput(form.tags),
    [form.tags],
  );

  const loadPosts = useCallback(async (authToken = token) => {
    if (!authToken) {
      setErrorMessage("Informe o token administrativo.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/blog/posts", {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao carregar posts.");
      }

      window.sessionStorage.setItem("firmant-blog-admin-token", authToken);
      window.localStorage.removeItem("firmant-blog-admin-token");
      setIsAuthenticated(true);
      setPosts(data.posts ?? []);
      setStatusMessage("Posts carregados.");
    } catch (error) {
      setIsAuthenticated(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar posts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    window.localStorage.removeItem("firmant-blog-admin-token");
    const savedToken = window.sessionStorage.getItem("firmant-blog-admin-token");
    if (savedToken) {
      setToken(savedToken);
      void loadPosts(savedToken);
    }
  }, [loadPosts]);

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Informe o token administrativo.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          id: form.id || undefined,
          slug: form.slug || normalizeSlug(form.title),
          tags: previewTags,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar post.");
      }

      setForm(emptyForm);
      setIsSlugEdited(false);
      setStatusMessage("Post salvo com sucesso.");
      await loadPosts(token);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao salvar post.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem("firmant-blog-admin-token");
    window.localStorage.removeItem("firmant-blog-admin-token");
    setToken("");
    setPosts([]);
    setForm(emptyForm);
    setIsSlugEdited(false);
    setIsAuthenticated(false);
    setStatusMessage("Sessão do Blog encerrada.");
    setErrorMessage("");
  }

  async function deletePost(post: BlogPost) {
    if (!token) {
      setErrorMessage("Informe o token administrativo.");
      return;
    }

    const confirmed = window.confirm(`Excluir o post "${post.title}"?`);
    if (!confirmed) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao excluir post.");
      }

      setStatusMessage("Post excluído.");
      await loadPosts(token);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao excluir post.",
      );
    }
  }

  function editPost(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      coverAlt: post.coverAlt,
      category: post.category,
      tags: post.tags.join(", "),
      content: post.content,
      status: post.status,
      author: post.author,
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
    });
    setIsSlugEdited(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(field: keyof BlogPostForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      slug: field === "title" && !current.id && !isSlugEdited && !current.slug
        ? normalizeSlug(value)
        : current.slug,
    }));

    if (field === "slug") {
      setIsSlugEdited(true);
    }
  }

  function updateSlug(value: string) {
    setIsSlugEdited(true);
    setForm((current) => ({
      ...current,
      slug: normalizeSlug(value),
    }));
  }

  function regenerateSlug() {
    setIsSlugEdited(false);
    setForm((current) => ({
      ...current,
      slug: normalizeSlug(current.title),
    }));
  }

  async function uploadCoverImage(file: File | null) {
    if (!file) {
      return;
    }

    if (!token || !isAuthenticated) {
      setErrorMessage("Entre com o token administrativo antes de enviar imagens.");
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await validateCoverImageDimensions(file);

      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/blog/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao enviar imagem.");
      }

      updateField("coverImage", data.url);
      setStatusMessage("Imagem enviada e aplicada na capa do post.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar imagem.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="blog-admin-page">
      <section className="blog-admin-shell">
        <div className="blog-admin-header">
          <div>
            <span className="blog-kicker">Admin Blog</span>
            <h1>Publicação de artigos da Firmant.</h1>
            <p>
              Crie rascunhos, publique posts, configure imagem de capa, SEO,
              categorias e hashtags sem editar código.
            </p>
          </div>
          <div className="blog-admin-auth">
            <label htmlFor="admin-token">Token administrativo</label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="BLOG_ADMIN_TOKEN"
            />
            <button type="button" onClick={() => void loadPosts()} disabled={isLoading}>
              {isLoading ? "Carregando..." : "Entrar"}
            </button>
            {isAuthenticated && (
              <button type="button" onClick={logout}>
                Sair
              </button>
            )}
          </div>
        </div>

        {errorMessage && <div className="blog-admin-alert blog-admin-alert-error">{errorMessage}</div>}
        {statusMessage && <div className="blog-admin-alert blog-admin-alert-success">{statusMessage}</div>}

        {!isAuthenticated ? (
          <div className="blog-admin-auth-required">
            <h2>Acesso restrito</h2>
            <p>
              Informe o token administrativo para carregar, criar, editar ou excluir posts do Blog.
            </p>
          </div>
        ) : (
        <div className="blog-admin-grid">
          <form className="blog-admin-form" onSubmit={savePost}>
            <div className="blog-admin-form-title">
              <h2>{form.id ? "Editar post" : "Novo post"}</h2>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setIsSlugEdited(false);
                }}
              >
                Limpar
              </button>
            </div>

            <Field label="Título">
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Título do artigo"
              />
            </Field>

            <Field label="Slug">
              <div className="blog-admin-slug-row">
                <input
                  value={form.slug}
                  onChange={(event) => updateSlug(event.target.value)}
                  placeholder="url-do-artigo"
                />
                <button type="button" onClick={regenerateSlug}>
                  Gerar pelo título
                </button>
              </div>
            </Field>

            <Field label="Resumo">
              <textarea
                value={form.excerpt}
                onChange={(event) => updateField("excerpt", event.target.value)}
                rows={3}
                placeholder="Resumo curto para listagem e SEO."
              />
            </Field>

            <div className="blog-admin-two-cols">
              <Field label="Categoria">
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value as BlogPostStatus)}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </Field>
            </div>

            <Field label="Imagem de capa">
              <input
                value={form.coverImage}
                onChange={(event) => updateField("coverImage", event.target.value)}
                placeholder="/blog/minha-imagem.webp ou https://..."
              />
              <input
                type="file"
                accept="image/avif,image/jpeg,image/png,image/webp"
                onChange={(event) => void uploadCoverImage(event.target.files?.[0] ?? null)}
                disabled={isUploadingImage}
              />
              <small className="blog-admin-help">
                Recomendado: 1600x900 px, proporção 16:9, WebP/JPG/PNG/AVIF, até 5 MB.
                {isUploadingImage ? " Enviando imagem..." : ""}
              </small>
            </Field>

            <Field label="Descrição da imagem">
              <input
                value={form.coverAlt}
                onChange={(event) => updateField("coverAlt", event.target.value)}
                placeholder="Texto alternativo para acessibilidade e SEO"
              />
            </Field>

            <Field label="Hashtags">
              <input
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="#IA #marketing-digital #automação ou IA, marketing digital, automação"
              />
            </Field>

            <Field label="Conteúdo">
              <textarea
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                rows={16}
                placeholder={"Use parágrafos separados por linha em branco.\n\n## Subtítulo\n\n- Item de lista"}
              />
            </Field>

            <div className="blog-admin-two-cols">
              <Field label="Autor">
                <input
                  value={form.author}
                  onChange={(event) => updateField("author", event.target.value)}
                />
              </Field>

              <Field label="SEO Title">
                <input
                  value={form.seoTitle}
                  onChange={(event) => updateField("seoTitle", event.target.value)}
                />
              </Field>
            </div>

            <Field label="SEO Description">
              <textarea
                value={form.seoDescription}
                onChange={(event) => updateField("seoDescription", event.target.value)}
                rows={3}
              />
            </Field>

            <button type="submit" className="blog-admin-submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar post"}
            </button>
          </form>

          <aside className="blog-admin-side">
            <div className="blog-admin-preview">
              <span>Prévia</span>
              <img src={form.coverImage || "/hero-poster.jpg"} alt={form.coverAlt || "Prévia do post"} />
              <h2>{form.title || "Título do artigo"}</h2>
              <p>{form.excerpt || "Resumo do artigo aparecerá aqui."}</p>
              <div>
                {previewTags.map((tag) => (
                  <small key={tag}>#{tag}</small>
                ))}
              </div>
            </div>

            <div className="blog-admin-list">
              <h2>Posts cadastrados</h2>
              {posts.length === 0 ? (
                <p>Nenhum post carregado.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="blog-admin-list-item">
                    <span>{post.status === "published" ? "Publicado" : "Rascunho"}</span>
                    <h3>{post.title}</h3>
                    <p>{post.category}</p>
                    <div>
                      <button type="button" onClick={() => editPost(post)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => void deletePost(post)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
        )}
      </section>
    </div>
  );
}

async function validateCoverImageDimensions(file: File) {
  const dimensions = await readImageDimensions(file);
  const ratio = dimensions.width / dimensions.height;
  const targetRatio = 16 / 9;
  const ratioTolerance = 0.04;

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Imagem muito pesada. Envie um arquivo de até 5 MB.");
  }

  if (dimensions.width < 1200 || dimensions.height < 675) {
    throw new Error("Imagem pequena demais. Use pelo menos 1200x675 px; recomendado: 1600x900 px.");
  }

  if (Math.abs(ratio - targetRatio) > ratioTolerance) {
    throw new Error("A imagem precisa estar em proporção 16:9. Recomendado: 1600x900 px.");
  }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler as dimensões da imagem."));
    };
    image.src = url;
  });
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="blog-admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
