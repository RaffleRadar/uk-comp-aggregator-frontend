import { formatValueRatio, valueRatioColor } from "@/lib/value-ratio";

const LONDON_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getUtcDateValue(date: Date): number {
  const [year, month, day] = LONDON_DATE_FORMATTER.format(date)
    .split("-")
    .map(Number);

  return Date.UTC(year, month - 1, day);
}

export type StatusBadge = {
  variant: "red" | "amber" | "green" | "neutral";
  label: string;
} | null;

export function getStatusBadge(
  endsAt: string | null,
  availableToBuy: boolean | null | undefined,
  featured: boolean | undefined,
  valueRatio: number | string | null,
): StatusBadge {
  if (availableToBuy === false) {
    return { variant: "neutral", label: "No longer available" };
  }

  if (endsAt) {
    const endDate = new Date(endsAt);
    if (!Number.isNaN(endDate.getTime())) {
      const now = new Date();
      const daysLeft = Math.ceil(
        (getUtcDateValue(endDate) - getUtcDateValue(now)) / 86400000,
      );

      if (daysLeft <= 0) {
        const timeStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/London",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        }).format(endDate);
        
        return { variant: "red", label: `Ends today ${timeStr}` };
      }

      if (daysLeft > 0 && daysLeft <= 7) {
        return {
          variant: "amber",
          label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
        };
      }
    }
  }

  if (featured) {
    return { variant: "green", label: "Best value" };
  }

  if (valueRatio !== null && valueRatio !== undefined) {
    const colorClass = valueRatioColor(valueRatio);
    const variant =
      colorClass === "text-red-500"
        ? "red"
        : colorClass === "text-amber-500"
          ? "amber"
          : "green";

    return {
      variant,
      label: `Deal ${formatValueRatio(valueRatio)}`,
    };
  }

  return null;
}

export function getEndsLabel(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const endDate = new Date(endsAt);
  if (Number.isNaN(endDate.getTime())) return null;

  const now = new Date();
  const daysLeft = Math.ceil(
    (getUtcDateValue(endDate) - getUtcDateValue(now)) / 86400000,
  );

  if (daysLeft <= 0) return "Ends today";
  if (daysLeft === 1) return "Ends tomorrow";
  return `Ends in ${daysLeft} days`;
}

function getLondonDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getEndedLabel(endsAt: string | null, closedAt?: string | null): string | null {
  const now = new Date();
  const parsedEndsAt = endsAt ? new Date(endsAt) : null;
  const parsedClosedAt = closedAt ? new Date(closedAt) : null;
  const hasValidEndsAt = parsedEndsAt && !Number.isNaN(parsedEndsAt.getTime());
  const hasValidClosedAt = parsedClosedAt && !Number.isNaN(parsedClosedAt.getTime());
  const endedDate =
    hasValidEndsAt && parsedEndsAt.getTime() <= now.getTime()
      ? parsedEndsAt
      : hasValidClosedAt
        ? parsedClosedAt
        : hasValidEndsAt
          ? parsedEndsAt
          : null;

  if (!endedDate) return null;

  const timeLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(endedDate);

  const todayKey = getLondonDayKey(now);
  const yesterdayKey = getLondonDayKey(new Date(now.getTime() - 86400000));
  const endedDayKey = getLondonDayKey(endedDate);

  if (endedDayKey === todayKey || endedDayKey === yesterdayKey) {
    return `Ended ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
  }).format(endedDate);

  return `Ended ${dateLabel}, ${timeLabel}`;
}

export function formatDateInLondon(date: Date | string | null): string {
  if (!date) return "—";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(dateObj);
}
export function getEndsTimeLabel(endsAt: string | null): string | null {
  if (!endsAt) return null;
  
  const endDate = new Date(endsAt);
  if (Number.isNaN(endDate.getTime())) return null;

  const now = new Date();
  const daysLeft = Math.ceil(
    (getUtcDateValue(endDate) - getUtcDateValue(now)) / 86400000,
  );

  if (daysLeft === 0) {
    const timeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(endDate);
    
    return `Ends today ${timeStr}`;
  }

  return null;
}
