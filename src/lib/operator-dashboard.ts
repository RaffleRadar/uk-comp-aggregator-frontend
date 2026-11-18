import type {
  WeeklyRadarBusiest,
  WeeklyRadarClosingDays,
  WeeklyRadarTopPrize,
} from "@/lib/weekly-radar";

export const OPERATOR_DASHBOARD_ROLES = ["operator", "admin"] as const;

export type OperatorDashboardOperator = {
  id: string;
  name: string;
  slug: string | null;
  baseUrl: string;
  isHidden: boolean;
};

export type OperatorDashboardMe = {
  operator: OperatorDashboardOperator;
};

export type MetricChange = {
  value: number | null;
  previous: number | null;
  change: number | null;
};

export type OperatorDashboardMarket = {
  weekStart: string;
  weekEnd: string;
  previousWeekStart: string | null;
  headline: {
    drawsCompleted: MetricChange;
    soldOut: MetricChange;
    averageSoldAtClose: MetricChange;
    newCompetitions: MetricChange;
    typicalTicketPrice: MetricChange;
  };
  salesByDay: WeeklyRadarBusiest | null;
  salesByHour: WeeklyRadarBusiest | null;
  salesByDayHour: { tickets: number[][]; spend: number[][] } | null;
  closingDays: WeeklyRadarClosingDays | null;
  topPrizes: WeeklyRadarTopPrize[];
};

export type OperatorMarketComparison =
  | {
      status: "compared";
      operatorAverage: number;
      marketAverage: number;
      difference: number;
    }
  | { status: "not-enough-draws"; sample: number; minimumDraws: number }
  | { status: "no-market-average" };

export type OperatorDashboardPerformance = {
  weekStart: string;
  weekEnd: string;
  drawsCompleted: MetricChange;
  soldOut: MetricChange;
  averageSoldAtClose: MetricChange;
  averageSoldSample: number;
  marketComparison: OperatorMarketComparison;
  visits: {
    clicks: MetricChange;
    uniqueVisitors: MetricChange;
  };
};

export type OperatorDashboardOverview = {
  operator: OperatorDashboardOperator;
  market: OperatorDashboardMarket | null;
  performance: OperatorDashboardPerformance | null;
};

export type OperatorDashboardCategoryFigures = {
  drawsCompleted: number;
  soldOut: number;
  soldOutShare: number | null;
  averageSoldAtClose: number | null;
  averageSoldSample: number;
};

export type OperatorDashboardCategoryRow = {
  key: string;
  label: string;
  market: OperatorDashboardCategoryFigures;
  operator: OperatorDashboardCategoryFigures;
  difference: number | null;
};

export type OperatorDashboardCategories = {
  period: { days: number; from: string; to: string };
  minimumDraws: number;
  rows: OperatorDashboardCategoryRow[];
  total: {
    market: OperatorDashboardCategoryFigures;
    operator: OperatorDashboardCategoryFigures;
    difference: number | null;
  };
};

export type OperatorDashboardCategoriesResponse = {
  operator: OperatorDashboardOperator;
  categories: OperatorDashboardCategories;
};

export type OperatorDashboardClosingCell = {
  drawsCompleted: number;
  averageSoldAtClose: number | null;
  averageSoldSample: number;
};

export type OperatorDashboardClosingGrid = {
  total: OperatorDashboardCategoryFigures;
  cells: OperatorDashboardClosingCell[][];
};

export type OperatorDashboardClosingWindows = {
  period: { days: number; from: string; to: string };
  category: { key: string; label: string } | null;
  minimumDraws: number;
  timeZone: string;
  days: string[];
  slots: { key: string; label: string; startHour: number }[];
  market: OperatorDashboardClosingGrid;
  operator: OperatorDashboardClosingGrid;
};

export type OperatorDashboardClosingWindowsResponse = {
  operator: OperatorDashboardOperator;
  closingWindows: OperatorDashboardClosingWindows;
};

export type OperatorDashboardPrize = {
  key: string;
  label: string;
  operators: number;
  drawsCompleted: number;
  averageSoldAtClose: number | null;
  averageSoldSample: number;
  lowestTicketPrice: number | null;
  operator: {
    drawsCompleted: number;
    averageSoldAtClose: number | null;
    averageSoldSample: number;
  };
};

