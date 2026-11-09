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

const WEEKLY_RADAR_TTL = 3600;

export async function getLatestWeeklyRadar(): Promise<WeeklyRadarIssue | null> {
  try {
    return await apiFetch<WeeklyRadarIssue>("/weekly-radar/latest", {
      revalidate: WEEKLY_RADAR_TTL,
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
      revalidate: WEEKLY_RADAR_TTL,
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
  ticketsLeft: number | null;
  closed: boolean | null;
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
    ticketsLeft: readNumber(value.ticketsLeft),
    closed: typeof value.closed === "boolean" ? value.closed : null,
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

export type WeeklyRadarPeak = {
  at: number;
  value: number;
  values: number[];
};

export type WeeklyRadarBusiest = {
  tickets: WeeklyRadarPeak | null;
  spend: WeeklyRadarPeak | null;
};

export type WeeklyRadarHeavilyUndersold = {
  thresholdPercent: number;
  count: number;
  sample: number;
};

export type WeeklyRadarBiggestPrize = {
  id: string;
  slug: string | null;
  prize: string;
  operatorName: string;
  imageUrl: string | null;
  prizeValue: number;
};

export type WeeklyRadarAverageTicketPrice = {
  average: number;
  median: number | null;
  sample: number;
};

export type WeeklyRadarInsights = {
  busiestDay: WeeklyRadarBusiest | null;
  busiestHour: WeeklyRadarBusiest | null;
  heavilyUndersold: WeeklyRadarHeavilyUndersold | null;
  biggestPrize: WeeklyRadarBiggestPrize | null;
  averageTicketPrice: WeeklyRadarAverageTicketPrice | null;
};

function readNumberList(value: unknown, size: number): number[] | null {
  if (!Array.isArray(value) || value.length !== size) return null;
  const numbers = value.map(readNumber);
  return numbers.every((item): item is number => item !== null) ? numbers : null;
}

function readPeak(value: unknown, size: number, min: number, max: number): WeeklyRadarPeak | null {
  if (!isRecord(value)) return null;
  const at = readNumber(value.at);
  const peak = readNumber(value.value);
  const values = readNumberList(value.values, size);
  if (at === null || at < min || at > max || peak === null || !values) return null;
  return { at, value: peak, values };
}

function readBusiest(value: unknown, size: number, min: number, max: number): WeeklyRadarBusiest | null {
  if (!isRecord(value)) return null;
  return {
    tickets: readPeak(value.tickets, size, min, max),
    spend: readPeak(value.spend, size, min, max),
  };
}

function readHeavilyUndersold(value: unknown): WeeklyRadarHeavilyUndersold | null {
  if (!isRecord(value)) return null;
  const thresholdPercent = readNumber(value.thresholdPercent);
  const count = readNumber(value.count);
  const sample = readNumber(value.sample);
  if (thresholdPercent === null || count === null || sample === null) return null;
  return { thresholdPercent, count, sample };
}

function readBiggestPrize(value: unknown): WeeklyRadarBiggestPrize | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  const prize = readString(value.prize);
  const operatorName = readString(value.operatorName);
  const prizeValue = readNumber(value.prizeValue);
  if (!id || !prize || !operatorName || prizeValue === null) return null;
  return {
    id,
    slug: readString(value.slug),
    prize,
    operatorName,
    imageUrl: readString(value.imageUrl),
    prizeValue,
  };
}

function readAverageTicketPrice(value: unknown): WeeklyRadarAverageTicketPrice | null {
  if (!isRecord(value)) return null;
  const average = readNumber(value.average);
  const sample = readNumber(value.sample);
  if (average === null || sample === null) return null;
  return { average, median: readNumber(value.median), sample };
}

export function readInsights(payload: unknown): WeeklyRadarInsights | null {
  if (!isRecord(payload) || !isRecord(payload.insights)) return null;
  const insights = payload.insights;
  return {
    busiestDay: readBusiest(insights.busiestDay, 7, 1, 7),
    busiestHour: readBusiest(insights.busiestHour, 24, 0, 23),
    heavilyUndersold: readHeavilyUndersold(insights.heavilyUndersold),
    biggestPrize: readBiggestPrize(insights.biggestPrize),
    averageTicketPrice: readAverageTicketPrice(insights.averageTicketPrice),
  };
}

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatWeekday(isoWeekday: number | null | undefined): string {
  return typeof isoWeekday === "number" && isoWeekday >= 1 && isoWeekday <= 7
    ? WEEKDAY_NAMES[isoWeekday - 1]
    : "–";
}

function formatClock(hour: number): string {
  const normalised = ((hour % 24) + 24) % 24;
  const suffix = normalised < 12 ? "am" : "pm";
  const twelveHour = normalised % 12 === 0 ? 12 : normalised % 12;
  return `${twelveHour}:00${suffix}`;
}

export function formatHourRange(hour: number | null | undefined): string {
  if (typeof hour !== "number" || hour < 0 || hour > 23) return "–";
  return `${formatClock(hour)} – ${formatClock(hour + 1)}`;
}

const penceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | null | undefined): string {
  return typeof value === "number" ? penceFormat.format(value) : "–";
}

export type WeeklyRadarDayCounts = {
  weekStart: string;
  weekEnd: string;
  byDay: number[];
  total: number;
};

export type WeeklyRadarClosingDays = {
  closed: WeeklyRadarDayCounts | null;
  ahead: WeeklyRadarDayCounts | null;
};

function readDayCounts(value: unknown): WeeklyRadarDayCounts | null {
  if (!isRecord(value)) return null;
  const weekStart = readString(value.weekStart);
  const weekEnd = readString(value.weekEnd);
  const byDay = readNumberList(value.byDay, 7);
  if (!weekStart || !weekEnd || !byDay) return null;
  return {
    weekStart,
    weekEnd,
    byDay,
    total: readNumber(value.total) ?? byDay.reduce((sum, item) => sum + item, 0),
  };
}

export function readClosingDays(payload: unknown): WeeklyRadarClosingDays | null {
  if (!isRecord(payload) || !isRecord(payload.closingDays)) return null;
  return {
    closed: readDayCounts(payload.closingDays.closed),
    ahead: readDayCounts(payload.closingDays.ahead),
  };
}
