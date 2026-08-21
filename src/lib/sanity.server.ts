import { createClient } from "@sanity/client";

import { sanityConfig } from "@/lib/sanity";

function createSanityServerClient() {
  const token = process.env.SANITY_API_TOKEN;

  if (!token) {
    throw new Error("Missing SANITY_API_TOKEN environment variable.");
  }

  return createClient({
    ...sanityConfig,
    token,
    useCdn: false,
    perspective: "published",
  });
}

let serverClient: ReturnType<typeof createSanityServerClient> | undefined;

export function getSanityServerClient() {
  if (!serverClient) {
    serverClient = createSanityServerClient();
  }

  return serverClient;
}
