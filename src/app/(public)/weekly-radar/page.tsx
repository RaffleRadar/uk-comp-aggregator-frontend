import type { Metadata } from "next";
import { WeeklyRadarView } from "@/components/weekly-radar/weekly-radar-view";
import { getLatestWeeklyRadar } from "@/lib/weekly-radar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Weekly Radar",
  description: "A weekly round-up of the UK prize competition market.",
  robots: { index: false, follow: false },
};

export default async function WeeklyRadarPage() {
  const issue = await getLatestWeeklyRadar();
  return <WeeklyRadarView issue={issue} mode="latest" />;
}
