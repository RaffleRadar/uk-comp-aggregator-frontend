"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { useDashboardResource } from "@/components/operator-dashboard/use-dashboard-resource";
import {
  ALL_CATEGORIES_LABEL,
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
const STEADY_WINDOW_FACTOR = 4;
const EMPTY_CELL: OperatorDashboardClosingCell = {
  drawsCompleted: 0,
  averageSoldAtClose: null,
  averageSoldSample: 0,
};

type Side = "market" | "operator";

type ActiveCell = { slot: number; day: number };

function visibleSlotIndexes(data: OperatorDashboardClosingWindows) {
  return data.slots
    .map((_, index) => index)
    .filter((index) =>
      data.market.cells[index]?.some((cell) => cell.drawsCompleted > 0),
    );
}

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

function cellAt(
  data: OperatorDashboardClosingWindows,
  side: Side,
  slot: number,
  day: number,
) {
  return data[side].cells[slot]?.[day] ?? EMPTY_CELL;
}

function drawsText(count: number) {
  return `${formatCount(count)} ${count === 1 ? "draw" : "draws"}`;
}

function versusAverageText(value: number, average: number | null) {
  if (average === null) return null;
  const difference = Math.round((value - average) * 10) / 10;
  if (difference === 0) return "level with";
  return `${Math.abs(difference).toFixed(1)} pts ${difference > 0 ? "above" : "below"}`;
}

function tooltipAlign(day: number, days: number) {
  if (day <= 1) return { className: "left-0", arrow: "left-4" };
  if (day >= days - 2) return { className: "right-0", arrow: "right-4" };
  return {
    className: "left-1/2 -translate-x-1/2",
    arrow: "left-1/2 -translate-x-1/2",
  };
}

function CellTooltip({
  data,
  side,
  slot,
  day,
}: {
  data: OperatorDashboardClosingWindows;
  side: Side;
  slot: number;
  day: number;
}) {
  const cell = cellAt(data, side, slot, day);
  const otherSide: Side = side === "market" ? "operator" : "market";
  const other = cellAt(data, otherSide, slot, day);
  const sideAverage = data[side].total.averageSoldAtClose;
  const label = `${data.days[day]} ${data.slots[slot].label}`;
  const align = tooltipAlign(day, data.days.length);
  const versus =
    cell.averageSoldAtClose !== null
      ? versusAverageText(cell.averageSoldAtClose, sideAverage)
      : null;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none absolute bottom-full z-20 mb-2 w-max max-w-[15rem] rounded-lg border border-rr-border bg-rr-elevated px-2.5 py-1.5 text-left shadow-lg motion-safe:animate-[rr-tip-in_120ms_ease-out]",
        align.className,
      )}
    >
      <p className="text-xs font-bold text-rr-primary">
        {label}
        {cell.averageSoldAtClose !== null
          ? ` · ${cell.averageSoldAtClose.toFixed(1)}% sold`
          : ""}
      </p>
      <p className="text-[11px] leading-snug text-rr-secondary">
        {cell.drawsCompleted === 0
          ? side === "market"
            ? "No draws closed in this window"
            : "None of your draws closed in this window"
          : cell.averageSoldAtClose === null
            ? `${drawsText(cell.drawsCompleted)}, too few for an average (from ${formatCount(data.minimumDraws)})`
            : `${drawsText(cell.drawsCompleted)} closed`}
      </p>
      {versus && sideAverage !== null ? (
        <p className="text-[11px] leading-snug text-rr-secondary">
          {versus} {side === "market" ? "the market" : "your"} average of{" "}
          {sideAverage.toFixed(1)}%
        </p>
      ) : null}
      {other.drawsCompleted > 0 ? (
        <p className="mt-0.5 border-t border-rr-border pt-0.5 text-[11px] leading-snug text-rr-muted">
          {otherSide === "market" ? "Market" : "Your draws"}:{" "}
          {other.averageSoldAtClose !== null
            ? `${other.averageSoldAtClose.toFixed(1)}% sold, `
            : ""}
          {drawsText(other.drawsCompleted)}
        </p>
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-full h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-rr-border",
          align.arrow,
        )}
      />
    </div>
  );
}

function HeatCell({
  cell,
  range,
  label,
  order,
  revealed,
  active,
  dimmed,
  onActivate,
  onRelease,
}: {
  cell: OperatorDashboardClosingCell;
  range: { min: number; max: number } | null;
  label: string;
  order: number;
  revealed: boolean;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onRelease: () => void;
}) {
  const value = cell.averageSoldAtClose;
  const opacity = cellOpacity(value, range);
  const strong = opacity > 0.6;
  const description =
    cell.drawsCompleted === 0
      ? `${label}: no draws`
      : value === null
        ? `${label}: ${drawsText(cell.drawsCompleted)}, too few for an average`
        : `${label}: ${value.toFixed(1)}% sold on average, ${drawsText(cell.drawsCompleted)}`;

  return (
    <button
      type="button"
      aria-label={description}
      aria-pressed={active}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onBlur={onRelease}
      onClick={onActivate}
      style={{ transitionDelay: revealed ? `${order * 14}ms` : "0ms" }}
      className={cn(
        "relative flex min-h-[2.75rem] w-full cursor-default flex-col items-center justify-center overflow-hidden rounded-md border bg-rr-elevated px-0.5 py-1 text-center outline-none sm:min-h-[3.25rem]",
        "motion-safe:transition-[opacity,transform,border-color] motion-safe:duration-300 motion-safe:ease-out",
        revealed ? "scale-100" : "motion-safe:scale-90 motion-safe:opacity-0",
        active
          ? "z-10 border-rr-green motion-safe:scale-105"
          : "border-rr-border",
        dimmed && revealed ? "opacity-50" : revealed ? "opacity-100" : "",
        "focus-visible:ring-1 focus-visible:ring-rr-green",
      )}
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
    </button>
  );
}

