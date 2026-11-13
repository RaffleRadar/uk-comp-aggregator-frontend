"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  barHeights,
  busiestIndex,
  dayHours,
  type OperatorDashboardMarket,
} from "@/lib/operator-dashboard";
import {
  formatCount,
  formatHourRange,
  formatPounds,
  formatWeekRange,
  formatWeekday,
  type WeeklyRadarDayCounts,
} from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = new Set([0, 6, 12, 18]);
const HOURS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

const compactFormat = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type Metric = "spend" | "tickets";

function sum(values: number[]) {
  return values.reduce((total, value) => total + Math.max(0, value), 0);
}

function formatShare(value: number, total: number) {
  if (total <= 0) return null;
  const share = (Math.max(0, value) / total) * 100;
  return `${share >= 10 ? Math.round(share) : share.toFixed(1)}%`;
}

function formatVersusAverage(value: number, average: number) {
  if (average <= 0) return null;
  const difference = Math.round(((value - average) / average) * 100);
  if (difference === 0) return "in line with the average";
  return `${Math.abs(difference)}% ${difference > 0 ? "above" : "below"} the average`;
}

function tooltipPosition(index: number, count: number) {
  const centre = ((index + 0.5) / count) * 100;
  if (centre < 22) return { style: { left: 0 }, className: "" };
  if (centre > 78) return { style: { right: 0 }, className: "" };
  return { style: { left: `${centre}%` }, className: "-translate-x-1/2" };
}

function formatSales(value: number, inPounds: boolean) {
  return inPounds ? formatPounds(value) : `${formatCount(value)} tickets`;
}

function formatSalesCompact(value: number, inPounds: boolean) {
  return inPounds
    ? `£${compactFormat.format(value)}`
    : compactFormat.format(value);
}

