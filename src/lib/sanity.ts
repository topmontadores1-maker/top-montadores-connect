import { createClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

const runtimeEnv = typeof process !== "undefined" ? process.env : {};

export const sanityConfig = {
  projectId:
    import.meta.env.VITE_SANITY_PROJECT_ID || runtimeEnv.SANITY_STUDIO_PROJECT_ID || "pudshjx1",
  dataset: import.meta.env.VITE_SANITY_DATASET || runtimeEnv.SANITY_STUDIO_DATASET || "production",
  apiVersion:
    import.meta.env.VITE_SANITY_API_VERSION || runtimeEnv.SANITY_API_VERSION || "2026-07-03",
};

export const sanityClient = createClient({
  ...sanityConfig,
  useCdn: true,
  perspective: "published",
});

export const sanityFreshClient = createClient({
  ...sanityConfig,
  useCdn: false,
  perspective: "published",
});

const imageBuilder = createImageUrlBuilder(sanityClient);

export function sanityImageUrl(source: SanityImageSource) {
  return imageBuilder.image(source).auto("format").fit("max");
}

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return sanityFreshClient.fetch<T>(query, params);
}
