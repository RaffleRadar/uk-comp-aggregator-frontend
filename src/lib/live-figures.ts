import { getCompetitions, getStats } from "@/lib/api";

export type LiveFigures = {
  competitionCount: string;
  operatorCount: string;
  cheapestTicket: string;
};

const FALLBACK: LiveFigures = {
  competitionCount: "hundreds of",
  operatorCount: "multiple",
  cheapestTicket: "a few pence",
};

function formatTicketPrice(value: number | string | null | undefined): string {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return FALLBACK.cheapestTicket;
  }

  if (parsed < 1) {
    return `${Math.round(parsed * 100)}p`;
  }

  return `£${parsed.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function getLiveFigures(): Promise<LiveFigures> {
  const [stats, cheapest] = await Promise.all([
    getStats().catch(() => null),
    getCompetitions({
      limit: 1,
      sortBy: "ticketPrice",
      sortOrder: "asc",
      excludeFree: true,
    }).catch(() => []),
  ]);

  return {
    competitionCount:
      typeof stats?.competitionsCount === "number" && stats.competitionsCount > 0
        ? stats.competitionsCount.toLocaleString("en-GB")
        : FALLBACK.competitionCount,
    operatorCount:
      typeof stats?.operatorsCount === "number" && stats.operatorsCount > 0
        ? stats.operatorsCount.toLocaleString("en-GB")
        : FALLBACK.operatorCount,
    cheapestTicket: formatTicketPrice(cheapest[0]?.ticketPrice),
  };
}

export function applyLiveFigures(text: string, figures: LiveFigures): string {
  return text
    .replace(/\{count\}/g, figures.competitionCount)
    .replace(/\{competitionCount\}/g, figures.competitionCount)
    .replace(/\{operatorCount\}/g, figures.operatorCount)
    .replace(/\{cheapestTicket\}/g, figures.cheapestTicket);
}

export function applyLiveFiguresToPortableText<T>(
  value: T,
  figures: LiveFigures,
): T {
  if (Array.isArray(value)) {
    return value.map((item) =>
      applyLiveFiguresToPortableText(item, figures),
    ) as unknown as T;
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(source)) {
    if (key === "text" && typeof item === "string") {
      result[key] = applyLiveFigures(item, figures);
    } else {
      result[key] = applyLiveFiguresToPortableText(item, figures);
    }
  }

  return result as unknown as T;
}
