"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  day: number;
  pct: number;
};

const TICKETS_TOTAL = 3499;

const data: Point[] = [
  { day: 1, pct: 2.1 },
  { day: 3, pct: 6.8 },
  { day: 5, pct: 9.1 },
  { day: 7, pct: 10.6 },
  { day: 9, pct: 13.3 },
  { day: 11, pct: 15.7 },
  { day: 13, pct: 17.7 },
  { day: 15, pct: 20.0 },
  { day: 17, pct: 23.0 },
  { day: 19, pct: 25.8 },
  { day: 21, pct: 27.7 },
  { day: 23, pct: 30.3 },
  { day: 25, pct: 35.4 },
  { day: 27, pct: 38.2 },
  { day: 29, pct: 41.5 },
  { day: 31, pct: 47.6 },
  { day: 33, pct: 52.2 },
  { day: 34, pct: 59.3 },
  { day: 35, pct: 76.9 },
];

type CurveTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
};

function CurveTooltip({ active, payload }: CurveTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const sold = Math.round((point.pct / 100) * TICKETS_TOTAL);

  return (
    <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 shadow-sm">
      <p className="text-[12px] font-semibold text-rr-primary">
        Day {point.day}
      </p>
      <p className="mt-0.5 text-[12px] text-rr-secondary">
        {point.pct}% sold
      </p>
      <p className="text-[12px] text-rr-muted">
        {sold.toLocaleString("en-GB")} of {" "}
        {TICKETS_TOTAL.toLocaleString("en-GB")} tickets
      </p>
    </div>
  );
}

export function LpSalesCurve() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raf =
      typeof requestAnimationFrame === "undefined"
        ? (cb: () => void) => setTimeout(cb, 0)
        : requestAnimationFrame;

    const id = raf(() => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
    });

    return () => {
      if (typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(id as number);
      }
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setIsRevealed(true), 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-rr-border bg-rr-elevated p-5 sm:p-6"
    >
      <div className="mb-5">
        <p className="text-[15px] font-semibold text-rr-primary">
          iPhone 17 Pro Max
        </p>
        <p className="mt-0.5 text-[13px] text-rr-muted">
          £0.89 per ticket, 3,499 tickets, closed 13 August 2026
        </p>
      </div>

      <div className="h-[240px] w-full">
        {isRevealed ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 4, left: -18 }}
            >
              <defs>
                <linearGradient id="lpCurveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--accent)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                ticks={[1, 10, 20, 30, 35]}
                tickFormatter={(value: number) => `Day ${value}`}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}%`}
              />

              <ReferenceLine
                x={23}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{
                  value: "Alert sent",
                  position: "insideTopLeft",
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                  offset: 10,
                }}
              />

              <Tooltip
                content={<CurveTooltip />}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />

              <Area
                type="monotone"
                dataKey="pct"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#lpCurveFill)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--accent)",
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      <p className="mt-4 border-t border-rr-border pt-4 text-[13px] leading-6 text-rr-muted">
        Under 60% sold for 33 of its 35 days. The last day added 18 percentage
        points.
      </p>
    </div>
  );
}
