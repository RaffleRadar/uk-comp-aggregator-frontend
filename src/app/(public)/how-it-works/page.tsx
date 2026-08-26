import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { RichTitle } from "@/components/sanity/RichTitle";
import { portableTextComponents } from "@/components/sanity/portableTextComponents";
import { titleColorVar } from "@/lib/titleColor";
import { sanityClient } from "@/sanity/client";
import { HOW_IT_WORKS_PAGE } from "@/sanity/queries";
import {
  applyLiveFigures,
  applyLiveFiguresToPortableText,
  getLiveFigures,
} from "@/lib/live-figures";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "How RaffleRadar works",
  description: "How we calculate real odds, value ratios and opportunity scores for UK prize competitions.",
  alternates: { canonical: "/how-it-works" },
};

type HowItWorksPageData = {
  title?: string | null;
  heroEyebrow?: string | null;
  richTitle?: unknown[] | null;
  heroHeadingColor?: string | null;
  heroLead?: string | null;
  body?: unknown[] | null;
};

export default async function HowItWorksPage() {
  const [page, figures] = await Promise.all([
    sanityClient.fetch<HowItWorksPageData | null>(HOW_IT_WORKS_PAGE),
    getLiveFigures(),
  ]);
  const title = page?.title?.trim() || "How It Works";
  const eyebrow = page?.heroEyebrow?.trim() || "";
  const lead = page?.heroLead?.trim()
    ? applyLiveFigures(page.heroLead.trim(), figures)
    : "";
  const richTitle = page?.richTitle ?? [];
  const hasRichTitle = richTitle.length > 0;
  const headingColor = titleColorVar(page?.heroHeadingColor);
  const body = applyLiveFiguresToPortableText(page?.body ?? [], figures);
  const hasBody = body.length > 0;

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-7 md:py-8">
          <div className="mx-auto max-w-[760px] text-center">
            {eyebrow ? (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-rr-green">
                {eyebrow}
              </p>
            ) : null}

            {hasRichTitle ? (
              <RichTitle
                value={richTitle}
                as="h1"
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
              />
            ) : (
              <h1
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {title}
              </h1>
            )}

            {lead ? (
              <p className="mx-auto mt-5 max-w-[680px] text-base leading-7 text-rr-secondary md:text-lg">
                {lead}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-7">
        <div className="container">
          <div className="mx-auto max-w-[880px]">
            {hasBody ? (
              <PortableText value={body} components={portableTextComponents} />
            ) : (
              <p className="text-[15.5px] leading-7 text-rr-secondary">
                Content for this page will be available soon.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
