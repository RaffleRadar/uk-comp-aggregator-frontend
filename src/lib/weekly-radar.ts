import { apiFetch } from "@/lib/api";

export const WEEKLY_RADAR_REVALIDATE_SECONDS = 3600;

export type WeeklyRadarIssue = {
  weekStart: string;
  weekEnd: string;
  builtAt: string;
  previousWeekStart: string | null;
  nextWeekStart: string | null;
  payload: unknown;
};

const WEEK_START_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isWeekStartParam(value: string): boolean {
  if (!WEEK_START_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.getUTCDay() === 1;
}

export async function getLatestWeeklyRadar(): Promise<WeeklyRadarIssue | null> {
  try {
    return await apiFetch<WeeklyRadarIssue>("/weekly-radar/latest", {
      revalidate: WEEKLY_RADAR_REVALIDATE_SECONDS,
    });
  } catch {
    return null;
  }
}

export async function getWeeklyRadarByWeek(
  weekStart: string,
): Promise<WeeklyRadarIssue | null> {
  if (!isWeekStartParam(weekStart)) return null;
  try {
    return await apiFetch<WeeklyRadarIssue>(`/weekly-radar/${weekStart}`, {
      revalidate: WEEKLY_RADAR_REVALIDATE_SECONDS,
    });
  } catch {
    return null;
  }
}

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const yearFormat = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  timeZone: "UTC",
});

export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(`${weekEnd}T00:00:00.000Z`);
  return `${dayFormat.format(start)} – ${dayFormat.format(end)} ${yearFormat.format(end)}`;
}
