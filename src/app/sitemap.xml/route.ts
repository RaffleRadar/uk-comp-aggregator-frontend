import { CANONICAL_ORIGIN } from "@/lib/site";
import {
  getFinishedCompetitionChunkCount,
  renderSitemapIndex,
  xmlResponse,
} from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
  const now = new Date();
  const chunkCount = await getFinishedCompetitionChunkCount();

  const sitemaps = [
    { loc: `${CANONICAL_ORIGIN}/sitemap-pages.xml`, lastModified: now },
    { loc: `${CANONICAL_ORIGIN}/sitemap-live-competitions.xml`, lastModified: now },
    ...Array.from({ length: chunkCount }, (_, index) => ({
      loc: `${CANONICAL_ORIGIN}/sitemap-finished-competitions/${index + 1}.xml`,
      lastModified: now,
    })),
    { loc: `${CANONICAL_ORIGIN}/sitemap-reviews.xml`, lastModified: now },
    { loc: `${CANONICAL_ORIGIN}/sitemap-blog.xml`, lastModified: now },
  ];

  return xmlResponse(renderSitemapIndex(sitemaps));
}
