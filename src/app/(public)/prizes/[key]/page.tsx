import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrizeCompareControls } from "@/components/prizes/prize-compare-controls";
import { PrizeComparisonTable } from "@/components/prizes/prize-comparison-table";
import { PrizeFaq } from "@/components/prizes/prize-faq";
import { PrizeHeader } from "@/components/prizes/prize-header";
import { PrizeHistoryBlocks } from "@/components/prizes/prize-history";
import { PrizeSearchAnother } from "@/components/prizes/prize-search-another";
import { PrizeSummaryTiles } from "@/components/prizes/prize-summary-tiles";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { getOperatorLogos } from "@/lib/operator-logos";
import { resolvePrizeSeo } from "@/lib/prize-seo";
import {
  getPrizePage,
  parseHistoryDays,
  parsePrizeSort,
  parsePrizeSpend,
  type PrizePageState,
} from "@/lib/prizes";
import { getPrizePageContent } from "@/sanity/prize-pages";

export const revalidate = 300;

type SearchValue = string | string[] | undefined;

type PageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{
    history?: SearchValue;
    spend?: SearchValue;
    sort?: SearchValue;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { key } = await params;
  const [page, content] = await Promise.all([
    getPrizePage(key),
    getPrizePageContent(key),
  ]);

  if (!page) {
    return {
      title: "Prize not found | RaffleRadar",
      robots: { index: false, follow: false },
    };
  }

  const { title, description } = resolvePrizeSeo(page, content);
  const path = `/prizes/${page.prize.key}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: buildOpenGraph({
      title,
      description,
      path,
      image: page.prize.imageUrl,
    }),
    twitter: buildTwitter({ title, description, image: page.prize.imageUrl }),
  };
}

export default async function PrizePageRoute({
  params,
  searchParams,
}: PageProps) {
  const { key } = await params;
  const query = await searchParams;
  const requested: PrizePageState = {
    history: parseHistoryDays(query.history),
    spend: parsePrizeSpend(query.spend),
    sort: parsePrizeSort(query.sort),
  };

  const [page, logos, content] = await Promise.all([
    getPrizePage(key, requested),
    getOperatorLogos(),
    getPrizePageContent(key),
  ]);

  if (!page) notFound();

  const seo = resolvePrizeSeo(page, content);

  const state: PrizePageState = {
    history: requested.history,
    spend: page.spend ?? null,
    sort: parsePrizeSort(page.sort),
  };

  return (
    <main className="bg-rr-bg">
      <PrizeHeader page={page} lead={seo.intro} />
      <PrizeSummaryTiles page={page} />
      {page.draws.length > 0 ? (
        <PrizeCompareControls prizeKey={page.prize.key} state={state} />
      ) : null}
      <PrizeComparisonTable page={page} logos={logos} />
      <PrizeHistoryBlocks
        prizeKey={page.prize.key}
        state={state}
        history={page.history}
        priceComparison={page.priceComparison}
      />
      <PrizeFaq faqs={seo.faqs} />
      <PrizeSearchAnother />
    </main>
  );
}
