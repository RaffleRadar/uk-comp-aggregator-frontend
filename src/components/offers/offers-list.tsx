"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { IconArrowUpRight, IconClock, IconSearch } from "@tabler/icons-react";
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

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
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

function OperatorMark({ offer }: { offer: OfferCardData }) {
  if (offer.logoUrl) {
    return (
      <Image
        src={offer.logoUrl}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 shrink-0 rounded-md border border-rr-border bg-white object-contain p-0.5"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-rr-green-border bg-rr-green-bg text-[10px] font-bold text-rr-green"
    >
      {initials(offer.operatorName)}
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
      className="inline-flex min-h-[34px] shrink-0 items-center justify-center rounded-md border border-rr-green-border bg-rr-surface px-2.5 text-xs font-semibold text-rr-primary transition hover:border-rr-green"
    >
      {state === "copied" ? "Copied" : state === "failed" ? code : "Copy code"}
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
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-rr-border bg-rr-surface">
      <div className="border-b border-rr-border bg-gradient-to-br from-rr-green-bg to-rr-surface px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <OperatorMark offer={offer} />
          <span className="min-w-0 truncate text-sm font-semibold text-rr-primary">
            {offer.operatorName}
          </span>
        </div>
        <h3 className="mt-3 break-words text-[26px] font-extrabold leading-[1.12] tracking-[-0.03em] text-rr-green md:text-[30px]">
          {offer.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        {offer.promoCode ? (
          <div className="flex min-h-[52px] items-center justify-between gap-2 rounded-md border border-dashed border-rr-green-border bg-rr-green-bg py-1.5 pl-3 pr-2">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-rr-secondary">
                Promo code
              </span>
              <code className="block break-all font-mono text-[15px] font-extrabold tracking-[0.05em] text-rr-primary">
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
          <p className="flex min-h-[52px] items-center rounded-md bg-rr-elevated px-3 text-sm text-rr-secondary">
            No promo code needed.
          </p>
        )}

        {offer.terms ? (
          <p className="whitespace-pre-line break-words text-sm text-rr-secondary">
            <strong className="mb-0.5 block text-xs font-semibold text-rr-primary">
              Offer terms
            </strong>
            {offer.terms}
          </p>
        ) : null}

        <div className="mt-auto grid gap-2.5">
          {ends ? (
            <p className="flex items-center gap-1.5 text-xs text-rr-muted">
              <IconClock size={15} className="shrink-0 text-rr-green" />
              {ends}
            </p>
          ) : null}
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={`Visit ${offer.operatorName}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-rr-green px-4 text-sm font-bold text-rr-on-accent no-underline transition hover:opacity-90"
          >
            Visit operator
            <IconArrowUpRight size={17} />
          </a>
        </div>
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
            className="text-2xl font-extrabold tracking-[-0.03em] text-rr-primary"
          >
            Current offers
          </h2>
          <p className="mt-0.5 text-sm text-rr-muted" aria-live="polite">
            {countText}
          </p>
        </div>

        {active.length > 0 ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-rr-border bg-rr-surface px-3 transition-colors focus-within:border-rr-green-border sm:w-[260px] sm:flex-none">
              <IconSearch size={17} className="shrink-0 text-rr-muted" />
              <span className="sr-only">Search offers or operators</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search offers or operators"
                className="min-w-0 flex-1 bg-transparent text-sm text-rr-primary outline-none placeholder:text-rr-muted"
              />
            </label>
            <label className="shrink-0">
              <span className="sr-only">Sort offers</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-11 cursor-pointer rounded-md border border-rr-border bg-rr-surface px-3 text-sm text-rr-primary outline-none focus-visible:border-rr-green-border"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
        <p className="rounded-xl border border-rr-border px-5 py-9 text-center text-sm text-rr-muted">
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
