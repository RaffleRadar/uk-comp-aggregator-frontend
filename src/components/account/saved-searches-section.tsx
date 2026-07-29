"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type SavedSearchFilters = Partial<{
  website: string;
  operator: string;
  category: string;
  closing: string;
  minTicketPrice: number;
  maxTicketPrice: number;
  minPrizeValue: number;
  cashAlternative: boolean;
  instantPrizes: boolean;
  excludeInstant: boolean;
  excludeFree: boolean;
  excludeGames: boolean;
  freeOnly: boolean;
  search: string;
  sortBy: string;
  sortOrder: string;
}>;

type SavedSearchRecord = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  alertsEnabled: boolean;
  createdAt: string;
  lastSentAt: string | null;
};

const cardClass = "rounded-2xl border border-rr-border bg-rr-surface p-6";
const titleClass = "mb-1 text-base font-medium text-rr-primary";
const subtitleClass = "text-sm text-rr-secondary";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value);
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCategory(value: string) {
  if (value === "none" || value === "uncategorised") {
    return "Uncategorised";
  }

  if (value === "other") {
    return "Other";
  }

  return titleCase(value);
}

function formatClosing(value: string) {
  if (value === "today") {
    return "ending today";
  }

  if (value === "3days") {
    return "ending within 3 days";
  }

  if (value === "5days") {
    return "ending within 5 days";
  }

  return `closing ${titleCase(value)}`;
}

function buildFiltersSummary(filters: SavedSearchFilters) {
  const parts: string[] = [];

  if (typeof filters.search === "string" && filters.search.trim()) {
    parts.push(`Search: ${filters.search.trim()}`);
  }

  if (typeof filters.category === "string" && filters.category.trim()) {
    const categories = filters.category
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(formatCategory);

    if (categories.length > 0) {
      parts.push(categories.join(", "));
    }
  }

  if (typeof filters.operator === "string" && filters.operator.trim()) {
    parts.push(`Operator: ${filters.operator.trim()}`);
  }

  if (typeof filters.website === "string" && filters.website.trim()) {
    parts.push(`Website: ${filters.website.trim()}`);
  }

  if (typeof filters.closing === "string" && filters.closing.trim()) {
    parts.push(formatClosing(filters.closing.trim()));
  }

  if (typeof filters.minTicketPrice === "number") {
    parts.push(`from ${formatCurrency(filters.minTicketPrice)}`);
  }

  if (typeof filters.maxTicketPrice === "number") {
    parts.push(`under ${formatCurrency(filters.maxTicketPrice)}`);
  }

  if (typeof filters.minPrizeValue === "number") {
    parts.push(`prize from ${formatCurrency(filters.minPrizeValue)}`);
  }

  if (filters.cashAlternative === true) {
    parts.push("cash alternative");
  }

  if (filters.instantPrizes === true) {
    parts.push("instant prizes");
  }

  if (filters.excludeInstant === true) {
    parts.push("exclude instant prizes");
  }

  if (filters.excludeFree === true) {
    parts.push("exclude free entries");
  }

  if (filters.excludeGames === true) {
    parts.push("exclude games");
  }

  if (filters.freeOnly === true) {
    parts.push("free only");
  }

  if (typeof filters.sortBy === "string" && filters.sortBy.trim()) {
    const sortLabel =
      filters.sortOrder === "desc"
        ? `${titleCase(filters.sortBy.trim())} descending`
        : `${titleCase(filters.sortBy.trim())} ascending`;

    parts.push(sortLabel);
  }

  return parts.length > 0 ? parts.join(", ") : "All active filters";
}

function formatLastSentAt(value: string | null) {
  if (!value) {
    return "No alert sent yet";
  }

  return `Last alert sent ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))}`;
}

