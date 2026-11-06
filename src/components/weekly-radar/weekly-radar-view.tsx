import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import {
  formatCount,
  formatHourRange,
  formatPercent,
  formatPounds,
  formatPrice,
  formatRatio,
  formatWeekRange,
  formatWeekday,
  readBigThree,
  readClosingDays,
  readHeadline,
  readInsights,
  type WeeklyRadarBusiest,
  type WeeklyRadarDayCounts,
  type WeeklyRadarHeadline,
  type WeeklyRadarInsights,
  type WeeklyRadarIssue,
  type WeeklyRadarListItem,
  type WeeklyRadarPeak,
} from "@/lib/weekly-radar";

type Mode = "latest" | "archive";

type WeeklyRadarViewProps = {
  issue: WeeklyRadarIssue | null;
  mode: Mode;
};

const COPY = {
  latest: {
    intro:
      "What sold out, what everyone was entering, and what barely got going. A quick look at the prize competition market, without the number crunching.",
    bigThree: "The Big Three",
    insightsEyebrow: "Also on the Radar",
    insightsTitle: "Five key insights from last week.",
    scheduleEyebrow: "Looking ahead",
    scheduleTitle: "What's closing this week?",
    scheduleText: "A glance at scheduled closing dates, with links to browse the live draws.",
    scheduleCta: "Explore competitions ending soon",
    scheduleHref: "/competitions?closing=5days&sortBy=endsAt&sortOrder=asc",
  },
  archive: {
    intro:
      "Browse historical weeks to see what sold, what spent, and what moved the market. A quick look at the UK prize competition market for the selected week.",
    bigThree: "The standout draws from the selected week.",
    insightsEyebrow: "Insights",
    insightsTitle: "Five key insights for the selected week.",
    scheduleEyebrow: "Week breakdown",
    scheduleTitle: "Closing days in the selected week",
    scheduleText: "How many draws closed on each day of the selected week.",
    scheduleCta: "Explore competitions from this week",
    scheduleHref: "/competitions?sortBy=endsAt&sortOrder=asc",
  },
} as const;

type HeadlineIcon = "target" | "trophy" | "bars" | "star";

type HeadlineTile = {
  label: string;
  unit: string;
  icon: HeadlineIcon;
  value: (headline: WeeklyRadarHeadline | null) => string;
};

const HEADLINES: HeadlineTile[] = [
  {
    label: "Draws completed",
    unit: "draws",
    icon: "target",
    value: (headline) => formatCount(headline?.drawsCompleted),
  },
  {
    label: "Completely sold out",
    unit: "draws",
    icon: "trophy",
    value: (headline) => formatCount(headline?.soldOut),
  },
  {
    label: "Average sold at close",
    unit: "of tickets",
    icon: "bars",
    value: (headline) => formatPercent(headline?.averageSoldAtClose),
  },
  {
    label: "New competitions",
    unit: "listed",
    icon: "star",
    value: (headline) => formatCount(headline?.newCompetitions),
  },
];

type BigThreeKey = "undersold" | "spend" | "bestValue";

type BigThreePanel = {
  key: BigThreeKey;
  title: string;
  text: string;
  badge: (item: WeeklyRadarListItem) => string;
  detail: (item: WeeklyRadarListItem) => string;
};

const BIG_THREE: BigThreePanel[] = [
  {
    key: "undersold",
    title: "1. Most undersold draws",
    text: "The five draws that closed with the most tickets unsold.",
    badge: (item) => `${formatCount(item.ticketsUnsold)} unsold`,
    detail: (item) => `${formatPercent(item.percentSold)} sold`,
  },
  {
    key: "spend",
    title: "2. Highest ticket spend",
    text: "The five draws with the most money spent on tickets during the week, estimated.",
    badge: (item) => formatPounds(item.ticketSpend),
    detail: (item) =>
      `${formatCount(item.ticketsSold)} tickets this week${item.closed === false ? " · still live" : ""}`,
  },
  {
    key: "bestValue",
    title: "3. Best value draws",
    text: "The five draws with the best value ratio at the end of the week, as shown on the site.",
    badge: (item) => formatRatio(item.valueRatio),
    detail: (item) =>
      `${formatPounds(item.prizeValue)} prize${item.closed === false ? " · still live" : ""}`,
  },
];

