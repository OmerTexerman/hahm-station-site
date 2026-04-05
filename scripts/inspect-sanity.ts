import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

function readEnvFileValue(
  filename: string,
  name: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET"
) {
  const filePath = path.join(process.cwd(), filename);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");

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
    return value.replace(/^['"]|['"]$/g, "") || null;
  }

  return null;
}

function readLocalEnv() {
  return {
    dataset:
      readEnvFileValue(".env.local", "NEXT_PUBLIC_SANITY_DATASET") ??
      readEnvFileValue(".env", "NEXT_PUBLIC_SANITY_DATASET"),
    projectId:
      readEnvFileValue(".env.local", "NEXT_PUBLIC_SANITY_PROJECT_ID") ??
      readEnvFileValue(".env", "NEXT_PUBLIC_SANITY_PROJECT_ID"),
  };
}

async function main() {
  const localEnv = readLocalEnv();
  const cliClient = getCliClient({ apiVersion: "2025-02-19" });
  const publicClient =
    localEnv.projectId && localEnv.dataset
      ? createClient({
          apiVersion: "2025-02-19",
          dataset: localEnv.dataset,
          projectId: localEnv.projectId,
          useCdn: false,
        })
      : null;

  console.log(
    JSON.stringify(
      {
        cliConfig: {
          dataset: cliClient.config().dataset,
          projectId: cliClient.config().projectId,
          useCdn: cliClient.config().useCdn,
        },
        localEnv,
      },
      null,
      2
    )
  );

  const query = `*[_type == "category"] | order(title asc){
    _id,
    title,
    "slug": slug.current
  }`;

  const authenticatedCategories = await cliClient.fetch(query);
  console.log("authenticatedCategories");
  console.log(JSON.stringify(authenticatedCategories, null, 2));

  if (!publicClient) {
    console.log("publicCategories");
    console.log("No local Sanity env found.");
    return;
  }

  const publicCategories = await publicClient.fetch(query);
  console.log("publicCategories");
  console.log(JSON.stringify(publicCategories, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
