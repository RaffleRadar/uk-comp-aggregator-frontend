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

export type WeeklyRadarHeadline = {
  drawsCompleted: number;
  soldOut: number;
  averageSoldAtClose: number | null;
  averageSoldSample: number;
  newCompetitions: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function readHeadline(payload: unknown): WeeklyRadarHeadline | null {
  if (!isRecord(payload) || !isRecord(payload.headline)) return null;
  const headline = payload.headline;
  const drawsCompleted = readNumber(headline.drawsCompleted);
  const soldOut = readNumber(headline.soldOut);
  const newCompetitions = readNumber(headline.newCompetitions);
  if (drawsCompleted === null || soldOut === null || newCompetitions === null) {
    return null;
  }
  return {
    drawsCompleted,
    soldOut,
    averageSoldAtClose: readNumber(headline.averageSoldAtClose),
    averageSoldSample: readNumber(headline.averageSoldSample) ?? 0,
    newCompetitions,
  };
}

const countFormat = new Intl.NumberFormat("en-GB");

export function formatCount(value: number | null | undefined): string {
  return typeof value === "number" ? countFormat.format(value) : "–";
}

export function formatPercent(value: number | null | undefined): string {
  return typeof value === "number" ? `${Math.round(value)}%` : "–";
}
