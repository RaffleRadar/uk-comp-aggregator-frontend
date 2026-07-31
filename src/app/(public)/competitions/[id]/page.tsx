import Link from "next/link";
import { notFound } from "next/navigation";
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
import {
  getCompetition,
  getCompetitionHistory,
  getCompetitions,
  getComments,
  type CompetitionDetail,
} from "@/lib/api";
import type { Competition } from "@/types/competition";
import { getEndsTimeLabel } from "@/lib/competition-display";

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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const competition = await getCompetition(id);
    if (!competition || typeof competition !== "object") {
      return {
        title: "Competition Not Found",
        description: "The requested competition could not be found.",
      };
    }
    const comp = competition as CompetitionDetail;
    const { prize } = comp;
    const metaDescription = `Win ${prize} in this UK prize draw competition.`;
    return {
      title: prize,
      description: metaDescription,
      openGraph: { title: prize, description: metaDescription, type: "website" },
      twitter: {
        card: "summary_large_image",
        title: prize,
        description: metaDescription,
      },
    };
  } catch {
    return {
      title: "Competition Not Found",
      description: "The requested competition could not be found.",
    };
  }
}

async function fetchCompetitionData(id: string) {
  try {
    const competitionPromise = getCompetition(id);
    const historyPromise = getCompetitionHistory(id);
    const commentsPromise = getComments(id).catch(() => []);
    const moreFromOperatorPromise = competitionPromise.then((value) => {
      if (!value || typeof value !== "object") return [];
      const comp = value as Competition;
      const website = comp.operator?.baseUrl;
      if (!website) return [];
      return getCompetitions({
        website,
        sortBy: "valueRatio",
        sortOrder: "desc",
        limit: 5,
      });
    });
    const [competition, historyData, moreFromOperatorData, comments] =
      await Promise.all([
        competitionPromise,
        historyPromise,
        moreFromOperatorPromise,
        commentsPromise,
      ]);
    if (!competition || typeof competition !== "object") {
      notFound();
    }
    const comp = competition as CompetitionDetail;
    const {
      prize,
      imageUrl,
      ticketPrice,
      ticketsTotal,
      ticketsLeft,
      ticketsSold,
      percentSold,
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
    const totalTicketsValue = typeof ticketsTotal === "number" ? ticketsTotal : null;
    const ticketsLeftValue = typeof ticketsLeft === "number" ? ticketsLeft : null;
    const percentSoldValue = toFiniteNumber(percentSold);

    const soldTickets =
      typeof ticketsSold === "number"
        ? ticketsSold
        : totalTicketsValue !== null && ticketsLeftValue !== null
          ? Math.max(0, totalTicketsValue - ticketsLeftValue)
          : null;
    const remainingTickets = ticketsLeftValue;
    const ticketsSoldForOdds = soldTickets;

    const percentValue =
      percentSoldValue !== null
        ? percentSoldValue
        : soldTickets !== null && totalTicketsValue !== null && totalTicketsValue > 0
          ? (soldTickets / totalTicketsValue) * 100
          : null;

    const priceValue = ticketPrice !== null ? toFiniteNumber(ticketPrice) : null;
    let history: CompetitionHistory[] = [];
    if (Array.isArray(historyData)) {
      history = historyData as CompetitionHistory[];
    }
    const moreFromOperator = Array.isArray(moreFromOperatorData)
      ? (moreFromOperatorData as Competition[])
          .filter((c) => c.id !== id)
          .slice(0, 4)
      : [];
    return {
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
      moreFromOperator,
      comments,
      hasEnded,
    };
  } catch (error) {
    console.error("Failed to load competition page:", error);
    notFound();
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchCompetitionData(id);
  if (!data) {
    notFound();
  }
  const {
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
    description,
    sourceUrl,
    history,
    moreFromOperator,
    comments,
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
  const operatorSlug = operatorNameToSlug(operator?.name);
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
  const salesDifference = canShowSalesVsPrize ? salesRevenue - prizeValueNum : 0;
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
    <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-rr-muted mb-1">Sales vs prize value</p>
          <p className="text-sm font-medium text-rr-primary">
            Sales so far: £
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
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-rr-muted">Ticket sales</span>
          <span className="font-medium text-rr-primary">
            £
            {salesRevenue.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-rr-muted">Prize value</span>
          <span className="font-medium text-rr-primary">
            £{prizeValueNum.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-rr-muted">
            {salesDifference >= 0 ? "Above prize value" : "Below prize value"}
          </span>
          <span className="text-rr-secondary">
            £{Math.abs(salesDifference).toLocaleString("en-GB")}
          </span>
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
  const endedLabel = endsAt
    ? new Date(endsAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const aboutBlock = (
    <div>
      <h2 className="text-lg font-semibold text-rr-primary mb-4">
        About this competition
      </h2>
      <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
        {description && (
          <p className="text-sm text-rr-secondary mb-4 leading-relaxed">
            {description}
          </p>
        )}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-rr-muted">Winners</span>
            <span className="text-xs text-rr-secondary">{numWinners ?? 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-rr-muted">Instant prize</span>
            <span className="text-xs text-rr-secondary">
              {instantPrizes ? "Yes" : "No"}
            </span>
          </div>
          {makeModel && (
            <div className="flex justify-between">
              <span className="text-xs text-rr-muted">Make / model</span>
              <span className="text-xs text-rr-secondary">{makeModel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <main>
      <CompetitionViewTracker
        competition={id}
        operator={operator?.name ?? undefined}
      />
      <div className="container py-6 md:py-8">
        {hasEnded ? (
          <div className="rounded-lg border border-rr-border bg-rr-elevated px-4 py-3 mb-6">
            <div className="text-rr-primary font-medium">
              This competition has ended
            </div>
            {endedLabel ? (
              <div className="text-rr-muted text-sm">{endedLabel}</div>
            ) : null}
          </div>
        ) : null}
        <div className="mb-4 hidden md:block">
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
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-start">
          <div className="order-2 md:order-1 mt-8 md:mt-0 flex flex-col gap-8">
            <div className="relative hidden rounded-[10px] overflow-hidden border border-rr-border bg-rr-elevated h-[300px] md:flex md:h-[350px] items-center justify-center">
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
            {!(history.length === 0 && percentSoldValue === null) ? (
              <div>
                <h2 className="text-lg font-semibold text-rr-primary mb-4">
                  Ticket sales history
                </h2>
                <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
                  <TicketSalesChart history={history} />
                </div>
              </div>
            ) : null}
            {salesVsPrizeBlock}
            {aboutBlock}
          </div>
          <div className="order-1 md:order-2">
            <div className="flex flex-wrap items-start gap-2 mb-4">
              {operator && (
                <div className="flex items-center gap-2">
                  <Badge variant="operator">{operator.name}</Badge>
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
              {category && (
                <Badge variant="neutral" className="text-rr-muted bg-rr-elevated">
                  {category}
                </Badge>
              )}
              {getEndsTimeLabel(endsAt) && (
                <Badge variant="red">{getEndsTimeLabel(endsAt)}</Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-rr-primary mb-6">
              {prize}
            </h1>
            <div className="relative mb-6 rounded-[10px] overflow-hidden border border-rr-border bg-rr-elevated h-[300px] flex items-center justify-center md:hidden">
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
                <p className="text-xs text-rr-muted mb-1">Ticket price</p>
                <p className="text-xl font-semibold text-rr-green">
                  {priceValue === 0
                    ? "FREE"
                    : priceValue
                      ? `£${priceValue.toFixed(2)}`
                      : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
                <p className="text-xs text-rr-muted mb-1">Prize value</p>
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
              <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
                <p className="text-xs text-rr-muted mb-1">Total tickets</p>
                <p className="text-xl font-semibold text-rr-primary">
                  {totalTicketsValue !== null
                    ? totalTicketsValue.toLocaleString("en-GB")
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-rr-border bg-rr-elevated p-4">
                <p className="text-xs text-rr-muted mb-1">Max per person</p>
                <p className="text-xl font-semibold text-rr-primary">
                  {maxPerPerson ?? "—"}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-rr-border bg-rr-elevated p-4 mb-6">
              {totalTicketsValue === null && percentSoldValue === null ? (
                <p className="text-sm text-rr-muted">
                  Sales data not published by the operator
                </p>
              ) : (
                <>
                  {soldTickets !== null && remainingTickets !== null ? (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-rr-secondary">
                        {soldTickets.toLocaleString("en-GB")} sold
                      </span>
                      <span className="text-sm text-rr-secondary">
                        {remainingTickets.toLocaleString("en-GB")} remaining
                      </span>
                    </div>
                  ) : null}

                  {percentValue !== null ? (
                    <>
                      <ProgressBar value={percentValue} className="mb-2" />
                      <div>
                        <span className="text-sm font-medium text-rr-green">
                          {percentValue.toFixed(0)}% sold
                        </span>
                      </div>
                    </>
                  ) : null}

                  {!instantPrizes && ticketsSoldForOdds !== null ? (
                    <div className="mt-3">
                      <p className="flex items-center gap-1 text-xs text-rr-muted">
                        <span className="text-rr-muted">
                          Odds per ticket
                          <InfoTooltip text="Your chance per ticket based on how many have sold so far. This shortens as more tickets sell before the draw." />
                        </span>
                      </p>
                      <p className="text-sm font-medium text-rr-primary">
                        {liveOdds
                          ? `1 in ${liveOdds.toLocaleString("en-GB")}`
                          : "No tickets sold yet"}
                      </p>
                      <p className="text-xs text-rr-muted">
                        based on tickets sold so far
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {!instantPrizes && totalTicketsValue !== null && soldTickets !== null ? (
              <TicketCalculator
                ticketsSold={soldTickets}
                ticketsTotal={totalTicketsValue}
                ticketPrice={priceValue}
                maxPerPerson={maxPerPerson}
              />
            ) : null}
            <div className="flex gap-3 mt-6 mb-6">
              {!hasEnded ? (
                <EnterButton
                  competitionId={id}
                  sourceUrl={sourceUrl}
                  operatorName={operator?.name ?? "Operator"}
                />
              ) : null}
              <SaveActions />
            </div>
            {(cashAltNum || endsAt) && (
              <div className="rounded-lg border border-rr-border bg-rr-elevated p-4 mb-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-rr-muted mb-1">Cash alternative</p>
                    <p className="text-lg font-semibold text-rr-primary">
                      {cashAltNum ? (
                        `£${cashAltNum.toLocaleString("en-GB")}`
                      ) : (
                        <span className="text-rr-muted text-sm font-normal">
                          Not offered
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-rr-muted mb-1">Draw date</p>
                    <p className="text-lg font-semibold text-rr-primary">
                      <DrawCountdown endsAt={endsAt} />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {moreFromOperator.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {moreFromOperator.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          </div>
        )}
        <CommentsSection competitionId={id} initialComments={comments} />
      </div>
    </main>
  );
}
