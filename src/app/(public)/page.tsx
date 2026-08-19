import { Suspense } from "react";
import type { Metadata } from "next";
import {
  CompetitionGrid,
  CompetitionResultsHeading,
  resolveCompetitionOperatorLabel,
} from "@/components/competitions/competition-grid";
import { CompetitionSection } from "@/components/home/competition-section";
import { Hero, type HeroStats } from "@/components/home/hero";
import { FilterBar } from "@/components/layout/filter-bar";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/structured-data";
import {
  getCompetitions,
  getMostUndersold,
  getOperators,
  getRecentlyEnded,
  getStats,
  getTopOpportunities,
} from "@/lib/api";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { getSiteContent as getSanitySiteContent } from "@/sanity/queries";
import type { Competition } from "@/types/competition";

const ogTitle = "RaffleRadar | UK Competitions & Prize Draw Finder";
const ogDescription = "Compare live UK prize draws by real odds and real value. No noise, just the numbers.";

export const metadata: Metadata = {
  title: ogTitle,
  description:
    "Compare live UK prize draws by real odds and real value. See which competitions are undersold, which are closing soon, and which offer the best value for money.",
  alternates: { canonical: "/" },
  openGraph: buildOpenGraph({
    title: ogTitle,
    description: ogDescription,
    path: "/",
  }),
  twitter: buildTwitter({
    title: ogTitle,
    description: ogDescription,
  }),
};

