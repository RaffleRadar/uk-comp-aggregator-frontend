"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatSpendAmount } from "@/lib/competition-sort";

type SpendPreset = 5 | 10 | 20 | 50;
const SPEND_PRESETS: SpendPreset[] = [5, 10, 20, 50];

type TicketCalculatorProps = {
  ticketsSold: number;
  ticketsTotal: number;
  ticketPrice: number | null;
  maxPerPerson: number | null;
  hasEnded?: boolean;
  initialSpend?: number | null;
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
  hasEnded = false,
  initialSpend,
}: TicketCalculatorProps) {
  const buyable = (() => {
    const left = Math.max(0, ticketsTotal - ticketsSold);
    if (left <= 0) return 0;
    return maxPerPerson !== null ? Math.min(maxPerPerson, left) : left;
  })();

  const ticketPriceNum =
    ticketPrice === null || ticketPrice === undefined
      ? null
      : Number(ticketPrice);
  const ticketPriceValid =
    ticketPriceNum !== null &&
    Number.isFinite(ticketPriceNum) &&
    ticketPriceNum > 0;

  const quickSelectApplicable =
    !hasEnded && ticketPriceValid && buyable > 0;

  const presetSpend = useMemo(() => {
    if (initialSpend == null) return null;
    if (!SPEND_PRESETS.includes(initialSpend as SpendPreset)) return null;
    return initialSpend as SpendPreset;
  }, [initialSpend]);

  const isCustom =
    initialSpend != null && presetSpend == null && initialSpend > 0;

  const initialCount = useMemo(() => {
    if (!quickSelectApplicable || initialSpend == null || initialSpend <= 0)
      return 1;
    return clampTicketCount(
      Math.floor(initialSpend / ticketPriceNum),
      buyable,
    );
  }, [buyable, initialSpend, quickSelectApplicable, ticketPriceNum]);

  const activePresetInitial = quickSelectApplicable
    ? presetSpend ?? null
    : null;
  const isCustomOpenInitial = quickSelectApplicable ? isCustom : false;
  const customValueInitial =
    quickSelectApplicable && isCustom && initialSpend != null
      ? String(initialSpend)
      : "";
  const showHintInitial = quickSelectApplicable && initialSpend != null;

  const [ticketCount, setTicketCount] = useState(initialCount);
  const [activeSpend, setActiveSpend] =
    useState<SpendPreset | null>(activePresetInitial);
  const [isCustomOpen, setIsCustomOpen] = useState(isCustomOpenInitial);
  const [customValue, setCustomValue] = useState<string>(customValueInitial);
  const [showHint, setShowHint] = useState(showHintInitial);

  const changeKey = `${quickSelectApplicable}-${initialSpend}-${presetSpend}-${isCustom}`;
  const [lastChangeKey, setLastChangeKey] = useState<string>(changeKey);
  const keyChanged = lastChangeKey !== changeKey;

  if (keyChanged) {
    setLastChangeKey(changeKey);
    setTicketCount(initialCount);
    setActiveSpend(activePresetInitial);
    setIsCustomOpen(isCustomOpenInitial);
    setCustomValue(customValueInitial);
    setShowHint(showHintInitial);
  }

  if (ticketsTotal <= 0) {
    return null;
  }

  if (hasEnded || buyable <= 0) {
    if (ticketsSold <= 0) {
      return null;
    }

    const finalOdds = Math.max(1, ticketsSold);
    const finalChance = formatWinChance((1 / ticketsSold) * 100);
    const finalCost = ticketPriceValid
      ? `£${ticketPriceNum.toFixed(2)}`
      : "Free";

    return (
      <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-2 shadow-sm">
        <div className="mb-1.5 flex items-center justify-between gap-1.5">
          <h2 className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-rr-primary md:text-base">
            Final odds
          </h2>
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-rr-muted md:text-[11px] md:tracking-[0.14em]">
            Per ticket entered
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
              Odds per ticket
            </p>
            <p className="text-base font-semibold text-rr-primary">
              1 in {finalOdds.toLocaleString("en-GB")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                Ticket price
              </p>
              <p className="text-base font-semibold text-rr-primary">
                {finalCost}
              </p>
            </div>
            <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
                Win chance
              </p>
              <p className="text-base font-semibold text-rr-primary">
                {finalChance}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTicketCountChange = (nextValue: number) => {
    setTicketCount(clampTicketCount(nextValue, buyable));
    setActiveSpend(null);
    setShowHint(false);
  };

  const applySpend = (amount: number) => {
    if (!ticketPriceValid) return;
    const nextCount = clampTicketCount(
      Math.floor(amount / ticketPriceNum),
      buyable,
    );
    setTicketCount(nextCount);
    setShowHint(false);
  };

  const pickPreset = (amount: SpendPreset) => {
    if (!ticketPriceValid) return;
    const nextCount = clampTicketCount(
      Math.floor(amount / ticketPriceNum),
      buyable,
    );
    setTicketCount(nextCount);
    setActiveSpend(amount);
    setIsCustomOpen(false);
    setShowHint(false);
  };

  const handleCustomApply = () => {
    const amount = Number(customValue);
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!ticketPriceValid) return;
    const nextCount = clampTicketCount(
      Math.floor(amount / ticketPriceNum),
      buyable,
    );
    setTicketCount(nextCount);
    setActiveSpend(null);
    setShowHint(false);
  };

  const currentTicketCount = clampTicketCount(ticketCount, buyable);
  const liveOdds =
    ticketsSold > 0
      ? Math.max(
          1,
          Math.round(
            (ticketsSold + currentTicketCount - 1) / currentTicketCount,
          ),
        )
      : 1;
  const cost = ticketPriceValid
    ? `£${(currentTicketCount * ticketPriceNum).toFixed(2)}`
    : "Free";
  const winChanceValue =
    (currentTicketCount / (ticketsSold + currentTicketCount)) * 100;
  const winChance = formatWinChance(winChanceValue);

  return (
    <div className="rounded-xl border border-rr-border bg-rr-elevated px-4 py-2 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-1.5">
        <h2 className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-rr-primary md:text-base">
          Ticket calculator
        </h2>
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-rr-muted md:text-[11px] md:tracking-[0.14em]">
          {maxPerPerson !== null
            ? `Up to ${buyable.toLocaleString("en-GB")} ticket${buyable === 1 ? "" : "s"}`
            : `${buyable.toLocaleString("en-GB")} ticket${buyable === 1 ? "" : "s"} left`}
        </span>
      </div>

      {quickSelectApplicable ? (
        <div className="mb-2">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
            Quick select a spend amount
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {SPEND_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => pickPreset(amount)}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition cursor-pointer",
                  activeSpend === amount
                    ? "bg-rr-green border-rr-green text-rr-on-accent"
                    : "bg-rr-surface border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                )}
              >
                {formatSpendAmount(amount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomOpen((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition cursor-pointer",
                activeSpend == null && isCustomOpen
                  ? "bg-rr-green border-rr-green text-rr-on-accent"
                  : "bg-rr-surface border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
              )}
            >
              Custom
            </button>
            {isCustomOpen ? (
              <div className="flex items-center gap-1.5">
                <div className="flex h-9 items-center rounded-md border border-rr-border bg-rr-surface px-2">
                  <span className="text-sm text-rr-muted mr-1">£</span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomApply();
                    }}
                    className="h-7 w-20 rounded bg-transparent px-1 text-sm font-medium text-rr-primary outline-none"
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCustomApply}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-rr-green-border bg-rr-green-bg px-3 text-sm font-medium text-rr-green transition cursor-pointer hover:bg-rr-green/20"
                >
                  Apply
                </button>
              </div>
            ) : null}
          </div>
          {showHint && initialSpend != null ? (
            <p className="mt-1.5 text-xs text-rr-green">
              {formatSpendAmount(initialSpend)} selected from your results page
            </p>
          ) : null}
        </div>
      ) : null}

      {buyable > 1 ? (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-rr-border bg-rr-surface px-3 py-2">
          <input
            type="range"
            min={1}
            max={buyable}
            step={1}
            value={currentTicketCount}
            onChange={(event) =>
              handleTicketCountChange(Number(event.target.value))
            }
            className="h-2 w-full cursor-pointer"
            style={{ accentColor: "var(--accent)" }}
          />
          <input
            type="number"
            min={1}
            max={buyable}
            step={1}
            value={currentTicketCount}
            onChange={(event) =>
              handleTicketCountChange(Number(event.target.value))
            }
            onBlur={(event) =>
              handleTicketCountChange(Number(event.target.value))
            }
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
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
            Live odds
          </p>
          <p className="text-base font-semibold text-rr-primary">
            1 in {liveOdds.toLocaleString("en-GB")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
              Cost
            </p>
            <p className="text-base font-semibold text-rr-primary">{cost}</p>
          </div>
          <div className="rounded-lg border border-rr-border bg-rr-surface px-3 py-2 text-center">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-muted">
              Win chance
            </p>
            <p className="text-base font-semibold text-rr-primary">
              {winChance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
