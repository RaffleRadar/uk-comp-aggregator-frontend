"use client";

import { cn } from "@/lib/cn";
import { RadarLoader } from "@/components/ui/RadarLoader";
import type { DashboardResource } from "@/components/operator-dashboard/use-dashboard-resource";
import type {
  OperatorDashboardCategoriesResponse,
  OperatorDashboardCategoryFigures,
} from "@/lib/operator-dashboard";
import { formatCount, formatWeekRange } from "@/lib/weekly-radar";

const panelClass = "rounded-xl border border-rr-border bg-rr-surface";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-[0.08em] text-rr-green";
const LOAD_ERROR = "Category figures could not be loaded.";
const SELECTED_ROW = "bg-rr-green-bg shadow-[inset_3px_0_0_var(--accent)]";

function formatPercentOne(value: number | null) {
  return value === null ? "–" : `${value.toFixed(1)}%`;
}

function formatDifference(value: number | null) {
  if (value === null) return "–";
  if (value === 0) return "0.0 pts";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)} pts`;
}

function differenceClass(value: number | null) {
  if (value === null || value === 0) return "text-rr-secondary";
  return value > 0 ? "text-rr-green" : "text-rr-warn";
}

function SoldBar({ value, strong }: { value: number | null; strong: boolean }) {
  return (
    <span className="block h-2 min-w-0 overflow-hidden rounded-full bg-rr-elevated">
      {value !== null ? (
        <span
          className={cn(
            "block h-full rounded-full",
            strong ? "bg-rr-green" : "bg-rr-muted",
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      ) : null}
    </span>
  );
}

function SoldCell({
  figures,
  strong,
}: {
  figures: OperatorDashboardCategoryFigures;
  strong: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3.25rem] items-center gap-2">
      <SoldBar value={figures.averageSoldAtClose} strong={strong} />
      <span
        className={cn(
          "text-right text-xs font-bold",
          figures.averageSoldAtClose === null
            ? "text-rr-muted"
            : "text-rr-primary",
        )}
      >
        {formatPercentOne(figures.averageSoldAtClose)}
      </span>
    </div>
  );
}

function DrawsNote({ figures }: { figures: OperatorDashboardCategoryFigures }) {
  return (
    <span className="text-xs text-rr-secondary">
      {formatCount(figures.drawsCompleted)}{" "}
      {figures.drawsCompleted === 1 ? "draw" : "draws"}
      {figures.soldOutShare !== null
        ? ` · ${formatPercentOne(figures.soldOutShare)} sold out`
        : ""}
    </span>
  );
}

type TableRow = {
  key: string;
  label: string;
  market: OperatorDashboardCategoryFigures;
  operator: OperatorDashboardCategoryFigures;
  difference: number | null;
  total?: boolean;
  child?: boolean;
  other?: boolean;
};

function DesktopTable({
  rows,
  operatorName,
  selectedKey,
}: {
  rows: TableRow[];
  operatorName: string;
  selectedKey: string | null;
}) {
  return (
    <div className={cn(panelClass, "hidden overflow-hidden md:block")}>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-rr-border text-left text-xs font-semibold text-rr-secondary">
            <th scope="col" className="w-[23%] px-3 py-2">
              Category
            </th>
            <th scope="col" className="w-[9%] px-2 py-2 text-right">
              Draws
            </th>
            <th scope="col" className="w-[10%] px-2 py-2 text-right">
              Sold out
            </th>
            <th scope="col" className="w-[20%] px-3 py-2">
              Market avg sold
            </th>
            <th scope="col" className="w-[8%] px-2 py-2 text-right">
              <span className="sr-only">{operatorName} </span>Your draws
            </th>
            <th scope="col" className="w-[20%] px-3 py-2">
              Your avg sold
            </th>
            <th scope="col" className="w-[10%] px-3 py-2 text-right">
              Difference
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rr-border">
          {rows.map((row) => (
            <tr
              key={row.key}
              aria-current={row.key === selectedKey ? "true" : undefined}
              className={cn(
                row.total ? "bg-rr-elevated/60" : undefined,
                row.key === selectedKey ? SELECTED_ROW : undefined,
              )}
            >
              <th
                scope="row"
                className={cn(
                  "truncate py-2 pr-3 text-left",
                  row.child ? "pl-7" : "pl-3",
                  row.total
                    ? "font-bold text-rr-primary"
                    : row.child
                      ? cn(
                          "font-medium",
                          row.other ? "text-rr-muted" : "text-rr-secondary",
                        )
                      : "font-semibold text-rr-primary",
                )}
              >
                {row.label}
              </th>
              <td className="px-2 py-2 text-right text-rr-primary">
                {formatCount(row.market.drawsCompleted)}
              </td>
              <td
                className={cn(
                  "px-2 py-2 text-right",
                  row.market.soldOutShare === null
                    ? "text-rr-muted"
                    : "text-rr-primary",
                )}
              >
                {formatPercentOne(row.market.soldOutShare)}
              </td>
              <td className="px-3 py-2">
                <SoldCell figures={row.market} strong={false} />
              </td>
              <td className="px-2 py-2 text-right text-rr-primary">
                {formatCount(row.operator.drawsCompleted)}
              </td>
              <td className="px-3 py-2">
                <SoldCell figures={row.operator} strong />
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right text-xs font-bold",
                  differenceClass(row.difference),
                )}
              >
                {formatDifference(row.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileList({
  rows,
  selectedKey,
}: {
  rows: TableRow[];
  selectedKey: string | null;
}) {
  return (
    <ul className={cn(panelClass, "divide-y divide-rr-border md:hidden")}>
      {rows.map((row) => (
        <li
          key={row.key}
          aria-current={row.key === selectedKey ? "true" : undefined}
          className={cn(
            "space-y-1.5 py-2.5 pr-3",
            row.child ? "pl-6" : "pl-3",
            row.total ? "bg-rr-elevated/60" : undefined,
            row.key === selectedKey ? SELECTED_ROW : undefined,
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                "text-sm",
                row.total
                  ? "font-bold text-rr-primary"
                  : row.child
                    ? cn(
                        "font-medium",
                        row.other ? "text-rr-muted" : "text-rr-secondary",
                      )
                    : "font-semibold text-rr-primary",
              )}
            >
              {row.label}
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                differenceClass(row.difference),
              )}
            >
              {formatDifference(row.difference)}
            </span>
          </div>
          <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-2 gap-y-1">
            <span className="text-xs font-semibold text-rr-secondary">
              Market
            </span>
            <SoldCell figures={row.market} strong={false} />
            <span className="col-start-2 -mt-0.5">
              <DrawsNote figures={row.market} />
            </span>
            <span className="text-xs font-semibold text-rr-secondary">You</span>
            <SoldCell figures={row.operator} strong />
            <span className="col-start-2 -mt-0.5">
              <DrawsNote figures={row.operator} />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CategoryView({
  operatorName,
  resource,
  selectedKey,
}: {
  operatorName: string;
  resource: DashboardResource<OperatorDashboardCategoriesResponse>;
  selectedKey: string | null;
}) {
  const categories = resource.data?.categories ?? null;
  const rows: TableRow[] = categories
    ? [
        ...categories.rows.flatMap((row) => [
          row,
          ...(row.children ?? []).map((child) => ({ ...child, child: true })),
        ]),
        {
          key: "total",
          label: "All categories",
          market: categories.total.market,
          operator: categories.total.operator,
          difference: categories.total.difference,
          total: true,
        },
      ]
    : [];

  return (
    <section aria-label="Categories" className="space-y-2">
      <div>
        <p className={eyebrowClass}>Categories</p>
        <h2 className="text-lg font-extrabold leading-tight tracking-[-0.01em] text-rr-primary">
          How each category sells
        </h2>
        <p className="mt-0.5 text-[13px] leading-snug text-rr-secondary">
          {categories
            ? `Last ${categories.period.days} days, ${formatWeekRange(categories.period.from, categories.period.to)}. `
            : ""}
          Draws that closed across the market and for {operatorName}, ranked by
          market average sold at close.
        </p>
      </div>

      {resource.status === "loading" && !categories ? (
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

      {categories ? (
        <div
          aria-busy={resource.stale}
          className={cn(
            "space-y-2 transition-opacity",
            resource.stale ? "opacity-50" : undefined,
          )}
        >
          <DesktopTable
            rows={rows}
            operatorName={operatorName}
            selectedKey={selectedKey}
          />
          <MobileList rows={rows} selectedKey={selectedKey} />
          <p className="text-[11px] leading-snug text-rr-muted">
            Excludes Instants. Percentages appear from{" "}
            {formatCount(categories.minimumDraws)} draws; with fewer, only the
            count is shown. Difference is your average sold minus the market, in
            percentage points.
          </p>
        </div>
      ) : null}
    </section>
  );
}
