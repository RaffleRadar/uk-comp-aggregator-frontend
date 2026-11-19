import { defineField, defineType } from "sanity";
import { ReviewOperatorInput } from "@/sanity/components/review-operator-input";

export const offer = defineType({
  name: "offer",
  title: "Offers",
  type: "document",
  fields: [
    defineField({
      name: "operatorName",
      title: "Operator name",
      type: "string",
      description:
        "Shown on the offer card. Any UK competition site, it does not need to be one we track.",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "operatorId",
      title: "Tracked operator",
      type: "string",
      description:
        "Optional. Pick the operator if we already track it: the card then uses the logo from its operator profile. Leave empty for any other site.",
      components: {
        input: ReviewOperatorInput,
      },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: false },
      description:
        "Square or wide logo on a transparent or plain background. Overrides the operator profile logo. Without any logo the card shows the operator's initials.",
    }),
    defineField({
      name: "title",
      title: "Offer",
      type: "string",
      description: "The headline on the card, for example 20% off car draws.",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "promoCode",
      title: "Promo code",
      type: "string",
      description:
        "Optional. Leave empty when the discount applies without a code.",
      validation: (rule) => rule.max(40).regex(/^\S+$/, { name: "no spaces" }),
    }),
    defineField({
      name: "url",
      title: "Link",
      type: "url",
      description:
        "Where Visit operator goes: the offer page or the operator's site.",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "endsAt",
      title: "Ends",
      type: "datetime",
      description:
        "Optional. The offer disappears from the site after this time. Enter UK time.",
      options: {
        dateFormat: "D MMM YYYY",
        timeFormat: "HH:mm",
        timeStep: 15,
      },
    }),
    defineField({
      name: "terms",
      title: "Terms",
      type: "text",
      rows: 3,
      description:
        "Optional. Restrictions shown under the offer, for example minimum spend.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "isVisible",
      title: "Show on the Offers page",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Ending soon",
      name: "endsAtAsc",
      by: [{ field: "endsAt", direction: "asc" }],
    },
    {
      title: "Operator A–Z",
      name: "operatorAsc",
      by: [{ field: "operatorName", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      operatorName: "operatorName",
      promoCode: "promoCode",
      isVisible: "isVisible",
      media: "logo",
    },
    prepare({ title, operatorName, promoCode, isVisible, media }) {
      const parts = [operatorName, promoCode ? `Code ${promoCode}` : null];
      if (isVisible === false) parts.push("Hidden");
      return {
        title,
        subtitle: parts.filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
