import { createImageUrlBuilder } from "@sanity/image-url";
import { getSanityClient } from "./client";

export function urlFor(
  source: Parameters<ReturnType<typeof createImageUrlBuilder>["image"]>[0]
) {
  return createImageUrlBuilder(getSanityClient()).image(source);
}
