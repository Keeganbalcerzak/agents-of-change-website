import { createClient } from "@sanity/client";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;
const apiVersion = import.meta.env.SANITY_API_VERSION || "2024-08-01";
const token = import.meta.env.SANITY_READ_TOKEN;

export const sanityEnabled = Boolean(projectId && dataset);

export const sanityClient = (() => {
  if (!sanityEnabled) return null;
  try {
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !token,
      token,
      perspective: "published",
    });
  } catch {
    return null;
  }
})();
