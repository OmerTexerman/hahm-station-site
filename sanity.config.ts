import { requireSanityEnv } from "./src/sanity/env";
import { createStudioConfig } from "./src/sanity/studioConfig";

const { projectId, dataset } = requireSanityEnv("Sanity Studio");

export default createStudioConfig({ projectId, dataset });
