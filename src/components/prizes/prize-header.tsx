import { IconChevronRight, IconUsers } from "@tabler/icons-react";
import { CompetitionImage } from "@/components/ui/CompetitionImage";
import type { PrizePage } from "@/lib/prizes";
import { formatCount } from "@/lib/prizes";

type PrizeHeaderProps = {
  page: PrizePage;
  lead: string;
};

export function PrizeHeader({ page, lead }: PrizeHeaderProps) {
  const { label, imageUrl, operators } = page.prize;
  const operatorText =
    operators === 1
      ? "1 operator running this prize"
      : `${formatCount(operators)} operators running this prize`;

  return (
    <section
      aria-labelledby="prize-title"
      className="bg-gradient-to-b from-rr-surface to-rr-bg"
    >
      <div className="container pb-4 pt-5 md:pb-6 md:pt-8">
        <div className="mx-auto max-w-[1100px]">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs md:mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-rr-muted">
              <li className="text-rr-green">Prize Database</li>
              <li aria-hidden="true">
                <IconChevronRight size={12} />
              </li>
              <li aria-current="page" className="truncate text-rr-secondary">
                {label}
              </li>
            </ol>
          </nav>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_340px] md:items-center md:gap-8">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rr-green">
                Prize detail
              </p>
              <h1
                id="prize-title"
                className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-rr-primary md:text-5xl"
              >
                {label} Competitions
              </h1>
              <p className="mt-3 max-w-[640px] text-sm leading-6 text-rr-secondary md:text-base">
                {lead}
              </p>
              {operators > 0 ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-rr-green-border bg-rr-green-bg px-2.5 py-1 text-xs font-semibold text-rr-green">
                  <IconUsers size={14} aria-hidden="true" />
                  {operatorText}
                </p>
              ) : null}
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-rr-border bg-rr-elevated">
              <CompetitionImage
                src={imageUrl}
                alt={label}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
