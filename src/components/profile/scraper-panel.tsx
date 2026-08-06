"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ScraperRecord = {
  id: string;
  name: string;
  lastScrapedAt: string | null;
  scraperStatus: string | null;
};

type RunMessage = {
  tone: "success" | "error";
  text: string;
};

type LoadResult =
  | { kind: "hidden" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: ScraperRecord[] };

const londonDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  dateStyle: "short",
  timeStyle: "short",
});

function updateScraperRow(
  items: ScraperRecord[],
  id: string,
  changes: Partial<Pick<ScraperRecord, "scraperStatus" | "lastScrapedAt">>,
) {
  return items.map((item) =>
    item.id === id ? { ...item, ...changes } : item,
  );
}

function RunningSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-rr-on-accent/30 border-t-rr-on-accent"
    />
  );
}

function getStatusClass(status: string | null) {
  if (status === "ok") {
    return "text-rr-green";
  }

  if (status === "error") {
    return "text-red-700 dark:text-red-300";
  }

  if (status === "running") {
    return "text-amber-900 dark:text-amber-100";
  }

  return "text-rr-secondary";
}

function formatLastScraped(value: string | null) {
  if (!value) {
    return "Never";
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

function isRunSuccess(value: unknown): value is { status: "ok"; scraped: number; saved: number } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.status === "ok" &&
    typeof record.scraped === "number" &&
    typeof record.saved === "number"
  );
}

