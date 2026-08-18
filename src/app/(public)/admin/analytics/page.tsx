"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { AnalyticsChart } from "@/components/admin/analytics-chart";

type HourlyRow = {
  hour: number;
  snapshotCount: number;
  ticketsMoved: number;
};

type DayOfWeekRow = {
  dayOfWeek: number;
  snapshotCount: number;
  ticketsMoved: number;
};

type SellThroughRow = {
  operatorId: string;
  operatorName: string;
  phase1Pct: number;
  phase2Pct: number;
  phase3Pct: number;
  competitions: number;
};

type SalesPatternsResponse = {
  byHour: HourlyRow[];
  byDayOfWeek: DayOfWeekRow[];
  sellThroughCurve: SellThroughRow[];
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminAnalyticsPage() {
  const { status, user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [data, setData] = useState<SalesPatternsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !isAdmin)
    ) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = selectedOperatorId
        ? `?operatorId=${encodeURIComponent(selectedOperatorId)}`
        : "";
      const response = await fetch(
        `/api/admin/analytics/sales-patterns${query}`,
      );
      if (response.status === 401 || response.status === 403) {
        setError("Access denied.");
        setData(null);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        setError("Failed to load analytics data.");
        setData(null);
        setLoading(false);
        return;
      }
      const json = (await response.json()) as SalesPatternsResponse;
      setData(json);
      setLoading(false);
    } catch {
      setError("Failed to load analytics data.");
      setData(null);
      setLoading(false);
    }
  }, [selectedOperatorId]);

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchData]);

  const paddedByHour = useMemo((): HourlyRow[] => {
    const baseline = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      snapshotCount: 0,
      ticketsMoved: 0,
    }));
    if (!data?.byHour?.length) {
      return baseline;
    }
    const byHourMap = new Map<number, HourlyRow>();
    for (const row of data.byHour) {
      byHourMap.set(row.hour, row);
    }
    return baseline.map((base) => byHourMap.get(base.hour) ?? base);
  }, [data]);

  const paddedByDayOfWeek = useMemo((): DayOfWeekRow[] => {
    const baseline = Array.from({ length: 7 }, (_, d) => ({
      dayOfWeek: d,
      snapshotCount: 0,
      ticketsMoved: 0,
    }));
    if (!data?.byDayOfWeek?.length) {
      return baseline;
    }
    const byDayMap = new Map<number, DayOfWeekRow>();
    for (const row of data.byDayOfWeek) {
      byDayMap.set(row.dayOfWeek, row);
    }
    return baseline.map((base) => byDayMap.get(base.dayOfWeek) ?? base);
  }, [data]);

  const topSellThrough = useMemo((): SellThroughRow[] => {
    if (!data?.sellThroughCurve?.length) {
      return [];
    }
    return [...data.sellThroughCurve]
      .sort((a, b) => b.competitions - a.competitions)
      .slice(0, 8);
  }, [data]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RadarLoader size="md" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-rr-primary md:text-3xl">
              Sales Analytics
            </h1>
            <p className="mt-1 text-sm text-rr-muted">
              Patterns from hourly sales snapshots across UK competition
              operators.
            </p>
          </div>
          <div>
            <Badge variant="green">Admin</Badge>
          </div>
          <div>
            <select
              defaultValue=""
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full sm:w-[220px] rounded-[8px] border border-rr-border bg-rr-surface px-3 py-2 text-sm text-rr-primary focus:border-rr-green focus:outline-none"
            >
              <option value="">All operators</option>
              {data?.sellThroughCurve?.map((op) => (
                <option key={op.operatorId} value={op.operatorId}>
                  {op.operatorName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <RadarLoader size="md" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <AnalyticsChart
              key="byHour"
              title="Sales by hour of day (London)"
              type="bar"
              data={paddedByHour}
              xKey="hour"
              yKeys={[{ key: "ticketsMoved", label: "Tickets moved" }]}
              xFormatter={(v) => `${String(v).padStart(2, "0")}:00`}
              yFormatter={(v) => `${Number(v ?? 0).toLocaleString("en-GB")}`}
            />
            <AnalyticsChart
              key="byDayOfWeek"
              title="Sales by day of week"
              type="bar"
              data={paddedByDayOfWeek}
              xKey="dayOfWeek"
              yKeys={[{ key: "ticketsMoved", label: "Tickets moved" }]}
              xFormatter={(v) => DAY_LABELS[Number(v) % 7] ?? ""}
              yFormatter={(v) => `${Number(v ?? 0).toLocaleString("en-GB")}`}
            />
            <AnalyticsChart
              key="sellThrough"
              title="Sell-through curve by phase"
              type="bar"
              data={topSellThrough}
              xKey="operatorName"
              yKeys={[
                { key: "phase1Pct", label: "First third" },
                { key: "phase2Pct", label: "Second third" },
                { key: "phase3Pct", label: "Last third" },
              ]}
              xFormatter={(v) => {
                const s = String(v ?? "");
                return s.length > 12 ? `${s.slice(0, 12)}…` : s;
              }}
              yFormatter={(v) => `${Number(v ?? 0).toFixed(0)}%`}
            />
          </div>
        )}

        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-[8px] border border-rr-border bg-rr-elevated p-4 text-sm text-rr-primary"
          >
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
