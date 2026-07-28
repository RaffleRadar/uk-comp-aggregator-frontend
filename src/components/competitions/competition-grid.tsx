import { IconArrowLeft, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { CompetitionGridClient } from "@/components/competitions/competition-grid-client";
import { getCompetitions } from "@/lib/api";
import type { GetCompetitionsParams } from "@/lib/api";
import { cn } from "@/lib/cn";
import { getCompetitionSortPresentation } from "@/lib/competition-sort";
import type { Competition } from "@/types/competition";

export type CompetitionResultsHeadingParams = {
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

const sectionBaseTitles: Record<string, string> = {
  "most-undersold": "Most Undersold",
  "top-opportunities": "Top Opportunities",
  "top-prizes": "Top Prizes",
  "selling-fast": "Selling Fast",
  "ending-today": "Ending Today",
  "recent-draws": "Recent Draws",
};

const sectionDefaultSorts: Record<
  string,
  { sortBy: string; sortOrder: "asc" | "desc" }
> = {
  "most-undersold": { sortBy: "percentSold", sortOrder: "asc" },
  "top-opportunities": { sortBy: "opportunityScore", sortOrder: "desc" },
  "top-prizes": { sortBy: "prizeValue", sortOrder: "desc" },
  "selling-fast": { sortBy: "percentSold", sortOrder: "desc" },
  "ending-today": { sortBy: "endsAt", sortOrder: "asc" },
  "recent-draws": { sortBy: "bestValue", sortOrder: "desc" },
};

const categoryLabelMap: Record<string, string> = {
  cars: "Cars",
  houses: "Houses",
  bikes: "Bikes",
  watches: "Watches",
  cash: "Cash",
  tech: "Tech",
  other: "Other",
};

function titleCaseValue(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function joinTitleLabels(values: string[]) {
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} & ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} & ${values[values.length - 1]}`;
}

function getCategoryTitleLabel(category?: string) {
  if (!category) return null;
  const values = category
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return joinTitleLabels(
    values.map(
      (value) => categoryLabelMap[value.toLowerCase()] ?? titleCaseValue(value),
    ),
  );
}

function formatOperatorLabel(slug: string) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function resolveCompetitionOperatorLabel(
  params: CompetitionResultsHeadingParams,
) {
  const operatorSlug = params.operator?.trim() || undefined;
  const includesGamesCategory =
    params.category
      ?.split(",")
      .some((value) => value.trim().toLowerCase() === "games") ?? false;

  if (!operatorSlug) {
    return null;
  }

  const fallbackLabel = formatOperatorLabel(operatorSlug);

  try {
    const matchesResponse = await getCompetitions({
      category: params.category,
      closing: params.closing,
      search: params.search,
      operator: operatorSlug,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      minPrizeValue: params.minPrizeValue
        ? Number(params.minPrizeValue)
        : undefined,
      freeOnly: params.freeOnly === "true",
      excludeInstant: params.excludeInstant === "true",
      excludeFree: params.excludeFree === "true",
      excludeGames: !includesGamesCategory,
      limit: 1,
    });
    const matches = Array.isArray(matchesResponse) ? matchesResponse : [];

    return matches[0]?.operator?.name ?? fallbackLabel;
  } catch {
    return fallbackLabel;
  }
}

export function CompetitionResultsHeading({
  params,
  operatorLabel,
  resetOperatorHref,
  showBackButton = false,
  backHref = "/",
}: {
  params: CompetitionResultsHeadingParams;
  operatorLabel?: string | null;
  resetOperatorHref?: string;
  showBackButton?: boolean;
  backHref?: string;
}) {
  const sortBy = params.sortBy ?? "valueRatio";
  const sortOrder = (params.sortOrder as "asc" | "desc" | undefined) ?? "desc";
  const section = params.section?.trim() || "";
  const searchTerm = params.search?.trim() || undefined;
  const baseTitle = searchTerm
    ? `Search results for "${searchTerm}"`
    : (sectionBaseTitles[section] ?? "All Competitions");
  const filterLabels = [
    getCategoryTitleLabel(params.category),
    operatorLabel ?? null,
    params.minPrizeValue
      ? (() => {
          const value = Number(params.minPrizeValue);
          return Number.isFinite(value)
            ? `£${value.toLocaleString("en-GB")}+`
            : null;
        })()
      : null,
    params.freeOnly === "true" ? "Free" : null,
  ].filter((value): value is string => Boolean(value));
  const sectionDefaultSort = sectionDefaultSorts[section];
  const sortMatchesSectionDefault =
    sectionDefaultSort !== undefined &&
    sectionDefaultSort.sortBy === sortBy &&
    sectionDefaultSort.sortOrder === sortOrder;
  const sortPresentation = getCompetitionSortPresentation({
    sortBy,
    sortOrder,
    excludeInstant: params.excludeInstant === "true",
    excludeFree: params.excludeFree === "true",
  });
  const sortSuffix = sortMatchesSectionDefault
    ? null
    : (sortPresentation?.headingSuffix ?? null);
  const titleToneClass =
    section === "ending-today"
      ? "text-[#991b1b] dark:text-[#fca5a5]"
      : "text-rr-green";

  return (
    <section className="pt-6">
      <div className="container">
        <div className="flex w-full min-w-0 items-start gap-3">
          {showBackButton ? (
            <Link
              href={backHref}
              aria-label="Back to home"
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md border border-rr-border bg-rr-surface text-rr-secondary transition-colors hover:bg-rr-elevated hover:text-rr-primary"
            >
              <IconArrowLeft size={18} />
            </Link>
          ) : null}
          <h1 className="min-w-0 flex-1 break-words text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-rr-primary">
            <span className={cn("min-w-0 break-words", titleToneClass)}>
              {baseTitle}
            </span>
            {filterLabels.length > 0 ? ` - ${filterLabels.join(" - ")}` : ""}
            {sortSuffix ? <span> {sortSuffix}</span> : null}
          </h1>
        </div>

        {operatorLabel && resetOperatorHref ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[10px] border border-rr-border bg-rr-surface px-3 py-2 text-sm text-rr-secondary">
            <span>
              Showing:{" "}
              <span className="font-medium text-rr-primary">
                {operatorLabel}
              </span>{" "}
              competitions
            </span>
            <Link
              href={resetOperatorHref}
              className="inline-flex items-center gap-1 rounded-full border border-rr-border px-2 py-1 text-xs text-rr-secondary no-underline transition-colors hover:bg-rr-elevated hover:text-rr-primary"
            >
              <IconX size={12} />
              Clear
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getFeaturedIds(competitions: Competition[]) {
  return competitions
    .filter(
      (competition) =>
        competition.valueRatio !== null && competition.valueRatio !== undefined,
    )
    .sort((a, b) => Number(b.valueRatio ?? 0) - Number(a.valueRatio ?? 0))
    .slice(0, 3)
    .map((competition) => competition.id);
}

export async function CompetitionGrid({
  params,
}: {
  params?: GetCompetitionsParams;
} = {}) {
  let competitions: Competition[] = [];

  try {
    const competitionsResponse = await getCompetitions({
      limit: 500,
      ...params,
    });
    competitions = Array.isArray(competitionsResponse)
      ? competitionsResponse
      : [];
  } catch {
    competitions = [];
  }

  const featuredIds = getFeaturedIds(competitions);

  return (
    <CompetitionGridClient
      competitions={competitions}
      featuredIds={featuredIds}
      pageSize={20}
    />
  );
}
