import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/sanity/PostArticle";
import { buildOpenGraph, buildTwitter } from "@/lib/og";
import { CANONICAL_ORIGIN as SITE_URL } from "@/lib/site";
import { sanityClient, urlFor } from "@/sanity/client";
import { ALL_POST_SLUGS, POST_BY_SLUG, RELATED_POSTS } from "@/sanity/queries";

export const revalidate = 60;

type PageParams = {
  slug: string;
};

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
  richTitle?: unknown[] | null;
  titleColor?: string | null;
  slug: PostSlug;
  heroImage?: unknown;
  excerpt: string;
  category?: string | null;
  publishedAt: string;
};

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<string[]>(ALL_POST_SLUGS);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityClient.fetch<PostData | null>(POST_BY_SLUG, { slug });

  if (!post) {
    return {};
  }

  const title = post.seo?.seoTitle ?? `${post.title} — RaffleRadar`;
  const description = post.seo?.seoDescription ?? post.excerpt ?? undefined;
  const pageUrl = `${SITE_URL}/blog/${slug}`;
  const imageSource = post.seo?.seoImage ?? post.heroImage;
  const imageUrl = imageSource
    ? urlFor(imageSource)
        .width(1200)
        .height(630)
        .fit("crop")
        .crop("focalpoint")
        .auto("format")
        .quality(75)
        .url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: buildOpenGraph({
      title,
      description: description ?? "",
      path: `/blog/${slug}`,
      image: imageUrl,
    }),
    twitter: buildTwitter({
      title,
      description: description ?? "",
      image: imageUrl,
    }),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = await sanityClient.fetch<PostData | null>(POST_BY_SLUG, { slug });

  if (!post) {
    notFound();
  }

  const relatedPosts = await sanityClient.fetch<PostListItem[]>(RELATED_POSTS, { slug });
  const shareUrl = `${SITE_URL}/blog/${slug}`;

  return <PostArticle post={post} relatedPosts={relatedPosts} shareUrl={shareUrl} />;
}
