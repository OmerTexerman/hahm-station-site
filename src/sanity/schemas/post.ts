import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "editorial", title: "Editorial", default: true },
    { name: "media", title: "Cover and Media" },
    { name: "content", title: "Body" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Used on cards, the post page, and metadata.",
      validation: (rule) => rule.required(),
      group: "editorial",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "This becomes the public URL for the post.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      group: "editorial",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Select which shelf category this post belongs to.",
      validation: (rule) => rule.required(),
      group: "editorial",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      description: "Who wrote this post.",
      group: "editorial",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      group: "editorial",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      group: "media",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers.",
        }),
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on listing cards and in metadata.",
      group: "editorial",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description:
        "Rich body content supports text, images, galleries, code blocks, callouts, and embeds.",
      group: "content",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
        {
          type: "file",
          title: "Audio File",
          name: "audioFile",
          fields: [
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
          ],
        },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video Embed",
          fields: [
            defineField({
              name: "url",
              title: "Video URL",
              type: "url",
              description: "YouTube, Vimeo, or other embed URL",
              validation: (rule) =>
                rule.uri({
                  scheme: ["http", "https"],
                }),
            }),
          ],
        },
        {
          type: "object",
          name: "codeBlock",
          title: "Code Block",
          fields: [
            defineField({
              name: "filename",
              title: "Filename",
              type: "string",
            }),
            defineField({
              name: "language",
              title: "Language",
              type: "string",
              initialValue: "text",
            }),
            defineField({
              name: "code",
              title: "Code",
              type: "text",
              rows: 12,
              validation: (rule) => rule.required(),
            }),
          ],
        },
        {
          type: "object",
          name: "callout",
          title: "Callout",
          fields: [
            defineField({
              name: "tone",
              title: "Tone",
              type: "string",
              initialValue: "note",
              options: {
                list: [
                  { title: "Note", value: "note" },
                  { title: "Info", value: "info" },
                  { title: "Success", value: "success" },
                  { title: "Warning", value: "warning" },
                ],
                layout: "radio",
              },
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "array",
              of: [{ type: "block" }],
            }),
          ],
        },
        {
          type: "object",
          name: "imageGallery",
          title: "Image Gallery",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              validation: (rule) => rule.min(1),
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: "alt",
                      title: "Alt Text",
                      type: "string",
                    }),
                    defineField({
                      name: "caption",
                      title: "Caption",
                      type: "string",
                    }),
                  ],
                },
              ],
            }),
            defineField({
              name: "caption",
              title: "Gallery Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Published Date (Newest)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category.title",
      media: "coverImage",
    },
    prepare({ title, category, media }) {
      return {
        title,
        subtitle: category,
        media,
      };
    },
  },
});
