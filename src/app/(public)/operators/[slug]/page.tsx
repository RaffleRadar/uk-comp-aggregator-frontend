import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OperatorCompetitions } from "@/components/operators/operator-competitions";
import { TrackedOperatorLink } from "@/components/operators/tracked-operator-link";
import { Badge } from "@/components/ui/badge";
import {
  getCompetitions,
  getOperator,
  getOperators,
} from "@/lib/api";
import { getOperatorFairness } from "@/lib/operator-display";
import { sanityClient } from "@/sanity/client";
import { OPERATOR_REVIEW_BY_ID, OPERATOR_REVIEW_BY_NAME } from "@/sanity/queries";
import type { Competition } from "@/types/competition";

export const revalidate = 60;

type PageParams = {
  slug: string;
};

type ReviewSlug = {
  current: string;
};

type OperatorReviewCard = {
  title: string;
  slug: ReviewSlug;
  operatorName?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
};

function formatPublishedDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeOperatorName(value: string, spacedDigits = false) {
  const normalized = value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(spacedDigits ? /([0-9])([a-z])/g : /$^/, "$1 $2")
    .replace(spacedDigits ? /([a-z])([0-9])/g : /$^/, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

function getOperatorNameVariants(name: string, slug: string) {
  const variants = new Set<string>();

  for (const value of [name, slug]) {
    const basic = normalizeOperatorName(value, false);
    const spaced = normalizeOperatorName(value, true);

    if (basic) variants.add(basic);
    if (spaced) variants.add(spaced);
  }

  return Array.from(variants);
}

function OperatorLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={96}
        height={96}
        unoptimized
        className="h-20 w-20 shrink-0 rounded-lg object-contain md:h-24 md:w-24"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-rr-elevated text-lg font-semibold text-rr-primary md:h-24 md:w-24">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const operators = await getOperators();
    return operators.map((operator) => ({ slug: operator.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const operator = await getOperator(slug);

  if (!operator) {
    return {};
  }

  return {
    title: `${operator.name} — Operators — RaffleRadar`,
    description: `Live competitions, fairness and value metrics for ${operator.name}.`,
  };
}

export default async function OperatorPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const operator = await getOperator(slug);

  if (!operator) {
    notFound();
  }

  let competitions = (operator.competitions ?? []) as Competition[];

  if (!competitions.length) {
    try {
      competitions = (await getCompetitions({
        operator: slug,
        limit: 500,
      })) as Competition[];
    } catch {
      competitions = [];
    }
  }

  const competitionsWithOperator = competitions.map((competition) => ({
    ...competition,
    operator: {
      ...(competition.operator ?? {}),
      name: competition.operator?.name ?? operator.name,
      baseUrl: competition.operator?.baseUrl ?? operator.baseUrl ?? "",
    },
  })) as Competition[];

  const fairness = getOperatorFairness(operator.avgVr, operator.vrSampleSize);
  const activeCompetitionsCount =
    operator.activeCompetitionsCount ?? competitionsWithOperator.length;
  const operatorNameVariants = getOperatorNameVariants(operator.name, slug);
  const reviewFromOperatorId = await sanityClient.fetch<OperatorReviewCard | null>(
    OPERATOR_REVIEW_BY_ID,
    { operatorId: operator.id },
  );
  const linkedReview = reviewFromOperatorId
    ? reviewFromOperatorId
    : await sanityClient.fetch<OperatorReviewCard | null>(
        OPERATOR_REVIEW_BY_NAME,
        { operatorNames: operatorNameVariants },
      );
  const reviewHref = linkedReview?.slug?.current
    ? `/reviews/${linkedReview.slug.current}`
    : null;
  const reviewDate = formatPublishedDate(linkedReview?.publishedAt);

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-8 md:py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <OperatorLogo
                    name={operator.name}
                    logoUrl={operator.logoUrl}
                  />

                  <div className="min-w-0">
                    <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green">
                      <span className="h-px w-8 bg-rr-green" />
                      Operator profile
                    </p>

                    <h1 className="text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-rr-primary md:text-6xl">
                      {operator.name}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={fairness.badgeVariant}>
                        {fairness.label}
                      </Badge>
                      <Badge variant="neutral">
                        {fairness.vrLabel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="mt-4 max-w-[760px] text-sm leading-6 text-rr-secondary md:text-base">
                  Fairness is based on the operator&apos;s average value ratio across
                  sampled competitions. Lower VR generally means more player-friendly
                  pricing.
                </p>
              </div>

              {operator.baseUrl ? (
                <TrackedOperatorLink
                  operatorId={operator.id}
                  operator={operator.slug}
                  href={operator.baseUrl}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-rr-border bg-rr-surface px-4 text-sm font-medium text-rr-secondary no-underline transition-colors hover:bg-rr-elevated hover:text-rr-primary"
                >
                  Visit operator site
                </TrackedOperatorLink>
              ) : null}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-rr-border bg-rr-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                  Avg VR
                </p>
                <p className="mt-2 text-xl font-medium text-rr-primary">
                  {fairness.value !== null ? fairness.value.toFixed(1) : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-rr-border bg-rr-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                  Fairness
                </p>
                <p className="mt-2 text-xl font-medium text-rr-primary">
                  {fairness.label}
                </p>
              </div>

              <div className="rounded-xl border border-rr-border bg-rr-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                  Live competitions
                </p>
                <p className="mt-2 text-xl font-medium text-rr-primary">
                  {activeCompetitionsCount}
                </p>
              </div>

              <div className="rounded-xl border border-rr-border bg-rr-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                  Sample size
                </p>
                <p className="mt-2 text-xl font-medium text-rr-primary">
                  {operator.vrSampleSize ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
              {linkedReview && reviewHref ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
                      Read our review
                    </p>
                    <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-rr-primary md:text-xl">
                      {linkedReview.title}
                    </p>
                    {reviewDate ? (
                      <p className="mt-1 text-xs text-rr-muted">{reviewDate}</p>
                    ) : null}
                    {linkedReview.excerpt ? (
                      <p className="mt-3 max-w-[760px] text-sm leading-6 text-rr-secondary line-clamp-3">
                        {linkedReview.excerpt}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={reviewHref}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-rr-green px-4 text-sm font-medium text-rr-on-accent no-underline transition-opacity hover:opacity-90"
                  >
                    Read the full review
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-rr-muted">
                      Read our review
                    </p>
                    <p className="mt-2 text-sm leading-6 text-rr-secondary">
                      A dedicated review page for this operator will be linked here in the next stage.
                    </p>
                  </div>

                  <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-rr-border bg-rr-elevated px-4 text-sm font-medium text-rr-muted">
                    Coming soon
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-6">
              <h2 className="text-2xl font-medium tracking-[-0.02em] text-rr-primary">
                Live competitions from <span className="text-rr-green">{operator.name}</span>
              </h2>
              <p className="mt-2 text-sm text-rr-secondary">
                Shareable filter-ready view of all active competitions from this operator.
              </p>
            </div>

            {competitionsWithOperator.length ? (
              <OperatorCompetitions competitions={competitionsWithOperator} />
            ) : (
              <div className="rounded-xl border border-rr-border bg-rr-surface px-4 py-8 text-center text-sm text-rr-muted">
                No live competitions available for this operator right now.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
