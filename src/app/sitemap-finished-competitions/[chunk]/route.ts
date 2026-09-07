import {
  getFinishedCompetitionsSitemap,
  renderUrlSet,
  xmlResponse,
} from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  context: { params: Promise<{ chunk: string }> },
) {
  const { chunk } = await context.params;
  const match = chunk.match(/^(\d+)\.xml$/);

  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await getFinishedCompetitionsSitemap(Number(match[1]));

  if (!entries) {
    return new Response("Not found", { status: 404 });
  }

  return xmlResponse(renderUrlSet(entries));
}
