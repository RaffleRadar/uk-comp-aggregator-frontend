"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type OperatorSearchItem = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  liveCount: number;
  vrLabel: string;
};

type IndexedOperator = {
  item: OperatorSearchItem;
  tokens: string[];
  compact: string;
  initials: string;
};

type ScoredOperator = {
  item: OperatorSearchItem;
  score: number;
};

const MAX_RESULTS = 8;

const GENERIC_WORDS = new Set([
  "competitions",
  "competition",
  "comps",
  "comp",
  "ltd",
  "limited",
  "uk",
  "the",
  "and",
  "co",
]);

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value: string) {
  const normalized = normalize(value);
  return normalized ? normalized.split(" ") : [];
}

function editDistance(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(cols).fill(0),
  );

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[a.length][b.length];
}

function allowedTypos(length: number) {
  if (length < 3) return 0;
  if (length < 6) return 1;
  return 2;
}

function prefixDistance(queryToken: string, nameToken: string) {
  let best = Number.POSITIVE_INFINITY;
  const lengths = [
    queryToken.length - 1,
    queryToken.length,
    queryToken.length + 1,
  ];

  for (const length of lengths) {
    if (length < 1 || length > nameToken.length) continue;
    best = Math.min(best, editDistance(queryToken, nameToken.slice(0, length)));
  }

  return best;
}

function indexOperator(item: OperatorSearchItem): IndexedOperator {
  const tokens = tokenize(item.name);
  const meaningful = tokens.filter((token) => !GENERIC_WORDS.has(token));
  const initialsSource = meaningful.length >= 2 ? meaningful : tokens;

  return {
    item,
    tokens,
    compact: tokens.join(""),
    initials: initialsSource.map((token) => token[0]).join(""),
  };
}

function scoreOperator(operator: IndexedOperator, queryTokens: string[]) {
  const queryCompact = queryTokens.join("");
  const { tokens, compact, initials } = operator;

  if (!queryCompact) return 0;
  if (compact === queryCompact) return 1000;
  if (compact.startsWith(queryCompact)) {
    return 900 - Math.min(compact.length - queryCompact.length, 50);
  }

  for (let start = 1; start < tokens.length; start += 1) {
    if (tokens.slice(start).join("").startsWith(queryCompact)) {
      return 800 - start * 10;
    }
  }

  const everyTokenPrefixes = queryTokens.every((queryToken) =>
    tokens.some((token) => token.startsWith(queryToken)),
  );
  if (everyTokenPrefixes) return 700;

  if (queryCompact.length >= 2 && compact.includes(queryCompact)) return 600;

  if (queryCompact.length >= 2 && initials.startsWith(queryCompact)) {
    return 550;
  }

  let totalDistance = 0;
  for (const queryToken of queryTokens) {
    const limit = allowedTypos(queryToken.length);
    if (limit === 0) {
      if (!tokens.some((token) => token.startsWith(queryToken))) return 0;
      continue;
    }

    let best = Number.POSITIVE_INFINITY;
    for (const token of tokens) {
      best = Math.min(best, prefixDistance(queryToken, token));
    }

    if (best > limit) return 0;
    totalDistance += best;
  }

  if (queryTokens.length === 1 && queryCompact.length >= 5) {
    const compactDistance = prefixDistance(queryCompact, compact);
    if (compactDistance <= allowedTypos(queryCompact.length)) {
      totalDistance = Math.min(totalDistance, compactDistance);
    }
  }

  return 400 - totalDistance * 40;
}

function searchOperators(
  index: IndexedOperator[],
  query: string,
): OperatorSearchItem[] {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const scored: ScoredOperator[] = [];
  for (const operator of index) {
    const score = scoreOperator(operator, queryTokens);
    if (score > 0) scored.push({ item: operator.item, score });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.item.liveCount - a.item.liveCount ||
        a.item.name.localeCompare(b.item.name, "en-GB"),
    )
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item);
}

function highlightName(name: string, query: string): ReactNode {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return name;

  const lower = name.toLowerCase();
  const ranges: Array<[number, number]> = [];

  for (const token of queryTokens) {
    let position = -1;
    let searchFrom = 0;

    while (searchFrom < lower.length) {
      const found = lower.indexOf(token, searchFrom);
      if (found === -1) break;
      const atWordStart = found === 0 || !/[a-z0-9]/.test(lower[found - 1]);
      if (atWordStart) {
        position = found;
        break;
      }
      if (position === -1) position = found;
      searchFrom = found + 1;
    }

    if (position >= 0) ranges.push([position, position + token.length]);
  }

  if (!ranges.length) return name;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([range[0], range[1]]);
    }
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], index) => {
    if (start > cursor) parts.push(name.slice(cursor, start));
    parts.push(
      <span key={index} className="text-rr-green">
        {name.slice(start, end)}
      </span>,
    );
    cursor = end;
  });
  if (cursor < name.length) parts.push(name.slice(cursor));

  return parts;
}

function formatLiveCount(count: number) {
  return count === 1 ? "1 live competition" : `${count} live competitions`;
}

export function OperatorSearch({
  operators,
}: {
  operators: OperatorSearchItem[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const index = useMemo(() => operators.map(indexOperator), [operators]);
  const results = useMemo(() => searchOperators(index, query), [index, query]);
  const trimmedQuery = query.trim();

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

  function handleSelect(item: OperatorSearchItem) {
    setQuery(item.name);
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/operators/${item.slug}`);
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
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
      if (!results.length) return;
      event.preventDefault();
      const target =
        activeIndex >= 0 && results[activeIndex]
          ? results[activeIndex]
          : results[0];
      handleSelect(target);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <div className="flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-4 text-base transition-colors focus-within:border-rr-green-border">
        <IconSearch size={20} className="shrink-0 text-rr-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          placeholder="Find an operator..."
          autoComplete="off"
          spellCheck={false}
          aria-label="Search operators"
          aria-autocomplete="list"
          aria-expanded={open && trimmedQuery.length > 0}
          aria-controls="operator-search-listbox"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `operator-search-option-${results[activeIndex].id}`
              : undefined
          }
          className="min-w-0 flex-1 bg-transparent text-base text-rr-primary outline-none ring-transparent placeholder:text-rr-muted focus-visible:ring-0"
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.trim().length > 0);
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
            <IconX size={18} />
          </button>
        ) : null}
      </div>

      {open && trimmedQuery.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-rr-border bg-rr-surface shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-rr-muted">
              No operators found
            </div>
          ) : (
            <ul id="operator-search-listbox" role="listbox" className="py-1">
              {results.map((item, itemIndex) => (
                <li key={item.id}>
                  <button
                    id={`operator-search-option-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={itemIndex === activeIndex}
                    className={[
                      "flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      itemIndex === activeIndex
                        ? "bg-rr-elevated"
                        : "hover:bg-rr-elevated",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => handleSelect(item)}
                  >
                    {item.logoUrl ? (
                      <Image
                        src={item.logoUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rr-elevated text-xs font-semibold text-rr-primary">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium text-rr-primary">
                        {highlightName(item.name, trimmedQuery)}
                      </div>
                      <div className="truncate text-xs text-rr-muted">
                        {formatLiveCount(item.liveCount)}
                      </div>
                    </div>

                    <div className="shrink-0 whitespace-nowrap text-right text-xs font-medium text-rr-muted">
                      {item.vrLabel}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
