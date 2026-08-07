"use client";

import Link from "next/link";
import { RichTitle } from "@/components/sanity/RichTitle";
import { SanityImage } from "@/components/ui/SanityImage";
import { titleColorVar } from "@/lib/titleColor";
import { formatCategory } from "@/lib/blog-category";
import { urlFor } from "@/sanity/client";

type PostSlug = {
  current: string;
};

type PostCardProps = {
  title: string;
  richTitle?: unknown[] | null;
  titleColor?: string | null;
  slug: PostSlug;
  heroImage?: unknown;
  excerpt: string;
  category?: string | null;
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

export function PostCard({
  title,
  richTitle,
  titleColor,
  slug,
  heroImage,
  excerpt,
  category,
  publishedAt,
}: PostCardProps) {
  const href = `/blog/${slug.current}`;
  const hasRichTitle = Array.isArray(richTitle) && richTitle.length > 0;
  const headingColor = titleColorVar(titleColor);
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
    <Link href={href} className="group block h-full cursor-pointer no-underline" aria-label={title}>
      <article className="h-full overflow-hidden rounded-[10px] border border-rr-border bg-rr-elevated transition group-hover:-translate-y-0.5 group-hover:border-rr-green/40">
        <div className="relative w-full overflow-hidden bg-rr-surface" style={{ aspectRatio: "16 / 9" }}>
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
          {category ? (
            <div className="mb-3">
              <span className="inline-flex rounded-full border border-rr-green-border bg-rr-green-bg px-2.5 py-1 text-[11px] font-medium text-rr-green">
                {formatCategory(category)}
              </span>
            </div>
          ) : null}

          {hasRichTitle ? (
            <RichTitle
              value={richTitle}
              as="h3"
              className="text-base font-medium tracking-[-0.02em] text-rr-primary"
            />
          ) : (
            <h3
              className="text-base font-medium tracking-[-0.02em] text-rr-primary"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h3>
          )}

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-rr-secondary">{excerpt}</p>

          <div className="mt-4 text-xs text-rr-muted">
            <span>{formatPublishedDate(publishedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
