"use client";

import Link from "next/link";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type CompetitionAdminRecord = {
  id: string;
  prize: string;
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

  const canSearch = query.trim().length >= 2;

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
          can restore it.
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
        <div className="mt-4 rounded-2xl border border-rr-border">
          <table className="w-full text-sm">
            <thead className="hidden bg-rr-elevated md:table-header-group">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Prize</th>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Operator</th>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Ticket price</th>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Prize value</th>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Ends</th>
                <th className="px-4 py-3 text-left font-medium text-rr-primary">Visible</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-rr-border md:table-row-group md:divide-y-0">
              {tableRows.map((item) => {
                const isToggling = Boolean(togglingIds[item.id]);
                const rowError = rowErrors[item.id];

                return (
                  <tr key={item.id} className="block px-4 py-4 md:table-row md:border-t md:border-rr-border md:p-0 md:align-top">
                    <td className="block pb-3 text-base font-medium text-rr-primary md:table-cell md:px-4 md:py-3 md:text-sm md:font-normal">
                      <Link href={`/competitions/${item.id}`} target="_blank" rel="noreferrer" className="break-words text-rr-green underline underline-offset-4">
                        {item.prize}
                      </Link>
                    </td>
                    <td data-label="Operator" className="flex items-center justify-between gap-4 py-2 text-rr-secondary md:table-cell md:px-4 md:py-3 before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden"><span className="text-right md:text-left">{item.operator?.name ?? "—"}</span></td>
                    <td data-label="Ticket price" className="flex items-center justify-between gap-4 py-2 text-rr-primary md:table-cell md:px-4 md:py-3 md:whitespace-nowrap before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden"><span className="text-right md:text-left">{formatMoney(item.ticketPrice)}</span></td>
                    <td data-label="Prize value" className="flex items-center justify-between gap-4 py-2 text-rr-primary md:table-cell md:px-4 md:py-3 md:whitespace-nowrap before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden"><span className="text-right md:text-left">{formatMoney(item.prizeValue)}</span></td>
                    <td data-label="Ends" className="flex items-center justify-between gap-4 py-2 text-rr-secondary md:table-cell md:px-4 md:py-3 md:whitespace-nowrap before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden"><span className="text-right md:text-left">{formatEndsAt(item.endsAt)}</span></td>
                    <td className="block pt-3 text-rr-primary md:table-cell md:px-4 md:py-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-rr-secondary md:hidden">Visible</div>
                      <div className="flex flex-col gap-3">
                        <button type="button" role="switch" aria-checked={!item.isHidden} disabled={isToggling} onClick={() => void toggleCompetition(item.id, !item.isHidden)} className={cn("inline-flex w-full items-center justify-between gap-3 rounded-full border border-rr-border px-3 py-2 text-sm font-medium transition md:w-fit md:justify-start", !item.isHidden ? "bg-rr-surface text-rr-primary" : "bg-rr-surface text-rr-secondary", isToggling ? "cursor-not-allowed opacity-60" : "hover:bg-rr-surface/80")}>
                          <span className={cn("relative h-6 w-11 rounded-full transition", !item.isHidden ? "bg-rr-green" : "bg-rr-border")}>
                            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition", !item.isHidden ? "left-[22px]" : "left-0.5")} />
                          </span>
                          <span>{isToggling ? "Updating..." : !item.isHidden ? "Visible" : "Hidden"}</span>
                        </button>
                        {rowError ? <span className="text-sm text-red-700 dark:text-red-300">{rowError}</span> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
