import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  ClosingPanel,
  SalesPanel,
} from "@/components/operator-dashboard/operator-dashboard-charts";
import {
  changeDirection,
  formatChange,
  type ChangeUnit,
  type MetricChange,
  type OperatorDashboardMarket,
  type OperatorDashboardOverview,
  type OperatorDashboardPerformance,
} from "@/lib/operator-dashboard";
import {
  formatCount,
  formatPrice,
  formatWeekRange,
  type WeeklyRadarTopPrize,
} from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-[0.08em] text-rr-green";

function siteHost(baseUrl: string) {
  try {
    return new URL(baseUrl).host.replace(/^www\./, "");
  } catch {
    return baseUrl;
  }
}

function formatOneDecimalPercent(value: number | null) {
  return value === null ? "–" : `${value.toFixed(1)}%`;
}

function formatMetric(value: number | null, unit: ChangeUnit) {
  if (unit === "points") return formatOneDecimalPercent(value);
  if (unit === "price") return formatPrice(value);
  return formatCount(value);
}

function ChangeNote({
  metric,
  unit,
  tone = "neutral",
}: {
  metric: MetricChange;
  unit: ChangeUnit;
  tone?: "neutral" | "performance";
}) {
  const text = formatChange(metric.change, unit);
  const direction = changeDirection(metric.change);

  if (!text || !direction) {
    return (
      <span className="text-xs text-rr-muted">No earlier week to compare</span>
    );
  }

  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "•";
  const toneClass =
    tone === "performance" && direction === "up"
      ? "text-rr-green"
      : tone === "performance" && direction === "down"
        ? "text-rr-warn"
        : "text-rr-secondary";

  return (
    <span className="text-xs text-rr-muted">
      <span className={cn("font-semibold", toneClass)}>
        <span aria-hidden="true">{arrow} </span>
        {text}
      </span>{" "}
      vs previous week
    </span>
  );
}

