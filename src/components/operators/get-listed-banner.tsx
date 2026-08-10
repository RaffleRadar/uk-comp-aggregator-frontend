import Link from "next/link";

export function GetListedBanner() {
  return (
    <div className="mt-10 rounded-xl border border-rr-green-border bg-rr-surface p-5 md:mt-14 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green">
            <span className="h-px w-8 bg-rr-green" />
            For operators
          </p>
          <h2 className="text-xl font-medium leading-tight tracking-[-0.02em] text-rr-primary md:text-2xl">
            Run a competition site?
          </h2>
          <p className="mt-2 max-w-[560px] text-sm leading-6 text-rr-secondary md:text-base md:leading-7">
            Add your competitions to RaffleRadar and reach entrants who are
            already comparing operators and looking for their next draw.
          </p>
        </div>
        <Link
          href="/get-listed"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-rr-green px-5 py-3 text-sm font-medium text-rr-on-accent no-underline transition-opacity hover:opacity-90"
        >
          Apply for your free listing
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
