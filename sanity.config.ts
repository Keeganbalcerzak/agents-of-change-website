import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "demo";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Agents of Change Content Studio",
  projectId,
  dataset,
  plugins: [],
  schema: {
    types: schemaTypes,
  },
});
