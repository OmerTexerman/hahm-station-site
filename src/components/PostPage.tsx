import Image from "next/image";
import { notFound } from "next/navigation";
import { getResolvedSection } from "@/lib/content";
import { formatPublishedDate, type CategorySlug } from "@/lib/site";
import { urlFor } from "@/sanity/image";
import { getPost } from "@/sanity/queries";
import PostBody from "./PostBody";
import SectionNav from "./SectionNav";

export default async function PostPage({
  categorySlug,
  slug,
}: {
  categorySlug: CategorySlug;
  slug: string;
}) {
  const [post, section] = await Promise.all([
    getPost(categorySlug, slug),
    getResolvedSection(categorySlug),
  ]);

  if (!post || !section) {
    notFound();
  }

  return (
    <div className="theme-page min-h-screen">
      <SectionNav
        currentSection={categorySlug}
        backHref={`/${categorySlug}`}
        backLabel={section.title}
        isChildPage
      />

      <main id="content">
        <article
          className="mx-auto max-w-3xl px-6 py-12"
          aria-labelledby="post-title"
        >
          <header className="mb-10">
            <p className="theme-text-accent-soft text-sm font-medium uppercase tracking-[0.18em]">
              {post.category.title}
            </p>
            <time
              dateTime={post.publishedAt}
              className="theme-text-muted mt-3 block text-sm"
            >
              {formatPublishedDate(post.publishedAt)}
            </time>
            <h1
              id="post-title"
              className="theme-text-foreground mt-2 font-[family-name:var(--font-display)] text-3xl font-black tracking-tight md:text-4xl"
            >
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="theme-text-muted mt-4 text-lg">{post.excerpt}</p>
            ) : null}
          </header>

          {post.coverImage?.asset?._ref ? (
            <div className="relative mb-10 h-64 w-full overflow-hidden rounded-lg md:h-96">
              <Image
                src={urlFor(post.coverImage).width(1200).height(600).url()}
                alt={post.coverImage.alt || `Cover image for ${post.title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : null}

          <PostBody body={post.body} />
        </article>
      </main>
    </div>
  );
}
