import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeeklyRadarView } from "@/components/weekly-radar/weekly-radar-view";
import { formatWeekRange, getWeeklyRadarByWeek } from "@/lib/weekly-radar";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ weekStart: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { weekStart } = await params;
  const issue = await getWeeklyRadarByWeek(weekStart);
  return {
    title: issue
      ? `The Weekly Radar, ${formatWeekRange(issue.weekStart, issue.weekEnd)}`
      : "The Weekly Radar",
    robots: { index: false, follow: false },
  };
}

export default async function WeeklyRadarWeekPage({ params }: PageProps) {
  const { weekStart } = await params;
  const issue = await getWeeklyRadarByWeek(weekStart);
  if (!issue) notFound();
  return <WeeklyRadarView issue={issue} mode="archive" />;
}
