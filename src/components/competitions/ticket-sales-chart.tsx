"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type CompetitionHistory = {
  scrapedAt: string;
  ticketsSold: number;
  percentSold: number;
};

type TicketSalesChartProps = {
  history: CompetitionHistory[];
  hasEnded?: boolean;
  isSoldOut?: boolean;
};

type EndpointDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
};

const axisTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const tooltipTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function TicketSalesChart({ history, hasEnded = false, isSoldOut = false }: TicketSalesChartProps) {
  if (history.length < 3) {
    return (
      <div className="text-center text-rr-muted text-sm py-10">
        Not enough history yet — check back soon.
      </div>
    );
  }

  const data = [...history].sort(
    (a, b) => new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime(),
  );
  const maxSold = Math.max(...data.map((item) => item.percentSold));
  const yMax = Math.min(100, Math.ceil((maxSold * 1.2) / 5) * 5);
  const step = yMax <= 5 ? 1 : yMax <= 20 ? 5 : yMax <= 50 ? 10 : 20;
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += step) yTicks.push(v);

  const lastIndex = data.length - 1;
  const lastPercent = data[lastIndex].percentSold;
  const currentLabel = `${Math.round(lastPercent * 10) / 10}%`;

  const renderEndpointDot = (props: EndpointDotProps) => {
    const { cx, cy, index } = props;
    if (cx == null || cy == null || index !== lastIndex) {
      return <g />;
    }
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="var(--accent)" opacity={0.2} />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--accent)"
          stroke="var(--surface)"
          strokeWidth={2}
        />
      </g>
    );
  };

  return (
    <div className="ticket-sales-chart">
      <div className="ticket-sales-chart__chip">
        {hasEnded || isSoldOut ? `Final: ${currentLabel}` : `Current: ${currentLabel}`}
      </div>
      <div className="ticket-sales-chart__canvas">
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={data} margin={{ top: 12, right: 36, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ticketSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="scrapedAt"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 8, right: 8 }}
              tickFormatter={(value) => axisTimeFormat.format(new Date(value))}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(value) => `${value}%`}
              domain={[0, yMax]}
              ticks={yTicks}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--text-primary)",
              }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
              formatter={(value) => [`${value}%`, "Sold"]}
              labelFormatter={(label) => tooltipTimeFormat.format(new Date(label))}
            />
            <Area
              type="monotone"
              dataKey="percentSold"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#ticketSalesFill)"
              dot={renderEndpointDot}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <style jsx>{`
        .ticket-sales-chart {
          position: relative;
        }
        .ticket-sales-chart__canvas {
          height: 256px;
        }
        .ticket-sales-chart__chip {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 1;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
        }
        .ticket-sales-chart__canvas :global(.recharts-area-curve) {
          filter: drop-shadow(0 0 4px color-mix(in srgb, var(--accent) 60%, transparent));
        }
      `}</style>
    </div>
  );
}