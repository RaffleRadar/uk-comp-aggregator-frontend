import { Suspense } from "react";
import {
  CompetitionGrid,
  CompetitionResultsHeading,
  resolveCompetitionOperatorLabel,
} from "@/components/competitions/competition-grid";
import { CompetitionSection } from "@/components/home/competition-section";
import { Hero, type HeroStats } from "@/components/home/hero";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  getCompetitions,
  getMostUndersold,
  getOperators,
  getRecentlyEnded,
  getStats,
  getTopOpportunities,
} from "@/lib/api";
import type { Competition } from "@/types/competition";

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
        limit: 4,
        excludeGames: true,
      }),
      getRecentlyEnded(8),
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
    ]);

    topOpportunities = topOpportunitiesResult as Competition[];
    topPrizes = topPrizesResult as Competition[];
    undersold = undersoldResult as Competition[];
    recentlyEnded = recentlyEndedResult as Competition[];
    bestValue = bestValueResult as Competition[];
    endingToday = endingTodayResult as Competition[];
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
  }

  return (
    <main>
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>
      <Hero stats={stats} />
      <CompetitionSection
        titleStart="Top"
        titleAccent="Opportunities"
        subtitle="Best chances to win right now"
        viewAllHref="/competitions?section=top-opportunities&sortBy=opportunityScore&sortOrder=desc&excludeInstant=true&excludeFree=true"
        competitions={topOpportunities}
      />
      <CompetitionSection
        titleStart="Most undersold"
        titleAccent="ending soon"
        subtitle="Low ticket sales, closing within 3 days — your best odds right now"
        viewAllHref="/competitions?section=most-undersold&sortBy=percentSold&sortOrder=asc&excludeInstant=true&excludeFree=true"
        competitions={undersold}
      />
      <CompetitionSection
        titleStart="Recent"
        titleAccent="draws"
        subtitle="Just finished — how they sold before the draw"
        viewAllHref="/recent-draws"
        competitions={recentlyEnded}
        cardVariant="ended"
      />
      <CompetitionSection
        titleStart="Top Prizes"
        titleAccent="right now"
        subtitle="The biggest draws right now — cars, homes and bikes worth winning"
        viewAllHref="/competitions?section=top-prizes&minPrizeValue=5000&category=cars,houses,bikes&sortBy=prizeValue&sortOrder=desc"
        competitions={topPrizes}
      />
      <CompetitionSection
        titleStart="Selling"
        titleAccent="fast"
        subtitle="These competitions are almost gone — very few tickets left, so act fast"
        viewAllHref="/competitions?section=selling-fast&sortBy=percentSold&sortOrder=desc&excludeInstant=true&excludeFree=true"
        competitions={bestValue}
      />
      <CompetitionSection
        titleStart="Ending"
        titleAccent="today"
        subtitle="Last chance — these draws close tonight"
        viewAllHref="/competitions?section=ending-today&sortBy=endsAt&sortOrder=asc&closing=today&excludeInstant=true&excludeFree=true"
        competitions={endingToday}
        accentTone="red"
      />
    </main>
  );
}