type InsightIcon = "calendar" | "clock" | "bars" | "gift" | "tag";

type BusiestMetric = "spend" | "tickets";

const BUSIEST_METRIC: BusiestMetric = "spend";

const BUSIEST_COPY: Record<BusiestMetric, { day: string; hour: string }> = {
  spend: { day: "Most money spent on:", hour: "Most money spent between:" },
  tickets: { day: "Most tickets sold on:", hour: "Most tickets sold between:" },
};

function busiestPeak(busiest: WeeklyRadarBusiest | null | undefined): WeeklyRadarPeak | null {
  return busiest?.[BUSIEST_METRIC] ?? null;
}

function busiestNote(peak: WeeklyRadarPeak | null): string | null {
  if (!peak) return null;
  return BUSIEST_METRIC === "spend"
    ? `${formatPounds(peak.value)} est.`
    : `${formatCount(peak.value)} tickets`;
}

type InsightTile = {
  key: string;
  title: string;
  icon: InsightIcon;
  text: (insights: WeeklyRadarInsights | null) => string;
  value: (insights: WeeklyRadarInsights | null) => string;
  note?: (insights: WeeklyRadarInsights | null) => string | null;
};

const INSIGHTS: InsightTile[] = [
  {
    key: "busiestDay",
    title: "Busiest Day",
    icon: "calendar",
    text: () => BUSIEST_COPY[BUSIEST_METRIC].day,
    value: (insights) => formatWeekday(busiestPeak(insights?.busiestDay)?.at),
    note: (insights) => busiestNote(busiestPeak(insights?.busiestDay)),
  },
  {
    key: "busiestHour",
    title: "Busiest Hour",
    icon: "clock",
    text: () => BUSIEST_COPY[BUSIEST_METRIC].hour,
    value: (insights) => formatHourRange(busiestPeak(insights?.busiestHour)?.at),
    note: (insights) => busiestNote(busiestPeak(insights?.busiestHour)),
  },
  {
    key: "heavilyUndersold",
    title: "Heavily Undersold",
    icon: "bars",
    text: (insights) =>
      `Draws that closed with fewer than ${insights?.heavilyUndersold?.thresholdPercent ?? 25}% of tickets sold.`,
    value: (insights) =>
      insights?.heavilyUndersold ? `${formatCount(insights.heavilyUndersold.count)} draws` : placeholderValue,
    note: (insights) =>
      insights?.heavilyUndersold && insights.heavilyUndersold.sample > 0
        ? `of ${formatCount(insights.heavilyUndersold.sample)} draws`
        : null,
  },
  {
    key: "biggestPrize",
    title: "Biggest Prize",
    icon: "gift",
    text: () => "The highest published prize value from a completed draw.",
    value: (insights) => insights?.biggestPrize?.prize ?? placeholderValue,
    note: (insights) => insights?.biggestPrize?.operatorName ?? null,
  },
  {
    key: "averageTicketPrice",
    title: "Average Ticket Price",
    icon: "tag",
    text: () => "Across draws that closed this week, free draws excluded.",
    value: (insights) => formatPrice(insights?.averageTicketPrice?.average),
    note: (insights) =>
      insights?.averageTicketPrice
        ? `median ${formatPrice(insights.averageTicketPrice.median)}`
        : null,
  },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function scheduleCounts(
  mode: Mode,
  payload: unknown,
): WeeklyRadarDayCounts | null {
  const closingDays = readClosingDays(payload);
  if (!closingDays) return null;
  return mode === "latest" ? closingDays.ahead : closingDays.closed;
}

function peakDay(counts: WeeklyRadarDayCounts | null): number | null {
  if (!counts) return null;
  let best: number | null = null;
  counts.byDay.forEach((value, index) => {
    if (value <= 0) return;
    if (best === null || value > counts.byDay[best]) best = index;
  });
  return best;
}

const panelClass = "rounded-2xl border border-rr-border bg-rr-surface";
const eyebrowClass = "text-xs font-semibold uppercase tracking-[0.14em] text-rr-green";
const placeholderValue = "–";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M12.5 15 7.5 10l5-5" /> : <path d="m7.5 15 5-5-5-5" />}
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-rr-green"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.5h14M7 2.5v4M13 2.5v4" />
    </svg>
  );
}

