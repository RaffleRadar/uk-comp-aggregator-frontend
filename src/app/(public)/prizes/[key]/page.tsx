import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrizeHeader } from "@/components/prizes/prize-header";
import { PrizeSummaryTiles } from "@/components/prizes/prize-summary-tiles";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { getPrizePage, prizePageDescription } from "@/lib/prizes";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ key: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { key } = await params;
  const page = await getPrizePage(key);

  if (!page) {
    return {
      title: "Prize not found | RaffleRadar",
      robots: { index: false, follow: false },
    };
  }

  const title = `${page.prize.label} Competitions UK | RaffleRadar`;
  const description = prizePageDescription(page);
  const path = `/prizes/${page.prize.key}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: buildOpenGraph({
      title,
      description,
      path,
      image: page.prize.imageUrl,
    }),
    twitter: buildTwitter({ title, description, image: page.prize.imageUrl }),
  };
}

export default async function PrizePageRoute({ params }: PageProps) {
  const { key } = await params;
  const page = await getPrizePage(key);

  if (!page) notFound();

  return (
    <main className="bg-rr-bg">
      <PrizeHeader page={page} lead={prizePageDescription(page)} />
      <PrizeSummaryTiles page={page} />
    </main>
  );
}
