import { formatDistanceToNow } from "date-fns";

function formatRelativeTime(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return formatDistanceToNow(date, { addSuffix: true })
    .replace("less than a minute ago", "just now")
    .replace(" minute ago", " min ago")
    .replace(" minutes ago", " min ago")
    .replace(" hour ago", " hr ago")
    .replace(" hours ago", " hr ago")
    .replace(" day ago", " d ago")
    .replace(" days ago", " d ago");
}

export type HeroStats = {
  competitionsCount: number;
  operatorsCount: number;
  lastUpdatedAt: string | null;
};

export function Hero({ stats }: { stats: HeroStats }) {
  const liveDraws = stats.competitionsCount ?? 0;
  const updated = formatRelativeTime(stats.lastUpdatedAt);

  return (
    <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
      <div className="container py-4 lg:py-14 text-center">
        <p className="hidden text-sm font-medium text-rr-green lg:block">
          The UK&apos;s competition intelligence hub
        </p>

        <h1 className="hidden mt-2 mx-auto max-w-3xl text-3xl lg:text-5xl font-semibold tracking-[-0.02em] text-rr-primary leading-[1.05] lg:block">
          Find better draws. <span className="text-rr-green">Win smarter.</span>
        </h1>

        <p className="hidden mt-3 mx-auto max-w-[650px] text-sm lg:text-base text-rr-muted lg:block">
          Track undersold competitions, spot real value and enter at the right time.
        </p>

        <div className="flex items-center justify-center gap-2 whitespace-nowrap text-sm text-rr-muted lg:hidden">
          <span className="font-semibold text-rr-green">
            {liveDraws.toLocaleString("en-GB")}
          </span>
          <span>draws</span>
        </div>

        <div className="hidden mt-7 flex-wrap items-center justify-center gap-6 lg:flex">
          <div>
            <p className="text-rr-green text-lg font-semibold leading-none">
              {liveDraws}
            </p>
            <p className="mt-1 text-sm text-rr-muted">Live draws</p>
          </div>

          <div className="h-8 w-px bg-rr-border" />

          <div>
            <p className="text-rr-green text-lg font-semibold leading-none">
              {updated}
            </p>
            <p className="mt-1 text-sm text-rr-muted">Last updated</p>
          </div>
        </div>
      </div>
    </section>
  );
}