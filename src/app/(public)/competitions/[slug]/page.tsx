import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  IconCar,
  IconCurrencyPound,
  IconGift,
  IconClockHour4,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { EnterButton } from "@/components/competitions/enter-button";
import { CompetitionViewTracker } from "@/components/competitions/competition-view-tracker";
import { SaveActions } from "@/components/competitions/save-actions";
import { TicketCalculator } from "@/components/competitions/ticket-calculator";
import { DrawCountdown } from "@/components/competitions/draw-countdown";
import { TicketSalesChart } from "@/components/competitions/ticket-sales-chart";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import { ViewAllLink } from "@/components/ui/view-all-link";
import { CommentsSection } from "@/components/comments/comments-section";
import { CategoryBadgeAdmin } from "@/components/competitions/category-badge-admin";
import { ReportIssue } from "@/components/competitions/report-issue";
import {
  getCompetition,
  getCompetitionHistory,
  getCompetitions,
  getComments,
  getSimilarCompetitions,
  type CompetitionDetail,
} from "@/lib/api";
import type { Competition } from "@/types/competition";
import { getEndedLabel, getEndsTimeLabel } from "@/lib/competition-display";
import { getUrgencyMessage } from "@/lib/urgency-message";
import { parseSpend } from "@/lib/spend-mode";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { sanityClient } from "@/sanity/client";
import {
  OPERATOR_PROFILE_BY_ID,
  OPERATOR_PROFILE_BY_NAME,
} from "@/sanity/queries";
import type { OperatorProfile } from "@/types/operator-profile";

export const revalidate = 60;

type CompetitionHistory = {
  scrapedAt: string;
  ticketsSold: number;
  percentSold: number;
};

const MIN_VR_SAMPLE = 5;
const FAIR_VR = 3;
const GREEDY_VR = 8;

function operatorNameToSlug(value: string | null | undefined) {
  if (!value) return null;
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

function normalizeOperatorName(value: string, spacedDigits = false) {
  const normalized = value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(spacedDigits ? /([0-9])([a-z])/g : /$^/, "$1 $2")
    .replace(spacedDigits ? /([a-z])([0-9])/g : /$^/, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

function getOperatorNameVariants(name: string, slug: string) {
  const variants = new Set<string>();

  for (const value of [name, slug]) {
    const basic = normalizeOperatorName(value, false);
    const spaced = normalizeOperatorName(value, true);

    if (basic) variants.add(basic);
    if (spaced) variants.add(spaced);
  }

  return Array.from(variants);
}

function PlaceholderIcon({ category }: { category: string | null }) {
  const cls = "text-rr-border";
  const size = 80;
  switch (category?.toLowerCase()) {
    case "cars":
      return <IconCar size={size} className={cls} />;
    case "watches":
      return <IconClockHour4 size={size} className={cls} />;
    case "tech":
      return <IconDeviceLaptop size={size} className={cls} />;
    case "cash":
      return <IconCurrencyPound size={size} className={cls} />;
    default:
      return <IconGift size={size} className={cls} />;
  }
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;


  try {
    const competition = await getCompetition(slug);
    if (!competition || typeof competition !== "object") {
      return {
        title: "Competition Not Found",
        description: "The requested competition could not be found.",
      };
    }
    const comp = competition as CompetitionDetail;
    const { prize, imageUrl, hasEnded } = comp;
    const metaFinalSold =
      typeof comp.finalSold === "number" && Number.isFinite(comp.finalSold)
        ? comp.finalSold
        : null;
    const metaFinalPercent = toFiniteNumber(comp.finalPercentSold);
    const metaTitle = hasEnded ? `${prize} (Ended)` : prize;
    const metaResult =
      metaFinalSold !== null && metaFinalPercent !== null
        ? ` ${metaFinalSold.toLocaleString("en-GB")} tickets sold, ${metaFinalPercent.toFixed(0)}% of the draw.`
        : metaFinalSold !== null
          ? ` ${metaFinalSold.toLocaleString("en-GB")} tickets sold.`
          : "";
    const metaDescription = hasEnded
      ? `${prize} has ended.${metaResult} See the final sales figures and live competitions from this operator.`
      : `Win ${prize} in this UK prize draw competition.`;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slug,
      );
    const canonicalPath =
      isUuid && comp.slug && comp.slug !== slug
        ? `/competitions/${comp.slug}`
        : `/competitions/${slug}`;
    return {
      title: metaTitle,
      description: metaDescription,
      alternates: { canonical: canonicalPath },
      openGraph: buildOpenGraph({
        title: metaTitle,
        description: metaDescription,
        path: canonicalPath,
        image: imageUrl,
      }),
      twitter: buildTwitter({
        title: metaTitle,
        description: metaDescription,
        image: imageUrl,
      }),
    };
  } catch {
    return {
      title: "Competition Not Found",
      description: "The requested competition could not be found.",
    };
  }
}

function isCompetitionNotFoundError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message === "Competition not found" || error.message === "HTTP 404")
  );
}

