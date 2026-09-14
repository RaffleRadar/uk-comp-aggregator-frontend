import type { Metadata } from "next";
import { SearchForm } from "@/components/search/search-form";
import { buildOpenGraph, buildTwitter } from "@/lib/og";

type SearchPageSearchParams = {
  q?: string;
};

const TITLE = "Search competitions — RaffleRadar";
const DESCRIPTION =
  "Search live UK prize competitions by prize name, brand, model or cash value.";

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
      </div>
    </main>
  );
}
