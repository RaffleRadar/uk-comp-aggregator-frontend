const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const PRIZE_PAGE_TTL = 300;

export const PRIZE_SORTS = [
  "best-overall",
  "best-odds",
  "lowest-entry",
  "most-entries",
] as const;

export type PrizeSort = (typeof PRIZE_SORTS)[number];

export const DEFAULT_PRIZE_SORT: PrizeSort = "best-overall";

export const PRIZE_SORT_LABELS: Record<PrizeSort, string> = {
  "best-overall": "Best Overall",
  "best-odds": "Best Odds",
  "lowest-entry": "Lowest Entry",
  "most-entries": "Most Entries",
};

export const PRIZE_SPEND_OPTIONS = [5, 10, 20, 50] as const;

export const MIN_PRIZE_SPEND = 1;
export const MAX_PRIZE_SPEND = 1000;

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
  forecast?: PrizeDrawForecast | null;
  entries: PrizeDrawEntries | null;
  isBestOverall: boolean;
  isCurrent: boolean;
};

export type PrizeSummary = {
  liveDraws: number;
  operators: number;
  bestOverall: { drawId: string; valueRatio: number | null } | null;
  cheapestEntry: { drawId: string; ticketPrice: number } | null;
  freeEntry?: { drawId: string } | null;
  bestOdds: { drawId: string; liveOdds: number } | null;
  mostEntries: { drawId: string; entries: number; amount: number } | null;
};

export const HISTORY_PERIODS = [30, 90, 180] as const;
export const DEFAULT_HISTORY_DAYS = 90;

export type HistoryDays = (typeof HISTORY_PERIODS)[number];

