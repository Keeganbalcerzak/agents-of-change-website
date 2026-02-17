import { defineArrayMember, defineField, defineType } from "sanity";

export const stateRequirement = defineType({
  name: "stateRequirement",
  title: "State Requirement",
  type: "document",
  fields: [
    defineField({ name: "stateCode", title: "State Code", type: "string", validation: (r) => r.required().length(2) }),
    defineField({ name: "stateName", title: "State Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "requirements",
      title: "Requirements",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.required().min(3),
    }),
    defineField({ name: "boardUrl", title: "Board URL", type: "url" }),
    defineField({ name: "updatedAt", title: "Updated At", type: "datetime" }),
    defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
  ],
});
