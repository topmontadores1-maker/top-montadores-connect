import { defineCliConfig } from "sanity/cli";

const allowedHosts = ["e1ee-45-4-115-140.ngrok-free.app", ".ngrok-free.app"];

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "pudshjx1",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  deployment: {
    appId: "ymtyhw84sxyegtg78eh83ks5",
  },
  vite: (config) => ({
    ...config,
    server: {
      ...config.server,
      allowedHosts:
        config.server?.allowedHosts === true
          ? true
          : [
              ...new Set([
                ...(Array.isArray(config.server?.allowedHosts)
                  ? config.server.allowedHosts
                  : []),
                ...allowedHosts,
              ]),
            ],
    },
  }),
});
