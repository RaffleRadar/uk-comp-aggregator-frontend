import type { Competition } from "@/types/competition";

export type LandingFigures = {
  count: number;
  cheapestTicket: string;
  topPrize: string;
  operatorCount: number;
  averageTicket: string;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value: number | null): string {
  if (value === null) return "n/a";
  if (value < 1) return `${Math.round(value * 100)}p`;
  if (Number.isInteger(value)) return `£${value.toLocaleString("en-GB")}`;
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildLandingFigures(
  competitions: Competition[],
): LandingFigures {
  const ticketPrices = competitions
    .map((competition) => toNumber(competition.ticketPrice))
    .filter((value): value is number => value !== null && value > 0);

  const prizeValues = competitions
    .map((competition) => toNumber(competition.prizeValue))
    .filter((value): value is number => value !== null && value > 0);

  const operators = new Set(
    competitions
      .map((competition) => competition.operator?.name)
      .filter((name): name is string => Boolean(name)),
  );

  const averageTicket =
    ticketPrices.length > 0
      ? ticketPrices.reduce((sum, value) => sum + value, 0) /
        ticketPrices.length
      : null;

  return {
    count: competitions.length,
    cheapestTicket: formatMoney(
      ticketPrices.length > 0 ? Math.min(...ticketPrices) : null,
    ),
    topPrize: formatMoney(
      prizeValues.length > 0 ? Math.max(...prizeValues) : null,
    ),
    operatorCount: operators.size,
    averageTicket: formatMoney(averageTicket),
  };
}

export function applyFigures(text: string, figures: LandingFigures): string {
  return text
    .replace(/\{count\}/g, String(figures.count))
    .replace(/\{cheapestTicket\}/g, figures.cheapestTicket)
    .replace(/\{topPrize\}/g, figures.topPrize)
    .replace(/\{operatorCount\}/g, String(figures.operatorCount))
    .replace(/\{averageTicket\}/g, figures.averageTicket);
}
