import { CompetitionCard } from "@/components/competitions/competition-card";
import { SectionHeader } from "@/components/home/section-header";
import type { Competition } from "@/types/competition";

type CompetitionSectionProps = {
  titleStart: string;
  titleAccent: string;
  subtitle: string;
  viewAllHref?: string;
  competitions: Competition[];
  accentTone?: "green" | "red";
  featuredIds?: string[];
  cardVariant?: "default" | "ended";
  mobileLayout?: "carousel" | "grid";
};

export function CompetitionSection({
  titleStart,
  titleAccent,
  subtitle,
  viewAllHref,
  competitions,
  accentTone = "green",
  featuredIds = [],
  cardVariant = "default",
  mobileLayout = "carousel",
}: CompetitionSectionProps) {
  if (competitions.length === 0) return null;

  const featuredSet = new Set(featuredIds);

  return (
    <section className="py-4 md:py-5">
      <div className="container">
        <SectionHeader
          titleStart={titleStart}
          titleAccent={titleAccent}
          subtitle={subtitle}
          viewAllHref={viewAllHref}
          accentTone={accentTone}
        />

        <div
          className={
            mobileLayout === "grid"
              ? "mt-3 grid auto-rows-fr grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4"
              : "mt-3 flex items-stretch overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:grid md:auto-rows-fr md:items-stretch md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:mx-0 md:px-0 md:overflow-visible md:snap-none scrollbar-hide"
          }
        >
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className={
                mobileLayout === "grid"
                  ? "h-full w-full"
                  : "flex-none snap-start w-[280px] mr-3 last:mr-0 md:w-auto md:mr-0 md:last:mr-0 md:h-full"
              }
            >
              <div className="h-full w-full">
                <CompetitionCard
                  competition={competition}
                  featured={featuredSet.has(competition.id)}
                  variant={cardVariant}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
