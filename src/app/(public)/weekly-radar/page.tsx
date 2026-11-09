import type { Metadata } from "next";
import { WeeklyRadarView } from "@/components/weekly-radar/weekly-radar-view";
import { getLatestWeeklyRadar } from "@/lib/weekly-radar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Weekly Radar | UK Prize Competition Round-up | RaffleRadar",
  description:
    "Last week in UK prize competitions: the most undersold draws, the biggest ticket spend, best value, busiest days and what is closing this week.",
  alternates: { canonical: "/weekly-radar" },
};

export default async function WeeklyRadarPage() {
  const issue = await getLatestWeeklyRadar();
  return <WeeklyRadarView issue={issue} mode="latest" />;
}
