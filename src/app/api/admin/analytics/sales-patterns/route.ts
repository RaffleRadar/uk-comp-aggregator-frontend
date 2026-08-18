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

  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams
    ? `/admin/analytics/sales-patterns?${searchParams}`
    : `/admin/analytics/sales-patterns`;

  const response = await backendAuthFetch(path, {
    method: "GET",
    requestHeaders: request.headers,
    attachAccessToken: true,
    accessToken,
  });

  return createProxyResponse(response);
}
