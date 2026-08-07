import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "operator" | "red" | "amber" | "green" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  operator: "bg-rr-green-bg border border-rr-green-border text-rr-green",
  red: "bg-[#fee2e2] text-[#991b1b] dark:bg-[#7f1d1d] dark:text-[#fca5a5]",
  amber:
    "bg-[#fef3c7] border border-[#fcd34d] text-[#92400e] dark:bg-[#422006] dark:border-[#f59e0b] dark:text-[#fbbf24]",
  green:
    "bg-[#f0fdf4] border border-[#86efac] text-[#15803d] dark:bg-rr-green-bg dark:border-rr-green-border dark:text-rr-green",
  neutral:
    "bg-rr-elevated-light border border-rr-border-light text-rr-secondary dark:bg-rr-elevated dark:border-rr-border dark:text-rr-secondary",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}