"use client";

import { useMemo, useState } from "react";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { cn } from "@/lib/cn";
import type { Competition } from "@/types/competition";

type OperatorCompetitionsProps = {
  competitions: Competition[];
};

type OperatorCompetitionsSort = "endingSoonest" | "newest";

function toTime(value: string | null | undefined, fallback: number) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compareByEndingSoonest(a: Competition, b: Competition) {
  const aAvailable = a.availableToBuy === true;
  const bAvailable = b.availableToBuy === true;

  if (aAvailable !== bAvailable) {
    return aAvailable ? -1 : 1;
  }

  const aEndsAt = toTime(a.endsAt, Number.POSITIVE_INFINITY);
  const bEndsAt = toTime(b.endsAt, Number.POSITIVE_INFINITY);

  if (aEndsAt !== bEndsAt) {
    return aEndsAt < bEndsAt ? -1 : 1;
  }

  return a.id.localeCompare(b.id);
}

function compareByNewest(a: Competition, b: Competition) {
  const aAvailable = a.availableToBuy === true;
  const bAvailable = b.availableToBuy === true;

  if (aAvailable !== bAvailable) {
    return aAvailable ? -1 : 1;
  }

  const aCreatedAt = Date.parse(a.createdAt);
  const bCreatedAt = Date.parse(b.createdAt);
  const aCreatedAtValue = Number.isFinite(aCreatedAt) ? aCreatedAt : Number.NEGATIVE_INFINITY;
  const bCreatedAtValue = Number.isFinite(bCreatedAt) ? bCreatedAt : Number.NEGATIVE_INFINITY;

  if (aCreatedAtValue !== bCreatedAtValue) {
    return bCreatedAtValue - aCreatedAtValue;
  }

  return a.id.localeCompare(b.id);
}

export function OperatorCompetitions({
  competitions,
}: OperatorCompetitionsProps) {
  const [sort, setSort] = useState<OperatorCompetitionsSort>("endingSoonest");

  const visibleCompetitions = useMemo(
    () =>
      [...competitions].sort(
        sort === "endingSoonest" ? compareByEndingSoonest : compareByNewest,
      ),
    [competitions, sort],
  );

  return (
    <div>
      <div className="mb-4 flex">
        <div className="inline-flex h-10 w-full max-w-[260px] items-center rounded-xl border border-rr-border bg-rr-surface p-0.5 shadow-sm lg:h-9 lg:rounded-[7px] lg:bg-rr-surface lg:shadow-none">
          <button
            type="button"
            className={cn(
              "flex-1 whitespace-nowrap rounded-[10px] px-3 text-sm font-medium transition lg:rounded-[5px] lg:px-2.5",
              sort === "endingSoonest"
                ? "bg-rr-card text-rr-primary shadow-sm lg:bg-rr-card"
                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
            )}
            aria-pressed={sort === "endingSoonest"}
            onClick={() => setSort("endingSoonest")}
          >
            Ending Soonest
          </button>

          <button
            type="button"
            className={cn(
              "flex-1 whitespace-nowrap rounded-[10px] px-3 text-sm font-medium transition lg:rounded-[5px] lg:px-2.5",
              sort === "newest"
                ? "bg-rr-card text-rr-primary shadow-sm lg:bg-rr-card"
                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
            )}
            aria-pressed={sort === "newest"}
            onClick={() => setSort("newest")}
          >
            Newest
          </button>
        </div>
      </div>

      <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCompetitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
          />
        ))}
      </div>
    </div>
  );
}