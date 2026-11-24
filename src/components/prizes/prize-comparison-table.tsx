import Image from "next/image";
import { IconArrowUpRight, IconChevronDown } from "@tabler/icons-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { cn } from "@/lib/cn";
import { getPercentTextClass } from "@/lib/odds-forecast";
import { findOperatorLogo, type OperatorLogos } from "@/lib/operator-logos";
import type { PrizeDraw, PrizePage } from "@/lib/prizes";
import {
  formatCount,
  formatOdds,
  formatSpend,
  formatTicketPrice,
} from "@/lib/prizes";

const EMPTY = "–";

type OddsLine = {
  label: string;
  value: string;
  className: string;
};

function percentSold(draw: PrizeDraw): number | null {
  if (draw.percentSold != null && Number.isFinite(draw.percentSold)) {
    return draw.percentSold;
  }
  if (draw.ticketsSold != null && draw.ticketsTotal && draw.ticketsTotal > 0) {
    return (draw.ticketsSold / draw.ticketsTotal) * 100;
  }
  return null;
}

function formatPercent(value: number | null): string {
  return value == null ? EMPTY : `${Math.round(value)}%`;
}

function entryPrice(draw: PrizeDraw): string {
  if (draw.isFree) return "Free";
  return draw.ticketPrice != null ? formatTicketPrice(draw.ticketPrice) : EMPTY;
}

function prizeValue(draw: PrizeDraw): string {
  return draw.prizeValue != null ? formatTicketPrice(draw.prizeValue) : EMPTY;
}

function ticketsText(draw: PrizeDraw): string {
  if (draw.ticketsSold == null) return EMPTY;
  const sold = formatCount(draw.ticketsSold);
  return draw.ticketsTotal != null && draw.ticketsTotal > 0
    ? `${sold} / ${formatCount(draw.ticketsTotal)}`
    : sold;
}

function liveOddsLine(draw: PrizeDraw): OddsLine {
  const sold = draw.ticketsSold ?? 0;
  if (draw.liveOdds == null || sold <= 0) {
    return {
      label: "Live Odds",
      value: draw.liveOdds != null ? "No sales yet" : EMPTY,
      className: "font-medium text-rr-muted",
    };
  }
  return {
    label: "Live Odds",
    value: formatOdds(draw.liveOdds),
    className: cn("font-bold", getPercentTextClass(percentSold(draw))),
  };
}

function oddsLines(draw: PrizeDraw): OddsLine[] {
  return [
    liveOddsLine(draw),
    {
      label: "If Sold Out",
      value: draw.soldOutOdds != null ? formatOdds(draw.soldOutOdds) : EMPTY,
      className: "font-medium text-rr-primary",
    },
    {
      label: "Forecasted",
      value: draw.forecast ? formatOdds(draw.forecast.odds) : EMPTY,
      className: "font-medium text-rr-primary",
    },
  ];
}

function drawHref(draw: PrizeDraw): string {
  return `/competitions/${draw.slug ?? draw.id}`;
}

function OperatorMark({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 shrink-0 rounded-md bg-rr-elevated object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rr-elevated text-[11px] font-bold text-rr-primary"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function EntriesPill({ draw }: { draw: PrizeDraw }) {
  if (!draw.entries) {
    return <span className="text-sm text-rr-muted">{EMPTY}</span>;
  }

  return (
    <span className="inline-flex min-w-[2.75rem] justify-center rounded-full border border-rr-green-border bg-rr-green-bg px-2.5 py-0.5 text-xs font-bold text-rr-green"
    >
      {formatCount(draw.entries.entries)}
    </span>
  );
}

function ViewDrawLink({
  draw,
  className,
}: {
  draw: PrizeDraw;
  className?: string;
}) {
  return (
    <ScrollTopLink
      href={drawHref(draw)}
      aria-label={`View ${draw.operator.name} draw`}
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-rr-green px-3 py-1.5 text-xs font-semibold text-rr-on-accent transition-opacity hover:opacity-90",
        className,
      )}
    >
      View Draw
      <IconArrowUpRight size={14} aria-hidden="true" />
    </ScrollTopLink>
  );
}

