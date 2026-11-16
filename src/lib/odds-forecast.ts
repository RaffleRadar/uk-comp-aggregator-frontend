export type PercentVariant = "green" | "amber" | "red";

export function getPercentVariant(value: number): PercentVariant {
  if (value >= 75) return "red";
  if (value >= 50) return "amber";
  return "green";
}

export const percentTextClass: Record<PercentVariant, string> = {
  green: "text-rr-green",
  amber: "text-amber-500",
  red: "text-red-500",
};

export function getPercentTextClass(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return percentTextClass.green;
  return percentTextClass[getPercentVariant(value)];
}

export function getOddsPerTicket(
  tickets: number | null,
  winners: number,
): number | null {
  if (tickets === null || !Number.isFinite(tickets) || tickets <= 0) {
    return null;
  }
  const safeWinners = winners > 0 ? winners : 1;
  return Math.max(1, Math.round(tickets / safeWinners));
}

export type ProjectedSales = {
  tickets: number;
  percent: number;
};

export function getProjectedSales(
  projectedPercent: number,
  ticketsTotal: number,
  ticketsSold: number | null,
): ProjectedSales | null {
  if (!Number.isFinite(projectedPercent)) return null;
  if (!Number.isFinite(ticketsTotal) || ticketsTotal <= 0) return null;

  const rawPercent = Math.round(projectedPercent);
  const rawTickets = Math.round((rawPercent / 100) * ticketsTotal);
  const soldNow = ticketsSold ?? 0;

  if (rawTickets < soldNow) {
    return {
      tickets: soldNow,
      percent: Math.round((soldNow / ticketsTotal) * 100),
    };
  }

  return { tickets: rawTickets, percent: rawPercent };
}
