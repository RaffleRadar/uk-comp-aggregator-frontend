import {
  getOperators,
  getCompetitionSitemapEntries,
  type CompetitionSitemapEntry,
} from "@/lib/api";
import { sanityClient } from "@/sanity/client";
import { CANONICAL_ORIGIN } from "@/lib/site";

export const SITEMAP_REVALIDATE_SECONDS = 3600;
export const FINISHED_CHUNK_SIZE = 40000;

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapUrl = {
  loc: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
};

type SlugRow = {
  slug: string;
  updatedAt: string | null;
};

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: ChangeFrequency;
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

async function fetchCompetitionRows(): Promise<CompetitionSitemapEntry[]> {
  try {
    return await getCompetitionSitemapEntries();
  } catch {
    return [];
  }
}

function dedupe(entries: SitemapUrl[]): SitemapUrl[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

function splitCompetitions(rows: CompetitionSitemapEntry[]) {
  const now = new Date();
  const live: CompetitionSitemapEntry[] = [];
  const finished: CompetitionSitemapEntry[] = [];

  for (const row of rows) {
    const hasEnded = row.endsAt ? new Date(row.endsAt) < now : false;
    (hasEnded ? finished : live).push(row);
  }

  return { live, finished };
}

export async function getPagesSitemap(): Promise<SitemapUrl[]> {
  const [pages, operatorSlugs] = await Promise.all([
    fetchSlugs(SANITY_PAGE_SLUGS),
    fetchOperatorSlugs(),
  ]);
  const now = new Date();

  const entries: SitemapUrl[] = STATIC_ROUTES.map((route) => ({
    loc: `${CANONICAL_ORIGIN}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const page of pages) {
    entries.push({
      loc: `${CANONICAL_ORIGIN}/${page.slug}`,
      lastModified: toDate(page.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const slug of operatorSlugs) {
    entries.push({
      loc: `${CANONICAL_ORIGIN}/operators/${slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return dedupe(entries);
}

export async function getBlogSitemap(): Promise<SitemapUrl[]> {
  const posts = await fetchSlugs(SANITY_POST_SLUGS);
  return dedupe(
    posts.map((post) => ({
      loc: `${CANONICAL_ORIGIN}/blog/${post.slug}`,
      lastModified: toDate(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  );
}

export async function getReviewsSitemap(): Promise<SitemapUrl[]> {
  const reviews = await fetchSlugs(SANITY_REVIEW_SLUGS);
  return dedupe(
    reviews.map((review) => ({
      loc: `${CANONICAL_ORIGIN}/reviews/${review.slug}`,
      lastModified: toDate(review.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  );
}

export async function getLiveCompetitionsSitemap(): Promise<SitemapUrl[]> {
  const { live } = splitCompetitions(await fetchCompetitionRows());
  return dedupe(
    live.map((competition) => ({
      loc: `${CANONICAL_ORIGIN}/competitions/${competition.slug}`,
      lastModified: toDate(competition.updatedAt),
      changeFrequency: "daily",
      priority: 0.6,
    })),
  );
}

export async function getFinishedCompetitionChunkCount(): Promise<number> {
  const { finished } = splitCompetitions(await fetchCompetitionRows());
  return Math.max(1, Math.ceil(finished.length / FINISHED_CHUNK_SIZE));
}

export async function getFinishedCompetitionsSitemap(
  chunk: number,
): Promise<SitemapUrl[] | null> {
  const { finished } = splitCompetitions(await fetchCompetitionRows());
  const chunkCount = Math.max(1, Math.ceil(finished.length / FINISHED_CHUNK_SIZE));

  if (!Number.isInteger(chunk) || chunk < 1 || chunk > chunkCount) {
    return null;
  }

  const start = (chunk - 1) * FINISHED_CHUNK_SIZE;
  const slice = finished
    .slice()
    .sort((a, b) => (a.endsAt ?? "").localeCompare(b.endsAt ?? ""))
    .slice(start, start + FINISHED_CHUNK_SIZE);

  // Finished draws do not change: lastModified is pinned to the draw date so
  // crawlers have no reason to refetch them.
  return dedupe(
    slice.map((competition) => ({
      loc: `${CANONICAL_ORIGIN}/competitions/${competition.slug}`,
      lastModified: toDate(competition.endsAt ?? competition.updatedAt),
      changeFrequency: "yearly",
      priority: 0.2,
    })),
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderUrlSet(entries: SitemapUrl[]): string {
  const body = entries
    .map(
      (entry) =>
        `<url><loc>${escapeXml(entry.loc)}</loc><lastmod>${entry.lastModified.toISOString()}</lastmod><changefreq>${entry.changeFrequency}</changefreq><priority>${entry.priority.toFixed(1)}</priority></url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function renderSitemapIndex(
  sitemaps: Array<{ loc: string; lastModified: Date }>,
): string {
  const body = sitemaps
    .map(
      (item) =>
        `<sitemap><loc>${escapeXml(item.loc)}</loc><lastmod>${item.lastModified.toISOString()}</lastmod></sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function xmlResponse(xml: string, status = 200): Response {
  return new Response(xml, {
    status,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${SITEMAP_REVALIDATE_SECONDS}`,
    },
  });
}
