export const SANITY_PLACEHOLDER_VALUE = "placeholder";

function readEnv(
  name: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET"
) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function isConfiguredValue(value: string | null) {
  return Boolean(value) && value !== SANITY_PLACEHOLDER_VALUE;
}

const projectId = readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET");

export const sanityEnv = {
  projectId,
  dataset,
  isConfigured: isConfiguredValue(projectId) && isConfiguredValue(dataset),
} as const;

export function requireSanityEnv(consumer: string) {
  if (!sanityEnv.isConfigured || !sanityEnv.projectId || !sanityEnv.dataset) {
    throw new Error(
      `${consumer} requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to be configured with real values.`
    );
  }

  return {
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
  };
}
