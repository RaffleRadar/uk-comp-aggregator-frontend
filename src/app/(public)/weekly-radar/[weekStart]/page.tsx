import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { WeeklyRadarView } from "@/components/weekly-radar/weekly-radar-view";
import { formatWeekRange, getWeeklyRadarByWeek } from "@/lib/weekly-radar";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ weekStart: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { weekStart } = await params;
  const issue = await getWeeklyRadarByWeek(weekStart);
  if (!issue) {
    return { title: "The Weekly Radar | RaffleRadar", robots: { index: false, follow: false } };
  }
  const range = formatWeekRange(issue.weekStart, issue.weekEnd);
  return {
    title: `The Weekly Radar, ${range} | RaffleRadar`,
    description: `UK prize competitions for ${range}: the most undersold draws, the biggest ticket spend, best value and the week's closing days.`,
    alternates: { canonical: `/weekly-radar/${issue.weekStart}` },
  };
}

export default async function WeeklyRadarWeekPage({ params }: PageProps) {
  const { weekStart } = await params;
  const issue = await getWeeklyRadarByWeek(weekStart);
  if (!issue) notFound();
  if (issue.nextWeekStart === null) redirect("/weekly-radar");
  return <WeeklyRadarView issue={issue} mode="archive" />;
}
