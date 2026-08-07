import { PortableText } from "@portabletext/react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { urlFor } from "@/sanity/client";
import { SanityImage } from "@/components/ui/SanityImage";
import { titleColorVar } from "@/lib/titleColor";
import { RelatedReviews } from "./RelatedReviews";
import { portableTextComponents } from "./portableTextComponents";
import { ShareBar } from "@/components/ui/ShareBar";
import { RichTitle } from "./RichTitle";

type ReviewSlug = {
  current: string;
};

type SeoMeta = {
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: unknown;
};

type ReviewData = {
  title: string;
  richTitle?: unknown[] | null;
  titleColor?: string | null;
  slug: ReviewSlug;
  operatorName?: string | null;
  operatorId?: string | null;
  heroImage?: unknown;
  excerpt?: string | null;
  rating?: number | null;
  publishedAt?: string | null;
  body?: unknown[];
  seo?: SeoMeta;
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

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Stars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  const filled = Math.round(clamped);
  const stars = Array.from({ length: 5 }, (_, idx) => idx < filled);

  return (
    <div className="flex items-center gap-0.5 text-rr-green">
      {stars.map((isFilled, idx) =>
        isFilled ? (
          <IconStarFilled key={idx} size={16} />
        ) : (
          <IconStar key={idx} size={16} />
        ),
      )}
    </div>
  );
}

export function ReviewArticle({
  review,
  relatedReviews,
  shareUrl,
}: {
  review: ReviewData;
  relatedReviews?: ReviewListItem[];
  shareUrl: string;
}) {
  const headingColor = titleColorVar(review.titleColor);
  const hasRichTitle = Array.isArray(review.richTitle) && review.richTitle.length > 0;
  const imgSrc = review.heroImage
    ? urlFor(review.heroImage)
        .width(1400)
        .height(788)
        .fit("crop")
        .crop("focalpoint")
        .auto("format")
        .url()
    : null;

  return (
    <main className="bg-rr-bg">
      <section className="pt-10">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            {imgSrc ? (
              <div
                className="relative overflow-hidden rounded-xl border border-rr-border bg-rr-surface"
                style={{ aspectRatio: "16 / 9" }}
              >
                <SanityImage
                  src={imgSrc}
                  alt={review.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1100px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <div className="mx-auto max-w-[780px] lg:max-w-[860px]">
            <ShareBar url={shareUrl} title={review.title} />
            <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                {review.operatorName ? (
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-rr-green">
                    {review.operatorName}
                  </p>
                ) : null}
                {review.publishedAt ? (
                  <p className="text-sm text-rr-muted">
                    {formatPublishedDate(review.publishedAt)}
                  </p>
                ) : null}
              </div>
              {typeof review.rating === "number" ? (
                <Stars rating={review.rating} />
              ) : null}
            </div>

            {hasRichTitle ? (
              <RichTitle
                value={review.richTitle}
                as="h1"
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
              />
            ) : (
              <h1
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {review.title}
              </h1>
            )}

            {review.excerpt ? (
              <p className="mt-5 text-[17px] italic leading-7 text-rr-secondary whitespace-pre-line">
                {review.excerpt}
              </p>
            ) : null}

            <div className="mt-10">
              <PortableText value={review.body ?? []} components={portableTextComponents} />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-[780px] lg:max-w-[860px]">
            <RelatedReviews reviews={relatedReviews ?? []} />
          </div>
        </div>
      </section>
    </main>
  );
}
