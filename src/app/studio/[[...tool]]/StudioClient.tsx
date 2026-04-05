"use client";

import { NextStudio } from "next-sanity/studio/client-component";
import { createStudioConfig } from "@/sanity/studioConfig";

export default function StudioClient({
  dataset,
  projectId,
}: {
  dataset: string;
  projectId: string;
}) {
  return (
    <NextStudio
      basePath="/studio"
      config={createStudioConfig({ dataset, projectId })}
    />
  );
}
