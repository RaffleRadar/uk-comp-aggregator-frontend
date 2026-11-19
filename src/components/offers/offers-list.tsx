"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type { OfferCardData } from "@/sanity/offers";

type SortKey = "newest" | "ending" | "operator";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "ending", label: "Ending soon" },
  { value: "operator", label: "Operator A–Z" },
];

const endsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function endsLabel(endsAt: string): string | null {
  const time = Date.parse(endsAt);
  if (!Number.isFinite(time)) return null;
  return `Ends ${endsFormatter.format(new Date(time))} UK time`;
}

function endsAtValue(offer: OfferCardData): number {
  if (!offer.endsAt) return Number.POSITIVE_INFINITY;
  const time = Date.parse(offer.endsAt);
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function sortOffers(offers: OfferCardData[], sort: SortKey): OfferCardData[] {
  const list = [...offers];
  if (sort === "ending") {
    return list.sort(
      (a, b) =>
        endsAtValue(a) - endsAtValue(b) ||
        b.createdAt.localeCompare(a.createdAt),
    );
  }
  if (sort === "operator") {
    return list.sort(
      (a, b) =>
        a.operatorName.localeCompare(b.operatorName, "en-GB") ||
        b.createdAt.localeCompare(a.createdAt),
    );
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected =
    SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

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
      className="relative shrink-0"
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
        aria-label="Sort offers"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-[160px] cursor-pointer items-center justify-between gap-2 rounded-md border bg-rr-surface px-3 text-sm text-rr-primary outline-none transition",
          open
            ? "border-rr-green"
            : "border-rr-border hover:border-rr-green focus-visible:border-rr-green",
        )}
      >
        <span className="truncate">{selected.label}</span>
        <IconChevronDown
          size={14}
          className={cn(
            "shrink-0 text-rr-secondary transition-transform",
            open ? "rotate-180" : undefined,
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Sort offers"
          className="absolute right-0 z-50 mt-1 w-full min-w-[180px] rounded-md border border-rr-border bg-rr-surface p-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false);
                  onChange(option.value);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-sm outline-none transition",
                  active
                    ? "bg-rr-green-bg font-medium text-rr-primary"
                    : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary focus-visible:bg-rr-elevated focus-visible:text-rr-primary",
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

function OperatorMark({ offer }: { offer: OfferCardData }) {
  if (offer.logoUrl) {
    return (
      <Image
        src={offer.logoUrl}
        alt=""
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 shrink-0 rounded-lg object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rr-elevated text-xs font-semibold text-rr-primary"
    >
      {offer.operatorName.slice(0, 2).toUpperCase()}
    </span>
  );
}

function CopyCodeButton({
  code,
  operatorName,
  onCopied,
}: {
  code: string;
  operatorName: string;
  onCopied: (message: string) => void;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = async () => {
    const ok = await writeToClipboard(code);
    setState(ok ? "copied" : "failed");
    onCopied(
      ok
        ? `Promo code copied: ${code}`
        : `Copy this promo code manually: ${code}`,
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Copy promo code for ${operatorName}`}
      className={cn(
        "inline-flex h-8 min-w-[88px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition",
        state === "copied"
          ? "border-rr-green bg-rr-green text-rr-on-accent"
          : "border-rr-border bg-rr-surface text-rr-primary hover:border-rr-green",
      )}
    >
      {state === "copied" ? (
        <>
          <IconCheck size={13} stroke={3} />
          Copied
        </>
      ) : state === "failed" ? (
        "Select code"
      ) : (
        "Copy code"
      )}
    </button>
  );
}

function OfferCard({
  offer,
  onCopied,
}: {
  offer: OfferCardData;
  onCopied: (message: string) => void;
}) {
  const ends = offer.endsAt ? endsLabel(offer.endsAt) : null;

  return (
    <article className="flex min-w-0 flex-col rounded-[10px] border border-rr-border bg-rr-surface p-4">
      <div className="flex items-center gap-3">
        <OperatorMark offer={offer} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-rr-primary">
            {offer.operatorName}
          </p>
          {ends ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-rr-muted">
              <IconClock size={13} className="shrink-0" />
              <span className="truncate">{ends}</span>
            </p>
          ) : null}
        </div>
      </div>

      <h3 className="mt-4 break-words text-xl font-medium leading-snug tracking-[-0.02em] text-rr-green">
        {offer.title}
      </h3>

      {offer.terms ? (
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-rr-secondary">
          {offer.terms}
        </p>
      ) : null}

      <div className="mt-auto pt-4">
        {offer.promoCode ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-rr-green-border bg-rr-green-bg py-2 pl-3 pr-2">
            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[0.08em] text-rr-secondary">
                Promo code
              </span>
              <code className="block select-all break-all font-mono text-sm font-semibold tracking-[0.05em] text-rr-primary">
                {offer.promoCode}
              </code>
            </div>
            <CopyCodeButton
              code={offer.promoCode}
              operatorName={offer.operatorName}
              onCopied={onCopied}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-rr-border bg-rr-elevated px-3 py-3.5 text-sm text-rr-secondary">
            No promo code needed.
          </p>
        )}

        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`Visit ${offer.operatorName}`}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-rr-green px-3 py-2.5 text-sm font-medium text-rr-on-accent no-underline transition hover:opacity-90"
        >
          Visit operator
          <IconArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}

export function OffersList({ offers }: { offers: OfferCardData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [now, setNow] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 60000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const active = useMemo(
    () =>
      now === null
        ? offers
        : offers.filter((offer) => endsAtValue(offer) > now),
    [offers, now],
  );

  const visible = useMemo(() => {
    const phrase = query.trim().toLocaleLowerCase("en-GB");
    const matches = phrase
      ? active.filter((offer) =>
          [offer.operatorName, offer.title, offer.promoCode, offer.terms].some(
            (text) =>
              text ? text.toLocaleLowerCase("en-GB").includes(phrase) : false,
          ),
        )
      : active;
    return sortOffers(matches, sort);
  }, [active, query, sort]);

  const countText = `${visible.length} ${visible.length === 1 ? "offer" : "offers"}`;

  return (
    <section aria-labelledby="offers-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2
            id="offers-heading"
            className="text-xl font-medium tracking-[-0.02em] text-rr-primary"
          >
            Current offers
          </h2>
          <p className="mt-0.5 text-sm text-rr-muted" aria-live="polite">
            {countText}
          </p>
        </div>

        {active.length > 0 ? (
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-rr-border bg-rr-surface px-3 transition-colors focus-within:border-rr-green sm:w-[260px] sm:flex-none">
              <IconSearch size={16} className="shrink-0 text-rr-muted" />
              <span className="sr-only">Search offers or operators</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search offers or operators"
                className="min-w-0 flex-1 bg-transparent text-sm text-rr-primary outline-none placeholder:text-rr-muted"
              />
            </label>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onCopied={setNotice} />
          ))}
        </div>
      ) : (
        <p className="rounded-[10px] border border-rr-border bg-rr-surface px-5 py-9 text-center text-sm text-rr-muted">
          {active.length > 0
            ? "No matching offers. Try a different search."
            : "There are no current offers. Check back soon."}
        </p>
      )}

      <p className="sr-only" role="status">
        {notice}
      </p>
    </section>
  );
}