type HomePageSearchParams = {
  category?: string;
  closing?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  operator?: string;
  minPrizeValue?: string;
  freeOnly?: string;
  excludeInstant?: string;
  excludeFree?: string;
  section?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<HomePageSearchParams>;
}) {
  const params = await searchParams;
  const hasFilters = !!(
    params.category ||
    params.closing ||
    params.search ||
    params.sortBy ||
    params.sortOrder ||
    params.operator ||
    params.minPrizeValue ||
    params.freeOnly ||
    params.excludeInstant ||
    params.excludeFree ||
    params.section
  );
  const includesGamesCategory =
    params.category?.split(",").some((value) => value.trim().toLowerCase() === "games") ??
    false;

  if (hasFilters) {
    const operatorLabel = await resolveCompetitionOperatorLabel(params);

    return (
      <main>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
        <CompetitionResultsHeading
          params={params}
          operatorLabel={operatorLabel}
        />
        <Suspense fallback={null}>
          <CompetitionGrid
            params={{
              category: params.category,
              closing: params.closing,
              search: params.search,
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
              operator: params.operator,
              minPrizeValue: params.minPrizeValue
                ? Number(params.minPrizeValue)
                : undefined,
              freeOnly: params.freeOnly === "true",
              excludeInstant: params.excludeInstant === "true",
              excludeFree: params.excludeFree === "true",
              excludeGames: !includesGamesCategory,
              limit: 500,
            }}
          />
        </Suspense>
      </main>
    );
  }

  let topOpportunities: Competition[] = [];
  let topPrizes: Competition[] = [];
  let undersold: Competition[] = [];
  let recentlyEnded: Competition[] = [];
  let bestValue: Competition[] = [];
  let endingToday: Competition[] = [];
  let siteContent = null;
  let stats: HeroStats = {
    competitionsCount: 0,
    operatorsCount: 0,
    lastUpdatedAt: null,
  };

  try {
    const [
      topOpportunitiesResult,
      topPrizesResult,
      undersoldResult,
      recentlyEndedResult,
      bestValueResult,
      endingTodayResult,
      statsResult,
      operatorsResult,
      siteContentResult,
    ] = await Promise.all([
      getTopOpportunities({
        limit: 8,
        excludeGames: true,
      }),
      getCompetitions({
        minPrizeValue: 5000,
        category: "cars,houses,bikes",
        sortBy: "prizeValue",
        sortOrder: "desc",
        excludeGames: true,
        limit: 8,
      }),
      getMostUndersold({
        limit: 8,
        excludeGames: true,
      }),
      getRecentlyEnded(4),
      getCompetitions({
        sortBy: "percentSold",
        sortOrder: "desc",
        excludeInstant: true,
        excludeFree: true,
        excludeGames: true,
        limit: 4,
      }),
      getCompetitions({
        sortBy: "endsAt",
        sortOrder: "asc",
        closing: "today",
        excludeInstant: true,
        excludeFree: true,
        excludeGames: true,
        limit: 4,
      }),
      getStats(),
      getOperators(),
      getSanitySiteContent(),
    ]);

    topOpportunities = topOpportunitiesResult as Competition[];
    topPrizes = topPrizesResult as Competition[];
    undersold = undersoldResult as Competition[];
    recentlyEnded = recentlyEndedResult as Competition[];
    bestValue = bestValueResult as Competition[];
    endingToday = endingTodayResult as Competition[];
    siteContent = siteContentResult;
    stats = {
      ...statsResult,
      operatorsCount: operatorsResult.filter(
        (operator) => (operator.activeCompetitionsCount ?? 0) > 0,
      ).length,
    };
  } catch {
    topOpportunities = [];
    topPrizes = [];
    undersold = [];
    recentlyEnded = [];
    bestValue = [];
    endingToday = [];
    siteContent = null;
  }

  try {
    siteContent = siteContent ?? (await getSanitySiteContent());
  } catch {
    siteContent = siteContent ?? null;
  }

  const heroCopy = {
    heroEyebrow: siteContent?.heroEyebrow ?? undefined,
    heroHeadingMobile: siteContent?.heroHeadingMobile ?? undefined,
    heroHeadingDesktop: siteContent?.heroHeadingDesktop ?? undefined,
    heroSubheading: siteContent?.heroSubheading ?? undefined,
  };

  return (
    <main>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>
      <Hero stats={stats} copy={heroCopy} />
      <CompetitionSection
        titleStart={siteContent?.section1TitleStart?.trim() || "Top"}
        titleAccent={siteContent?.section1TitleAccent?.trim() || "Opportunities"}
        subtitle={siteContent?.section1Subtitle?.trim() || "Best chances to win right now"}
        viewAllHref="/competitions?section=top-opportunities&sortBy=opportunityScore&sortOrder=desc"
        competitions={topOpportunities}
      />
      <CompetitionSection
        titleStart={siteContent?.section2TitleStart?.trim() || "Most undersold"}
        titleAccent={siteContent?.section2TitleAccent?.trim() || "ending soon"}
        subtitle={siteContent?.section2Subtitle?.trim() || "Low ticket sales, closing within 3 days — your best odds right now"}
        viewAllHref="/competitions?section=most-undersold&sortBy=percentSold&sortOrder=asc"
        competitions={undersold}
      />
      <CompetitionSection
        titleStart={siteContent?.section4TitleStart?.trim() || "Top Prizes"}
        titleAccent={siteContent?.section4TitleAccent?.trim() || "right now"}
        subtitle={siteContent?.section4Subtitle?.trim() || "The biggest draws right now — cars, homes and bikes worth winning"}
        viewAllHref="/competitions?section=top-prizes&minPrizeValue=5000&category=cars,houses,bikes&sortBy=prizeValue&sortOrder=desc"
        competitions={topPrizes}
      />
      <CompetitionSection
        titleStart={siteContent?.section5TitleStart?.trim() || "Selling"}
        titleAccent={siteContent?.section5TitleAccent?.trim() || "fast"}
        subtitle={siteContent?.section5Subtitle?.trim() || "These competitions are almost gone — very few tickets left, so act fast"}
        viewAllHref="/competitions?section=selling-fast&sortBy=percentSold&sortOrder=desc&excludeInstant=true&excludeFree=true"
        competitions={bestValue}
      />
      <CompetitionSection
        titleStart={siteContent?.section6TitleStart?.trim() || "Ending"}
        titleAccent={siteContent?.section6TitleAccent?.trim() || "today"}
        subtitle={siteContent?.section6Subtitle?.trim() || "Last chance — these draws close tonight"}
        viewAllHref="/competitions?section=ending-today&sortBy=endsAt&sortOrder=asc&closing=today&excludeInstant=true&excludeFree=true"
        competitions={endingToday}
        accentTone="red"
      />
      <CompetitionSection
        titleStart={siteContent?.section3TitleStart?.trim() || "Recent"}
        titleAccent={siteContent?.section3TitleAccent?.trim() || "draws"}
        subtitle={siteContent?.section3Subtitle?.trim() || "Just finished — how they sold before the draw"}
        viewAllHref="/recent-draws"
        competitions={recentlyEnded}
        cardVariant="ended"
      />
    </main>
  );
}
