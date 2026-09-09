"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconCar,
  IconCurrencyPound,
  IconGift,
  IconClockHour4,
  IconDeviceLaptop,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ViewAllLink } from "@/components/ui/view-all-link";
import { SaveHeart } from "@/components/competitions/save-heart";
import type { Competition } from "@/types/competition";
import {
  getEndedLabel,
  getStatusBadge,
  getEndsLabel,
} from "@/lib/competition-display";
import { formatSpendAmount } from "@/lib/competition-sort";

function PlaceholderIcon({ category }: { category: string | null }) {
  const cls = "text-rr-border";
  const size = 40;

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

interface Props {
  competition: Competition;
  featured?: boolean;
  variant?: "default" | "ended";
  interactiveWhenEnded?: boolean;
  spendMetric?: "odds" | "entries" | "prize";
}

const ticketCountFormatter = new Intl.NumberFormat("en-GB");
const NEW_BADGE_WINDOW_MS = 48 * 60 * 60 * 1000;

export function CompetitionCard({
  competition,
  featured,
  variant = "default",
  interactiveWhenEnded = false,
  spendMetric,
}: Props) {
  const { id, slug } = competition;
  const spend = competition.spend ?? null;
  const showSpend =
    variant === "default" && spend !== null && spendMetric !== undefined;
  const pathname = usePathname();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const isCompetitionDetailPage = pathname.startsWith("/competitions/");
  const {
    prize,
    imageUrl,
    ticketPrice,
    ticketsTotal,
    ticketsSold,
    percentSold,
    cashAlternative,
    finalPercentSold,
    endsAt,
    createdAt,
    closedAt,
    category,
    instantPrizes,
    availableToBuy,
  } = competition;

  const isEnded = variant === "ended";
  const isInteractive = !isEnded || interactiveWhenEnded;
  const percentRaw = isEnded ? (finalPercentSold ?? percentSold) : percentSold;
  const percent =
    typeof percentRaw === "number"
      ? Number.isFinite(percentRaw)
        ? percentRaw
        : null
      : typeof percentRaw === "string"
        ? Number.isFinite(Number.parseFloat(percentRaw))
          ? Number.parseFloat(percentRaw)
          : null
        : null;
  const price = ticketPrice !== null ? Number(ticketPrice) : null;
  const statusBadge = isEnded
    ? null
    : getStatusBadge(endsAt, availableToBuy, featured, null);
  const timingLabel = isEnded
    ? getEndedLabel(endsAt, closedAt)
    : getEndsLabel(endsAt);
  const badgeShowsTime =
    statusBadge?.variant === "red" || statusBadge?.variant === "amber";
  const createdAtTime = Date.parse(createdAt);
  const isNew =
    !isEnded &&
    now !== null &&
    Number.isFinite(createdAtTime) &&
    now - createdAtTime >= 0 &&
    now - createdAtTime <= NEW_BADGE_WINDOW_MS;
  const showCommentCount =
    typeof competition.commentCount === "number" &&
    competition.commentCount > 0;

  const cardClassName = [
    "flex h-full flex-col overflow-hidden rounded-[10px] border",
    "bg-rr-surface border-rr-border",
    featured ? "border-rr-green-border" : "",
    isInteractive
      ? "cursor-pointer transition-opacity hover:opacity-90"
      : "cursor-default",
  ].join(" ");

  const cardContent = (
    <>
      <div className="relative flex h-[150px] shrink-0 items-center justify-center bg-rr-elevated">
        {imageUrl ? (
          <CompetitionImage
            src={imageUrl}
            alt={prize}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <PlaceholderIcon category={category} />
        )}
        <span className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-48px)] flex-wrap items-start gap-1">
          <Badge
            variant="operator"
            className="whitespace-nowrap overflow-visible text-clip"
          >
            {competition.operator?.name ?? "Unknown"}
          </Badge>
        </span>
        {statusBadge && (
          <Badge
            variant={statusBadge.variant}
            className="absolute bottom-1.5 left-1.5 whitespace-nowrap"
          >
            {statusBadge.label}
          </Badge>
        )}
        {isNew ? (
          <Badge variant="green" className="absolute bottom-1.5 right-1.5">
            New
          </Badge>
        ) : null}
        {isInteractive ? (
          <SaveHeart
            competitionId={id}
            className="absolute right-1.5 top-1.5 z-10 h-8 w-8"
            iconSize={18}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col px-[9px] pt-[9px]">
          <p className="mb-2 h-8 overflow-hidden text-[11.5px] font-medium leading-[1.35] text-rr-text-primary">
            {prize}
          </p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-medium leading-none text-rr-green">
              {price === 0 ? "FREE" : price ? `£${price.toFixed(2)}` : "—"}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-rr-muted">
              {percent !== null ? (
                <span className="leading-none">{percent.toFixed(0)}% sold</span>
              ) : (
                <span className="leading-none normal-case">
                  Total not disclosed
                </span>
              )}
              {showCommentCount ? (
                <>
                  <IconMessageCircle
                    size={11}
                    stroke={1.5}
                    aria-hidden
                    className="block shrink-0"
                  />
                  <span className="leading-none">
                    {competition.commentCount}
                  </span>
                </>
              ) : null}
            </span>
          </div>

          <div className="mt-2 border-t border-rr-border" />

          <div className="flex items-stretch py-2">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[9px] font-medium uppercase leading-none tracking-[0.06em] text-rr-muted">
                Sold
              </p>
              <p className="mt-1 truncate text-[13px] font-medium leading-none tabular-nums text-rr-text-primary">
                {typeof ticketsSold === "number"
                  ? ticketCountFormatter.format(ticketsSold)
                  : "—"}
              </p>
            </div>
            <div className="w-px shrink-0 bg-rr-border" />
            <div className="min-w-0 flex-1 pl-2">
              <p className="text-[9px] font-medium uppercase leading-none tracking-[0.06em] text-rr-muted">
                <span className="lg:hidden">Total</span>
                <span className="hidden lg:inline">Total tickets</span>
              </p>
              <p className="mt-1 truncate text-[13px] font-medium leading-none tabular-nums text-rr-text-primary">
                {typeof ticketsTotal === "number"
                  ? ticketCountFormatter.format(ticketsTotal)
                  : "—"}
              </p>
            </div>
          </div>

          <div className="h-2">
            {percent !== null ? <ProgressBar value={percent} /> : null}
          </div>

          {showSpend ? (
            <div className="mt-2 rounded-lg border border-rr-border bg-rr-elevated px-2 py-1.5">
              <div className="flex items-stretch">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[9px] font-medium uppercase leading-none tracking-[0.06em] text-rr-muted">
                    {formatSpendAmount(spend.amount)} Spend
                  </p>
                  <p className="mt-1 truncate text-[13px] font-medium leading-none tabular-nums text-rr-green">
                    {formatSpendAmount(spend.amount)}
                  </p>
                </div>
                <div className="w-px shrink-0 bg-rr-border" />
                <div className="min-w-0 flex-1 pl-2">
                  <p className="text-[9px] font-medium uppercase leading-none tracking-[0.06em] text-rr-muted">
                    {spendMetric === "odds"
                      ? `Best Odds for ${formatSpendAmount(spend.amount)}`
                      : spendMetric === "entries"
                        ? `Entries for ${formatSpendAmount(spend.amount)}`
                        : "Prize Value"}
                  </p>
                  <p className="mt-1 truncate text-[13px] font-medium leading-none tabular-nums text-rr-green">
                    {spendMetric === "odds"
                      ? `1 in ${ticketCountFormatter.format(spend.odds)}`
                      : spendMetric === "entries"
                        ? ticketCountFormatter.format(spend.entries)
                        : spend.prizeValue !== null
                          ? `£${ticketCountFormatter.format(spend.prizeValue)}`
                          : "—"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={[
            "mt-2 flex items-center justify-between gap-2 border-t px-[9px] py-2 text-[10px] font-medium leading-none",
            cashAlternative
              ? "border-rr-green-border bg-rr-green-bg text-rr-green"
              : "border-rr-border text-rr-muted",
          ].join(" ")}
        >
          <span className="truncate">
            {isEnded
              ? "Draw complete"
              : cashAlternative
                ? `Cash alternative · £${Number(cashAlternative).toLocaleString("en-GB")}`
                : "Prize only"}
          </span>
          <span className="shrink-0 whitespace-nowrap text-rr-muted">
            {isEnded
              ? (timingLabel ?? "")
              : instantPrizes
                ? "Auto draw"
                : timingLabel && !badgeShowsTime
                  ? timingLabel
                  : ""}
          </span>
        </div>
      </div>
    </>
  );

  if (!isInteractive) {
    return <div className={cardClassName}>{cardContent}</div>;
  }

  return (
    <div className="relative h-full">
      <ViewAllLink
        href={`/competitions/${slug ?? id}`}
        className={cardClassName}
        scroll={isCompetitionDetailPage ? false : undefined}
      >
        {cardContent}
      </ViewAllLink>
    </div>
  );
}