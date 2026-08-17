"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";

type Meter = {
  name: string;
  percentSold: number;
  meta: string;
};

const meters: Meter[] = [
  {
    name: "Ford Mustang GT Fastback",
    percentSold: 16,
    meta: "£2.99 per ticket, 2 days left",
  },
  {
    name: "2026 Rolex Submariner",
    percentSold: 25,
    meta: "£2.27 per ticket, 1 day left",
  },
  {
    name: "2005 Suzuki GSXR1000 K5",
    percentSold: 38,
    meta: "£9.99 per ticket, 1 day left",
  },
  {
    name: "£100,000 cash",
    percentSold: 94,
    meta: "Nearly gone, closes tonight",
  },
];

export function LpSoldMeters() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [valueOverride, setValueOverride] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let toId: ReturnType<typeof setTimeout> | 0 = 0;

    const raf =
      typeof requestAnimationFrame === "undefined"
        ? (cb: () => void) => {
            toId = setTimeout(cb, 0);
            return 0;
          }
        : requestAnimationFrame;

    const cancelRaf =
      typeof cancelAnimationFrame === "undefined"
        ? () => {
            if (toId) clearTimeout(toId);
          }
        : () => cancelAnimationFrame(rafId);

    const animateFromZero = () => {
      if (cancelled) {
        return;
      }

      setValueOverride(0);
      rafId = raf(() => {
        if (cancelled) {
          return;
        }
        setValueOverride(null);
      });
    };

    const node = containerRef.current;

    if (
      typeof IntersectionObserver === "undefined" ||
      !node
    ) {
      animateFromZero();
      return () => {
        cancelled = true;
        cancelRaf();
        if (toId) clearTimeout(toId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          animateFromZero();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelRaf();
      if (toId) clearTimeout(toId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="divide-y divide-rr-border rounded-2xl border border-rr-border bg-rr-elevated px-5 py-1 sm:px-6"
    >
      {meters.map((meter) => (
        <div key={meter.name} className="py-5">
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-semibold text-rr-primary">
              {meter.name}
            </span>
            <span
              className={
                meter.percentSold >= 75
                  ? "text-[15px] font-semibold text-red-500"
                  : "text-[15px] font-semibold text-rr-green"
              }
            >
              {meter.percentSold}%
            </span>
          </div>
          <ProgressBar
            value={valueOverride ?? meter.percentSold}
            className={
              valueOverride === 0
                ? "[&>*]:!transition-none"
                : undefined
            }
          />
          <p className="mt-2 text-[13px] text-rr-muted">{meter.meta}</p>
        </div>
      ))}
    </div>
  );
}
