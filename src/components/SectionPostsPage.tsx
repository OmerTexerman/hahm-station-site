import { notFound } from "next/navigation";
import { getResolvedSection } from "@/lib/content";
import { type CategorySlug } from "@/lib/site";
import { getPostsByCategory } from "@/sanity/queries";
import PostCard from "./PostCard";
import SectionLayout from "./SectionLayout";

export default async function SectionPostsPage({
  categorySlug,
}: {
  categorySlug: CategorySlug;
}) {
  const [section, posts] = await Promise.all([
    getResolvedSection(categorySlug),
    getPostsByCategory(categorySlug),
  ]);

  if (!section) {
    notFound();
  }

  return (
    <SectionLayout
      currentSection={categorySlug}
      title={section.title}
      description={section.description}
    >
      {posts.length === 0 ? (
        <p className="theme-text-muted">{section.emptyState}</p>
      ) : (
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard
                {...post}
                section={section}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionLayout>
  );
}
