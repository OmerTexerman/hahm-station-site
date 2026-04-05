"use client";

import { useMemo } from "react";
import { NextStudio } from "next-sanity/studio/client-component";
import { createStudioConfig } from "@/sanity/studioConfig";

export default function StudioClient({
  dataset,
  projectId,
}: {
  dataset: string;
  projectId: string;
}) {
  const config = useMemo(
    () => createStudioConfig({ dataset, projectId }),
    [dataset, projectId]
  );

  return (
    <NextStudio
      basePath="/studio"
      config={config}
    />
  );
}
