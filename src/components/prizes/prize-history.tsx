import type { ComponentType } from "react";
import Link from "next/link";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconHistory,
  IconScale,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type {
  PrizeHistory,
  PrizePageState,
  PrizePriceComparison,
} from "@/lib/prizes";
import {
  formatCount,
  formatTicketPrice,
  historyPeriodLabel,
  historyPeriodNote,
  prizePageHref,
} from "@/lib/prizes";

type PanelIcon = ComponentType<{ size?: number; className?: string }>;

const EMPTY = "–";

function Panel({
  icon: Icon,
  title,
  lead,
  aside,
  children,
}: {
  icon: PanelIcon;
  title: string;
  lead: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-rr-border bg-rr-surface p-3 md:p-4">
      <div className="mb-3 flex flex-wrap items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 basis-[180px]">
          <h2 className="text-lg font-semibold leading-tight text-rr-primary">
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-rr-muted">{lead}</p>
        </div>
        {aside ? <div className="ml-auto shrink-0">{aside}</div> : null}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function Figure({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border px-2.5 py-2",
        highlight
          ? "border-rr-green-border bg-rr-green-bg"
          : "border-rr-border bg-rr-elevated",
      )}
    >
      <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-rr-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-none text-rr-primary">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-rr-muted">{note}</p>
    </div>
  );
}

function DifferenceValue({ comparison }: { comparison: PrizePriceComparison }) {
  if (comparison.direction === "same") {
    return <span>Same</span>;
  }

  const lower = comparison.direction === "lower";
  const Arrow = lower ? IconArrowDownRight : IconArrowUpRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        lower ? "text-rr-green" : "text-rr-warn",
      )}
    >
      <Arrow size={18} aria-hidden="true" />
      {comparison.differencePercent}% {lower ? "lower" : "higher"}
    </span>
  );
}

function PeriodSwitch({
  prizeKey,
  state,
  history,
}: {
  prizeKey: string;
  state: PrizePageState;
  history: PrizeHistory;
}) {
  const available = history.availableDays ?? [];
  const periods = available.length > 0 ? available : [history.days];

  return (
    <nav
      aria-label="History period"
      className="grid w-[204px] shrink-0 gap-0.5 rounded-md border border-rr-border bg-rr-elevated p-0.5"
      style={{
        gridTemplateColumns: `repeat(${periods.length}, minmax(0, 1fr))`,
      }}
    >
      {periods.map((days) => {
        const active = days === history.days;
        if (periods.length === 1) {
          return (
            <span
              key={days}
              className="whitespace-nowrap rounded px-1.5 py-1 text-center text-[11px] font-semibold leading-tight text-rr-secondary"
            >
              Last {historyPeriodLabel(days)}
            </span>
          );
        }
        return (
          <Link
            key={days}
            href={prizePageHref(prizeKey, { ...state, history: days })}
            scroll={false}
            replace
            aria-current={active ? "true" : undefined}
            className={cn(
              "whitespace-nowrap rounded px-1.5 py-1 text-center text-[11px] font-semibold leading-tight transition-colors",
              active
                ? "bg-rr-green-bg text-rr-green"
                : "text-rr-secondary hover:text-rr-primary",
            )}
          >
            {historyPeriodLabel(days)}
          </Link>
        );
      })}
    </nav>
  );
}

type PrizeHistoryBlocksProps = {
  prizeKey: string;
  state: PrizePageState;
  history: PrizeHistory;
  priceComparison: PrizePriceComparison | null;
};

export function PrizeHistoryBlocks({
  prizeKey,
  state,
  history,
  priceComparison,
}: PrizeHistoryBlocksProps) {
  const period = historyPeriodLabel(history.days);

  const typicalPrice =
    history.typicalTicketPrice != null
      ? formatTicketPrice(history.typicalTicketPrice)
      : EMPTY;

  return (
    <div className="container pb-8">
      <div className="mx-auto grid max-w-[1100px] gap-3 lg:grid-cols-2">
        <Panel
          icon={IconHistory}
          title="Prize History"
          lead={`How this prize has run across operators over the last ${period}.`}
          aside={
            <PeriodSwitch prizeKey={prizeKey} state={state} history={history} />
          }
        >
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <Figure
              label="Times prize has run"
              value={formatCount(history.timesRun)}
              note="Draws listed"
            />
            <Figure
              label="Unique operators"
              value={formatCount(history.uniqueOperators)}
              note="Different operators"
            />
            <Figure
              label="Typical ticket price"
              value={typicalPrice}
              note="Median entry price"
            />
            <Figure
              label="Average sold"
              value={
                history.averageSold != null
                  ? `${Math.round(history.averageSold)}%`
                  : EMPTY
              }
              note="Of completed draws"
            />
          </div>
        </Panel>

        <Panel
          icon={IconScale}
          title="Price Comparison"
          lead={`How the cheapest live entry compares with the typical price over the last ${period}.`}
        >
          {priceComparison ? (
            <div className="grid flex-1 grid-cols-3 gap-2">
              <Figure
                label="Typical price"
                value={formatTicketPrice(priceComparison.typicalPrice)}
                note={historyPeriodNote(history.days)}
              />
              <Figure
                label="Lowest live price"
                value={formatTicketPrice(priceComparison.lowestPrice)}
                note="Across live draws"
              />
              <Figure
                label="Difference"
                value={<DifferenceValue comparison={priceComparison} />}
                note="Against the typical price"
                highlight={priceComparison.direction === "lower"}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-rr-border bg-rr-elevated px-3 py-4 text-sm text-rr-secondary">
              There is no live entry price to compare with the typical price
              right now.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