function TicketsBar({ draw }: { draw: PrizeDraw }) {
  const percent = percentSold(draw);
  if (percent == null || !draw.ticketsTotal) return null;
  return <ProgressBar value={percent} className="h-1.5" />;
}

function DesktopTable({
  draws,
  logos,
  entriesHeading,
  isExample,
}: {
  draws: PrizeDraw[];
  logos: OperatorLogos;
  entriesHeading: string;
  isExample: boolean;
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-rr-border bg-rr-surface lg:block">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-[72px]" />
          <col className="w-[84px]" />
          <col className="w-[170px]" />
          <col className="w-[192px]" />
          <col className="w-[80px]" />
          <col className="w-[128px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-rr-border text-[10px] font-semibold uppercase tracking-[0.06em] text-rr-muted">
            <th scope="col" className="px-3 py-2 text-center">
              #
            </th>
            <th scope="col" className="px-2 py-2">
              Operator
            </th>
            <th scope="col" className="px-2 py-2">
              Entry price
            </th>
            <th scope="col" className="px-2 py-2">
              Prize value
            </th>
            <th scope="col" className="px-2 py-2">
              Live entries
              <span className="block font-medium normal-case tracking-normal">
                Sold / cap · % sold
              </span>
            </th>
            <th scope="col" className="px-2 py-2">
              Odds per ticket
            </th>
            <th scope="col" className="px-2 py-2 text-center">
              {entriesHeading}
              {isExample ? (
                <span className="block font-medium normal-case tracking-normal">
                  Example
                </span>
              ) : null}
            </th>
            <th scope="col" className="px-3 py-2 text-center">
              View
            </th>
          </tr>
        </thead>
        <tbody>
          {draws.map((draw, index) => (
            <tr
              key={draw.id}
              className={cn(
                "border-b border-rr-border last:border-b-0",
                index === 0 ? "bg-rr-green-bg" : undefined,
              )}
            >
              <td className="px-3 py-2 text-center text-sm font-semibold text-rr-green">
                {index + 1}
              </td>
              <td className="px-2 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <OperatorMark
                    name={draw.operator.name}
                    logoUrl={findOperatorLogo(logos, draw.operator)}
                  />
                  <span
                    title={draw.operator.name}
                    className="truncate text-sm font-semibold text-rr-primary"
                  >
                    {draw.operator.name}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm font-semibold text-rr-green">
                {entryPrice(draw)}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm text-rr-primary">
                {prizeValue(draw)}
              </td>
              <td className="px-2 py-2">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="whitespace-nowrap text-rr-primary">
                    {ticketsText(draw)}
                  </span>
                  <span className="font-semibold text-rr-secondary">
                    {formatPercent(percentSold(draw))}
                  </span>
                </div>
                <TicketsBar draw={draw} />
              </td>
              <td className="px-2 py-2">
                <div className="grid grid-cols-[auto_auto] justify-start gap-x-3 gap-y-0.5 text-xs leading-tight">
                  {oddsLines(draw).map((line) => (
                    <div key={line.label} className="contents">
                      <span
                        className={cn(
                          "whitespace-nowrap text-right",
                          line.className,
                        )}
                      >
                        {line.value}
                      </span>
                      <span className="whitespace-nowrap text-rr-muted">
                        {line.label}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-2 py-2 text-center">
                <EntriesPill draw={draw} />
              </td>
              <td className="px-3 py-2 text-center">
                <ViewDrawLink draw={draw} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-rr-secondary">{label}</span>
      <span className="text-right font-semibold text-rr-primary">
        {children}
      </span>
    </div>
  );
}

function MobileCards({
  draws,
  logos,
  entriesHeading,
  isExample,
}: {
  draws: PrizeDraw[];
  logos: OperatorLogos;
  entriesHeading: string;
  isExample: boolean;
}) {
  return (
    <div className="grid gap-2 lg:hidden">
      {draws.map((draw, index) => {
        const live = liveOddsLine(draw);
        const [, soldOut, forecast] = oddsLines(draw);

        return (
          <details
            key={draw.id}
            open={index === 0}
            className={cn(
              "group rounded-xl border",
              index === 0
                ? "border-rr-green-border bg-rr-green-bg"
                : "border-rr-border bg-rr-surface",
            )}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
              <span className="w-5 shrink-0 text-center text-sm font-semibold text-rr-green">
                {index + 1}
              </span>
              <OperatorMark
                name={draw.operator.name}
                logoUrl={findOperatorLogo(logos, draw.operator)}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-rr-primary">
                  {draw.operator.name}
                </span>
                <span className="block text-xs text-rr-secondary">
                  {draw.isFree ? "Free entry" : `${entryPrice(draw)} per entry`}{" "}
                  · {formatPercent(percentSold(draw))} sold
                </span>
                <span className="block text-xs text-rr-secondary">
                  Live odds{" "}
                  <span className={live.className}>{live.value}</span>
                </span>
              </span>
              <IconChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-rr-muted transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-t border-rr-border px-3 pb-3 pt-1.5">
              <CardRow label="Prize Value">{prizeValue(draw)}</CardRow>
              <CardRow label="Tickets Sold">{ticketsText(draw)}</CardRow>
              <div className="pb-1.5">
                <TicketsBar draw={draw} />
              </div>
              <CardRow label="Odds If Sold Out">{soldOut.value}</CardRow>
              <CardRow label="Forecasted Odds">{forecast.value}</CardRow>
              <CardRow
                label={
                  <>
                    {entriesHeading}
                    {isExample ? (
                      <span className="ml-1.5 text-[11px] text-rr-muted">
                        Example
                      </span>
                    ) : null}
                  </>
                }
              >
                <EntriesPill draw={draw} />
              </CardRow>
              <ViewDrawLink draw={draw} className="mt-2 w-full py-2 text-sm" />
            </div>
          </details>
        );
      })}
    </div>
  );
}

type PrizeComparisonTableProps = {
  page: PrizePage;
  logos: OperatorLogos;
};

export function PrizeComparisonTable({
  page,
  logos,
}: PrizeComparisonTableProps) {
  const { draws, entriesAmount, spend } = page;

  if (draws.length === 0) return null;

  const label = page.prize.label;
  const isExample = spend == null;
  const amount = formatSpend(entriesAmount);
  const entriesHeading = `Entries for ${amount}`;
  const lead = isExample
    ? `Compare live and sell-out odds per ticket. The ${amount} entries are shown as a fixed example.`
    : `Compare live and sell-out odds per ticket, with the entries ${amount} buys at each draw.`;

  return (
    <section aria-labelledby="prize-operators-title" className="container pb-8">
      <div className="mx-auto max-w-[1100px]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-rr-green">
          All operators
        </p>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2
              id="prize-operators-title"
              className="text-xl font-semibold leading-tight tracking-[-0.02em] text-rr-primary md:text-2xl"
            >
              Who gives you the best shot at a {label}?
            </h2>
            <p className="mt-1 text-sm text-rr-secondary">{lead}</p>
          </div>
          <span className="shrink-0 rounded-md border border-rr-border bg-rr-elevated px-2 py-1 text-xs font-semibold text-rr-secondary">
            {formatCount(draws.length)}{" "}
            {draws.length === 1 ? "draw shown" : "draws shown"}
          </span>
        </div>

        <DesktopTable
          draws={draws}
          logos={logos}
          entriesHeading={entriesHeading}
          isExample={isExample}
        />
        <MobileCards
          draws={draws}
          logos={logos}
          entriesHeading={entriesHeading}
          isExample={isExample}
        />
      </div>
    </section>
  );
}
