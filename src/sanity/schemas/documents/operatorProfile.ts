import { defineArrayMember, defineField, defineType } from "sanity";
import { ReviewOperatorInput } from "@/sanity/components/review-operator-input";

export const operatorProfile = defineType({
  name: "operatorProfile",
  title: "Operator profiles",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "operations", title: "How the operator runs" },
    { name: "editorial", title: "Editorial content" },
    { name: "links", title: "External links" },
  ],
  fields: [
    defineField({
      name: "operatorId",
      title: "Operator",
      type: "string",
      group: "identity",
      description:
        "Select the operator this profile belongs to. One profile per operator.",
      components: { input: ReviewOperatorInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "operatorName",
      title: "Operator name (for this list only)",
      type: "string",
      group: "identity",
      description:
        "Display name inside the Studio. Not shown on the site, the site uses the name from the database.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "identity",
      options: { hotspot: false },
      description:
        "Square or wide logo on a transparent or plain background. Without this the page falls back to a competition image.",
    }),
    defineField({
      name: "registeredCompanyName",
      title: "Registered company name",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "companiesHouseNumber",
      title: "Companies House number",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "foundedYear",
      title: "Founded year",
      type: "number",
      group: "identity",
      validation: (rule) => rule.min(1900).max(2100).integer(),
    }),
    defineField({
      name: "location",
      title: "Location (city / region)",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "verified",
      title: "Verified badge",
      type: "boolean",
      group: "identity",
      initialValue: false,
    }),

    defineField({
      name: "drawMethod",
      title: "Draw method",
      type: "array",
      group: "operations",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Live draw", value: "live" },
          { title: "RNG", value: "rng" },
          { title: "Google random number generator", value: "google-rng" },
          { title: "Third party draw service", value: "third-party" },
          { title: "Instant win", value: "instant" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "drawSchedule",
      title: "Draw schedule",
      type: "array",
      group: "operations",
      of: [defineArrayMember({ type: "string" })],
      description: "One line per slot, for example: Sundays 8pm.",
    }),
    defineField({
      name: "freeEntryUrl",
      title: "Free entry / terms URL",
      type: "url",
      group: "operations",
    }),
    defineField({
      name: "postalFreeEntry",
      title: "Postal free entry available",
      type: "boolean",
      group: "operations",
      initialValue: false,
    }),
    defineField({
      name: "paymentMethods",
      title: "Payment methods",
      type: "array",
      group: "operations",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Visa", value: "visa" },
          { title: "Mastercard", value: "mastercard" },
          { title: "American Express", value: "amex" },
          { title: "Apple Pay", value: "apple-pay" },
          { title: "Google Pay", value: "google-pay" },
          { title: "PayPal", value: "paypal" },
          { title: "Klarna", value: "klarna" },
          { title: "Clearpay", value: "clearpay" },
          { title: "Bank transfer", value: "bank-transfer" },
          { title: "Site wallet / credit", value: "wallet" },
        ],
      },
    }),
    defineField({
      name: "prizeDelivery",
      title: "Prize delivery or collection",
      type: "string",
      group: "operations",
    }),
    defineField({
      name: "voluntaryCodeMembership",
      title: "Voluntary code membership",
      type: "string",
      group: "operations",
      description: "Leave empty if the operator is not a member of any scheme.",
    }),
    defineField({
      name: "responsiblePlayControls",
      title: "Responsible play controls",
      type: "array",
      group: "operations",
      of: [defineArrayMember({ type: "string" })],
      description:
        "One control per line, for example: spend limits, self exclusion, cooling off period.",
    }),
    defineField({
      name: "publicEntryLists",
      title: "Public entry lists",
      type: "boolean",
      group: "operations",
      initialValue: false,
    }),
    defineField({
      name: "winnersPublished",
      title: "Winners published",
      type: "boolean",
      group: "operations",
      initialValue: false,
    }),

    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "editorial",
      description:
        "One or two sentences. Used as the page meta description, keep it under 160 characters.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "fullProfile",
      title: "Full profile text",
      type: "array",
      group: "editorial",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "pros",
      title: "Pros",
      type: "array",
      group: "editorial",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "cons",
      title: "Cons",
      type: "array",
      group: "editorial",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "bestFor",
      title: "Best for",
      type: "string",
      group: "editorial",
      description: "Short line, for example: cars, tech, low cost entries.",
    }),

    defineField({
      name: "trustpilotUrl",
      title: "Trustpilot URL",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "trustpilotScore",
      title: "Trustpilot score",
      type: "number",
      group: "links",
      description:
        "Manual entry, one decimal place. Trustpilot does not allow automatic collection on the current plan.",
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "tiktokUrl",
      title: "TikTok",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "supportEmail",
      title: "Support email",
      type: "string",
      group: "links",
      validation: (rule) =>
        rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          name: "email",
          invert: false,
        }),
    }),
  ],
  preview: {
    select: {
      title: "operatorName",
      subtitle: "location",
      media: "logo",
    },
  },
});
