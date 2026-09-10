"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconCash,
  IconChartBar,
  IconChevronDown,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { pushEvent } from "@/lib/analytics";
import {
  SPEND_OPTIONS,
  formatSpendAmount,
  getCompetitionSortIdentity,
  getCompetitionSortPresentation,
} from "@/lib/competition-sort";
import {
  parseSpend,
  readSpendCookie,
  writeSpendCookie,
} from "@/lib/spend-mode";

export type FilterOption = {
  value: string;
  label: string;
};

export type SortOption = {
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  closing?: string | null;
  excludeInstant?: boolean;
  excludeFree?: boolean;
};

const VEHICLES_ALL = "cars,bikes,motorhomes,vans,boats,plant";
const VEHICLES_OTHER = "vans,boats,plant";

const defaultCategoryOptions: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "vehicles", label: "Vehicles" },
  { value: "houses", label: "Houses" },
  { value: "watches", label: "Watches" },
  { value: "cash", label: "Cash" },
  { value: "tech", label: "Tech" },
  { value: "games", label: "Games" },
  { value: "tickets", label: "Tickets" },
  { value: "other", label: "Other" },
  { value: "free", label: "Free" },
];

const defaultClosingOptions: FilterOption[] = [
  { value: "today", label: "Today" },
  { value: "3days", label: "3 days" },
  { value: "5days", label: "5 days" },
];

