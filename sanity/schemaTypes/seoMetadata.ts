import { defineField, defineType } from "sanity";

export const seoMetadata = defineType({
  name: "seoMetadata",
  title: "SEO Metadata",
  type: "document",
  fields: [
    defineField({ name: "key", title: "Key", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "path", title: "Path", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ogImage", title: "OG Image URL", type: "url" }),
    defineField({ name: "noindex", title: "Noindex", type: "boolean", initialValue: false }),
  ],
});