async function fetchCompetitionData(slug: string) {
  try {
    const competitionPromise = getCompetition(slug);
    const historyPromise = getCompetitionHistory(slug);
    const commentsPromise = competitionPromise
      .then((value) => {
        if (!value || typeof value !== "object") return [];
        const comp = value as Competition;
        return comp.id ? getComments(comp.id) : [];
      })
      .catch(() => []);
    const similarPromise = getSimilarCompetitions(slug, 8).catch(() => []);
    const moreFromOperatorPromise = competitionPromise.then((value) => {
      if (!value || typeof value !== "object") return [];
      const comp = value as Competition;
      const website = comp.operator?.baseUrl;
      if (!website) return [];
      return getCompetitions({
        website,
        sortBy: "valueRatio",
        sortOrder: "desc",
        limit: 6,
      });
    });
    const [
      competition,
      historyData,
      moreFromOperatorData,
      similarData,
      comments,
    ] = await Promise.all([
      competitionPromise,
      historyPromise,
      moreFromOperatorPromise,
      similarPromise,
      commentsPromise,
    ]);
    if (!competition || typeof competition !== "object") {
      notFound();
    }
    const comp = competition as CompetitionDetail;
    const {
      slug: compSlug,
      prize,
      imageUrl,
      ticketPrice,
      ticketsTotal,
      ticketsLeft,
      ticketsSold,
      percentSold,
      finalPercentSold,
      finalSold,
      closedAt,
      finalVerifiedAt,
      endsAt,
      hasEnded,
      category,
      instantPrizes,
      valueRatio,
      operator,
      prizeValue,
      prizeValueEstimated,
      cashAlternative,
      maxPerPerson,
      numWinners,
      prizeMake,
      prizeModel,
      description,
      sourceUrl,
    } = comp;
    const totalTicketsValue =
      typeof ticketsTotal === "number" ? ticketsTotal : null;
    const ticketsLeftValue =
      typeof ticketsLeft === "number" ? ticketsLeft : null;
    const percentSoldValue = toFiniteNumber(percentSold);

    const finalSoldValue =
      typeof finalSold === "number" && Number.isFinite(finalSold)
        ? finalSold
        : null;
    const finalPercentValue = toFiniteNumber(finalPercentSold);

    const liveSoldTickets =
      typeof ticketsSold === "number"
        ? ticketsSold
        : totalTicketsValue !== null && ticketsLeftValue !== null
          ? Math.max(0, totalTicketsValue - ticketsLeftValue)
          : null;

    const soldTickets =
      hasEnded && finalSoldValue !== null ? finalSoldValue : liveSoldTickets;
    const remainingTickets = ticketsLeftValue;
    const ticketsSoldForOdds = soldTickets;

    const percentValue =
      hasEnded && finalPercentValue !== null
        ? finalPercentValue
        : percentSoldValue !== null
          ? percentSoldValue
          : soldTickets !== null &&
              totalTicketsValue !== null &&
              totalTicketsValue > 0
            ? (soldTickets / totalTicketsValue) * 100
            : null;

    const priceValue =
      ticketPrice !== null ? toFiniteNumber(ticketPrice) : null;
    let history: CompetitionHistory[] = [];
    if (Array.isArray(historyData)) {
      history = historyData as CompetitionHistory[];
    }
    const moreFromOperator = Array.isArray(moreFromOperatorData)
      ? (moreFromOperatorData as Competition[])
          .filter((c) => c.id !== slug)
          .slice(0, 4)
      : [];
    const similar = Array.isArray(similarData)
      ? (similarData as Competition[]).filter((c) => c.id !== slug).slice(0, 4)
      : [];
    return {
      compId: comp.id,
      compSlug,
      prize,
      imageUrl,
      endsAt,
      category,
      instantPrizes,
      valueRatio,
      operator,
      prizeValue,
      prizeValueEstimated,
      cashAlternative,
      maxPerPerson,
      numWinners,
      prizeMake,
      prizeModel,
      description,
      sourceUrl,
      totalTicketsValue,
      remainingTickets,
      soldTickets,
      ticketsSoldForOdds,
      percentValue,
      percentSoldValue,
      priceValue,
      history,
      similar,
      moreFromOperator,
      comments,
      hasEnded,
      closedAt,
      finalVerifiedAt,
      finalSoldValue,
      finalPercentValue,
    };
  } catch (error) {
    if (!isCompetitionNotFoundError(error)) {
      console.error("Failed to load competition page:", error);
    }
    notFound();
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ spend?: string }>;
}) {
  const { slug } = await params;
  const paramsObj = searchParams ? await searchParams : undefined;
  const initialSpend = paramsObj ? parseSpend(paramsObj.spend) : undefined;
  const data = await fetchCompetitionData(slug);
  if (!data) {
    notFound();
  }
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slug,
    );
  if (isUuid && data.compSlug && data.compSlug !== slug) {
    permanentRedirect(`/competitions/${data.compSlug}`);
  }
  const {
    compId,
    prize,
    imageUrl,
    category,
    operator,
    endsAt,
    hasEnded,
    priceValue,
    totalTicketsValue,
    remainingTickets,
    soldTickets,
    ticketsSoldForOdds,
    percentValue,
    percentSoldValue,
    instantPrizes,
    prizeValue,
    prizeValueEstimated,
    cashAlternative,
    maxPerPerson,
    numWinners,
    prizeMake,
    prizeModel,
    sourceUrl,
    history,
    similar,
    moreFromOperator,
    comments,
    closedAt,
    finalVerifiedAt,
    finalSoldValue,
    finalPercentValue,
  } = data;
  const prizeValueNum = prizeValue ? Number(prizeValue) : null;
  const cashAltNum = cashAlternative ? Number(cashAlternative) : null;
  const makeModel = [prizeMake, prizeModel].filter(Boolean).join(" / ");
  const winnersForOdds =
    typeof numWinners === "number" && numWinners > 0 ? numWinners : 1;
  const liveOdds =
    ticketsSoldForOdds && ticketsSoldForOdds > 0
      ? Math.max(1, Math.round(ticketsSoldForOdds / winnersForOdds))
      : null;
  const operatorVrValue =
    operator &&
    operator.avgVr !== null &&
    operator.vrSampleSize !== null &&
    operator.vrSampleSize >= MIN_VR_SAMPLE
      ? Number(operator.avgVr)
      : null;
  const urgency = getUrgencyMessage(endsAt, percentValue);
  const operatorSlug = operatorNameToSlug(operator?.name);
  let operatorProfile: OperatorProfile | null = null;
  if (operator?.id) {
    try {
      operatorProfile = await sanityClient.fetch<OperatorProfile | null>(
        OPERATOR_PROFILE_BY_ID,
        { operatorId: operator.id },
      );
    } catch {
      operatorProfile = null;
    }
  }
  if (!operatorProfile && operator?.name) {
    try {
      const nameVariants = getOperatorNameVariants(
        operator.name,
        operatorSlug ?? "",
      );
      operatorProfile = await sanityClient.fetch<OperatorProfile | null>(
        OPERATOR_PROFILE_BY_NAME,
        { operatorNames: nameVariants },
      );
    } catch {
      operatorProfile = null;
    }
  }
  const operatorVrLabel = operator
    ? operatorVrValue !== null
      ? `VR ${operatorVrValue.toFixed(1)}`
      : "Not enough data"
    : null;
  const operatorVrBadgeClass =
    operatorVrValue === null
      ? "border-[var(--border)] bg-[var(--elevated)] text-[var(--text-secondary)]"
      : operatorVrValue <= FAIR_VR
        ? "border-[var(--vr-good-border)] bg-[var(--vr-good-bg)] text-[var(--vr-good-text)]"
        : operatorVrValue < GREEDY_VR
          ? "border-[var(--vr-warn-border)] bg-[var(--vr-warn-bg)] text-[var(--vr-warn-text)]"
          : "border-[var(--vr-danger-border)] bg-[var(--vr-danger-bg)] text-[var(--vr-danger-text)]";
  const canShowSalesVsPrize =
    !instantPrizes &&
    prizeValueNum !== null &&
    prizeValueNum > 0 &&
    priceValue !== null &&
    priceValue > 0 &&
    soldTickets !== null;
  const salesRevenue = canShowSalesVsPrize ? soldTickets * priceValue : 0;
  const salesCoverage = canShowSalesVsPrize ? salesRevenue / prizeValueNum : 0;
  const salesCoveragePercent = canShowSalesVsPrize
    ? Math.round(salesCoverage * 100)
    : 0;
  const salesDifference = canShowSalesVsPrize
    ? salesRevenue - prizeValueNum
    : 0;
  const salesBadgeClass =
    salesCoverage >= 1
      ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]"
      : salesCoverage >= 0.5
        ? "border-[var(--vr-warn-border)] bg-[var(--vr-warn-bg)] text-[var(--vr-warn-text)]"
        : "border-[var(--vr-danger-border)] bg-[var(--vr-danger-bg)] text-[var(--vr-danger-text)]";
  const salesFillColor =
    salesCoverage >= 1
      ? "var(--accent)"
      : salesCoverage >= 0.5
        ? "var(--vr-warn-text)"
        : "var(--vr-danger-text)";
  const salesVsPrizeBlock = canShowSalesVsPrize ? (
    <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-2">
      <div className="flex items-start justify-between gap-1.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Sales vs prize value</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-rr-primary">
            {hasEnded ? "Final sales: " : "Estimated Ticket Value: "}£
            {salesRevenue.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            — {salesCoveragePercent}% of prize value covered
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded border px-2 py-1 text-[10px] font-medium ${salesBadgeClass}`}
        >
          {salesCoveragePercent}%
        </span>
      </div>
      <div className="mt-1.5">
        <div className="mb-1.5 grid grid-cols-1 rounded-lg border border-rr-border divide-y divide-rr-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-between gap-1.5 px-4 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Ticket sales</span>
            <span className="text-sm font-medium text-rr-primary">
              £
              {salesRevenue.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1.5 px-4 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Prize value</span>
            <span className="text-sm font-medium text-rr-primary">
              £{prizeValueNum.toLocaleString("en-GB")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1.5 px-4 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
              {salesDifference >= 0 ? "Above prize value" : "Below prize value"}
            </span>
            <span className="text-sm font-medium text-rr-primary">
              £{Math.abs(salesDifference).toLocaleString("en-GB")}
            </span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-rr-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, salesCoverage * 100))}%`,
              backgroundColor: salesFillColor,
            }}
          />
        </div>
      </div>
    </div>
  ) : null;
  const endedLabel = getEndedLabel(endsAt, closedAt ?? null);
  const finalVerifiedLabel = finalVerifiedAt
    ? new Date(finalVerifiedAt).toLocaleDateString("en-GB", {
        timeZone: "Europe/London",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const finalRevenue =
    finalSoldValue !== null && priceValue !== null && priceValue > 0
      ? finalSoldValue * priceValue
      : null;
  const hasFinalResult =
    hasEnded && (finalSoldValue !== null || finalPercentValue !== null);
  const similarSection = similar.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-lg font-semibold text-rr-primary">
                Similar prizes
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {similar.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          </div>
        );
  const operatorSection = moreFromOperator.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-lg font-semibold text-rr-primary">
                More from {operator?.name ?? "Operator"}
              </h2>
              {operatorSlug ? (
                <ViewAllLink
                  href={`/operators/${operatorSlug}`}
                  className="shrink-0 text-sm font-medium text-rr-green no-underline transition-opacity hover:opacity-80"
                >
                  View All →
                </ViewAllLink>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {moreFromOperator.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          </div>
        );
  const endedOperatorCta =
    hasEnded && operatorSlug ? (
      <div className="mb-1.5 rounded-lg border border-rr-border bg-rr-elevated p-4">
        <p className="text-sm text-rr-secondary">
          This draw is closed. {operator?.name ?? "This operator"} has live
          competitions running now.
        </p>
        <Link
          href={`/operators/${operatorSlug}`}
          className="mt-2 inline-flex text-sm font-medium text-rr-green no-underline hover:underline"
        >
          See live competitions from {operator?.name ?? "this operator"} →
        </Link>
      </div>
    ) : null;

  return (
    <main>
      <CompetitionViewTracker
        competition={compId}
        operator={operator?.name ?? undefined}
      />
      <div className="container py-6 md:py-8">
        {hasEnded ? (
          <div className="rounded-lg border border-rr-border bg-rr-elevated p-4 mb-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-rr-primary font-medium">
                This competition has ended
              </div>
              {endedLabel ? (
                <div className="text-sm text-rr-muted">{endedLabel}</div>
              ) : null}
            </div>
            {hasFinalResult ? (
              <>
                <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div>
                    <p className="text-xs text-rr-muted mb-1">
                      Final tickets sold
                    </p>
                    <p className="text-lg font-semibold text-rr-primary sm:text-xl">
                      {finalSoldValue !== null
                        ? finalSoldValue.toLocaleString("en-GB")
                        : "\u2014"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rr-muted mb-1">Final % sold</p>
                    <p className="text-lg font-semibold text-rr-primary sm:text-xl">
                      {finalPercentValue !== null
                        ? `${finalPercentValue.toFixed(0)}%`
                        : "\u2014"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rr-muted mb-1">Final sales</p>
                    <p className="text-lg font-semibold text-rr-primary sm:text-xl">
                      {finalRevenue !== null
                        ? `\u00a3${Math.round(finalRevenue).toLocaleString("en-GB")}`
                        : "\u2014"}
                    </p>
                  </div>
                </div>
                {finalPercentValue !== null ? (
                  <ProgressBar value={finalPercentValue} className="mt-2" />
                ) : null}
                {finalVerifiedLabel ? (
                  <p className="mt-1.5 text-xs text-rr-muted">
                    Final figures recorded {finalVerifiedLabel}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-rr-muted">
                Final sales figures were not published by the operator.
              </p>
            )}
          </div>
        ) : null}
        {endedOperatorCta}
        <div className="mb-2 hidden md:block">
          <nav className="flex items-center gap-2 text-sm text-rr-muted">
            <Link href="/" className="hover:text-rr-primary transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link
              href="/competitions"
              className="hover:text-rr-primary transition-colors"
            >
              Competitions
            </Link>
            <span>›</span>
            <span className="text-rr-secondary">{prize}</span>
          </nav>
        </div>
        <div className="mb-2 flex flex-col gap-1.5 md:mb-1.5 md:flex-row md:items-center md:justify-between md:gap-1.5">
          <h1 className="order-2 min-w-0 text-2xl font-semibold uppercase leading-tight text-rr-primary md:order-1 md:flex-1 md:truncate md:text-[clamp(1.125rem,2.6vw,1.875rem)]">
            {prize}
          </h1>
          <div className="order-1 flex shrink-0 flex-wrap items-center gap-2 md:order-2 md:justify-end">
            {operator && (
              <div className="flex items-center gap-2">
                {operatorSlug ? (
                  <Link
                    href={`/operators/${operatorSlug}`}
                    className="inline-flex items-center rounded transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rr-green"
                    aria-label={`View ${operator.name} operator page`}
                  >
                    <Badge variant="operator">{operator.name}</Badge>
                  </Link>
                ) : (
                  <Badge variant="operator">{operator.name}</Badge>
                )}
                {operatorVrLabel && (
                  <span
                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${operatorVrBadgeClass}`}
                  >
                    <span>{operatorVrLabel}</span>
                    <InfoTooltip text="Typical tickets-value vs prize across this operator's competitions. Lower = more player-friendly." />
                  </span>
                )}
              </div>
            )}
            <CategoryBadgeAdmin competitionId={compId} category={category} />
            {!hasEnded && getEndsTimeLabel(endsAt) && (
              <Badge variant="red" className="hidden md:inline-block">
                {getEndsTimeLabel(endsAt)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-[1.08fr_0.92fr] md:gap-1.5 md:items-stretch">
          <div className="contents md:order-1 md:flex md:flex-col md:gap-2">
            <div className="relative hidden rounded-[10px] overflow-hidden border border-rr-border bg-rr-elevated h-[300px] md:flex md:h-[350px] items-center justify-center md:order-none">
              {imageUrl ? (
                <CompetitionImage
                  src={imageUrl}
                  alt={prize}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <PlaceholderIcon category={category} />
              )}
            </div>
            {!hasEnded && endsAt ? (
              <div className="order-5 mb-1.5 rounded-lg border border-rr-border bg-rr-elevated md:order-none md:mb-0">
                <div className="flex flex-row items-center divide-x divide-rr-border">
                  <div className="shrink-0 px-3 py-2 sm:px-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-2">
                      Time left to enter
                    </p>
                    <DrawCountdown endsAt={endsAt} colorByUrgency size="lg" />
                  </div>
                  {urgency ? (
                    <p
                      className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase leading-3 sm:px-4 sm:text-xs sm:leading-4 ${
                        urgency.tone === "urgent"
                          ? "text-[#f95353]"
                          : urgency.tone === "soon"
                            ? "text-rr-warn"
                            : "text-rr-green"
                      }`}
                    >
                      {urgency.text}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {soldTickets !== null ? (
              <div className="order-7 mb-2 rounded-lg border border-rr-border bg-rr-elevated md:order-none md:mb-0">
                <div className="grid grid-cols-2 divide-x divide-rr-border">
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Tickets sold</p>
                    <p className="flex items-baseline gap-2">
                      <span className="whitespace-nowrap text-[clamp(1.05rem,5.2vw,1.875rem)] font-semibold tabular-nums text-rr-primary">
                        {soldTickets.toLocaleString("en-GB")}
                      </span>
                    </p>
                  </div>
                  {remainingTickets !== null ? (
                    <div className="px-4 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1 whitespace-nowrap">Remaining</p>
                      <p className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap text-[clamp(1.05rem,5.2vw,1.875rem)] font-semibold tabular-nums text-rr-primary">
                          {remainingTickets.toLocaleString("en-GB")}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {totalTicketsValue !== null || percentSoldValue !== null ? (
              <div className="order-8 mb-2 rounded-lg border border-rr-border bg-rr-elevated px-4 py-2 md:order-none md:mb-0">
                {totalTicketsValue === null && percentSoldValue === null ? (
                  <p className="text-sm text-rr-muted">
                    Sales data not published by the operator
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-2">Overall progress</p>
                    {percentValue !== null ? (
                      <p className="mb-1.5 flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-rr-green">
                          {percentValue.toFixed(0)}%
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">sold</span>
                      </p>
                    ) : null}
                    {percentValue !== null ? (
                      <ProgressBar value={percentValue} className="mb-1.5" />
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                        {soldTickets !== null
                          ? `${soldTickets.toLocaleString("en-GB")} sold`
                          : ""}
                      </span>
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                        {totalTicketsValue !== null
                          ? `${totalTicketsValue.toLocaleString("en-GB")} total`
                          : ""}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : null}
            {!instantPrizes &&
            totalTicketsValue !== null &&
            soldTickets !== null ? (
              <div className="order-9 md:order-none">
                <TicketCalculator
                  ticketsSold={soldTickets}
                  ticketsTotal={totalTicketsValue}
                  ticketPrice={priceValue}
                  maxPerPerson={maxPerPerson}
                  hasEnded={hasEnded}
                  initialSpend={initialSpend}
                />
              </div>
            ) : null}
          </div>
          <div className="contents md:order-2 md:flex md:min-h-full md:flex-col">
            <div className="order-3 relative mb-1.5 rounded-[10px] overflow-hidden border border-rr-border bg-rr-elevated h-[300px] flex items-center justify-center md:hidden">
              {imageUrl ? (
                <CompetitionImage
                  src={imageUrl}
                  alt={prize}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <PlaceholderIcon category={category} />
              )}
            </div>
            <div className="order-4 grid grid-cols-2 gap-1.5 mb-2 md:order-none">
              <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Ticket price</p>
                <p className="text-xl font-semibold text-rr-green">
                  {priceValue === 0
                    ? "FREE"
                    : priceValue
                      ? `£${priceValue.toFixed(2)}`
                      : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Prize value</p>
                <p className="flex items-center gap-1 text-xl font-semibold text-rr-primary">
                  <span>
                    {prizeValueNum
                      ? `£${prizeValueNum.toLocaleString("en-GB")}`
                      : "—"}
                  </span>
                  {prizeValueNum && prizeValueEstimated === true && (
                    <InfoTooltip text="Estimated value — we don't have a confirmed price for this prize, so this is an approximate upper limit." />
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Total tickets</p>
                <p className="text-xl font-semibold text-rr-primary tabular-nums">
                  {totalTicketsValue !== null
                    ? totalTicketsValue.toLocaleString("en-GB")
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1">Max per person</p>
                <p className="text-xl font-semibold text-rr-primary">
                  {maxPerPerson !== null && maxPerPerson !== undefined
                    ? maxPerPerson.toLocaleString("en-GB")
                    : "—"}
                </p>
              </div>
            </div>
            <div className="order-6 flex flex-wrap items-center gap-1.5 mt-2 mb-2 md:order-none">
              <EnterButton
                competitionId={compId}
                sourceUrl={sourceUrl}
                operatorName={operator?.name ?? "Operator"}
                operatorUrl={operator?.baseUrl ?? null}
                hasEnded={hasEnded}
              />
              <SaveActions />
            </div>
            {!instantPrizes && ticketsSoldForOdds !== null ? (
              <div className="order-10 mt-2 mb-2 rounded-lg border border-rr-border bg-rr-elevated md:order-none">
                <div className="flex flex-row items-center divide-x divide-rr-border md:items-stretch">
                  <div className="flex flex-1 flex-col items-center px-4 py-3 text-center md:w-[46%] md:flex-none md:shrink-0 md:items-start md:py-5 md:text-left">
                    <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted md:mb-1 md:justify-start">
                      <span>
                        {hasEnded
                          ? "Final odds per ticket based on tickets sold"
                          : "Odds per ticket based on tickets sold"}
                      </span>
                      <InfoTooltip
                        text={
                          hasEnded
                            ? "Your chance per ticket at the point the competition closed, based on final tickets sold."
                            : "Your chance per ticket based on how many have sold so far. This shortens as more tickets sell before the draw."
                        }
                      />
                    </p>
                    <p className="mt-2 whitespace-nowrap text-[clamp(1.5rem,8vw,2.5rem)] font-semibold leading-none text-rr-green md:mt-0 md:text-2xl">
                      {liveOdds
                        ? `1 in ${liveOdds.toLocaleString("en-GB")}`
                        : "No tickets sold yet"}
                    </p>
                  </div>
                  {!hasEnded ? (
                    <div className="hidden flex-1 px-4 py-5 md:block">
                      <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-rr-secondary">
                        FEWER TICKETS SOLD ={" "}
                        <span className="text-rr-green">HIGHER CHANCE</span>
                      </p>
                      <p className="mt-5 text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-rr-secondary">
                        MORE TICKETS SOLD ={" "}
                        <span className="text-rr-primary">LOWER CHANCE</span>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="order-11 rounded-lg border border-rr-border bg-rr-elevated mb-2 divide-y divide-rr-border md:order-none">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                {operatorProfile?.freeEntryUrl ? (
                  <a
                    href={operatorProfile.freeEntryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted !text-rr-primary no-underline hover:underline"
                  >
                    Free Postal Entry Available
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted !text-rr-primary">
                    Free Postal Entry Available
                  </span>
                )}
                <span className="text-sm font-semibold text-rr-green">Yes</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                  Cash Alternative
                  <InfoTooltip text="What the winner receives instead of the prize. Often lower than the prize value, since the prize can include extras that are not part of the cash option." />
                </span>
                {cashAltNum ? (
                  <span className="text-sm font-medium text-rr-primary tabular-nums">
                    £{cashAltNum.toLocaleString("en-GB")}
                  </span>
                ) : (
                  <span className="text-sm font-normal text-rr-muted">
                    Not offered
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Winners</span>
                <span className="text-sm font-medium text-rr-primary">
                  {numWinners ?? 1}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Instant Prize</span>
                <span className="text-sm font-medium text-rr-primary">
                  {instantPrizes ? "Yes" : "No"}
                </span>
              </div>
              {makeModel && (
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Make / Model</span>
                  <span className="text-sm font-medium text-rr-primary">
                    {makeModel}
                  </span>
                </div>
              )}
            </div>
            <div className="order-12 mb-2 md:order-none md:mb-0 md:flex md:min-h-[220px] md:flex-1 md:flex-col">
              <div className="flex h-[260px] flex-col rounded-lg border border-rr-border bg-rr-elevated px-4 py-2 md:h-auto md:flex-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted mb-1.5">Ticket sales history</h2>
                {history.length >= 3 ? (
                  <TicketSalesChart
                    history={history}
                    hasEnded={hasEnded}
                    isSoldOut={
                      totalTicketsValue != null &&
                      totalTicketsValue > 0 &&
                      soldTickets != null &&
                      soldTickets >= totalTicketsValue
                    }
                  />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <p className="text-3xl font-semibold text-rr-green">
                      {soldTickets !== null
                        ? `${soldTickets.toLocaleString("en-GB")} sold`
                        : "0 sold"}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                      {soldTickets === 0
                        ? "No sales yet, the chart starts once tickets move"
                        : "Tracking started, the chart fills in over the next few hours"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2 md:mt-2">
          {salesVsPrizeBlock}
          <div>
            <ReportIssue competitionId={compId} />
          </div>
        </div>
        {hasEnded ? (
          <>
            {operatorSection}
            {similarSection}
          </>
        ) : (
          <>
            {similarSection}
            {operatorSection}
          </>
        )}
        <div id="comments" className="mt-5">
          <CommentsSection competitionId={compId} initialComments={comments} />
        </div>
      </div>
    </main>
  );
}
