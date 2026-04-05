import type {} from "@sanity/color-input";
import { defineField, defineType } from "sanity";

const CATEGORY_SPINE_SWATCHES = [
  "#8B4513",
  "#2F4F4F",
  "#1A1A2E",
  "#1A5C3A",
  "#5C4033",
  "#6C4E3D",
  "#324936",
];

const CATEGORY_ACCENT_SWATCHES = [
  "#D4A056",
  "#5F9F9F",
  "#6366F1",
  "#4CAF50",
  "#8B7355",
  "#C9954B",
  "#5EA4FF",
];

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "homepage", title: "Homepage Book" },
    { name: "behavior", title: "Behavior" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Shown in navigation, page titles, and metadata.",
      validation: (rule) => rule.required(),
      group: "identity",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "This becomes the public URL path for the category.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      group: "identity",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Used on the category landing page and in metadata.",
      group: "identity",
    }),
    defineField({
      name: "navigationLabel",
      title: "Navigation Label",
      type: "string",
      description: "Short label used in the navigation and shelf navigation pill.",
      group: "identity",
    }),
    defineField({
      name: "bookTitle",
      title: "Homepage Book Title",
      type: "string",
      description: "Use a short stacked title. Line breaks are supported.",
      group: "homepage",
    }),
    defineField({
      name: "bookSubtitle",
      title: "Homepage Book Subtitle",
      type: "string",
      description: "Small copy shown on the homepage book cover.",
      group: "homepage",
    }),
    defineField({
      name: "emptyState",
      title: "Empty State Copy",
      type: "string",
      description: "Shown when this category has no posts yet.",
      group: "behavior",
    }),
    defineField({
      name: "postFallbackExcerpt",
      title: "Post Card Fallback Excerpt",
      type: "string",
      description: "Used when a post in this category does not have its own excerpt.",
      group: "behavior",
    }),
    defineField({
      name: "color",
      title: "Spine Color",
      type: "color",
      description: "Primary homepage book color.",
      options: {
        disableAlpha: true,
        colorList: CATEGORY_SPINE_SWATCHES,
      },
      group: "homepage",
    }),
    defineField({
      name: "accentColor",
      title: "Accent Color",
      type: "color",
      description: "Accent line color for the homepage book.",
      options: {
        disableAlpha: true,
        colorList: CATEGORY_ACCENT_SWATCHES,
      },
      group: "homepage",
    }),
    defineField({
      name: "orderRank",
      title: "Order",
      type: "number",
      description: "Lower numbers appear earlier in the navigation and on the shelf.",
      group: "behavior",
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderRankAsc",
      by: [{ field: "orderRank", direction: "asc" }],
    },
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: slug ? `/${slug}` : "Missing slug",
      };
    },
  },
});
