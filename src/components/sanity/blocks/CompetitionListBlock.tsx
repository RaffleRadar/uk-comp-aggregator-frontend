import { CompetitionGridClient } from "@/components/competitions/competition-grid-client";
import { getFeaturedIds } from "@/components/competitions/competition-grid";
import { getCompetitions } from "@/lib/api";
import { applyFigures, buildLandingFigures } from "@/lib/landing-figures";
import type { Competition } from "@/types/competition";

type Faq = {
  _key?: string;
  question?: string;
  answer?: string;
};

type CompetitionListBlockData = {
  _key?: string;
  _type?: string;
  eyebrow?: string;
  heading?: string;
  category?: string;
  closing?: string;
  sortBy?: string;
  sortOrder?: string;
  excludeGames?: boolean;
  emptyMessage?: string;
  showFallbackWhenEmpty?: boolean;
  faqs?: Faq[];
  limit?: number;
};

const DEFAULT_LIMIT = 12;

async function fetchCompetitions(
  params: Parameters<typeof getCompetitions>[0],
): Promise<Competition[]> {
  try {
    const response = await getCompetitions(params);
    return Array.isArray(response) ? response : [];
  } catch {
    return [];
  }
}

export async function CompetitionListBlock({
  block,
}: {
  block: CompetitionListBlockData;
}) {
  const category = block.category?.trim() || undefined;
  const closing = block.closing?.trim() || undefined;
  const sortOrder = block.sortOrder === "asc" ? "asc" : "desc";
  const excludeGames = block.excludeGames ?? false;
  const limit =
    typeof block.limit === "number" && block.limit > 0
      ? Math.min(Math.trunc(block.limit), 100)
      : DEFAULT_LIMIT;

  let competitions = await fetchCompetitions({
    limit,
    category,
    closing,
    sortBy: block.sortBy || "valueRatio",
    sortOrder,
    excludeGames,
  });

  const usedFallback =
    competitions.length === 0 &&
    Boolean(closing) &&
    (block.showFallbackWhenEmpty ?? true);

  if (usedFallback) {
    competitions = await fetchCompetitions({
      limit,
      category,
      sortBy: "endsAt",
      sortOrder: "asc",
      excludeGames,
    });
  }

  const figures = buildLandingFigures(competitions);
  const featuredIds = getFeaturedIds(competitions);

  const faqs = (block.faqs ?? [])
    .filter((faq) => faq.question && faq.answer)
    .map((faq) => ({
      key: faq._key ?? faq.question ?? "",
      question: faq.question as string,
      answer: applyFigures(faq.answer as string, figures),
    }));

  const itemListJsonLd =
    competitions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: competitions.length,
          itemListElement: competitions.slice(0, 50).map((competition, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: competition.prize,
            url: `https://raffleradar.co.uk/competitions/${competition.id}`,
          })),
        }
      : null;

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <section className="py-10 md:py-12">
      <div className="container">
        {block.eyebrow ? (
          <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-rr-green">
            <span className="h-px w-6 bg-rr-green" />
            {block.eyebrow}
          </p>
        ) : null}

        {block.heading ? (
          <h2 className="mb-6 max-w-[680px] text-3xl font-medium leading-tight tracking-[-0.03em] text-rr-primary">
            {block.heading}
          </h2>
        ) : null}

        {usedFallback ? (
          <p className="mb-4 rounded-xl border border-rr-border bg-rr-surface px-4 py-3 text-sm text-rr-secondary">
            {block.emptyMessage?.trim() ||
              "Nothing closes in this window right now. These are the next competitions to close."}
          </p>
        ) : null}

        <CompetitionGridClient
          competitions={competitions}
          featuredIds={featuredIds}
          pageSize={limit}
        />

        {faqs.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-5 text-2xl font-medium tracking-[-0.02em] text-rr-primary">
              Frequently asked questions
            </h2>

            <dl className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.key}>
                  <dt className="text-base font-medium text-rr-primary">
                    {faq.question}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-rr-secondary">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {itemListJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(itemListJsonLd),
            }}
          />
        ) : null}

        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
      </div>
    </section>
  );
}
