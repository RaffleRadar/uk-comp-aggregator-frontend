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
      revalidate: false,
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
      revalidate: false,
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

export type WeeklyRadarListItem = {
  id: string;
  slug: string | null;
  prize: string;
  operatorName: string;
  imageUrl: string | null;
  category: string | null;
  ticketsTotal: number | null;
  ticketsSold: number | null;
  ticketsUnsold: number | null;
  percentSold: number | null;
  ticketPrice: number | null;
  ticketSpend: number | null;
  prizeValue: number | null;
  valueRatio: number | null;
};

export type WeeklyRadarBigThree = {
  undersold: WeeklyRadarListItem[];
  spend: WeeklyRadarListItem[];
  bestValue: WeeklyRadarListItem[];
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readListItem(value: unknown): WeeklyRadarListItem | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const prize = readString(value.prize);
  const operatorName = readString(value.operatorName);
  if (!id || !prize || !operatorName) return null;
  return {
    id,
    slug: readString(value.slug),
    prize,
    operatorName,
    imageUrl: readString(value.imageUrl),
    category: readString(value.category),
    ticketsTotal: readNumber(value.ticketsTotal),
    ticketsSold: readNumber(value.ticketsSold),
    ticketsUnsold: readNumber(value.ticketsUnsold),
    percentSold: readNumber(value.percentSold),
    ticketPrice: readNumber(value.ticketPrice),
    ticketSpend: readNumber(value.ticketSpend),
    prizeValue: readNumber(value.prizeValue),
    valueRatio: readNumber(value.valueRatio),
  };
}

function readList(value: unknown): WeeklyRadarListItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(readListItem)
    .filter((item): item is WeeklyRadarListItem => item !== null);
}

export function readBigThree(payload: unknown): WeeklyRadarBigThree | null {
  if (!isRecord(payload) || !isRecord(payload.bigThree)) return null;
  return {
    undersold: readList(payload.bigThree.undersold),
    spend: readList(payload.bigThree.spend),
    bestValue: readList(payload.bigThree.bestValue),
  };
}

const poundsFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatPounds(value: number | null | undefined): string {
  return typeof value === "number" ? poundsFormat.format(value) : "–";
}

export function formatRatio(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toFixed(2)}×` : "–";
}
