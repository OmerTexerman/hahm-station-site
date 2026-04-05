import type { Metadata } from "next";
import PostPage from "@/components/PostPage";
import { buildPostMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  return buildPostMetadata(category, slug);
}

export default async function CategoryPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  return <PostPage categorySlug={category} slug={slug} />;
}
