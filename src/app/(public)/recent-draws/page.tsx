import { CompetitionCard } from "@/components/competitions/competition-card";
import { CompetitionResultsHeading } from "@/components/competitions/competition-grid";
import { getRecentlyEnded } from "@/lib/api";
import type { Competition } from "@/types/competition";

export const revalidate = 60;

export const metadata = {
  title: "Recent Draws",
  description: "Recently ended competitions and how they sold before the draw.",
  alternates: { canonical: "/recent-draws" },
};

export default async function RecentDrawsPage() {
  let competitions: Competition[] = [];

  try {
    const result = await getRecentlyEnded(24);
    competitions = result as Competition[];
  } catch {
    competitions = [];
  }

  return (
    <main>
      <CompetitionResultsHeading
        params={{ section: "recent-draws" }}
        showBackButton
        backHref="/"
      />
      <section className="py-8 md:py-10">
        <div className="container">
          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  variant="ended"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-rr-border bg-rr-surface px-4 py-8 text-center text-sm text-rr-muted">
              No competitions available right now.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
