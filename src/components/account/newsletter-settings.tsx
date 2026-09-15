"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNewsletter } from "@/contexts/newsletter-context";
import { AuthClientError } from "@/lib/auth-client";
import { protectedFetch } from "@/lib/protected-fetch";

const cardClass = "rounded-2xl border border-rr-border bg-rr-surface p-6";
const titleClass = "mb-1 text-base font-medium text-rr-primary";
const subtitleClass = "text-sm text-rr-secondary";

type NewsletterState = "subscribed" | "pending" | "not_subscribed";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function newsletterRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await protectedFetch(`/api/newsletter${path}`, init);

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

    throw new AuthClientError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function NewsletterSettings() {
  const { refetch } = useNewsletter();
  const [state, setState] = useState<NewsletterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setActionError("");
      try {
        const response = await newsletterRequest<{ state: NewsletterState }>("/me");
        if (mounted) {
          setState(response.state);
        }
      } catch (error) {
        if (mounted) {
          if (error instanceof AuthClientError && error.status === 401) {
            setActionError("Please sign in to manage your subscription.");
          } else {
            setActionError(getErrorMessage(error, "Failed to load subscription state."));
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubscribe() {
    setIsActing(true);
    setActionError("");
    try {
      await newsletterRequest<{ state: NewsletterState }>("/me/subscribe", {
        method: "POST",
      });
      const response = await newsletterRequest<{ state: NewsletterState }>("/me");
      setState(response.state);
      refetch();
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to subscribe."));
    } finally {
      setIsActing(false);
    }
  }

  async function handleUnsubscribe() {
    setIsActing(true);
    setActionError("");
    try {
      await newsletterRequest<{ state: NewsletterState }>("/me/unsubscribe", {
        method: "POST",
      });
      const response = await newsletterRequest<{ state: NewsletterState }>("/me");
      setState(response.state);
      refetch();
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to unsubscribe."));
    } finally {
      setIsActing(false);
    }
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = <div className="text-sm text-rr-secondary">Loading...</div>;
  } else if (state === "subscribed") {
    content = (
      <div className="space-y-3">
        <p className="text-sm text-rr-secondary">
          You are subscribed to the weekly newsletter.
        </p>
        <div className="flex items-center justify-end">
          <Button
            variant="secondary"
            onClick={handleUnsubscribe}
            disabled={isActing}
          >
            {isActing ? "Processing..." : "Unsubscribe"}
          </Button>
        </div>
      </div>
    );
  } else if (state === "pending") {
    content = (
      <div className="space-y-3">
        <p className="text-sm text-rr-secondary">
          A confirmation email has been sent. Please click the link in the email to confirm your subscription.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-3">
        <p className="text-sm text-rr-secondary">
          Get a weekly email every Friday with the most undersold competitions.
        </p>
        <div className="flex items-center justify-end">
          <Button onClick={handleSubscribe} disabled={isActing}>
            {isActing ? "Processing..." : "Subscribe"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className={cardClass}>
      <h3 className={titleClass}>Newsletter</h3>
      <p className={subtitleClass}>Manage your newsletter subscription.</p>

      <div className="mt-4">
        {actionError ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
          >
            {actionError}
          </div>
        ) : null}
        {content}
      </div>
    </section>
  );
}
