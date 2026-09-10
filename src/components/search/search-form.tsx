"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_TERMS = ["Rolex", "Golf", "iPhone", "Cash", "Holiday"];

export function SearchForm({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const raw = String(formData.get("q") ?? "").trim();
        router.push(raw ? `/search?q=${encodeURIComponent(raw)}` : "/search");
      }}
    >
      <div className="relative w-full">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rr-muted" />
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          autoFocus
          placeholder="Search competitions…"
          className="h-12 w-full rounded-xl border border-rr-border bg-rr-surface pl-12 pr-[120px] text-base text-rr-primary placeholder:text-rr-muted focus-visible:ring-2 focus-visible:ring-rr-green focus:outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 px-5 text-sm"
        >
          Search
        </Button>
      </div>

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
    </form>
  );
}
