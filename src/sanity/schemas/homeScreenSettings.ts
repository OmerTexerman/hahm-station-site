import { defineField, defineType } from "sanity";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site";

export const homeScreenSettings = defineType({
  name: "homeScreenSettings",
  title: "Home Screen Settings",
  type: "document",
  groups: [
    { name: "scene", title: "Scene Copy", default: true },
    { name: "wallArt", title: "Wall Art" },
    { name: "interactive", title: "Shelf Props" },
  ],
  fields: [
    defineField({
      name: "homeHeaderTop",
      title: "Header Top Book",
      type: "string",
      group: "scene",
      initialValue: DEFAULT_SITE_SETTINGS.homeHeaderTop,
    }),
    defineField({
      name: "homeHeaderBottom",
      title: "Header Bottom Book",
      type: "string",
      group: "scene",
      initialValue: DEFAULT_SITE_SETTINGS.homeHeaderBottom,
    }),
    defineField({
      name: "homeSceneTitle",
      title: "Home Screen Title",
      type: "string",
      description: "Used for metadata and the screen-reader heading on the homepage.",
      group: "scene",
      initialValue: DEFAULT_SITE_SETTINGS.homeSceneTitle,
    }),
    defineField({
      name: "homeSceneDescription",
      title: "Home Screen Description",
      type: "text",
      rows: 3,
      group: "scene",
      initialValue: DEFAULT_SITE_SETTINGS.homeSceneDescription,
    }),
    defineField({
      name: "homeFooter",
      title: "Bottom Footer Copy",
      type: "string",
      description: "Shown at the bottom of the main homepage viewport.",
      group: "scene",
      initialValue: DEFAULT_SITE_SETTINGS.homeFooter,
    }),
    defineField({
      name: "wallArtLabel",
      title: "Fallback Wall Art Label",
      type: "string",
      group: "wallArt",
      initialValue: DEFAULT_SITE_SETTINGS.wallArtLabel,
    }),
    defineField({
      name: "wallArtQuote",
      title: "Fallback Wall Art Quote",
      type: "string",
      group: "wallArt",
      initialValue: DEFAULT_SITE_SETTINGS.wallArtQuote,
    }),
    defineField({
      name: "metronomeCategory",
      title: "Metronome Linked Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "If set, clicking the metronome opens this category.",
      group: "interactive",
    }),
    defineField({
      name: "metronomeTooltip",
      title: "Metronome Label Override",
      type: "string",
      description:
        "Optional. Leave blank to use the linked category title automatically.",
      group: "interactive",
    }),
    defineField({
      name: "vinylCategory",
      title: "Record Linked Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "If set, clicking the record opens this category.",
      group: "interactive",
    }),
    defineField({
      name: "vinylTooltip",
      title: "Record Label Override",
      type: "string",
      description:
        "Optional. Leave blank to use the linked category title automatically.",
      group: "interactive",
    }),
    defineField({
      name: "plantCategory",
      title: "Plant Linked Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "If set, clicking the plant opens this category.",
      group: "interactive",
    }),
    defineField({
      name: "plantTooltip",
      title: "Plant Label Override",
      type: "string",
      description:
        "Optional. Leave blank to use the linked category title automatically.",
      group: "interactive",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Home Screen Settings",
      };
    },
  },
});
