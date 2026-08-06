"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type CommentRecord = {
  id: string;
  body: string;
  isHidden: boolean;
  createdAt: string;
  parentId: string | null;
  author: {
    id: string;
    displayName: string | null;
    email: string;
  };
  competition: {
    id: string;
    prize: string;
  } | null;
};

type FilterKind = "all" | "visible" | "hidden";

type LoadResult =
  | { kind: "hidden" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: CommentRecord[] };

const cardClass = "rounded-2xl border border-rr-border bg-rr-surface p-6";
const titleClass = "mb-1 text-base font-medium text-rr-primary";
const subtitleClass = "text-sm text-rr-secondary";

function formatTimestamp(value: string) {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true }).replace(
      "about ",
      "",
    );
  } catch {
    return "";
  }
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

function updateCommentRow(
  items: CommentRecord[],
  id: string,
  changes: Partial<Pick<CommentRecord, "isHidden">>,
) {
  return items.map((item) =>
    item.id === id ? { ...item, ...changes } : item,
  );
}

export function CommentModeration() {
  const [items, setItems] = useState<CommentRecord[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const requestComments = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch("/api/admin/comments", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        return { kind: "hidden" };
      }

      if (!response.ok) {
        let message = "Failed to load comments.";

        try {
          const payload = await parseJsonResponse<unknown>(response);
          message = readMessage(payload, message);
        } catch {
          message = "Failed to load comments.";
        }

        return { kind: "error", message };
      }

      const payload = await parseJsonResponse<CommentRecord[]>(response);

      return {
        kind: "ready",
        items: Array.isArray(payload) ? payload : [],
      };
    } catch {
      return {
        kind: "error",
        message: "Failed to load comments.",
      };
    }
  }, []);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const result = await requestComments();

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
  }, [requestComments]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const result = await requestComments();

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
  }, [requestComments]);

  const toggleComment = useCallback(
    async (id: string, nextHidden: boolean) => {
      const previous = items.find((item) => item.id === id);

      if (!previous) {
        return;
      }

      setTogglingIds((current) => ({ ...current, [id]: true }));
      setRowErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setItems((current) =>
        updateCommentRow(current, id, { isHidden: nextHidden }),
      );

      try {
        const response = await fetch(
          `/api/admin/comments/${encodeURIComponent(id)}`,
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
            updateCommentRow(current, id, { isHidden: confirmed }),
          );
        }

        if (!response.ok) {
          setItems((current) =>
            updateCommentRow(current, id, { isHidden: previous.isHidden }),
          );
          setRowErrors((current) => ({
            ...current,
            [id]: readMessage(payload, "Failed to update comment."),
          }));
        }
      } catch {
        setItems((current) =>
          updateCommentRow(current, id, { isHidden: previous.isHidden }),
        );
        setRowErrors((current) => ({
          ...current,
          [id]: "Failed to update comment.",
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

  const filtered = useMemo(() => {
    switch (filter) {
      case "visible":
        return items.filter((item) => !item.isHidden);
      case "hidden":
        return items.filter((item) => item.isHidden);
      default:
        return items;
    }
  }, [filter, items]);

  if (isHidden || !isResolved) {
    return null;
  }

  return (
    <section className={cardClass}>
      <h3 className={titleClass}>Comments</h3>
      <p className={subtitleClass}>
        Moderate user comments. Hide spam or offensive content; hiding is
        reversible.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "All" },
            { id: "visible", label: "Visible" },
            { id: "hidden", label: "Hidden" },
          ] as { id: FilterKind; label: string }[]
        ).map((option) => {
          const active = filter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={cn(
                "inline-flex items-center rounded-xl border px-3 py-1.5 text-sm transition",
                active
                  ? "border-rr-green bg-rr-elevated font-medium text-rr-primary"
                  : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-rr-border bg-rr-elevated p-4 text-sm text-rr-secondary">
          Loading comments…
        </div>
      ) : loadError ? (
        <div className="mt-6">
          <p role="alert" className="text-sm text-rr-primary">
            {loadError}
          </p>
          <Button
            type="button"
            onClick={() => void loadComments()}
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-rr-secondary">No comments yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((item) => {
            const isToggling = Boolean(togglingIds[item.id]);
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
                    {item.author.displayName ?? "Unknown"}
                  </span>
                  {item.parentId ? (
                    <span className="inline-flex items-center rounded-full border border-rr-border bg-rr-surface px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                      Reply
                    </span>
                  ) : null}
                  {item.isHidden ? (
                    <span className="inline-flex items-center rounded-full bg-rr-elevated px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-rr-muted">
                  {item.author.email}
                </p>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-rr-primary">
                  {item.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 text-xs text-rr-secondary">
                    <span className="break-words">
                      {item.competition ? (
                        <a
                          href={`/competitions/${item.competition.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words text-rr-secondary hover:text-rr-primary hover:underline"
                        >
                          {item.competition.prize}
                        </a>
                      ) : (
                        <span className="text-rr-muted">Not a competition</span>
                      )}
                    </span>
                    <span className="mx-1.5 text-rr-muted">·</span>
                    <span>{formatTimestamp(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {rowError ? (
                      <span className="text-xs text-rr-danger">
                        {rowError}
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isToggling}
                      onClick={() =>
                        void toggleComment(item.id, !item.isHidden)
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
    </section>
  );
}
