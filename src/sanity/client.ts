import { createClient } from "next-sanity";
import { sanityEnv } from "./env";

const client =
  (sanityEnv.isConfigured && sanityEnv.projectId && sanityEnv.dataset)
    ? createClient({
        projectId: sanityEnv.projectId,
        dataset: sanityEnv.dataset,
        apiVersion: "2024-01-01",
        useCdn: false,
      })
    : null;

export function getSanityClient() {
  if (!client) {
    throw new Error(
      "Sanity client requested before NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET were configured."
    );
  }

  return client;
}
