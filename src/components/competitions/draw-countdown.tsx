"use client";

import { useEffect, useMemo, useState } from "react";

type DrawCountdownProps = {
  endsAt: string | null;
  colorByUrgency?: boolean;
  size?: "sm" | "lg";
};

type Segment = {
  value: number;
  unit: string;
};

function pluralize(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function splitRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    mins: Math.floor((totalSeconds % 3600) / 60),
    secs: totalSeconds % 60,
  };
}

function formatRemaining(ms: number) {
  const { days, hours, mins, secs } = splitRemaining(ms);

  if (days >= 1) {
    return `${days} ${pluralize(days, "day", "days")} ${hours} ${pluralize(hours, "hour", "hours")} ${mins} ${pluralize(mins, "min", "mins")}`;
  }

  return `${hours} ${pluralize(hours, "hour", "hours")} ${mins} ${pluralize(mins, "min", "mins")} ${secs} ${pluralize(secs, "sec", "secs")}`;
}

function buildSegments(ms: number): Segment[] {
  const { days, hours, mins, secs } = splitRemaining(ms);

  if (days >= 1) {
    return [
      { value: days, unit: "d" },
      { value: hours, unit: "h" },
      { value: mins, unit: "m" },
    ];
  }

  return [
    { value: hours, unit: "h" },
    { value: mins, unit: "m" },
    { value: secs, unit: "s" },
  ];
}

const IDLE_SMALL =
  "text-rr-muted text-[13px] font-normal whitespace-nowrap md:text-sm";
const IDLE_LARGE = "text-rr-muted text-xl font-semibold whitespace-nowrap";

export function DrawCountdown({
  endsAt,
  colorByUrgency = false,
  size = "sm",
}: DrawCountdownProps) {
  const targetMs = useMemo(() => {
    if (!endsAt) return null;
    const t = new Date(endsAt).getTime();
    return Number.isFinite(t) ? t : null;
  }, [endsAt]);

  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (!targetMs) return;

    const syncNow = () => {
      setNowMs(Date.now());
    };

    const timeoutId = window.setTimeout(syncNow, 0);
    const intervalId = window.setInterval(syncNow, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [targetMs]);

  const idleClass = size === "lg" ? IDLE_LARGE : IDLE_SMALL;

  if (!targetMs) {
    return <span className={idleClass}>TBC</span>;
  }

  if (nowMs === null) {
    return <span className={idleClass}>Calculating...</span>;
  }

  const diff = targetMs - nowMs;

  if (diff <= 0) {
    return <span className={idleClass}>Ended</span>;
  }

  const urgencyClass = colorByUrgency
    ? diff < 86_400_000
      ? "text-[#f2545b]"
      : diff < 259_200_000
        ? "text-rr-warn"
        : "text-rr-green"
    : "";

  if (size === "lg") {
    return (
      <div className="flex items-baseline gap-5 sm:gap-7">
        {buildSegments(diff).map((segment) => (
          <span key={segment.unit} className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-semibold tabular-nums leading-none ${urgencyClass}`}
            >
              {segment.value}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-rr-muted">
              {segment.unit}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className={`text-[13px] whitespace-nowrap md:text-sm ${urgencyClass}`}
    >
      {formatRemaining(diff)}
    </span>
  );
}
