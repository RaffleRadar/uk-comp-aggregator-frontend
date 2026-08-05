import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { RichTitle } from "@/components/sanity/RichTitle";
import { portableTextComponents } from "@/components/sanity/portableTextComponents";
import { sanityClient } from "@/sanity/client";
import { HOW_IT_WORKS_PAGE } from "@/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "How RaffleRadar works",
  description: "How we calculate real odds, value ratios and opportunity scores for UK prize competitions.",
  alternates: { canonical: "/how-it-works" },
};

type HowItWorksPageData = {
  title?: string | null;
  richTitle?: unknown[] | null;
  body?: unknown[] | null;
};

export default async function HowItWorksPage() {
  const page = await sanityClient.fetch<HowItWorksPageData | null>(HOW_IT_WORKS_PAGE);
  const title = page?.title?.trim() || "How It Works";
  const richTitle = page?.richTitle ?? [];
  const hasRichTitle = richTitle.length > 0;
  const body = page?.body ?? [];
  const hasBody = body.length > 0;

  return (
    <main className="bg-rr-bg">
      <section className="py-10">
        <div className="container">
          <div className="mx-auto max-w-[780px] lg:max-w-[860px]">
            {hasRichTitle ? (
              <RichTitle
                value={richTitle}
                as="h1"
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
              />
            ) : (
              <h1 className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl">
                {title}
              </h1>
            )}

            <div className="mt-10">
              {hasBody ? (
                <PortableText value={body} components={portableTextComponents} />
              ) : (
                <p className="text-[15.5px] leading-7 text-rr-secondary">
                  Content for this page will be available soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
