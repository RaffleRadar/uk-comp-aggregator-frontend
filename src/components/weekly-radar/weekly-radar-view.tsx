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
    weekNote: "Last week · Monday to Sunday",
    bigThree: "The Big Three",
    bigThreeTitle: "Standout draws from last week.",
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
    weekNote: "Selected week · Monday to Sunday",
    bigThree: "The Big Three",
    bigThreeTitle: "Standout draws from the selected week.",
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
  accent?: boolean;
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
    accent: true,
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
    title: "Most undersold draws",
    text: "The five draws that closed with the most tickets unsold.",
    badge: (item) => `${formatCount(item.ticketsUnsold)} unsold`,
    detail: (item) => `${formatPercent(item.percentSold)} sold`,
  },
  {
    key: "spend",
    title: "Highest ticket spend",
    text: "The five draws with the most money spent on tickets during the week, estimated.",
    badge: (item) => formatPounds(item.ticketSpend),
    detail: (item) => `${formatCount(item.ticketsSold)} tickets`,
  },
  {
    key: "bestValue",
    title: "Best value draws",
    text: "The five draws with the best value ratio at the end of the week, as shown on the site.",
    badge: (item) => formatRatio(item.valueRatio),
    detail: (item) => `${formatPounds(item.prizeValue)} prize`,
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
const RADAR_THEME = cn(
  "dark:bg-rr-bg",
  "dark:[--bg:#02080a] dark:[--surface:#060c0e] dark:[--elevated:#0d1416] dark:[--border:#3b4247]",
  "dark:[--text-secondary:#c3c8cd] dark:[--text-muted:#8a9198]",
  "dark:[--accent:#6ff05e] dark:[--accent-bg:#0c2a10] dark:[--accent-border:#2d7a2a] dark:[--accent-foreground:#02080a]",
);

const shortDayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const shortYearFormat = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  timeZone: "UTC",
});

function formatShortWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(`${weekEnd}T00:00:00.000Z`);
  return `${shortDayFormat.format(start)} – ${shortDayFormat.format(end)} ${shortYearFormat.format(end)}`;
}
const placeholderValue = "–";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-rr-green xl:h-5 xl:w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M12.5 15 7.5 10l5-5" /> : <path d="m7.5 15 5-5-5-5" />}
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0 text-rr-green", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" strokeWidth="2.6" />
      <path d="M15 16.5h3M16.5 15v3" strokeWidth="1.8" />
    </svg>
  );
}

function HeadlineIconGlyph({ icon }: { icon: HeadlineIcon }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-rr-green sm:h-9 sm:w-9 xl:h-10 xl:w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "target" ? (
        <>
          <path d="M19.5 10.3A8 8 0 1 1 13.7 4.5" />
          <path d="M15.6 11.2a3.8 3.8 0 1 1-2.8-2.8" />
          <path d="M12 12l7.5-7.5" />
          <path d="M16.5 3.5v4h4" />
        </>
      ) : null}
      {icon === "trophy" ? (
        <>
          <path d="M7.5 3.5h9v5.5a4.5 4.5 0 0 1-9 0V3.5Z" />
          <path d="M7.5 5.5H4.5v1a3.5 3.5 0 0 0 3.2 3.5M16.5 5.5h3v1a3.5 3.5 0 0 1-3.2 3.5M12 13.5v4M8 20.5h8M9.5 17.5h5" />
        </>
      ) : null}
      {icon === "bars" ? (
        <g fill="currentColor" stroke="none">
          <rect x="3" y="12" width="5" height="9" rx="1" />
          <rect x="9.5" y="8" width="5" height="13" rx="1" />
          <rect x="16" y="3" width="5" height="18" rx="1" />
        </g>
      ) : null}
      {icon === "star" ? (
        <path d="m12 3 2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 17.06l-5.5 2.89 1.05-6.12L3.1 9.5l6.15-.9L12 3Z" />
      ) : null}
    </svg>
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
      <span>{children}</span>
      {direction === "right" ? <ChevronIcon direction="right" /> : null}
    </>
  );
  const base = cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-2.5 text-[13px] font-semibold no-underline transition-colors",
    "lg:gap-2 lg:rounded-full lg:px-4 lg:py-1.5 lg:text-sm lg:font-bold xl:gap-2.5 xl:px-9 xl:text-base",
    direction === "left" ? "lg:order-1 lg:justify-self-end" : "lg:order-5 lg:justify-self-start",
  );

  if (!href) {
    return (
      <span
        aria-disabled="true"
        aria-label={typeof children === "string" ? children : undefined}
        className={cn(base, "cursor-not-allowed border-rr-border text-rr-muted opacity-50")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(base, "border-rr-green-border text-rr-primary hover:bg-rr-green-bg lg:border-rr-green")}
    >
      {content}
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  titleClassName,
}: {
  eyebrow: string;
  title?: string;
  titleClassName?: string;
}) {
  return (
    <div className="mb-3 lg:mb-4">
      <p
        className={cn(
          eyebrowClass,
          "flex items-center gap-2 font-bold tracking-[0.08em] lg:text-base lg:tracking-[0.02em]",
        )}
      >
        <span aria-hidden="true" className="h-4 w-1 shrink-0 rounded-full bg-rr-green lg:h-6 lg:w-1.5" />
        <span>{eyebrow}</span>
      </p>
      {title ? (
        <h2
          className={cn(
            "mt-1 pl-3 text-2xl font-extrabold leading-tight tracking-[-0.01em] text-rr-primary lg:pl-3.5 lg:text-[1.75rem]",
            titleClassName,
          )}
        >
          {title}
        </h2>
      ) : null}
    </div>
  );
}

