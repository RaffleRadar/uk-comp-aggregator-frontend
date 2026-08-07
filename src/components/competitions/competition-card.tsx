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
}

const ticketCountFormatter = new Intl.NumberFormat("en-GB");
const NEW_BADGE_WINDOW_MS = 48 * 60 * 60 * 1000;

export function CompetitionCard({
  competition,
  featured,
  variant = "default",
  interactiveWhenEnded = false,
}: Props) {
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
    id,
    prize,
    imageUrl,
    ticketPrice,
    ticketsTotal,
    ticketsLeft,
    ticketsSold,
    percentSold,
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
    "block overflow-hidden rounded-[10px] border",
    "bg-rr-surface border-rr-border",
    featured ? "border-rr-green-border" : "",
    isInteractive
      ? "cursor-pointer transition-opacity hover:opacity-90"
      : "cursor-default",
  ].join(" ");

  const cardContent = (
    <>
      <div className="relative flex h-[150px] items-center justify-center bg-rr-elevated">
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
        <span className="absolute inset-x-1.5 top-1.5 flex flex-wrap items-start gap-1 pr-10">
          <Badge
            variant="operator"
            className="whitespace-nowrap overflow-visible text-clip"
          >
            {competition.operator?.name ?? "Unknown"}
          </Badge>
          {isNew ? <Badge variant="green">New</Badge> : null}
        </span>
        {statusBadge && (
          <Badge
            variant={statusBadge.variant}
            className="absolute bottom-1.5 left-1.5 whitespace-nowrap"
          >
            {statusBadge.label}
          </Badge>
        )}
        {isInteractive ? (
          <SaveHeart
            competitionId={id}
            className="absolute bottom-1.5 right-1.5 z-10 h-8 w-8"
            iconSize={18}
          />
        ) : null}
      </div>
      <div className="p-[9px]">
        <p className="text-[11.5px] font-medium text-rr-text-primary leading-[1.35] h-8 overflow-hidden mb-1.5">
          {prize}
        </p>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[13px] font-medium text-rr-green">
            {price === 0 ? "FREE" : price ? `£${price.toFixed(2)}` : "—"}
          </span>
          <span className="text-[10px] text-rr-muted">
            {isEnded
              ? (timingLabel ?? "Ended")
              : typeof ticketsLeft === "number"
                ? `${ticketCountFormatter.format(ticketsLeft)} left`
                : typeof ticketsTotal === "number"
                  ? `${ticketCountFormatter.format(ticketsTotal)} tickets`
                  : typeof ticketsSold === "number"
                    ? `${ticketCountFormatter.format(ticketsSold)} sold`
                    : "— tickets"}
          </span>
        </div>
        <div className="h-2">
          {percent !== null ? <ProgressBar value={percent} /> : null}
        </div>
        <div className="mt-1 flex h-[15px] items-center justify-between overflow-hidden">
          {percent !== null ? (
            <span className="flex items-center text-[10px] leading-none text-rr-muted">
              <span className="leading-none">
                {percent.toFixed(0)}% sold
                {timingLabel && !isEnded && !badgeShowsTime
                  ? ` · ${timingLabel}`
                  : ""}
              </span>
              {showCommentCount ? (
                <>
                  <span className="mx-1 leading-none">·</span>
                  <IconMessageCircle
                    size={11}
                    stroke={1.5}
                    aria-hidden
                    className="block shrink-0"
                  />
                  <span className="ml-0.5 leading-none">
                    {competition.commentCount}
                  </span>
                </>
              ) : null}
            </span>
          ) : typeof ticketsTotal !== "number" &&
            typeof ticketsSold === "number" ? (
            <span className="text-[10px] leading-none text-rr-muted">
              Total tickets not disclosed
              {timingLabel && !isEnded && !badgeShowsTime
                ? ` · ${timingLabel}`
                : ""}
            </span>
          ) : timingLabel && !isEnded && !badgeShowsTime ? (
            <span className="text-[10px] leading-none text-rr-muted">
              {timingLabel}
            </span>
          ) : (
            <span />
          )}
          {isEnded ? (
            <Badge variant="neutral">Draw complete</Badge>
          ) : instantPrizes ? (
            <span className="text-[10px] font-medium leading-none text-rr-green">
              Auto draw
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (!isInteractive) {
    return <div className={cardClassName}>{cardContent}</div>;
  }

  return (
    <div className="relative">
      <ViewAllLink
        href={`/competitions/${id}`}
        className={cardClassName}
        scroll={isCompetitionDetailPage ? false : undefined}
      >
        {cardContent}
      </ViewAllLink>
    </div>
  );
}