import type { MetadataRoute } from "next";
import { getOperators } from "@/lib/api";
import { sanityClient } from "@/sanity/client";
import { CANONICAL_ORIGIN } from "@/lib/site";

export const revalidate = 3600;

type SlugRow = {
  slug: string;
  updatedAt: string | null;
};

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/competitions", changeFrequency: "hourly", priority: 0.9 },
  { path: "/recent-draws", changeFrequency: "daily", priority: 0.6 },
  { path: "/operators", changeFrequency: "weekly", priority: 0.7 },
  { path: "/reviews", changeFrequency: "weekly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
];

const SANITY_PAGE_SLUGS = `*[_type == "page" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;

const SANITY_POST_SLUGS = `*[_type == "post" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": coalesce(_updatedAt, publishedAt)
}`;

const SANITY_REVIEW_SLUGS = `*[_type == "review" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": coalesce(_updatedAt, publishedAt)
}`;

function toDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function fetchSlugs(query: string): Promise<SlugRow[]> {
  try {
    const rows = await sanityClient.fetch<SlugRow[]>(query);
    return Array.isArray(rows) ? rows.filter((row) => Boolean(row?.slug)) : [];
  } catch {
    return [];
  }
}

async function fetchOperatorSlugs(): Promise<string[]> {
  try {
    const operators = await getOperators();
    return operators.map((operator) => operator.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, reviews, operatorSlugs] = await Promise.all([
    fetchSlugs(SANITY_PAGE_SLUGS),
    fetchSlugs(SANITY_POST_SLUGS),
    fetchSlugs(SANITY_REVIEW_SLUGS),
    fetchOperatorSlugs(),
  ]);

  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${CANONICAL_ORIGIN}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const page of pages) {
    entries.push({
      url: `${CANONICAL_ORIGIN}/${page.slug}`,
      lastModified: toDate(page.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const post of posts) {
    entries.push({
      url: `${CANONICAL_ORIGIN}/blog/${post.slug}`,
      lastModified: toDate(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const review of reviews) {
    entries.push({
      url: `${CANONICAL_ORIGIN}/reviews/${review.slug}`,
      lastModified: toDate(review.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const slug of operatorSlugs) {
    entries.push({
      url: `${CANONICAL_ORIGIN}/operators/${slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
