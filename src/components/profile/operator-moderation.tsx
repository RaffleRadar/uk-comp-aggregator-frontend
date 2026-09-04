"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type OperatorRecord = {
  id: string;
  name: string;
  slug: string | null;
  isHidden: boolean;
  baseUrl: string;
  competitionCount: number;
  defaultCategory: string | null;
};

type LoadResult =
  | { kind: "hidden" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: OperatorRecord[] };

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

export function OperatorModeration() {
  const [items, setItems] = useState<OperatorRecord[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [savingCategoryIds, setSavingCategoryIds] = useState<
    Record<string, boolean>
  >({});

  const requestOperators = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch("/api/admin/operators", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        return { kind: "hidden" };
      }

      if (!response.ok) {
        let message = "Failed to load operators.";

        try {
          const payload = await parseJsonResponse<unknown>(response);
          message = readMessage(payload, message);
        } catch {
          message = "Failed to load operators.";
        }

        return { kind: "error", message };
      }

      const payload = await parseJsonResponse<OperatorRecord[]>(response);

      return {
        kind: "ready",
        items: Array.isArray(payload) ? payload : [],
      };
    } catch {
      return {
        kind: "error",
        message: "Failed to load operators.",
      };
    }
  }, []);

  const loadOperators = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const result = await requestOperators();

    if (result.kind === "hidden") {
      setIsHidden(true);
      setItems([]);
      setLoadError("");
      setIsResolved(true);
      setIsLoading(false);
      return;
    }

    if (result.kind === "error") {
      setIsHidden(false);
      setItems([]);
      setLoadError(result.message);
      setIsResolved(true);
      setIsLoading(false);
      return;
    }

    setIsHidden(false);
    setItems(result.items);
    setLoadError("");
    setIsResolved(true);
    setIsLoading(false);
  }, [requestOperators]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const result = await requestOperators();

      if (!cancelled) {
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
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [requestOperators]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/admin/competitions/categories", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = await parseJsonResponse<string[]>(response);

        if (!cancelled && Array.isArray(payload)) {
          setCategories(payload);
        }
      } catch {
        // categories are optional, the selector simply stays empty
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateDefaultCategory = useCallback(
    async (id: string, nextCategory: string) => {
      const previous = items.find((item) => item.id === id);

      if (!previous) {
        return;
      }

      const value = nextCategory === "" ? null : nextCategory;

      setSavingCategoryIds((current) => ({ ...current, [id]: true }));
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, defaultCategory: value } : item,
        ),
      );

      try {
        const response = await fetch(
          `/api/admin/operators/${encodeURIComponent(id)}/default-category`,
          {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ defaultCategory: value }),
          },
        );

        if (!response.ok) {
          let message = "Failed to save the default category.";

          try {
            const payload = await parseJsonResponse<unknown>(response);
            message = readMessage(payload, message);
          } catch {
            message = "Failed to save the default category.";
          }

          setItems((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, defaultCategory: previous.defaultCategory }
                : item,
            ),
          );
          setRowErrors((current) => ({ ...current, [id]: message }));
        }
      } catch {
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, defaultCategory: previous.defaultCategory }
              : item,
          ),
        );
        setRowErrors((current) => ({
          ...current,
          [id]: "Failed to save the default category.",
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

  const toggleOperator = useCallback(
    async (id: string, nextHidden: boolean) => {
      const previous = items.find((item) => item.id === id);

      if (!previous) {
        return;
      }

      if (nextHidden) {
        const confirmed = window.confirm(
          "Hide this operator? All of its competitions will disappear from the site.",
        );
        if (!confirmed) {
          return;
        }
      }

      setTogglingIds((current) => ({ ...current, [id]: true }));
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, isHidden: nextHidden } : item,
        ),
      );

      try {
        const response = await fetch(
          `/api/admin/operators/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ isHidden: nextHidden }),
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

        if (
          payload &&
          typeof payload === "object" &&
          "isHidden" in payload &&
          typeof (payload as Record<string, unknown>).isHidden === "boolean"
        ) {
          const confirmed = (payload as Record<string, unknown>)
            .isHidden as boolean;
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, isHidden: confirmed } : item,
            ),
          );
        }

        if (!response.ok) {
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, isHidden: previous.isHidden } : item,
            ),
          );
          setRowErrors((current) => ({
            ...current,
            [id]: readMessage(payload, "Failed to update operator."),
          }));
        }
      } catch {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, isHidden: previous.isHidden } : item,
          ),
        );
        setRowErrors((current) => ({
          ...current,
          [id]: "Failed to update operator.",
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

  if (isHidden || !isResolved) {
    return null;
  }

  return (
    <div>
      {isLoading ? (
        <div className="mt-6 rounded-xl border border-rr-border bg-rr-elevated p-4 text-sm text-rr-secondary">
          Loading operators…
        </div>
      ) : loadError ? (
        <div className="mt-6">
          <p role="alert" className="text-sm text-rr-primary">
            {loadError}
          </p>
          <Button
            type="button"
            onClick={() => void loadOperators()}
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-rr-secondary">No operators yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const isToggling = Boolean(togglingIds[item.id]);
            const isSavingCategory = Boolean(savingCategoryIds[item.id]);
            const rowError = rowErrors[item.id];
            return (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl border border-rr-border bg-rr-bg p-4 md:p-5",
                  item.isHidden && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-rr-primary">
                    {item.name}
                  </span>
                  {item.isHidden ? (
                    <span className="inline-flex items-center rounded-full bg-rr-elevated px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-rr-muted">
                  {item.competitionCount} active competitions
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`default-category-${item.id}`}
                    className="text-xs text-rr-secondary"
                  >
                    Default category
                  </label>
                  <select
                    id={`default-category-${item.id}`}
                    value={item.defaultCategory ?? ""}
                    disabled={isSavingCategory || categories.length === 0}
                    onChange={(event) =>
                      void updateDefaultCategory(item.id, event.target.value)
                    }
                    className="rounded-lg border border-rr-border bg-rr-elevated px-2 py-1 text-xs text-rr-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">None</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-rr-muted">
                    Used only when the prize title gives no category
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 text-xs text-rr-secondary">
                    <a
                      href={item.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-rr-secondary hover:text-rr-primary hover:underline"
                    >
                      {item.baseUrl}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    {rowError ? (
                      <span className="text-xs text-rr-danger">{rowError}</span>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isToggling}
                      onClick={() =>
                        void toggleOperator(item.id, !item.isHidden)
                      }
                      className="min-w-[72px] justify-center disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {item.isHidden ? "Show" : "Hide"}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
