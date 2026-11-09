import Link from "next/link";
import { IconChartBar, IconChevronRight } from "@tabler/icons-react";

export function WeeklyRadarBanner() {
  return (
    <section className="container pb-2 lg:pb-4">
      <Link
        href="/weekly-radar"
        className="group flex items-center gap-3 rounded-2xl border border-rr-green bg-rr-surface px-3 py-2.5 no-underline shadow-[0_0_20px_-10px_var(--accent)] transition hover:bg-rr-elevated hover:shadow-[0_0_24px_-6px_var(--accent)] sm:gap-4 sm:px-5 sm:py-3"
      >
        <IconChartBar className="h-7 w-7 shrink-0 text-rr-green sm:h-8 sm:w-8" stroke={2.4} />
        <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-2.5">
            <span className="rounded-full border border-rr-green bg-rr-green-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-rr-green">
              New
            </span>
            <span className="text-base font-bold text-rr-primary sm:text-lg">Weekly Radar</span>
          </span>
          <span aria-hidden="true" className="hidden h-7 w-0.5 rounded-full bg-rr-green sm:block" />
          <span className="whitespace-nowrap text-xs text-rr-secondary min-[400px]:text-[13px] sm:text-[15px] sm:text-rr-primary">
            Last week&apos;s competition trends &amp; stats
          </span>
        </span>
        <IconChevronRight className="h-5 w-5 shrink-0 text-rr-primary transition-transform group-hover:translate-x-0.5" stroke={2.4} />
      </Link>
    </section>
  );
}
