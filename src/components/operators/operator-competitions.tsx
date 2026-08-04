"use client";

import { useMemo, useState } from "react";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { cn } from "@/lib/cn";
import type { Competition } from "@/types/competition";

type OperatorCompetitionsProps = {
  competitions: Competition[];
};

type OperatorCompetitionsSort = "default" | "newest";

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
  const [sort, setSort] = useState<OperatorCompetitionsSort>("default");

  const visibleCompetitions = useMemo(() => {
    if (sort === "default") {
      return competitions;
    }

    return [...competitions].sort(compareByNewest);
  }, [competitions, sort]);

  return (
    <div>
      <div className="mb-4 flex">
        <div className="inline-flex h-10 w-full max-w-[220px] items-center rounded-xl border border-rr-border bg-rr-surface p-0.5 shadow-sm lg:h-9 lg:rounded-[7px] lg:bg-rr-surface lg:shadow-none">
          <button
            type="button"
            className={cn(
              "flex-1 whitespace-nowrap rounded-[10px] px-3 text-sm font-medium transition lg:rounded-[5px] lg:px-2.5",
              sort === "default"
                ? "bg-rr-card text-rr-primary shadow-sm lg:bg-rr-card"
                : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
            )}
            aria-pressed={sort === "default"}
            onClick={() => setSort("default")}
          >
            Featured
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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