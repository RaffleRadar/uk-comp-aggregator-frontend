import type { ComponentType } from "react";
import Form from "next/form";
import Link from "next/link";
import {
  IconArrowRight,
  IconChevronRight,
  IconCoins,
  IconDatabase,
  IconSearch,
  IconStar,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import { ChristmasTreeIcon } from "@/components/ui/christmas-tree-icon";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { cn } from "@/lib/cn";
import type {
  PrizeList,
  PrizeListItem,
  PrizeListState,
  PrizeRecentItem,
  PrizeRecentlyRun,
} from "@/lib/prizes";
import {
  DEFAULT_PRIZE_LIST_CATEGORY,
  PRIZE_LIST_CATEGORIES,
  PRIZE_QUERY_MAX_LENGTH,
  PRIZE_RECENT_PATH,
  formatCount,
  formatLastRun,
  formatPrizeValueTotal,
  formatTicketPrice,
  prizeCategoryLabel,
  prizeDatabaseHref,
} from "@/lib/prizes";

type TileIcon = ComponentType<{ size?: number; className?: string }>;

function plural(count: number, one: string, many: string): string {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

function SearchBox({ state }: { state: PrizeListState }) {
  return (
    <Form action="/prizes" scroll={false} className="mt-5 md:mt-6">
      <div className="flex items-center gap-2 rounded-xl border border-rr-border bg-rr-surface p-1.5 pl-3 focus-within:border-rr-green">
        <IconSearch
          size={18}
          aria-hidden="true"
          className="shrink-0 text-rr-muted"
        />
        <input
          type="search"
          name="q"
          defaultValue={state.query ?? ""}
          maxLength={PRIZE_QUERY_MAX_LENGTH}
          aria-label="Search for a prize"
          placeholder="Search prizes... e.g. PlayStation 5, Rolex, Audi RS6, hot tub"
          className="min-w-0 flex-1 bg-transparent text-sm text-rr-primary outline-none placeholder:text-rr-muted"
        />
        {state.category !== DEFAULT_PRIZE_LIST_CATEGORY ? (
          <input type="hidden" name="category" value={state.category} />
        ) : null}
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-rr-green px-3.5 py-2 text-sm font-semibold text-rr-on-accent transition-opacity hover:opacity-90"
        >
          Search
          <IconArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </Form>
  );
}

const PILL_ROW_SIZES = [3, 4];

function pillRows<T>(items: readonly T[]): T[][] {
  const rows: T[][] = [];
  let from = 0;
  for (const size of PILL_ROW_SIZES) {
    rows.push(items.slice(from, from + size));
    from += size;
  }
  rows.push(items.slice(from));
  return rows.filter((row) => row.length > 0);
}

function CategoryPills({ state }: { state: PrizeListState }) {
  return (
    <nav
      aria-label="Prize categories"
      className="mt-4 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-1.5"
    >
      {pillRows(PRIZE_LIST_CATEGORIES).map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:contents">
          {row.map((item) => {
            const active = item.key === state.category;
            const christmas = item.key === "christmas";

            return (
              <Link
                key={item.key}
                href={prizeDatabaseHref({
                  ...state,
                  category: item.key,
                  showAll: false,
                })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex flex-auto items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-[18px] no-underline transition sm:flex-none sm:px-3 sm:text-xs",
                  active
                    ? "border-transparent bg-rr-green text-rr-on-accent"
                    : christmas
                      ? "border-red-500/60 bg-red-500/5 text-rr-primary hover:bg-red-500/10"
                      : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary",
                )}
              >
                {christmas ? <ChristmasTreeIcon active={active} /> : null}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  note,
  href,
}: {
  icon: TileIcon;
  label: string;
  value: string;
  note?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-rr-muted">
          {label}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm leading-tight text-rr-secondary">
          <span className="truncate text-lg font-bold text-rr-primary">
            {value}
          </span>
          {note ? <span className="text-xs">{note}</span> : null}
        </p>
      </div>
    </>
  );

  const className =
    "flex min-w-0 items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-3 py-2.5 no-underline";

  return href ? (
    <ScrollTopLink
      href={href}
      className={cn(className, "transition-colors hover:border-rr-green")}
    >
      {body}
    </ScrollTopLink>
  ) : (
    <div className={className}>{body}</div>
  );
}

function StatTiles({ stats }: { stats: PrizeList["stats"] }) {
  const common = stats.mostCommonThisWeek;

  return (
    <section aria-label="Prize Database figures" className="container pb-6">
      <div className="mx-auto grid max-w-[1100px] gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={IconTarget}
          label="Prizes tracked"
          value={formatCount(stats.prizeListings)}
          note="prize listings"
        />
        <StatTile
          icon={IconTrophy}
          label="Unique prize types"
          value={formatCount(stats.uniquePrizes)}
          note="prizes"
        />
        <StatTile
          icon={IconCoins}
          label="Estimated live prize value"
          value={formatPrizeValueTotal(stats.liveValue)}
          note="across live draws"
        />
        <StatTile
          icon={IconStar}
          label="Most common this week"
          value={common?.label ?? "–"}
          href={common ? `/prizes/${common.key}` : undefined}
        />
      </div>
    </section>
  );
}

function PrizeRow({ prize, rank }: { prize: PrizeListItem; rank: number }) {
  return (
    <li className="border-b border-rr-border last:border-b-0">
      <ScrollTopLink
        href={`/prizes/${prize.key}`}
        className="flex items-center gap-3 px-3 py-2 no-underline transition-colors hover:bg-rr-elevated"
      >
        <span
          className={cn(
            "w-6 shrink-0 text-center text-xs font-semibold",
            rank <= 3 ? "text-rr-green" : "text-rr-secondary",
          )}
        >
          {rank}
        </span>
        <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-rr-border bg-rr-elevated">
          <CompetitionImage
            src={prize.imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-rr-primary">
            {prize.label}
          </span>
          <span className="block text-xs text-rr-secondary">
            {plural(prize.operators, "operator", "operators")} •{" "}
            {plural(prize.liveDraws, "live draw", "live draws")}
          </span>
          {prize.fromPrice != null ? (
            <span className="block text-xs text-rr-secondary sm:hidden">
              From{" "}
              <span className="font-semibold text-rr-green">
                {formatTicketPrice(prize.fromPrice)}
              </span>
            </span>
          ) : null}
        </span>
        {prize.fromPrice != null ? (
          <span className="hidden shrink-0 text-xs text-rr-secondary sm:block">
            From{" "}
            <span className="text-sm font-semibold text-rr-green">
              {formatTicketPrice(prize.fromPrice)}
            </span>
          </span>
        ) : null}
        <IconChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-rr-muted"
        />
      </ScrollTopLink>
    </li>
  );
}

function PrizeColumn({
  prizes,
  offset,
}: {
  prizes: PrizeListItem[];
  offset: number;
}) {
  if (prizes.length === 0) return null;

  return (
    <ol className="overflow-hidden rounded-xl border border-rr-border bg-rr-surface">
      {prizes.map((prize, index) => (
        <PrizeRow key={prize.key} prize={prize} rank={offset + index + 1} />
      ))}
    </ol>
  );
}

function listHeading(
  list: PrizeList,
  state: PrizeListState,
): { title: string; lead: string } {
  const shown = list.prizes.length;
  const category =
    state.category !== DEFAULT_PRIZE_LIST_CATEGORY
      ? `${prizeCategoryLabel(state.category)} `
      : "";

  if (state.query) {
    return {
      title: `${plural(list.total, "prize", "prizes")} for “${state.query}”`,
      lead: "Ranked by how many operators are currently running each prize.",
    };
  }

  if (state.showAll) {
    return {
      title: `All ${plural(list.total, `${category}prize`, `${category}prizes`)}`,
      lead: "Ranked by how many operators are currently running each prize.",
    };
  }

  return {
    title: `The ${shown} ${category}prizes operators run most often.`,
    lead: "Ranked by how many operators are currently running each prize.",
  };
}

function PrizeListSection({
  list,
  state,
}: {
  list: PrizeList;
  state: PrizeListState;
}) {
  const { title, lead } = listHeading(list, state);
  const half = Math.ceil(list.prizes.length / 2);
  const left = list.prizes.slice(0, half);
  const right = list.prizes.slice(half);

  return (
    <section aria-labelledby="prize-list-title" className="container pb-6">
      <div className="mx-auto max-w-[1100px]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-rr-green">
          {state.query ? "Search results" : "Top prizes"}
        </p>
        <h2
          id="prize-list-title"
          className="text-xl font-semibold leading-tight tracking-[-0.02em] text-rr-primary md:text-2xl"
        >
          {title}
        </h2>
        <p className="mb-3 mt-1 text-sm text-rr-secondary">{lead}</p>

        {list.prizes.length === 0 ? (
          <p className="rounded-xl border border-rr-border bg-rr-surface px-4 py-5 text-sm text-rr-secondary">
            No live prize matches this search.
          </p>
        ) : (
          <>
            <div className="grid gap-2 lg:hidden">
              <PrizeColumn prizes={list.prizes} offset={0} />
            </div>
            <div className="hidden gap-3 lg:grid lg:grid-cols-2 lg:items-start">
              <PrizeColumn prizes={left} offset={0} />
              <PrizeColumn prizes={right} offset={half} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function RecentRow({ prize }: { prize: PrizeRecentItem }) {
  const lastRun = formatLastRun(prize.lastRunAt);

  return (
    <li className="border-b border-rr-border last:border-b-0">
      <ScrollTopLink
        href={`/prizes/${prize.key}`}
        className="flex items-center gap-3 px-3 py-2 no-underline transition-colors hover:bg-rr-elevated"
      >
        <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-rr-border bg-rr-elevated">
          <CompetitionImage
            src={prize.imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-rr-primary">
            {prize.label}
          </span>
          <span className="block text-xs text-rr-secondary">
            {plural(prize.operators, "operator", "operators")} •{" "}
            {plural(prize.runs, "draw", "draws")}
          </span>
          {lastRun ? (
            <span className="block text-xs text-rr-secondary sm:hidden">
              Last run{" "}
              <span className="font-semibold text-rr-primary">{lastRun}</span>
            </span>
          ) : null}
        </span>
        {lastRun ? (
          <span className="hidden shrink-0 text-xs text-rr-secondary sm:block">
            Last run{" "}
            <span className="text-sm font-semibold text-rr-primary">
              {lastRun}
            </span>
          </span>
        ) : null}
        <IconChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-rr-muted"
        />
      </ScrollTopLink>
    </li>
  );
}

function RecentColumn({ prizes }: { prizes: PrizeRecentItem[] }) {
  if (prizes.length === 0) return null;

  return (
    <ul className="overflow-hidden rounded-xl border border-rr-border bg-rr-surface">
      {prizes.map((prize) => (
        <RecentRow key={prize.key} prize={prize} />
      ))}
    </ul>
  );
}

export function RecentPrizeColumns({ prizes }: { prizes: PrizeRecentItem[] }) {
  const half = Math.ceil(prizes.length / 2);

  return (
    <>
      <div className="grid gap-2 lg:hidden">
        <RecentColumn prizes={prizes} />
      </div>
      <div className="hidden gap-3 lg:grid lg:grid-cols-2 lg:items-start">
        <RecentColumn prizes={prizes.slice(0, half)} />
        <RecentColumn prizes={prizes.slice(half)} />
      </div>
    </>
  );
}

function RecentlyRunSection({ recent }: { recent: PrizeRecentlyRun }) {
  if (recent.prizes.length === 0) return null;

  const hasMore = recent.total > recent.prizes.length;

  return (
    <section aria-labelledby="recently-run-title" className="container pb-10">
      <div className="mx-auto max-w-[1100px]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-rr-green">
          Recently run
        </p>
        <h2
          id="recently-run-title"
          className="text-xl font-semibold leading-tight tracking-[-0.02em] text-rr-primary md:text-2xl"
        >
          Prizes with no live draws right now
        </h2>
        <p className="mb-3 mt-1 text-sm text-rr-secondary">
          Run in the last {recent.days} days. Open a prize to see how its past
          draws went.
        </p>
        <RecentPrizeColumns prizes={recent.prizes} />
        {hasMore ? (
          <div className="mt-3 flex justify-center">
            <ScrollTopLink
              href={PRIZE_RECENT_PATH}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-rr-green-border bg-rr-green-bg px-3.5 py-2.5 text-sm font-semibold text-rr-green no-underline transition-colors hover:bg-rr-green hover:text-rr-on-accent sm:w-auto sm:py-2"
            >
              View All {recent.total.toLocaleString("en-GB")} Recently Run
              Prizes
              <IconArrowRight size={16} aria-hidden="true" />
            </ScrollTopLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BrowseAll({ state }: { state: PrizeListState }) {
  return (
    <section aria-label="Browse all prizes" className="container pb-10">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-xl border border-rr-border bg-rr-surface px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-y-0.5 md:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green sm:row-span-2">
          <IconDatabase size={18} aria-hidden="true" />
        </span>
        <h2 className="min-w-0 text-base font-semibold leading-tight text-rr-primary sm:self-end">
          Browse All Prizes
        </h2>
        <p className="col-span-2 text-xs leading-snug text-rr-muted sm:col-span-1 sm:col-start-2 sm:self-start">
          See the full prize directory, including prizes outside the top 20.
        </p>
        <Link
          href={prizeDatabaseHref({ ...state, showAll: true })}
          scroll={false}
          className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-rr-green px-3.5 py-2.5 text-sm font-semibold text-rr-on-accent no-underline transition-opacity hover:opacity-90 sm:col-span-1 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:py-2"
        >
          View All Prizes
          <IconArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function PrizeDatabaseHero({ state }: { state: PrizeListState }) {
  return (
    <section
      aria-labelledby="prize-database-title"
      className="bg-gradient-to-b from-rr-surface to-rr-bg"
    >
      <div className="container pb-6 pt-6 md:pb-8 md:pt-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-rr-green">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-rr-green" />
            <span>Prize Database</span>
          </p>
          <h1
            id="prize-database-title"
            className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-rr-primary md:text-5xl"
          >
            Find UK Competitions <span className="text-rr-green">by Prize</span>
          </h1>
          <SearchBox state={state} />
          <p className="mt-3 max-w-[820px] text-sm leading-6 text-rr-secondary">
            Search by prize, brand or model to find live competitions from
            vetted UK operators. Compare ticket prices and odds when more than
            one operator is offering the same prize.
          </p>
          <CategoryPills state={state} />
        </div>
      </div>
    </section>
  );
}

export function PrizeDatabaseBody({
  list,
  state,
}: {
  list: PrizeList;
  state: PrizeListState;
}) {
  const hasMore = !state.showAll && list.total > list.prizes.length;

  return (
    <>
      <StatTiles stats={list.stats} />
      <PrizeListSection list={list} state={state} />
      {hasMore ? <BrowseAll state={state} /> : <div className="pb-4" />}
      {list.recentlyRun ? (
        <RecentlyRunSection recent={list.recentlyRun} />
      ) : null}
    </>
  );
}
