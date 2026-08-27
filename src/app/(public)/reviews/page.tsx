import type { Metadata } from "next";
import { ReviewCard } from "@/components/sanity/ReviewCard";
import { ClassicPagination } from "@/components/ui/ClassicPagination";
import { paginate } from "@/lib/classic-pagination";
import { sanityClient } from "@/sanity/client";
import { ALL_REVIEWS } from "@/sanity/queries";
import { getSiteContent } from "@/sanity/queries";

export const revalidate = 60;

type ReviewSlug = {
  current: string;
};

type ReviewListItem = {
  _id: string;
  title: string;
  slug: ReviewSlug;
  operatorName?: string | null;
  heroImage?: unknown;
  excerpt: string;
  rating?: number | null;
  publishedAt: string;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UK Competition Site Reviews | RaffleRadar",
    description:
      "Independent reviews of UK competition websites. Compare ticket prices, prize ranges, transparency and value before deciding which sites are right for you.",
    alternates: { canonical: "/reviews" },
  };
}

const PAGE_SIZE = 9;

type ReviewsPageSearchParams = {
  page?: string;
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<ReviewsPageSearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  let reviewsIntro =
    "Independent reviews of every major UK competition operator — what they run, how they price their tickets, the odds behind the headline, and whether they're actually worth your money.";
  let reviewsResponse: ReviewListItem[] | null = null;

  try {
    const [reviewsResult, siteContent] = await Promise.all([
      sanityClient.fetch<ReviewListItem[] | null>(ALL_REVIEWS, {}, { next: { revalidate: 3600 } }),
      getSiteContent(),
    ]);
    reviewsResponse = reviewsResult;
    reviewsIntro =
      siteContent?.reviewsIntro?.trim() ||
      "Independent reviews of every major UK competition operator — what they run, how they price their tickets, the odds behind the headline, and whether they're actually worth your money.";
  } catch {
    reviewsResponse = null;
  }

  const reviews = Array.isArray(reviewsResponse) ? reviewsResponse : [];
  const pagination = paginate(reviews, page, PAGE_SIZE);

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-8 md:py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="max-w-[760px]">
            <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green md:mb-4">
              <span className="h-px w-8 bg-rr-green" />
              Operator Reviews
            </p>
            <h1 className="text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-6xl md:leading-[1.05]">
              We find the <span className="text-rr-green">facts</span>{" "}
              so you can enter smarter.
            </h1>
            <p className="mt-3 hidden max-w-[600px] text-base leading-7 text-rr-secondary md:mt-6 md:block md:text-lg">
              {reviewsIntro}
            </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
          {reviews.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pagination.items.map((review) => (
                  <ReviewCard
                    key={review._id}
                    title={review.title}
                    slug={review.slug}
                    operatorName={review.operatorName}
                    heroImage={review.heroImage}
                    excerpt={review.excerpt}
                    rating={review.rating}
                    publishedAt={review.publishedAt}
                  />
                ))}
              </div>
              <ClassicPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                basePath="/reviews"
              />
            </>
          ) : (
            <div className="py-20 text-center text-rr-muted">No reviews yet. Check back soon.</div>
          )}
          </div>
        </div>
      </section>
    </main>
  );
}
