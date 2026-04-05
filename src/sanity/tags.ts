export const SANITY_TAGS = {
  categories: "sanity:categories",
  siteSettings: "sanity:site-settings",
  homeScreenSettings: "sanity:home-screen-settings",
  posts: "sanity:posts",
  wallArt: "sanity:wall-art",
} as const;

export function getCategoryPostsTag(categorySlug: string) {
  return `${SANITY_TAGS.posts}:${categorySlug}`;
}

export function getPostTag(categorySlug: string, slug: string) {
  return `${getCategoryPostsTag(categorySlug)}:${slug}`;
}
