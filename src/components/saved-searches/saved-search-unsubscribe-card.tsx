"use client";

import { TokenActionCard } from "@/components/newsletter/newsletter-token-action-card";

type SavedSearchUnsubscribeCardProps = {
  token?: string;
};

async function unsubscribeFromSavedSearch(token: string) {
  const response = await fetch("/api/saved-searches/unsubscribe", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json().catch(() => null);
}

export function SavedSearchUnsubscribeCard({
  token,
}: SavedSearchUnsubscribeCardProps) {
  return (
    <TokenActionCard
      token={token}
      backHref="/profile"
      backLabel="Go to account"
      copy={{
        badge: "Saved Search Alerts",
        idle: "Turn off these alerts",
        pending: "Turning off...",
        title: "Turn off alerts for this saved search",
        description:
          "Click below to stop email alerts for this one saved search. Your other saved searches will stay exactly as they are.",
        successTitle: "Alerts are off for this search",
        successMessage:
          "Email alerts are now off for this saved search. You can turn them back on at any time from your account.",
        missingTitle: "Missing unsubscribe link",
        missingMessage:
          "This alert unsubscribe link is incomplete. Please use the latest link from one of your saved search emails.",
        errorMessage:
          "We could not reach the server right now. Please try again in a moment.",
        buttonVariant: "secondary",
      }}
      onAction={unsubscribeFromSavedSearch}
    />
  );
}