function HeatMap({
  data,
  side,
}: {
  data: OperatorDashboardClosingWindows;
  side: Side;
}) {
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<ActiveCell | null>(null);
  const slots = visibleSlotIndexes(data);
  const range = averageRange(
    slots.flatMap((index) => data[side].cells[index] ?? []),
    data.minimumDraws,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setRevealed(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (slots.length === 0) {
    return (
      <div className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}>
        No draws closed in this period.
      </div>
    );
  }

  return (
    <div className={cn(panelClass, "px-2 py-2.5 sm:px-3")}>
      <div
        className="grid grid-cols-[2.6rem_repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] sm:gap-1.5"
        onMouseLeave={() => setActive(null)}
      >
        <span />
        {data.days.map((day, dayIndex) => (
          <span
            key={day}
            className={cn(
              "text-center text-[11px] font-semibold sm:text-xs",
              active?.day === dayIndex
                ? "text-rr-primary"
                : "text-rr-secondary",
            )}
          >
            {day}
          </span>
        ))}
        {slots.map((slotIndex, row) => {
          const slot = data.slots[slotIndex];
          return [
            <span
              key={`${slot.key}-label`}
              className={cn(
                "flex items-center text-[10px] font-semibold sm:text-xs",
                active?.slot === slotIndex
                  ? "text-rr-primary"
                  : "text-rr-secondary",
              )}
            >
              {slot.label}
            </span>,
            ...data.days.map((day, dayIndex) => {
              const isActive =
                active?.slot === slotIndex && active.day === dayIndex;
              return (
                <div key={`${slot.key}-${day}`} className="relative">
                  {isActive ? (
                    <CellTooltip
                      data={data}
                      side={side}
                      slot={slotIndex}
                      day={dayIndex}
                    />
                  ) : null}
                  <HeatCell
                    cell={cellAt(data, side, slotIndex, dayIndex)}
                    range={range}
                    label={`${day} ${slot.label}`}
                    order={row + dayIndex}
                    revealed={revealed}
                    active={isActive}
                    dimmed={active !== null && !isActive}
                    onActivate={() =>
                      setActive({ slot: slotIndex, day: dayIndex })
                    }
                    onRelease={() =>
                      setActive((current) =>
                        current?.slot === slotIndex && current.day === dayIndex
                          ? null
                          : current,
                      )
                    }
                  />
                </div>
              );
            }),
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
        <span>Hover or tap a window for details</span>
      </div>
    </div>
  );
}

export function ClosingWindowsView({
  operatorId,
  operatorName,
  days,
  category,
}: {
  operatorId: string;
  operatorName: string;
  days: number;
  category: string | null;
}) {
  const path =
    category === null
      ? null
      : operatorDashboardClosingWindowsPath(operatorId, days, category);
  const [side, setSide] = useState<Side>("market");
  const resource =
    useDashboardResource<OperatorDashboardClosingWindowsResponse>(path);
  const data = resource.data?.closingWindows ?? null;
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
            ? `${data.category?.label ?? ALL_CATEGORIES_LABEL}, last ${data.period.days} days, ${formatWeekRange(data.period.from, data.period.to)}, UK time. `
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

      {resource.status === "loading" && !data ? (
        <div className={cn(panelClass, "flex justify-center py-8")}>
          <RadarLoader size="sm" />
        </div>
      ) : null}

      {resource.status === "error" ? (
        <div
          className={cn(panelClass, "px-3 py-2.5 text-sm text-rr-secondary")}
        >
          {LOAD_ERROR}
        </div>
      ) : null}

      {data ? (
        <div
          aria-busy={resource.stale}
          className={cn(
            "space-y-2 transition-opacity",
            resource.stale ? "opacity-50" : undefined,
          )}
        >
          <style>{`@keyframes rr-tip-in{from{opacity:0}to{opacity:1}}`}</style>
          <HeatMap key={side} data={data} side={side} />
          <p className="text-[11px] leading-snug text-rr-muted">
            Placed by the advertised closing time; a day runs from 02:00 to
            02:00, so draws closing just after midnight count with the evening
            before. Windows with no draws across the market are hidden. Averages
            appear from {formatCount(data.minimumDraws)} draws; small windows
            can swing widely, so check the number of draws.
          </p>
        </div>
      ) : null}
    </section>
  );
}