export type OperatorDashboardPrizes = {
  period: { days: number; from: string; to: string };
  category: { key: string; label: string } | null;
  minimumDraws: number;
  minimumOperators: number;
  limit: number;
  cashIncluded: boolean;
  coverage: {
    drawsCompleted: number;
    drawsWithPrize: number;
    prizes: number;
  };
  mostRun: OperatorDashboardPrize[];
  bestSelling: OperatorDashboardPrize[];
};

export type OperatorDashboardPrizesResponse = {
  operator: OperatorDashboardOperator;
  prizes: OperatorDashboardPrizes;
};

export const DASHBOARD_PERIOD_DAYS = [7, 30, 90] as const;

export type DashboardPeriodDays = (typeof DASHBOARD_PERIOD_DAYS)[number];

export const DEFAULT_DASHBOARD_PERIOD_DAYS: DashboardPeriodDays = 30;

export const ALL_CATEGORIES_KEY = "all";

export const ALL_CATEGORIES_LABEL = "All categories";

export function parseDashboardDays(value: string | null): DashboardPeriodDays {
  const days = Number(value);
  return (
    DASHBOARD_PERIOD_DAYS.find((option) => option === days) ??
    DEFAULT_DASHBOARD_PERIOD_DAYS
  );
}

export function parseDashboardCategory(value: string | null): string {
  const key = (value ?? "").trim().toLowerCase();
  return /^[a-z]+$/.test(key) ? key : ALL_CATEGORIES_KEY;
}

function dashboardSectionPath(
  section: string,
  operatorId: string,
  days: number,
  category?: string,
) {
  const params = new URLSearchParams({
    operatorId,
    days: String(days),
  });
  if (category && category !== ALL_CATEGORIES_KEY) {
    params.set("category", category);
  }
  return `/api/operator-dashboard/${section}?${params.toString()}`;
}

export function canOpenOperatorDashboard(role: string | null | undefined) {
  return OPERATOR_DASHBOARD_ROLES.some((allowed) => allowed === role);
}

function withOperatorId(path: string, operatorId: string | null) {
  const trimmed = operatorId?.trim();
  return trimmed ? `${path}?operatorId=${encodeURIComponent(trimmed)}` : path;
}

export function operatorDashboardMePath(operatorId: string | null) {
  return withOperatorId("/api/operator-dashboard/me", operatorId);
}

export function operatorDashboardOverviewPath(operatorId: string | null) {
  return withOperatorId("/api/operator-dashboard/overview", operatorId);
}

export function operatorDashboardCategoriesPath(
  operatorId: string,
  days: number,
) {
  return dashboardSectionPath("categories", operatorId, days);
}

export function operatorDashboardClosingWindowsPath(
  operatorId: string,
  days: number,
  category: string,
) {
  return dashboardSectionPath("closing-windows", operatorId, days, category);
}

export function operatorDashboardPrizesPath(
  operatorId: string,
  days: number,
  category: string,
) {
  return dashboardSectionPath("prizes", operatorId, days, category);
}

export type ChangeUnit = "count" | "points" | "price";

export function formatChange(
  change: number | null,
  unit: ChangeUnit,
): string | null {
  if (change === null) return null;
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  const size = Math.abs(change);
  if (unit === "points") return `${sign}${size.toFixed(1)} pts`;
  if (unit === "price") return `${sign}£${size.toFixed(2)}`;
  return `${sign}${new Intl.NumberFormat("en-GB").format(size)}`;
}

export function changeDirection(
  change: number | null,
): "up" | "down" | "flat" | null {
  if (change === null) return null;
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export function busiestIndex(values: number[]): number | null {
  let best: number | null = null;
  values.forEach((value, index) => {
    if (value > 0 && (best === null || value > values[best])) best = index;
  });
  return best;
}

export function dayHours(
  grid: number[][] | null | undefined,
  day: number | null,
): number[] | null {
  if (!grid || day === null) return null;
  const hours = grid[day];
  return Array.isArray(hours) && hours.length === 24 ? hours : null;
}

export function barHeights(values: number[]): number[] {
  const max = Math.max(0, ...values);
  if (max <= 0) return values.map(() => 0);
  return values.map((value) => Math.round((Math.max(0, value) / max) * 100));
}
