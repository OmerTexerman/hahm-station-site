import { colorInput } from "@sanity/color-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

type StudioConfigOptions = {
  dataset: string;
  projectId: string;
};

export function createStudioConfig({
  dataset,
  projectId,
}: StudioConfigOptions) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return defineConfig({
    name: "hahm-station",
    title: "HAHM Station",
    projectId,
    dataset,
    plugins: [
      structureTool({ structure }),
      colorInput(),
      ...(isDevelopment ? [visionTool()] : []),
    ],
    document: {
      actions: (previousActions, context) =>
        ["siteSettings", "homeScreenSettings"].includes(context.schemaType)
          ? previousActions.filter(
              (action) =>
                action.action !== "duplicate" && action.action !== "delete"
            )
          : previousActions,
    },
    schema: {
      types: schemaTypes,
      templates: (templates) =>
        templates.filter(
          (template) =>
            !["siteSettings", "homeScreenSettings"].includes(template.schemaType)
        ),
    },
  });
}
