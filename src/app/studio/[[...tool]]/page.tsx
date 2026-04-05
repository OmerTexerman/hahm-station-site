import { notFound } from "next/navigation";
import { requireSanityEnv, sanityEnv } from "@/sanity/env";

export default async function StudioPage() {
  if (!sanityEnv.isConfigured) {
    notFound();
  }

  const { default: StudioClient } = await import("./StudioClient");
  const { projectId, dataset } = requireSanityEnv("Sanity Studio");

  return <StudioClient projectId={projectId} dataset={dataset} />;
}
