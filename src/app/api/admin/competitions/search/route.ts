import { NextRequest } from "next/server";
import { readAccessToken } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  createUnauthorizedResponse,
} from "@/lib/backend-auth";

export async function GET(request: NextRequest) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  const searchParams = new URLSearchParams();
  const q = request.nextUrl.searchParams.get("q");
  const limit = request.nextUrl.searchParams.get("limit");

  if (q !== null) {
    searchParams.set("q", q);
  }

  if (limit !== null) {
    searchParams.set("limit", limit);
  }

  const path =
    searchParams.size > 0
      ? `/admin/competitions/search?${searchParams.toString()}`
      : "/admin/competitions/search";

  const response = await backendAuthFetch(path, {
    method: "GET",
    requestHeaders: request.headers,
    attachAccessToken: true,
    accessToken,
  });

  return createProxyResponse(response);
}
