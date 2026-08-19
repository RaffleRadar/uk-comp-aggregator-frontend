import { Suspense } from "react";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  CompetitionGrid,
  CompetitionResultsHeading,
  resolveCompetitionOperatorLabel,
} from "@/components/competitions/competition-grid";
import { NewsletterSignupBanner } from "@/components/competitions/newsletter-signup-banner";
import { SaveSearchButton } from "@/components/competitions/save-search-button";
import { FilterBar } from "@/components/layout/filter-bar";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { getSiteContent } from "@/sanity/queries";

const COMPETITIONS_OG_TITLE = "UK Prize Competitions & Draws | RaffleRadar";
const COMPETITIONS_OG_DESCRIPTION =
  "Find live UK prize competitions in one place. Compare entry prices, prize values, tickets remaining and closing dates across leading competition sites.";

const NO_FILTER_BASE_METADATA: Metadata = {
  title: COMPETITIONS_OG_TITLE,
  description: COMPETITIONS_OG_DESCRIPTION,
  alternates: { canonical: "/competitions" },
  openGraph: buildOpenGraph({
    title: COMPETITIONS_OG_TITLE,
    description: COMPETITIONS_OG_DESCRIPTION,
    path: "/competitions",
  }),
  twitter: buildTwitter({
    title: COMPETITIONS_OG_TITLE,
    description: COMPETITIONS_OG_DESCRIPTION,
  }),
};

const FILTER_ROBOT_KEYS = [
  "category",
  "closing",
  "search",
  "sortBy",
  "sortOrder",
  "operator",
  "minPrizeValue",
  "freeOnly",
  "excludeInstant",
  "excludeFree",
  "section",
] as const;

export async function generateMetadata({ searchParams }: { searchParams: Promise<CompetitionsPageSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const hasFilter = FILTER_ROBOT_KEYS.some((key) => {
    const value = params[key];
    return typeof value === "string" && value.trim().length > 0;
  });
  if (!hasFilter) return NO_FILTER_BASE_METADATA;
  return {
    ...NO_FILTER_BASE_METADATA,
    robots: { index: false, follow: true },
  };
}

type CompetitionsPageSearchParams = {
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

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<CompetitionsPageSearchParams>;
}) {
  let competitionsIntro: string | null = null;
  const params = await searchParams;
  const suspenseKey = JSON.stringify(params);
  const operatorSlug = params.operator?.trim() || undefined;
  const includesGamesCategory =
    params.category
      ?.split(",")
      .some((value) => value.trim().toLowerCase() === "games") ?? false;

  const defaultSortOrderBySortBy: Record<string, "asc" | "desc"> = {
    bestValue: "desc",
    valueRatio: "desc",
    opportunityScore: "desc",
    prizeValue: "desc",
    endsAt: "asc",
    ticketsLeft: "desc",
    ticketPrice: "asc",
    percentSold: "asc",
    createdAt: "desc",
  };

  const closing = params.closing ?? "";
  const searchTerm = params.search?.trim() || undefined;
  const sortBy = params.sortBy ?? "valueRatio";
  const sortOrder =
    (params.sortOrder as "asc" | "desc" | undefined) ??
    defaultSortOrderBySortBy[sortBy] ??
    "desc";

  const trimmedSection = params.section?.trim() || "";
  const defaultClosingBySection: Record<string, string> = {
    "ending-today": "today",
    "most-undersold": "3days",
  };
  const defaultClosing = defaultClosingBySection[trimmedSection];
  const shouldApplyDefaultClosing = !searchTerm && Boolean(defaultClosing);
  const needsRedirect =
    !params.sortBy ||
    !params.sortOrder ||
    (shouldApplyDefaultClosing && !params.closing);

  if (needsRedirect) {
    const nextParams = new URLSearchParams();

    if (params.category) nextParams.set("category", params.category);
    if (searchTerm) nextParams.set("search", searchTerm);
    if (operatorSlug) nextParams.set("operator", operatorSlug);
    if (params.minPrizeValue)
      nextParams.set("minPrizeValue", params.minPrizeValue);
    if (params.freeOnly) nextParams.set("freeOnly", params.freeOnly);
    if (params.excludeInstant)
      nextParams.set("excludeInstant", params.excludeInstant);
    if (params.excludeFree) nextParams.set("excludeFree", params.excludeFree);
    if (trimmedSection) nextParams.set("section", trimmedSection);
    if (params.closing) nextParams.set("closing", params.closing);
    else if (shouldApplyDefaultClosing) nextParams.set("closing", defaultClosing);

    nextParams.set("sortBy", sortBy);
    nextParams.set("sortOrder", sortOrder);

    redirect(`/competitions?${nextParams.toString()}`);
  }

  const operatorLabel = await resolveCompetitionOperatorLabel({
    category: params.category,
    closing,
    search: searchTerm,
    sortBy,
    sortOrder,
    operator: operatorSlug,
    minPrizeValue: params.minPrizeValue,
    freeOnly: params.freeOnly,
    excludeInstant: params.excludeInstant,
    excludeFree: params.excludeFree,
    section: params.section,
  });

  const resetOperatorParams = new URLSearchParams();
  if (params.category) resetOperatorParams.set("category", params.category);
  if (params.closing) resetOperatorParams.set("closing", params.closing);
  if (searchTerm) resetOperatorParams.set("search", searchTerm);
  if (params.sortBy) resetOperatorParams.set("sortBy", params.sortBy);
  if (params.sortOrder) resetOperatorParams.set("sortOrder", params.sortOrder);
  if (params.minPrizeValue)
    resetOperatorParams.set("minPrizeValue", params.minPrizeValue);
  if (params.freeOnly) resetOperatorParams.set("freeOnly", params.freeOnly);
  if (params.excludeInstant)
    resetOperatorParams.set("excludeInstant", params.excludeInstant);
  if (params.excludeFree)
    resetOperatorParams.set("excludeFree", params.excludeFree);
  if (params.section) resetOperatorParams.set("section", params.section);
  const resetOperatorHref = resetOperatorParams.toString()
    ? `/competitions?${resetOperatorParams.toString()}`
    : "/competitions";

  try {
    const siteContent = await getSiteContent();
    competitionsIntro = siteContent?.competitionsIntro?.trim() || null;
  } catch {
    competitionsIntro = null;
  }

  return (
    <main>
      {competitionsIntro ? (
        <div className="container">
          <p className="mt-3 hidden max-w-[600px] text-base leading-7 text-rr-secondary md:mt-6 md:block md:text-lg">
            {competitionsIntro}
          </p>
        </div>
      ) : null}
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      <Suspense fallback={null}>
        <SaveSearchButton />
      </Suspense>

      <CompetitionResultsHeading
        params={{
          category: params.category,
          closing,
          search: searchTerm,
          sortBy,
          sortOrder,
          operator: operatorSlug,
          minPrizeValue: params.minPrizeValue,
          freeOnly: params.freeOnly,
          excludeInstant: params.excludeInstant,
          excludeFree: params.excludeFree,
          section: params.section,
        }}
        operatorLabel={operatorLabel}
        resetOperatorHref={resetOperatorHref}
        showBackButton
        backHref="/"
      />

      <section className="pt-4">
        <div className="container">
          <NewsletterSignupBanner />
        </div>
      </section>

      <Suspense
        key={suspenseKey}
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center bg-rr-bg">
            <RadarLoader size="lg" />
          </div>
        }
      >
        <CompetitionGrid
          params={{
            category: params.category,
            closing,
            search: searchTerm,
            operator: operatorSlug,
            sortBy,
            sortOrder,
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
