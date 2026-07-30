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
  interactiveWhenEnded?: boolean;
};

export function CompetitionGridClient({
  competitions,
  featuredIds,
  pageSize = 20,
  embedded = false,
  interactiveWhenEnded = false,
}: CompetitionGridClientProps) {
  const { visibleItems, hasMore, loadMoreRef } = useInfinitePagination({
    items: competitions,
    pageSize,
  });

  const featuredSet = new Set(featuredIds);
  const gridClassName = embedded
    ? "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
    : "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const content = competitions.length > 0 ? (
    <>
      <div className={gridClassName}>
        {visibleItems.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={competition}
            featured={featuredSet.has(competition.id)}
            variant={competition.isActive === false ? "ended" : "default"}
            interactiveWhenEnded={interactiveWhenEnded}
          />
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
