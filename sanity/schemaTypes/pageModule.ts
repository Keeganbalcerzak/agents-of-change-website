import { defineArrayMember, defineField, defineType } from "sanity";

export const pageModule = defineType({
  name: "pageModule",
  title: "Page Module",
  type: "document",
  fields: [
    defineField({
      name: "moduleId",
      title: "Module ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pagePath",
      title: "Page Path",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "themeIntent",
      title: "Theme Intent",
      type: "string",
      options: { list: ["default", "editorial", "conversion", "trust"] },
      initialValue: "default",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "motionTier",
      title: "Motion Tier",
      type: "string",
      options: { list: ["none", "micro", "section", "hero"] },
      initialValue: "section",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
});
