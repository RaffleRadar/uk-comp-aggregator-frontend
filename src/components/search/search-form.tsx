import Link from "next/link";
import { CompetitionSearch } from "@/components/layout/competition-search";

const EXAMPLE_TERMS = ["Rolex", "Golf", "iPhone", "Cash", "Holiday"];

export function SearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <div>
      <CompetitionSearch size="hero" initialQuery={initialQuery} />

      <p className="mt-3 text-sm text-rr-muted">
        Try a brand, model or prize: Rolex, Golf R, £1,000 cash.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_TERMS.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="inline-flex items-center justify-center rounded-full border border-rr-border bg-rr-surface px-3 py-1 text-sm text-rr-secondary no-underline transition hover:bg-rr-elevated hover:text-rr-primary"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
