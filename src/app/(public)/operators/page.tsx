import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { GetListedBanner } from "@/components/operators/get-listed-banner";
import { VrScale } from "@/components/operators/VrScale";
import { Badge } from "@/components/ui/badge";
import { getOperators } from "@/lib/api";
import type { OperatorSummary } from "@/lib/api";
import { getOperatorFairness } from "@/lib/operator-display";
import { getSiteContent } from "@/sanity/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Compare UK Competition Websites | RaffleRadar",
    description:
      "Compare UK competition websites by live draws, prize value and Value Ratio. See which operators offer better value before deciding where to enter.",
    alternates: { canonical: "/operators" },
  };
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
        width={64}
        height={64}
        unoptimized
        className="h-12 w-12 shrink-0 rounded-lg object-contain"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rr-elevated text-sm font-semibold text-rr-primary">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default async function OperatorsPage() {
  let operators: OperatorSummary[] = [];
  let operatorsIntro = "";

  try {
    const [operatorsResult, siteContent] = await Promise.all([
      getOperators(),
      getSiteContent(),
    ]);
    operators = operatorsResult;
    operatorsIntro =
      siteContent?.operatorsIntro?.trim() ||
      "See who is offering better value, how many live competitions they have, and where each operator sits on fairness.";
  } catch {
    operators = [];
    operatorsIntro =
      "See who is offering better value, how many live competitions they have, and where each operator sits on fairness.";
  }

  const sortedOperators = [...operators]
    .map((operator) => ({
      operator,
      fairness: getOperatorFairness(operator.avgVr, operator.vrSampleSize),
    }))
    .sort((a, b) => {
      if (a.fairness.value === null && b.fairness.value === null) {
        return a.operator.name.localeCompare(b.operator.name, "en-GB");
      }

      if (a.fairness.value === null) {
        return 1;
      }

      if (b.fairness.value === null) {
        return -1;
      }

      return (
        Number(a.fairness.value) - Number(b.fairness.value) ||
        a.operator.name.localeCompare(b.operator.name, "en-GB")
      );
    });

  const rankedOperators = [...sortedOperators]
    .filter(({ fairness }) => fairness.value !== null)
    .sort(
      (a, b) =>
        Number(a.fairness.value) - Number(b.fairness.value) ||
        a.operator.name.localeCompare(b.operator.name, "en-GB"),
    );

  const operatorRankMap = new Map(
    rankedOperators.map(({ operator }, index) => [operator.id, index + 1]),
  );

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-8 md:py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="max-w-[760px]">
              <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green md:mb-4">
                <span className="h-px w-8 bg-rr-green" />
                Competition Operators
              </p>
              <h1 className="text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-6xl md:leading-[1.05]">
                Compare the <span className="text-rr-green">operators</span>{" "}
                behind the draws.
              </h1>
              <p className="mt-3 hidden max-w-[600px] text-base leading-7 text-rr-secondary md:mt-6 md:block md:text-lg">
                {operatorsIntro}
              </p>
            </div>
            <div className="mt-4 w-full rounded-xl border border-rr-border bg-rr-elevated p-4">
              <p className="text-sm font-medium text-rr-primary">How Value Ratio works</p>
              <p className="mt-2 text-sm leading-6 text-rr-muted md:hidden">
                VR compares full-sellout ticket revenue against prize value. VR 1 is break-even, and lower is better for players.
              </p>
              <div className="mt-2 hidden gap-6 md:grid md:grid-cols-2">
                <p className="text-sm leading-6 text-rr-muted">
                  Value Ratio (VR) compares the total ticket revenue an operator would collect at full sellout against the value of the prize. VR 1 means ticket sales match the prize value exactly — the lower the VR, the better the deal for players.
                </p>
                <p className="text-sm leading-6 text-rr-muted">
                  An operator&apos;s score is the median VR across competitions with a verifiable prize value, recalculated as competitions open and close, so rankings can shift over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            {sortedOperators.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedOperators.map(({ operator, fairness }) => {
                  const valueRank = operatorRankMap.get(operator.id);
                  const isBestValue = valueRank === 1;

                  return (
                    <Link
                      key={operator.id}
                      href={`/operators/${operator.slug}`}
                      className={`group flex flex-col overflow-hidden rounded-xl border bg-rr-surface no-underline transition-colors hover:bg-rr-elevated ${
                        isBestValue
                          ? "border-rr-green-border"
                          : "border-rr-border hover:border-rr-green-border"
                      }`}
                    >
                      {isBestValue ? (
                        <div className="flex items-center gap-2 bg-rr-green px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-rr-on-accent">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.7L12 17.3 5.9 20.6l1.5-6.7L2.2 9l6.9-.7L12 2z"
                              fill="currentColor"
                            />
                          </svg>
                          #1 for value
                        </div>
                      ) : null}

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-center gap-3">
                          <OperatorLogo
                            name={operator.name}
                            logoUrl={operator.logoUrl}
                          />
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-medium text-rr-primary">
                              {operator.name}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant={fairness.badgeVariant}>
                                {fairness.label}
                              </Badge>
                              {valueRank && !isBestValue ? (
                                <span className="text-xs text-rr-muted">
                                  #{valueRank} of {rankedOperators.length} for value
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-rr-border bg-rr-elevated p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                                Value ratio
                              </p>
                              <span className="text-[10px] text-rr-muted">
                                lower is better
                              </span>
                            </div>
                            <p className="text-sm font-medium text-rr-primary">
                              {fairness.vrLabel}
                            </p>
                          </div>
                          <div className="mt-3">
                            <VrScale value={fairness.value} />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-rr-border bg-rr-elevated p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                              Rated on
                            </p>
                            <p className="mt-1 text-base font-medium text-rr-primary">
                              {operator.vrSampleSize
                                ? `${operator.vrSampleSize} competitions`
                                : "—"}
                            </p>
                          </div>

                          <div className="rounded-lg border border-rr-border bg-rr-elevated p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
                              Live competitions
                            </p>
                            <p className="mt-1 text-base font-medium text-rr-primary">
                              {operator.activeCompetitionsCount ?? 0} active
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-rr-secondary">
                          {fairness.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-rr-muted">
                No operators available right now.
              </div>
            )}

            <GetListedBanner />
          </div>
        </div>
      </section>
    </main>
  );
}
