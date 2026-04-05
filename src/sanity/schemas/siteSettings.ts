import type {} from "@sanity/color-input";
import { defineField, defineType } from "sanity";
import {
  DEFAULT_THEME_PRESET,
  THEME_FIELDSET_TITLES,
  THEME_FIELD_DEFINITIONS,
  THEME_PRESET_OPTIONS,
  getThemeSwatches,
} from "@/lib/site-theme";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site";
import { ThemeInput } from "@/sanity/components/ThemeInput";

function themeColorField(definition: (typeof THEME_FIELD_DEFINITIONS)[number]) {
  return defineField({
    name: definition.name,
    title: definition.title,
    type: "color",
    description: `${definition.description} Leave this empty to inherit from the selected preset.`,
    fieldset: definition.fieldset,
    options: {
      disableAlpha: !definition.allowAlpha,
      colorList: getThemeSwatches(definition.name),
    },
  });
}

const themeField = defineField({
  name: "theme",
  title: "Theme",
  type: "object",
  group: "theme",
  description:
    "Choose a preset palette first, then override individual tokens only where needed.",
  initialValue: {
    preset: DEFAULT_THEME_PRESET,
  },
  options: {
    collapsible: true,
    collapsed: false,
  },
  components: {
    input: ThemeInput,
  },
  fieldsets: Object.entries(THEME_FIELDSET_TITLES).map(([name, title]) => ({
    name,
    title,
  })),
  fields: [
    defineField({
      name: "preset",
      title: "Preset Palette",
      type: "string",
      initialValue: DEFAULT_THEME_PRESET,
      description:
        "Pick the overall look here. The color controls below act as optional overrides on top of this preset.",
      options: {
        list: THEME_PRESET_OPTIONS,
        layout: "radio",
      },
    }),
    ...THEME_FIELD_DEFINITIONS.map((definition) => themeColorField(definition)),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand Copy", default: true },
    { name: "theme", title: "Theme" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      group: "brand",
      initialValue: DEFAULT_SITE_SETTINGS.siteTitle,
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      rows: 3,
      group: "brand",
      initialValue: DEFAULT_SITE_SETTINGS.siteDescription,
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "brand",
      description:
        "Optional. Upload a square PNG or SVG to replace the browser tab icon.",
      options: {
        hotspot: false,
      },
    }),
    defineField({
      name: "notFoundTitle",
      title: "404 Title",
      type: "string",
      group: "brand",
      initialValue: DEFAULT_SITE_SETTINGS.notFoundTitle,
    }),
    defineField({
      name: "notFoundDescription",
      title: "404 Description",
      type: "text",
      rows: 3,
      group: "brand",
      initialValue: DEFAULT_SITE_SETTINGS.notFoundDescription,
    }),
    defineField({
      name: "notFoundLinkLabel",
      title: "404 Link Label",
      type: "string",
      group: "brand",
      initialValue: DEFAULT_SITE_SETTINGS.notFoundLinkLabel,
    }),
    themeField,
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
      };
    },
  },
});
