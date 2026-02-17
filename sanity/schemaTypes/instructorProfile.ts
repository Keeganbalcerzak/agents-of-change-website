import { defineArrayMember, defineField, defineType } from "sanity";

export const instructorProfile = defineType({
  name: "instructorProfile",
  title: "Instructor Profile",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "bio", title: "Bio", type: "array", of: [defineArrayMember({ type: "text" })], validation: (r) => r.required().min(1) }),
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.required().min(2),
    }),
    defineField({ name: "imageAlt", title: "Image Alt", type: "string", validation: (r) => r.required() }),
  ],
});
