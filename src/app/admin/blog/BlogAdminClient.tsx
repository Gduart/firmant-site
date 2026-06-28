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

const MAX_COVER_BYTES = 500 * 1024;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const COVER_SIZES = [
  { width: 1600, height: 900 },
  { width: 1440, height: 810 },
  { width: 1280, height: 720 },
];
const WEBP_QUALITIES = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46];
const ALLOWED_SOURCE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function BlogAdminClient() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
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

  async function uploadCoverImage(file: File) {
    if (!token) {
      setErrorMessage("Informe o token administrativo.");
      return;
    }

    setIsUploadingCover(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const converted = await convertCoverToWebp(file);
      const imageFormData = new FormData();
      imageFormData.set("file", converted.blob, "capa.webp");
      imageFormData.set(
        "slug",
        form.slug || normalizeSlug(form.title) || "capa-blog",
      );

      const response = await fetch("/api/admin/blog/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao enviar imagem.");
      }

      setForm((current) => ({
        ...current,
        coverImage: data.url,
      }));
      setStatusMessage(
        `Capa convertida para WebP (${converted.width}x${converted.height}, `
        + `${formatFileSize(converted.blob.size)}) e salva com sucesso.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar imagem.",
      );
    } finally {
      setIsUploadingCover(false);
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
              <div className="blog-admin-image-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploadingCover}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      void uploadCoverImage(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
                <strong>
                  {isUploadingCover
                    ? "Convertendo e enviando..."
                    : "Selecione JPG, PNG ou WebP"}
                </strong>
              </div>
              <input
                value={form.coverImage}
                onChange={(event) => updateField("coverImage", event.target.value)}
                placeholder="O endereço será preenchido após o upload"
              />
              <small className="blog-admin-help">
                O painel recorta a imagem em 16:9, converte para WebP, reduz para
                no máximo 500 KB, salva e preenche o endereço automaticamente.
                A imagem original pode ser JPG, PNG ou WebP de até 15 MB.
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
              <small className="blog-admin-help">
                Formatação disponível: ## seção, ### subtítulo, - lista,
                1. lista numerada, &gt; citação, --- separador e tabelas no
                padrão Markdown. Separe cada bloco com uma linha em branco.
              </small>
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

async function convertCoverToWebp(file: File) {
  if (!ALLOWED_SOURCE_TYPES.has(file.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WebP.");
  }

  if (file.size === 0 || file.size > MAX_SOURCE_BYTES) {
    throw new Error("A imagem original deve ter no máximo 15 MB.");
  }

  const bitmap = await createImageBitmap(file);

  try {
    for (const size of COVER_SIZES) {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Seu navegador não conseguiu processar a imagem.");
      }

      const scale = Math.max(
        size.width / bitmap.width,
        size.height / bitmap.height,
      );
      const renderedWidth = bitmap.width * scale;
      const renderedHeight = bitmap.height * scale;
      const offsetX = (size.width - renderedWidth) / 2;
      const offsetY = (size.height - renderedHeight) / 2;

      context.drawImage(
        bitmap,
        offsetX,
        offsetY,
        renderedWidth,
        renderedHeight,
      );

      for (const quality of WEBP_QUALITIES) {
        const blob = await canvasToWebp(canvas, quality);
        if (blob.size <= MAX_COVER_BYTES) {
          return {
            blob,
            width: size.width,
            height: size.height,
          };
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new Error(
    "Não foi possível reduzir a imagem para 500 KB. Escolha uma imagem mais simples.",
  );
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== "image/webp") {
        reject(new Error("Seu navegador não oferece conversão para WebP."));
        return;
      }

      resolve(blob);
    }, "image/webp", quality);
  });
}

function formatFileSize(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
