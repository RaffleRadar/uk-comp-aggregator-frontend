import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType(
  {
    name: "siteSettings",
    title: "Site Settings",
    type: "document",
    __experimental_actions: ["update", "publish"],
    fields: [
    defineField({
      name: "navLinks",
      title: "Nav Links",
      type: "array",
      of: [
        defineArrayMember({
          name: "navLink",
          title: "Nav Link",
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
          preview: {
            select: {
              title: "label",
              subtitle: "href",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "footerLinks",
      title: "Footer Links",
      type: "array",
      of: [
        defineArrayMember({
          name: "footerLink",
          title: "Footer Link",
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
          preview: {
            select: {
              title: "label",
              subtitle: "href",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "footerColumns",
      title: "Footer Columns",
      type: "array",
      of: [
        defineArrayMember({
          name: "footerColumn",
          title: "Footer Column",
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Column Heading",
              type: "string",
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                defineArrayMember({
                  name: "footerColumnLink",
                  title: "Footer Column Link",
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
                      title: "URL or path",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: "label",
                      subtitle: "href",
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: "heading",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "footerCopyright",
      title: "Footer Copyright",
      type: "string",
    }),
    defineField({
      name: "footerDisclaimer",
      title: "Footer disclaimer (e.g. 18+ / responsible play)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "footerTagline",
      title: "Footer tagline (under the logo)",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image (1200x630)",
      description:
        "Shown when a link to the site is shared on WhatsApp, Facebook, X or Slack. Upload a 1200x630 image. Keep the centre clear and avoid small text, as it displays very small in some apps.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "maintenanceMode",
      title: "Maintenance mode (show holding page to visitors)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "maintenanceMessage",
      title: "Maintenance message (shown on holding page)",
      type: "text",
      rows: 3,
    }),
    ],
  },
  { strict: false },
);
