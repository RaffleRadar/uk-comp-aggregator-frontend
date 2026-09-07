import { PortableText } from "@portabletext/react";
import { SanityImage } from "@/components/ui/SanityImage";
import { urlFor } from "@/sanity/client";
import { titleColorVar } from "@/lib/titleColor";
import { formatCategory } from "@/lib/blog-category";
import { RelatedPosts } from "./RelatedPosts";
import { portableTextComponents } from "./portableTextComponents";
import { ShareBar } from "@/components/ui/ShareBar";
import { RichTitle } from "./RichTitle";

type PostSlug = {
  current: string;
};

type SeoMeta = {
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: unknown;
};

type PostData = {
  title: string;
  richTitle?: unknown[] | null;
  titleColor?: string | null;
  slug: PostSlug;
  heroImage?: unknown;
  excerpt?: string | null;
  category?: string | null;
  body?: unknown[];
  publishedAt?: string | null;
  seo?: SeoMeta;
};

type PostListItem = {
  _id: string;
  title: string;
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

export function PostArticle({
  post,
  relatedPosts,
  shareUrl,
}: {
  post: PostData;
  relatedPosts?: PostListItem[];
  shareUrl: string;
}) {
  const headingColor = titleColorVar(post.titleColor);
  const hasRichTitle = Array.isArray(post.richTitle) && post.richTitle.length > 0;
  const imgSrc = post.heroImage
    ? urlFor(post.heroImage)
        .width(1400)
        .height(788)
        .fit("crop")
        .crop("focalpoint")
        .auto("format")
        .quality(75)
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
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1100px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            <ShareBar url={shareUrl} title={post.title} />
            <div className="mb-4 mt-8 flex flex-wrap items-center gap-3">
              {post.category ? (
                <span className="inline-flex rounded-full border border-rr-green-border bg-rr-green-bg px-2.5 py-1 text-[11px] font-medium text-rr-green">
                  {formatCategory(post.category)}
                </span>
              ) : null}
              {post.publishedAt ? (
                <p className="text-sm text-rr-muted">{formatPublishedDate(post.publishedAt)}</p>
              ) : null}
            </div>

            {hasRichTitle ? (
              <RichTitle
                value={post.richTitle}
                as="h1"
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
              />
            ) : (
              <h1
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {post.title}
              </h1>
            )}

            {post.excerpt ? (
              <p className="mt-5 text-[17px] italic leading-7 text-rr-secondary whitespace-pre-line">{post.excerpt}</p>
            ) : null}

            <div className="mt-10">
              <PortableText value={post.body ?? []} components={portableTextComponents} />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-[1100px]">
            <RelatedPosts posts={relatedPosts ?? []} />
          </div>
        </div>
      </section>
    </main>
  );
}
