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
  badgeNote?: string;
  detail: (item: WeeklyRadarListItem) => string;
};

const BIG_THREE: BigThreePanel[] = [
  {
    key: "undersold",
    title: "Most undersold draws",
    text: "The five draws that closed with the most tickets unsold.",
    badge: (item) => formatCount(item.ticketsUnsold),
    badgeNote: "unsold",
    detail: (item) =>
      `${formatPercent(item.percentSold)} sold · ${formatCount(item.ticketsUnsold)} unsold`,
  },
  {
    key: "spend",
    title: "Highest ticket spend",
    text: "The five draws with the most money spent on tickets during the week, estimated.",
    badge: (item) => formatPounds(item.ticketSpend),
    detail: (item) => `${formatCount(item.ticketsSold)} tickets sold`,
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
    title: "Typical Ticket Price",
    icon: "tag",
    text: () => "Across draws that closed this week, free draws excluded.",
    value: (insights) => formatPrice(insights?.averageTicketPrice?.median),
  },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
      className={cn(
        "h-4 w-4 shrink-0 text-rr-green transition-transform duration-200 ease-out xl:h-6 xl:w-6",
        direction === "left"
          ? "motion-safe:group-hover:-translate-x-1"
          : "motion-safe:group-hover:translate-x-1",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
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
      className="h-10 w-10 shrink-0 text-rr-green transition-transform duration-300 ease-out sm:h-11 sm:w-11 xl:h-[3.25rem] xl:w-[3.25rem] motion-safe:group-hover/tile:scale-110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "target" ? (
        <>
          <path d="M20.3 11.2A8.4 8.4 0 1 1 12.8 3.7" strokeWidth="2.8" />
          <path d="M16.1 11.6a4.2 4.2 0 1 1-3.7-3.7" strokeWidth="2.8" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <path d="M12 12 18 6" strokeWidth="2.4" />
          <path d="M16 8 16.6 3.2 19 2.8 18.6 5.4 21.2 5 20.8 7.4Z" fill="currentColor" strokeWidth="1.2" />
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rr-green-bg text-rr-green lg:h-auto lg:w-auto lg:bg-transparent">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-7 w-7 transition-transform duration-300 ease-out lg:h-10 lg:w-10 motion-safe:group-hover/tile:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        {icon === "calendar" ? (
          <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4M15.5 13.5v4M13.5 15.5h4" />
          </>
        ) : null}
        {icon === "clock" ? (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </>
        ) : null}
        {icon === "bars" ? (
          <g fill="currentColor" stroke="none">
            <rect x="3" y="12" width="5" height="9" rx="1" />
            <rect x="9.5" y="8" width="5" height="13" rx="1" />
            <rect x="16" y="3" width="5" height="18" rx="1" />
          </g>
        ) : null}
        {icon === "gift" ? (
          <>
            <rect x="4" y="11" width="16" height="9.5" rx="1.5" />
            <path d="M3 7.5h18V11H3zM12 7.5v13M12 7.5C10.5 4 7 3.8 7 5.8 7 7.5 10 7.5 12 7.5c2 0 5 0 5-1.7 0-2-3.5-1.8-5 1.7" />
          </>
        ) : null}
        {icon === "tag" ? (
          <>
            <path d="M3.5 12.5V5a1.5 1.5 0 0 1 1.5-1.5h7.5l8 8-9 9-8-8Z" />
            <circle cx="8.5" cy="8.5" r="1.4" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function BiggestPrizeThumb({
  insights,
  className,
}: {
  insights: WeeklyRadarInsights | null;
  className?: string;
}) {
  const prize = insights?.biggestPrize;
  if (!prize) return null;
  const image = (
    <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded-md bg-rr-elevated">
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
  if (!prize.slug) return <span className={cn("shrink-0", className)}>{image}</span>;
  return (
    <Link
      href={`/competitions/${prize.slug}`}
      aria-label={prize.prize}
      className={cn("block shrink-0 no-underline transition-opacity hover:opacity-90", className)}
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
    "group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-2.5 text-[13px] font-semibold no-underline transition-[background-color,box-shadow,transform] duration-200 ease-out",
    "lg:gap-2 lg:rounded-full lg:px-4 lg:py-1 lg:text-sm lg:font-bold xl:gap-2.5 xl:px-9 xl:text-base",
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
      className={cn(
        base,
        "border-rr-green-border text-rr-primary hover:bg-rr-green-bg hover:shadow-[0_0_18px_-6px_var(--accent)] active:scale-[0.97] focus-visible:shadow-[0_0_18px_-6px_var(--accent)] lg:border-rr-green",
      )}
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
    <div className="mb-2 flex items-stretch gap-2.5 lg:mb-3">
      <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-rr-green lg:w-1.5" />
      <div className="min-w-0">
        <p className={cn(eyebrowClass, "font-bold tracking-[0.08em] lg:text-base lg:tracking-[0.02em]")}>
          {eyebrow}
        </p>
        {title ? (
          <h2
            className={cn(
              "text-2xl font-extrabold leading-tight tracking-[-0.01em] text-rr-primary lg:text-[1.4rem]",
              titleClassName,
            )}
          >
            {title}
          </h2>
        ) : null}
      </div>
    </div>
  );
}

function ScheduleCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/cta items-center justify-center gap-2 rounded-2xl bg-rr-green px-5 py-3.5 text-center text-base font-extrabold leading-tight text-rr-on-accent no-underline shadow-[0_0_24px_-8px_var(--accent)] transition-[transform,box-shadow] duration-200 ease-out hover:shadow-[0_0_34px_-4px_var(--accent)] focus-visible:shadow-[0_0_34px_-4px_var(--accent)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]",
        className,
      )}
    >
      <span>
        {children}
        <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="ml-1.5 inline-block h-5 w-5 align-[-4px] transition-transform duration-200 ease-out motion-safe:group-hover/cta:-translate-y-0.5 motion-safe:group-hover/cta:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 14 14 6M7.5 6H14v6.5" />
        </svg>
      </span>
    </Link>
  );
}

