import type { Metadata } from "next";
import {
  PrizeDatabaseBody,
  PrizeDatabaseHero,
} from "@/components/prizes/prize-database";
import {
  DEFAULT_PRIZE_LIST_CATEGORY,
  getPrizeList,
  parsePrizeListCategory,
  parsePrizeQuery,
  parseShowAll,
  type PrizeListState,
} from "@/lib/prizes";

export const revalidate = 300;

type SearchValue = string | string[] | undefined;

type PageProps = {
  searchParams: Promise<{
    q?: SearchValue;
    category?: SearchValue;
    view?: SearchValue;
  }>;
};

const TITLE = "Prize Database: Find UK Competitions by Prize | RaffleRadar";
const DESCRIPTION =
  "Search UK prize competitions by prize, brand or model. See which operators are running the same prize, how many live draws there are and the cheapest entry.";

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const filtered =
    parsePrizeQuery(query.q) != null ||
    parsePrizeListCategory(query.category) !== DEFAULT_PRIZE_LIST_CATEGORY ||
    parseShowAll(query.view);

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/prizes" },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PrizeDatabasePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const state: PrizeListState = {
    category: parsePrizeListCategory(query.category),
    query: parsePrizeQuery(query.q),
    showAll: parseShowAll(query.view),
  };

  const list = await getPrizeList(state);

  return (
    <main className="bg-rr-bg">
      <PrizeDatabaseHero state={state} />
      {list ? (
        <PrizeDatabaseBody list={list} state={state} />
      ) : (
        <div className="container pb-10">
          <p className="mx-auto max-w-[1100px] rounded-xl border border-rr-border bg-rr-surface px-4 py-5 text-sm text-rr-secondary">
            The Prize Database is not available right now. Please try again in a
            few minutes.
          </p>
        </div>
      )}
    </main>
  );
}
