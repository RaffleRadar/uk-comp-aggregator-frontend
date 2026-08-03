import { NextRequest } from "next/server";
import { readAccessToken } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  createUnauthorizedResponse,
} from "@/lib/backend-auth";

export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  const { id } = await context.params;
  const response = await backendAuthFetch(
    `/admin/scrapers/${encodeURIComponent(id)}/run`,
    {
      method: "POST",
      requestHeaders: request.headers,
      attachAccessToken: true,
      accessToken,
    },
  );

  return createProxyResponse(response);
}
