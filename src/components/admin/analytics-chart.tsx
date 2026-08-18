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
  orientation?: "vertical" | "horizontal";
}

const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 12 };
const AXIS_LINE = { stroke: "var(--border)" };

const SERIES_PALETTE = [
  "var(--accent)",
  "var(--rr-green)",
  "#60a5fa",
  "#f97316",
  "#a855f7",
  "#ef4444",
];

const TOOLTIP_CONTENT_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

const TOOLTIP_LABEL_STYLE = {
  color: "var(--text-primary)",
  fontWeight: 600,
};

export function AnalyticsChart({
  title,
  data,
  type,
  xKey,
  yKeys,
  xFormatter,
  yFormatter,
  orientation = "vertical",
}: AnalyticsChartProps) {
  const isHorizontalBars = type === "bar" && orientation === "horizontal";
  const rowHeight = isHorizontalBars ? 44 : 0;
  const chartHeight = isHorizontalBars
    ? Math.max(320, data.length * rowHeight + 64)
    : 280;
  const hasMultipleSeries = yKeys.length > 1;

  const tooltipFormatter = (
    value: unknown,
    name: unknown,
  ): [string | number, string] => {
    const arr = Array.isArray(value) ? (value as ReadonlyArray<unknown>) : null;
    const scalar = arr ? arr[0] : value;
    const v = scalar == null
      ? ""
      : typeof scalar === "object"
        ? ""
        : (scalar as number | string);
    return [yFormatter ? yFormatter(v) : v, name == null ? "" : String(name)];
  };

  return (
    <div className="rounded-[10px] border border-rr-border bg-rr-surface p-4 md:p-5">
      <h3 className="mb-3 text-sm font-semibold text-rr-primary">{title}</h3>
      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-md border border-dashed border-rr-border text-sm text-rr-muted">
          No data available yet.
        </div>
      ) : (
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart
                data={data}
                layout={isHorizontalBars ? "vertical" : "horizontal"}
                margin={
                  isHorizontalBars
                    ? { top: 12, right: 32, bottom: 12, left: 8 }
                    : { top: 12, right: 20, bottom: 12, left: 0 }
                }
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={isHorizontalBars}
                  horizontal={!isHorizontalBars}
                />
                {isHorizontalBars ? (
                  <XAxis
                    type="number"
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={AXIS_LINE}
                    tickFormatter={
                      yFormatter ? (v) => yFormatter(v) : undefined
                    }
                  />
                ) : (
                  <XAxis
                    dataKey={xKey}
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={AXIS_LINE}
                    tickFormatter={
                      xFormatter ? (v) => xFormatter(v) : undefined
                    }
                  />
                )}
                {isHorizontalBars ? (
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    width={170}
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={AXIS_LINE}
                    tickFormatter={
                      xFormatter ? (v) => xFormatter(v) : undefined
                    }
                  />
                ) : (
                  <YAxis
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={AXIS_LINE}
                    tickFormatter={
                      yFormatter ? (v) => yFormatter(v) : undefined
                    }
                  />
                )}
                <Tooltip
                  cursor={false}
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  formatter={tooltipFormatter}
                />
                {yKeys.map((k, i) => (
                  <Bar
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    stackId={hasMultipleSeries ? "series" : undefined}
                    fill={SERIES_PALETTE[i % SERIES_PALETTE.length]}
                    radius={isHorizontalBars ? [0, 4, 4, 0] : [4, 4, 0, 0]}
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
                  tick={AXIS_TICK}
                  axisLine={AXIS_LINE}
                  tickLine={AXIS_LINE}
                  tickFormatter={xFormatter ? (v) => xFormatter(v) : undefined}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  axisLine={AXIS_LINE}
                  tickLine={AXIS_LINE}
                  tickFormatter={yFormatter ? (v) => yFormatter(v) : undefined}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  formatter={tooltipFormatter}
                />
                {yKeys.map((k, i) => (
                  <Line
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    stroke={SERIES_PALETTE[i % SERIES_PALETTE.length]}
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