const defaultSortOptions: SortOption[] = [
  { label: "Best Value", sortBy: "valueRatio", sortOrder: "desc" },
  {
    label: "Most Undersold",
    sortBy: "percentSold",
    sortOrder: "asc",
    closing: "today",
    excludeInstant: true,
    excludeFree: true,
  },
  { label: "Ending Soon", sortBy: "endsAt", sortOrder: "asc" },
  {
    label: "Best Odds",
    sortBy: "ticketsTotal",
    sortOrder: "asc",
    closing: null,
    excludeInstant: false,
    excludeFree: false,
  },
  { label: "Top Picks", sortBy: "opportunityScore", sortOrder: "desc" },
  { label: "Top Prizes", sortBy: "prizeValue", sortOrder: "desc" },
  { label: "Selling Fast", sortBy: "percentSold", sortOrder: "desc" },
  { label: "Lowest Ticket Price", sortBy: "ticketPrice", sortOrder: "asc" },
  { label: "Highest Ticket Price", sortBy: "ticketPrice", sortOrder: "desc" },
  { label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Most Tickets Left", sortBy: "ticketsLeft", sortOrder: "desc" },
];

const otherSubcategoryOptions: FilterOption[] = [
  { value: "other", label: "All" },
  { value: "home", label: "Home" },
  { value: "holidays", label: "Holidays" },
  { value: "collectibles", label: "Collectibles" },
  { value: "music", label: "Music" },
  { value: "experiences", label: "Experiences" },
  { value: "sports", label: "Sports" },
  { value: "none", label: "Uncategorised" },
];

const vehicleSubcategoryOptions: FilterOption[] = [
  { value: VEHICLES_ALL, label: "All" },
  { value: "cars", label: "Cars" },
  { value: "bikes", label: "Bikes" },
  { value: "motorhomes", label: "Motorhomes" },
  { value: VEHICLES_OTHER, label: "Other" },
];

type FilterBarProps = {
  categoryOptions?: FilterOption[];
  closingOptions?: FilterOption[];
  sortOptions?: SortOption[];
  className?: string;
};

type FilterEventMeta = {
  filterType: string;
  filterValue: string;
};

function isSortOptionActive(
  option: SortOption,
  state: {
    sortBy: string;
    sortOrder: "asc" | "desc";
    excludeInstant: boolean;
    excludeFree: boolean;
    spend: number | null;
  },
) {
  return (
    getCompetitionSortIdentity({
      sortBy: option.sortBy,
      sortOrder: option.sortOrder,
      excludeInstant: option.excludeInstant ?? false,
      excludeFree: option.excludeFree ?? false,
      spend: state.spend,
    }) ===
    getCompetitionSortIdentity({
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      excludeInstant: state.excludeInstant,
      excludeFree: state.excludeFree,
      spend: state.spend,
    })
  );
}

function getSortOptionKey(option: SortOption) {
  return [
    option.label,
    option.sortBy,
    option.sortOrder,
    option.closing ?? "",
    option.excludeInstant ? "excludeInstant" : "",
    option.excludeFree ? "excludeFree" : "",
  ].join(":");
}

export function FilterBar({
  categoryOptions,
  closingOptions,
  sortOptions,
  className,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isListingPage = pathname === "/competitions";

  const [sortOpen, setSortOpen] = useState(false);
  const [closingOpen, setClosingOpen] = useState(false);
  const [spendOpen, setSpendOpen] = useState(false);
  const sortWrapRef = useRef<HTMLDivElement | null>(null);
  const closingWrapRef = useRef<HTMLDivElement | null>(null);
  const spendWrapRef = useRef<HTMLDivElement | null>(null);

  const categoryOpts = categoryOptions ?? defaultCategoryOptions;
  const closingOpts = closingOptions ?? defaultClosingOptions;

  const freeOnly = searchParams.get("freeOnly") === "true";
  const categoryParam = searchParams.get("category");
  const currentClosing = searchParams.get("closing");
  const closing = currentClosing ?? "";
  const excludeInstant = searchParams.get("excludeInstant") === "true";
  const excludeFree = searchParams.get("excludeFree") === "true";
  const sortBy = searchParams.get("sortBy") ?? "valueRatio";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
  const spendParam = searchParams.get("spend");
  const spend = parseSpend(spendParam);

  const spendSortOptions: SortOption[] =
    spend != null
      ? [
          {
            label: `Best Odds for ${formatSpendAmount(spend)}`,
            sortBy: "spendOdds",
            sortOrder: "asc",
          },
          {
            label: `Most Entries for ${formatSpendAmount(spend)}`,
            sortBy: "spendEntries",
            sortOrder: "desc",
          },
          {
            label: `Biggest Prize for ${formatSpendAmount(spend)}`,
            sortBy: "spendPrize",
            sortOrder: "desc",
          },
        ]
      : [];

  const sortOpts =
    spend != null ? spendSortOptions : (sortOptions ?? defaultSortOptions);

  const showCategory = categoryOpts.length > 0;
  const showClosing = closingOpts.length > 0;
  const showSort = sortOpts.length > 0;
  const showSpend = true;

  const otherSubcategoryValues = new Set(
    otherSubcategoryOptions
      .map((opt) => opt.value)
      .filter((value) => value !== "other"),
  );
  const vehicleSubcategoryValues = new Set(
    vehicleSubcategoryOptions.map((opt) => opt.value),
  );

  const isVehicleSubcategory = categoryParam
    ? vehicleSubcategoryValues.has(categoryParam)
    : false;
  const isOtherSubcategory =
    !isVehicleSubcategory && categoryParam
      ? otherSubcategoryValues.has(categoryParam)
      : false;

  const currentMainCategory = freeOnly
    ? "free"
    : isVehicleSubcategory
      ? "vehicles"
      : isOtherSubcategory
        ? "other"
        : (categoryParam ?? "all");

  const currentOtherSubcategory =
    currentMainCategory === "other" ? (categoryParam ?? "other") : null;
  const currentVehicleSubcategory =
    currentMainCategory === "vehicles" ? (categoryParam ?? VEHICLES_ALL) : null;

  const showOtherSubcategories = currentMainCategory === "other";
  const showVehicleSubcategories = currentMainCategory === "vehicles";

  const isSortOpen = showSort && sortOpen;
  const isSpendOpen = showSpend && spendOpen;

  const updateParam = useCallback(
    (key: string, value: string | null, eventMeta?: FilterEventMeta) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("page");
      params.delete("search");

      const qs = params.toString();
      const nextHref = qs ? `${pathname}?${qs}` : pathname;
      const currentQs = searchParams.toString();
      const currentHref = currentQs ? `${pathname}?${currentQs}` : pathname;

      if (nextHref === currentHref) {
        return;
      }

      if (eventMeta) {
        pushEvent("filter_applied", {
          filter_type: eventMeta.filterType,
          filter_value: eventMeta.filterValue,
        });
      }

      router.push(nextHref);
    },
    [pathname, router, searchParams],
  );

  const updateClosing = useCallback(
    (value: string | null, eventMeta?: FilterEventMeta) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete("closing");
      } else {
        params.set("closing", value);
      }

      params.delete("page");
      params.delete("search");

      const qs = params.toString();
      const nextHref = qs ? `${pathname}?${qs}` : pathname;
      const currentQs = searchParams.toString();
      const currentHref = currentQs ? `${pathname}?${currentQs}` : pathname;

      if (nextHref === currentHref) {
        return;
      }

      if (eventMeta) {
        pushEvent("filter_applied", {
          filter_type: eventMeta.filterType,
          filter_value: eventMeta.filterValue,
        });
      }

      router.push(nextHref);
    },
    [pathname, router, searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>, eventMeta?: FilterEventMeta) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      params.delete("page");
      params.delete("search");

      const qs = params.toString();
      const nextHref = qs ? `${pathname}?${qs}` : pathname;
      const currentQs = searchParams.toString();
      const currentHref = currentQs ? `${pathname}?${currentQs}` : pathname;

      if (nextHref === currentHref) {
        return;
      }

      if (eventMeta) {
        pushEvent("filter_applied", {
          filter_type: eventMeta.filterType,
          filter_value: eventMeta.filterValue,
        });
      }

      router.push(nextHref);
    },
    [pathname, router, searchParams],
  );

  const handleClosingClick = useCallback(
    (value: string) => {
      updateClosing(currentClosing === value ? null : value, {
        filterType: "closing",
        filterValue: currentClosing === value ? "any" : value,
      });
    },
    [currentClosing, updateClosing],
  );

  const handleSortOptionClick = useCallback(
    (opt: SortOption) => {
      updateParams({
        sortBy: opt.sortBy,
        sortOrder: opt.sortOrder,
        closing: opt.closing === undefined ? currentClosing : opt.closing,
        excludeInstant:
          opt.excludeInstant === undefined
            ? null
            : opt.excludeInstant
              ? "true"
              : null,
        excludeFree:
          opt.excludeFree === undefined
            ? null
            : opt.excludeFree
              ? "true"
              : null,
      });
      setSortOpen(false);
    },
    [currentClosing, updateParams],
  );

  const handleSpendOptionClick = useCallback(
    (amount: number | null) => {
      if (amount == null) {
        const isSpendSort =
          sortBy === "spendOdds" ||
          sortBy === "spendEntries" ||
          sortBy === "spendPrize";
        writeSpendCookie(null);
        updateParams(
          {
            spend: null,
            ...(isSpendSort ? { sortBy: "valueRatio", sortOrder: "desc" } : {}),
          },
          { filterType: "spend", filterValue: "off" },
        );
      } else {
        writeSpendCookie(amount);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("section");
        params.delete("closing");
        params.delete("page");
        params.delete("search");
        params.set("spend", String(amount));
        params.set("sortBy", "spendOdds");
        params.set("sortOrder", "asc");
        const qs = params.toString();
        router.push(`/competitions?${qs}`);
        pushEvent("filter_applied", {
          filter_type: "spend",
          filter_value: String(amount),
        });
      }
      setSpendOpen(false);
    },
    [sortBy, updateParams, searchParams, router],
  );

  const activeSort = useMemo(() => {
    return sortOpts.find((opt) =>
      isSortOptionActive(opt, {
        sortBy,
        sortOrder,
        excludeInstant,
        excludeFree,
        spend,
      }),
    );
  }, [excludeFree, excludeInstant, sortBy, sortOrder, sortOpts, spend]);

  const sortLabel =
    activeSort?.label ??
    getCompetitionSortPresentation({
      sortBy,
      sortOrder,
      excludeInstant,
      excludeFree,
      spend,
    })?.label ??
    "Sort";

  const closingLabel = useMemo(() => {
    if (!closing) return "Closing: All";

    const match = closingOpts.find((opt) => opt.value === closing);
    return match ? `Closing: ${match.label}` : "Closing: All";
  }, [closing, closingOpts]);

  const spendLabel = useMemo(() => {
    if (!isListingPage || spend == null) return "Spend: Off";
    return `${formatSpendAmount(spend)} Spend`;
  }, [isListingPage, spend]);

  const spendActive = isListingPage ? spend : null;

  useEffect(() => {
    if (!isSortOpen && !closingOpen && !isSpendOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const sortWrap = sortWrapRef.current;
      const closingWrap = closingWrapRef.current;
      const spendWrap = spendWrapRef.current;

      if (e.target instanceof Node) {
        if (sortWrap && sortWrap.contains(e.target)) return;
        if (closingWrap && closingWrap.contains(e.target)) return;
        if (spendWrap && spendWrap.contains(e.target)) return;
      }

      setSortOpen(false);
      setClosingOpen(false);
      setSpendOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSortOpen(false);
        setClosingOpen(false);
        setSpendOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closingOpen, isSortOpen, isSpendOpen]);

  useEffect(() => {
    const onOpenSpendMenu = () => {
      setSortOpen(false);
      setClosingOpen(false);
      setSpendOpen(true);
    };

    window.addEventListener("rr:open-spend-menu", onOpenSpendMenu);
    return () =>
      window.removeEventListener("rr:open-spend-menu", onOpenSpendMenu);
  }, []);

  useEffect(() => {
    if (!isListingPage) return;
    if (spend != null) return;
    if (searchParams.has("sortBy") || searchParams.has("section")) return;

    const cookieAmount = readSpendCookie();
    if (cookieAmount == null) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("spend", String(cookieAmount));
    if (!searchParams.has("sortBy")) {
      params.set("sortBy", "spendOdds");
      params.set("sortOrder", "asc");
    }
    params.delete("page");
    params.delete("search");
    const qs = params.toString();
    const nextHref = qs ? `${pathname}?${qs}` : pathname;
    router.replace(nextHref);
  }, [pathname, router, searchParams, spend, isListingPage]);

  return (
    <div className={cn("border-b border-rr-border bg-rr-surface", className)}>
      <div className="container py-3">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:gap-3">
          {showCategory ? (
            <div className="order-2 flex flex-wrap gap-1 2xl:order-1 2xl:flex-1 2xl:min-w-0 2xl:flex-nowrap 2xl:gap-1 2xl:overflow-x-auto 2xl:overscroll-x-contain 2xl:pb-0.5 2xl:pr-1 2xl:[scrollbar-width:none] 2xl:[&::-webkit-scrollbar]:hidden">
              {categoryOpts.map((opt) => {
                const isActive = opt.value === currentMainCategory;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] leading-[18px] font-medium transition cursor-pointer lg:px-2 lg:py-[2px] lg:text-[11px] lg:leading-[18px]",
                      isActive
                        ? "bg-rr-green text-rr-on-accent border border-transparent"
                        : "bg-transparent border border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                    )}
                    aria-pressed={isActive}
                    onClick={() => {
                      if (opt.value === "all") {
                        updateParams(
                          { category: null, freeOnly: null },
                          { filterType: "category", filterValue: "all" },
                        );
                        return;
                      }

                      if (opt.value === "free") {
                        updateParams(
                          {
                            category: null,
                            freeOnly: isActive ? null : "true",
                            excludeInstant: null,
                            excludeFree: null,
                          },
                          {
                            filterType: "free",
                            filterValue: isActive ? "false" : "true",
                          },
                        );
                        return;
                      }

                      if (opt.value === "vehicles") {
                        updateParams(
                          {
                            category:
                              categoryParam === VEHICLES_ALL
                                ? null
                                : VEHICLES_ALL,
                            freeOnly: null,
                          },
                          {
                            filterType: "category",
                            filterValue:
                              categoryParam === VEHICLES_ALL
                                ? "all"
                                : "vehicles",
                          },
                        );
                        return;
                      }

                      if (opt.value === "other") {
                        updateParams(
                          {
                            category:
                              currentMainCategory === "other" &&
                              categoryParam === "other"
                                ? null
                                : "other",
                            freeOnly: null,
                          },
                          {
                            filterType: "category",
                            filterValue:
                              currentMainCategory === "other" &&
                              categoryParam === "other"
                                ? "all"
                                : "other",
                          },
                        );
                        return;
                      }

                      updateParams(
                        {
                          category: isActive ? null : opt.value,
                          freeOnly: null,
                        },
                        {
                          filterType: "category",
                          filterValue: isActive ? "all" : opt.value,
                        },
                      );
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className={cn(
              "order-1 grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-1 2xl:order-2",
              showCategory ? "2xl:flex-shrink-0" : "",
            )}
          >
            {showSort ? (
              <div ref={sortWrapRef} className="relative min-w-0">
                <div className="lg:hidden">
                  <button
                    type="button"
                    className={cn(
                      "h-10 w-full rounded-xl border border-rr-border bg-rr-surface px-3 text-sm text-rr-secondary shadow-sm outline-none cursor-pointer",
                      isSortOpen
                        ? "border-rr-border"
                        : "hover:border-rr-border",
                    )}
                    aria-label="Sort"
                    aria-haspopup="listbox"
                    aria-expanded={isSortOpen}
                    onClick={() => {
                      setClosingOpen(false);
                      setSpendOpen(false);
                      setSortOpen((v) => !v);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <IconChartBar
                          size={16}
                          className="shrink-0 text-rr-muted"
                        />
                        <span className="truncate">{sortLabel}</span>
                      </span>
                      <IconChevronDown size={14} className="text-rr-muted" />
                    </span>
                  </button>

                  {isSortOpen ? (
                    <div
                      className="absolute left-0 z-50 mt-1 min-w-[220px] max-w-[calc(100vw-32px)] rounded-md border border-rr-border bg-rr-surface p-1 pr-2 divide-y divide-white/[0.06] [&>button]:mx-1 [&>button]:w-[calc(100%-8px)]"
                      role="listbox"
                      aria-label="Sort options"
                    >
                      {sortOpts.map((opt) => {
                        const isActive = isSortOptionActive(opt, {
                          sortBy,
                          sortOrder,
                          excludeInstant,
                          excludeFree,
                          spend,
                        });

                        return (
                          <button
                            key={getSortOptionKey(opt)}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                              isActive
                                ? "bg-rr-elevated text-rr-primary"
                                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                            )}
                            onClick={() => handleSortOptionClick(opt)}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="hidden lg:block">
                  <button
                    type="button"
                    className={cn(
                      "h-10 w-full rounded-xl border border-rr-border bg-rr-surface px-3 text-sm text-rr-secondary shadow-sm outline-none cursor-pointer lg:h-9 lg:w-[200px] lg:rounded-[7px] lg:border-transparent lg:bg-rr-elevated lg:px-2 lg:shadow-none",
                      isSortOpen
                        ? "border-rr-border"
                        : "hover:border-rr-border",
                    )}
                    aria-label="Sort"
                    aria-haspopup="listbox"
                    aria-expanded={isSortOpen}
                    onClick={() => {
                      setClosingOpen(false);
                      setSpendOpen(false);
                      setSortOpen((v) => !v);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <IconChartBar
                          size={16}
                          className="shrink-0 text-rr-muted lg:hidden"
                        />
                        <span className="truncate">{sortLabel}</span>
                      </span>
                      <IconChevronDown size={14} className="text-rr-muted" />
                    </span>
                  </button>

                  {isSortOpen ? (
                    <div
                      className="absolute left-0 z-50 mt-1 min-w-[220px] max-w-[calc(100vw-32px)] rounded-md border border-rr-border bg-rr-surface p-1 pr-2 divide-y divide-white/[0.06] [&>button]:mx-1 [&>button]:w-[calc(100%-8px)] lg:left-auto lg:right-0 lg:w-[240px] lg:min-w-0 lg:pr-1"
                      role="listbox"
                      aria-label="Sort options"
                    >
                      {sortOpts.map((opt) => {
                        const isActive = isSortOptionActive(opt, {
                          sortBy,
                          sortOrder,
                          excludeInstant,
                          excludeFree,
                          spend,
                        });

                        return (
                          <button
                            key={getSortOptionKey(opt)}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                              isActive
                                ? "bg-rr-elevated text-rr-primary"
                                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                            )}
                            onClick={() => handleSortOptionClick(opt)}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {showClosing ? (
              <div ref={closingWrapRef} className="relative min-w-0 lg:hidden">
                <div>
                  <button
                    type="button"
                    className={cn(
                      "h-10 w-full rounded-xl border border-rr-border bg-rr-surface px-3 text-sm text-rr-secondary shadow-sm outline-none cursor-pointer",
                      closingOpen
                        ? "border-rr-border"
                        : "hover:border-rr-border",
                    )}
                    aria-label="Closing"
                    aria-haspopup="listbox"
                    aria-expanded={closingOpen}
                    onClick={() => {
                      setSortOpen(false);
                      setSpendOpen(false);
                      setClosingOpen((v) => !v);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <IconClock
                          size={16}
                          className="shrink-0 text-rr-muted"
                        />
                        <span className="truncate">{closingLabel}</span>
                      </span>
                      <IconChevronDown size={14} className="text-rr-muted" />
                    </span>
                  </button>

                  {closingOpen ? (
                    <div
                      className="absolute right-0 z-50 mt-1 min-w-[180px] max-w-[calc(100vw-32px)] rounded-md border border-rr-border bg-rr-surface p-1 pr-2 divide-y divide-white/[0.06] [&>button]:mx-1 [&>button]:w-[calc(100%-8px)]"
                      role="listbox"
                      aria-label="Closing options"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={!closing}
                        className={cn(
                          "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                          !closing
                            ? "bg-rr-elevated text-rr-primary"
                            : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                        )}
                        onClick={() => {
                          updateClosing(null, {
                            filterType: "closing",
                            filterValue: "any",
                          });
                          setClosingOpen(false);
                        }}
                      >
                        Closing: All
                      </button>

                      {closingOpts.map((opt) => {
                        const isActive = opt.value === closing;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                              isActive
                                ? "bg-rr-elevated text-rr-primary"
                                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                            )}
                            onClick={() => {
                              updateClosing(opt.value, {
                                filterType: "closing",
                                filterValue: opt.value,
                              });
                              setClosingOpen(false);
                            }}
                          >
                            {`Closing: ${opt.label}`}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {showClosing ? (
              <div className="hidden flex-wrap items-center gap-[3px] lg:flex">
                <span className="text-xs text-rr-muted">Closing:</span>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs font-medium transition cursor-pointer",
                    !closing
                      ? "bg-rr-green text-rr-on-accent border border-transparent"
                      : "bg-transparent border border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                  )}
                  aria-pressed={!closing}
                  onClick={() =>
                    updateClosing(null, {
                      filterType: "closing",
                      filterValue: "all",
                    })
                  }
                >
                  All
                </button>
                {closingOpts.map((opt) => {
                  const isActive = opt.value === closing;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs font-medium transition cursor-pointer",
                        isActive
                          ? "bg-rr-green text-rr-on-accent border border-transparent"
                          : "bg-transparent border border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                      )}
                      aria-pressed={isActive}
                      onClick={() => handleClosingClick(opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {showSpend ? (
              <div ref={spendWrapRef} className="col-span-2 relative min-w-0 lg:col-span-1">
                <div className="lg:hidden">
                  <button
                    type="button"
                    className={cn(
                      "h-10 w-full rounded-xl border border-rr-border bg-rr-surface px-3 text-sm text-rr-secondary shadow-sm outline-none cursor-pointer",
                      isSpendOpen
                        ? "border-rr-border"
                        : "hover:border-rr-border",
                    )}
                    aria-label="Spend"
                    aria-haspopup="listbox"
                    aria-expanded={isSpendOpen}
                    onClick={() => {
                      setSortOpen(false);
                      setClosingOpen(false);
                      setSpendOpen((v) => !v);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <IconCash
                          size={16}
                          className="shrink-0 text-rr-muted"
                        />
                        <span className="truncate">{spendLabel}</span>
                      </span>
                      <IconChevronDown size={14} className="text-rr-muted" />
                    </span>
                  </button>

                  {isSpendOpen ? (
                    <div
                      className="absolute left-0 right-0 z-50 mt-1 min-w-[180px] max-w-[calc(100vw-32px)] rounded-md border border-rr-border bg-rr-surface p-1 pr-2 divide-y divide-white/[0.06] [&>button]:mx-1 [&>button]:w-[calc(100%-8px)]"
                      role="listbox"
                      aria-label="Spend options"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={spendActive == null}
                        className={cn(
                          "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                          spendActive == null
                            ? "bg-rr-elevated text-rr-primary"
                            : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                        )}
                        onClick={() => handleSpendOptionClick(null)}
                      >
                        Spend Off
                      </button>

                      {SPEND_OPTIONS.map((amount) => {
                        const isActive = spendActive === amount;

                        return (
                          <button
                            key={amount}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                              isActive
                                ? "bg-rr-elevated text-rr-primary"
                                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                            )}
                            onClick={() => handleSpendOptionClick(amount)}
                          >
                            {formatSpendAmount(amount)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="hidden lg:block ml-1">
                  <button
                    type="button"
                    className={cn(
                      "h-9 w-[140px] rounded-[7px] border border-transparent bg-rr-elevated px-2 text-sm text-rr-secondary shadow-none outline-none cursor-pointer",
                      isSpendOpen
                        ? "border-rr-border"
                        : "hover:border-rr-border",
                    )}
                    aria-label="Spend"
                    aria-haspopup="listbox"
                    aria-expanded={isSpendOpen}
                    onClick={() => {
                      setSortOpen(false);
                      setClosingOpen(false);
                      setSpendOpen((v) => !v);
                    }}
                  >
                    <span className="flex items-center justify-between gap-1.5">
                      <span className="truncate">{spendLabel}</span>
                      <IconChevronDown size={14} className="text-rr-muted shrink-0" />
                    </span>
                  </button>

                  {isSpendOpen ? (
                    <div
                      className="absolute left-auto right-0 z-50 mt-1 w-[180px] min-w-0 rounded-md border border-rr-border bg-rr-surface p-1 pr-1 divide-y divide-white/[0.06] [&>button]:mx-1 [&>button]:w-[calc(100%-8px)]"
                      role="listbox"
                      aria-label="Spend options"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={spendActive == null}
                        className={cn(
                          "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                          spendActive == null
                            ? "bg-rr-elevated text-rr-primary"
                            : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                        )}
                        onClick={() => handleSpendOptionClick(null)}
                      >
                        Spend Off
                      </button>

                      {SPEND_OPTIONS.map((amount) => {
                        const isActive = spendActive === amount;

                        return (
                          <button
                            key={amount}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "w-full text-left rounded px-2.5 py-2 text-sm transition cursor-pointer whitespace-nowrap",
                              isActive
                                ? "bg-rr-elevated text-rr-primary"
                                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                            )}
                            onClick={() => handleSpendOptionClick(amount)}
                          >
                            {formatSpendAmount(amount)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {showOtherSubcategories || showVehicleSubcategories ? (
          <div className="mt-4 flex flex-wrap gap-2 lg:mt-2 lg:gap-[6px]">
            {(showVehicleSubcategories
              ? vehicleSubcategoryOptions
              : otherSubcategoryOptions
            ).map((opt) => {
              const isActive =
                opt.value ===
                (showVehicleSubcategories
                  ? currentVehicleSubcategory
                  : currentOtherSubcategory);

              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer md:px-2.5 md:py-1",
                    isActive
                      ? "bg-rr-elevated text-rr-primary shadow-sm"
                      : "bg-rr-surface text-rr-muted hover:bg-rr-elevated hover:text-rr-primary",
                  )}
                  aria-pressed={isActive}
                  onClick={() =>
                    updateParam("category", opt.value, {
                      filterType: "category",
                      filterValue: opt.value,
                    })
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
