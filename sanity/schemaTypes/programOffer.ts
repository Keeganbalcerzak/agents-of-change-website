import { defineArrayMember, defineField, defineType } from "sanity";

export const programOffer = defineType({
  name: "programOffer",
  title: "Program Offer",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({ name: "priceCurrent", title: "Current Price", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "priceOriginal", title: "Original Price", type: "number", validation: (r) => r.min(0) }),
    defineField({
      name: "featuresIncluded",
      title: "Included Features",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.required().min(3),
    }),
    defineField({ name: "ctaLabel", title: "CTA Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ctaTarget", title: "CTA Target", type: "string", validation: (r) => r.required() }),
    defineField({ name: "badge", title: "Badge", type: "string" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
});
