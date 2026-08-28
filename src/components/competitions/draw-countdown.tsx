"use client";

import { useEffect, useMemo, useState } from "react";

type DrawCountdownProps = {
  endsAt: string | null;
  colorByUrgency?: boolean;
};

function pluralize(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (days >= 1) {
    return `${days} ${pluralize(days, "day", "days")} ${hours} ${pluralize(hours, "hour", "hours")} ${mins} ${pluralize(mins, "min", "mins")}`;
  }

  return `${hours} ${pluralize(hours, "hour", "hours")} ${mins} ${pluralize(mins, "min", "mins")} ${secs} ${pluralize(secs, "sec", "secs")}`;
}

export function DrawCountdown({ endsAt, colorByUrgency = false }: DrawCountdownProps) {
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

  if (!targetMs) {
    return <span className="text-rr-muted text-[13px] font-normal whitespace-nowrap md:text-sm">TBC</span>;
  }

  if (nowMs === null) {
    return <span className="text-rr-muted text-[13px] font-normal whitespace-nowrap md:text-sm">Calculating...</span>;
  }

  const diff = targetMs - nowMs;

  if (diff <= 0) {
    return <span className="text-rr-muted text-[13px] font-normal whitespace-nowrap md:text-sm">Ended</span>;
  }

  const urgencyClass = colorByUrgency
    ? diff < 86_400_000
      ? " text-rr-danger"
      : diff < 259_200_000
        ? " text-rr-warn"
        : " text-rr-green"
    : "";

  return (
    <span className={`text-[13px] whitespace-nowrap md:text-sm${urgencyClass}`}>
      {formatRemaining(diff)}
    </span>
  );
}
