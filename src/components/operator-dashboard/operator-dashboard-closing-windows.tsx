"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { protectedFetch } from "@/lib/protected-fetch";
import {
  DEFAULT_DASHBOARD_PERIOD_DAYS,
  operatorDashboardClosingWindowsPath,
  type OperatorDashboardClosingCell,
  type OperatorDashboardClosingWindows,
  type OperatorDashboardClosingWindowsResponse,
} from "@/lib/operator-dashboard";
import { formatCount, formatWeekRange } from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-[0.08em] text-rr-green";
const LOAD_ERROR = "Closing window figures could not be loaded.";

type Side = "market" | "operator";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; closingWindows: OperatorDashboardClosingWindows }
  | { kind: "error" };

function visibleSlotIndexes(data: OperatorDashboardClosingWindows) {
  return data.slots
    .map((_, index) => index)
    .filter((index) =>
      data.market.cells[index]?.some((cell) => cell.drawsCompleted > 0),
    );
}

const STEADY_WINDOW_FACTOR = 4;

function averageRange(cells: OperatorDashboardClosingCell[], minimum: number) {
  const withAverage = cells.filter(
    (
      cell,
    ): cell is OperatorDashboardClosingCell & {
      averageSoldAtClose: number;
    } => cell.averageSoldAtClose !== null,
  );
  const steady = withAverage.filter(
    (cell) => cell.averageSoldSample >= minimum * STEADY_WINDOW_FACTOR,
  );
  const basis = steady.length >= 2 ? steady : withAverage;
  if (basis.length === 0) return null;
  const values = basis.map((cell) => cell.averageSoldAtClose);
  return { min: Math.min(...values), max: Math.max(...values) };
}

function cellOpacity(
  value: number | null,
  range: { min: number; max: number } | null,
) {
  if (value === null || !range) return 0;
  if (range.max === range.min) return 0.55;
  const position = (value - range.min) / (range.max - range.min);
  return 0.12 + Math.max(0, Math.min(1, position)) * 0.78;
}

function HeatCell({
  cell,
  range,
  label,
}: {
  cell: OperatorDashboardClosingCell;
  range: { min: number; max: number } | null;
  label: string;
}) {
  const value = cell.averageSoldAtClose;
  const opacity = cellOpacity(value, range);
  const strong = opacity > 0.6;
  const title =
    cell.drawsCompleted === 0
      ? `${label}: no draws`
      : value === null
        ? `${label}: ${formatCount(cell.drawsCompleted)} draws, too few for an average`
        : `${label}: ${value.toFixed(1)}% sold on average, ${formatCount(cell.drawsCompleted)} draws`;

  return (
    <div
      title={title}
      aria-label={title}
      className="relative flex min-h-[2.75rem] flex-col items-center justify-center overflow-hidden rounded-md border border-rr-border bg-rr-elevated px-0.5 py-1 text-center sm:min-h-[3.25rem]"
    >
      {value !== null ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-rr-green"
          style={{ opacity }}
        />
      ) : null}
      <span
        className={cn(
          "relative text-[11px] font-bold leading-tight sm:text-xs",
          value === null
            ? "text-rr-muted"
            : strong
              ? "text-rr-on-accent"
              : "text-rr-primary",
        )}
      >
        {value === null ? "–" : `${Math.round(value)}%`}
      </span>
      <span
        className={cn(
          "relative text-[9px] leading-tight sm:text-[10px]",
          value === null
            ? "text-rr-muted"
            : strong
              ? "text-rr-on-accent"
              : "text-rr-primary opacity-75",
        )}
      >
        {cell.drawsCompleted > 0 ? formatCount(cell.drawsCompleted) : ""}
      </span>
    </div>
  );
}

