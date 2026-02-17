import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "state", title: "State", type: "string", validation: (r) => r.required() }),
    defineField({ name: "examTrack", title: "Exam Track", type: "string", options: { list: ["LSW", "LMSW", "LCSW"] }, validation: (r) => r.required() }),
    defineField({ name: "quote", title: "Quote", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "result", title: "Result", type: "string" }),
    defineField({ name: "rating", title: "Rating", type: "number", initialValue: 5, validation: (r) => r.required().min(1).max(5) }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
});