function StatTile({
  label,
  metric,
  unit,
  tone,
  footnote,
}: {
  label: string;
  metric: MetricChange;
  unit: ChangeUnit;
  tone?: "neutral" | "performance";
  footnote?: string;
}) {
  return (
    <div className={cn(panelClass, "flex min-w-0 flex-col gap-1 px-3 py-2.5")}>
      <span className="text-xs font-semibold text-rr-secondary">{label}</span>
      <span className="text-xl font-extrabold leading-none tracking-[-0.02em] text-rr-primary sm:text-2xl">
        {formatMetric(metric.value, unit)}
      </span>
      <ChangeNote metric={metric} unit={unit} tone={tone} />
      {footnote ? (
        <span className="text-[11px] leading-snug text-rr-muted">
          {footnote}
        </span>
      ) : null}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="space-y-2">
      <div>
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2 className="text-lg font-extrabold leading-tight tracking-[-0.01em] text-rr-primary">
          {title}
        </h2>
        {text ? (
          <p className="mt-0.5 text-[13px] leading-snug text-rr-secondary">
            {text}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MarketComparison({
  performance,
}: {
  performance: OperatorDashboardPerformance;
}) {
  const comparison = performance.marketComparison;

  if (comparison.status === "not-enough-draws") {
    return (
      <div
        className={cn(
          panelClass,
          "px-3 py-2.5 text-sm leading-snug text-rr-secondary",
        )}
      >
        <span className="font-semibold text-rr-primary">
          Not enough draws to compare with the market.
        </span>{" "}
        {formatCount(comparison.sample)} of your draws closed with a sold figure
        this week; the comparison appears from{" "}
        {formatCount(comparison.minimumDraws)}.
      </div>
    );
  }

  if (comparison.status === "no-market-average") {
    return (
      <div className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}>
        The market average for this week is not available.
      </div>
    );
  }

  const ahead = comparison.difference > 0;
  const level = comparison.difference === 0;
  const rows = [
    { label: "Your draws", value: comparison.operatorAverage, strong: true },
    { label: "Market", value: comparison.marketAverage, strong: false },
  ];

  return (
    <div className={cn(panelClass, "space-y-2.5 px-3 py-2.5")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-sm font-semibold text-rr-primary">
          Average sold at close
        </span>
        <span
          className={cn(
            "text-sm font-bold",
            level
              ? "text-rr-secondary"
              : ahead
                ? "text-rr-green"
                : "text-rr-warn",
          )}
        >
          {level
            ? "Level with the market"
            : `${Math.abs(comparison.difference).toFixed(1)} pts ${ahead ? "above" : "below"} the market`}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[5.5rem_minmax(0,1fr)_3.25rem] items-center gap-3"
          >
            <span className="text-xs font-semibold text-rr-secondary">
              {row.label}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-rr-elevated">
              <span
                className={cn(
                  "block h-full rounded-full",
                  row.strong ? "bg-rr-green" : "bg-rr-muted",
                )}
                style={{ width: `${Math.max(0, Math.min(100, row.value))}%` }}
              />
            </span>
            <span className="text-right text-xs font-bold text-rr-primary">
              {formatOneDecimalPercent(row.value)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-snug text-rr-muted">
        Based on {formatCount(performance.averageSoldSample)} of your draws that
        closed with a sold figure. Compares the share of tickets sold, not prize
        value or revenue.
      </p>
    </div>
  );
}

function PerformanceSection({
  operatorName,
  performance,
}: {
  operatorName: string;
  performance: OperatorDashboardPerformance;
}) {
  return (
    <Section eyebrow="Your week" title={`${operatorName} vs the wider market`}>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatTile
          label="Your draws completed"
          metric={performance.drawsCompleted}
          unit="count"
        />
        <StatTile
          label="Your draws sold out"
          metric={performance.soldOut}
          unit="count"
          tone="performance"
        />
        <StatTile
          label="Clicks from RaffleRadar"
          metric={performance.visits.clicks}
          unit="count"
          tone="performance"
        />
        <StatTile
          label="Unique visitors"
          metric={performance.visits.uniqueVisitors}
          unit="count"
          tone="performance"
        />
      </div>
      <MarketComparison performance={performance} />
    </Section>
  );
}

function TopPrizes({ items }: { items: WeeklyRadarTopPrize[] }) {
  if (items.length === 0) {
    return (
      <div className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}>
        No prize data for this week yet.
      </div>
    );
  }

  const maxOperators = Math.max(...items.map((item) => item.operators));

  return (
    <ol className={cn(panelClass, "divide-y divide-rr-border px-3 py-0.5")}>
      {items.map((item, index) => (
        <li
          key={item.key}
          className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 py-2 sm:grid-cols-[1.25rem_minmax(0,1.1fr)_minmax(0,1fr)_17rem]"
        >
          <span className="text-sm font-bold text-rr-muted">{index + 1}</span>
          <span className="min-w-0 truncate text-sm font-semibold text-rr-primary">
            {item.label}
          </span>
          <span className="col-start-2 h-2 overflow-hidden rounded-full bg-rr-elevated sm:col-start-auto">
            <span
              className="block h-full rounded-full bg-rr-green"
              style={{
                width: `${maxOperators > 0 ? Math.round((item.operators / maxOperators) * 100) : 0}%`,
              }}
            />
          </span>
          <span className="col-start-2 text-xs text-rr-secondary sm:col-start-auto sm:text-right">
            <span className="font-semibold text-rr-primary">
              {formatCount(item.operators)}{" "}
              {item.operators === 1 ? "operator" : "operators"}
            </span>{" "}
            · {formatCount(item.draws)} draws
            {item.lowestTicketPrice !== null
              ? ` · from ${formatPrice(item.lowestTicketPrice)}`
              : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

function MarketSections({ market }: { market: OperatorDashboardMarket }) {
  return (
    <>
      <Section
        eyebrow="Market overview"
        title="The UK prize competition market this week"
        text="Completed draws across all tracked operators, excluding the Games category."
      >
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          <StatTile
            label="Draws completed"
            metric={market.headline.drawsCompleted}
            unit="count"
          />
          <StatTile
            label="Sold out"
            metric={market.headline.soldOut}
            unit="count"
          />
          <StatTile
            label="Average sold at close"
            metric={market.headline.averageSoldAtClose}
            unit="points"
          />
          <StatTile
            label="New competitions"
            metric={market.headline.newCompetitions}
            unit="count"
          />
          <StatTile
            label="Typical ticket price"
            metric={market.headline.typicalTicketPrice}
            unit="price"
          />
        </div>
      </Section>

      <Section
        eyebrow="Timing"
        title="When tickets sell"
        text="When tickets were bought across the market. Hover or tap a bar for its share. It does not prove that a slot causes better results."
      >
        <div className="grid gap-2 lg:grid-cols-2">
          <SalesPanel kind="day" busiest={market.salesByDay} />
          <SalesPanel kind="hour" busiest={market.salesByHour} />
        </div>
      </Section>

      <Section
        eyebrow="Closings"
        title="When draws close"
        text="How many draws closed on each day of this week, and how many are due to close the week after."
      >
        <div className="grid gap-2 lg:grid-cols-2">
          <ClosingPanel
            title="Closed this week"
            counts={market.closingDays?.closed ?? null}
          />
          <ClosingPanel
            title="Closing the week after"
            counts={market.closingDays?.ahead ?? null}
          />
        </div>
      </Section>

      <Section
        eyebrow="Prizes"
        title="Most-run prizes"
        text="The prizes run by the most operators this week. Many listings can mean strong interest or heavy competition."
      >
        <TopPrizes items={market.topPrizes} />
      </Section>
    </>
  );
}

export function OperatorDashboardContent({
  overview,
}: {
  overview: OperatorDashboardOverview;
}) {
  const { operator, market, performance } = overview;

  return (
    <div className="space-y-5">
      <header>
        <p className={eyebrowClass}>Operator dashboard</p>
        <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.01em] text-rr-primary">
          {operator.name}
        </h1>
        <p className="mt-0.5 text-sm text-rr-secondary">
          {siteHost(operator.baseUrl)}
          {market
            ? ` · Week of ${formatWeekRange(market.weekStart, market.weekEnd)}`
            : ""}
        </p>
      </header>

      {performance ? (
        <PerformanceSection
          operatorName={operator.name}
          performance={performance}
        />
      ) : null}

      {market ? (
        <MarketSections market={market} />
      ) : (
        <div
          className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}
        >
          Market figures are not available yet.
        </div>
      )}
    </div>
  );
}
