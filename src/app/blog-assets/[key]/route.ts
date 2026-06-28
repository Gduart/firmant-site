import { getBlogImagesStore } from "@/lib/cloudflare-runtime";

type RouteParams = {
  params: Promise<{ key: string }>;
};

const VALID_IMAGE_KEY = /^[a-z0-9-]+\.webp$/;

export async function GET(_request: Request, context: RouteParams) {
  try {
    const { key } = await context.params;
    if (!VALID_IMAGE_KEY.test(key)) {
      return new Response(null, { status: 404 });
    }

    const store = await getBlogImagesStore();
    const image = await store.get(key, "arrayBuffer");

    if (!image) {
      return new Response(null, { status: 404 });
    }

    return new Response(image, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(image.byteLength),
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
