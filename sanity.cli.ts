import fs from "node:fs";
import path from "node:path";
import { defineCliConfig } from "sanity/cli";
import { SANITY_PLACEHOLDER_VALUE } from "./src/sanity/env";

const ENV_FILES = [".env.local", ".env"];

function readEnvFileValue(
  name: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET"
) {
  for (const filename of ENV_FILES) {
    const envPath = path.join(process.cwd(), filename);

    if (!fs.existsSync(envPath)) {
      continue;
    }

    const fileContents = fs.readFileSync(envPath, "utf8");

    for (const rawLine of fileContents.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const equalsIndex = line.indexOf("=");

      if (equalsIndex === -1) {
        continue;
      }

      const key = line.slice(0, equalsIndex).trim();

      if (key !== name) {
        continue;
      }

      const value = line.slice(equalsIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        return value.slice(1, -1).trim();
      }

      return value;
    }
  }

  return null;
}

function readCliEnv(
  name: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET"
) {
  const processValue = process.env[name]?.trim();

  if (processValue) {
    return processValue;
  }

  const fileValue = readEnvFileValue(name);
  return fileValue || SANITY_PLACEHOLDER_VALUE;
}

export default defineCliConfig({
  api: {
    projectId: readCliEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"),
    dataset: readCliEnv("NEXT_PUBLIC_SANITY_DATASET"),
  },
});
