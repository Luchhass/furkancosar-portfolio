import { isIndexable } from "@/lib/seo";

export async function GET(_request, { params }) {
  const { key } = await params;
  if (!isIndexable || !/^[a-zA-Z0-9-]{8,128}$/.test(key) || key !== process.env.INDEXNOW_KEY?.trim()) {
    return new Response(null, { status: 404 });
  }
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
