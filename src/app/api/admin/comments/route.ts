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

  const searchParams = request.nextUrl.searchParams;
  const competitionId = searchParams.get("competitionId");
  const query = new URLSearchParams();

  if (competitionId !== null) {
    query.set("competitionId", competitionId);
  }

  const queryString = query.toString();
  const path = queryString ? `/admin/comments?${queryString}` : "/admin/comments";
  const response = await backendAuthFetch(path, {
    method: "GET",
    requestHeaders: request.headers,
    attachAccessToken: true,
    accessToken,
  });

  return createProxyResponse(response);
}