export type PrizeHistory = {
  days: number;
  availableDays?: number[];
  firstSeenAt: string | null;
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

export type PrizePageState = {
  history: number | null;
  spend: number | null;
  sort: PrizeSort;
};

const PRIZE_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;

export function isPrizeKey(value: string): boolean {
  return PRIZE_KEY_PATTERN.test(value);
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseHistoryDays(
  value: string | string[] | undefined,
): HistoryDays | null {
  const raw = firstValue(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return (HISTORY_PERIODS as readonly number[]).includes(parsed)
    ? (parsed as HistoryDays)
    : null;
}

export function normalizePrizeSpend(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value * 100) / 100;
  if (rounded < MIN_PRIZE_SPEND || rounded > MAX_PRIZE_SPEND) return null;
  return rounded;
}

export function parsePrizeSpend(
  value: string | string[] | undefined,
): number | null {
  const raw = firstValue(value);
  if (!raw) return null;
  return normalizePrizeSpend(Number(raw));
}

export function parsePrizeSort(
  value: string | string[] | undefined,
): PrizeSort {
  const raw = firstValue(value);
  return (PRIZE_SORTS as readonly string[]).includes(raw ?? "")
    ? (raw as PrizeSort)
    : DEFAULT_PRIZE_SORT;
}

export function prizePageHref(key: string, state: PrizePageState): string {
  const params = new URLSearchParams();
  if (state.history != null && state.history !== DEFAULT_HISTORY_DAYS) {
    params.set("history", String(state.history));
  }
  if (state.spend != null) params.set("spend", String(state.spend));
  if (state.sort !== DEFAULT_PRIZE_SORT) params.set("sort", state.sort);
  const query = params.toString();
  const path = `/prizes/${key}`;
  return query ? `${path}?${query}` : path;
}

export function historyPeriodLabel(days: number): string {
  return days === 180 ? "6 months" : `${days} days`;
}

export function historyPeriodNote(days: number): string {
  return days === 180 ? "6-month median" : `${days}-day median`;
}

export async function getPrizePage(
  key: string,
  state: Partial<PrizePageState> = {},
): Promise<PrizePage | null> {
  if (!isPrizeKey(key)) return null;

  const params = new URLSearchParams();
  if (state.history != null) params.set("history", String(state.history));
  if (state.spend != null) params.set("spend", String(state.spend));
  if (state.sort != null && state.sort !== DEFAULT_PRIZE_SORT) {
    params.set("sort", state.sort);
  }
  const query = params.toString();
  const customSpend =
    state.spend != null &&
    !(PRIZE_SPEND_OPTIONS as readonly number[]).includes(state.spend);

  const res = await fetch(
    `${BASE_URL}/prizes/${encodeURIComponent(key)}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...(customSpend
        ? { cache: "no-store" as const }
        : { next: { revalidate: PRIZE_PAGE_TTL } }),
    },
  );

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
  maximumFractionDigits: 0,
});

export function formatCount(value: number): string {
  return countFormat.format(value);
}

export function formatTicketPrice(value: number): string {
  return penceFormat.format(value);
}

export function formatSpend(value: number): string {
  return Number.isInteger(value)
    ? poundsFormat.format(value)
    : penceFormat.format(value);
}

export function formatPrizeValue(value: number): string {
  return Number.isInteger(value)
    ? poundsFormat.format(value)
    : penceFormat.format(value);
}

const AN_SOUND =
  /^(?:[aio]|e(?!u)|u(?!ni|se|k\b)|xbox|x\d|mx|hp|lg|mg|rtx|8|11|18)/i;

export function prizeWithArticle(label: string): string {
  const name = label.trim();
  if (/^£/.test(name)) return name;
  return `${AN_SOUND.test(name) ? "an" : "a"} ${name}`;
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
    return `Compare UK prize draws for a chance to win ${prizeWithArticle(label)}. See ticket prices, odds and which operators have run this prize recently.`;
  }

  const operatorText =
    operators === 1 ? "1 approved operator" : `${operators} approved operators`;

  return `Compare ${liveDraws} live ${label} competitions from ${operatorText}. See entry prices, odds and how many entries your spend gets.`;
}

export const PRIZE_LIST_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "vehicles", label: "Vehicles" },
  { key: "houses", label: "Houses" },
  { key: "watches", label: "Watches & Jewellery" },
  { key: "cash", label: "Cash" },
  { key: "tech", label: "Tech" },
  { key: "instants", label: "Instants" },
  { key: "home", label: "Home" },
  { key: "sports", label: "Sports" },
  { key: "collectibles", label: "Collectibles" },
  { key: "more", label: "More" },
  { key: "free", label: "Free" },
  { key: "christmas", label: "Christmas" },
] as const;

export type PrizeListCategory = (typeof PRIZE_LIST_CATEGORIES)[number]["key"];

export const DEFAULT_PRIZE_LIST_CATEGORY: PrizeListCategory = "all";
export const PRIZE_LIST_TOP = 20;
export const PRIZE_LIST_ALL = 1000;
export const PRIZE_QUERY_MAX_LENGTH = 80;

export type PrizeListItem = {
  key: string;
  label: string;
  imageUrl: string | null;
  operators: number;
  liveDraws: number;
  fromPrice: number | null;
  category: string | null;
  categoryGroup: string;
};

export type PrizeList = {
  stats: {
    prizeListings: number;
    uniquePrizes: number;
    liveValue: number;
    mostCommonThisWeek: { key: string; label: string } | null;
  };
  category: string;
  query: string | null;
  total: number;
  prizes: PrizeListItem[];
};

export type PrizeListState = {
  category: PrizeListCategory;
  query: string | null;
  showAll: boolean;
};

export function parsePrizeListCategory(
  value: string | string[] | undefined,
): PrizeListCategory {
  const raw = firstValue(value)?.trim().toLowerCase() ?? "";
  const match = PRIZE_LIST_CATEGORIES.find((item) => item.key === raw);
  return match ? match.key : DEFAULT_PRIZE_LIST_CATEGORY;
}

export function parsePrizeQuery(
  value: string | string[] | undefined,
): string | null {
  const raw = firstValue(value)?.replace(/\s+/g, " ").trim() ?? "";
  return raw ? raw.slice(0, PRIZE_QUERY_MAX_LENGTH) : null;
}

export function parseShowAll(value: string | string[] | undefined): boolean {
  return firstValue(value) === "all";
}

export function prizeDatabaseHref(state: PrizeListState): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== DEFAULT_PRIZE_LIST_CATEGORY) {
    params.set("category", state.category);
  }
  if (state.showAll) params.set("view", "all");
  const query = params.toString();
  return query ? `/prizes?${query}` : "/prizes";
}

export function prizeCategoryLabel(category: PrizeListCategory): string {
  return (
    PRIZE_LIST_CATEGORIES.find((item) => item.key === category)?.label ?? ""
  );
}

export async function getPrizeList(
  state: PrizeListState,
): Promise<PrizeList | null> {
  const params = new URLSearchParams();
  if (state.category !== DEFAULT_PRIZE_LIST_CATEGORY) {
    params.set("category", state.category);
  }
  if (state.query) params.set("q", state.query);
  params.set("limit", String(state.showAll ? PRIZE_LIST_ALL : PRIZE_LIST_TOP));

  try {
    const res = await fetch(`${BASE_URL}/prizes?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...(state.query
        ? { cache: "no-store" as const }
        : { next: { revalidate: PRIZE_PAGE_TTL } }),
    });

    if (!res.ok) return null;

    return (await res.json()) as PrizeList;
  } catch {
    return null;
  }
}

export function formatPrizeValueTotal(value: number): string {
  if (value >= 1_000_000) {
    const millions = Math.round(value / 100_000) / 10;
    return `£${millions.toLocaleString("en-GB")}m`;
  }
  if (value >= 10_000) {
    return `£${Math.round(value / 1000).toLocaleString("en-GB")}k`;
  }
  return poundsFormat.format(Math.round(value));
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
