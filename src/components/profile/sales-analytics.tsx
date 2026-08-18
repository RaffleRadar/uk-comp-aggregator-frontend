"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { RadarLoader } from "@/components/ui/RadarLoader";

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

export function SalesAnalytics() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [data, setData] = useState<SalesPatternsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

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
        return;
      }

      if (!response.ok) {
        setError("Failed to load analytics data.");
        setData(null);
        return;
      }

      const json = (await response.json()) as SalesPatternsResponse;
      setData(json);
    } catch {
      setError("Failed to load analytics data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedOperatorId]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const id = requestAnimationFrame(() => {
      void fetchData();
    });
    return () => cancelAnimationFrame(id);
  }, [isVisible, fetchData]);

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

  const operatorOptions = useMemo((): SellThroughRow[] => {
    if (!data?.sellThroughCurve?.length) {
      return [];
    }

    return [...data.sellThroughCurve].sort((a, b) =>
      a.operatorName.localeCompare(b.operatorName),
    );
  }, [data]);

  return (
    <div ref={containerRef} className="min-w-0">
      <div className="mb-5 flex flex-col gap-3 border-b border-rr-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-rr-secondary">
          Hourly sales snapshots across every operator we track.
        </p>
        {operatorOptions.length > 0 ? (
          <select
            value={selectedOperatorId}
            onChange={(event) => setSelectedOperatorId(event.target.value)}
            className="w-full shrink-0 rounded-lg border border-rr-border bg-rr-bg px-3 py-2 text-sm text-rr-primary focus:border-rr-green focus:outline-none sm:w-[220px]"
          >
            <option value="">All operators</option>
            {operatorOptions.map((operator) => (
              <option key={operator.operatorId} value={operator.operatorId}>
                {operator.operatorName}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <RadarLoader size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnalyticsChart
            title="Tickets sold by hour"
            description="London time, all tracked competitions"
            type="bar"
            data={paddedByHour}
            xKey="hour"
            yKeys={[{ key: "ticketsMoved", label: "Tickets" }]}
            xFormatter={(v) => `${String(v).padStart(2, "0")}:00`}
            yFormatter={(v) => Number(v ?? 0).toLocaleString("en-GB")}
          />
          <AnalyticsChart
            title="Tickets sold by day of week"
            description="Totals across the tracked period"
            type="bar"
            data={paddedByDayOfWeek}
            xKey="dayOfWeek"
            yKeys={[{ key: "ticketsMoved", label: "Tickets" }]}
            xFormatter={(v) => DAY_LABELS[Number(v) % 7] ?? ""}
            yFormatter={(v) => Number(v ?? 0).toLocaleString("en-GB")}
          />
          <div className="lg:col-span-2">
            <AnalyticsChart
              title="How far competitions sell through"
              description="Average percentage sold by the end of each third of a competition's run"
              type="bar"
              data={topSellThrough}
              xKey="operatorName"
              yKeys={[
                { key: "phase1Pct", label: "By first third" },
                { key: "phase2Pct", label: "By second third" },
                { key: "phase3Pct", label: "At close" },
              ]}
              yFormatter={(v) => `${Number(v ?? 0).toFixed(0)}%`}
              emptyLabel="No finished competitions with hourly history yet."
            />
          </div>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-rr-border bg-rr-elevated p-4 text-sm text-rr-primary"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