function BarChart({
  values,
  shortLabels,
  fullLabel,
  showLabel,
  showValues,
  formatValue,
  formatCompact,
  shareOf,
  averageOf,
  selected = null,
  onSelect,
}: {
  values: number[];
  shortLabels: string[];
  fullLabel: (index: number) => string;
  showLabel: (index: number) => boolean;
  showValues: boolean;
  formatValue: (value: number) => string;
  formatCompact: (value: number) => string;
  shareOf: string;
  averageOf: string;
  selected?: number | null;
  onSelect?: (index: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const heights = barHeights(values);
  const total = sum(values);
  const average = values.length > 0 ? total / values.length : 0;
  const max = Math.max(0, ...values);
  const strong = selected ?? busiestIndex(values);
  const averageHeight = max > 0 ? (average / max) * 100 : null;
  const share = active !== null ? formatShare(values[active], total) : null;
  const versus =
    active !== null ? formatVersusAverage(values[active], average) : null;
  const position =
    active !== null ? tooltipPosition(active, values.length) : null;

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      {active !== null && position ? (
        <div
          role="status"
          className={cn(
            "pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg border border-rr-border bg-rr-elevated px-2.5 py-1.5 shadow-lg",
            position.className,
          )}
          style={position.style}
        >
          <p className="text-xs font-bold text-rr-primary">
            {fullLabel(active)} · {formatValue(values[active])}
          </p>
          <p className="text-[11px] leading-snug text-rr-secondary">
            {share ? `${share} of ${shareOf}` : null}
            {share && versus ? " · " : null}
            {versus ? `${versus} ${averageOf}` : null}
          </p>
        </div>
      ) : null}

      {showValues ? (
        <div className="mb-0.5 flex gap-[3px] sm:gap-1.5">
          {values.map((value, index) => (
            <span
              key={shortLabels[index]}
              className={cn(
                "min-w-0 flex-1 text-center text-[10px] font-semibold leading-none",
                index === strong || index === active
                  ? "text-rr-primary"
                  : "text-rr-secondary",
              )}
            >
              {formatCompact(value)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative flex h-20 items-end gap-[3px] sm:gap-1.5">
        {averageHeight !== null ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-rr-muted"
            style={{ bottom: `${averageHeight}%` }}
          />
        ) : null}
        {heights.map((height, index) => (
          <button
            key={shortLabels[index]}
            type="button"
            aria-label={`${fullLabel(index)}: ${formatValue(values[index])}`}
            aria-pressed={onSelect ? selected === index : undefined}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            onClick={() => {
              setActive(index);
              onSelect?.(index);
            }}
            className={cn(
              "flex h-full min-w-0 flex-1 items-end rounded-t-[3px] outline-none focus-visible:ring-1 focus-visible:ring-rr-green",
              onSelect ? "cursor-pointer" : "cursor-default",
            )}
          >
            <span
              className={cn(
                "block w-full rounded-t-[3px] transition-opacity duration-150",
                index === strong || index === active
                  ? "bg-rr-green"
                  : "bg-rr-green-border",
                active !== null && active !== index ? "opacity-50" : "",
              )}
              style={{
                height: `${Math.max(height, values[index] > 0 ? 3 : 0)}%`,
              }}
            />
          </button>
        ))}
      </div>

      <div className="mt-1 flex gap-[3px] sm:gap-1.5">
        {shortLabels.map((label, index) => (
          <span
            key={label}
            className={cn(
              "min-w-0 flex-1 text-center text-[10px] leading-none",
              index === active || index === selected
                ? "font-semibold text-rr-primary"
                : "text-rr-muted",
            )}
          >
            {showLabel(index) ? label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className={cn(panelClass, "px-3 py-2.5")}>
      <h3 className="text-sm font-bold text-rr-primary">{title}</h3>
      <p className="mt-0.5 text-sm text-rr-secondary">{text}</p>
    </div>
  );
}

function MetricToggle({
  metric,
  onChange,
}: {
  metric: Metric;
  onChange: (metric: Metric) => void;
}) {
  const options: { key: Metric; label: string }[] = [
    { key: "spend", label: "£ spent" },
    { key: "tickets", label: "Tickets" },
  ];

  return (
    <span className="inline-flex overflow-hidden rounded-md border border-rr-border">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={metric === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "px-2 py-0.5 text-[11px] font-semibold leading-tight",
            metric === option.key
              ? "bg-rr-green-bg text-rr-green"
              : "bg-rr-surface text-rr-secondary hover:text-rr-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}

function PanelHeader({
  title,
  busiest,
  children,
}: {
  title: string;
  busiest: string | null;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <h3 className="text-sm font-bold text-rr-primary">{title}</h3>
      <span className="flex items-center gap-2 text-xs text-rr-secondary">
        {busiest ? (
          <span>
            Busiest:{" "}
            <span className="font-semibold text-rr-primary">{busiest}</span>
          </span>
        ) : null}
        {children}
      </span>
    </div>
  );
}

function busiestLabel(values: number[], format: (index: number) => string) {
  const index = busiestIndex(values);
  return index === null ? null : format(index);
}

export function SalesTiming({ market }: { market: OperatorDashboardMarket }) {
  const [chosen, setChosen] = useState<Metric>("spend");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daySpend = market.salesByDay?.spend ?? null;
  const dayTickets = market.salesByDay?.tickets ?? null;
  const hourSpend = market.salesByHour?.spend ?? null;
  const hourTickets = market.salesByHour?.tickets ?? null;
  const bothMetrics = Boolean(daySpend && dayTickets);
  const metric: Metric =
    chosen === "spend"
      ? daySpend
        ? "spend"
        : "tickets"
      : dayTickets
        ? "tickets"
        : "spend";
  const inPounds = metric === "spend";
  const dayValues =
    (metric === "spend" ? daySpend : dayTickets)?.values ?? null;
  const weekHours =
    (metric === "spend" ? hourSpend : hourTickets)?.values ?? null;
  const grid = market.salesByDayHour?.[metric] ?? null;
  const canPickDay = Boolean(grid && dayValues);
  const pickedHours = canPickDay ? dayHours(grid, selectedDay) : null;
  const hourValues = pickedHours ?? weekHours;
  const dayName =
    pickedHours && selectedDay !== null ? formatWeekday(selectedDay + 1) : null;

  const dayPanel =
    dayValues && dayValues.length === 7 ? (
      <div className={cn(panelClass, "space-y-2 px-3 py-2.5")}>
        <PanelHeader
          title="Sales by day"
          busiest={busiestLabel(dayValues, (index) => formatWeekday(index + 1))}
        >
          {bothMetrics ? (
            <MetricToggle metric={metric} onChange={setChosen} />
          ) : null}
        </PanelHeader>
        <BarChart
          values={dayValues}
          shortLabels={WEEK_DAYS}
          fullLabel={(index) => formatWeekday(index + 1)}
          showLabel={() => true}
          showValues
          formatValue={(value) => formatSales(value, inPounds)}
          formatCompact={(value) => formatSalesCompact(value, inPounds)}
          shareOf="the week"
          averageOf="day"
          selected={canPickDay ? selectedDay : null}
          onSelect={
            canPickDay
              ? (index) =>
                  setSelectedDay((current) =>
                    current === index ? null : index,
                  )
              : undefined
          }
        />
        <p className="text-[11px] leading-snug text-rr-muted">
          {inPounds
            ? `${formatPounds(sum(dayValues))} ticket spend`
            : `${formatCount(sum(dayValues))} tickets sold`}{" "}
          across all tracked operators, UK time.
          {canPickDay ? " Click a day to see its hours." : ""}
        </p>
      </div>
    ) : (
      <EmptyPanel
        title="Sales by day"
        text="No sales data for this week yet."
      />
    );

  const hourPanel =
    hourValues && hourValues.length === 24 ? (
      <div className={cn(panelClass, "space-y-2 px-3 py-2.5")}>
        <PanelHeader
          title={dayName ? `Sales by hour · ${dayName}` : "Sales by hour"}
          busiest={busiestLabel(hourValues, formatHourRange)}
        >
          {dayName ? (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="rounded-md border border-rr-border px-2 py-0.5 text-[11px] font-semibold leading-tight text-rr-secondary hover:text-rr-primary"
            >
              All week
            </button>
          ) : null}
        </PanelHeader>
        <BarChart
          values={hourValues}
          shortLabels={HOURS}
          fullLabel={(index) =>
            dayName
              ? `${dayName} ${formatHourRange(index)}`
              : formatHourRange(index)
          }
          showLabel={(index) => HOUR_LABELS.has(index)}
          showValues={false}
          formatValue={(value) => formatSales(value, inPounds)}
          formatCompact={(value) => formatSalesCompact(value, inPounds)}
          shareOf={dayName ?? "the week"}
          averageOf="hour"
        />
        <p className="text-[11px] leading-snug text-rr-muted">
          {inPounds
            ? `${formatPounds(sum(hourValues))} ticket spend`
            : `${formatCount(sum(hourValues))} tickets sold`}{" "}
          {dayName ? `on ${dayName}` : "across the week"}, UK time. Dashed line:
          average hour.
        </p>
      </div>
    ) : (
      <EmptyPanel
        title="Sales by hour"
        text="No sales data for this week yet."
      />
    );

  return (
    <div className="grid gap-2 lg:grid-cols-2">
      {dayPanel}
      {hourPanel}
    </div>
  );
}

export function ClosingPanel({
  title,
  counts,
}: {
  title: string;
  counts: WeeklyRadarDayCounts | null;
}) {
  if (!counts) {
    return (
      <EmptyPanel title={title} text="No closing data for this week yet." />
    );
  }

  return (
    <div className={cn(panelClass, "space-y-2 px-3 py-2.5")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="text-sm font-bold text-rr-primary">{title}</h3>
        <span className="text-xs text-rr-secondary">
          {formatWeekRange(counts.weekStart, counts.weekEnd)} ·{" "}
          <span className="font-semibold text-rr-primary">
            {formatCount(counts.total)} draws
          </span>
        </span>
      </div>
      <BarChart
        values={counts.byDay}
        shortLabels={WEEK_DAYS}
        fullLabel={(index) => formatWeekday(index + 1)}
        showLabel={() => true}
        showValues
        formatValue={(value) => `${formatCount(value)} draws`}
        formatCompact={(value) => formatCount(value)}
        shareOf="the week"
        averageOf="day"
      />
    </div>
  );
}
