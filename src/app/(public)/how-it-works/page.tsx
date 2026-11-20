import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { PageHero, PAGE_HERO_TITLE_CLASS } from "@/components/layout/page-hero";
import { RichTitle } from "@/components/sanity/RichTitle";
import { FaqPageJsonLd } from "@/components/seo/structured-data";
import { portableTextComponents } from "@/components/sanity/portableTextComponents";
import { titleColorVar } from "@/lib/titleColor";
import { extractFaqFromPortableText } from "@/lib/portable-text-faq";
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
  const faqEntries = extractFaqFromPortableText(body);

  return (
    <main className="bg-rr-bg">
      <FaqPageJsonLd entries={faqEntries} />
      <PageHero
        eyebrow={eyebrow}
        heading={
          hasRichTitle ? (
            <RichTitle value={richTitle} as="h1" className={PAGE_HERO_TITLE_CLASS} />
          ) : undefined
        }
        title={title}
        titleStyle={headingColor ? { color: headingColor } : undefined}
        lead={lead}
      />

      <section className="pb-7 pt-6 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px] [&>*:first-child]:mt-0">
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
