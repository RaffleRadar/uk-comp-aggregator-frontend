"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { pushEvent } from "@/lib/analytics";
import { getCompetitionSearch, type CompetitionSearchResult } from "@/lib/api";

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTicketPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return priceFormatter.format(amount);
}

type CompetitionSearchInputProps = {
  initialQuery: string;
};

export function CompetitionSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery =
    pathname === "/competitions"
      ? (searchParams.get("search")?.trim() ?? "")
      : "";

  return (
    <CompetitionSearchInput
      key={`${pathname}::${initialQuery}`}
      initialQuery={initialQuery}
    />
  );
}

function CompetitionSearchInput({
  initialQuery,
}: CompetitionSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);
  const skipNextFetchRef = useRef(initialQuery.trim().length >= 2);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CompetitionSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedQuery = query.trim();

  function resetSearchState() {
    setResults([]);
    setLoading(false);
    setOpen(false);
    setHasFetched(false);
    setActiveIndex(-1);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    if (trimmedQuery.length < 2) return;

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const nextResults = await getCompetitionSearch(trimmedQuery, 8, true);

        if (requestIdRef.current !== currentRequestId) return;

        setResults(nextResults);
        setActiveIndex(-1);
      } catch {
        if (requestIdRef.current !== currentRequestId) return;

        setResults([]);
        setActiveIndex(-1);
      } finally {
        if (requestIdRef.current !== currentRequestId) return;

        setLoading(false);
        setHasFetched(true);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  function handleSelect(item: CompetitionSearchResult) {
    setQuery(item.prize);
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
    router.push(`/competitions/${item.id}`);
  }

  function handleClear() {
    setQuery("");
    resetSearchState();
    requestIdRef.current += 1;
    inputRef.current?.focus();

    if (searchParams.has("search")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      if (!results.length) return;

      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      return;
    }

    if (event.key === "ArrowUp") {
      if (!results.length) return;

      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      return;
    }

    if (event.key === "Enter") {
      const hasHighlightedResult =
        open && activeIndex >= 0 && Boolean(results[activeIndex]);

      if (hasHighlightedResult) {
        event.preventDefault();
        handleSelect(results[activeIndex]);
        return;
      }

      if (trimmedQuery.length > 0) {
        event.preventDefault();
        setOpen(false);
        setResults([]);
        setActiveIndex(-1);
        pushEvent("search", { query: trimmedQuery });
        router.push(`/competitions?search=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-md bg-rr-elevated px-3">
        <IconSearch size={16} className="text-rr-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          placeholder="Search competitions..."
          autoComplete="off"
          spellCheck={false}
          aria-label="Search competitions"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="competition-search-listbox"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `competition-search-option-${results[activeIndex].id}`
              : undefined
          }
          className="min-w-0 flex-1 bg-transparent text-sm text-rr-primary placeholder:text-rr-muted outline-none"
          onChange={(event) => {
            const nextQuery = event.target.value;
            const nextTrimmedQuery = nextQuery.trim();

            setQuery(nextQuery);

            if (nextTrimmedQuery.length < 2) {
              requestIdRef.current += 1;
              resetSearchState();
              return;
            }

            requestIdRef.current += 1;
            setResults([]);
            setLoading(true);
            setOpen(true);
            setHasFetched(false);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="shrink-0 rounded-sm p-0.5 text-rr-muted transition-colors hover:text-rr-primary"
            onClick={handleClear}
          >
            <IconX size={14} />
          </button>
        ) : null}
      </div>

      {open && trimmedQuery.length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[70vh] overflow-x-hidden overflow-y-auto overscroll-contain rounded-md border border-rr-border bg-rr-surface shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center px-3 py-3">
              <RadarLoader size="md" />
            </div>
          ) : null}

          {!loading && hasFetched && results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-rr-muted">
              No competitions found
            </div>
          ) : null}

          {!loading && results.length > 0 ? (
            <ul id="competition-search-listbox" role="listbox" className="py-1">
              {results.map((item, index) => (
                <li key={item.id}>
                  <button
                    id={`competition-search-option-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={[
                      "flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      index === activeIndex
                        ? "bg-rr-elevated"
                        : "hover:bg-rr-elevated",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-rr-elevated">
                      {item.imageUrl ? (
                        <CompetitionImage
                          src={item.imageUrl}
                          alt={item.prize}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-rr-muted">
                          {item.prize.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium text-rr-primary">
                        {item.prize}
                      </div>
                      <div className="truncate text-xs text-rr-muted">
                        {item.operator?.name ?? "Unknown operator"}
                      </div>
                    </div>

                    <div className="shrink-0 whitespace-nowrap text-right text-xs font-medium text-rr-green">
                      {formatTicketPrice(item.ticketPrice)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
