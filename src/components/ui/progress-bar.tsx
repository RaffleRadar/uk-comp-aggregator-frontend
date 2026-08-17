"use client";

import { cn } from "@/lib/cn";

type ProgressVariant = "green" | "amber" | "red";

interface ProgressBarProps {
  value: number;
  variant?: ProgressVariant;
  className?: string;
}

function getVariant(value: number): ProgressVariant {
  if (value >= 75) return "red";
  if (value >= 50) return "amber";
  return "green";
}

const colors: Record<ProgressVariant, string> = {
  green: "bg-rr-green",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function ProgressBar({ value, variant, className }: ProgressBarProps) {
  const resolvedVariant = variant ?? getVariant(value);
  const clamped = Math.min(100, Math.max(0, value));
  const visiblePercent = Math.max(clamped, clamped > 0 ? 1.5 : 0);

  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-rr-border overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          colors[resolvedVariant],
        )}
        style={{ width: `${visiblePercent}%` }}
      />
    </div>
  );
}
