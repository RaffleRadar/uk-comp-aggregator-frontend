import { defineField, defineType } from "sanity";

export const competitionListBlock = defineType({
  name: "competitionListBlock",
  title: "Competition List Block",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description:
        "Single category or comma separated list, e.g. cars or cars,bikes,motorhomes,vans,boats,plant. Leave empty for all categories.",
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "string",
      options: {
        list: [
          { title: "Any", value: "" },
          { title: "Today", value: "today" },
          { title: "3 days", value: "3days" },
          { title: "5 days", value: "5days" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "sortBy",
      title: "Sort by",
      type: "string",
      options: {
        list: [
          { title: "Best value", value: "valueRatio" },
          { title: "Ending soon", value: "endsAt" },
          { title: "Top prizes", value: "prizeValue" },
          { title: "Best odds", value: "percentSold" },
        ],
        layout: "dropdown",
      },
      initialValue: "valueRatio",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "string",
      options: {
        list: [
          { title: "Descending", value: "desc" },
          { title: "Ascending", value: "asc" },
        ],
        layout: "dropdown",
      },
      initialValue: "desc",
    }),
    defineField({
      name: "excludeGames",
      title: "Exclude instant win games",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "emptyMessage",
      title: "Empty state message",
      type: "text",
      rows: 2,
      description:
        "Shown when the filter returns nothing. Required for time-based pages such as ending today.",
    }),
  ],
});
