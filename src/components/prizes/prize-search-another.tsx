import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";

export function PrizeSearchAnother() {
  return (
    <section
      aria-labelledby="prize-search-another-title"
      className="container pb-10"
    >
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-3 py-3 md:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rr-green-bg text-rr-green">
          <IconSearch size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 basis-[200px]">
          <h2
            id="prize-search-another-title"
            className="text-base font-semibold leading-tight text-rr-primary"
          >
            Search Another Prize
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-rr-muted">
            Check any prize across all approved operators and compare the best
            options instantly.
          </p>
        </div>
        <ScrollTopLink
          href="/prizes"
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-rr-green px-3.5 py-2 text-sm font-semibold text-rr-on-accent no-underline transition-opacity hover:opacity-90 sm:w-auto"
        >
          Back to Prize Search
          <IconArrowRight size={16} aria-hidden="true" />
        </ScrollTopLink>
      </div>
    </section>
  );
}