async function savedSearchRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = `HTTP ${response.status}`;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: string };
        message = parsed.message ?? message;
      } catch {
        message = raw;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function SavedSearchesSection() {
  const [items, setItems] = useState<SavedSearchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const itemsRef = useRef<SavedSearchRecord[]>([]);
  const inFlightIdsRef = useRef(new Set<string>());
  const deletingIdsRef = useRef(new Set<string>());
  const [inFlightIds, setInFlightIds] = useState<Set<string>>(() => new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await savedSearchRequest<SavedSearchRecord[]>("/api/saved-searches");

        if (!cancelled) {
          setItems(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setLoadError(getErrorMessage(error, "Failed to load saved searches."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        summary: buildFiltersSummary(item.filters),
        lastSentLabel: formatLastSentAt(item.lastSentAt),
        isToggling: inFlightIds.has(item.id),
        isDeleting: deletingIds.has(item.id),
      })),
    [deletingIds, inFlightIds, items],
  );

  async function handleToggle(id: string, nextAlertsEnabled: boolean) {
    if (inFlightIdsRef.current.has(id) || deletingIdsRef.current.has(id)) {
      return;
    }

    setActionError("");
    const previousItems = itemsRef.current;
    const nextItems = previousItems.map((item) =>
      item.id === id ? { ...item, alertsEnabled: nextAlertsEnabled } : item,
    );

    inFlightIdsRef.current.add(id);
    setInFlightIds(new Set(inFlightIdsRef.current));
    itemsRef.current = nextItems;
    setItems(nextItems);

    try {
      await savedSearchRequest<SavedSearchRecord>(`/api/saved-searches/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertsEnabled: nextAlertsEnabled }),
      });
    } catch {
      itemsRef.current = previousItems;
      setItems(previousItems);
      setActionError("We could not update this alert right now. Please try again.");
    } finally {
      inFlightIdsRef.current.delete(id);
      setInFlightIds(new Set(inFlightIdsRef.current));
    }
  }

  async function handleDelete(id: string) {
    if (deletingIdsRef.current.has(id) || inFlightIdsRef.current.has(id)) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this saved search? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    deletingIdsRef.current.add(id);
    setDeletingIds(new Set(deletingIdsRef.current));

    try {
      await savedSearchRequest<{ message: string }>(
        `/api/saved-searches/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      const nextItems = itemsRef.current.filter((item) => item.id !== id);
      itemsRef.current = nextItems;
      setItems(nextItems);
    } catch {
      setActionError("We could not delete this saved search right now. Please try again.");
    } finally {
      deletingIdsRef.current.delete(id);
      setDeletingIds(new Set(deletingIdsRef.current));
    }
  }

  if (isLoading) {
    return (
      <section className={cardClass}>
        <h3 className={titleClass}>Saved searches</h3>
        <p className={subtitleClass}>Loading your saved searches...</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className={cardClass}>
        <h3 className={titleClass}>Saved searches</h3>
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className={cardClass}>
        <h3 className={titleClass}>Saved searches</h3>
        <p className={subtitleClass}>
          Save a search from the competitions page and we will email you when
          something new matches it.
        </p>
        <div className="mt-4">
          <Link
            href="/competitions"
            className="text-sm font-medium text-rr-green underline underline-offset-4"
          >
            Go to competitions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <h3 className={titleClass}>Saved searches</h3>
      <p className={subtitleClass}>
        Manage the searches that can send you a daily alert digest.
      </p>

      {actionError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {actionError}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {rows.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-rr-border bg-rr-elevated p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-medium text-rr-primary">
                  {item.name}
                </h4>
                <p className="mt-1 text-sm leading-6 text-rr-secondary">
                  {item.summary}
                </p>
                <p className="mt-2 text-sm text-rr-secondary">
                  {item.lastSentLabel}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[220px] sm:items-end">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.alertsEnabled}
                  disabled={item.isToggling || item.isDeleting}
                  onClick={() => void handleToggle(item.id, !item.alertsEnabled)}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-full border border-rr-border px-3 py-2 text-sm font-medium transition",
                    item.alertsEnabled
                      ? "bg-rr-surface text-rr-primary"
                      : "bg-rr-surface text-rr-secondary",
                    item.isToggling || item.isDeleting
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-rr-surface/80",
                  )}
                >
                  <span
                    className={cn(
                      "relative h-6 w-11 rounded-full transition",
                      item.alertsEnabled ? "bg-rr-green" : "bg-rr-border",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                        item.alertsEnabled ? "left-[22px]" : "left-0.5",
                      )}
                    />
                  </span>
                  <span>
                    {item.isToggling
                      ? "Updating..."
                      : item.alertsEnabled
                        ? "Alerts on"
                        : "Alerts off"}
                  </span>
                </button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={item.isDeleting || item.isToggling}
                  onClick={() => void handleDelete(item.id)}
                  className="w-full justify-center sm:w-auto"
                >
                  {item.isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
