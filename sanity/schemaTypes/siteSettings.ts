import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "primaryCtaLabel", title: "Primary CTA Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "primaryCtaHref", title: "Primary CTA Link", type: "string", validation: (r) => r.required() }),
    defineField({ name: "supportEmail", title: "Support Email", type: "string" }),
    defineField({ name: "supportPhone", title: "Support Phone", type: "string" }),
    defineField({ name: "aceProviderNumber", title: "ACE Provider Number", type: "string" }),
  ],
});
