import { defineField, defineType } from "sanity";

export const categoryNavBlock = defineType({
  name: "categoryNavBlock",
  title: "Category Navigation Block",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Browse by category",
    }),
  ],
});
