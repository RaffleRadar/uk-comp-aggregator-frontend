"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/cn";

type SavedSearchResponse = {
  id: string;
  name: string;
  filters: Record<string, string | number | boolean | null>;
  alertsEnabled: boolean;
  createdAt: string;
  lastSentAt: string | null;
};

type FeedbackState =
  | { type: "success"; message: string; hint: string }
  | { type: "info"; message: string }
  | { type: "error"; message: string };

const stringParams = [
  "website",
  "operator",
  "category",
  "closing",
  "search",
  "sortBy",
  "sortOrder",
] as const;

const numberParams = [
  "minTicketPrice",
  "maxTicketPrice",
  "minPrizeValue",
] as const;

const booleanParams = [
  "cashAlternative",
  "instantPrizes",
  "excludeInstant",
  "excludeFree",
  "excludeGames",
  "freeOnly",
] as const;

const nonMeaningfulOnlyParams = new Set(["sortBy", "sortOrder"]);

function parseSavedSearchParams(searchParams: URLSearchParams) {
  const payload: Record<string, string | number | boolean> = {};

  for (const key of stringParams) {
    const value = searchParams.get(key)?.trim();

    if (!value) {
      continue;
    }

    payload[key] = value;
  }

  for (const key of numberParams) {
    const value = searchParams.get(key)?.trim();

    if (!value) {
      continue;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      continue;
    }

    payload[key] = parsed;
  }

  for (const key of booleanParams) {
    const value = searchParams.get(key)?.trim();

    if (value !== "true" && value !== "false") {
      continue;
    }

    payload[key] = value === "true";
  }

  return payload;
}

function hasMeaningfulFilters(payload: Record<string, string | number | boolean>) {
  return Object.keys(payload).some((key) => !nonMeaningfulOnlyParams.has(key));
}

async function readResponseBody(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as { message?: string; name?: string };
  } catch {
    return null;
  }
}

export function SaveSearchButton() {
  const searchParams = useSearchParams();
  const { status } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const restoreFocusRef = useRef<HTMLButtonElement | null>(null);

  const payload = useMemo(
    () => parseSavedSearchParams(searchParams),
    [searchParams],
  );
  const canSave = useMemo(() => hasMeaningfulFilters(payload), [payload]);
  const isSignedIn = status === "authenticated";
  const isDisabled = !canSave;

  const closeSignInModal = useCallback(
    (options?: { restoreFocus?: boolean }) => {
      setIsSignInModalOpen(false);
      const shouldRestoreFocus = options?.restoreFocus !== false;
      const trigger = restoreFocusRef.current;
      restoreFocusRef.current = null;

      if (!shouldRestoreFocus || !trigger) {
        return;
      }

      window.setTimeout(() => {
        if (trigger.isConnected) {
          trigger.focus();
        }
      }, 0);
    },
    [],
  );

  const openSignInModal = useCallback((trigger: HTMLButtonElement | null) => {
    restoreFocusRef.current = trigger;
    setIsSignInModalOpen(true);
  }, []);

  async function handleSave() {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/saved-searches", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await readResponseBody(response);

      if (!response.ok) {
        if (response.status === 409) {
          setFeedback({
            type: "info",
            message: body?.message?.trim() || "You have already saved this search",
          });
          return;
        }

        const message =
          body?.message?.trim() ||
          (response.status === 400
            ? "This search needs at least one real filter before it can be saved."
            : "We could not save this search. Please try again.");

        setFeedback({
          type: "error",
          message,
        });
        return;
      }

      const savedSearch = body as SavedSearchResponse | null;
      const savedName = savedSearch?.name?.trim() || "this search";

      setFeedback({
        type: "success",
        message: `Saved as "${savedName}". We'll email you when something new matches.`,
        hint:
          "Alerts match the competition title, so if a make or model appears with different wording it is worth saving a search for each version.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "We could not save this search. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-rr-border bg-rr-surface p-2.5 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden space-y-1 sm:block">
            <p className="text-sm font-medium text-rr-primary">Search alerts</p>
            <p className="text-sm text-rr-secondary">
              Save the filters you have set and get one daily email when something new
              matches.
            </p>
          </div>

          <Button
            type="button"
            disabled={isDisabled || isSubmitting}
            className={cn(
              "w-full sm:w-auto",
              isDisabled
                ? "cursor-not-allowed opacity-60"
                : "",
            )}
            onClick={(event) => {
              if (!canSave || isSubmitting) {
                return;
              }

              if (!isSignedIn) {
                openSignInModal(event.currentTarget);
                return;
              }

              void handleSave();
            }}
          >
            {isSubmitting ? "Saving..." : "Save this search"}
          </Button>
        </div>

        {isSignedIn && !canSave ? (
          <p className="hidden text-sm text-rr-secondary sm:block">
            Set at least one real filter before saving this search.
          </p>
        ) : null}

        {feedback ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              feedback.type === "success"
                ? "border-rr-border bg-rr-elevated text-rr-primary"
                : feedback.type === "info"
                  ? "border-rr-border bg-rr-elevated text-rr-primary"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300",
            )}
          >
            <p>{feedback.message}</p>
            {feedback.type === "success" ? (
              <p className="mt-2 text-rr-secondary">{feedback.hint}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
    </div>
  );
}
