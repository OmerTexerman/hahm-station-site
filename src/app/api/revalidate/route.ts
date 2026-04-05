import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  getCategoryPostsTag,
  getPostTag,
  SANITY_TAGS,
} from "@/sanity/tags";

type RevalidatePayload = {
  _type?: string;
  categorySlug?: string;
  slug?: string | { current?: string | null } | null;
  tags?: string[];
};

function readSlugValue(value: RevalidatePayload["slug"]) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim() || null;
  }

  const current = value.current?.trim();
  return current || null;
}

function buildTags(payload: RevalidatePayload) {
  const tags = new Set<string>();

  for (const tag of payload.tags ?? []) {
    if (tag) {
      tags.add(tag);
    }
  }

  switch (payload._type) {
    case "siteSettings":
      tags.add(SANITY_TAGS.siteSettings);
      break;
    case "homeScreenSettings":
      tags.add(SANITY_TAGS.homeScreenSettings);
      break;
    case "category":
      tags.add(SANITY_TAGS.categories);
      break;
    case "wallArt":
      tags.add(SANITY_TAGS.wallArt);
      break;
    case "post":
      tags.add(SANITY_TAGS.posts);
      break;
    default:
      break;
  }

  const categorySlug = payload.categorySlug?.trim();
  const slug = readSlugValue(payload.slug);

  if (categorySlug) {
    tags.add(getCategoryPostsTag(categorySlug));
  }

  if (categorySlug && slug) {
    tags.add(getPostTag(categorySlug, slug));
  }

  return Array.from(tags);
}

function isAuthorized(request: NextRequest) {
  const configuredSecret = process.env.SANITY_REVALIDATE_SECRET?.trim();

  if (!configuredSecret) {
    return process.env.NODE_ENV === "development";
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const requestSecret =
    bearerToken || request.nextUrl.searchParams.get("secret")?.trim() || "";

  return requestSecret === configuredSecret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as RevalidatePayload;
  const tags = buildTags(payload);

  if (tags.length === 0) {
    return NextResponse.json({ ok: true, revalidated: [] });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
