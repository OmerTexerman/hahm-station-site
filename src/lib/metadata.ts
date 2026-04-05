import type { Metadata } from "next";
import { getResolvedSection, getResolvedSiteSettings } from "@/lib/content";
import { getPost } from "@/sanity/queries";
import { getSectionConfig, type CategorySlug } from "./site";

function readSiteUrl() {
  const rawValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawValue) {
    return null;
  }

  try {
    return new URL(rawValue.endsWith("/") ? rawValue : `${rawValue}/`);
  } catch {
    return null;
  }
}

const siteUrl = readSiteUrl();

function buildCanonicalUrl(path?: string) {
  if (!siteUrl || !path) {
    return undefined;
  }

  return new URL(path, siteUrl).toString();
}

function composeMetadata({
  siteTitle,
  siteDescription,
  title,
  description = siteDescription,
  path,
  noIndex = false,
  openGraphType = "website",
  publishedTime,
}: {
  siteTitle: string;
  siteDescription: string;
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const resolvedTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const canonical = path ? buildCanonicalUrl(path) ?? path : undefined;

  return {
    title: resolvedTitle,
    description,
    metadataBase: siteUrl ?? undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: resolvedTitle,
      description,
      siteName: siteTitle,
      type: openGraphType,
      url: canonical,
      publishedTime,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export async function buildMetadata({
  title,
  description,
  path,
  noIndex,
  openGraphType,
  publishedTime,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
  publishedTime?: string;
} = {}) {
  const siteSettings = await getResolvedSiteSettings();

  return composeMetadata({
    siteTitle: siteSettings.siteTitle,
    siteDescription: siteSettings.siteDescription,
    title,
    description,
    path,
    noIndex,
    openGraphType,
    publishedTime,
  });
}

export async function buildSectionMetadata(categorySlug: CategorySlug) {
  const section = (await getResolvedSection(categorySlug)) ?? getSectionConfig(categorySlug);

  return buildMetadata({
    title: section.title,
    description: section.description,
    path: `/${categorySlug}`,
  });
}

export async function buildPostMetadata(
  categorySlug: CategorySlug,
  slug: string
) {
  const [sectionFromCms, post, siteSettings] = await Promise.all([
    getResolvedSection(categorySlug),
    getPost(categorySlug, slug),
    getResolvedSiteSettings(),
  ]);

  const section = sectionFromCms ?? getSectionConfig(categorySlug);

  if (!post) {
    return composeMetadata({
      siteTitle: siteSettings.siteTitle,
      siteDescription: siteSettings.siteDescription,
      title: section.title,
      description: section.description,
      path: `/${categorySlug}/${slug}`,
      noIndex: true,
    });
  }

  return composeMetadata({
    siteTitle: siteSettings.siteTitle,
    siteDescription: siteSettings.siteDescription,
    title: post.title,
    description: post.excerpt ?? section.postFallbackExcerpt,
    path: `/${categorySlug}/${slug}`,
    openGraphType: "article",
    publishedTime: post.publishedAt,
  });
}
