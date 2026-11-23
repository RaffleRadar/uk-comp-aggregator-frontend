import type { ComponentType } from "react";
import {
  IconChartBar,
  IconCoins,
  IconGift,
  IconTrophy,
} from "@tabler/icons-react";
import type { PrizePage } from "@/lib/prizes";
import {
  findDraw,
  formatCount,
  formatOdds,
  formatSpend,
  formatTicketPrice,
} from "@/lib/prizes";

type TileIcon = ComponentType<{ size?: number; className?: string }>;

type TileProps = {
  icon: TileIcon;
  label: string;
  value: string;
  prefix?: string;
  note?: string;
};

function SummaryTile({ icon: Icon, label, value, prefix, note }: TileProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-rr-muted">
          {label}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm leading-tight text-rr-secondary">
          {prefix ? <span>{prefix}</span> : null}
          <span className="text-lg font-bold text-rr-primary">{value}</span>
          {note ? <span className="text-xs">{note}</span> : null}
        </p>
      </div>
    </div>
  );
}

type PrizeSummaryTilesProps = {
  page: PrizePage;
};

export function PrizeSummaryTiles({ page }: PrizeSummaryTilesProps) {
  const { summary } = page;
  const bestOddsDraw = findDraw(page, summary.bestOdds?.drawId);
  const exampleNote =
    page.spend == null
      ? `${formatSpend(page.entriesAmount)} example`
      : `for ${formatSpend(page.entriesAmount)}`;

  return (
    <section aria-label="Prize summary" className="container pb-6">
      <div className="mx-auto grid max-w-[1100px] gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile
          icon={IconTrophy}
          label="Live draws"
          value={formatCount(summary.liveDraws)}
          note={summary.liveDraws === 1 ? "draw" : "draws"}
        />
        <SummaryTile
          icon={IconCoins}
          label="Cheapest entry"
          prefix={summary.cheapestEntry ? "From" : undefined}
          value={
            summary.cheapestEntry
              ? formatTicketPrice(summary.cheapestEntry.ticketPrice)
              : "No live draws"
          }
        />
        <SummaryTile
          icon={IconChartBar}
          label="Best live odds shown"
          value={
            summary.bestOdds ? formatOdds(summary.bestOdds.liveOdds) : "Not yet"
          }
          note={bestOddsDraw?.operator.name}
        />
        <SummaryTile
          icon={IconGift}
          label="Most entries for your spend"
          value={
            summary.mostEntries
              ? formatCount(summary.mostEntries.entries)
              : "None"
          }
          note={summary.mostEntries ? `entries · ${exampleNote}` : undefined}
        />
      </div>
    </section>
  );
}
