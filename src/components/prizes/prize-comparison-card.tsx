import { IconChevronRight, IconScale } from "@tabler/icons-react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import type { PrizeComparisonLink } from "@/lib/prizes";
import { formatCount } from "@/lib/prizes";

export const MIN_OPERATORS_FOR_COMPARISON = 2;

type PrizeComparisonCardProps = {
  comparison: PrizeComparisonLink;
};

export function PrizeComparisonCard({ comparison }: PrizeComparisonCardProps) {
  return (
    <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-rr-border bg-rr-elevated px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
        <IconScale size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-green">
          Prize comparison
        </p>
        <p className="text-sm font-semibold leading-snug text-rr-primary">
          This prize is currently being run by{" "}
          <span className="text-rr-green">
            {formatCount(comparison.operators)} operators
          </span>{" "}
          right now.
        </p>
        <p className="mt-0.5 text-xs leading-snug text-rr-muted">
          Compare ticket prices, odds and value across all operators to find the
          best option.
        </p>
      </div>
      <ScrollTopLink
        href={`/prizes/${comparison.key}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rr-green-border bg-rr-green-bg px-3 py-1.5 text-sm font-semibold text-rr-green transition-colors hover:bg-rr-green hover:text-rr-on-accent"
      >
        Compare
        <IconChevronRight size={16} aria-hidden="true" />
      </ScrollTopLink>
    </div>
  );
}
