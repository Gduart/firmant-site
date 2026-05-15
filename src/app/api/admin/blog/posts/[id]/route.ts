import { assertAdminRequest } from "@/lib/admin/admin-auth";
import { deleteBlogPost } from "@/lib/blog/blog-repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteParams) {
  const authError = await assertAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    await deleteBlogPost(id);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Falha ao excluir post do blog.",
      },
      { status: 400 },
    );
  }
}
