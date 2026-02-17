import { defineArrayMember, defineField, defineType } from "sanity";

export const designVariant = defineType({
  name: "designVariant",
  title: "Design Variant",
  type: "document",
  fields: [
    defineField({
      name: "componentId",
      title: "Component ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "states",
      title: "UI States",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "accessibilityNotes",
      title: "Accessibility Notes",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
    }),
    defineField({
      name: "usageGuidelines",
      title: "Usage Guidelines",
      type: "text",
      rows: 5,
    }),
  ],
});
