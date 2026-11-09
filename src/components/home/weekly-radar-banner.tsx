import Link from "next/link";
import { IconChartBar, IconChevronRight } from "@tabler/icons-react";

export function WeeklyRadarBanner() {
  return (
    <section className="container pb-2 lg:pb-4">
      <Link
        href="/weekly-radar"
        className="group flex items-center gap-3 rounded-xl border border-rr-green bg-rr-surface px-3 py-2.5 no-underline shadow-[0_0_20px_-10px_var(--accent)] transition hover:bg-rr-elevated hover:shadow-[0_0_24px_-6px_var(--accent)] sm:px-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rr-green text-rr-on-accent">
          <IconChartBar className="h-6 w-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-rr-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-rr-on-accent">
              New
            </span>
            <span className="text-base font-bold text-rr-primary">Weekly Radar</span>
          </span>
          <span aria-hidden="true" className="hidden h-6 w-px bg-rr-border sm:block" />
          <span className="text-sm text-rr-secondary">
            Last week&apos;s competition trends &amp; stats
          </span>
        </span>
        <IconChevronRight className="h-5 w-5 shrink-0 text-rr-green transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
