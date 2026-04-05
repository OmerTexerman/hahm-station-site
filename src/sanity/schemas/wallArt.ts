import { defineField, defineType } from "sanity";

export const wallArt = defineType({
  name: "wallArt",
  title: "Wall Art",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "appearance", title: "Appearance" },
    { name: "linking", title: "Linking" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Name for this piece (internal use)",
      validation: (rule) => rule.required(),
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "The artwork image (posters, photos, prints, etc.)",
      validation: (rule) => rule.required(),
      group: "content",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the artwork for screen readers.",
        }),
      ],
    }),
    defineField({
      name: "style",
      title: "Frame Style",
      type: "string",
      options: {
        list: [
          { title: "Poster (dark frame)", value: "poster" },
          { title: "Polaroid (white frame, caption at bottom)", value: "polaroid" },
          { title: "Framed (thin border)", value: "framed" },
          { title: "Frameless (no border)", value: "frameless" },
        ],
      },
      initialValue: "poster",
      group: "appearance",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
        ],
      },
      initialValue: "medium",
      group: "appearance",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional caption (shown on polaroid style)",
      group: "content",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
      description: "Optional URL this art links to when clicked",
      group: "linking",
    }),
  ],
  preview: {
    select: {
      title: "title",
      style: "style",
      media: "image",
    },
    prepare({ title, style, media }) {
      return {
        title,
        subtitle: style,
        media,
      };
    },
  },
});
