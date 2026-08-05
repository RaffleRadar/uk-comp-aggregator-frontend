import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CANONICAL_HOST } from "@/lib/site";

const PRODUCTION_ALIAS = "uk-comp-aggregator-frontend.vercel.app";
const SANITY_PROJECT_ID = "j33ifgtf";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "v2023-01-01";
const CACHE_TTL_MS = 30_000;

let cachedMaintenanceMode = false;
let cachedAt = 0;
let inflightRequest: Promise<boolean> | null = null;

function shouldBypass(pathname: string) {
  if (
    pathname === "/maintenance" ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return true;
  }

  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

async function fetchMaintenanceMode() {
  const now = Date.now();

  if (now - cachedAt < CACHE_TTL_MS) {
    return cachedMaintenanceMode;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    try {
      const query = encodeURIComponent(`*[_type == "siteSettings"][0]{ maintenanceMode }`);
      const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        cachedMaintenanceMode = false;
        cachedAt = now;
        return false;
      }

      const data = (await response.json()) as {
        result?: {
          maintenanceMode?: boolean;
        } | null;
      };

      cachedMaintenanceMode = Boolean(data.result?.maintenanceMode);
      cachedAt = now;

      return cachedMaintenanceMode;
    } catch {
      cachedMaintenanceMode = false;
      cachedAt = now;
      return false;
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

  if (host === PRODUCTION_ALIAS) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const isVercelPreviewHost = host.endsWith(".vercel.app");

  const withPreviewRobotsHeader = (response: NextResponse) => {
    if (isVercelPreviewHost) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return response;
  };

  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return withPreviewRobotsHeader(NextResponse.next());
  }

  const maintenanceMode = await fetchMaintenanceMode();

  if (!maintenanceMode) {
    return withPreviewRobotsHeader(NextResponse.next());
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  url.search = "";

  return withPreviewRobotsHeader(NextResponse.rewrite(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