function isRunError(value: unknown): value is { status: "error"; message: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.status === "error" && typeof record.message === "string";
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export function ScraperPanel() {
  const [items, setItems] = useState<ScraperRecord[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [runningIds, setRunningIds] = useState<Record<string, boolean>>({});
  const [runMessages, setRunMessages] = useState<Record<string, RunMessage>>({});

  const applyLoadResult = useCallback((result: LoadResult) => {
    if (result.kind === "hidden") {
      setIsHidden(true);
      setItems([]);
      setLoadError("");
      setIsResolved(true);
      return;
    }

    if (result.kind === "error") {
      setIsHidden(false);
      setItems([]);
      setLoadError(result.message);
      setIsResolved(true);
      return;
    }

    setIsHidden(false);
    setItems(result.items);
    setLoadError("");
    setIsResolved(true);
  }, []);

  const requestScrapers = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch("/api/admin/scrapers", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        return { kind: "hidden" };
      }

      if (!response.ok) {
        let message = "Failed to load scrapers.";

        try {
          const payload = await parseJsonResponse<unknown>(response);
          message = readMessage(payload, message);
        } catch {
          message = "Failed to load scrapers.";
        }

        return { kind: "error", message };
      }

      const payload = await parseJsonResponse<ScraperRecord[]>(response);

      return {
        kind: "ready",
        items: Array.isArray(payload) ? payload : [],
      };
    } catch {
      return {
        kind: "error",
        message: "Failed to load scrapers.",
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialScrapers() {
      const result = await requestScrapers();

      if (!cancelled) {
        applyLoadResult(result);
      }
    }

    void loadInitialScrapers();

    return () => {
      cancelled = true;
    };
  }, [applyLoadResult, requestScrapers]);

  const anyRunning = useMemo(
    () => Object.values(runningIds).some(Boolean),
    [runningIds],
  );

  const runScraper = useCallback(
    async (id: string) => {
      setRunningIds((current) => ({ ...current, [id]: true }));
      setItems((current) => updateScraperRow(current, id, { scraperStatus: "running" }));
      setRunMessages((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      try {
        const response = await fetch(`/api/admin/scrapers/${encodeURIComponent(id)}/run`, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
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

        if (!response.ok) {
          setItems((current) => updateScraperRow(current, id, { scraperStatus: "error" }));
          setRunMessages((current) => ({
            ...current,
            [id]: {
              tone: "error",
              text: readMessage(payload, `HTTP ${response.status}`),
            },
          }));
          return;
        }

        if (isRunSuccess(payload)) {
          setItems((current) =>
            updateScraperRow(current, id, {
              scraperStatus: "ok",
              lastScrapedAt: new Date().toISOString(),
            }),
          );
          setRunMessages((current) => ({
            ...current,
            [id]: {
              tone: "success",
              text: `Scraped ${payload.scraped}, saved ${payload.saved}`,
            },
          }));
          return;
        }

        if (isRunError(payload)) {
          setItems((current) => updateScraperRow(current, id, { scraperStatus: "error" }));
          setRunMessages((current) => ({
            ...current,
            [id]: {
              tone: "error",
              text: payload.message,
            },
          }));
          return;
        }

        setItems((current) => updateScraperRow(current, id, { scraperStatus: "error" }));
        setRunMessages((current) => ({
          ...current,
          [id]: {
            tone: "error",
            text: "Unexpected response from server.",
          },
        }));
      } catch {
        setRunMessages((current) => ({
          ...current,
          [id]: {
            tone: "error",
            text: "Request failed — the run may still be in progress. Refresh in a minute.",
          },
        }));
      } finally {
        setRunningIds((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });

        const refreshResult = await requestScrapers();

        if (refreshResult.kind !== "error") {
          applyLoadResult(refreshResult);
        }
      }
    },
    [applyLoadResult, requestScrapers],
  );

  if (isHidden || !isResolved) {
    return null;
  }

  if (loadError) {
    return (
      <div>
        <p role="alert" className="text-sm text-rr-primary">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div>
      {anyRunning ? (
        <p className="text-sm text-rr-secondary">
          A run can take up to three minutes. You can leave this page — it will keep going.
        </p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-rr-border">
        <table className="w-full text-sm">
          <thead className="hidden bg-rr-elevated md:table-header-group">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-rr-primary">Operator name</th>
              <th className="px-4 py-3 text-left font-medium text-rr-primary">Last scraped</th>
              <th className="px-4 py-3 text-left font-medium text-rr-primary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-rr-primary">Action</th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-rr-border md:table-row-group md:divide-y-0">
            {items.map((item) => {
              const isRunning = Boolean(runningIds[item.id]);
              const runMessage = runMessages[item.id];

              return (
                <tr key={item.id} className="block px-4 py-4 md:table-row md:border-t md:border-rr-border md:p-0">
                  <td className="block pb-3 text-base font-medium text-rr-primary md:table-cell md:px-4 md:py-3 md:text-sm md:font-normal">
                    <div className="min-w-0 break-words md:truncate">{item.name}</div>
                  </td>
                  <td data-label="Last scraped" className="flex items-center justify-between gap-4 py-2 text-rr-secondary md:table-cell md:px-4 md:py-3 md:whitespace-nowrap before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden">
                    <span className="text-right md:text-left">{formatLastScraped(item.lastScrapedAt)}</span>
                  </td>
                  <td data-label="Status" className={cn("flex items-center justify-between gap-4 py-2 md:table-cell md:px-4 md:py-3 md:whitespace-nowrap before:text-xs before:font-medium before:uppercase before:tracking-wide before:text-rr-secondary before:content-[attr(data-label)] md:before:hidden", getStatusClass(item.scraperStatus))}>
                    <span className="text-right md:text-left">{item.scraperStatus ?? "—"}</span>
                  </td>
                  <td className="block pt-3 text-rr-primary md:table-cell md:px-4 md:py-3">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-rr-secondary md:hidden">Action</div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <Button type="button" onClick={() => void runScraper(item.id)} disabled={isRunning} className="w-full justify-center md:w-[88px] disabled:cursor-not-allowed disabled:opacity-60">
                        {isRunning ? <RunningSpinner /> : null}
                        Run
                      </Button>
                      {runMessage ? <span className={cn("text-sm", runMessage.tone === "error" ? "text-red-700 dark:text-red-300" : "text-rr-secondary")}>{runMessage.text}</span> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
