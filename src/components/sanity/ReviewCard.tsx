"use client";

import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { IconStarFilled, IconStar } from "@tabler/icons-react";
import { SanityImage } from "@/components/ui/SanityImage";
import { urlFor } from "@/sanity/client";

type ReviewSlug = {
  current: string;
};

type ReviewCardProps = {
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
        isFilled ? <IconStarFilled key={idx} size={14} /> : <IconStar key={idx} size={14} />,
      )}
    </div>
  );
}

export function ReviewCard({
  title,
  slug,
  operatorName,
  heroImage,
  excerpt,
  rating,
  publishedAt,
}: ReviewCardProps) {
  const href = `/reviews/${slug.current}`;
  const imgSrc = heroImage
    ? urlFor(heroImage)
        .width(600)
        .height(338)
        .fit("crop")
        .crop("focalpoint")
        .auto("format")
        .quality(75)
        .url()
    : null;

  return (
    <ScrollTopLink
      href={href}
      className="group block h-full cursor-pointer no-underline"
      aria-label={title}
    >
      <article className="h-full overflow-hidden rounded-[10px] border border-rr-border bg-rr-elevated transition group-hover:-translate-y-0.5 group-hover:border-rr-green/40">
        <div
          className="relative w-full overflow-hidden bg-rr-surface"
          style={{ aspectRatio: "16 / 9" }}
        >
          {imgSrc ? (
            <SanityImage
              src={imgSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition group-hover:scale-[1.015]"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-rr-surface" />
          )}
        </div>

        <div className="px-5 py-5">
          {operatorName ? (
            <p className="mb-2 text-xs font-medium text-rr-muted">{operatorName}</p>
          ) : null}

          <h3 className="text-base font-medium tracking-[-0.02em] text-rr-primary">{title}</h3>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-rr-secondary">{excerpt}</p>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-rr-muted">
            <span>{formatPublishedDate(publishedAt)}</span>
            {typeof rating === "number" ? <Stars rating={rating} /> : <span />}
          </div>
        </div>
      </article>
    </ScrollTopLink>
  );
}
