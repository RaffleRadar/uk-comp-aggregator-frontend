const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const PRIZE_PAGE_TTL = 300;

export type PrizeSort =
  "best-overall" | "best-odds" | "lowest-entry" | "most-entries";

export type PrizeDrawEntries = {
  entries: number;
  odds: number;
  cost: number;
};

export type PrizeDrawForecast = {
  percent: number;
  tickets: number;
  odds: number;
};

export type PrizeDraw = {
  id: string;
  slug: string | null;
  title: string;
  operator: { id: string; name: string; slug: string | null };
  ticketPrice: number | null;
  isFree: boolean;
  prizeValue: number | null;
  prizeValueEstimated: boolean;
  ticketsSold: number | null;
  ticketsTotal: number | null;
  ticketsLeft: number | null;
  percentSold: number | null;
  maxPerPerson: number | null;
  endsAt: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  instantPrizes: boolean;
  liveOdds: number | null;
  soldOutOdds: number | null;
  forecast: PrizeDrawForecast | null;
  entries: PrizeDrawEntries | null;
  isBestOverall: boolean;
  isCurrent: boolean;
};

export type PrizeSummary = {
  liveDraws: number;
  operators: number;
  bestOverall: { drawId: string; valueRatio: number | null } | null;
  cheapestEntry: { drawId: string; ticketPrice: number } | null;
  bestOdds: { drawId: string; liveOdds: number } | null;
  mostEntries: { drawId: string; entries: number; amount: number } | null;
};

export type PrizeHistory = {
  days: number;
  timesRun: number;
  uniqueOperators: number;
  typicalTicketPrice: number | null;
  averageSold: number | null;
  completedDraws: number;
};

export type PrizePriceComparison = {
  typicalPrice: number;
  lowestPrice: number;
  differencePercent: number;
  direction: "lower" | "higher" | "same";
};

export type PrizePage = {
  prize: {
    key: string;
    label: string;
    imageUrl: string | null;
    operators: number;
    liveDraws: number;
  };
  spend: number | null;
  entriesAmount: number;
  sort: PrizeSort;
  summary: PrizeSummary;
  history: PrizeHistory;
  priceComparison: PrizePriceComparison | null;
  draws: PrizeDraw[];
};

const PRIZE_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;

export function isPrizeKey(value: string): boolean {
  return PRIZE_KEY_PATTERN.test(value);
}

export async function getPrizePage(key: string): Promise<PrizePage | null> {
  if (!isPrizeKey(key)) return null;

  const res = await fetch(`${BASE_URL}/prizes/${encodeURIComponent(key)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: PRIZE_PAGE_TTL },
  });

  if (res.status === 404 || res.status === 400) return null;

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return (await res.json()) as PrizePage;
}

const countFormat = new Intl.NumberFormat("en-GB");

const penceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const poundsFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCount(value: number): string {
  return countFormat.format(value);
}

export function formatTicketPrice(value: number): string {
  return penceFormat.format(value);
}

export function formatSpend(value: number): string {
  return poundsFormat.format(value);
}

export function formatOdds(value: number): string {
  return `1 in ${countFormat.format(value)}`;
}

export function findDraw(
  page: PrizePage,
  drawId: string | null | undefined,
): PrizeDraw | null {
  if (!drawId) return null;
  return page.draws.find((draw) => draw.id === drawId) ?? null;
}

export function prizePageDescription(page: PrizePage): string {
  const { label, operators, liveDraws } = page.prize;

  if (liveDraws === 0) {
    return `Compare UK prize draws for a chance to win a ${label}. See ticket prices, odds and which operators have run this prize recently.`;
  }

  const operatorText =
    operators === 1 ? "1 approved operator" : `${operators} approved operators`;

  return `Compare ${liveDraws} live ${label} competitions from ${operatorText}. See entry prices, odds and how many entries your spend gets.`;
}

export type PrizeComparisonLink = {
  key: string;
  label: string;
  operators: number;
};

export async function getPrizeComparisonForCompetition(
  idOrSlug: string,
): Promise<PrizeComparisonLink | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/prizes/competition/${encodeURIComponent(idOrSlug)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: PRIZE_PAGE_TTL },
      },
    );

    if (!res.ok) return null;

    const body = (await res.json()) as { prize: PrizePage["prize"] | null };

    if (!body?.prize || !isPrizeKey(body.prize.key)) return null;

    return {
      key: body.prize.key,
      label: body.prize.label,
      operators: body.prize.operators,
    };
  } catch {
    return null;
  }
}
