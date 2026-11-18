"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
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

function CategorySelect({
  category,
  options,
  totalDraws,
  ready,
  onSelect,
}: {
  category: string;
  options: CategoryOption[];
  totalDraws: number | null;
  ready: boolean;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const items: (CategoryOption & { disabled: boolean })[] = [
    {
      key: ALL_CATEGORIES_KEY,
      label: ALL_CATEGORIES_LABEL,
      draws: totalDraws ?? 0,
      disabled: false,
    },
    ...options.map((option) => ({
      ...option,
      disabled: option.draws === 0 && option.key !== category,
    })),
  ];
  const selected = items.find((item) => item.key === category) ?? items[0];

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  function moveFocus(step: number) {
    const buttons = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]:not(:disabled)',
      ) ?? [],
    );
    if (buttons.length === 0) return;
    const index = buttons.findIndex(
      (button) => button === document.activeElement,
    );
    const next =
      index === -1
        ? step > 0
          ? 0
          : buttons.length - 1
        : (index + step + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative min-w-0 flex-1 sm:w-[15rem] sm:flex-none"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (!open) setOpen(true);
          else moveFocus(event.key === "ArrowDown" ? 1 : -1);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Category"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={!ready}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-rr-surface px-2.5 py-1.5 text-xs font-bold text-rr-primary outline-none transition disabled:opacity-60",
          open
            ? "border-rr-green"
            : "border-rr-border hover:border-rr-green focus-visible:border-rr-green",
        )}
      >
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="truncate">{selected.label}</span>
          {totalDraws !== null ? (
            <span className="shrink-0 font-semibold text-rr-secondary">
              {formatCount(selected.draws)}
            </span>
          ) : null}
        </span>
        <IconChevronDown
          size={14}
          className={cn(
            "shrink-0 text-rr-secondary transition-transform",
            open ? "rotate-180" : undefined,
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Category"
          className="absolute right-0 z-50 mt-1 w-full min-w-[15rem] max-w-[calc(100vw-32px)] rounded-md border border-rr-border bg-rr-surface p-1 shadow-lg"
        >
          {items.map((item) => {
            const active = item.key === category;

            return (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={active}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  onSelect(item.key);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs outline-none transition",
                  active
                    ? "bg-rr-green-bg font-bold text-rr-primary"
                    : item.disabled
                      ? "cursor-not-allowed text-rr-secondary"
                      : "font-semibold text-rr-primary hover:bg-rr-elevated focus-visible:bg-rr-elevated",
                )}
              >
                <span className="flex w-3.5 shrink-0 justify-center text-rr-green">
                  {active ? <IconCheck size={14} stroke={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    item.disabled ? "font-normal" : undefined,
                    "text-rr-secondary",
                  )}
                >
                  {item.disabled ? "No draws" : formatCount(item.draws)}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FilterBar({
  days,
  category,
  options,
  totalDraws,
  ready,
  weeklyAbove,
  onChange,
}: {
  weeklyAbove: boolean;
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
        "flex flex-col gap-2.5 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4",
      )}
    >
      <div className="min-w-0 lg:flex-1">
        <p className={eyebrowClass}>Period and category</p>
        <p className="text-xs leading-snug text-rr-secondary">
          {weeklyAbove
            ? "Apply to the section below. The weekly sections above always show the latest week."
            : "Apply to the category table below; the chosen category is highlighted."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap lg:shrink-0">
        <div
          role="group"
          aria-label="Period"
          className="flex w-full shrink-0 items-center gap-1 sm:w-auto"
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
        <CategorySelect
          category={category}
          options={options}
          totalDraws={totalDraws}
          ready={ready}
          onSelect={(key) => onChange({ days, category: key })}
        />
        <button
          type="button"
          disabled={!changed}
          onClick={() =>
            onChange({
              days: DEFAULT_DASHBOARD_PERIOD_DAYS,
              category: ALL_CATEGORIES_KEY,
            })
          }
          className="shrink-0 rounded-md border border-rr-border px-2.5 py-1.5 text-xs font-bold text-rr-secondary transition enabled:hover:border-rr-green enabled:hover:text-rr-primary disabled:cursor-default disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export function OperatorDashboardSections({
  screen,
  operatorId,
  operatorName,
}: {
  screen: "market" | "prizes" | "timing";
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
        weeklyAbove={screen !== "market"}
        onChange={applyFilters}
      />

      {screen === "market" ? (
        <CategoryView
          operatorName={operatorName}
          resource={categories}
          selectedKey={
            category !== null && category !== ALL_CATEGORIES_KEY
              ? category
              : null
          }
        />
      ) : null}

      {screen === "prizes" ? (
        <PrizeView
          operatorId={operatorId}
          operatorName={operatorName}
          days={days}
          category={category}
        />
      ) : null}

      {screen === "timing" ? (
        <ClosingWindowsView
          operatorId={operatorId}
          operatorName={operatorName}
          days={days}
          category={category}
        />
      ) : null}
    </>
  );
}