function HeadlineIconGlyph({ icon }: { icon: HeadlineIcon }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rr-green-border text-rr-green">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "target" ? (
          <>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 12l6-6M15 6h3v3" />
          </>
        ) : null}
        {icon === "trophy" ? (
          <>
            <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
            <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4" />
          </>
        ) : null}
        {icon === "bars" ? <path d="M5 19v-5M10 19V9M15 19v-7M20 19V5" /> : null}
        {icon === "star" ? (
          <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z" />
        ) : null}
      </svg>
    </span>
  );
}

function InsightIconGlyph({ icon }: { icon: InsightIcon }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rr-green-border text-rr-green">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "calendar" ? (
          <>
            <rect x="4" y="5.5" width="16" height="14" rx="2" />
            <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
          </>
        ) : null}
        {icon === "clock" ? (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4.5l3 1.5" />
          </>
        ) : null}
        {icon === "bars" ? <path d="M5 19v-5M10 19V9M15 19v-7M20 19V5" /> : null}
        {icon === "gift" ? (
          <>
            <rect x="4" y="10" width="16" height="10" rx="1.5" />
            <path d="M3.5 7.5h17V10h-17zM12 7.5V20M12 7.5c-1.5-3.5-5-3.5-5-1.5s3 1.5 5 1.5c2 0 5 0 5-1.5s-3.5-2-5 1.5" />
          </>
        ) : null}
        {icon === "tag" ? (
          <>
            <path d="M4 12.5V5a1 1 0 0 1 1-1h7.5l7.5 7.5-8.5 8.5L4 12.5Z" />
            <circle cx="8.5" cy="8.5" r="1.2" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function BiggestPrizeThumb({ insights }: { insights: WeeklyRadarInsights | null }) {
  const prize = insights?.biggestPrize;
  if (!prize) return null;
  const image = (
    <span className="relative block h-11 w-14 shrink-0 overflow-hidden rounded-md bg-rr-elevated">
      <CompetitionImage
        src={prize.imageUrl}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
        unoptimized
      />
    </span>
  );
  if (!prize.slug) return <span className="shrink-0 lg:hidden xl:block">{image}</span>;
  return (
    <Link
      href={`/competitions/${prize.slug}`}
      aria-label={prize.prize}
      className="block shrink-0 no-underline transition-opacity hover:opacity-90 lg:hidden xl:block"
    >
      {image}
    </Link>
  );
}

function WeekNavButton({
  href,
  direction,
  children,
}: {
  href: string | null;
  direction: "left" | "right";
  children: ReactNode;
}) {
  const content = (
    <>
      {direction === "left" ? <ChevronIcon direction="left" /> : null}
      <span className="hidden sm:inline">{children}</span>
      {direction === "right" ? <ChevronIcon direction="right" /> : null}
    </>
  );
  const base =
    "inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-2 text-sm font-medium no-underline transition-colors sm:px-4 sm:py-1.5";

  if (!href) {
    return (
      <span
        aria-disabled="true"
        aria-label={typeof children === "string" ? children : undefined}
        className={cn(base, "cursor-not-allowed border-rr-border text-rr-muted opacity-60")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(base, "border-rr-green-border text-rr-primary hover:bg-rr-green-bg")}
    >
      {content}
    </Link>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title?: string }) {
  return (
    <div className="mb-3">
      <p className={eyebrowClass}>{eyebrow}</p>
      {title ? <h2 className="mt-1 text-lg font-semibold text-rr-primary">{title}</h2> : null}
    </div>
  );
}

function weekHref(weekStart: string | null): string | null {
  return weekStart ? `/weekly-radar/${weekStart}` : null;
}

function BigThreeRow({
  rank,
  item,
  panel,
}: {
  rank: number;
  item: WeeklyRadarListItem;
  panel: BigThreePanel;
}) {
  const href = item.slug ? `/competitions/${item.slug}` : null;
  const body = (
    <>
      <span className="w-5 shrink-0 text-sm font-semibold text-rr-secondary">{rank}.</span>
      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-rr-elevated">
        <CompetitionImage
          src={item.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          unoptimized
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-rr-primary">
          {item.prize}
        </span>
        <span className="mt-0.5 block truncate text-xs text-rr-secondary">{panel.detail(item)}</span>
      </span>
      <span className="shrink-0 whitespace-nowrap rounded-md border border-rr-green-border px-1.5 py-1 text-[11px] font-semibold text-rr-green sm:px-2 sm:text-xs">
        {panel.badge(item)}
      </span>
    </>
  );
  const rowClass = "flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 no-underline sm:gap-3";

  if (!href) {
    return <li className={cn(rowClass, "min-w-0")}>{body}</li>;
  }

  return (
    <li className="min-w-0">
      <Link href={href} className={cn(rowClass, "transition-colors hover:bg-rr-elevated")}>
        {body}
      </Link>
    </li>
  );
}

function BigThreePlaceholderRow({ rank }: { rank: number }) {
  return (
    <li className="flex items-center gap-3 px-1 py-1">
      <span className="w-5 text-sm font-semibold text-rr-secondary">{rank}.</span>
      <span className="h-10 w-14 shrink-0 rounded-md bg-rr-elevated" />
      <span className="h-3 flex-1 rounded bg-rr-elevated" />
      <span className="rounded-md border border-rr-green-border px-2 py-1 text-xs text-rr-muted">
        {placeholderValue}
      </span>
    </li>
  );
}

export function WeeklyRadarView({ issue, mode }: WeeklyRadarViewProps) {
  const copy = COPY[mode];
  const weekLabel = issue ? formatWeekRange(issue.weekStart, issue.weekEnd) : "No issue yet";
  const headline = readHeadline(issue?.payload);
  const bigThree = readBigThree(issue?.payload);
  const insights = readInsights(issue?.payload);
  const schedule = scheduleCounts(mode, issue?.payload);
  const schedulePeak = peakDay(schedule);
  const scheduleLabel = schedule ? formatWeekRange(schedule.weekStart, schedule.weekEnd) : null;

  return (
    <main className="py-6 md:py-10">
      <div className="container space-y-6 md:space-y-8">
        <header className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className={eyebrowClass}>
              UK Competition Market –{" "}
              <span className="whitespace-nowrap">Weekly Round-up</span>
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-rr-primary md:text-5xl">
              The Weekly <span className="text-rr-green">Radar.</span>
            </h1>
          </div>
          <p className="text-sm leading-6 text-rr-secondary">{copy.intro}</p>
          <div className="justify-self-start rounded-xl border-2 border-rr-green bg-rr-surface px-4 py-2 text-center md:-rotate-3 md:justify-self-end">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rr-primary">
              Your weekly fix
            </p>
            <p className="text-3xl font-bold leading-tight text-rr-green">5 min</p>
            <p className="text-xs text-rr-secondary">All the numbers worth knowing</p>
          </div>
        </header>

        <nav
          aria-label="Weekly Radar weeks"
          className="flex items-center justify-between gap-2 rounded-full border border-rr-green-border bg-rr-surface px-2 py-2"
        >
          <WeekNavButton href={weekHref(issue?.previousWeekStart ?? null)} direction="left">
            Previous Week
          </WeekNavButton>
          <p className="inline-flex min-w-0 items-center gap-2 text-center text-sm font-semibold text-rr-primary">
            <CalendarIcon />
            <span>{weekLabel}</span>
          </p>
          <WeekNavButton href={weekHref(issue?.nextWeekStart ?? null)} direction="right">
            Next Week
          </WeekNavButton>
        </nav>

        <section aria-label="Headline numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HEADLINES.map((item) => (
            <div
              key={item.label}
              className={cn(
                panelClass,
                "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-4",
              )}
            >
              <p className="col-span-2 text-[11px] font-semibold uppercase leading-tight tracking-[0.08em] text-rr-secondary sm:col-span-1 sm:col-start-2 sm:row-start-1">
                {item.label}
              </p>
              <div className="sm:row-span-2 sm:row-start-1">
                <HeadlineIconGlyph icon={item.icon} />
              </div>
              <div className="min-w-0 sm:col-start-2">
                <p className="text-2xl font-bold leading-none text-rr-primary sm:text-3xl">
                  {item.value(headline)}
                </p>
                <p className="mt-1 text-xs text-rr-secondary">{item.unit}</p>
              </div>
            </div>
          ))}
        </section>

        <section aria-label={copy.bigThree}>
          <SectionHeading eyebrow={copy.bigThree} />
          <div className="grid min-w-0 gap-3 lg:grid-cols-3">
            {BIG_THREE.map((panel) => {
              const items = bigThree?.[panel.key] ?? [];
              return (
                <div key={panel.key} className={cn(panelClass, "min-w-0 p-4")}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-rr-primary">
                    {panel.title}
                  </h3>
                  <p className="mt-1 text-xs text-rr-secondary">{panel.text}</p>
                  <ol className="mt-3 space-y-1.5">
                    {items.length > 0
                      ? items.map((item, index) => (
                          <BigThreeRow key={item.id} rank={index + 1} item={item} panel={panel} />
                        ))
                      : [1, 2, 3, 4, 5].map((rank) => (
                          <BigThreePlaceholderRow key={rank} rank={rank} />
                        ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label={copy.insightsTitle}>
          <SectionHeading eyebrow={copy.insightsEyebrow} title={copy.insightsTitle} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {INSIGHTS.map((item, index) => {
              const note = item.note?.(insights) ?? null;
              return (
                <div
                  key={item.key}
                  className={cn(
                    panelClass,
                    "flex min-w-0 flex-col p-4",
                    index === INSIGHTS.length - 1 && "sm:col-span-2 md:col-span-1",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <InsightIconGlyph icon={item.icon} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-rr-primary">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-rr-secondary">{item.text(insights)}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-3">
                    <div className="flex items-center gap-2.5">
                      {item.key === "biggestPrize" ? (
                        <p className="min-w-0 flex-1 rounded-xl bg-rr-green-bg px-2 py-1.5 text-center text-[11px] font-semibold leading-tight tracking-tight text-rr-green">
                          <span className="line-clamp-3 break-words">{item.value(insights)}</span>
                        </p>
                      ) : (
                        <p className="min-w-0 flex-1 truncate rounded-full bg-rr-green-bg px-3 py-1.5 text-center text-sm font-semibold text-rr-green">
                          {item.value(insights)}
                        </p>
                      )}
                      {item.key === "biggestPrize" ? <BiggestPrizeThumb insights={insights} /> : null}
                    </div>
                    {note ? (
                      <p className="mt-1.5 truncate text-center text-xs text-rr-secondary">{note}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-label={copy.scheduleTitle}
          className={cn(panelClass, "grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center")}
        >
          <div>
            <p className={eyebrowClass}>{copy.scheduleEyebrow}</p>
            <h2 className="mt-1 text-xl font-bold text-rr-primary">{copy.scheduleTitle}</h2>
            <p className="mt-1 text-sm text-rr-secondary">{copy.scheduleText}</p>
            {scheduleLabel ? (
              <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-rr-primary">
                <CalendarIcon />
                <span>{scheduleLabel}</span>
                {schedule ? (
                  <span className="font-normal text-rr-secondary">
                    · {formatCount(schedule.total)} draws
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <ul className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEK_DAYS.map((day, index) => {
              const count = schedule ? schedule.byDay[index] : null;
              const isPeak = schedulePeak === index;
              return (
                <li
                  key={day}
                  className={cn(
                    "rounded-lg border px-1.5 py-2 text-center sm:px-3",
                    isPeak ? "border-rr-green bg-rr-green-bg" : "border-rr-border",
                  )}
                >
                  <p className={cn("text-xs", isPeak ? "text-rr-green" : "text-rr-secondary")}>
                    {day}
                  </p>
                  <p className={cn("text-lg font-bold", isPeak ? "text-rr-green" : "text-rr-primary")}>
                    {count === null ? placeholderValue : formatCount(count)}
                  </p>
                  <p className="text-[10px] text-rr-muted sm:text-xs">draws</p>
                </li>
              );
            })}
          </ul>
          <Link
            href={copy.scheduleHref}
            className="inline-flex items-center justify-center rounded-xl bg-rr-green px-5 py-3 text-sm font-semibold text-rr-on-accent no-underline transition-opacity hover:opacity-90"
          >
            {copy.scheduleCta}
          </Link>
        </section>
      </div>
    </main>
  );
}
