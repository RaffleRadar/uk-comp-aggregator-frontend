import { getPrizesSitemap, renderUrlSet, xmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
  return xmlResponse(renderUrlSet(await getPrizesSitemap()));
}
