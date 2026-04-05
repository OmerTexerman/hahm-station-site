import type { Metadata } from "next";
import SectionPostsPage from "@/components/SectionPostsPage";
import { buildSectionMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return buildSectionMetadata(category);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <SectionPostsPage categorySlug={category} />;
}
