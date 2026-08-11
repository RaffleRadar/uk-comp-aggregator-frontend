import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTNAMES: readonly string[] = [
  "www.revcomps.com",
  "prismic.skywind360.com",
  "7days-production.s3.eu-west-2.amazonaws.com",
  "media.dreamcargiveaways.co.uk",
  "mckinneycompetitions.co.uk",
  "www.mckinneycompetitions.co.uk",
  "imagedelivery.net",
  "mckinneycompetitions.com",
  "www.mckinneycompetitions.com",
  "thegiveawayguys.co.uk",
  "www.thegiveawayguys.co.uk",
  "redline-competitions.com",
  "www.redline-competitions.com",
  "images.elitecompetitions.co.uk",
  "www.stormcompetitions.co.uk",
  "cdn.sanity.io",
  "firebasestorage.googleapis.com",
];

function fallbackRedirect() {
  return NextResponse.redirect(new URL("/og-default.png", process.env.CANONICAL_ORIGIN ?? "https://raffleradar.co.uk"), 302);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");

  if (!src) {
    return fallbackRedirect();
  }

  let parsed: URL;

  try {
    parsed = new URL(src);
  } catch {
    return fallbackRedirect();
  }

  if (parsed.protocol !== "https:" || !parsed.hostname) {
    return fallbackRedirect();
  }

  if (!ALLOWED_HOSTNAMES.includes(parsed.hostname)) {
    return fallbackRedirect();
  }

  try {
    const response = await fetch(src, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RaffleRadarBot/1.0)",
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackRedirect();
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return fallbackRedirect();
    }

    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "content-type": contentType,
        "cache-control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return fallbackRedirect();
  }
}
