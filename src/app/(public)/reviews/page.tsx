import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
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
      sanityClient.fetch<ReviewListItem[] | null>(ALL_REVIEWS, {}, { next: { revalidate: 60 } }),
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
      <PageHero
        eyebrow="Operator Reviews"
        title={
          <>
            We find the <span className="text-rr-green">facts</span>{" "}
            so you can enter smarter.
          </>
        }
        lead={reviewsIntro}
      />

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
