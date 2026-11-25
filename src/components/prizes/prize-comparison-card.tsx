import { IconChevronRight, IconScale } from "@tabler/icons-react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import type { PrizeComparisonLink } from "@/lib/prizes";
import { formatCount } from "@/lib/prizes";

export const MIN_OPERATORS_FOR_COMPARISON = 2;

type PrizeComparisonCardProps = {
  comparison: PrizeComparisonLink;
};

export function PrizeComparisonCard({ comparison }: PrizeComparisonCardProps) {
  const operators = formatCount(comparison.operators);

  return (
    <div className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border border-rr-border bg-rr-elevated px-3 py-2.5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-y-0.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green md:row-span-2">
        <IconScale size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 md:self-end">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-green">
          Prize comparison
        </p>
        <p className="text-sm font-semibold leading-snug text-rr-primary">
          This prize is available from{" "}
          <span className="text-rr-green">{operators} operators.</span>
        </p>
      </div>
      <p className="col-span-2 text-xs leading-snug text-rr-secondary md:col-span-1 md:col-start-2 md:self-start">
        Compare ticket prices, odds and value.
      </p>
      <ScrollTopLink
        href={`/prizes/${comparison.key}`}
        className="col-span-2 flex items-center justify-center gap-1 rounded-md border border-rr-green-border bg-rr-green-bg px-3 py-2.5 text-sm font-semibold text-rr-green transition-colors hover:bg-rr-green hover:text-rr-on-accent md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:inline-flex md:py-1.5"
      >
        <span className="md:hidden">Compare All {operators} Operators</span>
        <span className="hidden md:inline">Compare</span>
        <IconChevronRight size={16} aria-hidden="true" />
      </ScrollTopLink>
    </div>
  );
}
