import { defineArrayMember, defineField, defineType } from "sanity";

export const ctaPattern = defineType({
  name: "ctaPattern",
  title: "CTA Pattern",
  type: "document",
  fields: [
    defineField({
      name: "patternId",
      title: "Pattern ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Href",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locationRules",
      title: "Location Rules",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "intent",
      title: "Intent",
      type: "string",
      options: { list: ["conversion", "education", "support"] },
      initialValue: "conversion",
    }),
  ],
});
