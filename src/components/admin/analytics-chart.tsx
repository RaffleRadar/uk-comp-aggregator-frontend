"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, number | string | null | undefined>>;
  type: "bar" | "line";
  xKey: string;
  yKeys: Array<{ key: string; label: string }>;
  xFormatter?: (value: number | string | null | undefined) => string;
  yFormatter?: (value: number | string | null | undefined) => string;
  orientation?: "vertical" | "horizontal";
  emptyLabel?: string;
}

const AXIS_TICK = { fill: "var(--text-muted)", fontSize: 12 };
const AXIS_LINE = { stroke: "var(--border)" };
const SERIES_OPACITY = [1, 0.62, 0.32];

const TOOLTIP_CONTENT_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--text-secondary)",
};

const TOOLTIP_LABEL_STYLE = {
  color: "var(--text-primary)",
  fontWeight: 600,
  marginBottom: 4,
};

const LEGEND_STYLE = {
  fontSize: 12,
  color: "var(--text-muted)",
  paddingTop: 12,
};

export function AnalyticsChart({
  title,
  description,
  data,
  type,
  xKey,
  yKeys,
  xFormatter,
  yFormatter,
  orientation = "vertical",
  emptyLabel = "No data available yet.",
}: AnalyticsChartProps) {
  const isHorizontalBars = type === "bar" && orientation === "horizontal";
  const hasLegend = yKeys.length > 1;
  const chartHeight = isHorizontalBars
    ? Math.max(200, data.length * 38 + (hasLegend ? 60 : 30))
    : 260;

  const tooltipFormatter = (
    value: unknown,
    name: unknown,
  ): [string | number, string] => {
    const arr = Array.isArray(value) ? (value as ReadonlyArray<unknown>) : null;
    const scalar = arr ? arr[0] : value;
    const v =
      scalar == null
        ? ""
        : typeof scalar === "object"
          ? ""
          : (scalar as number | string);
    return [yFormatter ? yFormatter(v) : v, name == null ? "" : String(name)];
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-rr-border bg-rr-surface p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-rr-primary">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-rr-muted">{description}</p>
        ) : null}
      </div>

      {data.length === 0 ? (
        <div className="flex h-[200px] flex-1 items-center justify-center rounded-lg border border-dashed border-rr-border text-sm text-rr-muted">
          {emptyLabel}
        </div>
      ) : (
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart
                data={data}
                layout={isHorizontalBars ? "vertical" : "horizontal"}
                barCategoryGap={isHorizontalBars ? "22%" : "18%"}
                margin={
                  isHorizontalBars
                    ? { top: 4, right: 28, bottom: 4, left: 4 }
                    : { top: 4, right: 8, bottom: 4, left: -12 }
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
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={
                      yFormatter ? (v) => yFormatter(v) : undefined
                    }
                  />
                ) : (
                  <XAxis
                    dataKey={xKey}
                    interval="preserveStartEnd"
                    tick={AXIS_TICK}
                    axisLine={AXIS_LINE}
                    tickLine={false}
                    tickFormatter={
                      xFormatter ? (v) => xFormatter(v) : undefined
                    }
                  />
                )}
                {isHorizontalBars ? (
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    width={150}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={
                      xFormatter ? (v) => xFormatter(v) : undefined
                    }
                  />
                ) : (
                  <YAxis
                    width={52}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={
                      yFormatter ? (v) => yFormatter(v) : undefined
                    }
                  />
                )}
                <Tooltip
                  cursor={{ fill: "var(--elevated)" }}
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  formatter={tooltipFormatter}
                />
                {yKeys.map((k, index) => (
                  <Bar
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    fill="var(--accent)"
                    fillOpacity={SERIES_OPACITY[index % SERIES_OPACITY.length]}
                    radius={isHorizontalBars ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                    maxBarSize={isHorizontalBars ? 22 : 34}
                    isAnimationActive={false}
                  />
                ))}
                {hasLegend ? (
                  <Legend
                    content={({ payload: legendPayload }) => (
                      <ul
                        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                        style={LEGEND_STYLE}
                      >
                        {yKeys.map((k) => {
                          const entry = legendPayload?.find(
                            (e) => e.dataKey === k.key,
                          );
                          const inactive = Boolean(entry?.inactive);
                          return (
                            <li
                              key={k.key}
                              className="flex items-center gap-2"
                              style={{
                                opacity: inactive ? 0.3 : 1,
                                fontSize: LEGEND_STYLE.fontSize,
                                color: LEGEND_STYLE.color,
                              }}
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: "var(--accent)" }}
                              />
                              <span>{k.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={LEGEND_STYLE}
                  />
                ) : null}
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 4, right: 8, bottom: 4, left: -12 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey={xKey}
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={AXIS_TICK}
                  axisLine={AXIS_LINE}
                  tickLine={false}
                  tickFormatter={xFormatter ? (v) => xFormatter(v) : undefined}
                />
                <YAxis
                  width={52}
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yFormatter ? (v) => yFormatter(v) : undefined}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  formatter={tooltipFormatter}
                />
                {yKeys.map((k, index) => (
                  <Line
                    key={k.key}
                    dataKey={k.key}
                    name={k.label}
                    stroke="var(--accent)"
                    strokeOpacity={
                      SERIES_OPACITY[index % SERIES_OPACITY.length]
                    }
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
                {hasLegend ? (
                  <Legend
                    content={({ payload: legendPayload }) => (
                      <ul
                        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                        style={LEGEND_STYLE}
                      >
                        {yKeys.map((k) => {
                          const entry = legendPayload?.find(
                            (e) => e.dataKey === k.key,
                          );
                          const inactive = Boolean(entry?.inactive);
                          return (
                            <li
                              key={k.key}
                              className="flex items-center gap-2"
                              style={{
                                opacity: inactive ? 0.3 : 1,
                                fontSize: LEGEND_STYLE.fontSize,
                                color: LEGEND_STYLE.color,
                              }}
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: "var(--accent)" }}
                              />
                              <span>{k.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={LEGEND_STYLE}
                  />
                ) : null}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
