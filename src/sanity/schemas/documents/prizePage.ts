import { defineField, defineType } from "sanity";

const PRIZE_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;

const FIGURES_HELP =
  "You can use {prize}, {liveDraws}, {operators}, {cheapestEntry}, {cheapestOperator}, {bestOdds} and {bestOddsOperator}. They are filled in from live data. If a figure is not available, for example when no draw is live, the automatic text is shown instead.";

export const prizePage = defineType({
  name: "prizePage",
  title: "Prize pages",
  type: "document",
  fields: [
    defineField({
      name: "prizeKey",
      title: "Prize",
      type: "string",
      description:
        "The part of the prize page address after /prizes/, for example nintendo-switch-2.",
      validation: (rule) =>
        rule
          .required()
          .regex(PRIZE_KEY_PATTERN, {
            name: "lowercase letters, digits and hyphens",
          })
          .custom(async (value, context) => {
            if (!value) return true;
            const id = (context.document?._id ?? "").replace(/^drafts\./, "");
            const client = context.getClient({ apiVersion: "2024-01-01" });
            const count = await client.fetch<number>(
              `count(*[_type == "prizePage" && prizeKey == $key && !(_id in [$id, $draft])])`,
              { key: value, id, draft: `drafts.${id}` },
            );
            return count === 0 || "This prize already has an entry.";
          }),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      description: `Optional. Shown in Google and the browser tab. Left empty: {prize} Competitions UK | RaffleRadar. ${FIGURES_HELP}`,
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      description: `Optional. Shown under the title in Google. Left empty, it is written from live data. ${FIGURES_HELP}`,
      validation: (rule) => rule.max(170),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 4,
      description: `Optional. Shown under the prize name at the top of the page. Left empty, the SEO description is used. ${FIGURES_HELP}`,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      description: `Optional. Left empty, the page shows standard questions answered from live data. ${FIGURES_HELP}`,
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
            select: { title: "question", subtitle: "answer" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "prizeKey", subtitle: "seoTitle" },
  },
});
