"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { RadarLoader } from "@/components/ui/RadarLoader";

type ReportOperatorRow = {
  operatorId: string;
  operatorName: string;
  reportCount: number;
  competitionCount: number;
  reportsPerHundred: number;
};

type ReportReasonRow = {
  reason: string;
  count: number;
};

type ReportDayRow = {
  day: string;
  count: number;
};

type ReportsResponse = {
  byOperator: ReportOperatorRow[];
  byReason: ReportReasonRow[];
  byDay: ReportDayRow[];
};

const REASON_LABELS: Record<string, string> = {
  ticket_price: "Ticket price",
  tickets_total: "Ticket count",
  already_closed: "Already closed",
  broken_image: "Broken image",
  wrong_category: "Wrong category",
  other: "Something else",
};

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ReportsAnalytics() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<ReportsResponse | null>(null);
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
      const response = await fetch("/api/admin/analytics/reports");

      if (response.status === 401 || response.status === 403) {
        setError("Access denied.");
        setData(null);
        return;
      }

      if (!response.ok) {
        setError("Failed to load report data.");
        setData(null);
        return;
      }

      const json = (await response.json()) as ReportsResponse;
      setData(json);
    } catch {
      setError("Failed to load report data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const id = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(id);
  }, [isVisible, fetchData]);

  const topOperators = useMemo((): ReportOperatorRow[] => {
    if (!data?.byOperator?.length) {
      return [];
    }

    return data.byOperator.slice(0, 10);
  }, [data]);

  const byReason = useMemo((): ReportReasonRow[] => {
    if (!data?.byReason?.length) {
      return [];
    }

    return data.byReason;
  }, [data]);

  const paddedByDay = useMemo((): ReportDayRow[] => {
    const today = new Date();
    const baseline: ReportDayRow[] = [];

    for (let offset = 29; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      baseline.push({ day: toDayKey(date), count: 0 });
    }

    if (!data?.byDay?.length) {
      return baseline;
    }

    const byDayMap = new Map<string, number>();

    for (const row of data.byDay) {
      byDayMap.set(row.day.slice(0, 10), row.count);
    }

    return baseline.map((base) => ({
      day: base.day,
      count: byDayMap.get(base.day) ?? 0,
    }));
  }, [data]);

  const totalReports = useMemo((): number => {
    if (!data?.byReason?.length) {
      return 0;
    }

    return data.byReason.reduce((sum, row) => sum + row.count, 0);
  }, [data]);

  return (
    <div ref={containerRef} className="min-w-0">
      <p className="mb-5 text-sm text-rr-secondary">
        {totalReports > 0
          ? `${totalReports.toLocaleString("en-GB")} issues reported by users so far.`
          : "Issues reported by users. Nothing reported yet."}
      </p>

      {loading ? (
        <div className="flex h-[320px] items-center justify-center">
          <RadarLoader size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AnalyticsChart
              title="Reports per 100 active listings"
              type="bar"
              orientation="horizontal"
              data={topOperators}
              xKey="operatorName"
              yKeys={[{ key: "reportsPerHundred", label: "Reports per 100" }]}
              yFormatter={(v) => `${Number(v ?? 0).toFixed(1)}`}
            />
          </div>
          <AnalyticsChart
            title="Reports by reason"
            type="bar"
            data={byReason}
            xKey="reason"
            yKeys={[{ key: "count", label: "Reports" }]}
            xFormatter={(v) => REASON_LABELS[String(v)] ?? String(v ?? "")}
            yFormatter={(v) => `${Number(v ?? 0).toLocaleString("en-GB")}`}
          />
          <AnalyticsChart
            title="Reports by day (last 30 days)"
            type="line"
            data={paddedByDay}
            xKey="day"
            yKeys={[{ key: "count", label: "Reports" }]}
            xFormatter={(v) => String(v ?? "").slice(5, 10)}
            yFormatter={(v) => `${Number(v ?? 0).toLocaleString("en-GB")}`}
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
  );
}
