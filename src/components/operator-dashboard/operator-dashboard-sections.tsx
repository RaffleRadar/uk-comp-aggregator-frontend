"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { CategoryView } from "@/components/operator-dashboard/operator-dashboard-categories";
import { ClosingWindowsView } from "@/components/operator-dashboard/operator-dashboard-closing-windows";
import { PrizeView } from "@/components/operator-dashboard/operator-dashboard-prizes";
import { useDashboardResource } from "@/components/operator-dashboard/use-dashboard-resource";
import {
  ALL_CATEGORIES_KEY,
  ALL_CATEGORIES_LABEL,
  DASHBOARD_PERIOD_DAYS,
  DEFAULT_DASHBOARD_PERIOD_DAYS,
  operatorDashboardCategoriesPath,
  parseDashboardCategory,
  parseDashboardDays,
  type DashboardPeriodDays,
  type OperatorDashboardCategoriesResponse,
  type OperatorDashboardCategoryRow,
} from "@/lib/operator-dashboard";
import { formatCount } from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-[0.08em] text-rr-green";
const MORE_KEY = "more";

type CategoryOption = { key: string; label: string; draws: number };

function categoryOptions(
  rows: OperatorDashboardCategoryRow[] | null,
): CategoryOption[] {
  if (!rows) return [];

  return rows
    .map((row) => ({
      key: row.key,
      label: row.label,
      draws: row.market.drawsCompleted,
    }))
    .sort((a, b) => {
      if (a.key === MORE_KEY) return 1;
      if (b.key === MORE_KEY) return -1;
      return a.label.localeCompare(b.label);
    });
}

function FilterBar({
  days,
  category,
  options,
  totalDraws,
  ready,
  onChange,
}: {
  days: DashboardPeriodDays;
  category: string;
  options: CategoryOption[];
  totalDraws: number | null;
  ready: boolean;
  onChange: (next: { days: DashboardPeriodDays; category: string }) => void;
}) {
  const changed =
    days !== DEFAULT_DASHBOARD_PERIOD_DAYS || category !== ALL_CATEGORIES_KEY;

  return (
    <section
      aria-label="Filters"
      className={cn(
        panelClass,
        "flex flex-col gap-2.5 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between",
      )}
    >
      <div className="min-w-0">
        <p className={eyebrowClass}>Period and category</p>
        <p className="text-xs leading-snug text-rr-secondary">
          Apply to the categories, prizes and closing windows below. The
          sections above always show the latest week.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Period"
          className="flex shrink-0 items-center gap-1"
        >
          {DASHBOARD_PERIOD_DAYS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={days === option}
              onClick={() => onChange({ days: option, category })}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-bold transition",
                days === option
                  ? "border-rr-green bg-rr-green text-rr-on-accent"
                  : "border-rr-border bg-rr-surface text-rr-secondary hover:text-rr-primary",
              )}
            >
              {option} days
            </button>
          ))}
        </div>
        <select
          aria-label="Category"
          value={category}
          disabled={!ready}
          onChange={(event) => onChange({ days, category: event.target.value })}
          className="min-w-0 max-w-full rounded-md border border-rr-border bg-rr-bg px-2.5 py-1.5 text-xs font-bold text-rr-primary focus:border-rr-green focus:outline-none disabled:opacity-60"
        >
          <option value={ALL_CATEGORIES_KEY}>
            {ALL_CATEGORIES_LABEL}
            {totalDraws !== null ? ` · ${formatCount(totalDraws)}` : ""}
          </option>
          {options.map((option) => (
            <option
              key={option.key}
              value={option.key}
              disabled={option.draws === 0 && option.key !== category}
            >
              {option.label} · {formatCount(option.draws)}
            </option>
          ))}
        </select>
        {changed ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                days: DEFAULT_DASHBOARD_PERIOD_DAYS,
                category: ALL_CATEGORIES_KEY,
              })
            }
            className="rounded-md px-1.5 py-1.5 text-xs font-semibold text-rr-secondary underline-offset-2 hover:text-rr-primary hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function OperatorDashboardSections({
  operatorId,
  operatorName,
}: {
  operatorId: string;
  operatorName: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const days = parseDashboardDays(searchParams.get("days"));
  const requested = parseDashboardCategory(searchParams.get("category"));
  const categories = useDashboardResource<OperatorDashboardCategoriesResponse>(
    operatorDashboardCategoriesPath(operatorId, days),
  );
  const rows = categories.data?.categories.rows ?? null;
  const category =
    requested === ALL_CATEGORIES_KEY
      ? ALL_CATEGORIES_KEY
      : rows
        ? rows.some((row) => row.key === requested)
          ? requested
          : ALL_CATEGORIES_KEY
        : categories.status === "error"
          ? ALL_CATEGORIES_KEY
          : null;

  function applyFilters(next: { days: DashboardPeriodDays; category: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.days === DEFAULT_DASHBOARD_PERIOD_DAYS) params.delete("days");
    else params.set("days", String(next.days));

    if (next.category === ALL_CATEGORIES_KEY) params.delete("category");
    else params.set("category", next.category);

    const query = params.toString();
    window.history.pushState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  return (
    <>
      <FilterBar
        days={days}
        category={category ?? ALL_CATEGORIES_KEY}
        options={categoryOptions(rows)}
        totalDraws={
          categories.data?.categories.total.market.drawsCompleted ?? null
        }
        ready={rows !== null}
        onChange={applyFilters}
      />

      <CategoryView
        operatorName={operatorName}
        resource={categories}
        selectedKey={
          category !== null && category !== ALL_CATEGORIES_KEY ? category : null
        }
      />

      <PrizeView
        operatorId={operatorId}
        operatorName={operatorName}
        days={days}
        category={category}
      />

      <ClosingWindowsView
        operatorId={operatorId}
        operatorName={operatorName}
        days={days}
        category={category}
      />
    </>
  );
}
