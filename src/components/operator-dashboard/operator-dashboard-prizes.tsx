"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { useDashboardResource } from "@/components/operator-dashboard/use-dashboard-resource";
import {
  ALL_CATEGORIES_LABEL,
  operatorDashboardPrizesPath,
  type OperatorDashboardPrize,
  type OperatorDashboardPrizesResponse,
} from "@/lib/operator-dashboard";
import { formatCount, formatPrice, formatWeekRange } from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const LOAD_ERROR = "Prize figures could not be loaded.";
const BRIGHT_ROWS = 4;
const BRIGHT_FILL =
  "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--elevated)))";
const MUTED_FILL =
  "linear-gradient(90deg, color-mix(in srgb, var(--accent) 50%, var(--elevated)), color-mix(in srgb, var(--accent) 28%, var(--elevated)))";

type Mode = "most-run" | "best-selling";

const MODES: { key: Mode; label: string }[] = [
  { key: "most-run", label: "Most run" },
  { key: "best-selling", label: "Best selling" },
];

function countText(count: number, one: string, many: string) {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

function soldText(value: number) {
  return `${value.toFixed(1)}% sold`;
}

function coverageShare(drawsWithPrize: number, drawsCompleted: number) {
  if (drawsCompleted <= 0) return null;
  return Math.round((drawsWithPrize / drawsCompleted) * 1000) / 10;
}

function metricValue(prize: OperatorDashboardPrize, mode: Mode) {
  return mode === "best-selling"
    ? (prize.averageSoldAtClose ?? 0)
    : prize.operators;
}

function metricText(prize: OperatorDashboardPrize, mode: Mode) {
  if (mode === "best-selling") {
    return prize.averageSoldAtClose === null
      ? "–"
      : `${prize.averageSoldAtClose.toFixed(1)}%`;
  }
  return formatCount(prize.operators);
}

function detailsText(prize: OperatorDashboardPrize, mode: Mode) {
  const draws = countText(prize.drawsCompleted, "draw", "draws");
  const price =
    prize.lowestTicketPrice !== null
      ? ` · from ${formatPrice(prize.lowestTicketPrice)}`
      : "";
  if (mode === "best-selling") {
    return `${countText(prize.operators, "operator", "operators")} · ${draws}${price}`;
  }
  return `${draws}${price}`;
}

function YourDraws({
  prize,
  operatorName,
}: {
  prize: OperatorDashboardPrize;
  operatorName: string;
}) {
  const own = prize.operator;

  if (own.drawsCompleted === 0) return null;

  return (
    <span className="block truncate text-[11px] font-semibold text-rr-green">
      <span className="sr-only">{operatorName} </span>
      You: {countText(own.drawsCompleted, "draw", "draws")}
      {own.averageSoldAtClose !== null
        ? ` · ${soldText(own.averageSoldAtClose)}`
        : ""}
    </span>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Prize ranking"
      className="flex shrink-0 items-center gap-1"
    >
      {MODES.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={mode === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-xs font-bold transition",
            mode === option.key
              ? "border-rr-green bg-rr-green text-rr-on-accent"
              : "border-rr-border bg-rr-surface text-rr-secondary hover:text-rr-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PrizeRows({
  items,
  mode,
  operatorName,
  emptyText,
}: {
  items: OperatorDashboardPrize[];
  mode: Mode;
  operatorName: string;
  emptyText: string;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setRevealed(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (items.length === 0) {
    return <p className="py-3 text-sm text-rr-secondary">{emptyText}</p>;
  }

  const largest = Math.max(...items.map((item) => metricValue(item, mode)));

  return (
    <ol className="divide-y divide-rr-border">
      {items.map((item, index) => {
        const width =
          largest > 0
            ? Math.round((metricValue(item, mode) / largest) * 100)
            : 0;

        return (
          <li
            key={item.key}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)_3.5rem] items-center gap-x-3 gap-y-1.5 py-2.5 sm:grid-cols-[1.25rem_15rem_minmax(0,1fr)_4.5rem] lg:grid-cols-[1.25rem_19rem_minmax(0,1fr)_4.5rem]"
          >
            <span className="text-sm font-bold text-rr-muted">{index + 1}</span>
            <span className="min-w-0">
              <span
                title={item.label}
                className="block text-sm font-bold leading-snug text-rr-primary sm:truncate"
              >
                {item.label}
              </span>
              <span className="block truncate text-[11px] text-rr-secondary">
                {detailsText(item, mode)}
              </span>
              <YourDraws prize={item} operatorName={operatorName} />
            </span>
            <span className="col-span-2 col-start-2 row-start-2 h-3 overflow-hidden rounded-full bg-rr-elevated sm:col-span-1 sm:col-start-auto sm:row-start-auto">
              <span
                className="block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
                style={{
                  width: `${revealed ? width : 0}%`,
                  backgroundImage:
                    index < BRIGHT_ROWS ? BRIGHT_FILL : MUTED_FILL,
                  transitionDelay: `${index * 30}ms`,
                }}
              />
            </span>
            <span className="col-start-3 row-start-1 text-right text-sm font-extrabold text-rr-primary sm:col-start-auto sm:row-start-auto">
              {metricText(item, mode)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function PrizeView({
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
      : operatorDashboardPrizesPath(operatorId, days, category);
  const [mode, setMode] = useState<Mode>("most-run");
  const resource = useDashboardResource<OperatorDashboardPrizesResponse>(path);
  const data = resource.data?.prizes ?? null;
  const share = data
    ? coverageShare(data.coverage.drawsWithPrize, data.coverage.drawsCompleted)
    : null;

  return (
    <section aria-label="Prizes" className={cn(panelClass, "px-4 py-4")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold leading-tight tracking-[-0.01em] text-rr-primary">
            Which prizes run most and sell best
          </h2>
          <p className="mt-1 text-xs leading-snug text-rr-secondary">
            {data
              ? `${data.category?.label ?? ALL_CATEGORIES_LABEL}, last ${data.period.days} days, ${formatWeekRange(data.period.from, data.period.to)}. `
              : ""}
            {mode === "most-run"
              ? "Ranked by the number of operators running each prize. Many listings can mean strong interest or heavy competition."
              : "Ranked by the average share of tickets sold at close across the market."}
          </p>
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>

      <div
        aria-busy={resource.stale}
        className={cn(
          "mt-2 transition-opacity",
          resource.stale ? "opacity-50" : undefined,
        )}
      >
        {resource.status === "loading" && !data ? (
          <div className="flex justify-center py-8">
            <RadarLoader size="sm" />
          </div>
        ) : null}

        {resource.status === "error" ? (
          <p className="py-3 text-sm text-rr-secondary">{LOAD_ERROR}</p>
        ) : null}

        {data ? (
          <PrizeRows
            key={mode}
            items={mode === "most-run" ? data.mostRun : data.bestSelling}
            mode={mode}
            operatorName={operatorName}
            emptyText={
              mode === "most-run"
                ? "No draws in this period matched to a specific prize."
                : `No prize has reached ${formatCount(data.minimumDraws)} draws from ${formatCount(data.minimumOperators)} operators in this period.`
            }
          />
        ) : null}
      </div>

      {data ? (
        <p className="mt-2 border-t border-rr-border pt-2.5 text-[11px] leading-snug text-rr-muted">
          {formatCount(data.coverage.drawsWithPrize)} of{" "}
          {formatCount(data.coverage.drawsCompleted)} closed draws
          {share !== null ? ` (${share.toFixed(1)}%)` : ""} matched to a
          specific product, across{" "}
          {countText(data.coverage.prizes, "prize", "prizes")}.
          {data.cashIncluded ? "" : " Cash prizes are left out."} The figure on
          the right is operators in Most run and average sold in Best selling.
          Best selling needs at least {formatCount(data.minimumDraws)} draws
          with a sold figure from {formatCount(data.minimumOperators)} or more
          operators. Excludes the Games category.
        </p>
      ) : null}
    </section>
  );
}
