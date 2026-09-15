"use client";

import { Button } from "@/components/ui/button";
import { useNewsletter } from "@/contexts/newsletter-context";
import { protectedFetch } from "@/lib/protected-fetch";

export function NewsletterBanner() {
  const { state, isLoading, error, refetch } = useNewsletter();

  if (isLoading || state === null) {
    return null;
  }

  if (state === "subscribed" || state === "pending") {
    return null;
  }

  async function handleSubscribe() {
    try {
      const response = await protectedFetch("/api/newsletter/me/subscribe", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      refetch();
    } catch {
      // Error handling is done via context
    }
  }

  return (
    <div className="rounded-2xl border border-rr-border bg-rr-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-1 text-base font-medium text-rr-primary">
            Weekly newsletter
          </h3>
          <p className="text-sm text-rr-secondary">
            Get the most undersold competitions every Friday.
          </p>
          {error ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">
          <Button onClick={handleSubscribe}>
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
