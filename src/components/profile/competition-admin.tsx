"use client";

import Link from "next/link";
import { type ComponentProps, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type CompetitionAdminRecord = {
  id: string;
  prize: string;
  category: string | null;
  categoryOverride: boolean;
  isActive: boolean;
  isHidden: boolean;
  availableToBuy: boolean | null;
  ticketPrice: number | string | null;
  prizeValue: number | string | null;
  ticketsTotal: number | null;
  ticketsSold: number | null;
  endsAt: string | null;
  sourceUrl: string | null;
  operator: {
    id: string;
    name: string;
  } | null;
};

const inputClass =
  "w-full rounded-xl border border-transparent bg-rr-elevated text-sm text-rr-primary outline-none transition placeholder:text-rr-muted caret-rr-primary focus-visible:border-rr-green focus-visible:ring-2 focus-visible:ring-rr-green/20";
const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const londonDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  dateStyle: "short",
  timeStyle: "short",
});

function formatMoney(value: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return moneyFormatter.format(numericValue);
}

function formatEndsAt(value: string | null) {
  if (!value) {
    return "—";
  }

  return londonDateTimeFormatter.format(new Date(value));
}

function readMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const message = record.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

function updateCompetitionRow(
  items: CompetitionAdminRecord[],
  id: string,
  changes: Partial<CompetitionAdminRecord>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...changes } : item));
}

