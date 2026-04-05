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

const isDevelopment = process.env.NODE_ENV === "development";
const singletonSchemaTypes = ["siteSettings", "homeScreenSettings"] as const;
const studioConfigCache = new Map<string, ReturnType<typeof buildStudioConfig>>();

function buildStudioConfig({
  dataset,
  projectId,
}: StudioConfigOptions) {
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
        singletonSchemaTypes.includes(
          context.schemaType as (typeof singletonSchemaTypes)[number]
        )
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
            !singletonSchemaTypes.includes(
              template.schemaType as (typeof singletonSchemaTypes)[number]
            )
        ),
    },
  });
}

export function createStudioConfig(options: StudioConfigOptions) {
  const cacheKey = `${options.projectId}:${options.dataset}:${isDevelopment ? "dev" : "prod"}`;
  const cachedConfig = studioConfigCache.get(cacheKey);

  if (cachedConfig) {
    return cachedConfig;
  }

  const config = buildStudioConfig(options);
  studioConfigCache.set(cacheKey, config);
  return config;
}