function BigThreeIcon({ panel }: { panel: BigThreeKey }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rr-green-bg text-rr-green lg:h-12 lg:w-12 lg:bg-rr-green lg:text-rr-on-accent">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 lg:h-7 lg:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {panel === "undersold" ? <path d="M6 6l12 12M18 9v9H9" /> : null}
        {panel === "spend" ? (
          <>
            <ellipse cx="9" cy="7" rx="5" ry="2.5" />
            <path d="M4 7v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7" />
            <path d="M4 10v3c0 1.4 2.2 2.5 5 2.5" />
            <ellipse cx="15" cy="14" rx="5" ry="2.5" />
            <path d="M10 14v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3" />
          </>
        ) : null}
        {panel === "bestValue" ? (
          <>
            <path d="M6.5 4h11l3.5 5-9 11-9-11 3.5-5Z" />
            <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
          </>
        ) : null}
      </svg>
    </span>
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
        <span className="mt-0.5 block truncate text-xs text-rr-secondary">
          {panel.key !== "undersold" && item.closed === false ? (
            <>
              <span className="font-semibold text-rr-green">Live</span>
              {" · "}
            </>
          ) : null}
          {panel.detail(item)}
        </span>
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
  const shortWeekLabel = issue
    ? formatShortWeekRange(issue.weekStart, issue.weekEnd)
    : "No issue yet";
  const introLines = mode === "latest" ? copy.intro.split(/(?<=\.)\s+/) : [copy.intro];
  const headline = readHeadline(issue?.payload);
  const bigThree = readBigThree(issue?.payload);
  const insights = readInsights(issue?.payload);
  const schedule = scheduleCounts(mode, issue?.payload);
  const schedulePeak = peakDay(schedule);
  const scheduleLabel = schedule ? formatWeekRange(schedule.weekStart, schedule.weekEnd) : null;

  return (
    <main className={cn("py-6 md:py-10", RADAR_THEME)}>
      <div className="container space-y-5 md:space-y-8">
        <header className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 hidden h-[calc(100%+3rem)] w-1/2 bg-[radial-gradient(circle,var(--accent-border)_1.2px,transparent_1.6px)] bg-[length:14px_14px] [mask-image:linear-gradient(to_left,black_35%,transparent)] lg:block"
          />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-5">
            <div className="grid gap-3 lg:col-start-1 lg:row-start-1 lg:flex lg:items-center lg:gap-4">
              <div className="lg:shrink-0">
                <p
                  className={cn(
                    eyebrowClass,
                    "flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] lg:text-sm lg:tracking-[0.02em]",
                  )}
                >
                  <span aria-hidden="true" className="h-4 w-1 shrink-0 rounded-full bg-rr-green lg:h-6 lg:w-1.5" />
                  <span>
                    UK Competition Market –{" "}
                    <span className="whitespace-nowrap">Weekly Round-up</span>
                  </span>
                </p>
                <h1 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-rr-primary md:text-5xl lg:mt-1 lg:text-[2.4rem] xl:text-[2.6rem]">
                  The Weekly <span className="text-rr-green">Radar.</span>
                </h1>
              </div>
              <span aria-hidden="true" className="hidden w-0.5 shrink-0 self-stretch rounded-full bg-rr-green lg:block" />
              <p className="text-sm leading-6 text-rr-secondary lg:min-w-0 lg:flex-1 lg:text-[13px] lg:leading-[1.65] xl:text-[13.5px]">
                {introLines.map((line, index) => (
                  <span key={index} className="xl:block xl:whitespace-nowrap">
                    {index > 0 ? " " : null}
                    {line}
                  </span>
                ))}
              </p>
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <p className="inline-flex items-center gap-2 text-xs text-rr-secondary">
                  <CalendarIcon />
                  <span>New round-up every Monday</span>
                </p>
                <span className="shrink-0 rounded-full border border-rr-green-border bg-rr-green-bg px-3 py-1 text-xs font-semibold text-rr-primary">
                  5 min read
                </span>
              </div>
            </div>

            <div className="hidden rotate-[4deg] rounded-2xl border-[3px] border-rr-green bg-gradient-to-br from-rr-green-bg to-rr-bg px-4 py-2.5 text-center shadow-[0_0_28px_-6px_var(--accent)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
              <p className="text-xs font-extrabold uppercase tracking-[0.06em] text-rr-primary xl:text-sm">
                Your weekly fix
              </p>
              <p className="text-4xl font-black leading-none tracking-[-0.02em] text-rr-primary xl:text-5xl">
                5 min
              </p>
              <p className="mt-1 text-[11px] font-semibold text-rr-primary xl:text-xs">
                All the numbers worth knowing
              </p>
            </div>

            <nav
              aria-label="Weekly Radar weeks"
              className="rounded-2xl border border-rr-green-border bg-rr-surface p-3 lg:col-start-1 lg:row-start-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] lg:items-center lg:gap-x-4 lg:rounded-full lg:border-2 lg:border-rr-green lg:bg-rr-bg lg:px-3 lg:py-2 xl:gap-x-8"
            >
              <div className="text-center lg:order-3 lg:min-w-0">
                <p className="inline-flex items-center gap-2 text-base font-semibold text-rr-primary lg:gap-2 lg:whitespace-nowrap lg:text-base lg:font-bold xl:gap-2.5 xl:text-xl">
                  <CalendarIcon className="lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  <span className="lg:hidden">{shortWeekLabel}</span>
                  <span className="hidden lg:inline">{weekLabel}</span>
                </p>
                <p className="mt-0.5 text-xs text-rr-secondary lg:hidden">{copy.weekNote}</p>
              </div>
              <span aria-hidden="true" className="hidden h-8 w-0.5 rounded-full bg-rr-green lg:order-2 lg:block" />
              <span aria-hidden="true" className="hidden h-8 w-0.5 rounded-full bg-rr-green lg:order-4 lg:block" />
              <div className="mt-3 grid grid-cols-2 gap-2 lg:contents">
                <WeekNavButton href={weekHref(issue?.previousWeekStart ?? null)} direction="left">
                  Previous Week
                </WeekNavButton>
                <WeekNavButton href={weekHref(issue?.nextWeekStart ?? null)} direction="right">
                  Next Week
                </WeekNavButton>
              </div>
            </nav>
          </div>
        </header>

        <section aria-label="Headline numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {HEADLINES.map((item) => (
            <div
              key={item.label}
              className={cn(panelClass, "flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4 xl:py-3.5")}
            >
              <HeadlineIconGlyph icon={item.icon} />
              <span aria-hidden="true" className="hidden h-12 w-0.5 shrink-0 rounded-full bg-rr-border sm:block" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-rr-primary lg:text-xs xl:whitespace-nowrap">
                  {item.label}
                </p>
                <p className="mt-1 flex flex-col xl:flex-row xl:items-baseline xl:gap-2">
                  <span
                    className={cn(
                      "text-2xl font-extrabold leading-none sm:text-3xl xl:text-[2.1rem]",
                      item.accent ? "text-rr-green" : "text-rr-primary",
                    )}
                  >
                    {item.value(headline)}
                  </span>
                  <span className="mt-1 whitespace-nowrap text-xs text-rr-secondary xl:mt-0 xl:text-[15px] xl:text-rr-primary">
                    {item.unit}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </section>

        <section aria-label={copy.bigThree}>
          <SectionHeading eyebrow={copy.bigThree} title={copy.bigThreeTitle} titleClassName="lg:hidden" />
          <div className="grid min-w-0 gap-3 lg:grid-cols-3 lg:gap-4">
            {BIG_THREE.map((panel, panelIndex) => {
              const items = bigThree?.[panel.key] ?? [];
              return (
                <div key={panel.key} className={cn(panelClass, "min-w-0 p-4")}>
                  <div className="flex items-start gap-3 border-b border-rr-border pb-3 lg:items-center lg:border-0 lg:pb-0">
                    <BigThreeIcon panel={panel.key} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-rr-green lg:hidden">
                        0{panelIndex + 1} / The Big Three
                      </p>
                      <h3 className="text-sm font-extrabold uppercase leading-tight tracking-[0.02em] text-rr-primary lg:text-base xl:text-lg">
                        <span className="hidden lg:inline">{panelIndex + 1}. </span>
                        {panel.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-snug text-rr-secondary lg:text-[13px] lg:text-rr-primary">
                        {panel.text}
                      </p>
                    </div>
                  </div>
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
