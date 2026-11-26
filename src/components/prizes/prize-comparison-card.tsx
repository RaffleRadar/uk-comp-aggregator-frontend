import type { ReactNode } from "react";
import { IconChevronRight, IconScale } from "@tabler/icons-react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import type { PrizeComparisonLink } from "@/lib/prizes";
import { formatCount } from "@/lib/prizes";

export const MIN_OPERATORS_FOR_COMPARISON = 2;

type PrizeComparisonCardProps = {
  comparison: PrizeComparisonLink;
  ended?: boolean;
};

type CardText = {
  title: ReactNode;
  subtext: string;
  mobileButton: string;
  desktopButton: string;
};

function operatorWord(count: number): string {
  return count === 1 ? "operator" : "operators";
}

function liveCardText(comparison: PrizeComparisonLink): CardText {
  const operators = formatCount(comparison.operators);

  return {
    title: (
      <>
        This prize is available from{" "}
        <span className="text-rr-green">{operators} operators.</span>
      </>
    ),
    subtext: "Compare ticket prices, odds and value.",
    mobileButton: `Compare All ${operators} Operators`,
    desktopButton: "Compare",
  };
}

function endedCardText(comparison: PrizeComparisonLink): CardText {
  const count = comparison.operators;

  if (count <= 0) {
    return {
      title: "No live draws right now.",
      subtext: "See how this prize has run.",
      mobileButton: "View Prize",
      desktopButton: "View Prize",
    };
  }

  const operators = formatCount(count);

  return {
    title: (
      <>
        Running now with{" "}
        <span className="text-rr-green">
          {operators} {operatorWord(count)}.
        </span>
      </>
    ),
    subtext: "Compare prices, odds and value.",
    mobileButton: count === 1 ? "Compare" : `Compare All ${operators} Operators`,
    desktopButton: "Compare",
  };
}

export function PrizeComparisonCard({
  comparison,
  ended = false,
}: PrizeComparisonCardProps) {
  const text = ended ? endedCardText(comparison) : liveCardText(comparison);

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
          {text.title}
        </p>
      </div>
      <p className="col-span-2 text-xs leading-snug text-rr-secondary md:col-span-1 md:col-start-2 md:self-start">
        {text.subtext}
      </p>
      <ScrollTopLink
        href={`/prizes/${comparison.key}`}
        className="col-span-2 flex items-center justify-center gap-1 rounded-md border border-rr-green-border bg-rr-green-bg px-3 py-2.5 text-sm font-semibold text-rr-green transition-colors hover:bg-rr-green hover:text-rr-on-accent md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:inline-flex md:py-1.5"
      >
        <span className="md:hidden">{text.mobileButton}</span>
        <span className="hidden md:inline">{text.desktopButton}</span>
        <IconChevronRight size={16} aria-hidden="true" />
      </ScrollTopLink>
    </div>
  );
}
