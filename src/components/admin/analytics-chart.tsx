"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartProps {
  title: string;
  data: Array<Record<string, number | string | null | undefined>>;
  type: "bar" | "line";
  xKey: string;
  yKeys: Array<{ key: string; label: string }>;
  xFormatter?: (value: number | string | null | undefined) => string;
  yFormatter?: (value: number | string | null | undefined) => string;
}

export function AnalyticsChart({
  title,
  data,
  type,
  xKey,
  yKeys,
  xFormatter,
  yFormatter,
}: AnalyticsChartProps) {
  return (
    <div className="rounded-[10px] border border-rr-border bg-rr-surface p-4 md:p-5">
      <h3 className="mb-3 text-sm font-semibold text-rr-primary">{title}</h3>
      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-md border border-dashed border-rr-border text-sm text-rr-muted">
          No data available yet.
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart
                data={data}
                margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey={xKey}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  tickFormatter={xFormatter ? (v) => xFormatter(v) : undefined}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  tickFormatter={yFormatter ? (v) => yFormatter(v) : undefined}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => {
                    const normalized = Array.isArray(value) ? value[0] : value;
                    return [
                      yFormatter ? yFormatter(normalized) : normalized,
                      name,
                    ];
                  }}
                />
                {yKeys.map((k) => (
                  <Bar
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey={xKey}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  tickFormatter={xFormatter ? (v) => xFormatter(v) : undefined}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  tickFormatter={yFormatter ? (v) => yFormatter(v) : undefined}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => {
                    const normalized = Array.isArray(value) ? value[0] : value;
                    return [
                      yFormatter ? yFormatter(normalized) : normalized,
                      name,
                    ];
                  }}
                />
                {yKeys.map((k) => (
                  <Line
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
