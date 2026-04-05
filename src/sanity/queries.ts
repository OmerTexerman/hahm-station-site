import { getSanityClient } from "./client";
import { sanityEnv } from "./env";
import {
  getPlaceholderPost,
  getPlaceholderPostsByCategory,
} from "@/lib/placeholder-posts";
import { THEME_FIELD_DEFINITIONS } from "@/lib/site-theme";
import { REVALIDATE_SECONDS, type CategorySlug } from "@/lib/site";
import {
  getCategoryPostsTag,
  getPostTag,
  SANITY_TAGS,
} from "./tags";
import type {
  CategoryDocument,
  HomeScreenSettingsDocument,
  PostDetail,
  PostSummary,
  SiteSettingsDocument,
  WallArtPiece,
} from "./types";

const postsByCategoryQuery = `
  *[_type == "post" && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage {
      ...,
      alt
    },
    "categorySlug": category->slug.current
  }
`;

const categoriesQuery = `
  *[_type == "category"] | order(coalesce(orderRank, 999) asc, title asc) {
    title,
    "slug": slug.current,
    description,
    navigationLabel,
    bookTitle,
    bookSubtitle,
    emptyState,
    postFallbackExcerpt,
    color,
    accentColor,
    orderRank
  }
`;

const siteThemeQueryFields = THEME_FIELD_DEFINITIONS.map(
  ({ name }) => `      ${name}`
).join(",\n");

const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    siteTitle,
    siteDescription,
    "faviconUrl": favicon.asset->url,
    notFoundTitle,
    notFoundDescription,
    notFoundLinkLabel,
    theme {
      preset,
${siteThemeQueryFields}
    }
  }
`;

const homeScreenSettingsQuery = `
  *[_type == "homeScreenSettings"][0] {
    homeHeaderTop,
    homeHeaderBottom,
    homeSceneTitle,
    homeSceneDescription,
    homeFooter,
    wallArtLabel,
    wallArtQuote,
    metronomeTooltip,
    vinylTooltip,
    plantTooltip,
    "metronomeCategorySlug": metronomeCategory->slug.current,
    "vinylCategorySlug": vinylCategory->slug.current,
    "plantCategorySlug": plantCategory->slug.current
  }
`;

const postQuery = `
  *[
    _type == "post" &&
    slug.current == $slug &&
    category->slug.current == $categorySlug
  ][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage {
      ...,
      alt
    },
    body[]{
      ...,
      _type == "audioFile" => {
        ...,
        asset->{
          url
        }
      }
    },
    "category": category-> {
      title,
      "slug": slug.current
    },
    "categorySlug": category->slug.current
  }
`;

const wallArtQuery = `
  *[_type == "wallArt"] {
    _id,
    title,
    image {
      ...,
      alt
    },
    style,
    size,
    caption,
    link
  }
`;

function shouldUsePlaceholderContent() {
  return process.env.NODE_ENV !== "production";
}

function normalizePostDetail(post: PostDetail | null) {
  if (!post) {
    return null;
  }

  return {
    ...post,
    body: Array.isArray(post.body) ? post.body : [],
  };
}

function normalizePostSummaries(posts: PostSummary[] | null | undefined) {
  return Array.isArray(posts) ? posts : [];
}

function normalizeWallArtPieces(
  pieces: WallArtPiece[] | null | undefined
) {
  return Array.isArray(pieces) ? pieces : [];
}

function getQueryOptions(tags: string[]) {
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }

  return {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags,
    },
  };
}

export async function getPostsByCategory(categorySlug: CategorySlug) {
  if (!sanityEnv.isConfigured) {
    return shouldUsePlaceholderContent()
      ? getPlaceholderPostsByCategory(categorySlug)
      : [];
  }

  return normalizePostSummaries(
    await getSanityClient().fetch<PostSummary[]>(
      postsByCategoryQuery,
      { categorySlug },
      getQueryOptions([SANITY_TAGS.posts, getCategoryPostsTag(categorySlug)])
    )
  );
}

export async function getCategories() {
  if (!sanityEnv.isConfigured) {
    return [];
  }

  return getSanityClient().fetch<CategoryDocument[]>(
    categoriesQuery,
    {},
    getQueryOptions([SANITY_TAGS.categories])
  );
}

export async function getSiteSettings() {
  if (!sanityEnv.isConfigured) {
    return null;
  }

  return getSanityClient().fetch<SiteSettingsDocument | null>(
    siteSettingsQuery,
    {},
    getQueryOptions([SANITY_TAGS.siteSettings])
  );
}

export async function getHomeScreenSettings() {
  if (!sanityEnv.isConfigured) {
    return null;
  }

  return getSanityClient().fetch<HomeScreenSettingsDocument | null>(
    homeScreenSettingsQuery,
    {},
    getQueryOptions([SANITY_TAGS.homeScreenSettings])
  );
}

export async function getPost(categorySlug: CategorySlug, slug: string) {
  if (!sanityEnv.isConfigured) {
    const placeholderPost = shouldUsePlaceholderContent()
      ? getPlaceholderPost(slug)
      : null;

    return placeholderPost?.category.slug === categorySlug
      ? placeholderPost
      : null;
  }

  return normalizePostDetail(
    await getSanityClient().fetch<PostDetail | null>(
      postQuery,
      { categorySlug, slug },
      getQueryOptions([
        SANITY_TAGS.posts,
        getCategoryPostsTag(categorySlug),
        getPostTag(categorySlug, slug),
      ])
    )
  );
}

export async function getWallArt() {
  if (!sanityEnv.isConfigured) {
    return [];
  }

  return normalizeWallArtPieces(
    await getSanityClient().fetch<WallArtPiece[]>(
      wallArtQuery,
      {},
      getQueryOptions([SANITY_TAGS.wallArt])
    )
  );
}
