import { Suspense } from "react";
import type { Metadata } from "next";
import {
  CompetitionGrid,
  CompetitionResultsHeading,
} from "@/components/competitions/competition-grid";
import { SearchForm } from "@/components/search/search-form";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { buildOpenGraph, buildTwitter } from "@/lib/og";

type SearchPageSearchParams = {
  q?: string;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  closing?: string;
  spend?: string;
};

const TITLE = "Search competitions — RaffleRadar";
const DESCRIPTION =
  "Search live UK prize competitions by prize name, brand, model or cash value. Filter and sort to find the right draw.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/search",
  }),
  twitter: buildTwitter({
    title: TITLE,
    description: DESCRIPTION,
  }),
};

async function SearchResults({
  params,
}: {
  params: {
    q: string;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
    closing?: string;
    spend?: string;
  };
}) {
  const headingParams = {
    search: params.q,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    category: params.category,
    closing: params.closing,
    spend: params.spend,
  };
  return (
    <>
      <CompetitionResultsHeading
        params={headingParams}
        showBackButton={false}
      />
      <CompetitionGrid
        params={{
          search: params.q,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          category: params.category,
          closing: params.closing,
          spend: params.spend ? Number(params.spend) : undefined,
          limit: 500,
        }}
      />
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageSearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  return (
    <main>
      <div className="container max-w-[1100px] py-6 md:py-10">
        <h1 className="text-3xl font-medium tracking-[-0.03em] text-rr-primary md:text-5xl">
          Find a competition
        </h1>

        <div className="mt-6">
          <SearchForm initialQuery={q || undefined} />
        </div>

        {q ? (
          <Suspense fallback={<RadarLoader className="mt-10" />}>
            <SearchResults
              params={{
                q,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                category: params.category,
                closing: params.closing,
                spend: params.spend,
              }}
            />
          </Suspense>
        ) : null}
      </div>
    </main>
  );
}
