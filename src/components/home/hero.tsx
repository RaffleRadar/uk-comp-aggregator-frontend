import { formatDistanceToNow } from "date-fns";

function formatRelativeTime(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return formatDistanceToNow(date, { addSuffix: true })
    .replace("less than a minute ago", "just now")
    .replace("about ", "")
    .replace(" minute ago", " min ago")
    .replace(" minutes ago", " min ago")
    .replace(" hour ago", " hr ago")
    .replace(" hours ago", " hr ago")
    .replace(" day ago", " d ago")
    .replace(" days ago", " d ago");
}

function getTrimmedValue(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function splitLastWord(value: string): { start: string; accent: string } {
  const trimmed = value.trim();
  const lastSpaceIndex = trimmed.lastIndexOf(" ");

  if (lastSpaceIndex === -1) {
    return { start: "", accent: trimmed };
  }

  return {
    start: trimmed.slice(0, lastSpaceIndex),
    accent: trimmed.slice(lastSpaceIndex + 1),
  };
}

export type HeroStats = {
  competitionsCount: number;
  operatorsCount: number;
  lastUpdatedAt: string | null;
};

type HeroCopy = {
  heroEyebrow?: string;
  heroHeadingMobile?: string;
  heroHeadingDesktop?: string;
  heroSubheading?: string;
  heroEyebrowMobile?: string;
  heroSubheadingMobile?: string;
};

export function Hero({ stats, copy }: { stats: HeroStats; copy?: HeroCopy }) {
  const liveDraws = stats.competitionsCount ?? 0;
 
  const updated = formatRelativeTime(stats.lastUpdatedAt);
  const eyebrow = getTrimmedValue(copy?.heroEyebrow);
  const mobileHeading = getTrimmedValue(copy?.heroHeadingMobile);
  const desktopHeading = getTrimmedValue(copy?.heroHeadingDesktop);
  const subheading = getTrimmedValue(copy?.heroSubheading);
  const mobileEyebrow = getTrimmedValue(copy?.heroEyebrowMobile);
  const mobileSubheading = getTrimmedValue(copy?.heroSubheadingMobile);
  const mobileHeadingParts = mobileHeading ? splitLastWord(mobileHeading) : null;
  const desktopHeadingParts = desktopHeading ? splitLastWord(desktopHeading) : null;

  return (
    <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
      <div className="container py-4 lg:py-14 text-center">
        <p className="hidden text-sm font-medium text-rr-green lg:block">
          {eyebrow ?? "UK competitions and prize draws, ranked by real value"}
        </p>

        <h1 className="mt-0 lg:mt-2 mx-auto max-w-3xl text-lg lg:text-5xl font-semibold tracking-[-0.02em] text-rr-primary leading-tight lg:leading-[1.05]">
          <span className="lg:hidden">
            {mobileHeadingParts ? (
              <>
                {mobileHeadingParts.start ? `${mobileHeadingParts.start} ` : null}
                <span className="text-rr-green">{mobileHeadingParts.accent}</span>
              </>
            ) : (
              <>
                UK Competitions &amp; <span className="text-rr-green">Prize Draws</span>
              </>
            )}
          </span>
          <span className="hidden lg:inline">
            {desktopHeadingParts ? (
              <>
                {desktopHeadingParts.start ? `${desktopHeadingParts.start} ` : null}
                <span className="text-rr-green">{desktopHeadingParts.accent}</span>
              </>
            ) : (
              <>
                Find better draws. <span className="text-rr-green">Win smarter.</span>
              </>
            )}
          </span>
        </h1>

        <p className="hidden mt-3 mx-auto max-w-[650px] text-sm lg:text-base text-rr-muted lg:block">
          {subheading ?? "Track undersold competitions, spot real value and enter at the right time."}
        </p>

        <p className="lg:hidden mt-2 text-sm font-medium text-rr-green">
          {mobileEyebrow ?? "Compare trusted UK competitions"}
        </p>
        <p className="lg:hidden mt-1 text-[13px] leading-5 text-rr-muted">
          {mobileSubheading ?? "Compare odds, ticket pools, sold % and what your budget buys."}
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2 text-center lg:hidden">
          <div className="rounded-xl border border-rr-border bg-rr-surface px-2 py-2">
            <p className="text-sm font-semibold leading-none text-rr-green">
              {liveDraws.toLocaleString("en-GB")}
            </p>
            <p className="mt-1 text-[11px] text-rr-muted">Live draws</p>
          </div>

          <div className="rounded-xl border border-rr-border bg-rr-surface px-2 py-2">
            <p className="text-sm font-semibold leading-none text-rr-green">
              {updated}
            </p>
            <p className="mt-1 text-[11px] text-rr-muted">Last updated</p>
          </div>
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
