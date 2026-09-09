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
          { title: "Best Value", value: "valueRatio" },
          { title: "Ending Soon", value: "endsAt" },
          { title: "Best Odds", value: "ticketsTotal" },
          { title: "Most Undersold", value: "percentSold" },
          { title: "Top Prizes", value: "prizeValue" },
          { title: "Lowest Ticket Price", value: "ticketPrice" },
          { title: "Newest", value: "createdAt" },
          { title: "Most Tickets Left", value: "ticketsLeft" },
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
      name: "limit",
      title: "Number of competitions to show",
      type: "number",
      initialValue: 12,
      validation: (rule) => rule.min(1).max(100),
      description:
        "Keeps the page short so the text below stays visible. Default 12.",
    }),
    defineField({
      name: "emptyMessage",
      title: "Empty state message",
      type: "text",
      rows: 2,
      description:
        "Shown when the filter returns nothing. Required for time-based pages such as ending today.",
    }),
    defineField({
      name: "showFallbackWhenEmpty",
      title: "Show nearest competitions when empty",
      type: "boolean",
      initialValue: true,
      description:
        "When the closing filter returns nothing, show the next competitions to close instead of an empty page.",
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      description:
        "Answers can use {count}, {cheapestTicket}, {topPrize}, {operatorCount}, {averageTicket}. Values are filled in from live data.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),
  ],
});
