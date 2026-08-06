"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ClickTotals = {
  today: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
};

type DailyClickRow = {
  date: string;
  clicks: number;
};

type DailySignupRow = {
  date: string;
  signups: number;
};

type OperatorClickRow = {
  operatorId: string;
  name: string;
  isHidden: boolean;
  last7Days: number;
  last30Days: number;
  allTime: number;
};

type CompetitionClickRow = {
  competitionId: string;
  prize: string;
  operatorName: string;
  last30Days: number;
};

type SourceClickRow = {
  source: string;
  last30Days: number;
};

type UniqueVisitorRow = {
  last7Days: number;
  last30Days: number;
};

type FunnelStep = {
  signups: number;
  verified: number;
  wishlisted: number;
  clicked: number;
};

type FunnelRow = {
  last7Days: FunnelStep;
  last30Days: FunnelStep;
};

type NewsletterRow = {
  last7Days: number;
  last30Days: number;
  confirmedLast30Days: number;
  totalConfirmed: number;
};

type EngagementRow = {
  comments: number;
  wishlists: number;
  savedSearches: number;
};

type TopWishlistedRow = {
  competitionId: string;
  prize: string;
  operatorName: string;
  adds: number;
};

type ClickStatsResult = {
  totals: ClickTotals;
  daily: DailyClickRow[];
  signupsDaily: DailySignupRow[];
  byOperator: OperatorClickRow[];
  byCompetition: CompetitionClickRow[];
  bySource: SourceClickRow[];
  uniqueVisitors: UniqueVisitorRow;
  funnel: FunnelRow;
  newsletter: NewsletterRow;
  engagement: EngagementRow;
  topWishlisted: TopWishlistedRow[];
};

type LoadResult =
  | { kind: "hidden" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ClickStatsResult };

const dateAxisFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "numeric",
  month: "short",
});

