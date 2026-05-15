import { assertAdminRequest } from "@/lib/admin/admin-auth";
import {
  listAllBlogPosts,
  upsertBlogPost,
} from "@/lib/blog/blog-repository";
import { validateBlogPostPayload } from "@/lib/blog/blog-validation";

export async function GET(request: Request) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  try {
    const posts = await listAllBlogPosts();
    return Response.json({ posts });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao listar posts do blog.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  try {
    const payload = await request.json();
    const input = validateBlogPostPayload(payload);
    const post = await upsertBlogPost(input);

    return Response.json({ post });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao salvar post do blog.",
      },
      { status: 400 },
    );
  }
}
