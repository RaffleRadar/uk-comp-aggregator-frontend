import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Pages",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "richTitle",
      title: "Rich Title",
      type: "richTitle",
      description: "Optional. Overrides Title with coloured words support.",
    }),
    defineField({
      name: "heroHeadingColor",
      title: "Hero Heading colour",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Accent (green)", value: "accent" },
          { title: "Positive (green)", value: "good" },
          { title: "Warning (amber)", value: "warn" },
          { title: "Danger (red)", value: "danger" },
          { title: "Muted (grey)", value: "muted" },
        ],
        layout: "dropdown",
      },
      initialValue: "default",
    }),
    defineField({
      name: "heroLead",
      title: "Hero Lead",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroCtaPrimary",
      title: "Hero CTA Primary",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "href",
          title: "Href",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "heroCtaSecondary",
      title: "Hero CTA Secondary",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "href",
          title: "Href",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({ type: "richTextBlock" }),
        defineArrayMember({ type: "statsBlock" }),
        defineArrayMember({ type: "cardsBlock" }),
        defineArrayMember({ type: "stepsBlock" }),
        defineArrayMember({ type: "calloutBlock" }),
        defineArrayMember({ type: "operatorsBlock" }),
        defineArrayMember({ type: "competitionListBlock" }),
        defineArrayMember({ type: "categoryNavBlock" }),
      ],
    }),
    defineField({
      name: "showInCategoryNav",
      title: "Show in category navigation",
      type: "boolean",
      initialValue: false,
      description:
        "Include this page in the browse-by-category strip on other landing pages.",
    }),
    defineField({
      name: "navLabel",
      title: "Navigation label",
      type: "string",
      description: "Short label for the category strip. Defaults to Title.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMeta",
    }),
  ],
});