export function CompetitionAdmin() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CompetitionAdminRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [savingCategoryIds, setSavingCategoryIds] = useState<Record<string, boolean>>({});

  const canSearch = query.trim().length >= 2;

  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        const response = await fetch("/api/admin/competitions/categories", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          return;
        }

        if (!response.ok) {
          return;
        }

        const payload = await parseJsonResponse<unknown>(response);

        if (!aborted && Array.isArray(payload) && payload.every((v) => typeof v === "string")) {
          setCategories(payload as string[]);
        }
      } catch {
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  const runSearch = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    setIsLoading(true);
    setLoadError("");
    setHasSearched(true);
    setRowErrors({});

    try {
      const searchParams = new URLSearchParams({
        q: trimmedQuery,
        limit: "25",
      });
      const response = await fetch(
        `/api/admin/competitions/search?${searchParams.toString()}`,
        {
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      if (response.status === 401 || response.status === 403) {
        setIsHidden(true);
        setItems([]);
        setLoadError("");
        return;
      }

      let payload: unknown = null;

      try {
        payload = await parseJsonResponse<unknown>(response);
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setItems([]);
        setLoadError(readMessage(payload, "Request failed."));
        return;
      }

      setItems(Array.isArray(payload) ? (payload as CompetitionAdminRecord[]) : []);
    } catch {
      setItems([]);
      setLoadError("Request failed.");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = useCallback(
    async (event) => {
      event.preventDefault();
      await runSearch();
    },
    [runSearch],
  );

  const toggleCompetition = useCallback(
    async (id: string, nextHiddenValue: boolean) => {
      const previousItem = items.find((item) => item.id === id);

      if (!previousItem) {
        return;
      }

      setTogglingIds((current) => ({ ...current, [id]: true }));
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setItems((current) => updateCompetitionRow(current, id, { isHidden: nextHiddenValue }));

      try {
        const response = await fetch(`/api/admin/competitions/${encodeURIComponent(id)}`, {
          method: "PATCH",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ isHidden: nextHiddenValue }),
        });

        if (response.status === 401 || response.status === 403) {
          setIsHidden(true);
          setItems([]);
          setLoadError("");
          return;
        }

        let payload: unknown = null;

        try {
          payload = await parseJsonResponse<unknown>(response);
        } catch {
          payload = null;
        }

        if (payload && typeof payload === "object" && "isHidden" in payload) {
          const nextIsHidden = payload.isHidden;

          if (typeof nextIsHidden === "boolean") {
            setItems((current) => updateCompetitionRow(current, id, { isHidden: nextIsHidden }));
          }
        }

        if (!response.ok) {
          setItems((current) =>
            updateCompetitionRow(current, id, { isHidden: previousItem.isHidden }),
          );
          setRowErrors((current) => ({
            ...current,
            [id]: readMessage(payload, "Request failed."),
          }));
        }
      } catch {
        setItems((current) =>
          updateCompetitionRow(current, id, { isHidden: previousItem.isHidden }),
        );
        setRowErrors((current) => ({
          ...current,
          [id]: "Request failed.",
        }));
      } finally {
        setTogglingIds((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    },
    [items],
  );

  const updateCategory = useCallback(
    async (id: string, nextCategory: string | null) => {
      const previousItem = items.find((item) => item.id === id);

      if (!previousItem) {
        return;
      }

      setSavingCategoryIds((current) => ({ ...current, [id]: true }));
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setItems((current) =>
        updateCompetitionRow(current, id, {
          category: nextCategory,
          categoryOverride: true,
        }),
      );

      try {
        const response = await fetch(`/api/admin/competitions/${encodeURIComponent(id)}`, {
          method: "PATCH",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ category: nextCategory }),
        });

        if (response.status === 401 || response.status === 403) {
          setIsHidden(true);
          setItems([]);
          setLoadError("");
          return;
        }

        let payload: unknown = null;

        try {
          payload = await parseJsonResponse<unknown>(response);
        } catch {
          payload = null;
        }

        if (payload && typeof payload === "object") {
          const responseCategory =
            "category" in payload ? (payload as { category: unknown }).category : undefined;
          const responseOverride =
            "categoryOverride" in payload
              ? (payload as { categoryOverride: unknown }).categoryOverride
              : undefined;

          const nextState: Partial<CompetitionAdminRecord> = {};

          if (responseCategory === null || typeof responseCategory === "string") {
            nextState.category = responseCategory;
          }

          if (typeof responseOverride === "boolean") {
            nextState.categoryOverride = responseOverride;
          }

          if (Object.keys(nextState).length > 0) {
            setItems((current) => updateCompetitionRow(current, id, nextState));
          }
        }

        if (!response.ok) {
          setItems((current) =>
            updateCompetitionRow(current, id, {
              category: previousItem.category,
              categoryOverride: previousItem.categoryOverride,
            }),
          );
          setRowErrors((current) => ({
            ...current,
            [id]: readMessage(payload, "Request failed."),
          }));
        }
      } catch {
        setItems((current) =>
          updateCompetitionRow(current, id, {
            category: previousItem.category,
            categoryOverride: previousItem.categoryOverride,
          }),
        );
        setRowErrors((current) => ({
          ...current,
          [id]: "Request failed.",
        }));
      } finally {
        setSavingCategoryIds((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    },
    [items],
  );

  const hasResults = items.length > 0;
  const tableRows = useMemo(() => items, [items]);

  if (isHidden) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competition prize"
          className={cn(inputClass, "h-11 px-4")}
        />
        <Button
          type="submit"
          disabled={isLoading || !canSearch}
          className="w-full justify-center sm:w-auto"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {hasSearched ? (
        <p className="mt-4 text-sm text-rr-secondary">
          Hiding a competition removes it from the site immediately. It stays listed here so you
          can restore it. Changing category takes effect immediately and locks the row against
          automatic recategorisation; new competitions are still categorised automatically.
        </p>
      ) : null}

      {loadError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      ) : null}

      {!loadError && hasSearched && !hasResults && !isLoading ? (
        <div className="mt-4 text-sm text-rr-secondary">No competitions found.</div>
      ) : null}

      {!loadError && hasResults ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {tableRows.map((item) => {
            const isToggling = Boolean(togglingIds[item.id]);
            const isSavingCategory = Boolean(savingCategoryIds[item.id]);
            const rowError = rowErrors[item.id];
            const categoryDisabled = isSavingCategory || categories.length === 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-rr-surface p-4 transition",
                  item.isHidden ? "border-rr-border opacity-70" : "border-rr-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/competitions/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words text-base font-medium leading-snug text-rr-green underline underline-offset-4"
                  >
                    {item.prize}
                  </Link>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.categoryOverride === true ? (
                      <span className="shrink-0 rounded-full border border-rr-green/40 bg-rr-green-bg px-2 py-0.5 text-[11px] font-medium leading-5 text-rr-green">
                        Overridden
                      </span>
                    ) : null}
                    {item.isHidden === true ? (
                      <span className="shrink-0 rounded-full border border-rr-border bg-rr-elevated px-2 py-0.5 text-[11px] font-medium leading-5 text-rr-secondary">
                        Hidden
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mt-1 text-sm text-rr-secondary">{item.operator?.name ?? "—"}</p>

                <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-rr-elevated px-3 py-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-rr-secondary">
                      Ticket
                    </dt>
                    <dd className="mt-0.5 truncate text-sm text-rr-primary">
                      {formatMoney(item.ticketPrice)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-rr-secondary">
                      Prize value
                    </dt>
                    <dd className="mt-0.5 truncate text-sm text-rr-primary">
                      {formatMoney(item.prizeValue)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-rr-secondary">
                      Ends
                    </dt>
                    <dd className="mt-0.5 text-sm text-rr-primary">{formatEndsAt(item.endsAt)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-rr-secondary">
                      Category
                    </span>
                    <select
                      disabled={categoryDisabled}
                      value={item.category ?? ""}
                      onChange={(event) => {
                        const raw = event.target.value;
                        const next = raw === "" ? null : raw;
                        void updateCategory(item.id, next);
                      }}
                      className={cn(
                        inputClass,
                        "h-10 min-w-0 border-rr-border px-3 sm:max-w-[220px]",
                        categoryDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                      )}
                    >
                      <option value="">Uncategorised</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={!item.isHidden}
                    disabled={isToggling}
                    onClick={() => void toggleCompetition(item.id, !item.isHidden)}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center justify-between gap-3 rounded-full border border-rr-border bg-rr-surface px-3 text-sm font-medium transition",
                      item.isHidden ? "text-rr-secondary" : "text-rr-primary",
                      isToggling ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-rr-elevated",
                    )}
                  >
                    <span
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition",
                        !item.isHidden ? "bg-rr-green" : "bg-rr-border",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                          !item.isHidden ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </span>
                    <span>{isToggling ? "Updating..." : !item.isHidden ? "Visible" : "Hidden"}</span>
                  </button>
                </div>

                {rowError ? (
                  <span className="mt-3 text-sm text-red-700 dark:text-red-300">{rowError}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
