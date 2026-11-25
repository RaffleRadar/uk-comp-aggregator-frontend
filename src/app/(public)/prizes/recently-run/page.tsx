import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { RecentPrizeColumns } from "@/components/prizes/prize-database";
import {
  DEFAULT_PRIZE_LIST_CATEGORY,
  PRIZE_RECENT_PATH,
  getPrizeList,
} from "@/lib/prizes";

export const revalidate = 300;

const TITLE = "Recently Run Prizes: Past UK Competition Prizes | RaffleRadar";
const DESCRIPTION =
  "Prizes that UK competition operators ran recently and that have no live draws right now. Open a prize to see past draws, ticket prices and how they sold.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PRIZE_RECENT_PATH },
};

export default async function RecentlyRunPrizesPage() {
  const list = await getPrizeList(
    {
      category: DEFAULT_PRIZE_LIST_CATEGORY,
      query: null,
      showAll: false,
    },
    { allRecent: true },
  );
  const recent = list?.recentlyRun ?? null;

  return (
    <main className="bg-rr-bg">
      <section
        aria-labelledby="recently-run-page-title"
        className="bg-gradient-to-b from-rr-surface to-rr-bg"
      >
        <div className="container pb-5 pt-6 md:pt-10">
          <div className="mx-auto max-w-[1100px]">
            <Link
              href="/prizes"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rr-green no-underline hover:underline"
            >
              <IconArrowLeft size={14} aria-hidden="true" />
              Prize Database
            </Link>
            <h1
              id="recently-run-page-title"
              className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-rr-primary md:text-5xl"
            >
              Recently Run <span className="text-rr-green">Prizes</span>
            </h1>
            <p className="mt-3 max-w-[820px] text-sm leading-6 text-rr-secondary">
              {recent && recent.total > 0
                ? `${recent.total.toLocaleString("en-GB")} prizes ran in the last ${recent.days} days and have no live draws right now. Open a prize to see how its past draws went.`
                : "Prizes with no live draws right now will be listed here."}
            </p>
          </div>
        </div>
      </section>
      <section aria-label="Recently run prizes" className="container pb-10">
        <div className="mx-auto max-w-[1100px]">
          {recent && recent.prizes.length > 0 ? (
            <RecentPrizeColumns prizes={recent.prizes} />
          ) : (
            <p className="rounded-xl border border-rr-border bg-rr-surface px-4 py-5 text-sm text-rr-secondary">
              No recently run prizes to show right now.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