function HeatMap({
  data,
  side,
}: {
  data: OperatorDashboardClosingWindows;
  side: Side;
}) {
  const slots = visibleSlotIndexes(data);
  const grid = data[side].cells;
  const range = averageRange(
    slots.flatMap((index) => grid[index] ?? []),
    data.minimumDraws,
  );

  if (slots.length === 0) {
    return (
      <div className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}>
        No draws closed in this period.
      </div>
    );
  }

  return (
    <div className={cn(panelClass, "px-2 py-2.5 sm:px-3")}>
      <div className="grid grid-cols-[2.6rem_repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] sm:gap-1.5">
        <span />
        {data.days.map((day) => (
          <span
            key={day}
            className="text-center text-[11px] font-semibold text-rr-secondary sm:text-xs"
          >
            {day}
          </span>
        ))}
        {slots.map((slotIndex) => {
          const slot = data.slots[slotIndex];
          return [
            <span
              key={`${slot.key}-label`}
              className="flex items-center text-[10px] font-semibold text-rr-secondary sm:text-xs"
            >
              {slot.label}
            </span>,
            ...data.days.map((day, dayIndex) => (
              <HeatCell
                key={`${slot.key}-${day}`}
                cell={
                  grid[slotIndex]?.[dayIndex] ?? {
                    drawsCompleted: 0,
                    averageSoldAtClose: null,
                    averageSoldSample: 0,
                  }
                }
                range={range}
                label={`${day} ${slot.label}`}
              />
            )),
          ];
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-rr-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rr-green opacity-20" />
          Lower average sold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rr-green opacity-90" />
          Higher average sold
        </span>
        <span>Small number under each figure: draws closed</span>
        <span>
          Shading compares windows with at least{" "}
          {formatCount(data.minimumDraws * STEADY_WINDOW_FACTOR)} draws
        </span>
      </div>
    </div>
  );
}

export function ClosingWindowsView({
  operatorId,
  operatorName,
}: {
  operatorId: string;
  operatorName: string;
}) {
  const path = operatorDashboardClosingWindowsPath(
    operatorId,
    DEFAULT_DASHBOARD_PERIOD_DAYS,
  );
  const [side, setSide] = useState<Side>("market");
  const [loaded, setLoaded] = useState<{
    path: string;
    state: LoadState;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    protectedFetch(path, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(LOAD_ERROR);
        const body =
          (await response.json()) as OperatorDashboardClosingWindowsResponse;
        if (!cancelled) {
          setLoaded({
            path,
            state: { kind: "ready", closingWindows: body.closingWindows },
          });
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded({ path, state: { kind: "error" } });
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  const state: LoadState =
    loaded && loaded.path === path ? loaded.state : { kind: "loading" };
  const data = state.kind === "ready" ? state.closingWindows : null;
  const sides: { key: Side; label: string; draws: number | null }[] = [
    {
      key: "market",
      label: "Market",
      draws: data ? data.market.total.drawsCompleted : null,
    },
    {
      key: "operator",
      label: "Your draws",
      draws: data ? data.operator.total.drawsCompleted : null,
    },
  ];

  return (
    <section aria-label="Closing windows" className="space-y-2">
      <div>
        <p className={eyebrowClass}>Closing windows</p>
        <h2 className="text-lg font-extrabold leading-tight tracking-[-0.01em] text-rr-primary">
          How draws sell by closing day and time
        </h2>
        <p className="mt-0.5 text-[13px] leading-snug text-rr-secondary">
          {data
            ? `Last ${data.period.days} days, ${formatWeekRange(data.period.from, data.period.to)}, UK time. `
            : ""}
          Average share of tickets sold on draws that closed in each window.
          Shows where draws have done well, not that a window causes better
          results.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Whose draws"
        className="inline-flex rounded-full border border-rr-border bg-rr-surface p-0.5"
      >
        {sides.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={side === option.key}
            onClick={() => setSide(option.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              side === option.key
                ? "bg-rr-green text-rr-on-accent"
                : "text-rr-secondary hover:text-rr-primary",
            )}
          >
            {option.key === "operator" ? (
              <span className="sr-only">{operatorName} </span>
            ) : null}
            {option.label}
            {option.draws !== null ? ` · ${formatCount(option.draws)}` : ""}
          </button>
        ))}
      </div>

      {state.kind === "loading" ? (
        <div className={cn(panelClass, "flex justify-center py-8")}>
          <RadarLoader size="sm" />
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div
          className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}
        >
          {LOAD_ERROR}
        </div>
      ) : null}

      {data ? (
        <>
          <HeatMap data={data} side={side} />
          <p className="text-[11px] leading-snug text-rr-muted">
            Placed by the advertised closing time; a day runs from 02:00 to
            02:00, so draws closing just after midnight count with the evening
            before. Windows with no draws across the market are hidden. Averages
            appear from {formatCount(data.minimumDraws)} draws; small windows
            can swing widely, so check the number of draws.
          </p>
        </>
      ) : null}
    </section>
  );
}
