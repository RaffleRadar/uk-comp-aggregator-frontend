import { NextRequest } from "next/server";
import { readAccessToken } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  createUnauthorizedResponse,
} from "@/lib/backend-auth";

export async function POST(request: NextRequest) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  const body = await request.json();
  const response = await backendAuthFetch("/comments", {
    method: "POST",
    body,
    requestHeaders: request.headers,
    attachAccessToken: true,
    accessToken,
  });

  return createProxyResponse(response);
}
