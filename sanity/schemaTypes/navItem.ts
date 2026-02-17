import { defineField, defineType } from "sanity";

export const navItem = defineType({
  name: "navItem",
  title: "Navigation Item",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Href", type: "string", validation: (r) => r.required() }),
    defineField({ name: "primary", title: "Primary CTA", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
});
