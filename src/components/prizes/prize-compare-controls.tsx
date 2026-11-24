"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconChevronDown,
  IconInfoCircle,
  IconStack2,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  MAX_PRIZE_SPEND,
  MIN_PRIZE_SPEND,
  PRIZE_SORTS,
  PRIZE_SORT_LABELS,
  PRIZE_SPEND_OPTIONS,
  formatSpend,
  normalizePrizeSpend,
  prizePageHref,
  type PrizePageState,
  type PrizeSort,
} from "@/lib/prizes";

type Option<T> = { value: T; label: string };

const SPEND_OFF_LABEL = "Spend Off";
const CUSTOM_LABEL = "Custom";

function isPreset(spend: number | null): boolean {
  return (
    spend == null ||
    (PRIZE_SPEND_OPTIONS as readonly number[]).includes(spend)
  );
}

function Pill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold leading-tight transition-colors disabled:opacity-60",
        active
          ? "border-rr-green bg-rr-green text-rr-on-accent"
          : "border-rr-border bg-rr-elevated text-rr-secondary hover:border-rr-green hover:text-rr-primary",
      )}
    >
      {children}
    </button>
  );
}

function Dropdown<T extends string>({
  label,
  options,
  value,
  disabled,
  highlight,
  onSelect,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  disabled?: boolean;
  highlight?: boolean;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  function moveFocus(step: number) {
    const buttons = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
        [],
    );
    if (buttons.length === 0) return;
    const index = buttons.findIndex(
      (button) => button === document.activeElement,
    );
    const next =
      index === -1
        ? step > 0
          ? 0
          : buttons.length - 1
        : (index + step + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (!open) setOpen(true);
          else moveFocus(event.key === "ArrowDown" ? 1 : -1);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition disabled:opacity-60",
          highlight
            ? "border-rr-green-border bg-rr-green-bg text-rr-green"
            : "border-rr-border bg-rr-elevated text-rr-primary",
          open ? "border-rr-green" : "hover:border-rr-green",
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <IconChevronDown
          size={16}
          className={cn(
            "shrink-0 transition-transform",
            open ? "rotate-180" : undefined,
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-50 mt-1 rounded-md border border-rr-border bg-rr-surface p-1 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false);
                  onSelect(option.value);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm outline-none transition",
                  active
                    ? "bg-rr-green-bg font-bold text-rr-primary"
                    : "font-semibold text-rr-primary hover:bg-rr-elevated focus-visible:bg-rr-elevated",
                )}
              >
                <span className="flex w-3.5 shrink-0 justify-center text-rr-green">
                  {active ? <IconCheck size={14} stroke={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CustomSpendInput({
  initial,
  disabled,
  onApply,
  className,
}: {
  initial: number | null;
  disabled?: boolean;
  onApply: (spend: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(initial != null ? String(initial) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input && input.offsetParent !== null) input.focus();
  }, []);
  const parsed = draft.trim() === "" ? null : normalizePrizeSpend(Number(draft));
  const invalid = draft.trim() !== "" && parsed == null;

  return (
    <form
      className={cn("flex items-center gap-1.5", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (parsed != null) onApply(parsed);
      }}
    >
      <label className="flex min-w-0 flex-1 items-center gap-1 rounded-md border border-rr-border bg-rr-elevated px-2 py-1 focus-within:border-rr-green">
        <span className="text-xs font-semibold text-rr-secondary">£</span>
        <input
          type="number"
          inputMode="decimal"
          min={MIN_PRIZE_SPEND}
          max={MAX_PRIZE_SPEND}
          step="0.01"
          ref={inputRef}
          value={draft}
          aria-label="Custom spend in pounds"
          aria-invalid={invalid}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full min-w-0 bg-transparent text-xs font-semibold text-rr-primary outline-none [appearance:textfield] sm:w-14 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </label>
      <button
        type="submit"
        disabled={disabled || parsed == null}
        className="shrink-0 rounded-md border border-rr-green-border bg-rr-green-bg px-2.5 py-1 text-xs font-semibold text-rr-green transition-colors hover:bg-rr-green hover:text-rr-on-accent disabled:opacity-50 disabled:hover:bg-rr-green-bg disabled:hover:text-rr-green"
      >
        Apply
      </button>
    </form>
  );
}

type PrizeCompareControlsProps = {
  prizeKey: string;
  state: PrizePageState;
};

export function PrizeCompareControls({
  prizeKey,
  state,
}: PrizeCompareControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customOpen, setCustomOpen] = useState(false);

  function navigate(next: Partial<PrizePageState>) {
    const href = prizePageHref(prizeKey, { ...state, ...next });
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function selectSpend(spend: number | null) {
    setCustomOpen(false);
    navigate({ spend });
  }

  const customActive = customOpen || !isPreset(state.spend);

  const spendOptions: Option<string>[] = [
    { value: "off", label: SPEND_OFF_LABEL },
    ...PRIZE_SPEND_OPTIONS.map((amount) => ({
      value: String(amount),
      label: formatSpend(amount),
    })),
    {
      value: "custom",
      label:
        !isPreset(state.spend) && state.spend != null
          ? `${CUSTOM_LABEL}: ${formatSpend(state.spend)}`
          : CUSTOM_LABEL,
    },
  ];
  const spendValue = customActive
    ? "custom"
    : state.spend == null
      ? "off"
      : String(state.spend);

  const sortOptions: Option<PrizeSort>[] = PRIZE_SORTS.map((sort) => ({
    value: sort,
    label: PRIZE_SORT_LABELS[sort],
  }));

  return (
    <section
      aria-label="Compare operators"
      aria-busy={pending}
      className="container pb-6"
    >
      <div
        className={cn(
          "mx-auto max-w-[1100px] rounded-xl border border-rr-border bg-rr-surface px-3 py-2.5 transition-opacity",
          pending ? "opacity-70" : undefined,
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-x-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
              <IconStack2 size={17} aria-hidden="true" />
            </span>
            <h2 className="whitespace-nowrap text-base font-semibold leading-tight text-rr-primary lg:text-sm">
              Compare Operators
            </h2>
          </div>

          <div className="hidden min-w-0 flex-wrap items-center gap-1 lg:flex">
            <span className="mr-0.5 whitespace-nowrap text-[11px] font-semibold text-rr-muted">
              Your Spend
            </span>
            <Pill
              active={state.spend == null && !customOpen}
              disabled={pending}
              onClick={() => selectSpend(null)}
            >
              {SPEND_OFF_LABEL}
            </Pill>
            {PRIZE_SPEND_OPTIONS.map((amount) => (
              <Pill
                key={amount}
                active={state.spend === amount && !customOpen}
                disabled={pending}
                onClick={() => selectSpend(amount)}
              >
                {formatSpend(amount)}
              </Pill>
            ))}
            <Pill
              active={customActive}
              disabled={pending}
              onClick={() => setCustomOpen(true)}
            >
              {!isPreset(state.spend) && state.spend != null && !customOpen
                ? formatSpend(state.spend)
                : CUSTOM_LABEL}
            </Pill>
            {customOpen ? (
              <CustomSpendInput
                initial={isPreset(state.spend) ? null : state.spend}
                disabled={pending}
                onApply={(spend) => selectSpend(spend)}
              />
            ) : null}
          </div>

          <div className="hidden shrink-0 items-center justify-end gap-1 lg:ml-auto lg:flex">
            <span className="mr-0.5 whitespace-nowrap text-[11px] font-semibold text-rr-muted">
              Sort by
            </span>
            {sortOptions.map((option) => (
              <Pill
                key={option.value}
                active={state.sort === option.value}
                disabled={pending}
                onClick={() => navigate({ sort: option.value })}
              >
                {option.label}
              </Pill>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            <div className="min-w-0">
              <p className="mb-1.5 text-xs font-semibold text-rr-secondary">
                Your Spend
              </p>
              <Dropdown
                label="Your spend"
                options={spendOptions}
                value={spendValue}
                disabled={pending}
                highlight
                onSelect={(value) => {
                  if (value === "custom") {
                    setCustomOpen(true);
                    return;
                  }
                  selectSpend(value === "off" ? null : Number(value));
                }}
              />
              {customOpen ? (
                <CustomSpendInput
                  className="mt-1.5"
                  initial={isPreset(state.spend) ? null : state.spend}
                  disabled={pending}
                  onApply={(spend) => selectSpend(spend)}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="mb-1.5 text-xs font-semibold text-rr-secondary">
                Sort by
              </p>
              <Dropdown
                label="Sort by"
                options={sortOptions}
                value={state.sort}
                disabled={pending}
                onSelect={(sort) => navigate({ sort })}
              />
            </div>
          </div>
        </div>

        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-rr-muted">
          <IconInfoCircle
            size={13}
            className="mt-px shrink-0"
            aria-hidden="true"
          />
          Live Odds use tickets sold. If Sold Out uses the full ticket cap.
          Both assume one ticket and one winner.
        </p>
      </div>
    </section>
  );
}
