"use client";

import { CompetitionCard } from "@/components/competitions/competition-card";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { useInfinitePagination } from "@/lib/use-infinite-pagination";
import type { Competition } from "@/types/competition";

type CompetitionGridClientProps = {
  competitions: Competition[];
  featuredIds: string[];
  pageSize?: number;
  embedded?: boolean;
  xlThreeCols?: boolean;
  interactiveWhenEnded?: boolean;
  spendMetric?: "odds" | "entries" | "prize";
};

export function CompetitionGridClient({
  competitions,
  featuredIds,
  pageSize = 20,
  embedded = false,
  xlThreeCols = false,
  interactiveWhenEnded = false,
  spendMetric,
}: CompetitionGridClientProps) {
  const { visibleItems, hasMore, loadMoreRef } = useInfinitePagination({
    items: competitions,
    pageSize,
  });

  const featuredSet = new Set(featuredIds);
  const gridClassName = xlThreeCols
    ? "grid auto-rows-fr grid-cols-2 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
    : "grid auto-rows-fr grid-cols-2 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const content = competitions.length > 0 ? (
    <>
      <div className={gridClassName}>
        {visibleItems.map((competition) => (
          <div key={competition.id} className="h-full">
            <CompetitionCard
              competition={competition}
              featured={featuredSet.has(competition.id)}
              variant={competition.isActive === false ? "ended" : "default"}
              interactiveWhenEnded={interactiveWhenEnded}
              spendMetric={spendMetric}
            />
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-6" aria-hidden="true">
          <div ref={loadMoreRef} className="flex h-14 w-full items-center justify-center">
            <RadarLoader size="md" />
          </div>
        </div>
      ) : null}
    </>
  ) : (
    <div className="rounded-xl border border-rr-border bg-rr-surface px-4 py-8 text-center text-sm text-rr-muted">
      No competitions available right now.
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="py-8 md:py-10">
      <div className="container">{content}</div>
    </section>
  );
}
