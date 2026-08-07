import type { ReactNode } from "react";
import { defineArrayMember, defineField, defineType } from "sanity";

function createColorDecorator(title: string, value: string, color: string) {
  return {
    title,
    value,
    icon: () => <span style={{ color, fontWeight: 700 }}>A</span>,
    component: (props: { children?: ReactNode }) => (
      <span style={{ color }}>{props.children}</span>
    ),
  };
}

const colorDecorators = [
  createColorDecorator("Accent (green)", "colorAccent", "#22C55E"),
  createColorDecorator("Positive (green)", "colorGood", "#22C55E"),
  createColorDecorator("Warning (amber)", "colorWarn", "#F59E0B"),
  createColorDecorator("Danger (red)", "colorDanger", "#EF4444"),
  createColorDecorator("Muted (grey)", "colorMuted", "#94A3B8"),
];

export const post = defineType({
  name: "post",
  title: "Blog Posts",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "titleColor",
      title: "Title colour",
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
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "News", value: "news" },
          { title: "Analysis", value: "analysis" },
          { title: "Industry", value: "industry" },
          { title: "Tips", value: "tips" },
          { title: "Radar Updates", value: "radar-updates" },
        ],
      },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
              ...colorDecorators,
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMeta",
    }),
  ],
});
