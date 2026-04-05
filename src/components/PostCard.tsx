import Image from "next/image";
import Link from "next/link";
import {
  formatPublishedDate,
  getSectionConfig,
  type SectionConfig,
} from "@/lib/site";
import { urlFor } from "@/sanity/image";
import type { PostSummary } from "@/sanity/types";

export default function PostCard({
  title,
  slug,
  categorySlug,
  coverImage,
  excerpt,
  publishedAt,
  section: sectionProp,
}: PostSummary & { section?: Pick<SectionConfig, "postFallbackExcerpt" | "shortLabel"> }) {
  const section = sectionProp ?? getSectionConfig(categorySlug);

  return (
    <Link
      href={`/${categorySlug}/${slug}`}
      className="theme-card theme-focus-ring group block overflow-hidden rounded-lg border transition-colors"
    >
      {coverImage?.asset?._ref ? (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={urlFor(coverImage).width(600).height(300).url()}
            alt={coverImage.alt || `Cover image for ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div
          className="flex h-32 items-center justify-center"
          style={{
            background:
              "linear-gradient(to bottom right, var(--theme-surface-overlay), var(--theme-surface-elevated))",
          }}
        >
          <span className="theme-text-muted text-sm font-medium uppercase tracking-[0.18em]">
            {section.shortLabel}
          </span>
        </div>
      )}
      <div className="p-5">
        <time
          dateTime={publishedAt}
          className="theme-text-muted text-xs font-medium uppercase tracking-[0.18em]"
        >
          {formatPublishedDate(publishedAt)}
        </time>
        <h2 className="theme-text-foreground theme-group-hover-accent mt-1 text-lg font-semibold transition-colors">
          {title}
        </h2>
        <p className="theme-text-muted mt-2 line-clamp-3 text-sm">
          {excerpt || section.postFallbackExcerpt}
        </p>
      </div>
    </Link>
  );
}
