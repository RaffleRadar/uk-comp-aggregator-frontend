import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import {
  formatCount,
  formatPercent,
  formatPounds,
  formatRatio,
  formatWeekRange,
  readBigThree,
  readHeadline,
  type WeeklyRadarHeadline,
  type WeeklyRadarIssue,
  type WeeklyRadarListItem,
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
    text: "The five draws with the most money spent on tickets, estimated.",
    badge: (item) => formatPounds(item.ticketSpend),
    detail: (item) => `${formatCount(item.ticketsSold)} tickets sold`,
  },
  {
    key: "bestValue",
    title: "3. Best value draws",
    text: "The five draws with the most prize value for every pound of tickets.",
    badge: (item) => formatRatio(item.valueRatio),
    detail: (item) => `${formatPounds(item.prizeValue)} prize`,
  },
];

const INSIGHTS = [
  { title: "Busiest Day", text: "Most tickets sold on:" },
  { title: "Busiest Hour", text: "Most tickets sold between:" },
  { title: "Total Undersold", text: "Draws with fewer than 25% sold." },
  { title: "Biggest Prize", text: "The highest value prize from a completed draw." },
  { title: "Best Value Draw", text: "The best value score of the week." },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {INSIGHTS.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  panelClass,
                  "flex flex-col p-4",
                  index === INSIGHTS.length - 1 && "col-span-2 md:col-span-1",
                )}
              >
                <h3 className="text-sm font-semibold text-rr-primary">{item.title}</h3>
                <p className="mt-1 flex-1 text-xs text-rr-secondary">{item.text}</p>
                <p className="mt-3 rounded-full bg-rr-green-bg px-3 py-1.5 text-center text-sm font-semibold text-rr-green">
                  {placeholderValue}
                </p>
              </div>
            ))}
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
          </div>
          <ul className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEK_DAYS.map((day) => (
              <li
                key={day}
                className="rounded-lg border border-rr-border px-1.5 py-2 text-center sm:px-3"
              >
                <p className="text-xs text-rr-secondary">{day}</p>
                <p className="text-lg font-bold text-rr-primary">{placeholderValue}</p>
                <p className="text-[10px] text-rr-muted sm:text-xs">draws</p>
              </li>
            ))}
          </ul>
          <Link
            href="/competitions"
            className="inline-flex items-center justify-center rounded-xl bg-rr-green px-5 py-3 text-sm font-semibold text-rr-on-accent no-underline transition-opacity hover:opacity-90"
          >
            {copy.scheduleCta}
          </Link>
        </section>
      </div>
    </main>
  );
}
