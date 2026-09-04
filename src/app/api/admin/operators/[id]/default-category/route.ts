import { NextRequest } from "next/server";
import { readAccessToken } from "@/lib/auth-cookies";
import {
  backendAuthFetch,
  createProxyResponse,
  createUnauthorizedResponse,
} from "@/lib/backend-auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  const { id } = await context.params;
  const body = await request.json();
  const response = await backendAuthFetch(
    `/admin/operators/${encodeURIComponent(id)}/default-category`,
    {
      method: "PATCH",
      body,
      requestHeaders: request.headers,
      attachAccessToken: true,
      accessToken,
    },
  );

  return createProxyResponse(response);
}