function BigThreeIcon({ panel }: { panel: BigThreeKey }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rr-green-bg text-rr-green lg:h-[3.25rem] lg:w-[3.25rem] lg:bg-rr-green lg:text-rr-on-accent">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6 lg:h-9 lg:w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        {panel === "undersold" ? <path d="M6.5 6.5 17 17M17 9.5V17H9.5" strokeWidth="2.4" /> : null}
        {panel === "spend" ? (
          <>
            <ellipse cx="9" cy="6.5" rx="5" ry="2.2" />
            <path d="M4 6.5v2.6c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V6.5" />
            <path d="M4 9.1v2.6c0 1.2 2.2 2.2 5 2.2" />
            <ellipse cx="15" cy="13.5" rx="5" ry="2.2" />
            <path d="M10 13.5v2.6c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-2.6" />
            <path d="M10 16.1v2.6c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-2.6" />
          </>
        ) : null}
        {panel === "bestValue" ? (
          <>
            <path d="M7 4.5h10l3.5 4.5L12 19.5 3.5 9 7 4.5Z" />
            <path d="M3.5 9h17M9.8 4.5 8.3 9 12 19.5 15.7 9l-1.5-4.5" />
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
      <span className="w-4 shrink-0 text-sm font-bold text-rr-primary">{rank}.</span>
      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-rr-elevated">
        <CompetitionImage
          src={item.imageUrl}
          alt=""
          fill
          sizes="72px"
          className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover/row:scale-110"
          unoptimized
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] font-semibold leading-[1.2] text-rr-primary">
          {item.prize}
        </span>
        <span className="mt-0.5 block truncate text-[11px] leading-tight text-rr-secondary xl:text-xs">
          {panel.key !== "undersold" && item.closed === false ? (
            <>
              <span className="font-semibold text-rr-green">Live</span>
              {" · "}
            </>
          ) : null}
          {panel.detail(item)}
        </span>
      </span>
      <span className="flex min-w-[3.75rem] shrink-0 flex-col items-center justify-center rounded-lg border border-rr-green px-1.5 py-1 text-center transition-[background-color,box-shadow] duration-200 group-hover/row:bg-rr-green-bg group-hover/row:shadow-[0_0_14px_-4px_var(--accent)]">
        <span className="whitespace-nowrap text-xs font-bold leading-tight text-rr-primary">
          {panel.badge(item)}
        </span>
        {panel.badgeNote ? (
          <span className="text-[10px] leading-tight text-rr-secondary">{panel.badgeNote}</span>
        ) : null}
      </span>
    </>
  );
  const rowClass = "flex min-w-0 items-center gap-2 px-0.5 py-1.5 no-underline";

  if (!href) {
    return <li className="min-w-0"><div className={rowClass}>{body}</div></li>;
  }

  return (
    <li className="min-w-0">
      <Link
        href={href}
        className={cn(
          rowClass,
          "group/row rounded-lg transition-[background-color,transform] duration-200 ease-out hover:bg-rr-elevated motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        )}
      >
        {body}
      </Link>
    </li>
  );
}

function BigThreePlaceholderRow({ rank }: { rank: number }) {
  return (
    <li className="flex items-center gap-2.5 px-1 py-2">
      <span className="w-5 text-base font-bold text-rr-secondary">{rank}.</span>
      <span className="h-10 w-14 shrink-0 rounded-md bg-rr-elevated" />
      <span className="h-3 flex-1 rounded bg-rr-elevated" />
      <span className="min-w-[4.25rem] rounded-lg border border-rr-green-border px-2 py-1 text-center text-xs text-rr-muted">
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

  return (
    <main className={cn("py-5 md:py-7", RADAR_THEME)}>
      <div className="container space-y-4 lg:space-y-5">
        <header className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 hidden h-[calc(100%+3rem)] w-1/2 bg-[radial-gradient(circle,var(--accent-border)_1.2px,transparent_1.6px)] bg-[length:14px_14px] [mask-image:linear-gradient(to_left,black_35%,transparent)] lg:block"
          />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-3">
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
                  <span key={index} className={introLines.length > 1 ? "xl:block xl:whitespace-nowrap" : undefined}>
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

            <div className="hidden rotate-[4deg] rounded-2xl border-[3px] transition-transform duration-300 ease-out motion-safe:hover:rotate-[1deg] motion-safe:hover:scale-[1.04] border-rr-green bg-gradient-to-br from-rr-green-bg to-rr-bg px-4 py-2.5 text-center shadow-[0_0_28px_-6px_var(--accent)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
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
              className="rounded-2xl border border-rr-green-border bg-rr-surface p-3 lg:col-start-1 lg:row-start-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] lg:items-center lg:gap-x-4 lg:rounded-full lg:border-2 lg:border-rr-green lg:bg-rr-bg lg:px-3 lg:py-1.5 xl:gap-x-8"
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
              className={cn(
                panelClass,
                "group/tile flex min-w-0 items-center gap-2.5 px-3 py-2 transition-[border-color,transform] duration-200 ease-out hover:border-rr-green-border sm:px-3.5 xl:gap-3 xl:py-2 motion-safe:hover:-translate-y-0.5",
              )}
            >
              <HeadlineIconGlyph icon={item.icon} />
              <span aria-hidden="true" className="hidden h-12 w-0.5 shrink-0 rounded-full bg-rr-border sm:block" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-rr-primary lg:text-xs xl:whitespace-nowrap">
                  {item.label}
                </p>
                <p className="mt-0.5 flex flex-col xl:flex-row xl:items-baseline xl:gap-2">
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
                <div key={panel.key} className={cn(panelClass, "min-w-0 px-3 pb-1.5 pt-3")}>
                  <div className="flex items-start gap-3 border-b border-rr-border pb-2.5 lg:items-center lg:border-0 lg:pb-0">
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
                  <ol className="mt-1.5 divide-y divide-rr-border">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {INSIGHTS.map((item, index) => {
              const note = item.note?.(insights) ?? null;
              const isPrize = item.key === "biggestPrize";
              return (
                <div
                  key={item.key}
                  className={cn(
                    panelClass,
                    "group/tile flex min-w-0 items-center gap-3 bg-gradient-to-br from-rr-green-bg to-rr-surface px-3 py-2.5 transition-[border-color,transform] duration-200 ease-out hover:border-rr-green-border lg:flex-col lg:items-stretch lg:gap-0 lg:bg-none lg:bg-rr-surface lg:py-2 motion-safe:hover:-translate-y-0.5",
                    index === INSIGHTS.length - 1 && "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:items-center lg:gap-2">
                    <InsightIconGlyph icon={item.icon} />
                    <span aria-hidden="true" className="h-12 w-0.5 shrink-0 rounded-full bg-rr-border lg:hidden" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-tight text-rr-primary lg:truncate lg:text-[13.5px] lg:tracking-tight xl:text-sm" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-rr-secondary lg:min-h-[2.75em]">
                        {item.text(insights)}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-lg font-extrabold leading-tight text-rr-green lg:hidden",
                          isPrize ? "line-clamp-2 text-base" : "truncate",
                        )}
                      >
                        {item.value(insights)}
                      </p>
                      {note ? (
                        <p className="truncate text-[11px] text-rr-secondary lg:hidden">{note}</p>
                      ) : null}
                    </div>
                  </div>
                  {isPrize ? <BiggestPrizeThumb insights={insights} className="lg:hidden" /> : null}
                  <div className="hidden lg:mt-2 lg:block">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "min-w-0 flex-1 bg-rr-green px-3 py-1 text-center font-extrabold text-rr-on-accent",
                          isPrize
                            ? "rounded-xl text-[11px] leading-tight"
                            : "truncate rounded-full text-sm",
                        )}
                        title={item.value(insights)}
                      >
                        {isPrize ? <span className="line-clamp-2">{item.value(insights)}</span> : item.value(insights)}
                      </p>
                      {isPrize ? <BiggestPrizeThumb insights={insights} /> : null}
                    </div>
                    {note ? (
                      <p className="mt-0.5 truncate text-center text-[11px] text-rr-secondary">{note}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label={copy.scheduleTitle} className="space-y-3">
          <div
            className={cn(
              panelClass,
              "p-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-3 lg:px-4 lg:py-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]",
            )}
          >
            <div className="flex items-stretch gap-2.5 lg:col-span-2 xl:col-span-1">
              <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-rr-green lg:w-1.5" />
              <div className="min-w-0">
              <p className={cn(eyebrowClass, "font-bold tracking-[0.08em] lg:text-base lg:tracking-[0.02em]")}>
                {copy.scheduleEyebrow}
              </p>
              <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.01em] text-rr-primary lg:text-[1.6rem] xl:text-[1.4rem]">
                {copy.scheduleTitle}
              </h2>
              <p className="mt-1 text-sm leading-snug text-rr-secondary lg:text-[15px] lg:text-rr-primary">
                {copy.scheduleText}
              </p>
              </div>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 lg:mt-0 lg:grid-cols-7 lg:gap-2 xl:gap-1.5">
              {WEEK_DAYS.map((day, index) => {
                const count = schedule ? schedule.byDay[index] : null;
                const isPeak = schedulePeak === index;
                return (
                  <li
                    key={day}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-center transition-[border-color,transform] duration-200 ease-out hover:border-rr-green-border lg:min-w-[4.25rem] lg:px-2 lg:py-1.5 xl:min-w-[4rem] motion-safe:hover:-translate-y-1",
                      index === WEEK_DAYS.length - 1 && "col-span-2 lg:col-span-1",
                      isPeak ? "border-2 border-rr-green bg-rr-green-bg" : "border-rr-border",
                    )}
                  >
                    <p className={cn("text-xs lg:text-sm", isPeak ? "text-rr-green" : "text-rr-secondary lg:text-rr-primary")}>
                      <span className="lg:hidden">{WEEK_DAY_NAMES[index]}</span>
                      <span className="hidden lg:inline">{day}</span>
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-extrabold leading-tight lg:text-[1.65rem]",
                        isPeak ? "text-rr-green" : "text-rr-primary",
                      )}
                    >
                      {count === null ? placeholderValue : formatCount(count)}
                    </p>
                    <p className={cn("text-[11px] lg:text-sm", isPeak ? "text-rr-green" : "text-rr-secondary lg:text-rr-primary")}>
                      draws
                    </p>
                  </li>
                );
              })}
            </ul>
            <ScheduleCta href={copy.scheduleHref} className="hidden lg:flex lg:w-[14.5rem] lg:px-3 lg:py-3 lg:text-lg">
              {copy.scheduleCta}
            </ScheduleCta>
          </div>
          <ScheduleCta href={copy.scheduleHref} className="flex w-full lg:hidden">
            {copy.scheduleCta}
          </ScheduleCta>
        </section>
      </div>
    </main>
  );
}