function toLondonDate(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function readMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const message = record.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatPercentage(percentage: number) {
  const pct = Math.round(percentage * 10) / 10;
  if (!Number.isFinite(pct)) {
    return "—";
  }
  return `${pct}%`;
}

function sourceLabel(source: string) {
  const key = source.toLowerCase();

  if (key === "detail") {
    return "Competition pages";
  }

  if (key === "operator_profile") {
    return "Operator pages";
  }

  if (key === "unknown") {
    return "Unknown";
  }

  return source;
}

export function ClickStats() {
  const [data, setData] = useState<ClickStatsResult | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [funnelWindow, setFunnelWindow] = useState<"7d" | "30d">("30d");

  const requestStats = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch("/api/admin/click-stats", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        return { kind: "hidden" };
      }

      if (!response.ok) {
        let message = "Failed to load click stats.";

        try {
          const payload = await parseJsonResponse<unknown>(response);
          message = readMessage(payload, message);
        } catch {
          message = "Failed to load click stats.";
        }

        return { kind: "error", message };
      }

      const payload = await parseJsonResponse<ClickStatsResult>(response);

      if (!payload) {
        return {
          kind: "error",
          message: "Failed to load click stats.",
        };
      }

      return { kind: "ready", data: payload };
    } catch {
      return {
        kind: "error",
        message: "Failed to load click stats.",
      };
    }
  }, []);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const result = await requestStats();

    if (result.kind === "hidden") {
      setIsHidden(true);
      setData(null);
      setLoadError("");
      setIsResolved(true);
      setIsLoading(false);
      return;
    }

    if (result.kind === "error") {
      setIsHidden(false);
      setData(null);
      setLoadError(result.message);
      setIsResolved(true);
      setIsLoading(false);
      return;
    }

    setIsHidden(false);
    setData(result.data);
    setLoadError("");
    setIsResolved(true);
    setIsLoading(false);
  }, [requestStats]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const result = await requestStats();

      if (!cancelled) {
        if (result.kind === "hidden") {
          setIsHidden(true);
          setData(null);
          setLoadError("");
          setIsResolved(true);
          return;
        }

        if (result.kind === "error") {
          setIsHidden(false);
          setData(null);
          setLoadError(result.message);
          setIsResolved(true);
          return;
        }

        setIsHidden(false);
        setData(result.data);
        setLoadError("");
        setIsResolved(true);
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [requestStats]);

  const mergedChartData = useMemo(() => {
    if (!data) {
      return [] as Array<DailyClickRow & Partial<DailySignupRow>>;
    }
    const byDate = new Map<string, DailyClickRow & Partial<DailySignupRow>>();
    for (const row of data.daily) {
      byDate.set(row.date, { ...row });
    }
    for (const row of data.signupsDaily) {
      const existing = byDate.get(row.date);
      if (existing) {
        existing.signups = row.signups;
      } else {
        byDate.set(row.date, { date: row.date, clicks: 0, signups: row.signups });
      }
    }
    return Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date));
  }, [data]);

  if (isHidden || !isResolved) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-xl border border-rr-border bg-rr-elevated p-4 text-sm text-rr-secondary">
        Loading click stats…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-6">
        <p role="alert" className="text-sm text-rr-primary">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => void loadStats()}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-rr-border bg-rr-elevated px-4 text-sm text-rr-primary transition hover:bg-rr-elevated hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const noData =
    data.totals.allTime === 0 &&
    data.daily.every((row) => row.clicks === 0) &&
    data.funnel.last30Days.signups === 0 &&
    data.newsletter.totalConfirmed === 0 &&
    data.engagement.comments === 0 &&
    data.engagement.wishlists === 0 &&
    data.engagement.savedSearches === 0 &&
    data.topWishlisted.length === 0;

  if (noData) {
    return (
      <p className="mt-6 text-sm text-rr-secondary">No clicks recorded yet.</p>
    );
  }

  const funnelStep =
    funnelWindow === "7d" ? data.funnel.last7Days : data.funnel.last30Days;
  const funnelLabels = {
    signups: "Signups",
    verified: "Verified",
    wishlisted: "Wishlisted",
    clicked: "Clicked through",
  } as const;
  const verifiedOfSignups =
    funnelStep.signups === 0
      ? NaN
      : (funnelStep.verified / funnelStep.signups) * 100;
  const wishlistedOfVerified =
    funnelStep.verified === 0
      ? NaN
      : (funnelStep.wishlisted / funnelStep.verified) * 100;
  const clickedOfWishlisted =
    funnelStep.wishlisted === 0
      ? NaN
      : (funnelStep.clicked / funnelStep.wishlisted) * 100;

  return (
    <div className="mt-6 space-y-8">
      <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-rr-border bg-rr-surface p-5">
          <div className="text-2xl font-semibold text-rr-primary">
            {formatNumber(data.totals.today)}
          </div>
          <div className="mt-1 text-xs text-rr-muted">Today</div>
        </div>
        <div className="rounded-2xl border border-rr-border bg-rr-surface p-5">
          <div className="text-2xl font-semibold text-rr-primary">
            {formatNumber(data.totals.last7Days)}
          </div>
          <div className="mt-1 text-xs text-rr-muted">
            Last 7 days
            {" · "}
            {formatNumber(data.uniqueVisitors.last7Days)} visitors
          </div>
        </div>
        <div className="rounded-2xl border border-rr-border bg-rr-surface p-5">
          <div className="text-2xl font-semibold text-rr-primary">
            {formatNumber(data.totals.last30Days)}
          </div>
          <div className="mt-1 text-xs text-rr-muted">
            Last 30 days
            {" · "}
            {formatNumber(data.uniqueVisitors.last30Days)} visitors
          </div>
        </div>
        <div className="rounded-2xl border border-rr-border bg-rr-surface p-5">
          <div className="text-2xl font-semibold text-rr-primary">
            {formatNumber(data.totals.allTime)}
          </div>
          <div className="mt-1 text-xs text-rr-muted">All time</div>
        </div>
      </section>

      <section className="rounded-2xl border border-rr-border bg-rr-surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-rr-primary">
            Daily clicks and signups — last 30 days
          </h3>
          <div
            aria-hidden
            className="flex items-center gap-2 text-[11px] text-rr-muted"
          >
            <div className="inline-block h-[2.5px] w-4 rounded-full bg-[var(--accent)]" />
            <span>Clicks</span>
            <div
              className="inline-block h-[2.5px] w-4 bg-[var(--text-muted)] ml-2"
            />
            <span>Signups</span>
          </div>
        </div>
        <div
          className="w-full"
          style={{
            height: 220,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mergedChartData}
              margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeOpacity={0.5}
                vertical={true}
                horizontal={true}
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 4, right: 4 }}
                tickFormatter={(value) =>
                  dateAxisFormat.format(toLondonDate(value))
                }
                interval={"preserveStartEnd" as never}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                labelStyle={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
                formatter={(value, name) => {
                  if (name === "clicks") {
                    return [
                      `${formatNumber(Number(value) || 0)} clicks`,
                      "Clicks",
                    ];
                  }
                  if (name === "signups") {
                    return [
                      `${formatNumber(Number(value) || 0)} signups`,
                      "Signups",
                    ];
                  }
                  return [String(value), String(name)];
                }}
                labelFormatter={(label) =>
                  dateAxisFormat.format(toLondonDate(String(label)))
                }
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="plainline"
                formatter={(value) => {
                  if (value === "clicks") {
                    return (
                      <span className="text-xs text-rr-secondary">Clicks</span>
                    );
                  }
                  if (value === "signups") {
                    return (
                      <span className="text-xs text-rr-secondary">Signups</span>
                    );
                  }
                  return <span className="text-xs text-rr-secondary">{value}</span>;
                }}
                wrapperStyle={{ paddingBottom: 6 }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--accent)" }}
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="var(--text-muted)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--text-muted)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-rr-border bg-rr-surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-rr-primary">Funnel</h3>
          <div className="inline-flex items-center rounded-xl border border-rr-border overflow-hidden">
            {(["7d", "30d"] as const).map((option) => {
              const active = funnelWindow === option;
              const label = option === "7d" ? "7 days" : "30 days";
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFunnelWindow(option)}
                  className={cn(
                    "px-3 py-1.5 text-xs transition",
                    active
                      ? "border-rr-green bg-rr-elevated font-medium text-rr-primary"
                      : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(funnelStep.signups)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {funnelLabels.signups}
            </div>
          </div>
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(funnelStep.verified)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {funnelLabels.verified}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {formatPercentage(verifiedOfSignups)} of signups
            </div>
          </div>
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(funnelStep.wishlisted)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {funnelLabels.wishlisted}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {formatPercentage(wishlistedOfVerified)} of verified
            </div>
          </div>
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(funnelStep.clicked)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {funnelLabels.clicked}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              {formatPercentage(clickedOfWishlisted)} of wishlisted
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rr-border bg-rr-surface p-5">
        <h3 className="mb-2 text-sm font-medium text-rr-primary">
          Newsletter
        </h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 text-sm text-rr-secondary">
          <div>
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.newsletter.last7Days)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">New — last 7 days</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.newsletter.last30Days)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">New — last 30 days</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.newsletter.confirmedLast30Days)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">Confirmed — last 30 days</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.newsletter.totalConfirmed)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">Confirmed list size</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rr-border bg-rr-surface p-5">
        <h3 className="mb-2 text-sm font-medium text-rr-primary">
          Engagement — last 30 days
        </h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.engagement.comments)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">Comments posted</div>
          </div>
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.engagement.wishlists)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">
              Competitions wishlisted
            </div>
          </div>
          <div className="rounded-xl border border-rr-border bg-rr-bg p-4">
            <div className="text-2xl font-semibold text-rr-primary">
              {formatNumber(data.engagement.savedSearches)}
            </div>
            <div className="mt-1 text-xs text-rr-muted">Searches saved</div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface">
        <div className="px-5 py-4">
          <h3 className="text-sm font-medium text-rr-primary">Top operators</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-t border-rr-border bg-rr-elevated text-xs uppercase tracking-[0.14em] text-rr-muted">
                <th className="px-5 py-3 text-left font-medium">Operator</th>
                <th className="px-5 py-3 text-right font-medium">7 days</th>
                <th className="px-5 py-3 text-right font-medium">30 days</th>
                <th className="px-5 py-3 text-right font-medium">All time</th>
              </tr>
            </thead>
            <tbody>
              {data.byOperator.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-xs text-rr-secondary"
                  >
                    No operator clicks in the last 30 days.
                  </td>
                </tr>
              ) : (
                  data.byOperator.map((row) => (
                    <tr
                      key={row.operatorId}
                      className="border-t border-rr-border"
                    >
                      <td className="px-5 py-3 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-rr-primary">{row.name}</span>
                          {row.isHidden ? (
                            <span className="inline-flex items-center rounded-full bg-rr-elevated px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                              Hidden
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-rr-secondary tabular-nums">
                        {formatNumber(row.last7Days)}
                      </td>
                      <td className="px-5 py-3 text-right text-rr-primary tabular-nums">
                        {formatNumber(row.last30Days)}
                      </td>
                      <td className="px-5 py-3 text-right text-rr-secondary tabular-nums">
                        {formatNumber(row.allTime)}
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface">
          <div className="px-5 py-4">
            <h3 className="text-sm font-medium text-rr-primary">
              Top clicked competitions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-t border-rr-border bg-rr-elevated text-xs uppercase tracking-[0.14em] text-rr-muted">
                  <th className="px-5 py-3 text-left font-medium">Prize</th>
                  <th className="px-5 py-3 text-left font-medium">Operator</th>
                  <th className="px-5 py-3 text-right font-medium">30 days</th>
                </tr>
              </thead>
              <tbody>
                {data.byCompetition.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-6 text-center text-xs text-rr-secondary"
                    >
                      No competition clicks in the last 30 days.
                    </td>
                  </tr>
                ) : (
                  data.byCompetition.map((row) => (
                    <tr
                      key={row.competitionId}
                      className="border-t border-rr-border"
                    >
                      <td className="px-5 py-3 text-left">
                        <a
                          href={`/competitions/${encodeURIComponent(row.competitionId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words text-sm text-rr-primary hover:text-rr-primary hover:underline"
                        >
                          {row.prize}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-left text-sm text-rr-secondary">
                        {row.operatorName}
                      </td>
                      <td className="px-5 py-3 text-right text-rr-primary tabular-nums">
                        {formatNumber(row.last30Days)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface">
          <div className="px-5 py-4">
            <h3 className="text-sm font-medium text-rr-primary">
              Most wishlisted
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-t border-rr-border bg-rr-elevated text-xs uppercase tracking-[0.14em] text-rr-muted">
                  <th className="px-5 py-3 text-left font-medium">Prize</th>
                  <th className="px-5 py-3 text-left font-medium">Operator</th>
                  <th className="px-5 py-3 text-right font-medium">30 days</th>
                </tr>
              </thead>
              <tbody>
                {data.topWishlisted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-6 text-center text-xs text-rr-secondary"
                    >
                      No wishlist additions in the last 30 days.
                    </td>
                  </tr>
                ) : (
                  data.topWishlisted.map((row) => (
                    <tr
                      key={row.competitionId}
                      className="border-t border-rr-border"
                    >
                      <td className="px-5 py-3 text-left">
                        <a
                          href={`/competitions/${encodeURIComponent(row.competitionId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words text-sm text-rr-primary hover:text-rr-primary hover:underline"
                        >
                          {row.prize}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-left text-sm text-rr-secondary">
                        {row.operatorName}
                      </td>
                      <td className="px-5 py-3 text-right text-rr-primary tabular-nums">
                        {formatNumber(row.adds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-rr-border bg-rr-surface p-5 text-sm text-rr-secondary">
        {data.bySource.length === 0 ? (
          <p className="text-xs text-rr-muted">No source breakdown yet.</p>
        ) : (
          <p className="flex flex-wrap items-baseline gap-y-2 gap-x-1 text-xs text-rr-muted">
            {data.bySource.map((row, index) => {
              return (
                <span key={row.source}>
                  {index > 0 ? " · " : ""}
                  <span className="text-sm text-rr-primary">
                    {sourceLabel(row.source)}
                  </span>
                  : {formatNumber(row.last30Days)}
                </span>
              );
            })}
          </p>
        )}
      </section>
    </div>
  );
}

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}
