"use client";

import { useState } from "react";

type TicketCalculatorProps = {
  ticketsSold: number;
  ticketsTotal: number;
  ticketPrice: number | null;
  maxPerPerson: number | null;
};

function clampTicketCount(value: number, buyable: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(buyable, Math.max(1, Math.floor(value)));
}

function formatWinChance(value: number) {
  if (value === 0) return "0%";
  if (value < 0.01) return "<0.01%";
  if (value < 1) return `${value.toFixed(2)}%`;
  return `${value.toFixed(1)}%`;
}

export function TicketCalculator({
  ticketsSold,
  ticketsTotal,
  ticketPrice,
  maxPerPerson,
}: TicketCalculatorProps) {
  const [ticketCount, setTicketCount] = useState(1);
  const ticketsLeft = Math.max(0, ticketsTotal - ticketsSold);

  if (maxPerPerson === null || ticketsLeft <= 0 || ticketsTotal <= 0) {
    return null;
  }

  const buyable = Math.min(maxPerPerson, ticketsLeft);

  if (buyable <= 0) {
    return null;
  }

  const handleTicketCountChange = (nextValue: number) => {
    setTicketCount(clampTicketCount(nextValue, buyable));
  };
  const currentTicketCount = clampTicketCount(ticketCount, buyable);
  const liveOdds =
    ticketsSold > 0
      ? Math.max(
          1,
          Math.round((ticketsSold + currentTicketCount - 1) / currentTicketCount),
        )
      : 1;
  const cost =
    ticketPrice !== null && ticketPrice > 0
      ? `£${(currentTicketCount * ticketPrice).toFixed(2)}`
      : "Free";
  const winChanceValue =
    (currentTicketCount / (ticketsSold + currentTicketCount)) * 100;
  const winChance = formatWinChance(winChanceValue);

  return (
    <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-2 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-1.5">
        <h2 className="text-base font-semibold uppercase tracking-wide text-rr-primary">
          Ticket calculator
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
          Up to {buyable.toLocaleString("en-GB")} ticket{buyable === 1 ? "" : "s"}
        </span>
      </div>

      {buyable > 1 ? (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-rr-border bg-rr-surface px-3 py-2">
          <input
            type="range"
            min={1}
            max={buyable}
            step={1}
            value={currentTicketCount}
            onChange={(event) => handleTicketCountChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer"
            style={{ accentColor: "var(--accent)" }}
          />
          <input
            type="number"
            min={1}
            max={buyable}
            step={1}
            value={currentTicketCount}
            onChange={(event) => handleTicketCountChange(Number(event.target.value))}
            onBlur={(event) => handleTicketCountChange(Number(event.target.value))}
            className="h-10 w-20 rounded-md border border-rr-border bg-rr-elevated px-3 text-right text-sm font-semibold text-rr-primary outline-none"
            inputMode="numeric"
          />
        </div>
      ) : (
        <div className="mb-2 inline-flex h-10 items-center rounded-md border border-rr-border bg-rr-surface px-3 text-sm font-semibold text-rr-primary">
          1 ticket
        </div>
      )}

      <div className="space-y-1.5">
        <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Live odds</p>
          <p className="text-base font-semibold text-rr-primary">
            1 in {liveOdds.toLocaleString("en-GB")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Cost</p>
            <p className="text-base font-semibold text-rr-primary">{cost}</p>
          </div>
          <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">Win chance</p>
            <p className="text-base font-semibold text-rr-primary">{winChance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
